
// // middleware/authMiddleware.js
// const jwt = require("jsonwebtoken");
// const User = require("../models/User");

// const authMiddleware = async (req, res, next) => {
//   try {
//     const token = req.header("Authorization")?.replace("Bearer ", "");
//     if (!token) {
//       return res
//         .status(401)
//         .json({ success: false, error: "Unauthorized: No token provided" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findByPk(decoded.id);

//     if (!user) {
//       return res
//         .status(401)
//         .json({ success: false, error: "Unauthorized: Invalid user" });
//     }

//     req.user = user;
//     next();
//   } catch (err) {
//     console.error("Token verification failed:", err.message);
//     res
//       .status(401)
//       .json({ success: false, error: "Unauthorized: Invalid token" });
//   }
// };

// module.exports = authMiddleware;





const jwt = require("jsonwebtoken");
const { User } = require("../models");

module.exports = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Optional: double-check user still exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ error: "Invalid token user" });
    }

    next();
  } catch (err) {
    console.error("❌ Auth Middleware error:", err.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
