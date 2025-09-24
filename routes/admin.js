
// // routes/admin.js
// import express from "express";
// import {
//   getPendingUsers,
//   updateUserApproval,
//   getEnrollments,
//   approveEnrollment,
// } from "../controllers/adminController.js";
// import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // 🔐 Protect all admin routes
// router.use(authenticateToken, isAdmin);

// // Get pending users
// router.get("/pending-users", getPendingUsers);

// // Update user approval (approve/reject)
// router.patch("/users/:userId/approval", updateUserApproval);

// // Get enrollments (filter by ?status=pending/approved/rejected)
// router.get("/enrollments", getEnrollments);

// // Approve an enrollment
// router.put("/enrollments/:enrollmentId/approve", approveEnrollment);

// export default router;





// routes/admin.js
import express from "express";
import {
  getPendingUsers,
  updateUserApproval,
  getEnrollments,
  approveEnrollment,
} from "../controllers/adminController.js";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Debug log for admin routes (helps in development)
router.use((req, res, next) => {
  console.log(`🔐 Admin route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

// 🔐 Protect all admin routes
router.use(authenticateToken, isAdmin);

// ====================
// Admin API Endpoints
// ====================

// Get pending users
router.get("/pending-users", getPendingUsers);

// Update user approval (approve/reject)
router.patch("/users/:userId/approval", updateUserApproval);

// Get enrollments (filter by ?status=pending/approved/rejected)
router.get("/enrollments", getEnrollments);

// Approve an enrollment
router.put("/enrollments/:enrollmentId/approve", approveEnrollment);

export default router;
