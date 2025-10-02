
// // routes/adminRoutes.js
// import express from "express";
// import { User } from "../models/index.js";
// import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // ================================
// // 📋 Get all pending students
// // ================================
// router.get("/pending-students", authenticateToken, isAdmin, async (req, res) => {
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
// // 📋 Get all approved students
// // ================================
// router.get("/approved-students", authenticateToken, isAdmin, async (req, res) => {
//   try {
//     const students = await User.findAll({
//       where: { role: "student", approval_status: "approved" },
//       attributes: ["id", "name", "email", "subject", "createdAt", "updatedAt"],
//     });
//     return res.json(students);
//   } catch (err) {
//     console.error("❌ Fetch approved students error:", err);
//     return res.status(500).json({ error: "Failed to fetch approved students" });
//   }
// });

// // ================================
// // 📋 Get all rejected students
// // ================================
// router.get("/rejected-students", authenticateToken, isAdmin, async (req, res) => {
//   try {
//     const students = await User.findAll({
//       where: { role: "student", approval_status: "rejected" },
//       attributes: ["id", "name", "email", "subject", "createdAt", "updatedAt"],
//     });
//     return res.json(students);
//   } catch (err) {
//     console.error("❌ Fetch rejected students error:", err);
//     return res.status(500).json({ error: "Failed to fetch rejected students" });
//   }
// });

// // ================================
// // ✅ Approve student
// // ================================
// router.patch("/approve/:id", authenticateToken, isAdmin, async (req, res) => {
//   try {
//     const student = await User.findByPk(req.params.id);
//     if (!student || student.role !== "student") {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     student.approval_status = "approved";
//     await student.save();

//     return res.json({
//       message: "Student approved successfully",
//       student,
//     });
//   } catch (err) {
//     console.error("❌ Approve student error:", err);
//     return res.status(500).json({ error: "Failed to approve student" });
//   }
// });

// // ================================
// // ❌ Reject student
// // ================================
// router.patch("/reject/:id", authenticateToken, isAdmin, async (req, res) => {
//   try {
//     const student = await User.findByPk(req.params.id);
//     if (!student || student.role !== "student") {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     student.approval_status = "rejected";
//     await student.save();

//     return res.json({
//       message: "Student rejected successfully",
//       student,
//     });
//   } catch (err) {
//     console.error("❌ Reject student error:", err);
//     return res.status(500).json({ error: "Failed to reject student" });
//   }
// });

// export default router;




// routes/adminRoutes.js
import express from "express";
import {
  getStudentsByStatus,
  approveStudent,
  rejectStudent,
  setPendingStudent,
} from "../controllers/adminController.js";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================================
// 📋 Get students by status
// GET /admin/students?status=pending|approved|rejected
// ================================
router.get("/students", authenticateToken, isAdmin, getStudentsByStatus);

// ================================
// ✅ Approve student
// PATCH /admin/students/:id/approve
// ================================
router.patch("/students/:id/approve", authenticateToken, isAdmin, approveStudent);

// ================================
// ❌ Reject student
// PATCH /admin/students/:id/reject
// ================================
router.patch("/students/:id/reject", authenticateToken, isAdmin, rejectStudent);

// ================================
// 🔄 Reset to pending (optional)
// PATCH /admin/students/:id/pending
// ================================
router.patch("/students/:id/pending", authenticateToken, isAdmin, setPendingStudent);

export default router;
