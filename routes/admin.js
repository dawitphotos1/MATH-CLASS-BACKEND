const express = require("express");
const { UserCourseAccess, User, Course } = require("../models");
const router = express.Router();

// GET /api/v1/admin/enrollments/pending
router.get("/enrollments/pending", async (req, res) => {
  try {
    const pendingEnrollments = await UserCourseAccess.findAll({
      where: { approved: false },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        { model: Course, as: "course", attributes: ["id", "title"] },
      ],
      order: [["accessGrantedAt", "DESC"]],
    });

    res.json(pendingEnrollments);
  } catch (error) {
    console.error("❌ Error fetching pending enrollments:", error);
    res.status(500).json({ error: "Failed to fetch pending enrollments" });
  }
});

// GET /api/v1/admin/enrollments/approved
router.get("/enrollments/approved", async (req, res) => {
  try {
    const approvedEnrollments = await UserCourseAccess.findAll({
      where: { approved: true },
      include: [
        { model: User, as: "user", attributes: ["id", "name", "email"] },
        { model: Course, as: "course", attributes: ["id", "title"] },
      ],
    });

    res.json(approvedEnrollments);
  } catch (error) {
    console.error("❌ Error fetching approved enrollments:", error);
    res.status(500).json({ error: "Failed to fetch approved enrollments" });
  }
});

// POST /api/v1/admin/enrollments/approve
router.post("/enrollments/approve", async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    const enrollment = await UserCourseAccess.findOne({
      where: { userId, courseId },
    });

    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    enrollment.approved = true;
    await enrollment.save();

    res.json({ success: true, message: "Enrollment approved" });
  } catch (error) {
    console.error("❌ Error approving enrollment:", error);
    res.status(500).json({ error: "Failed to approve enrollment" });
  }
});

module.exports = router;
