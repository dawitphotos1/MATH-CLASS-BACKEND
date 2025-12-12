
// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import db from "../models/index.js";

const { User } = db;

/**
 * Extract token from header or cookie
 */
const getTokenFromRequest = (req) => {
  let token = null;

  // Authorization: Bearer <token>
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  // Cookie fallback
  if (!token && req.cookies?.token) {
    token = req.cookies.token;
  }

  return token;
};

/**
 * Validate token + load user
 */
const verifyUser = async (req) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return { error: "Not authenticated — missing token" };
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return { error: "Invalid or expired token" };
  }

  const user = await User.findByPk(decoded.id);

  if (!user) {
    return { error: "User does not exist" };
  }

  return { user };
};

/**
 * Recommended new middleware
 */
export const requireAuth = async (req, res, next) => {
  try {
    const result = await verifyUser(req);

    if (result.error) {
      return res.status(401).json({ success: false, message: result.error });
    }

    req.user = result.user;
    next();
  } catch (error) {
    console.error("requireAuth Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Legacy middleware (still used in many routes)
 */
export const authenticateToken = async (req, res, next) => {
  return requireAuth(req, res, next);
};

/**
 * Role validation
 */
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Requires ${role} role`,
      });
    }

    next();
  };
};

// Shortcuts (new)
export const requireAdmin = requireRole("admin");
export const requireTeacher = requireRole("teacher");
export const requireStudent = requireRole("student");

/**
 * Legacy functions — to prevent crashes
 * These simply wrap the new functions.
 */
export const isAdmin = async (req, res, next) => {
  await requireAuth(req, res, async () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin only" });
    }
    next();
  });
};

export const isTeacher = async (req, res, next) => {
  await requireAuth(req, res, async () => {
    if (req.user.role !== "teacher") {
      return res.status(403).json({ success: false, message: "Teacher only" });
    }
    next();
  });
};

export const isStudent = async (req, res, next) => {
  await requireAuth(req, res, async () => {
    if (req.user.role !== "student") {
      return res.status(403).json({ success: false, message: "Student only" });
    }
    next();
  });
};

/**
 * Default exports (optional)
 */
export default {
  requireAuth,
  authenticateToken,
  requireRole,
  requireAdmin,
  requireTeacher,
  requireStudent,
  isAdmin,
  isTeacher,
  isStudent,
};
