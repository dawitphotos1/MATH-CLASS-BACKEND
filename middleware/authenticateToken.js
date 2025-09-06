// middleware/authenticateToken.js
const jwt = require("jsonwebtoken");

module.exports = function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token)
    return res.status(401).json({ error: "Unauthorized: No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("❌ Token verification failed:", err.message);
      return res
        .status(403)
        .json({ error: "Session expired or invalid token" });
    }
    req.user = user;
    next();
  });
};
