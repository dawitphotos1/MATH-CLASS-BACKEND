// // middleware/authMiddleware.js
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");

// module.exports = async (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({ error: "No token provided" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;

//     // 🔍 Double-check user still exists in DB
//     const user = await User.findByPk(decoded.id);
//     if (!user) {
//       return res.status(401).json({ error: "Invalid token user" });
//     }

//     // ✅ Enforce approval rules
//     if (user.role.toLowerCase() === "student" && user.approval_status !== "approved") {
//       return res.status(403).json({
//         error: "Your account is not approved yet. Please wait for admin approval.",
//       });
//     }

//     // Always attach normalized role + approval
//     req.user = {
//       id: user.id,
//       email: user.email,
//       role: user.role.toLowerCase(),
//       approval_status: user.approval_status,
//     };

//     next();
//   } catch (err) {
//     console.error("❌ Auth Middleware error:", err.message);
//     return res.status(403).json({ error: "Invalid or expired token" });
//   }
// };

const jwt = require("jsonwebtoken");
const { User } = require("../models");

module.exports = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("AuthMiddleware: No token provided");
    return res.status(401).json({ success: false, error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("AuthMiddleware: Token verified", {
      userId: decoded.userId,
      role: decoded.role,
    });

    // Double-check user exists in DB
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      console.log("AuthMiddleware: User not found", { userId: decoded.userId });
      return res
        .status(401)
        .json({ success: false, error: "Invalid token user" });
    }

    // Attach normalized user data
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role.toLowerCase(),
      name: user.name,
      approvalStatus: user.approvalStatus,
    };

    next();
  } catch (err) {
    console.error("AuthMiddleware: Error", {
      error: err.message,
      stack: err.stack,
    });
    return res
      .status(403)
      .json({ success: false, error: "Invalid or expired token" });
  }
};