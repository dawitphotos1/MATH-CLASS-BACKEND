
// // middleware/authMiddleware.js
// import jwt from "jsonwebtoken";
// import db from "../models/index.js"; // ✅ import default
// const { User } = db;                // ✅ destructure User

// export const authenticateToken = async (req, res, next) => {
//   try {
//     let token;

//     // 🔑 Prefer cookie, fallback to Authorization header
//     if (req.cookies?.token) {
//       token = req.cookies.token;
//     } else if (req.headers["authorization"]?.startsWith("Bearer ")) {
//       token = req.headers["authorization"].split(" ")[1];
//     }

//     if (!token) {
//       return res.status(401).json({ success: false, message: "No token, authorization denied" });
//     }

//     // 🔑 Decode token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // ✅ We are signing token with { id: user.id, role: user.role }
//     const user = await User.findByPk(decoded.id, {
//       attributes: { exclude: ["password"] },
//     });

//     if (!user) {
//       return res.status(401).json({ success: false, message: "User not found" });
//     }

//     req.user = user; // Attach full user object for controllers
//     next();
//   } catch (error) {
//     console.error("Auth Middleware Error:", error.message);
//     return res.status(401).json({ success: false, message: "Token is not valid" });
//   }
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
      return res.status(401).json({ success: false, error: "Not authenticated" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user in DB
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    // Attach to request
    req.user = user;
    next();
  } catch (err) {
    console.error("❌ Auth error:", err.message);
    res.status(403).json({ success: false, error: "Invalid or expired token" });
  }
};

// 🔐 Require admin role
export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, error: "Access denied: Admins only" });
  }
  next();
};
