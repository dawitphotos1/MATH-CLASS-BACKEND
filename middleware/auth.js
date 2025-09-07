const jwt = require("jsonwebtoken");
const { User } = require("../models");

// ✅ Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
};

// ✅ Role checker for "teacher" or "admin"
const checkTeacherOrAdmin = (req, res, next) => {
  const role = req.user?.role;
  if (role === "teacher" || role === "admin") {
    return next();
  }
  return res.status(403).json({ error: "Access denied" });
};

// ✅ Export both as named exports
module.exports = {
  authMiddleware,
  checkTeacherOrAdmin,
};
