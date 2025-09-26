// const { Lesson, Course } = require("../models");
// const path = require("path");
// const fs = require("fs");

// // ✅ Ensure Uploads directory exists
// const uploadsDir = path.join(__dirname, "..", "Uploads");
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
//   console.log("📁 Uploads directory created");
// }

// // ✅ Get all lessons by courseId (grouped by units)
// const getLessonsByCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;

//     const lessons = await Lesson.findAll({
//       where: { courseId },
//       order: [["orderIndex", "ASC"]],
//     });

//     const units = lessons
//       .filter((l) => l.isUnitHeader)
//       .map((unit) => ({
//         id: unit.id,
//         title: unit.title,
//         unitName: unit.title,
//         lessons: lessons.filter((l) => l.unitId === unit.id),
//       }));

//     const ungroupedLessons = lessons.filter(
//       (l) => !l.isUnitHeader && !l.unitId
//     );

//     if (ungroupedLessons.length > 0) {
//       units.unshift({
//         id: null,
//         title: "Ungrouped",
//         unitName: "Ungrouped",
//         lessons: ungroupedLessons,
//       });
//     }

//     // ✅ Fixed return format
//     res.json({ units });
//   } catch (error) {
//     console.error("❌ getLessonsByCourse error:", error);
//     res.status(500).json({ error: "Failed to fetch lessons" });
//   }
// };

// // ✅ Get units for a course
// const getUnitsByCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const units = await Lesson.findAll({
//       where: { courseId, isUnitHeader: true },
//       attributes: ["id", "title"],
//     });

//     res.json({ success: true, units });
//   } catch (error) {
//     console.error("❌ getUnitsByCourse error:", error);
//     res.status(500).json({ error: "Failed to fetch units" });
//   }
// };

// // ✅ Get a specific lesson by ID
// const getLessonById = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     const lesson = await Lesson.findByPk(lessonId);
//     if (!lesson) return res.status(404).json({ error: "Lesson not found" });

//     res.json({ success: true, lesson });
//   } catch (error) {
//     console.error("❌ getLessonById error:", error);
//     res.status(500).json({ error: "Failed to fetch lesson" });
//   }
// };

// // ✅ Create a new lesson
// const createLesson = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const {
//       title,
//       content = "",
//       contentType = "text",
//       videoUrl = "",
//       isUnitHeader = false,
//       isPreview = false,
//       orderIndex = 0,
//       unitId = null,
//     } = req.body;

//     if (!title || !courseId) {
//       return res.status(400).json({ error: "Missing title or courseId" });
//     }

//     let contentUrl = null;

//     if (contentType === "file" && req.file) {
//       const filename = `${Date.now()}-${req.file.originalname.replace(
//         /\s+/g,
//         "_"
//       )}`;
//       const uploadPath = path.join(uploadsDir, filename);
//       fs.writeFileSync(uploadPath, req.file.buffer);
//       contentUrl = `/Uploads/${filename}`;
//     }

//     const newLesson = await Lesson.create({
//       courseId,
//       title,
//       contentType,
//       content: content || null,
//       videoUrl: videoUrl || null,
//       contentUrl,
//       isUnitHeader: isUnitHeader === "true" || isUnitHeader === true,
//       isPreview: isPreview === "true" || isPreview === true,
//       orderIndex: parseInt(orderIndex, 10) || 0,
//       unitId: unitId || null,
//       userId: req.user.id,
//     });

//     res.status(201).json({ success: true, lesson: newLesson });
//   } catch (error) {
//     console.error("❌ createLesson error:", error);
//     res.status(500).json({ error: "Failed to create lesson" });
//   }
// };

// // ✅ Update lesson
// const updateLesson = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     const lesson = await Lesson.findByPk(lessonId);
//     if (!lesson) return res.status(404).json({ error: "Lesson not found" });

//     await lesson.update(req.body);
//     res.json({ success: true, lesson });
//   } catch (error) {
//     console.error("❌ updateLesson error:", error);
//     res.status(500).json({ error: "Failed to update lesson" });
//   }
// };

// // ✅ Delete lesson
// const deleteLesson = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     const lesson = await Lesson.findByPk(lessonId);
//     if (!lesson) return res.status(404).json({ error: "Lesson not found" });

//     const course = await Course.findByPk(lesson.courseId);
//     if (!course)
//       return res.status(404).json({ error: "Related course not found" });

//     if (course.teacherId !== req.user.id) {
//       return res.status(403).json({ error: "Unauthorized" });
//     }

//     await lesson.destroy();
//     res.json({ success: true, message: "Lesson deleted successfully" });
//   } catch (error) {
//     console.error("❌ deleteLesson error:", error);
//     res.status(500).json({ error: "Failed to delete lesson" });
//   }
// };

// // ✅ Toggle preview
// const toggleLessonPreview = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     const lesson = await Lesson.findByPk(lessonId);
//     if (!lesson) return res.status(404).json({ error: "Lesson not found" });

//     lesson.isPreview = !lesson.isPreview;
//     await lesson.save();
//     res.json({ success: true, isPreview: lesson.isPreview });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to toggle preview" });
//   }
// };

// // ✅ Track lesson view
// const trackLessonView = async (req, res) => {
//   try {
//     console.log(`📊 Tracking view for lesson ${req.params.lessonId}`);
//     res.json({ success: true, message: "View tracked" });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to track view" });
//   }
// };

// module.exports = {
//   getLessonsByCourse,
//   getUnitsByCourse,
//   getLessonById, // ✅ <-- added here
//   createLesson,
//   updateLesson,
//   deleteLesson,
//   toggleLessonPreview,
//   trackLessonView,
// };





// controllers/lessonController.js
import db from "../models/index.js";

const { Lesson, Course } = db;

// ====================
// Create Lesson
// ====================
export const createLesson = async (req, res) => {
  try {
    const { courseId, title, content, contentType } = req.body;

    if (!courseId || !title) {
      return res.status(400).json({ error: "Course ID and title required" });
    }

    const lesson = await Lesson.create({
      courseId,
      title,
      content,
      contentType,
    });

    res.status(201).json({ success: true, lesson });
  } catch (err) {
    console.error("❌ createLesson error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ====================
// Get Lessons by Course
// ====================
export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const lessons = await Lesson.findAll({
      where: { courseId },
      order: [["createdAt", "ASC"]],
    });

    res.json({ success: true, lessons });
  } catch (err) {
    console.error("❌ getLessonsByCourse error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ====================
// Get Single Lesson
// ====================
export const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findByPk(id);
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    res.json({ success: true, lesson });
  } catch (err) {
    console.error("❌ getLessonById error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ====================
// Update Lesson
// ====================
export const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, contentType } = req.body;

    const lesson = await Lesson.findByPk(id);
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    lesson.title = title || lesson.title;
    lesson.content = content || lesson.content;
    lesson.contentType = contentType || lesson.contentType;
    await lesson.save();

    res.json({ success: true, lesson });
  } catch (err) {
    console.error("❌ updateLesson error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ====================
// Delete Lesson
// ====================
export const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findByPk(id);
    if (!lesson) return res.status(404).json({ error: "Lesson not found" });

    await lesson.destroy();
    res.json({ success: true, message: "Lesson deleted" });
  } catch (err) {
    console.error("❌ deleteLesson error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
