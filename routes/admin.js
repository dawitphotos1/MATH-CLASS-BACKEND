
// const express = require("express");
// const adminController = require("../controllers/adminController");
// const authMiddleware = require("../middleware/authMiddleware");
// const validateRequest = require("../middleware/validateRequest");
// const {
//   updateUserApprovalValidation,
// } = require("../validators/adminValidator");

// const router = express.Router();

// router.post("/login", adminController.login);
// router.get("/pending-users", authMiddleware, adminController.getPendingUsers);
// router.patch(
//   "/users/:userId/approval",
//   updateUserApprovalValidation,
//   validateRequest,
//   authMiddleware,
//   adminController.updateUserApproval
// );
// router.get("/enrollments", authMiddleware, adminController.getEnrollments);

// module.exports = router;




// routes/admin.js
const express = require("express");
const adminController = require("../controllers/adminController");
const { authenticateToken } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  updateUserApprovalValidation,
} = require("../validators/adminValidator");

const router = express.Router();

// 🔹 Admin Login (optional, depending on your auth strategy)
router.post("/login", adminController.login);

// 🔹 Get all users pending approval (protected)
router.get("/pending-users", authenticateToken, adminController.getPendingUsers);

// 🔹 Update a user’s approval status (protected + validated)
router.patch(
  "/users/:userId/approval",
  updateUserApprovalValidation,
  validateRequest,
  authenticateToken,
  adminController.updateUserApproval
);

// 🔹 View all enrollments (protected)
router.get("/enrollments", authenticateToken, adminController.getEnrollments);

module.exports = router;
