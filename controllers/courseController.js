// // controllers/courseController.js
// import { Course } from "../models/index.js";

// // Create a new course
// export const createCourse = async (req, res) => {
//   try {
//     const { title, slug, description, teacher_id, price } = req.body;

//     // Use req.user.id as teacher_id if you want only logged-in teacher to create their own courses
//     const teacherId = req.user?.id || teacher_id;

//     const course = await Course.create({
//       title,
//       slug,
//       description,
//       teacher_id: teacherId,
//       price,
//     });

//     res.status(201).json(course);
//   } catch (error) {
//     console.error("Error creating course:", error);
//     res.status(500).json({ message: "Failed to create course" });
//   }
// };

// // Get all courses (example implementation)
// export const getCourses = async (req, res) => {
//   try {
//     const courses = await Course.findAll();
//     res.json(courses);
//   } catch (error) {
//     console.error("Error fetching courses:", error);
//     res.status(500).json({ message: "Failed to fetch courses" });
//   }
// };

// // Get public course by slug (example implementation)
// export const getPublicCourseBySlug = async (req, res) => {
//   try {
//     const { slug } = req.params;
//     const course = await Course.findOne({ where: { slug } });

//     if (!course) {
//       return res.status(404).json({ message: "Course not found" });
//     }

//     res.json(course);
//   } catch (error) {
//     console.error("Error fetching course by slug:", error);
//     res.status(500).json({ message: "Failed to fetch course" });
//   }
// };

// // Get lessons by course (stub example, adjust to your lesson model)
// export const getLessonsByCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     // Assuming you have a Lesson model and relation set up
//     // const lessons = await Lesson.findAll({ where: { course_id: courseId } });
//     // For now just send a placeholder response
//     res.json({ message: `Lessons for course ${courseId}` });
//   } catch (error) {
//     console.error("Error fetching lessons:", error);
//     res.status(500).json({ message: "Failed to fetch lessons" });
//   }
// };

// // Delete course (your original code)
// export const deleteCourse = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const course = await Course.findByPk(id);
//     if (!course) {
//       return res.status(404).json({ message: "Course not found" });
//     }

//     if (req.user.role !== "admin" && course.teacher_id !== req.user.id) {
//       return res.status(403).json({ message: "Not authorized to delete this course" });
//     }

//     await course.destroy(); // ✅ lessons + attachments auto-deleted

//     res.json({ message: "Course and all related data deleted successfully" });
//   } catch (error) {
//     console.error("Error deleting course:", error);
//     res.status(500).json({ message: "Failed to delete course" });
//   }
// };




// controllers/courseController.js
import db from "../models/index.js";

const { Course, Lesson, User } = db;

// Create a new course
export const createCourse = async (req, res) => {
  try {
    const { title, slug, description, teacher_id, price } = req.body;

    // Force teacher_id from logged-in teacher
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
    console.error("Error creating course:", error);
    res.status(500).json({ message: "Failed to create course" });
  }
};

// Get all courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["id", "ASC"]],
    });
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

// Get public course by slug
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
    console.error("Error fetching course by slug:", error);
    res.status(500).json({ message: "Failed to fetch course" });
  }
};

// Get lessons by course
export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.findAll({
      where: { course_id: courseId },
      order: [["order_index", "ASC"]],
    });
    res.json(lessons);
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({ message: "Failed to fetch lessons" });
  }
};

// Delete course
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (req.user.role !== "admin" && course.teacher_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this course" });
    }

    await course.destroy(); // ✅ cascades to lessons + attachments

    res.json({ message: "Course and related data deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Failed to delete course" });
  }
};
