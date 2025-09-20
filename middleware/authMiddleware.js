
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
import db from "../models/index.js";

const { User } = db;

export const authenticateToken = async (req, res, next) => {
  try {
    let token;

    // ✅ Check cookies first
    if (req.cookies?.token) {
      token = req.cookies.token;
    } 
    // ✅ Then check Authorization header
    else if (req.headers["authorization"]?.startsWith("Bearer ")) {
      token = req.headers["authorization"].split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    // ✅ Decode JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ⚠️ Note: in your token you use `userId`, not `id`
    req.user = await User.findByPk(decoded.userId, {
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
