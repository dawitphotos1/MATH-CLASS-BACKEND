// routes/enrollmentRoutes.js
import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  createEnrollment,
  confirmEnrollmentAfterPayment,
  getEnrollments,
  approveEnrollment,
  rejectEnrollment,
  checkEnrollment,
  getMyEnrollments,
  getMyCourses,
  getPendingEnrollments,
  getApprovedEnrollments,
} from "../controllers/enrollmentController.js";

const router = express.Router();

// Manual enrollment request (pending approval)
router.post("/", authenticateToken, createEnrollment);

// After Stripe payment success → auto-approved
router.post("/confirm", authenticateToken, confirmEnrollmentAfterPayment);

// Other enrollment routes
router.get("/", authenticateToken, getEnrollments);
router.get("/my-enrollments", authenticateToken, getMyEnrollments);
router.get("/my-courses", authenticateToken, getMyCourses);
router.get("/pending", authenticateToken, getPendingEnrollments);
router.get("/approved", authenticateToken, getApprovedEnrollments);
router.get("/check/:courseId", authenticateToken, checkEnrollment);

// Add this route
router.get('/status/:courseId', authenticateToken, checkEnrollmentStatus);


// Admin/teacher actions
router.put("/:id/approve", authenticateToken, approveEnrollment);
router.put("/:id/reject", authenticateToken, rejectEnrollment);

export default router;
