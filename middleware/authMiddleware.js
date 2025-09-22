
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
