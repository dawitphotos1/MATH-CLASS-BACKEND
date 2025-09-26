
// // // middleware/authMiddleware.js
// // import jwt from "jsonwebtoken";
// // import db from "../models/index.js";

// // const { User } = db;

// // // 🔐 Verify JWT
// // export const authenticateToken = async (req, res, next) => {
// //   try {
// //     // Read token from cookie
// //     const token = req.cookies?.token;

// //     if (!token) {
// //       console.warn("⚠️ No token cookie found on request:", req.originalUrl);
// //       return res.status(401).json({ success: false, error: "Not authenticated" });
// //     }

// //     let decoded;
// //     try {
// //       decoded = jwt.verify(token, process.env.JWT_SECRET);
// //     } catch (err) {
// //       console.warn("⚠️ JWT verification failed:", err.message);
// //       return res.status(403).json({ success: false, error: "Invalid or expired token" });
// //     }

// //     // Find user in DB
// //     const user = await User.findByPk(decoded.id);
// //     if (!user) {
// //       console.warn("⚠️ Token valid but user not found in DB:", decoded.id);
// //       return res.status(401).json({ success: false, error: "User not found" });
// //     }

// //     // Attach to request
// //     req.user = user;
// //     console.log(`✅ Authenticated user: ${user.email} (role: ${user.role})`);
// //     next();
// //   } catch (err) {
// //     console.error("❌ Auth middleware error:", err.message);
// //     res.status(500).json({ success: false, error: "Authentication error" });
// //   }
// // };

// // // 🔐 Require admin role
// // export const isAdmin = (req, res, next) => {
// //   if (req.user?.role !== "admin") {
// //     console.warn(`⚠️ Access denied for user ${req.user?.email || "unknown"}`);
// //     return res.status(403).json({ success: false, error: "Access denied: Admins only" });
// //   }
// //   console.log(`✅ Admin access granted: ${req.user.email}`);
// //   next();
// // };





// // middleware/authMiddleware.js
// import jwt from "jsonwebtoken";
// import db from "../models/index.js";

// const { User } = db;

// export const authenticateToken = async (req, res, next) => {
//   try {
//     const token = req.cookies?.token;

//     if (!token) {
//       console.warn("⚠️ No token cookie in request:", req.originalUrl);
//       return res
//         .status(401)
//         .json({ success: false, error: "Not authenticated" });
//     }

//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (err) {
//       console.warn("⚠️ JWT verify failed:", err.message);
//       return res
//         .status(403)
//         .json({ success: false, error: "Invalid or expired token" });
//     }

//     const user = await User.findByPk(decoded.id);
//     if (!user) {
//       console.warn("⚠️ JWT valid but user not in DB:", decoded.id);
//       return res
//         .status(401)
//         .json({ success: false, error: "User not found" });
//     }

//     // Attach minimal user info to req.user (avoid sending full model instance)
//     req.user = {
//       id: user.id,
//       email: user.email,
//       role: user.role,
//     };

//     console.log(`✅ Authenticated user: ${user.email} (role: ${user.role})`);
//     return next();
//   } catch (err) {
//     console.error("❌ Auth middleware error:", err.stack || err.message);
//     return res
//       .status(500)
//       .json({ success: false, error: "Authentication error" });
//   }
// };

// export const isAdmin = (req, res, next) => {
//   if (req.user?.role !== "admin") {
//     console.warn("⚠️ Access denied (not admin):", req.user);
//     return res
//       .status(403)
//       .json({ success: false, error: "Access denied: Admins only" });
//   }
//   console.log("✅ Admin access granted:", req.user.email);
//   next();
// };





// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import db from "../models/index.js";

const { User } = db;

// ✅ Main auth middleware
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(403).json({ success: false, error: "Invalid or expired token" });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (err) {
    console.error("❌ Auth middleware error:", err.stack || err.message);
    res.status(500).json({ success: false, error: "Authentication error" });
  }
};

// ✅ Admin check
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, error: "Access denied: Admins only" });
  }
  next();
};
