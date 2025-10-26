
// // routes/admin.js
// import express from "express";
// import {
//   getStudentsByStatus,
//   approveStudent,
//   rejectStudent,
//   getEnrollmentsByStatus,
//   approveEnrollment,
//   rejectEnrollment,
//   sendStudentApprovalEmail,
//   sendStudentRejectionEmail,
//   sendStudentWelcomeEmail
// } from "../controllers/adminController.js";
// import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // 🔐 Protect all admin routes
// router.use(authenticateToken, isAdmin);

// /* ========================================================
//    👩‍🎓 Student Management (INSTANT - No Email)
// ======================================================== */
// router.get("/students", getStudentsByStatus);
// router.patch("/students/:id/approve", approveStudent);
// router.patch("/students/:id/reject", rejectStudent);

// /* ========================================================
//    🧾 Enrollment Management (INSTANT - No Email)
// ======================================================== */
// router.get("/enrollments", getEnrollmentsByStatus);
// router.patch("/enrollments/:id/approve", approveEnrollment);
// router.patch("/enrollments/:id/reject", rejectEnrollment);

// /* ========================================================
//    ✉️ Manual Email Routes (Separate - Admin can use later)
// ======================================================== */
// router.post("/students/:studentId/send-approval-email", sendStudentApprovalEmail);
// router.post("/students/:studentId/send-rejection-email", sendStudentRejectionEmail);
// router.post("/students/:studentId/send-welcome-email", sendStudentWelcomeEmail);

// /* ========================================================
//    🏥 Health Check for Admin
// ======================================================== */
// router.get("/health", async (req, res) => {
//   try {
//     res.json({
//       status: "ok",
//       message: "Admin routes are working",
//       timestamp: new Date().toISOString(),
//       user: {
//         id: req.user.id,
//         email: req.user.email,
//         role: req.user.role,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// export default router;



// routes/admin.js
import express from "express";
import {
  getStudentsByStatus,
  approveStudent,
  rejectStudent,
  getEnrollmentsByStatus,
  approveEnrollment,
  rejectEnrollment,
} from "../controllers/adminController.js";
import {
  sendStudentApprovalEmail,
  sendStudentRejectionEmail,
  sendStudentWelcomeEmail
} from "../controllers/emailController.js";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔐 Protect all admin routes
router.use(authenticateToken, isAdmin);

/* ========================================================
   👩‍🎓 STUDENT MANAGEMENT (INSTANT - No Email)
======================================================== */
router.get("/students", getStudentsByStatus);
router.patch("/students/:id/approve", approveStudent);
router.patch("/students/:id/reject", rejectStudent);

/* ========================================================
   🧾 ENROLLMENT MANAGEMENT (INSTANT - No Email)
======================================================== */
router.get("/enrollments", getEnrollmentsByStatus);
router.patch("/enrollments/:id/approve", approveEnrollment);
router.patch("/enrollments/:id/reject", rejectEnrollment);

/* ========================================================
   ✉️ MANUAL EMAIL ROUTES (Separate - Yahoo Mail)
======================================================== */
router.post("/students/:id/send-approval-email", sendStudentApprovalEmail);
router.post("/students/:id/send-rejection-email", sendStudentRejectionEmail);
router.post("/students/:id/send-welcome-email", sendStudentWelcomeEmail);

export default router;