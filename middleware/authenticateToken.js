// // middleware/authenticateToken.js
// import jwt from "jsonwebtoken";
// import db from "../models/index.js";

// const { User } = db; // ✅ access the User model properly

// const authenticateToken = async (req, res, next) => {
//   try {
//     // Get token from Authorization header or cookie
//     let token = null;

//     if (req.headers.authorization?.startsWith("Bearer ")) {
//       token = req.headers.authorization.split(" ")[1];
//     } else if (req.cookies?.token) {
//       token = req.cookies.token;
//     }

//     if (!token) {
//       return res
//         .status(401)
//         .json({ success: false, error: "No token provided" });
//     }

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (!decoded?.id) {
//       return res.status(401).json({ success: false, error: "Invalid token" });
//     }

//     // Find user by ID
//     const user = await User.findByPk(decoded.id, {
//       attributes: ["id", "name", "email", "role"],
//     });

//     if (!user) {
//       return res.status(401).json({ success: false, error: "User not found" });
//     }

//     // Attach user info to request
//     req.user = {
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//     };

//     next();
//   } catch (err) {
//     console.error("❌ Auth error:", err.message);
//     res.status(403).json({ success: false, error: "Unauthorized" });
//   }
// };

// export default authenticateToken;





// middleware/authenticateToken.js
import jwt from "jsonwebtoken";
import db from "../models/index.js";

const { User } = db;

const authenticateToken = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, error: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.id) {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }

    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "name", "email", "role"],
    });

    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    console.error("❌ Auth error:", err.message);
    res.status(403).json({ success: false, error: "Unauthorized" });
  }
};

export default authenticateToken;
