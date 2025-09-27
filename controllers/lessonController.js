
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
