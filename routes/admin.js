// // routes/admin.js
// import express from "express";
// import {
//   getStudentsByStatus,
//   approveStudent,
//   rejectStudent,
//   getEnrollmentsByStatus,
//   approveEnrollment,
//   rejectEnrollment,
//   debugEnrollments,
//   debugFull,
//   testCreateEnrollment,
// } from "../controllers/adminController.js";
// import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";
// import db from "../models/index.js";

// const router = express.Router();

// // ✅ Debug log for admin routes
// router.use((req, res, next) => {
//   console.log(`🔐 Admin route accessed: ${req.method} ${req.originalUrl}`);
//   next();
// });

// // 🔐 Protect all admin routes
// router.use(authenticateToken, isAdmin);

// // ====================
// // Student Management
// // ====================
// router.get("/students", getStudentsByStatus);
// router.patch("/students/:id/approve", approveStudent);
// router.patch("/students/:id/reject", rejectStudent);

// // ====================
// // Enrollment Management
// // ====================
// router.get("/enrollments", getEnrollmentsByStatus);
// router.patch("/enrollments/:id/approve", approveEnrollment);
// router.patch("/enrollments/:id/reject", rejectEnrollment);

// // ====================
// // Debug Routes
// // ====================
// router.get("/debug-enrollments", debugEnrollments);
// router.get("/debug-full", debugFull);
// router.post("/test-enrollment", testCreateEnrollment);

// // Enhanced debug route with database query
// router.get("/debug-database", async (req, res) => {
//   try {
//     console.log("🗃️ DATABASE DEBUG: Checking enrollments table...");

//     // Direct database query to see everything
//     const [results] = await db.sequelize.query(`
//       SELECT 
//         e.id,
//         e.user_id,
//         u.name as student_name,
//         u.email as student_email,
//         e.course_id,
//         c.title as course_title,
//         e.payment_status,
//         e.approval_status,
//         e.created_at,
//         e.updated_at
//       FROM enrollments e
//       LEFT JOIN users u ON e.user_id = u.id
//       LEFT JOIN courses c ON e.course_id = c.id
//       ORDER BY e.created_at DESC
//     `);

//     console.log(`📊 DATABASE: Found ${results.length} enrollment records`);
    
//     results.forEach((record, index) => {
//       console.log(`   ${index + 1}.`, {
//         id: record.id,
//         student: `${record.student_name} (${record.student_email})`,
//         course: record.course_title,
//         payment: record.payment_status,
//         approval: record.approval_status,
//         created: record.created_at
//       });
//     });

//     res.json({
//       success: true,
//       count: results.length,
//       enrollments: results,
//       message: `Found ${results.length} enrollment records in database`
//     });

//   } catch (error) {
//     console.error("❌ Database debug error:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

// export default router;





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
  debugFull,
  testCreateEnrollment,
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
router.get("/debug-full", debugFull);
router.post("/test-enrollment", testCreateEnrollment);

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
        created: record.created_at
      });
    });

    res.json({
      success: true,
      count: results.length,
      enrollments: results,
      message: `Found ${results.length} enrollment records in database`
    });

  } catch (error) {
    console.error("❌ Database debug error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ====================
// NEW DEBUG ROUTES - ADD THESE
// ====================

// Debug route to check paid enrollments specifically
router.get("/debug-payments", async (req, res) => {
  try {
    console.log("💰 DEBUG: Checking payment enrollments...");
    
    // Check all enrollments with payment_status = 'paid'
    const [paidEnrollments] = await db.sequelize.query(`
      SELECT 
        e.id,
        e.user_id,
        u.name as student_name,
        u.email as student_email,
        u.approval_status as user_approval_status,
        e.course_id,
        c.title as course_title,
        e.payment_status,
        e.approval_status,
        e.created_at,
        e.updated_at
      FROM enrollments e
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN courses c ON e.course_id = c.id
      WHERE e.payment_status = 'paid'
      ORDER BY e.created_at DESC
    `);

    console.log(`💰 Found ${paidEnrollments.length} paid enrollments`);
    
    paidEnrollments.forEach((enrollment, index) => {
      console.log(`   ${index + 1}.`, {
        id: enrollment.id,
        student: `${enrollment.student_name} (${enrollment.student_email})`,
        user_status: enrollment.user_approval_status,
        course: enrollment.course_title,
        payment: enrollment.payment_status,
        approval: enrollment.approval_status,
        created: enrollment.created_at
      });
    });

    res.json({
      success: true,
      paidEnrollments: paidEnrollments,
      count: paidEnrollments.length,
      message: `Found ${paidEnrollments.length} paid enrollments in database`
    });

  } catch (error) {
    console.error("❌ Payment debug error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Test the enrollment filter logic
router.get("/test-enrollment-filter", async (req, res) => {
  try {
    const { status } = req.query;
    console.log("🎯 TEST: Testing enrollment filter with status:", status);
    
    let whereCondition = {};
    
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      whereCondition.approval_status = status;
    }
    
    // Only show paid enrollments
    whereCondition.payment_status = "paid";
    
    console.log("🎯 TEST WHERE condition:", JSON.stringify(whereCondition, null, 2));

    const enrollments = await db.Enrollment.findAll({
      where: whereCondition,
      include: [
        {
          model: db.User,
          as: "student",
          attributes: ["id", "name", "email"],
        },
        {
          model: db.Course,
          as: "course",
          attributes: ["id", "title", "price"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    console.log(`📊 TEST: Found ${enrollments.length} enrollments matching filter`);
    
    enrollments.forEach((enrollment, index) => {
      console.log(`   ${index + 1}. Enrollment ${enrollment.id}:`, {
        student: enrollment.student?.email,
        course: enrollment.course?.title,
        payment_status: enrollment.payment_status,
        approval_status: enrollment.approval_status,
        created: enrollment.createdAt
      });
    });

    res.json({
      success: true,
      count: enrollments.length,
      whereCondition: whereCondition,
      enrollments: enrollments.map(e => ({
        id: e.id,
        student: e.student?.email,
        course: e.course?.title,
        payment_status: e.payment_status,
        approval_status: e.approval_status,
        created: e.createdAt
      }))
    });
    
  } catch (err) {
    console.error("❌ Test filter error:", err);
    res.status(500).json({ error: "Failed to test enrollment filter" });
  }
});

// Test route to simulate payment enrollment creation
router.post("/test-payment-enrollment", async (req, res) => {
  try {
    const { user_id, course_id } = req.body;
    
    if (!user_id || !course_id) {
      return res.status(400).json({ error: "Missing user_id or course_id" });
    }

    console.log("🧪 PAYMENT TEST: Creating payment enrollment:", { user_id, course_id });

    const user = await db.User.findByPk(user_id);
    const course = await db.Course.findByPk(course_id);

    if (!user) return res.status(404).json({ error: "User not found" });
    if (!course) return res.status(404).json({ error: "Course not found" });

    console.log("✅ Found user:", user.email, "course:", course.title);

    // Create test payment enrollment (simulating Stripe webhook)
    const enrollment = await db.Enrollment.create({
      user_id: user_id,
      course_id: course_id,
      payment_status: "paid",
      approval_status: "pending",
    });

    console.log("✅ Payment enrollment created:", enrollment.id);

    res.json({
      success: true,
      message: "Payment enrollment created successfully",
      enrollment: {
        id: enrollment.id,
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        payment_status: enrollment.payment_status,
        approval_status: enrollment.approval_status,
        student: user.email,
        course: course.title
      }
    });

  } catch (error) {
    console.error("❌ Payment enrollment test error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;