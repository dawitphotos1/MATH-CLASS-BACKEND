
// routes/adminRoutes.js
import express from "express";
import { User, Enrollment, Course } from "../models/index.js";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================================
   📋 Students (pending/approved/rejected)
================================ */
router.get("/students", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const where = { role: "student" };
    if (status) where.approval_status = status;

    const students = await User.findAll({
      where,
      attributes: ["id", "name", "email", "subject", "approval_status", "createdAt", "updatedAt"],
      order: [["createdAt", "DESC"]],
    });

    return res.json({ students });
  } catch (err) {
    console.error("❌ Fetch students error:", err);
    return res.status(500).json({ error: "Failed to fetch students" });
  }
});

router.patch("/students/:id/approve", authenticateToken, isAdmin, async (req, res) => {
  try {
    const student = await User.findByPk(req.params.id);
    if (!student || student.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }
    student.approval_status = "approved";
    await student.save();
    return res.json({ message: "Student approved successfully", student });
  } catch (err) {
    console.error("❌ Approve student error:", err);
    return res.status(500).json({ error: "Failed to approve student" });
  }
});

router.patch("/students/:id/reject", authenticateToken, isAdmin, async (req, res) => {
  try {
    const student = await User.findByPk(req.params.id);
    if (!student || student.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }
    student.approval_status = "rejected";
    await student.save();
    return res.json({ message: "Student rejected successfully", student });
  } catch (err) {
    console.error("❌ Reject student error:", err);
    return res.status(500).json({ error: "Failed to reject student" });
  }
});

/* ================================
   📋 Enrollments (pending/approved/rejected)
================================ */
router.get("/enrollments", authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.approval_status = status;

    const enrollments = await Enrollment.findAll({
      where,
      include: [
        { model: User, as: "student", attributes: ["id", "name", "email"] },
        { model: Course, as: "course", attributes: ["id", "title", "slug"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json({ enrollments });
  } catch (err) {
    console.error("❌ Fetch enrollments error:", err);
    return res.status(500).json({ error: "Failed to fetch enrollments" });
  }
});

router.patch("/enrollments/:id/approve", authenticateToken, isAdmin, async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }
    enrollment.approval_status = "approved";
    await enrollment.save();
    return res.json({ message: "Enrollment approved successfully", enrollment });
  } catch (err) {
    console.error("❌ Approve enrollment error:", err);
    return res.status(500).json({ error: "Failed to approve enrollment" });
  }
});

router.patch("/enrollments/:id/reject", authenticateToken, isAdmin, async (req, res) => {
  try {
    const enrollment = await Enrollment.findByPk(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }
    enrollment.approval_status = "rejected";
    await enrollment.save();
    return res.json({ message: "Enrollment rejected successfully", enrollment });
  } catch (err) {
    console.error("❌ Reject enrollment error:", err);
    return res.status(500).json({ error: "Failed to reject enrollment" });
  }
});

export default router;
