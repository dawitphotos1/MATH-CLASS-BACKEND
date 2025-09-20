
// // middleware/authMiddleware.js
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");

// const authenticateToken = async (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({ success: false, error: "No token provided" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findByPk(decoded.userId);

//     if (!user) {
//       return res.status(401).json({ success: false, error: "Invalid token user" });
//     }

//     // Check if user is approved
//     if (user.approval_status !== "approved") {
//       return res.status(403).json({ 
//         success: false, 
//         error: "Account pending approval or rejected" 
//       });
//     }

//     req.user = {
//       userId: user.id,
//       email: user.email,
//       role: user.role.toLowerCase(),
//       name: user.name,
//       approval_status: user.approval_status,
//     };

//     next();
//   } catch (err) {
//     console.error("Token verification error:", err.message);
//     return res
//       .status(403)
//       .json({ success: false, error: "Invalid or expired token" });
//   }
// };

// module.exports = {
//   authenticateToken,
// };




// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Get token from cookie or Authorization header
    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers["authorization"]?.startsWith("Bearer ")) {
      token = req.headers["authorization"].split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request
    req.user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};
