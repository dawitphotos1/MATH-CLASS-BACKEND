// // middleware/authMiddleware.js
// import jwt from "jsonwebtoken";
// import db from "../models/index.js";
// const { User } = db;

// /* ============================================================
//    Authenticate user (supports Bearer token or cookie token)
//    - If token missing -> 401 immediately
//    - If token invalid/expired -> 401 with clear message
// ============================================================ */
// export const authenticateToken = async (req, res, next) => {
//   try {
//     let token = null;

//     if (req.headers.authorization?.startsWith("Bearer ")) {
//       token = req.headers.authorization.split(" ")[1];
//     } else if (req.cookies?.token) {
//       token = req.cookies.token;
//     }

//     if (!token) {
//       return res.status(401).json({ success: false, error: "Login required" });
//     }

//     let decoded;
//     try {
//       decoded = jwt.verify(token, process.env.JWT_SECRET);
//     } catch (err) {
//       // Clear cookie if token is expired or invalid (helps browsers)
//       if (req.cookies?.token) {
//         // ensure same cookie options for clearing - using short options to remove
//         res.clearCookie("token");
//       }
//       return res.status(401).json({
//         success: false,
//         error:
//           err.name === "TokenExpiredError"
//             ? "Session expired. Please log in again."
//             : "Invalid authentication token.",
//       });
//     }

//     const user = await User.findByPk(decoded.id, {
//       attributes: { exclude: ["password"] },
//     });

//     if (!user) {
//       return res.status(401).json({ success: false, error: "User not found" });
//     }

//     // Attach user info to request
//     req.user = {
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       approval_status: user.approval_status,
//     };

//     next();
//   } catch (err) {
//     console.error("Auth middleware error:", err?.message || err);
//     return res.status(500).json({ success: false, error: "Authentication error" });
//   }
// };
// // middleware/authMiddleware.js
// // Role check helpers that assume req.user is present (from authenticateToken)

// export const isAdmin = (req, res, next) => {
//   try {
//     if (!req.user) return res.status(401).json({ success: false, error: "Not authenticated" });
//     if (req.user.role !== "admin") return res.status(403).json({ success: false, error: "Admins only" });
//     next();
//   } catch (err) {
//     console.error("isAdmin error:", err);
//     return res.status(500).json({ success: false, error: "Server error" });
//   }
// };

// export const isTeacher = (req, res, next) => {
//   try {
//     if (!req.user) return res.status(401).json({ success: false, error: "Not authenticated" });
//     if (req.user.role === "teacher" || req.user.role === "admin") return next();
//     return res.status(403).json({ success: false, error: "Teacher role required" });
//   } catch (err) {
//     console.error("isTeacher error:", err);
//     return res.status(500).json({ success: false, error: "Server error" });
//   }
// };

// export const isStudent = (req, res, next) => {
//   try {
//     if (!req.user) return res.status(401).json({ success: false, error: "Not authenticated" });
//     if (req.user.role === "student") return next();
//     return res.status(403).json({ success: false, error: "Students only" });
//   } catch (err) {
//     console.error("isStudent error:", err);
//     return res.status(500).json({ success: false, error: "Server error" });
//   }
// };

// export const isTeacherOrAdmin = (req, res, next) => {
//   try {
//     if (!req.user) return res.status(401).json({ success: false, error: "Not authenticated" });
//     if (req.user.role === "teacher" || req.user.role === "admin") return next();
//     return res.status(403).json({ success: false, error: "Teacher or admin access required" });
//   } catch (err) {
//     console.error("isTeacherOrAdmin error:", err);
//     return res.status(500).json({ success: false, error: "Server error" });
//   }
// };






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
 * General authentication middleware
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
 * Legacy alias
 */
export const authenticateToken = requireAuth;

/**
 * Role validation middleware factory
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

/**
 * Predefined role middlewares
 */
export const requireAdmin = requireRole("admin");
export const requireTeacher = requireRole("teacher");
export const requireStudent = requireRole("student");

/**
 * Shortcuts for legacy-style middlewares
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
 * New middleware: teacher OR admin
 */
export const isTeacherOrAdmin = async (req, res, next) => {
  await requireAuth(req, res, async () => {
    if (req.user.role !== "teacher" && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Teacher or Admin only" });
    }
    next();
  });
};
