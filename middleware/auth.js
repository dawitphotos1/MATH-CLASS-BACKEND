// // middleware/auth.js
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");

// const auth = async (req, res, next) => {
//   try {
//     const authHeader = req.headers["authorization"];
//     const token = authHeader && authHeader.split(" ")[1];

//     if (!token) {
//       return res.status(401).json({ error: "No token provided" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findByPk(decoded.userId);

//     if (!user) {
//       return res.status(401).json({ error: "Invalid token user" });
//     }

//     if (user.approval_status !== "approved") {
//       return res.status(403).json({ error: "Account pending approval" });
//     }

//     req.user = {
//       id: user.id,
//       email: user.email,
//       role: user.role.toLowerCase(),
//       name: user.name,
//       approval_status: user.approval_status,
//     };

//     next();
//   } catch (error) {
//     console.error("Auth middleware error:", error.message);
//     return res.status(403).json({ error: "Invalid or expired token" });
//   }
// };

// const adminOnly = (req, res, next) => {
//   if (req.user.role !== "admin") {
//     return res.status(403).json({ error: "Admin access required" });
//   }
//   next();
// };

// const teacherOrAdmin = (req, res, next) => {
//   if (req.user.role !== "teacher" && req.user.role !== "admin") {
//     return res.status(403).json({ error: "Teacher or admin access required" });
//   }
//   next();
// };

// module.exports = {
//   auth,
//   adminOnly,
//   teacherOrAdmin,
// };




// middleware/auth.js
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "Invalid token user" });
    }

    if (user.approval_status !== "approved") {
      return res.status(403).json({ error: "Account pending approval" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role.toLowerCase(),
      name: user.name,
      approval_status: user.approval_status,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

const teacherOrAdmin = (req, res, next) => {
  if (req.user.role !== "teacher" && req.user.role !== "admin") {
    return res.status(403).json({ error: "Teacher or admin access required" });
  }
  next();
};

module.exports = {
  auth,
  adminOnly,
  teacherOrAdmin,
};