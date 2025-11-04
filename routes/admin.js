// // routes/admin.js
// import express from "express";
// import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";
// import {
//   getStudentsByStatus,
//   approveStudent,
//   rejectStudent,
//   getEnrollmentsByStatus,
//   approveEnrollment,
//   rejectEnrollment,
//   sendApprovalEmail,
//   sendWelcomeEmail,
// } from "../controllers/adminController.js";

// const router = express.Router();

// // 👩‍🎓 Student Management
// router.get("/students", authenticateToken, isAdmin, getStudentsByStatus);
// router.patch("/students/:id/approve", authenticateToken, isAdmin, approveStudent);
// router.patch("/students/:id/reject", authenticateToken, isAdmin, rejectStudent);

// // 📧 Emails
// router.post("/students/:id/send-approval-email", authenticateToken, isAdmin, sendApprovalEmail);
// router.post("/students/:id/send-welcome-email", authenticateToken, isAdmin, sendWelcomeEmail);

// // 🎓 Enrollment Management
// router.get("/enrollments", authenticateToken, isAdmin, getEnrollmentsByStatus);
// router.patch("/enrollments/:id/approve", authenticateToken, isAdmin, approveEnrollment);
// router.patch("/enrollments/:id/reject", authenticateToken, isAdmin, rejectEnrollment);

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
  sendApprovalEmail,
  sendWelcomeEmail,
  getAllCourses,
  getAllUsers
} from "../controllers/adminController.js";

import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔐 Protect all admin routes
router.use(authenticateToken, isAdmin);

/* ========================================================
   👩‍🎓 STUDENT MANAGEMENT
======================================================== */
router.get("/students", getStudentsByStatus);
router.patch("/students/:id/approve", approveStudent);
router.patch("/students/:id/reject", rejectStudent);

/* ========================================================
   🧾 ENROLLMENT MANAGEMENT
======================================================== */
router.get("/enrollments", getEnrollmentsByStatus);
router.patch("/enrollments/:id/approve", approveEnrollment);
router.patch("/enrollments/:id/reject", rejectEnrollment);

/* ========================================================
   ✉️ EMAIL ROUTES
======================================================== */
router.post("/students/:id/send-approval-email", sendApprovalEmail);
router.post("/students/:id/send-welcome-email", sendWelcomeEmail);

/* ========================================================
   📚 ADMIN MANAGEMENT (Manage Courses & Users)
======================================================== */
router.get("/courses", getAllCourses);
router.get("/users", getAllUsers);

export default router;
