
// // routes/enrollmentRoutes.js
// import { Router } from "express";
// import {
//   createEnrollment,
//   confirmEnrollmentAfterPayment,
//   getEnrollments,
//   approveEnrollment,
//   rejectEnrollment,
//   checkEnrollmentEligibility, // ✅ Correct function name
//   getMyEnrollments,
//   getMyCourses,
//   getPendingEnrollments,
//   getApprovedEnrollments,
// } from "../controllers/enrollmentController.js";

// import { authenticateToken } from "../middleware/authMiddleware.js";

// const router = Router();

// // ========================
// // Enrollment Routes
// // ========================

// // Create a new enrollment request (pending)
// router.post("/", authenticateToken, createEnrollment);

// // Confirm enrollment after successful payment
// router.post("/confirm", authenticateToken, confirmEnrollmentAfterPayment);

// // Get all enrollments (with optional status filter)
// router.get("/", authenticateToken, getEnrollments);

// // Approve an enrollment (by ID)
// router.put("/approve/:id", authenticateToken, approveEnrollment);

// // Reject an enrollment (by ID)
// router.put("/reject/:id", authenticateToken, rejectEnrollment);

// // ✅ Check if the user is eligible to enroll in a course
// router.get("/status/:courseId", authenticateToken, checkEnrollmentEligibility);

// // Get all enrollments of the logged-in user
// router.get("/mine", authenticateToken, getMyEnrollments);

// // Get all approved courses of the logged-in user
// router.get("/my-courses", authenticateToken, getMyCourses);

// // Get all pending enrollments (admin)
// router.get("/pending", authenticateToken, getPendingEnrollments);

// // Get all approved enrollments (admin)
// router.get("/approved", authenticateToken, getApprovedEnrollments);

// export default router;




// routes/enrollmentRoutes.js
import { Router } from "express";
import {
  createEnrollment,
  confirmEnrollmentAfterPayment,
  getEnrollments,
  approveEnrollment,
  rejectEnrollment,
  checkEnrollmentEligibility,
  getMyEnrollments,
  getMyCourses, // Make sure this is imported
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

// Get all approved courses of the logged-in user - FIXED PATH
router.get("/my-courses", authenticateToken, getMyCourses);

// Get all pending enrollments (admin)
router.get("/pending", authenticateToken, getPendingEnrollments);

// Get all approved enrollments (admin)
router.get("/approved", authenticateToken, getApprovedEnrollments);

export default router;