// // routes/courses.js - CORRECTED VERSION
// import express from "express";
// import {
//   createCourse,
//   getCourses,
//   getPublicCourseBySlug,
//   getLessonsByCourse,
//   deleteCourse,
//   getCourseById,
//   createCourseWithUnits,
//   getTeacherCourses,
//   getTeacherCourseFull,
//   updateCourse  // Make sure this is imported
// } from "../controllers/courseController.js";

// import { authenticateToken } from "../middleware/authMiddleware.js";
// import checkTeacherOrAdmin from "../middleware/checkTeacherOrAdmin.js";
// import { isTeacher } from "../middleware/authMiddleware.js";
// import { uploadCourseFiles } from "../middleware/cloudinaryUpload.js";
// import { getPreviewLessonForCourse } from "../controllers/lessonController.js";

// const router = express.Router();

// /* ========================================================
//    🟢 PUBLIC ROUTES — accessible without login
// ======================================================== */

// // Get all courses (public)
// router.get("/", getCourses);

// // Get course by ID (public) - MUST come BEFORE slug route
// router.get("/id/:id", getCourseById);

// // Get all lessons for a course (public)
// router.get("/:courseId/lessons", getLessonsByCourse);

// // PUBLIC: Get first preview lesson for a course
// router.get("/:courseId/preview-lesson", getPreviewLessonForCourse);

// /* ========================================================
//    🔐 PROTECTED ROUTES — teachers / admins only
// ======================================================== */

// // Create new course
// router.post(
//   "/",
//   authenticateToken,
//   checkTeacherOrAdmin,
//   uploadCourseFiles,
//   createCourse
// );

// router.post(
//   "/create",
//   authenticateToken,
//   checkTeacherOrAdmin,
//   uploadCourseFiles,
//   createCourse
// );

// router.post(
//   "/create-with-units",
//   authenticateToken,
//   checkTeacherOrAdmin,
//   uploadCourseFiles,
//   createCourseWithUnits
// );

// // Delete course
// router.delete("/:id", authenticateToken, deleteCourse);

// // Update course (ADD THIS ROUTE)
// router.patch("/:id", authenticateToken, updateCourse);

// // Get course by ID for editing (PROTECTED version)
// router.get("/edit/:id", authenticateToken, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     // Call the existing getCourseById function
//     const courseResponse = await getCourseById({ params: { id } }, res, true);
    
//     if (!courseResponse) {
//       return res.status(404).json({
//         success: false,
//         error: "Course not found",
//       });
//     }

//     // Check authorization
//     if (userRole !== "admin" && courseResponse.teacher_id !== userId) {
//       return res.status(403).json({
//         success: false,
//         error: "Not authorized to edit this course",
//       });
//     }

//     res.json({
//       success: true,
//       course: courseResponse,
//     });
//   } catch (error) {
//     console.error("Error fetching course for editing:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch course for editing",
//     });
//   }
// });

// /* ============================================================
//    👨🏫 TEACHER DASHBOARD ROUTES
// ============================================================ */

// router.get(
//   "/teacher/my-courses-detailed",
//   authenticateToken,
//   isTeacher,
//   async (req, res) => {
//     try {
//       const teacherId = req.user.id;

//       const courses = await Course.findAll({
//         where: { teacher_id: teacherId },
//         attributes: ["id", "title", "description", "slug", "price", "thumbnail", "created_at"],
//         include: [
//           {
//             model: Unit,
//             as: "units",
//             attributes: ["id", "title", "description", "order_index"],
//             include: [
//               {
//                 model: Lesson,
//                 as: "lessons",
//                 attributes: [
//                   "id",
//                   "title",
//                   "content",
//                   "video_url",
//                   "file_url",
//                   "order_index",
//                   "content_type",
//                   "is_preview",
//                   "created_at",
//                 ],
//                 order: [["order_index", "ASC"]],
//               },
//             ],
//             order: [["order_index", "ASC"]],
//           },
//           {
//             model: User,
//             as: "teacher",
//             attributes: ["id", "name", "email"],
//           },
//         ],
//         order: [["created_at", "DESC"]],
//       });

//       res.json({ success: true, courses });
//     } catch (error) {
//       console.error("Error fetching teacher courses:", error);
//       res.status(500).json({ success: false, error: "Failed to fetch courses" });
//     }
//   }
// );

