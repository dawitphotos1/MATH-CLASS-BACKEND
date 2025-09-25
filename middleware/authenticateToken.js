
// middleware/authenticateToken.js
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

const authenticateToken = async (req, res, next) => {
  try {
    // Token from header OR cookie
    let token = null;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load user from DB (so we have role + fresh info)
    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "name", "email", "role"],
    });

    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid user" });
    }

    // Attach to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    console.error("❌ Auth error:", err.message);
    return res.status(403).json({ success: false, error: "Unauthorized" });
  }
};

export default authenticateToken;
