
// // middleware/authMiddleware.js
// import jwt from "jsonwebtoken";
// import db from "../models/index.js";

// const { User } = db;

// // 🔐 Verify JWT
// export const authenticateToken = async (req, res, next) => {
//   try {
//     // Read token from cookie
//     const token = req.cookies?.token;

//     if (!token) {
//       return res.status(401).json({ success: false, error: "Not authenticated" });
//     }

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Find user in DB
//     const user = await User.findByPk(decoded.id);
//     if (!user) {
//       return res.status(401).json({ success: false, error: "User not found" });
//     }

//     // Attach to request
//     req.user = user;
//     next();
//   } catch (err) {
//     console.error("❌ Auth error:", err.message);
//     res.status(403).json({ success: false, error: "Invalid or expired token" });
//   }
// };

// // 🔐 Require admin role
// export const isAdmin = (req, res, next) => {
//   if (req.user?.role !== "admin") {
//     return res.status(403).json({ success: false, error: "Access denied: Admins only" });
//   }
//   next();
// };




// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import db from "../models/index.js";

const { User } = db;

// 🔐 Verify JWT
export const authenticateToken = async (req, res, next) => {
  try {
    // Read token from cookie
    const token = req.cookies?.token;

    if (!token) {
      console.warn("⚠️ No token cookie found on request:", req.originalUrl);
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      console.warn("⚠️ JWT verification failed:", err.message);
      return res.status(403).json({ success: false, error: "Invalid or expired token" });
    }

    // Find user in DB
    const user = await User.findByPk(decoded.id);
    if (!user) {
      console.warn("⚠️ Token valid but user not found in DB:", decoded.id);
      return res.status(401).json({ success: false, error: "User not found" });
    }

    // Attach to request
    req.user = user;
    console.log(`✅ Authenticated user: ${user.email} (role: ${user.role})`);
    next();
  } catch (err) {
    console.error("❌ Auth middleware error:", err.message);
    res.status(500).json({ success: false, error: "Authentication error" });
  }
};

// 🔐 Require admin role
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    console.warn(`⚠️ Access denied for user ${req.user?.email || "unknown"}`);
    return res.status(403).json({ success: false, error: "Access denied: Admins only" });
  }
  console.log(`✅ Admin access granted: ${req.user.email}`);
  next();
};
