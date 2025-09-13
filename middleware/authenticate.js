// middleware/authenticate.js
const jwt = require("jsonwebtoken");
const { User } = require("../models");

module.exports = async function authenticate(req, res, next) {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ["password"] },
    });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized: User not found" });
    }

    req.user = user; // ✅ Attach full user object
    console.log("✅ Authenticated:", user.email, "| Role:", user.role);
    next();
  } catch (err) {
    console.error("❌ Auth error:", err.message);
    return res.status(403).json({ error: "Session expired or invalid token" });
  }
};
