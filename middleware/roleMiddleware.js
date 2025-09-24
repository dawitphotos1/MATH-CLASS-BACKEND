
// // middleware/roleMiddleware.js
// exports.authorize = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       return res.status(403).json({ error: "Access denied" });
//     }
//     next();
//   };
// };




// middleware/roleMiddleware.js
const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ success: false, error: "Forbidden: insufficient role" });
      }

      next();
    } catch (err) {
      console.error("❌ roleMiddleware error:", err.message);
      return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  };
};

export default roleMiddleware;
