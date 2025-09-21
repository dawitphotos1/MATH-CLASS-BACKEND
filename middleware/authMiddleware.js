
// // middleware/authMiddleware.js
// import jwt from "jsonwebtoken";
// import db from "../models/index.js"; // ✅ import default
// const { User } = db;                // ✅ destructure User

// export const authenticateToken = async (req, res, next) => {
//   try {
//     let token;

//     // 🔑 Prefer cookie, fallback to Authorization header
//     if (req.cookies?.token) {
//       token = req.cookies.token;
//     } else if (req.headers["authorization"]?.startsWith("Bearer ")) {
//       token = req.headers["authorization"].split(" ")[1];
//     }

//     if (!token) {
//       return res.status(401).json({ success: false, message: "No token, authorization denied" });
//     }

//     // 🔑 Decode token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // ✅ We are signing token with { id: user.id, role: user.role }
//     const user = await User.findByPk(decoded.id, {
//       attributes: { exclude: ["password"] },
//     });

//     if (!user) {
//       return res.status(401).json({ success: false, message: "User not found" });
//     }

//     req.user = user; // Attach full user object for controllers
//     next();
//   } catch (error) {
//     console.error("Auth Middleware Error:", error.message);
//     return res.status(401).json({ success: false, message: "Token is not valid" });
//   }
// };





// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import db from "../models/index.js";
const { User } = db;

export const authenticateToken = async (req, res, next) => {
  try {
    let token;

    if (req.cookies?.token) {
      token = req.cookies.token;
      console.log("🍪 Found token in cookie");
    } else if (req.headers["authorization"]?.startsWith("Bearer ")) {
      token = req.headers["authorization"].split(" ")[1];
      console.log("🔑 Found token in Authorization header");
    }

    if (!token) {
      console.warn("❌ No token found in request");
      return res.status(401).json({ success: false, message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ success: false, message: "Token is not valid" });
  }
};
