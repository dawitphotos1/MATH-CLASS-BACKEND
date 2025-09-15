
const express = require("express");
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  updateUserApprovalValidation,
} = require("../validators/adminValidator");

const router = express.Router();

router.post("/login", adminController.login);
router.get("/pending-users", authMiddleware, adminController.getPendingUsers);
router.patch(
  "/users/:userId/approval",
  updateUserApprovalValidation,
  validateRequest,
  authMiddleware,
  adminController.updateUserApproval
);
router.get("/enrollments", authMiddleware, adminController.getEnrollments);

module.exports = router;
