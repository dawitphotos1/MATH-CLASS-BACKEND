
// // middleware/checkTeacherOrAdmin.js
// const checkTeacherOrAdmin = (req, res, next) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ success: false, error: "Unauthorized" });
//     }

//     if (req.user.role !== "teacher" && req.user.role !== "admin") {
//       return res.status(403).json({ success: false, error: "Access denied" });
//     }

//     next();
//   } catch (err) {
//     console.error("❌ checkTeacherOrAdmin error:", err.message);
//     return res
//       .status(500)
//       .json({ success: false, error: "Internal Server Error" });
//   }
// };

// export default checkTeacherOrAdmin;



// middleware/checkTeacherOrAdmin.js

const checkTeacherOrAdmin = (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: "Unauthorized" });
    if (req.user.role !== "teacher" && req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Access denied" });
    }
    return next();
  } catch (err) {
    console.error("checkTeacherOrAdmin error:", err?.message || err);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export default checkTeacherOrAdmin;
