
// routes/admin.js — Clean, CORS-Safe, Production-Ready Version
import express from "express";
import {
  getStudentsByStatus,
  approveStudent,
  rejectStudent,
  getEnrollmentsByStatus,
  approveEnrollment,
  rejectEnrollment,
  debugEnrollments,
  testApproval,
} from "../controllers/adminController.js";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";
import db from "../models/index.js";

const router = express.Router();

/* ========================================================
   🔒 Middleware for Logging + Auth
======================================================== */
router.use((req, res, next) => {
  if (req.query.debug === "true") {
    console.log(`🔐 Admin Route: [${req.method}] ${req.originalUrl}`);
    console.log("🧩 Origin:", req.headers.origin);
  }
  next();
});

// 🔐 Protect all admin routes
router.use(authenticateToken, isAdmin);

/* ========================================================
   👩‍🎓 Student Management
======================================================== */
router.get("/students", async (req, res) => {
  try {
    const data = await getStudentsByStatus(req, res);
    if (!res.headersSent) res.status(200).json(data);
  } catch (error) {
    console.error("❌ Error fetching students:", error);
    if (!res.headersSent)
      res.status(500).json({ success: false, error: error.message });
  }
});

router.patch("/students/:id/approve", async (req, res) => {
  try {
    const result = await approveStudent(req, res);
    if (!res.headersSent)
      res.status(200).json({
        success: true,
        message: "Student approved successfully ✅",
        result,
      });
  } catch (error) {
    console.error("❌ Error approving student:", error);
    if (!res.headersSent)
      res.status(500).json({ success: false, error: error.message });
  }
});

router.patch("/students/:id/reject", async (req, res) => {
  try {
    const result = await rejectStudent(req, res);
    if (!res.headersSent)
      res.status(200).json({
        success: true,
        message: "Student rejected successfully ❌",
        result,
      });
  } catch (error) {
    console.error("❌ Error rejecting student:", error);
    if (!res.headersSent)
      res.status(500).json({ success: false, error: error.message });
  }
});

/* ========================================================
   🧾 Enrollment Management
======================================================== */
router.get("/enrollments", async (req, res) => {
  try {
    const data = await getEnrollmentsByStatus(req, res);
    if (!res.headersSent) res.status(200).json(data);
  } catch (error) {
    console.error("❌ Error fetching enrollments:", error);
    if (!res.headersSent)
      res.status(500).json({ success: false, error: error.message });
  }
});

router.patch("/enrollments/:id/approve", async (req, res) => {
  try {
    const result = await approveEnrollment(req, res);
    if (!res.headersSent)
      res.status(200).json({
        success: true,
        message: "Enrollment approved successfully ✅",
        result,
      });
  } catch (error) {
    console.error("❌ Error approving enrollment:", error);
    if (!res.headersSent)
      res.status(500).json({ success: false, error: error.message });
  }
});

router.patch("/enrollments/:id/reject", async (req, res) => {
  try {
    const result = await rejectEnrollment(req, res);
    if (!res.headersSent)
      res.status(200).json({
        success: true,
        message: "Enrollment rejected successfully ❌",
        result,
      });
  } catch (error) {
    console.error("❌ Error rejecting enrollment:", error);
    if (!res.headersSent)
      res.status(500).json({ success: false, error: error.message });
  }
});

/* ========================================================
   🧪 Debug + Testing Utilities
======================================================== */
router.get("/debug-enrollments", async (req, res) => {
  try {
    const result = await debugEnrollments(req, res);
    if (!res.headersSent)
      res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error("❌ Debug Enrollments Error:", error);
    if (!res.headersSent)
      res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/test-approval", async (req, res) => {
  try {
    const result = await testApproval(req, res);
    if (!res.headersSent)
      res.status(200).json({ success: true, message: "Test approval OK", result });
  } catch (error) {
    console.error("❌ Test Approval Error:", error);
    if (!res.headersSent)
      res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/debug-database", async (req, res) => {
  try {
    console.log("🗃️ DATABASE DEBUG: Checking enrollments table...");

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

    console.log(`📊 Found ${results.length} enrollment records`);
    res.status(200).json({
      success: true,
      count: results.length,
      enrollments: results,
    });
  } catch (error) {
    console.error("❌ Database debug error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
