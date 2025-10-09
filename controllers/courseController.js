
// controllers/paymentController.js
import db from "../models/index.js";

const { Course, Lesson, User } = db;

/* ============================================================
   ✅ Get course by ID
   ============================================================ */
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 Fetching course by ID:", id);

    const course = await Course.findByPk(id, {
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!course) {
      console.log("❌ Course not found for ID:", id);
      return res.status(404).json({ message: "Course not found" });
    }

    console.log("✅ Course found:", course.title);
    res.json(course);
  } catch (error) {
    console.error("❌ Error fetching course by ID:", error);
    res.status(500).json({ message: "Failed to fetch course" });
  }
};

/* ============================================================
   ✅ Create a new course
   ============================================================ */
export const createCourse = async (req, res) => {
  try {
    const { title, slug, description, teacher_id, price } = req.body;
    const teacherId = req.user?.id || teacher_id;

    const course = await Course.create({
      title,
      slug,
      description,
      teacher_id: teacherId,
      price,
    });

    res.status(201).json(course);
  } catch (error) {
    console.error("❌ Error creating course:", error);
    res.status(500).json({ message: "Failed to create course" });
  }
};

/* ============================================================
   ✅ Get all courses
   ============================================================ */
export const getCourses = async (req, res) => {
  try {
    console.log("🔍 Fetching all courses...");

    const courses = await Course.findAll({
      attributes: [
        "id",
        "title",
        "slug",
        "description",
        "teacher_id",
        "price",
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["id", "ASC"]],
    });

    console.log(`✅ Found ${courses.length} courses`);
    res.json(courses);
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    res.status(500).json({
      message: "Failed to fetch courses",
      error:
        process.env.NODE_ENV === "production"
          ? "Database error"
          : error.message,
    });
  }
};

/* ============================================================
   ✅ Get public course by slug (with lessons)
   ============================================================ */
export const getPublicCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({
      where: { slug },
      include: [
        {
          model: Lesson,
          as: "lessons",
          order: [["order_index", "ASC"]],
        },
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (error) {
    console.error("❌ Error fetching course by slug:", error);
    res.status(500).json({ message: "Failed to fetch course" });
  }
};

/* ============================================================
   ✅ Get lessons for a specific course
   ============================================================ */
export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const lessons = await Lesson.findAll({
      where: { course_id: courseId },
      order: [["order_index", "ASC"]],
    });

    res.json(lessons);
  } catch (error) {
    console.error("❌ Error fetching lessons:", error);
    res.status(500).json({ message: "Failed to fetch lessons" });
  }
};

/* ============================================================
   ✅ Delete course
   ============================================================ */
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (req.user.role !== "admin" && course.teacher_id !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this course" });
    }

    await course.destroy();
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting course:", error);
    res.status(500).json({ message: "Failed to delete course" });
  }
};
