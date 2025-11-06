// import jwt from "jsonwebtoken";
// import db from "../models/index.js";

// const { User } = db;

// // Authentication middleware
// export const authenticate = async (req, res, next) => {
//   try {
//     const token = req.header("Authorization")?.replace("Bearer ", "");

//     if (!token) {
//       return res.status(401).json({
//         success: false,
//         error: "Access denied. No token provided.",
//       });
//     }

//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET || "fallback_secret"
//     );
//     const user = await User.findByPk(decoded.id);

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         error: "Invalid token. User not found.",
//       });
//     }

//     req.user = user;
//     next();
//   } catch (error) {
//     console.error("Authentication error:", error);

//     if (error.name === "JsonWebTokenError") {
//       return res.status(401).json({
//         success: false,
//         error: "Invalid token.",
//       });
//     }

//     if (error.name === "TokenExpiredError") {
//       return res.status(401).json({
//         success: false,
//         error: "Token expired.",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: "Authentication failed.",
//     });
//   }
// };

// // Authorization middleware for teachers
// export const authorizeTeacher = (req, res, next) => {
//   if (req.user.role !== "teacher" && req.user.role !== "admin") {
//     return res.status(403).json({
//       success: false,
//       error: "Access denied. Teacher or admin role required.",
//     });
//   }
//   next();
// };

// // Authorization middleware for admin only
// export const authorizeAdmin = (req, res, next) => {
//   if (req.user.role !== "admin") {
//     return res.status(403).json({
//       success: false,
//       error: "Access denied. Admin role required.",
//     });
//   }
//   next();
// };

// // Optional authentication (doesn't fail if no token)
// export const optionalAuth = async (req, res, next) => {
//   try {
//     const token = req.header("Authorization")?.replace("Bearer ", "");

//     if (token) {
//       const decoded = jwt.verify(
//         token,
//         process.env.JWT_SECRET || "fallback_secret"
//       );
//       const user = await User.findByPk(decoded.id);

//       if (user) {
//         req.user = user;
//       }
//     }

//     next();
//   } catch (error) {
//     // Continue without authentication if token is invalid
//     next();
//   }
// };





import jwt from "jsonwebtoken";
import db from "../models/index.js";

const { User } = db;

// Authentication middleware
export const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallback_secret"
    );
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid token. User not found.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid token.",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Token expired.",
      });
    }

    res.status(500).json({
      success: false,
      error: "Authentication failed.",
    });
  }
};

// Authorization middleware for teachers
export const authorizeTeacher = (req, res, next) => {
  if (req.user.role !== "teacher" && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Access denied. Teacher or admin role required.",
    });
  }
  next();
};

// Authorization middleware for admin only
export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Access denied. Admin role required.",
    });
  }
  next();
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback_secret"
      );
      const user = await User.findByPk(decoded.id);

      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};