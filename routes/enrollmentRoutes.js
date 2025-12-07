//routes/enrollmentRoutes.js

import { Router } from "express";
import {
  createEnrollment,
  confirmEnrollmentAfterPayment,
  getEnrollments,
  approveEnrollment,
  rejectEnrollment,
  checkEnrollmentEligibility,
  getMyEnrollments,
  getMyCourses,
  getPendingEnrollments,
  getApprovedEnrollments,
} from "../controllers/enrollmentController.js";
import  authenticateToken from "../middleware/authMiddleware.js";
import db from "../models/index.js";

const router = Router();
const { Enrollment } = db;

// ========================
// Enrollment Routes
// ========================

// Create a new enrollment request
router.post("/", authenticateToken, createEnrollment);

// Confirm enrollment after successful payment
router.post("/confirm", authenticateToken, confirmEnrollmentAfterPayment);

// Get all enrollments (with optional status filter)
router.get("/", authenticateToken, getEnrollments);

// Approve an enrollment (by ID)
router.put("/approve/:id", authenticateToken, approveEnrollment);

// Reject an enrollment (by ID)
router.put("/reject/:id", authenticateToken, rejectEnrollment);

// ✅ Check if user is eligible to enroll in a course
router.get("/status/:courseId", authenticateToken, checkEnrollmentEligibility);

// ✅ Prevent duplicate enrollments before Stripe checkout
router.get("/check/:courseId", authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const existing = await Enrollment.findOne({
      where: { user_id: userId, course_id: courseId, payment_status: "paid" },
    });

    return res.json({ alreadyEnrolled: !!existing });
  } catch (error) {
    console.error("❌ Enrollment duplicate check error:", error);
    res.status(500).json({ alreadyEnrolled: false });
  }
});

// Get all enrollments for the logged-in user
router.get("/mine", authenticateToken, getMyEnrollments);

// Get all approved courses for the logged-in user
router.get("/my-courses", authenticateToken, getMyCourses);

// Get all pending enrollments (for admin)
router.get("/pending", authenticateToken, getPendingEnrollments);

// Get all approved enrollments (for admin)
router.get("/approved", authenticateToken, getApprovedEnrollments);

export default router;
