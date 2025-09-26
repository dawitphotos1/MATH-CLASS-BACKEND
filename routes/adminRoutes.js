// const express = require("express");
// const router = express.Router();
// const { User } = require("../models");
// const { authMiddleware, adminOnly } = require("../middleware/auth");

// // ================================
// // 📋 Get all pending students
// // ================================
// router.get("/pending-students", authMiddleware, adminOnly, async (req, res) => {
//   try {
//     const students = await User.findAll({
//       where: { role: "student", approval_status: "pending" },
//       attributes: ["id", "name", "email", "subject", "createdAt"],
//     });
//     return res.json(students);
//   } catch (err) {
//     console.error("❌ Fetch pending students error:", err);
//     return res.status(500).json({ error: "Failed to fetch pending students" });
//   }
// });

// // ================================
// // ✅ Approve student
// // ================================
// router.patch("/approve/:id", authMiddleware, adminOnly, async (req, res) => {
//   try {
//     const student = await User.findByPk(req.params.id);
//     if (!student || student.role !== "student") {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     student.approval_status = "approved";
//     await student.save();

//     return res.json({
//       message: "Student approved successfully",
//       student,
//     });
//   } catch (err) {
//     console.error("❌ Approve student error:", err);
//     return res.status(500).json({ error: "Failed to approve student" });
//   }
// });

// // ================================
// // ❌ Reject student
// // ================================
// router.patch("/reject/:id", authMiddleware, adminOnly, async (req, res) => {
//   try {
//     const student = await User.findByPk(req.params.id);
//     if (!student || student.role !== "student") {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     student.approval_status = "rejected";
//     await student.save();

//     return res.json({
//       message: "Student rejected successfully",
//       student,
//     });
//   } catch (err) {
//     console.error("❌ Reject student error:", err);
//     return res.status(500).json({ error: "Failed to reject student" });
//   }
// });

// module.exports = router;





// routes/adminRoutes.js
import express from "express";
import {
  getPendingUsers,
  updateUserApproval,
  getEnrollments,
  approveEnrollment,
} from "../controllers/adminController.js";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Pending student list shown in Admin Dashboard
// Frontend calls: GET /api/v1/admin/pending-users
router.get("/pending-users", authenticateToken, isAdmin, getPendingUsers);

// Approve/reject user
// Frontend calls: PATCH /api/v1/admin/users/:id/approval  with { status: "approved" }
router.patch("/users/:id/approval", authenticateToken, isAdmin, updateUserApproval);

// Enrollments listing
// Frontend calls: GET /api/v1/admin/enrollments?status=pending
router.get("/enrollments", authenticateToken, isAdmin, getEnrollments);

// Approve a pending enrollment
// Frontend calls: PUT /api/v1/admin/enrollments/:id/approve
router.put("/enrollments/:id/approve", authenticateToken, isAdmin, approveEnrollment);

export default router;
