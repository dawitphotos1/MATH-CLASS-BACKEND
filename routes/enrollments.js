// routes/enrollments.js
import express from "express";
import * as enrollmentController from "../controllers/enrollmentController.js";
import {authenticateToken} from "../middleware/authenticateToken.js";
import roleMiddleware from "../middleware/roleMiddleware.js"; // Optional for admin-only access

const router = express.Router();

// =====================================================
// 🔒 Protect all enrollment routes
// =====================================================
router.use(authenticateToken);

// =====================================================
// 🎓 Student Routes
// =====================================================

// Create new enrollment (manual approval)
router.post("/", enrollmentController.createEnrollment);

// Get current user's enrollments (includes course info)
router.get("/my-enrollments", enrollmentController.getMyEnrollments);

// Get current user's courses (supports ?status=approved|pending)
router.get("/my-courses", enrollmentController.getMyCourses);

// Check if current user is enrolled in a course
router.get("/check/:courseId", enrollmentController.checkEnrollment);

// Check if current user can enroll in a course
router.get("/eligibility/:courseId", enrollmentController.checkEnrollmentEligibility);

// =====================================================
// 🧑‍🏫 Admin / Teacher Routes
// =====================================================
// ✅ If you want to restrict these routes to admins or teachers only,
// uncomment the line below and make sure `roleMiddleware` is set up correctly.
// router.use(roleMiddleware(["admin", "teacher"]));

// Get all pending enrollments
router.get("/pending", enrollmentController.getPendingEnrollments);

// Get all approved enrollments
router.get("/approved", enrollmentController.getApprovedEnrollments);

// Approve enrollment manually
router.put("/approve/:id", enrollmentController.approveEnrollment);

// Reject enrollment manually
router.delete("/reject/:id", enrollmentController.rejectEnrollment);

export default router;