// router.get("/teacher/my-courses", authenticateToken, isTeacher, getTeacherCourses);

// // Teacher course full details
// router.get(
//   "/teacher/:courseId/full",
//   authenticateToken,
//   isTeacher,
//   getTeacherCourseFull
// );

// // ⚠ Slug route MUST be last because it catches all dynamic paths
// router.get("/slug/:slug", getPublicCourseBySlug); // Changed from "/:slug" to "/slug/:slug"

// export default router;




import express from "express";
import {
  createCourse,
  getCourses,
  getPublicCourseBySlug,
  getLessonsByCourse,
  deleteCourse,
  getCourseById,
  createCourseWithUnits,
  getTeacherCourses,
  getTeacherCourseFull,
  updateCourse,
  checkCourseExists,
} from "../controllers/courseController.js";

import {
  authenticateToken,
  requireTeacherOrAdmin,
  requireTeacher,
  requireOwnership,
} from "../middleware/authMiddleware.js";

import { uploadCourseFiles } from "../middleware/cloudinaryUpload.js";
import {
  getPreviewLessonForCourse,
  checkCoursePreviewStatus,
  markLessonAsPreview,
} from "../controllers/lessonController.js";

import db from "../models/index.js";
const { Course, User, Unit, Lesson } = db;

const router = express.Router();

// =========================================================
// PUBLIC ROUTES (No Authentication)
// =========================================================

// Get all courses (public)
router.get("/", getCourses);

// Get course by ID (public)
router.get("/id/:id", getCourseById);

// Get all lessons for a course (public)
router.get("/:courseId/lessons", getLessonsByCourse);

// Get preview lesson for a course (public)
router.get("/:courseId/preview-lesson", getPreviewLessonForCourse);

// Check if course exists by slug
router.get("/check/:slug", checkCourseExists);

// Get course by slug (public) - MUST be last
router.get("/slug/:slug", getPublicCourseBySlug);

// =========================================================
// PROTECTED ROUTES (Require Authentication)
// =========================================================

// Create new course (teacher/admin only)
router.post(
  "/",
  authenticateToken,
  requireTeacherOrAdmin,
  uploadCourseFiles,
  createCourse
);

// Create course with units (teacher/admin only)
router.post(
  "/create-with-units",
  authenticateToken,
  requireTeacherOrAdmin,
  uploadCourseFiles,
  createCourseWithUnits
);

// Delete course (teacher/admin only, and must own it)
router.delete(
  "/:id",
  authenticateToken,
  requireTeacherOrAdmin,
  requireOwnership("Course", "teacher_id"),
  deleteCourse
);

// Update course (teacher/admin only, and must own it)
router.patch(
  "/:id",
  authenticateToken,
  requireTeacherOrAdmin,
  requireOwnership("Course", "teacher_id"),
  updateCourse
);

// Get course for editing (teacher/admin only, and must own it)
router.get(
  "/edit/:id",
  authenticateToken,
  requireTeacherOrAdmin,
  requireOwnership("Course", "teacher_id"),
  async (req, res) => {
    try {
      const course = req.resource; // From requireOwnership middleware

      res.json({
        success: true,
        course: {
          id: course.id,
          title: course.title,
          description: course.description,
          price: parseFloat(course.price) || 0,
          thumbnail: course.thumbnail,
          teacher_id: course.teacher_id,
          slug: course.slug,
          created_at: course.created_at,
          updated_at: course.updated_at,
        },
      });
    } catch (error) {
      console.error("Error fetching course for editing:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch course for editing",
      });
    }
  }
);

// =========================================================
// TEACHER DASHBOARD ROUTES
// =========================================================

// Get teacher's courses (simple list)
router.get(
  "/teacher/my-courses",
  authenticateToken,
  requireTeacher,
  getTeacherCourses
);

