const express = require("express");
const router = express.Router();
const { User } = require("../models");
const { authMiddleware, adminOnly } = require("../middleware/auth");

// ================================
// Get all pending students
// ================================
router.get("/pending-students", authMiddleware, adminOnly, async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role: "student", approval_status: "pending" },
      attributes: ["id", "name", "email", "subject", "createdAt"],
    });
    return res.json(students);
  } catch (err) {
    console.error("❌ Fetch pending students error:", err);
    return res.status(500).json({ error: "Failed to fetch pending students" });
  }
});

// ================================
// Approve student
// ================================
router.patch("/approve/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const student = await User.findByPk(req.params.id);
    if (!student || student.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }
    student.approval_status = "approved";
    await student.save();
    return res.json({ message: "Student approved", student });
  } catch (err) {
    console.error("❌ Approve student error:", err);
    return res.status(500).json({ error: "Failed to approve student" });
  }
});

// ================================
// Reject student
// ================================
router.patch("/reject/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const student = await User.findByPk(req.params.id);
    if (!student || student.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }
    student.approval_status = "rejected";
    await student.save();
    return res.json({ message: "Student rejected", student });
  } catch (err) {
    console.error("❌ Reject student error:", err);
    return res.status(500).json({ error: "Failed to reject student" });
  }
});

module.exports = router;
