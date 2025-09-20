
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
const jwt = require("jsonwebtoken");
const { User } = require("../models");

exports.authenticateToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ success: false, error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "email", "role", "name"],
    });

    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid token user" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: "Token invalid or expired" });
  }
};
