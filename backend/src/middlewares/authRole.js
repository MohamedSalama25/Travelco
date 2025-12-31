const jwt = require("jsonwebtoken");

const authRole = (role) => {
    return (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                return res.status(401).json({ message: "No token provided" });
            }

            // لو الهيدر جاي كده: Bearer TOKEN
            const token = authHeader.startsWith("Bearer ")
                ? authHeader.split(" ")[1]
                : authHeader;

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // optional: تحط اليوزر في الريكويست
            req.user = decoded;

            if (decoded.role !== role) {
                return res.status(403).json({
                    message: "ليس لديك الصلاحيه"
                });
            }

            next();
        } catch (error) {
            return res.status(401).json({ message: "الرجاء تسجيل الدخول" });
        }
    };
};

module.exports = authRole;
