
// routes/admin.js - COMPLETE CORRECTED VERSION
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
  sendEnrollmentApprovalEmail,
  getAllCourses,
  getAllUsers,
} from "../controllers/adminController.js";

import { authenticateToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// Student management
router.get("/students", getStudentsByStatus);
router.patch("/students/:id/approve", approveStudent);
router.patch("/students/:id/reject", rejectStudent);

// Enrollment management
router.get("/enrollments", getEnrollmentsByStatus);
router.patch("/enrollments/:id/approve", approveEnrollment);
router.patch("/enrollments/:id/reject", rejectEnrollment);

// Email management
router.post("/students/:id/send-approval-email", sendApprovalEmail);
router.post("/students/:id/send-welcome-email", sendWelcomeEmail);
router.post(
  "/enrollments/:id/send-approval-email",
  sendEnrollmentApprovalEmail
);

// Dashboard
router.get("/courses", getAllCourses);
router.get("/users", getAllUsers);

export default router;