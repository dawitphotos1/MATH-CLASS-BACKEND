// // routes/adminRoutes.js
// import express from "express";
// import { User, Enrollment, Course } from "../models/index.js";
// import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";

// const router = express.Router();

// /* ============================================================
//    👩‍🎓 STUDENTS (pending / approved / rejected)
// ============================================================ */
// router.get("/students", authenticateToken, isAdmin, async (req, res) => {
//   try {
//     const { status } = req.query;
//     const where = { role: "student" };
//     if (status) where.approval_status = status;

//     const students = await User.findAll({
//       where,
//       attributes: ["id", "name", "email", "subject", "approval_status", "createdAt", "updatedAt"],
//       order: [["createdAt", "DESC"]],
//     });

//     return res.json({ students });
//   } catch (err) {
//     console.error("❌ ADMIN: Fetch students error:", err);
//     return res.status(500).json({ error: "Failed to fetch students" });
//   }
// });

// // ✅ Approve student
// router.patch("/students/:id/approve", authenticateToken, isAdmin, async (req, res) => {
//   try {
//     const student = await User.findByPk(req.params.id);
//     if (!student || student.role !== "student") {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     student.approval_status = "approved";
//     await student.save();

//     return res.json({ message: "Student approved successfully", student });
//   } catch (err) {
//     console.error("❌ ADMIN: Approve student error:", err);
//     return res.status(500).json({ error: "Failed to approve student" });
//   }
// });

// // ✅ Reject student
// router.patch("/students/:id/reject", authenticateToken, isAdmin, async (req, res) => {
//   try {
//     const student = await User.findByPk(req.params.id);
//     if (!student || student.role !== "student") {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     student.approval_status = "rejected";
//     await student.save();

//     return res.json({ message: "Student rejected successfully", student });
//   } catch (err) {
//     console.error("❌ ADMIN: Reject student error:", err);
//     return res.status(500).json({ error: "Failed to reject student" });
//   }
// });

// /* ============================================================
//    🎓 ENROLLMENTS (pending / approved / rejected)
// ============================================================ */
// router.get("/enrollments", authenticateToken, isAdmin, async (req, res) => {
//   try {
//     const { status } = req.query;
//     const where = {};

//     // 🔍 Only include relevant filters
//     if (status) where.approval_status = status;

//     // ✅ Only show paid pending enrollments to admins
//     if (status === "pending") {
//       where.payment_status = "paid";
//     }

//     const enrollments = await Enrollment.findAll({
//       where,
//       include: [
//         { model: User, as: "student", attributes: ["id", "name", "email"] },
//         { model: Course, as: "course", attributes: ["id", "title", "slug"] },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     return res.json({ enrollments });
//   } catch (err) {
//     console.error("❌ ADMIN: Fetch enrollments error:", err);
//     return res.status(500).json({ error: "Failed to fetch enrollments" });
//   }
// });

// // ✅ Approve enrollment
// router.patch("/enrollments/:id/approve", authenticateToken, isAdmin, async (req, res) => {
//   try {
//     const enrollment = await Enrollment.findByPk(req.params.id);
//     if (!enrollment) {
//       return res.status(404).json({ error: "Enrollment not found" });
//     }

//     enrollment.approval_status = "approved";
//     await enrollment.save();

//     return res.json({ message: "Enrollment approved successfully", enrollment });
//   } catch (err) {
//     console.error("❌ ADMIN: Approve enrollment error:", err);
//     return res.status(500).json({ error: "Failed to approve enrollment" });
//   }
// });

// // ✅ Reject enrollment
// router.patch("/enrollments/:id/reject", authenticateToken, isAdmin, async (req, res) => {
//   try {
//     const enrollment = await Enrollment.findByPk(req.params.id);
//     if (!enrollment) {
//       return res.status(404).json({ error: "Enrollment not found" });
//     }

//     enrollment.approval_status = "rejected";
//     await enrollment.save();

//     return res.json({ message: "Enrollment rejected successfully", enrollment });
//   } catch (err) {
//     console.error("❌ ADMIN: Reject enrollment error:", err);
//     return res.status(500).json({ error: "Failed to reject enrollment" });
//   }
// });

// export default router;




import express from "express";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";
import {
  getStudentsByStatus,
  getEnrollmentsByStatus,
  approveEnrollment,
  rejectEnrollment,
  approveStudent,
  rejectStudent,
  debugEnrollments,
  debugFull,
  testCreateEnrollment,
} from "../controllers/adminController.js";

const router = express.Router();

/* ============================================================
👩‍🎓 STUDENT MANAGEMENT
============================================================ */
router.get("/students", authenticateToken, isAdmin, getStudentsByStatus);
router.patch(
  "/students/:id/approve",
  authenticateToken,
  isAdmin,
  approveStudent
);
router.patch("/students/:id/reject", authenticateToken, isAdmin, rejectStudent);

/* ============================================================
🎓 ENROLLMENT MANAGEMENT
============================================================ */
router.get("/enrollments", authenticateToken, isAdmin, getEnrollmentsByStatus);
router.patch(
  "/enrollments/:id/approve",
  authenticateToken,
  isAdmin,
  approveEnrollment
);
router.patch(
  "/enrollments/:id/reject",
  authenticateToken,
  isAdmin,
  rejectEnrollment
);

/* ============================================================
🧪 DEBUG UTILITIES
============================================================ */
router.get("/debug/enrollments", authenticateToken, isAdmin, debugEnrollments);
router.get("/debug/full", authenticateToken, isAdmin, debugFull);
router.post(
  "/test/enrollment",
  authenticateToken,
  isAdmin,
  testCreateEnrollment
);

export default router;

