// // routes/admin.js
// import express from "express";
// import * as adminController from "../controllers/adminController.js"; // ✅ grab all named exports
// import authMiddleware from "../middleware/authMiddleware.js"; // ✅ default export
// import validateRequest from "../middleware/validateRequest.js";
// import { updateUserApprovalValidation } from "../validators/adminValidator.js";

// const router = express.Router();

// // 🔹 Admin Login (optional)
// router.post("/login", adminController.login);

// // 🔹 Get all users pending approval (protected)
// router.get("/pending-users", authMiddleware, adminController.getPendingUsers);

// // 🔹 Update a user’s approval status (protected + validated)
// router.patch(
//   "/users/:userId/approval",
//   updateUserApprovalValidation,
//   validateRequest,
//   authMiddleware,
//   adminController.updateUserApproval
// );

// // 🔹 View all enrollments (protected)
// router.get("/enrollments", authMiddleware, adminController.getEnrollments);

// export default router;



// routes/admin.js
import express from "express";
import {
  login,
  getPendingUsers,
  updateUserApproval,
  getEnrollments,
} from "../controllers/adminController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import { updateUserApprovalValidation } from "../validators/adminValidator.js";

const router = express.Router();

// 🔹 Admin Login
router.post("/login", login);

// 🔹 Get all users pending approval
router.get("/pending-users", authenticateToken, getPendingUsers);

// 🔹 Update a user’s approval status
router.patch(
  "/users/:userId/approval",
  updateUserApprovalValidation,
  validateRequest,
  authenticateToken,
  updateUserApproval
);

// 🔹 View all enrollments
router.get("/enrollments", authenticateToken, getEnrollments);

export default router;
