
// // backend/middleware/auth.js
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");

// // ================================
// // 🔹 Authenticate User (attach req.user)
// // ================================
// const authMiddleware = async (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findByPk(decoded.id, {
//       attributes: { exclude: ["password"] },
//     });

//     if (!user) {
//       return res.status(401).json({ error: "Unauthorized" });
//     }

//     req.user = user; // ✅ user now available to controllers
//     next();
//   } catch (err) {
//     console.error("❌ Auth error:", err.message);
//     return res.status(401).json({ error: "Unauthorized" });
//   }
// };

// // ================================
// // 🔹 Role-based Guards
// // ================================
// const allowRoles = (...roles) => {
//   return (req, res, next) => {
//     if (!req.user || !roles.includes(req.user.role)) {
//       return res
//         .status(403)
//         .json({ error: `Forbidden: Only [${roles.join(", ")}] allowed` });
//     }
//     next();
//   };
// };

// const adminOnly = (req, res, next) => {
//   if (!req.user || req.user.role !== "admin") {
//     return res.status(403).json({ error: "Forbidden: Admins only" });
//   }
//   next();
// };

// const teacherOnly = (req, res, next) => {
//   if (!req.user || req.user.role !== "teacher") {
//     return res.status(403).json({ error: "Forbidden: Teachers only" });
//   }
//   next();
// };

// const studentOnly = (req, res, next) => {
//   if (!req.user || req.user.role !== "student") {
//     return res.status(403).json({ error: "Forbidden: Students only" });
//   }
//   next();
// };

// module.exports = {
//   authMiddleware,
//   allowRoles,
//   adminOnly,
//   teacherOnly,
//   studentOnly,
// };


const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      console.log("🚫 authMiddleware: No token provided");
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`✅ authMiddleware: Token verified for user ID ${decoded.id}`);
    req.user = decoded; // Attach user info (id, role, etc.)
    next();
  } catch (error) {
    console.error("❌ authMiddleware: Invalid token", error.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

const allowRoles = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    console.log(`🚫 allowRoles: User role ${req.user?.role} not in ${roles}`);
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};

const adminOnly = allowRoles(["admin"]);
const teacherOnly = allowRoles(["teacher"]);
const studentOnly = allowRoles(["student"]);

module.exports = {
  authMiddleware,
  allowRoles,
  adminOnly,
  teacherOnly,
  studentOnly,
};

// Debug export
console.log("auth.js exports:", module.exports);