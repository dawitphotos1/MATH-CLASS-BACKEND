
// const jwt = require("jsonwebtoken");
// const { User } = require("../models");

// module.exports = async (req, res, next) => {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];

//   if (!token) {
//     console.log("AuthMiddleware: No token provided");
//     return res.status(401).json({ success: false, error: "No token provided" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log("AuthMiddleware: Token verified", {
//       userId: decoded.userId, // ✅ now matches controllers
//       role: decoded.role,
//     });

//     // Double-check user exists in DB
//     const user = await User.findByPk(decoded.userId);
//     if (!user) {
//       console.log("AuthMiddleware: User not found", { userId: decoded.userId });
//       return res
//         .status(401)
//         .json({ success: false, error: "Invalid token user" });
//     }

//     // Attach normalized user data
//     req.user = {
//       userId: user.id,
//       email: user.email,
//       role: user.role.toLowerCase(),
//       name: user.name,
//       approvalStatus: user.approval_status, // 🔄 fixed naming
//     };

//     next();
//   } catch (err) {
//     console.error("AuthMiddleware: Error", {
//       error: err.message,
//       stack: err.stack,
//     });
//     return res
//       .status(403)
//       .json({ success: false, error: "Invalid or expired token" });
//   }
// };





// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const { User } = require("../models");

module.exports = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ must match payload { userId }
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid token user" });
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role.toLowerCase(),
      name: user.name,
      approval_status: user.approval_status,
    };

    next();
  } catch (err) {
    return res
      .status(403)
      .json({ success: false, error: "Invalid or expired token" });
  }
};
