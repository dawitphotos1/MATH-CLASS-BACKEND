
// const express = require("express");
// const router = express.Router();
// const { User } = require("../models");
// const { authMiddleware, adminOnly } = require("../middleware/auth");
// const { approveStudent } = require("../controllers/authController");

// // ================================
// // 📋 Get all pending students
// // ================================
// // GET /api/v1/admin/pending-students
// router.get("/pending-students", authMiddleware, adminOnly, async (req, res) => {
//   try {
//     const students = await User.findAll({
//       where: { role: "student", approval_status: "pending" },
//       attributes: ["id", "name", "email", "subject", "createdAt"],
//     });

//     return res.json(students);
//   } catch (err) {
//     console.error("❌ Fetch pending students error:", err);
//     return res.status(500).json({ error: "Failed to fetch pending students" });
//   }
// });

// // ================================
// // ✅ Approve / Reject Student
// // ================================
// // PATCH /api/v1/admin/approve-student/:studentId
// // { "action": "approve" } or { "action": "reject" }
// router.patch(
//   "/approve-student/:studentId",
//   authMiddleware,
//   adminOnly,
//   approveStudent
// );

// module.exports = router;




// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { authMiddleware, adminOnly } = require("../middleware/auth");
const { approveStudent } = require("../controllers/authController");

// ================================
// 📋 Get all pending students
// ================================
// GET /api/v1/admin/pending-students
router.get("/pending-students", authMiddleware, adminOnly, async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: "student", approval_status: "pending" },
      attributes: ["id", "name", "email", "subject", "createdAt"],
    });

    return res.json(students);
  } catch (err) {
    console.error("❌ Fetch pending students error:", err);
    return res.status(500).json({ error: "Failed to fetch pending students" });
  }
});

// ================================
// ✅ Approve / Reject a student
// ================================
// PATCH /api/v1/admin/approve-student/:studentId
// Body: { "action": "approve" } or { "action": "reject" }
router.patch(
  "/approve-student/:studentId",
  authMiddleware,
  adminOnly,
  approveStudent
);

module.exports = router;
