
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");

// exports.authMiddleware = async (req, res, next) => {
//   const token = req.headers.authorization?.split(" ")[1];
//   if (!token) return res.status(401).json({ error: "No token provided" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findByPk(decoded.id);
//     if (!req.user) return res.status(401).json({ error: "Invalid token" });
//     next();
//   } catch {
//     return res.status(401).json({ error: "Unauthorized" });
//   }
// };

// exports.adminOnly = (req, res, next) => {
//   if (req.user.role !== "admin") {
//     return res.status(403).json({ error: "Admins only" });
//   }
//   next();
// };





const jwt = require("jsonwebtoken");
const { User } = require("../models");

// ================================
// 🔹 Authenticate User
// ================================
exports.authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("❌ Auth error:", err.message);
    return res.status(401).json({ error: "Unauthorized" });
  }
};

// ================================
// 🔹 Admin Only Access
// ================================
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admins only" });
  }
  next();
};