// Get teacher's courses with full structure
router.get(
  "/teacher/my-courses-detailed",
  authenticateToken,
  requireTeacher,
  async (req, res) => {
    try {
      const teacherId = req.user.id;

      const courses = await Course.findAll({
        where: { teacher_id: teacherId },
        attributes: [
          "id",
          "title",
          "description",
          "slug",
          "price",
          "thumbnail",
          "created_at",
        ],
        include: [
          {
            model: Unit,
            as: "units",
            attributes: ["id", "title", "description", "order_index"],
            include: [
              {
                model: Lesson,
                as: "lessons",
                attributes: [
                  "id",
                  "title",
                  "content",
                  "video_url",
                  "file_url",
                  "order_index",
                  "content_type",
                  "is_preview",
                  "created_at",
                ],
                order: [["order_index", "ASC"]],
              },
            ],
            order: [["order_index", "ASC"]],
          },
          {
            model: User,
            as: "teacher",
            attributes: ["id", "name", "email"],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      res.json({ success: true, courses });
    } catch (error) {
      console.error("Error fetching teacher courses:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch courses",
      });
    }
  }
);

// Get teacher course full details
router.get(
  "/teacher/:courseId/full",
  authenticateToken,
  requireTeacher,
  getTeacherCourseFull
);

// =========================================================
// PREVIEW MANAGEMENT ROUTES
// =========================================================

// Check preview status for a course
router.get(
  "/preview/status/:courseId",
  authenticateToken,
  requireTeacherOrAdmin,
  checkCoursePreviewStatus
);

// Mark/unmark lesson as preview
router.put(
  "/lessons/:lessonId/mark-preview",
  authenticateToken,
  requireTeacherOrAdmin,
  markLessonAsPreview
);

// =========================================================
// DEBUG & UTILITY ROUTES
// =========================================================

// Debug: Get course with all lessons and preview status
router.get(
  "/debug/:courseId",
  authenticateToken,
  requireTeacherOrAdmin,
  async (req, res) => {
    try {
      const { courseId } = req.params;

      const course = await Course.findByPk(courseId, {
        attributes: ["id", "title", "slug", "description"],
        include: [
          {
            model: Lesson,
            as: "lessons",
            attributes: [
              "id",
              "title",
              "is_preview",
              "file_url",
              "content_type",
              "order_index",
            ],
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
        return res.status(404).json({
          success: false,
          error: "Course not found",
        });
      }

      const previewLesson = course.lessons.find((l) => l.is_preview);
      const hasPreviewFile = previewLesson && previewLesson.file_url;

      res.json({
        success: true,
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
          teacher: course.teacher,
          totalLessons: course.lessons.length,
        },
        previewStatus: {
          hasPreviewLesson: !!previewLesson,
          previewLesson: previewLesson
            ? {
                id: previewLesson.id,
                title: previewLesson.title,
                hasFile: !!previewLesson.file_url,
                fileUrl: previewLesson.file_url,
                contentType: previewLesson.content_type,
              }
            : null,
          hasPreviewFile,
          allLessons: course.lessons.map((l) => ({
            id: l.id,
            title: l.title,
            is_preview: l.is_preview,
            hasFile: !!l.file_url,
            order: l.order_index,
          })),
        },
      });
    } catch (error) {
      console.error("Debug course error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

// Fix preview for a course
router.post(
  "/fix-preview/:courseId",
  authenticateToken,
  requireTeacherOrAdmin,
  async (req, res) => {
    try {
      const { courseId } = req.params;
      const teacherId = req.user.id;

      // Verify course belongs to teacher
      const course = await Course.findOne({
        where: { id: courseId, teacher_id: teacherId },
      });

      if (!course) {
        return res.status(403).json({
          success: false,
          error: "Course not found or access denied",
        });
      }

      // Get all lessons for this course
      const lessons = await Lesson.findAll({
        where: { course_id: courseId },
        order: [["order_index", "ASC"]],
      });

      if (lessons.length === 0) {
        return res.json({
          success: false,
          error: "No lessons found for this course",
        });
      }

      // Unmark all lessons as preview
      await Lesson.update(
        { is_preview: false },
        { where: { course_id: courseId } }
      );

      // Mark first lesson with a file as preview
      let previewLesson = lessons.find((l) => l.file_url);
      if (!previewLesson) {
        previewLesson = lessons[0];
      }

      await previewLesson.update({ is_preview: true });

      res.json({
        success: true,
        message: `Preview fixed for course "${course.title}"`,
        previewLesson: {
          id: previewLesson.id,
          title: previewLesson.title,
          hasFile: !!previewLesson.file_url,
          fileUrl: previewLesson.file_url,
        },
      });
    } catch (error) {
      console.error("Fix preview error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

export default router;