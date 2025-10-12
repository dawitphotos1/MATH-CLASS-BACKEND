// // routes/admin.js
// import express from "express";
// import {
//   getStudentsByStatus,
//   approveStudent,
//   rejectStudent,
//   getEnrollmentsByStatus,
//   approveEnrollment,
//   rejectEnrollment,
// } from "../controllers/adminController.js";
// import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // ✅ Debug log for admin routes (helps in development)
// router.use((req, res, next) => {
//   console.log(`🔐 Admin route accessed: ${req.method} ${req.originalUrl}`);
//   next();
// });

// // 🔐 Protect all admin routes
// router.use(authenticateToken, isAdmin);

// // ====================
// // Student Management
// // ====================

// // Get students by status (pending/approved/rejected)
// router.get("/students", getStudentsByStatus);

// // Approve a student
// router.patch("/students/:id/approve", approveStudent);

// // Reject a student  
// router.patch("/students/:id/reject", rejectStudent);

// // ====================
// // Enrollment Management
// // ====================

// // Get enrollments by status (pending/approved/rejected)
// router.get("/enrollments", getEnrollmentsByStatus);

// // Approve an enrollment
// router.patch("/enrollments/:id/approve", approveEnrollment);

// // Reject an enrollment
// router.patch("/enrollments/:id/reject", rejectEnrollment);

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

// Enhanced debug route
router.get("/debug-enrollments", async (req, res) => {
  try {
    console.log("🔍 Checking database for enrollments...");
    
    const allEnrollments = await db.Enrollment.findAll({
      include: [
        { 
          model: db.User, 
          as: "student",
          attributes: ["id", "name", "email", "role"]
        },
        { 
          model: db.Course, 
          as: "course",
          attributes: ["id", "title", "price"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    const allUserCourseAccess = await db.UserCourseAccess.findAll({
      include: [
        { model: db.User, attributes: ["id", "name", "email", "role"] },
        { model: db.Course, attributes: ["id", "title", "price"] }
      ],
      order: [["createdAt", "DESC"]]
    });

    console.log("📊 Database Results:");
    console.log("- Enrollments count:", allEnrollments.length);
    console.log("- UserCourseAccess count:", allUserCourseAccess.length);
    
    allEnrollments.forEach(enrollment => {
      console.log(`🎯 Enrollment: ${enrollment.id}`, {
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        payment_status: enrollment.payment_status,
        approval_status: enrollment.approval_status,
        student: enrollment.student?.email,
        course: enrollment.course?.title
      });
    });

    res.json({
      enrollments: {
        count: allEnrollments.length,
        data: allEnrollments
      },
      userCourseAccess: {
        count: allUserCourseAccess.length,
        data: allUserCourseAccess
      }
    });
  } catch (error) {
    console.error("❌ Debug route error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Manual enrollment test route
router.post("/test-create-enrollment", async (req, res) => {
  try {
    const { user_id, course_id } = req.body;
    
    if (!user_id || !course_id) {
      return res.status(400).json({ error: "Missing user_id or course_id" });
    }

    console.log("🧪 Manual enrollment test:", { user_id, course_id });

    const user = await db.User.findByPk(user_id);
    const course = await db.Course.findByPk(course_id);

    if (!user) return res.status(404).json({ error: "User not found" });
    if (!course) return res.status(404).json({ error: "Course not found" });

    console.log("✅ Found user:", user.email, "course:", course.title);

    const enrollment = await db.Enrollment.create({
      user_id: user_id,
      course_id: course_id,
      payment_status: "paid",
      approval_status: "approved",
      enrollment_date: new Date()
    });

    console.log("✅ Manual enrollment created:", enrollment.id);

    res.json({
      success: true,
      message: "Manual enrollment created successfully",
      enrollment
    });

  } catch (error) {
    console.error("❌ Manual enrollment error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;