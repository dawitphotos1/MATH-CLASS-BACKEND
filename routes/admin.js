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
import db from "../models/index.js"; // Import db for debug route

const router = express.Router();

// ✅ Debug log for admin routes (helps in development)
router.use((req, res, next) => {
  console.log(`🔐 Admin route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

// 🔐 Protect all admin routes
router.use(authenticateToken, isAdmin);

// ====================
// Student Management
// ====================

// Get students by status (pending/approved/rejected)
router.get("/students", getStudentsByStatus);

// Approve a student
router.patch("/students/:id/approve", approveStudent);

// Reject a student  
router.patch("/students/:id/reject", rejectStudent);

// ====================
// Enrollment Management
// ====================

// Get enrollments by status (pending/approved/rejected)
router.get("/enrollments", getEnrollmentsByStatus);

// Approve an enrollment
router.patch("/enrollments/:id/approve", approveEnrollment);

// Reject an enrollment
router.patch("/enrollments/:id/reject", rejectEnrollment);

// ====================
// Debug Routes (Temporary)
// ====================

// Debug route to check current data
router.get("/debug-data", async (req, res) => {
  try {
    // Check enrollments
    const enrollments = await db.Enrollment.findAll({
      include: [
        { 
          model: db.User, 
          as: "student",
          attributes: ["id", "name", "email"]
        },
        { 
          model: db.Course, 
          as: "course",
          attributes: ["id", "title", "price"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    // Check user course access
    const userCourseAccess = await db.UserCourseAccess.findAll({
      include: [
        { model: db.User, attributes: ["id", "name", "email"] },
        { model: db.Course, attributes: ["id", "title", "price"] }
      ],
      order: [["createdAt", "DESC"]]
    });

    res.json({
      enrollments: {
        count: enrollments.length,
        data: enrollments
      },
      userCourseAccess: {
        count: userCourseAccess.length,
        data: userCourseAccess
      }
    });
  } catch (error) {
    console.error("Debug route error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;