
// module.exports = function checkTeacherOrAdmin(req, res, next) {
//   if (!req.user) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   const allowedRoles = ["teacher", "admin"];
//   if (!allowedRoles.includes(req.user.role)) {
//     return res.status(403).json({ error: "Access denied" });
//   }

//   next();
// };




// middleware/checkTeacherOrAdmin.js
const checkTeacherOrAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    if (req.user.role !== "teacher" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    next();
  } catch (err) {
    console.error("❌ checkTeacherOrAdmin error:", err.message);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export default checkTeacherOrAdmin;
