
// controllers/courseController.js
import { Course, Lesson, User } from "../models/index.js";

// ====================
// Create Course
// ====================
export const createCourse = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: "Title is required" });
    }

    const course = await Course.create({
      title,
      description,
      teacherId: req.user.id, // ✅ from auth middleware
    });

    res.status(201).json({ success: true, course });
  } catch (err) {
    console.error("❌ createCourse error:", err);
    res.status(500).json({ success: false, error: "Failed to create course" });
  }
};

// ====================
// Get courses for logged-in teacher
// ====================
export const getCourses = async (req, res) => {
  try {
    const filter = req.user.role === "teacher" ? { teacherId: req.user.id } : {};
    const courses = await Course.findAll({
      where: filter,
      include: [{ model: User, as: "teacher", attributes: ["id", "name", "email"] }],
    });

    res.json({ success: true, courses });
  } catch (err) {
    console.error("❌ getCourses error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch courses" });
  }
};

// ====================
// Get course by slug (public, no lessons)
// ====================
export const getPublicCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const course = await Course.findOne({
      where: { slug },
      attributes: ["id", "title", "description"],
      include: [{ model: User, as: "teacher", attributes: ["id", "name"] }],
    });

    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    res.json({ success: true, course });
  } catch (err) {
    console.error("❌ getPublicCourseBySlug error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch course" });
  }
};

// ====================
// Get lessons by courseId
// ====================
export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const lessons = await Lesson.findAll({ where: { courseId } });

    res.json({ success: true, lessons });
  } catch (err) {
    console.error("❌ getLessonsByCourse error:", err);
    res.status(500).json({ success: false, error: "Failed to fetch lessons" });
  }
};

// ====================
// Delete course
// ====================
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    await course.destroy();
    res.json({ success: true, message: "Course deleted" });
  } catch (err) {
    console.error("❌ deleteCourse error:", err);
    res.status(500).json({ success: false, error: "Failed to delete course" });
  }
};
