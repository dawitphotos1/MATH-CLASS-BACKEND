
// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import db from "../models/index.js";

const { User } = db;

// ✅ Authenticate any logged-in user
export const authenticateToken = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header (Bearer) OR cookies
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: "No token provided, unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user; // attach user to request
    next();
  } catch (err) {
    console.error("❌ Auth error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// ✅ Restrict route to admins only
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied: Admins only" });
  }
  next();
};

// ✅ Restrict route to teachers only
export const isTeacher = (req, res, next) => {
  if (!req.user || req.user.role !== "teacher") {
    return res.status(403).json({ error: "Access denied: Teachers only" });
  }
  next();
};

// ✅ Restrict route to students only
export const isStudent = (req, res, next) => {
  if (!req.user || req.user.role !== "student") {
    return res.status(403).json({ error: "Access denied: Students only" });
  }
  next();
};
