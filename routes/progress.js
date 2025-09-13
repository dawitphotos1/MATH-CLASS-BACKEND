const express = require("express");
const router = express.Router();
const { UserCourseAccess, Lesson } = require("../models");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await UserCourseAccess.findAll({
      where: { userId },
      include: [
        {
          model: Lesson,
          as: "Lessons",
          attributes: ["id", "title", "courseId"],
        },
      ],
    });

    let completedLessons = 0;
    let totalLessons = 0;
    let currentCourse = null;

    for (const enrollment of enrollments) {
      const courseLessons = enrollment.Lessons || [];
      totalLessons += courseLessons.length;
      completedLessons += courseLessons.length; // Placeholder: assumes all lessons are completed

      if (!currentCourse && courseLessons.length > 0) {
        currentCourse = enrollment.courseId;
      }
    }

    const completionPercentage = totalLessons
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    res.json({
      completedLessons: completedLessons || 0,
      currentCourse: currentCourse || "No active course",
      completionPercentage: completionPercentage || 0,
    });
  } catch (err) {
    console.error("Progress fetch error:", err);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

module.exports = router;
