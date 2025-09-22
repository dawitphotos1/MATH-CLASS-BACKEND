
// // routes/admin.js
// import express from "express";
// import {
//   login,
//   getPendingUsers,
//   updateUserApproval,
//   getEnrollments,
// } from "../controllers/adminController.js";
// import { authenticateToken } from "../middleware/authMiddleware.js";
// import validateRequest from "../middleware/validateRequest.js";
// import { updateUserApprovalValidation } from "../validators/adminValidator.js";

// const router = express.Router();

// // 🔹 Admin Login
// router.post("/login", login);

// // 🔹 Get all users pending approval
// router.get("/pending-users", authenticateToken, getPendingUsers);

// // 🔹 Update a user’s approval status
// router.patch(
//   "/users/:userId/approval",
//   updateUserApprovalValidation,
//   validateRequest,
//   authenticateToken,
//   updateUserApproval
// );

// // 🔹 View all enrollments
// router.get("/enrollments", authenticateToken, getEnrollments);

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

// 🔐 Protect all admin routes
router.use(authenticateToken, isAdmin);

// Get pending users
router.get("/pending-users", getPendingUsers);

// Update user approval (approve/reject)
router.patch("/users/:userId/approval", updateUserApproval);

// Get enrollments (filter by ?status=pending/approved/rejected)
router.get("/enrollments", getEnrollments);

// Approve an enrollment
router.put("/enrollments/:enrollmentId/approve", approveEnrollment);

export default router;
