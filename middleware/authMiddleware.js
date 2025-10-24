// // middleware/authMiddleware.js
// import jwt from "jsonwebtoken";
// import db from "../models/index.js";

// const { User } = db;

// /* ============================================================
//    🔒 Authenticate user (Bearer token or cookie)
// ============================================================ */
// export const authenticateToken = async (req, res, next) => {
//   try {
//     let token;

//     // 1️⃣ Try Authorization header first
//     if (req.headers.authorization?.startsWith("Bearer ")) {
//       token = req.headers.authorization.split(" ")[1];
//     }
//     // 2️⃣ Then fallback to cookies
//     else if (req.cookies?.token) {
//       token = req.cookies.token;
//     }

//     if (!token) {
//       console.warn(`⚠️ No auth token for [${req.method}] ${req.originalUrl}`);
//       return res.status(401).json({
//         success: false,
//         error: "Authentication required. Please log in.",
//       });
//     }

//     // ✅ Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findByPk(decoded.id);

//     if (!user) {
//       console.warn("⚠️ Token valid but user not found:", decoded.id);
//       return res
//         .status(401)
//         .json({ success: false, error: "User not found or deleted" });
//     }

//     req.user = user;
//     next();
//   } catch (err) {
//     console.error("❌ Token verification error:", err.message);
//     return res.status(401).json({
//       success: false,
//       error:
//         err.name === "TokenExpiredError"
//           ? "Session expired. Please log in again."
//           : "Invalid authentication token.",
//     });
//   }
// };

// /* ============================================================
//    🛡️ Role-based Access Control
// ============================================================ */
// export const isAdmin = (req, res, next) => {
//   if (!req.user || req.user.role !== "admin") {
//     console.warn(`🚫 Unauthorized (admin only): ${req.user?.role || "none"}`);
//     return res.status(403).json({
//       success: false,
//       error: "Access denied. Admins only.",
//     });
//   }
//   next();
// };

// export const isTeacher = (req, res, next) => {
//   if (!req.user || req.user.role !== "teacher") {
//     console.warn(`🚫 Unauthorized (teacher only): ${req.user?.role || "none"}`);
//     return res.status(403).json({
//       success: false,
//       error: "Access denied. Teachers only.",
//     });
//   }
//   next();
// };

// export const isStudent = (req, res, next) => {
//   if (!req.user || req.user.role !== "student") {
//     console.warn(`🚫 Unauthorized (student only): ${req.user?.role || "none"}`);
//     return res.status(403).json({
//       success: false,
//       error: "Access denied. Students only.",
//     });
//   }
//   next();
// };




// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import db from "../models/index.js";
const { User } = db;

/* ============================================================
   🔒 Authenticate user
============================================================ */
export const authenticateToken = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, error: "Login required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error:
        err.name === "TokenExpiredError"
          ? "Session expired. Please log in again."
          : "Invalid authentication token.",
    });
  }
};

/* ============================================================
   🛡️ Role-based Access
============================================================ */
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, error: "Admins only" });
  }
  next();
};

export const isTeacher = (req, res, next) => {
  if (req.user?.role !== "teacher") {
    return res.status(403).json({ success: false, error: "Teachers only" });
  }
  next();
};

export const isStudent = (req, res, next) => {
  if (req.user?.role !== "student") {
    return res.status(403).json({ success: false, error: "Students only" });
  }
  next();
};
