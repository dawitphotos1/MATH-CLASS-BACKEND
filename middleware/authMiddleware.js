// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import db from "../models/index.js";
const { User } = db;

/* ============================================================
   Authenticate user (supports Bearer token or cookie token)
   - If token missing -> 401 immediately
   - If token invalid/expired -> 401 with clear message
============================================================ */
export const authenticateToken = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, error: "Login required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Clear cookie if token is expired or invalid (helps browsers)
      if (req.cookies?.token) {
        // ensure same cookie options for clearing - using short options to remove
        res.clearCookie("token");
      }
      return res.status(401).json({
        success: false,
        error:
          err.name === "TokenExpiredError"
            ? "Session expired. Please log in again."
            : "Invalid authentication token.",
      });
    }

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      approval_status: user.approval_status,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err?.message || err);
    return res.status(500).json({ success: false, error: "Authentication error" });
  }
};
// middleware/authMiddleware.js
// Role check helpers that assume req.user is present (from authenticateToken)

export const isAdmin = (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: "Not authenticated" });
    if (req.user.role !== "admin") return res.status(403).json({ success: false, error: "Admins only" });
    next();
  } catch (err) {
    console.error("isAdmin error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

export const isTeacher = (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: "Not authenticated" });
    if (req.user.role === "teacher" || req.user.role === "admin") return next();
    return res.status(403).json({ success: false, error: "Teacher role required" });
  } catch (err) {
    console.error("isTeacher error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

export const isStudent = (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: "Not authenticated" });
    if (req.user.role === "student") return next();
    return res.status(403).json({ success: false, error: "Students only" });
  } catch (err) {
    console.error("isStudent error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

export const isTeacherOrAdmin = (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: "Not authenticated" });
    if (req.user.role === "teacher" || req.user.role === "admin") return next();
    return res.status(403).json({ success: false, error: "Teacher or admin access required" });
  } catch (err) {
    console.error("isTeacherOrAdmin error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};
