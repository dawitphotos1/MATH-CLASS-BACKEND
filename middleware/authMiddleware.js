
// // middleware/authMiddleware.js
// import jwt from "jsonwebtoken";
// import User from "../models/User.js";

// const authMiddleware = async (req, res, next) => {
//   try {
//     let token = req.cookies?.token;

//     if (!token && req.headers["authorization"]?.startsWith("Bearer ")) {
//       token = req.headers["authorization"].split(" ")[1];
//     }

//     if (!token) {
//       return res.status(401).json({ message: "No token, authorization denied" });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findByPk(decoded.userId, {
//       attributes: { exclude: ["password"] },
//     });

//     if (!user) {
//       return res.status(401).json({ message: "User not found" });
//     }

//     req.user = { userId: user.id, role: user.role };
//     next();
//   } catch (err) {
//     console.error("Auth Middleware Error:", err.message);
//     res.status(401).json({ message: "Token is not valid" });
//   }
// };

// export default authMiddleware;


// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import { User } from "../models/index.js"; // ✅ use models/index.js

export const authenticateToken = async (req, res, next) => {
  try {
    let token;

    // 🔑 Prefer cookie, fallback to Authorization header
    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers["authorization"]?.startsWith("Bearer ")) {
      token = req.headers["authorization"].split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "No token, authorization denied" });
    }

    // 🔑 Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ We are signing token with { id: user.id, role: user.role }
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user; // Attach full user object for controllers
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ success: false, message: "Token is not valid" });
  }
};
