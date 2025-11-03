// // routes/adminRoutes.js
// import express from "express";
// import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";
// import {
//   getStudentsByStatus,
//   approveStudent,
//   rejectStudent,
//   getEnrollmentsByStatus,
//   approveEnrollment,
//   rejectEnrollment,
// } from "../controllers/adminController.js";

// const router = express.Router();

// router.get("/students", authenticateToken, isAdmin, getStudentsByStatus);
// router.patch("/students/:id/approve", authenticateToken, isAdmin, approveStudent);
// router.patch("/students/:id/reject", authenticateToken, isAdmin, rejectStudent);

// router.get("/enrollments", authenticateToken, isAdmin, getEnrollmentsByStatus);
// router.patch("/enrollments/:id/approve", authenticateToken, isAdmin, approveEnrollment);
// router.patch("/enrollments/:id/reject", authenticateToken, isAdmin, rejectEnrollment);

// export default router;





// routes/adminRoutes.js
import express from "express";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";
import {
  getStudentsByStatus,
  approveStudent,
  rejectStudent,
  getEnrollmentsByStatus,
  approveEnrollment,
  rejectEnrollment,
  sendApprovalEmail,
  sendWelcomeEmail,
} from "../controllers/adminController.js";

const router = express.Router();

// 👩‍🎓 Student management
router.get("/students", authenticateToken, isAdmin, getStudentsByStatus);
router.patch("/students/:id/approve", authenticateToken, isAdmin, approveStudent);
router.patch("/students/:id/reject", authenticateToken, isAdmin, rejectStudent);
router.post("/students/:id/send-approval-email", authenticateToken, isAdmin, sendApprovalEmail);
router.post("/students/:id/send-welcome-email", authenticateToken, isAdmin, sendWelcomeEmail);

// 🎓 Enrollment management
router.get("/enrollments", authenticateToken, isAdmin, getEnrollmentsByStatus);
router.patch("/enrollments/:id/approve", authenticateToken, isAdmin, approveEnrollment);
router.patch("/enrollments/:id/reject", authenticateToken, isAdmin, rejectEnrollment);

export default router;
