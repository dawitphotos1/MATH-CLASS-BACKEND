
const express = require("express");
const router = express.Router();
const enrollmentController = require("../controllers/enrollmentController");
const { authMiddleware } = require("../middleware/auth"); // Correct destructuring import

// Protect all routes
router.use(authMiddleware);

/**
 * Student routes
 */

// Create a new enrollment request
router.post("/", enrollmentController.createEnrollment);

// Get all enrollments for the logged-in student
router.get("/my-enrollments", enrollmentController.getMyEnrollments);

// ✅ Get only approved courses for the logged-in student
router.get("/my-courses", enrollmentController.getMyCourses);

// Check if the student is enrolled & approved in a course
router.get("/check/:courseId", enrollmentController.checkEnrollment);

/**
 * Admin / Teacher routes
 */

// Get all pending enrollments (paid but not approved yet)
router.get("/pending", enrollmentController.getPendingEnrollments);

// Get all approved enrollments
router.get("/approved", enrollmentController.getApprovedEnrollments);

// Approve a specific enrollment
router.put("/approve/:id", enrollmentController.approveEnrollment);

// Reject and delete a specific enrollment
router.delete("/reject/:id", enrollmentController.rejectEnrollment);

module.exports = router;
