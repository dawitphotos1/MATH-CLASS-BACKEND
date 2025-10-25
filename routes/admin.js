// routes/admin.js
import express from "express";
import {
  getStudentsByStatus,
  approveStudent,
  rejectStudent,
  getEnrollmentsByStatus,
  approveEnrollment,
  rejectEnrollment,
  debugEnrollments,
  testApproval, // ✅ ADDED
} from "../controllers/adminController.js";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";
import db from "../models/index.js";

const router = express.Router();

// ✅ Debug log for admin routes
router.use((req, res, next) => {
  console.log(`🔐 Admin route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

// 🔐 Protect all admin routes
router.use(authenticateToken, isAdmin);

// ====================
// Student Management
// ====================
router.get("/students", getStudentsByStatus);
router.patch("/students/:id/approve", approveStudent);
router.patch("/students/:id/reject", rejectStudent);

// ====================
// Enrollment Management
// ====================
router.get("/enrollments", getEnrollmentsByStatus);
router.patch("/enrollments/:id/approve", approveEnrollment);
router.patch("/enrollments/:id/reject", rejectEnrollment);

// ====================
// Debug Routes
// ====================
router.get("/debug-enrollments", debugEnrollments);
router.post("/test-approval", testApproval); // ✅ ADDED

// Enhanced debug route with database query
router.get("/debug-database", async (req, res) => {
  try {
    console.log("🗃️ DATABASE DEBUG: Checking enrollments table...");

    // Direct database query to see everything
    const [results] = await db.sequelize.query(`
      SELECT 
        e.id,
        e.user_id,
        u.name as student_name,
        u.email as student_email,
        e.course_id,
        c.title as course_title,
        e.payment_status,
        e.approval_status,
        e.created_at,
        e.updated_at
      FROM enrollments e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN courses c ON e.course_id = c.id
      ORDER BY e.created_at DESC
    `);

    console.log(`📊 DATABASE: Found ${results.length} enrollment records`);

    results.forEach((record, index) => {
      console.log(`   ${index + 1}.`, {
        id: record.id,
        student: `${record.student_name} (${record.student_email})`,
        course: record.course_title,
        payment: record.payment_status,
        approval: record.approval_status,
        created: record.created_at,
      });
    });

    res.json({
      success: true,
      count: results.length,
      enrollments: results,
      message: `Found ${results.length} enrollment records in database`,
    });
  } catch (error) {
    console.error("❌ Database debug error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;