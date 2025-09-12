
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");

// module.exports = async (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({ error: "No token provided" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;

//     // Optional: double-check user still exists
//     const user = await User.findByPk(decoded.id);
//     if (!user) {
//       return res.status(401).json({ error: "Invalid token user" });
//     }

//     next();
//   } catch (err) {
//     console.error("❌ Auth Middleware error:", err.message);
//     return res.status(403).json({ error: "Invalid or expired token" });
//   }
// };



const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Auth middleware - verifies JWT token and loads user
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id);

    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};

// Middleware to restrict access to admins only
const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }
  next();
};

module.exports = {
  authMiddleware,
  adminOnly,
};
