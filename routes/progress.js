const express = require("express");
const router = express.Router();
const { LessonProgress, Lesson, User } = require("../models");
const { authMiddleware } = require("../middleware/auth");

// ✅ POST /api/v1/progress/complete
router.post("/complete", authMiddleware, async (req, res) => {
  try {
    const { lessonId } = req.body;
    const userId = req.user.id;

    if (!lessonId) {
      return res.status(400).json({ error: "lessonId is required" });
    }

    const existing = await LessonProgress.findOne({
      where: { userId, lessonId },
    });

    if (existing) {
      if (existing.completed) {
        return res
          .status(200)
          .json({ success: true, message: "Already completed" });
      }
      existing.completed = true;
      await existing.save();
    } else {
      await LessonProgress.create({ userId, lessonId, completed: true });
    }

    res.json({ success: true, message: "Lesson marked as complete" });
  } catch (err) {
    console.error("Error marking complete:", err);
    res.status(500).json({ error: "Failed to mark lesson complete" });
  }
});

// ✅ GET /api/v1/progress/:courseId
router.get("/:courseId", authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const lessons = await Lesson.findAll({ where: { courseId } });
    const lessonIds = lessons.map((l) => l.id);

    const completed = await LessonProgress.findAll({
      where: {
        userId,
        lessonId: lessonIds,
        completed: true,
      },
      attributes: ["lessonId"],
    });

    const completedLessonIds = completed.map((entry) => entry.lessonId);

    res.json({ success: true, completedLessonIds });
  } catch (err) {
    console.error("Error fetching progress:", err);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

// ✅ GET /api/v1/progress/course/:courseId/user/:userId (admin/teacher only)
router.get(
  "/course/:courseId/user/:userId",
  authMiddleware,
  async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "teacher") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { courseId, userId } = req.params;

      const lessons = await Lesson.findAll({ where: { courseId } });
      const lessonIds = lessons.map((l) => l.id);

      const completed = await LessonProgress.findAll({
        where: {
          userId,
          lessonId: lessonIds,
          completed: true,
        },
      });

      const completedLessonIds = completed.map((c) => c.lessonId);

      res.json({
        success: true,
        studentId: userId,
        courseId,
        totalLessons: lessons.length,
        completedLessons: completedLessonIds.length,
        percentage: (
          (completedLessonIds.length / lessons.length) *
          100
        ).toFixed(1),
        completedLessonIds,
      });
    } catch (err) {
      console.error("Admin progress fetch error:", err);
      res.status(500).json({ error: "Failed to get user progress" });
    }
  }
);

module.exports = router;
