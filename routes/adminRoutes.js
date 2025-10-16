
// routes/adminRoutes.js
import express from "express";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";
import {
  getStudentsByStatus,
  getEnrollmentsByStatus,
  approveStudent,
  rejectStudent,
  approveEnrollment,
  rejectEnrollment,
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

export default router;
