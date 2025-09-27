
// module.exports = exports;

import express from "express";
import {
  createEnrollment,
  getMyEnrollments,
  getMyCourses,
  checkEnrollment,
  getPendingEnrollments,
  getApprovedEnrollments,
  approveEnrollment,
  rejectEnrollment,
} from "../controllers/enrollmentController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Student routes
router.post("/request", authenticateToken, createEnrollment);
router.get("/my-enrollments", authenticateToken, getMyEnrollments);
router.get("/my-courses", authenticateToken, getMyCourses);
router.get("/status/:courseId", authenticateToken, checkEnrollment);

// Admin / teacher routes
router.get("/pending", authenticateToken, getPendingEnrollments);
router.get("/approved", authenticateToken, getApprovedEnrollments);
router.patch("/:id/approve", authenticateToken, approveEnrollment);
router.delete("/:id/reject", authenticateToken, rejectEnrollment);

export default router;
