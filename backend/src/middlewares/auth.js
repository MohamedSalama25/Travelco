const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "لا توجد رمز اعتماد" });
    }

    // Verify throws error if invalid
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();

  } catch (error) {
    return res.status(401).json({ message: "رمز اعتماد غير صحيح" });
  }
};

module.exports = auth;
