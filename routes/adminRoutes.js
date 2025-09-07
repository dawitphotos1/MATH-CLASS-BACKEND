// routes/adminRoutes.js
const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getPendingUsers,
  getApprovedOrRejectedUsers,
  getEnrollments,
  approveUser,
  rejectUser,
} = require("../controllers/adminController");

const {
  approveEnrollment,
  rejectEnrollment,
} = require("../controllers/enrollmentController");

const { authMiddleware, checkTeacherOrAdmin } = require("../middleware/auth");

// ✅ Protect all admin routes
router.use(authMiddleware, checkTeacherOrAdmin);

// =========================
// 📊 Dashboard
// =========================
router.get("/dashboard", getDashboardStats);

// =========================
// 👤 User Management
// =========================
router.get("/pending-users", getPendingUsers);
router.get("/users", getApprovedOrRejectedUsers);
router.patch("/approve/:id", approveUser);
router.patch("/reject/:id", rejectUser);

// =========================
// 📘 Enrollment Management
// =========================
router.get("/enrollments", getEnrollments); // ✅ expects ?status=pending or ?status=approved
router.put("/enrollments/:id/approve", approveEnrollment);
router.delete("/enrollments/:id/reject", rejectEnrollment);

module.exports = router;
