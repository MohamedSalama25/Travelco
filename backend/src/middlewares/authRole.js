const jwt = require("jsonwebtoken");

const authRole = (...allowedRoles) => {
    const roleHierarchy = {
        'admin': 2,
        'accountant': 1
    };

    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                return res.status(401).json({ message: "No token provided" });
            }

            const token = authHeader.startsWith("Bearer ")
                ? authHeader.split(" ")[1]
                : authHeader;

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;

            const userRole = decoded.role;
            
            // Check if user has at least one of the allowed roles or a higher role
            // If allowedRoles is a single string like "admin", we check hierarchy
            const highestAllowedRole = allowedRoles.length === 1 && typeof allowedRoles[0] === 'string' 
                ? allowedRoles[0] 
                : null;

            if (highestAllowedRole) {
                if (roleHierarchy[userRole] < roleHierarchy[highestAllowedRole]) {
                    return res.status(403).json({
                        message: "ليس لديك الصلاحيه"
                    });
                }
            } else {
                // If multiple roles are passed, check if user's role is in the list
                if (!allowedRoles.includes(userRole)) {
                    return res.status(403).json({
                        message: "ليس لديك الصلاحيه"
                    });
                }
            }

            next();
        } catch (error) {
            return res.status(401).json({ message: "الرجاء تسجيل الدخول" });
        }
    };
};

module.exports = authRole;
