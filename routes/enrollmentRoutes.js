// // routes/enrollmentRoutes.js
// import express from "express";
// import { authenticateToken } from "../middleware/authMiddleware.js";
// import {
//   createEnrollment,
//   confirmEnrollmentAfterPayment,
//   getEnrollments,
//   approveEnrollment,
//   rejectEnrollment,
//   checkEnrollment,
//   getMyEnrollments,
//   getMyCourses,
//   getPendingEnrollments,
//   getApprovedEnrollments,
  
// } from "../controllers/enrollmentController.js";

// const router = express.Router();

// // Manual enrollment request (pending approval)
// router.post("/", authenticateToken, createEnrollment);

// // After Stripe payment success → auto-approved
// router.post("/confirm", authenticateToken, confirmEnrollmentAfterPayment);

// // Other enrollment routes
// router.get("/", authenticateToken, getEnrollments);
// router.get("/my-enrollments", authenticateToken, getMyEnrollments);
// router.get("/my-courses", authenticateToken, getMyCourses);
// router.get("/pending", authenticateToken, getPendingEnrollments);
// router.get("/approved", authenticateToken, getApprovedEnrollments);
// router.get("/check/:courseId", authenticateToken, checkEnrollment);

// // Admin/teacher actions
// router.put("/:id/approve", authenticateToken, approveEnrollment);
// router.put("/:id/reject", authenticateToken, rejectEnrollment);

// export default router;





// // routes/enrollmentRoutes.js
// import express from "express";
// import { authenticateToken } from "../middleware/authMiddleware.js";
// import {
//   createEnrollment,
//   confirmEnrollmentAfterPayment,
//   getEnrollments,
//   approveEnrollment,
//   rejectEnrollment,
//   checkEnrollment,
//   getMyEnrollments,
//   getMyCourses,
//   getPendingEnrollments,
//   getApprovedEnrollments,
//   checkEnrollmentEligibility, // ADD THIS IMPORT
// } from "../controllers/enrollmentController.js";

// const router = express.Router();

// // Manual enrollment request (pending approval)
// router.post("/", authenticateToken, createEnrollment);

// // After Stripe payment success → auto-approved
// router.post("/confirm", authenticateToken, confirmEnrollmentAfterPayment);

// // Other enrollment routes
// router.get("/", authenticateToken, getEnrollments);
// router.get("/my-enrollments", authenticateToken, getMyEnrollments);
// router.get("/my-courses", authenticateToken, getMyCourses);
// router.get("/pending", authenticateToken, getPendingEnrollments);
// router.get("/approved", authenticateToken, getApprovedEnrollments);
// router.get("/check/:courseId", authenticateToken, checkEnrollment);

// // Add this route
// router.get(
//   "/eligibility/:courseId",
//   authenticateToken,
//   checkEnrollmentEligibility
// );


// // Admin/teacher actions
// router.put("/:id/approve", authenticateToken, approveEnrollment);
// router.put("/:id/reject", authenticateToken, rejectEnrollment);

// export default router;



import { Router } from "express";
import {
  createEnrollment,
  confirmEnrollmentAfterPayment,
  getEnrollments,
  approveEnrollment,
  rejectEnrollment,
  checkEnrollmentEligibility, // ✅ Correct function name
  getMyEnrollments,
  getMyCourses,
  getPendingEnrollments,
  getApprovedEnrollments,
} from "../controllers/enrollmentController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

// ========================
// Enrollment Routes
// ========================

// Create a new enrollment request (pending)
router.post("/", authenticateToken, createEnrollment);

// Confirm enrollment after successful payment
router.post("/confirm", authenticateToken, confirmEnrollmentAfterPayment);

// Get all enrollments (with optional status filter)
router.get("/", authenticateToken, getEnrollments);

// Approve an enrollment (by ID)
router.put("/approve/:id", authenticateToken, approveEnrollment);

// Reject an enrollment (by ID)
router.put("/reject/:id", authenticateToken, rejectEnrollment);

// ✅ Check if the user is eligible to enroll in a course
router.get("/status/:courseId", authenticateToken, checkEnrollmentEligibility);

// Get all enrollments of the logged-in user
router.get("/mine", authenticateToken, getMyEnrollments);

// Get all approved courses of the logged-in user
router.get("/my-courses", authenticateToken, getMyCourses);

// Get all pending enrollments (admin)
router.get("/pending", authenticateToken, getPendingEnrollments);

// Get all approved enrollments (admin)
router.get("/approved", authenticateToken, getApprovedEnrollments);

export default router;
