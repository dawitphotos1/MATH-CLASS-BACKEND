
// // middleware/authMiddleware.js
// import jwt from "jsonwebtoken";
// import db from "../models/index.js";

// const { User } = db;

// /**
//  * Extract token from header or cookie
//  */
// const getTokenFromRequest = (req) => {
//   let token = null;

//   // Authorization: Bearer <token>
//   if (req.headers.authorization?.startsWith("Bearer")) {
//     token = req.headers.authorization.split(" ")[1];
//   }

//   // Cookie fallback
//   if (!token && req.cookies?.token) {
//     token = req.cookies.token;
//   }

//   return token;
// };

// /**
//  * Validate token + load user
//  */
// const verifyUser = async (req) => {
//   const token = getTokenFromRequest(req);

//   if (!token) {
//     return { error: "Not authenticated — missing token" };
//   }

//   let decoded;
//   try {
//     decoded = jwt.verify(token, process.env.JWT_SECRET);
//   } catch (err) {
//     return { error: "Invalid or expired token" };
//   }

//   const user = await User.findByPk(decoded.id);

//   if (!user) {
//     return { error: "User does not exist" };
//   }

//   return { user };
// };

// /**
//  * Recommended new middleware
//  */
// export const requireAuth = async (req, res, next) => {
//   try {
//     const result = await verifyUser(req);

//     if (result.error) {
//       return res.status(401).json({ success: false, message: result.error });
//     }

//     req.user = result.user;
//     next();
//   } catch (error) {
//     console.error("requireAuth Error:", error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };

// /**
//  * Legacy middleware (still used in many routes)
//  */
// export const authenticateToken = async (req, res, next) => {
//   return requireAuth(req, res, next);
// };

// /**
//  * Role validation
//  */
// export const requireRole = (role) => {
//   return (req, res, next) => {
//     if (!req.user) {
//       return res.status(401).json({ success: false, message: "Not authenticated" });
//     }

//     if (req.user.role !== role) {
//       return res.status(403).json({
//         success: false,
//         message: `Requires ${role} role`,
//       });
//     }

//     next();
//   };
// };

// // Shortcuts (new)
// export const requireAdmin = requireRole("admin");
// export const requireTeacher = requireRole("teacher");
// export const requireStudent = requireRole("student");

// /**
//  * Legacy functions — to prevent crashes
//  * These simply wrap the new functions.
//  */
// export const isAdmin = async (req, res, next) => {
//   await requireAuth(req, res, async () => {
//     if (req.user.role !== "admin") {
//       return res.status(403).json({ success: false, message: "Admin only" });
//     }
//     next();
//   });
// };

// export const isTeacher = async (req, res, next) => {
//   await requireAuth(req, res, async () => {
//     if (req.user.role !== "teacher") {
//       return res.status(403).json({ success: false, message: "Teacher only" });
//     }
//     next();
//   });
// };

// export const isStudent = async (req, res, next) => {
//   await requireAuth(req, res, async () => {
//     if (req.user.role !== "student") {
//       return res.status(403).json({ success: false, message: "Student only" });
//     }
//     next();
//   });
// };

// /**
//  * Default exports (optional)
//  */
// export default {
//   requireAuth,
//   authenticateToken,
//   requireRole,
//   requireAdmin,
//   requireTeacher,
//   requireStudent,
//   isAdmin,
//   isTeacher,
//   isStudent,
// };






import jwt from "jsonwebtoken";
import db from "../models/index.js";

const { User } = db;

/**
 * Extract token from header or cookie
 */
const getTokenFromRequest = (req) => {
  let token = null;

  // Authorization: Bearer <token>
  if (req.headers.authorization?.startsWith("Bearer ")) {
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

  const user = await User.findByPk(decoded.id, {
    attributes: ["id", "name", "email", "role", "approval_status", "subject"],
  });

  if (!user) {
    return { error: "User does not exist" };
  }

  return { user };
};

/**
 * Main authentication middleware
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const result = await verifyUser(req);

    if (result.error) {
      return res.status(401).json({
        success: false,
        error: result.error,
      });
    }

    req.user = result.user;
    next();
  } catch (error) {
    console.error("❌ Authentication error:", error);
    return res.status(500).json({
      success: false,
      error: "Authentication failed",
    });
  }
};

/**
 * Role validation middleware
 */
export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        error: `Requires ${role} role. You are ${req.user.role}`,
      });
    }

    next();
  };
};

/**
 * Role array validation (multiple roles)
 */
export const requireRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Requires one of: ${roles.join(", ")}. You are ${req.user.role}`,
      });
    }

    next();
  };
};

// Convenience exports
export const requireAdmin = requireRole("admin");
export const requireTeacher = requireRole("teacher");
export const requireStudent = requireRole("student");
export const requireTeacherOrAdmin = requireRoles(["teacher", "admin"]);

/**
 * Check if user is approved (for student routes)
 */
export const requireApproved = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Not authenticated",
    });
  }

  if (req.user.approval_status !== "approved") {
    return res.status(403).json({
      success: false,
      error: "Account pending approval",
    });
  }

  next();
};

/**
 * Check ownership (user owns resource)
 */
export const requireOwnership = (modelName, foreignKey = "user_id") => {
  return async (req, res, next) => {
    try {
      const Model = db[modelName];
      if (!Model) {
        return res.status(500).json({
          success: false,
          error: "Model not found",
        });
      }

      const resourceId =
        req.params.id || req.params.courseId || req.params.lessonId;
      const resource = await Model.findByPk(resourceId);

      if (!resource) {
        return res.status(404).json({
          success: false,
          error: "Resource not found",
        });
      }

      // Check if user is admin or owns the resource
      if (req.user.role !== "admin" && resource[foreignKey] !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to access this resource",
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error("Ownership check error:", error);
      return res.status(500).json({
        success: false,
        error: "Authorization check failed",
      });
    }
  };
};

export {
  authenticateToken,
  requireRole,
  requireRoles,
  requireAdmin,
  requireTeacher,
  requireStudent,
  requireTeacherOrAdmin,
  requireApproved,
  requireOwnership,
};