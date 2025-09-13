// const jwt = require("jsonwebtoken");

// const auth = (req, res, next) => {
//   const token = req.header("Authorization")?.replace("Bearer ", "");
//   if (!token) {
//     console.log("🚫 authMiddleware: No token provided");
//     return res.status(401).json({ error: "No token provided" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log(`✅ authMiddleware: Token verified for user ID ${decoded.id}`);
//     req.user = decoded; // Attach user info (id, role, etc.)
//     next();
//   } catch (error) {
//     console.error("❌ authMiddleware: Invalid token", error.message);
//     res.status(401).json({ error: "Invalid token" });
//   }
// };

// module.exports = { auth };



const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    console.log("🚫 authMiddleware: No token provided");
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`✅ authMiddleware: Token verified for user ID ${decoded.id}`);
    req.user = decoded; // Attach user info (id, role, etc.)
    next();
  } catch (error) {
    console.error("❌ authMiddleware: Invalid token", error.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { auth };