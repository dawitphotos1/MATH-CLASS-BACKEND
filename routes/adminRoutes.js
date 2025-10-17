
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
  debugEnrollments,
} from "../controllers/adminController.js";

const router = express.Router();

/* ============================================================
   👩‍🎓 STUDENTS (pending / approved / rejected)
============================================================ */
router.get("/students", authenticateToken, isAdmin, getStudentsByStatus);
router.patch("/students/:id/approve", authenticateToken, isAdmin, approveStudent);
router.patch("/students/:id/reject", authenticateToken, isAdmin, rejectStudent);

/* ============================================================
   🎓 ENROLLMENTS (pending / approved / rejected)
============================================================ */
router.get("/enrollments", authenticateToken, isAdmin, getEnrollmentsByStatus);
router.patch("/enrollments/:id/approve", authenticateToken, isAdmin, approveEnrollment);
router.patch("/enrollments/:id/reject", authenticateToken, isAdmin, rejectEnrollment);

/* ============================================================
   🧪 DEBUG UTILITIES
============================================================ */
router.get("/debug/enrollments", authenticateToken, isAdmin, debugEnrollments);

export default router;
