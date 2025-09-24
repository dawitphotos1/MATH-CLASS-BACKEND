// const { Lesson, Course, UserCourseAccess, User } = require("../models");
// const path = require("path");
// const fs = require("fs");

// // 1. Create a new course
// exports.createCourse = async (req, res) => {
//   try {
//     const { title, description, price } = req.body;

//     const course = await Course.create({
//       title,
//       description,
//       price,
//       teacherId: req.user.id,
//     });

//     res.status(201).json({ success: true, course });
//   } catch (err) {
//     console.error("🔥 Create course error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to create course",
//       details: err.message,
//     });
//   }
// };

// // 2. Get lessons by course ID (auth required)
// exports.getLessonsByCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;

//     const lessons = await Lesson.findAll({
//       where: { course_id: courseId },
//       order: [["order_index", "ASC"]],
//     });

//     res.json({ success: true, lessons });
//   } catch (err) {
//     console.error("🔥 Get lessons by course error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch lessons",
//       details: err.message,
//     });
//   }
// };

// // 3. Fetch a public course by slug (no lessons, no auth)
// exports.getPublicCourseBySlug = async (req, res) => {
//   try {
//     const { slug } = req.params;

//     const course = await Course.findOne({
//       where: { slug },
//       include: [
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email"],
//         },
//       ],
//       attributes: [
//         "id",
//         "title",
//         "slug",
//         "description",
//         "price",
//         "thumbnailUrl",
//         "introVideoUrl",
//         "attachmentUrls",
//         "teacherId",
//       ],
//     });

//     if (!course)
//       return res
//         .status(404)
//         .json({ success: false, error: "Course not found" });

//     res.json({ success: true, course });
//   } catch (err) {
//     console.error("🔥 Fetch public course error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch course",
//       details: err.message,
//     });
//   }
// };

// // 4. Fetch full course (with lessons) by slug - only if user is enrolled/approved
// exports.getCourseWithLessonsBySlug = async (req, res) => {
//   try {
//     const { slug } = req.params;
//     const userId = req.user?.id;

//     const course = await Course.findOne({
//       where: { slug },
//       include: [
//         {
//           model: Lesson,
//           as: "lessons",
//           order: [["order_index", "ASC"]],
//         },
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email"],
//         },
//       ],
//     });

//     if (!course)
//       return res
//         .status(404)
//         .json({ success: false, error: "Course not found" });

//     const access = await UserCourseAccess.findOne({
//       where: {
//         course_id: course.id,
//         user_id: userId,
//         approval_status: "approved",
//       },
//     });

//     if (!access)
//       return res.status(403).json({ success: false, error: "Access denied" });

//     res.json({ success: true, course });
//   } catch (err) {
//     console.error("🔥 Fetch full course error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch course",
//       details: err.message,
//     });
//   }
// };

// // 5. Delete a course (and its lessons) — only teacher or admin
// exports.deleteCourse = async (req, res) => {
//   try {
//     const courseId = parseInt(req.params.id, 10);
//     const course = await Course.findByPk(courseId);

//     if (!course)
//       return res
//         .status(404)
//         .json({ success: false, error: "Course not found" });

//     if (req.user.role !== "admin" && course.teacherId !== req.user.id) {
//       return res.status(403).json({ success: false, error: "Unauthorized" });
//     }

//     await Lesson.destroy({ where: { course_id: courseId } });
//     await course.destroy();

//     res.json({ success: true, message: "Course and its lessons deleted" });
//   } catch (err) {
//     console.error("🔥 Delete course error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to delete course",
//       details: err.message,
//     });
//   }
// };

// // 6. Rename a course attachment
// exports.renameCourseAttachment = async (req, res) => {
//   try {
//     const { courseId, index } = req.params;
//     const { newName } = req.body;
//     const course = await Course.findByPk(courseId);

//     if (!course)
//       return res
//         .status(404)
//         .json({ success: false, error: "Course not found" });

//     if (req.user.role !== "admin" && req.user.id !== course.teacherId) {
//       return res.status(403).json({ success: false, error: "Unauthorized" });
//     }

//     const attachments = course.attachmentUrls || [];
//     const oldUrl = attachments[+index];
//     if (!oldUrl)
//       return res
//         .status(404)
//         .json({ success: false, error: "Attachment not found" });

//     const oldPath = path.join(__dirname, "..", oldUrl);
//     const ext = path.extname(oldPath);
//     const newFileName = `${Date.now()}-${newName}${ext}`;
//     const newPath = path.join(__dirname, "..", "Uploads", newFileName);
//     const newUrl = `/Uploads/${newFileName}`;

//     if (!fs.existsSync(oldPath))
//       return res.status(404).json({
//         success: false,
//         error: "Attachment file not found",
//       });

//     fs.renameSync(oldPath, newPath);
//     attachments[+index] = newUrl;
//     course.attachmentUrls = attachments;
//     await course.save();

//     res.json({ success: true, updatedUrl: newUrl });
//   } catch (err) {
//     console.error("🔥 Rename attachment error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to rename attachment",
//       details: err.message,
//     });
//   }
// };

// // 7. Delete a course attachment
// exports.deleteCourseAttachment = async (req, res) => {
//   try {
//     const { courseId, index } = req.params;
//     const course = await Course.findByPk(courseId);

//     if (!course)
//       return res
//         .status(404)
//         .json({ success: false, error: "Course not found" });

//     if (req.user.role !== "admin" && req.user.id !== course.teacherId) {
//       return res.status(403).json({ success: false, error: "Unauthorized" });
//     }

//     const attachments = course.attachmentUrls || [];
//     const fileUrl = attachments[+index];
//     if (!fileUrl)
//       return res
//         .status(404)
//         .json({ success: false, error: "Attachment not found" });

//     const filePath = path.join(__dirname, "..", fileUrl);
//     if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

//     attachments.splice(+index, 1);
//     course.attachmentUrls = attachments;
//     await course.save();

//     res.json({ success: true, message: "Attachment deleted" });
//   } catch (err) {
//     console.error("🔥 Delete attachment error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to delete attachment",
//       details: err.message,
//     });
//   }
// };

// // 8. Get courses for a teacher (auth required)
// exports.getTeacherCourses = async (req, res) => {
//   try {
//     const courses = await Course.findAll({
//       where: { teacherId: req.user.id },
//       order: [["createdAt", "DESC"]],
//     });

//     res.json({ success: true, courses });
//   } catch (err) {
//     console.error("🔥 Get teacher courses error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch teacher courses",
//       details: err.message,
//     });
//   }
// };

// // 9. Admin: Get all courses
// exports.getAllCourses = async (req, res) => {
//   try {
//     const courses = await Course.findAll({
//       include: [
//         { model: User, as: "teacher", attributes: ["id", "name", "email"] },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     res.json({ success: true, courses });
//   } catch (err) {
//     console.error("🔥 Get all courses error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch all courses",
//       details: err.message,
//     });
//   }
// };

// // ✅ Aliases for exported function names used in routes
// exports.getCourseBySlug = exports.getPublicCourseBySlug;
// exports.getEnrolledCourseBySlug = exports.getCourseWithLessonsBySlug;
// exports.renameAttachment = exports.renameCourseAttachment;
// exports.deleteAttachment = exports.deleteCourseAttachment;



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
