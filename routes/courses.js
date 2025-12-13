// // routes/courses.js - FIXED VERSION
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
// } from "../controllers/courseController.js";

// import { authenticateToken } from "../middleware/authMiddleware.js";
// import checkTeacherOrAdmin from "../middleware/checkTeacherOrAdmin.js";
// import { isTeacher } from "../middleware/authMiddleware.js";
// import { uploadCourseFiles } from "../middleware/cloudinaryUpload.js";
// import db from "../models/index.js";
// import { getPreviewLessonForCourse } from "../controllers/lessonController.js";

// const { Course, User, Lesson, Unit } = db;
// const router = express.Router();

// /* ========================================================
//    🟢 PUBLIC ROUTES — accessible without login
// ======================================================== */

// // Get all courses
// router.get("/", getCourses);

// // Get course by ID (public)
// router.get("/id/:id", getCourseById);

// // Get all lessons for a course (public)
// router.get("/:courseId/lessons", getLessonsByCourse);

// // Simple debug/test endpoint
// router.get("/test/preview", async (req, res) => {
//   try {
//     await db.sequelize.authenticate();
//     const lessonCount = await Lesson.count();
//     const course84 = await Course.findByPk(84);
//     const previewLessons = await Lesson.findAll({
//       where: { course_id: 84, is_preview: true },
//       attributes: ["id", "title", "file_url", "video_url", "is_preview", "content_type"],
//     });
//     const allLessons = await Lesson.findAll({
//       where: { course_id: 84 },
//       order: [["order_index", "ASC"]],
//       attributes: ["id", "title", "is_preview", "order_index", "file_url"],
//     });
//     return res.json({
//       success: true,
//       message: "Test endpoint working",
//       totalLessons: lessonCount,
//       course84Exists: !!course84,
//       previewLessonsCount: previewLessons.length,
//       allLessonsCount: allLessons.length,
//       previewLessons: previewLessons,
//       allLessons: allLessons,
//     });
//   } catch (error) {
//     console.error("Test endpoint error:", error);
//     return res.status(500).json({ success: false, error: error?.message || "Server error" });
//   }
// });

// // PUBLIC: Get first preview lesson for a course
// router.get("/:courseId/preview-lesson", getPreviewLessonForCourse);

// /* ========================================================
//    🔐 PROTECTED ROUTES — teachers / admins only
// ======================================================== */

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

// router.delete("/:id", authenticateToken, deleteCourse);

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

// // ✅ FIXED: This route was missing - causing the 404 errors
// router.get(
//   "/teacher/:courseId/full",
//   authenticateToken,
//   isTeacher,
//   async (req, res) => {
//     try {
//       const { courseId } = req.params;
//       const teacherId = req.user.id;
      
//       console.log(`📥 GET /teacher/${courseId}/full called for teacher ${teacherId}`);

//       // Validate courseId
//       if (!courseId || isNaN(parseInt(courseId))) {
//         return res.status(400).json({ 
//           success: false, 
//           error: "Invalid course ID" 
//         });
//       }

//       const course = await Course.findOne({
//         where: { 
//           id: parseInt(courseId), 
//           teacher_id: teacherId 
//         },
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
//         ],
//       });

//       if (!course) {
//         console.log(`❌ Course ${courseId} not found or not owned by teacher ${teacherId}`);
//         return res.status(404).json({ 
//           success: false, 
//           error: "Course not found or access denied" 
//         });
//       }

//       console.log(`✅ Course ${courseId} found for teacher ${teacherId}`);
      
//       // Build proper URLs for files
//       const backend = process.env.BACKEND_URL || "https://mathe-class-website-backend-1.onrender.com";
      
//       // Fix thumbnail URL
//       if (course.thumbnail && !course.thumbnail.startsWith("http")) {
//         course.thumbnail = `${backend}/api/v1/files/${encodeURIComponent(course.thumbnail)}`;
//       }
      
//       // Fix lesson file URLs
//       if (course.units) {
//         course.units.forEach(unit => {
//           if (unit.lessons) {
//             unit.lessons.forEach(lesson => {
//               if (lesson.file_url && !lesson.file_url.startsWith("http")) {
//                 lesson.file_url = `${backend}/api/v1/files/${encodeURIComponent(lesson.file_url)}`;
//               }
//               if (lesson.video_url && !lesson.video_url.startsWith("http")) {
//                 lesson.video_url = `${backend}/api/v1/files/${encodeURIComponent(lesson.video_url)}`;
//               }
//             });
//           }
//         });
//       }

//       res.json({ success: true, course });
//     } catch (error) {
//       console.error(`❌ Error fetching course ${req.params.courseId}:`, error);
//       res.status(500).json({ 
//         success: false, 
//         error: "Failed to fetch course",
//         details: process.env.NODE_ENV === "development" ? error.message : undefined,
//       });
//     }
//   }
// );

// // ⚠ Slug route MUST be last because it catches all dynamic paths
// router.get("/:slug", getPublicCourseBySlug);

// export default router;






// routes/courses.js - FIXED VERSION
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
  getTeacherCourseFull  // Added this import
} from "../controllers/courseController.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import checkTeacherOrAdmin from "../middleware/checkTeacherOrAdmin.js";
import { isTeacher } from "../middleware/authMiddleware.js";
import { uploadCourseFiles } from "../middleware/cloudinaryUpload.js";
import db from "../models/index.js";
import { getPreviewLessonForCourse } from "../controllers/lessonController.js";

const { Course, User, Lesson, Unit } = db;
const router = express.Router();

/* ========================================================
   🟢 PUBLIC ROUTES — accessible without login
======================================================== */

// Get all courses
router.get("/", getCourses);

// Get course by ID (public)
router.get("/id/:id", getCourseById);

// Get all lessons for a course (public)
router.get("/:courseId/lessons", getLessonsByCourse);

// Simple debug/test endpoint
router.get("/test/preview", async (req, res) => {
  try {
    await db.sequelize.authenticate();
    const lessonCount = await Lesson.count();
    const course84 = await Course.findByPk(84);
    const previewLessons = await Lesson.findAll({
      where: { course_id: 84, is_preview: true },
      attributes: ["id", "title", "file_url", "video_url", "is_preview", "content_type"],
    });
    const allLessons = await Lesson.findAll({
      where: { course_id: 84 },
      order: [["order_index", "ASC"]],
      attributes: ["id", "title", "is_preview", "order_index", "file_url"],
    });
    return res.json({
      success: true,
      message: "Test endpoint working",
      totalLessons: lessonCount,
      course84Exists: !!course84,
      previewLessonsCount: previewLessons.length,
      allLessonsCount: allLessons.length,
      previewLessons: previewLessons,
      allLessons: allLessons,
    });
  } catch (error) {
    console.error("Test endpoint error:", error);
    return res.status(500).json({ success: false, error: error?.message || "Server error" });
  }
});

// PUBLIC: Get first preview lesson for a course
router.get("/:courseId/preview-lesson", getPreviewLessonForCourse);

/* ========================================================
   🔐 PROTECTED ROUTES — teachers / admins only
======================================================== */

router.post(
  "/",
  authenticateToken,
  checkTeacherOrAdmin,
  uploadCourseFiles,
  createCourse
);

router.post(
  "/create",
  authenticateToken,
  checkTeacherOrAdmin,
  uploadCourseFiles,
  createCourse
);

router.post(
  "/create-with-units",
  authenticateToken,
  checkTeacherOrAdmin,
  uploadCourseFiles,
  createCourseWithUnits
);

router.delete("/:id", authenticateToken, deleteCourse);

/* ============================================================
   👨🏫 TEACHER DASHBOARD ROUTES
============================================================ */

router.get(
  "/teacher/my-courses-detailed",
  authenticateToken,
  isTeacher,
  async (req, res) => {
    try {
      const teacherId = req.user.id;

      const courses = await Course.findAll({
        where: { teacher_id: teacherId },
        attributes: ["id", "title", "description", "slug", "price", "thumbnail", "created_at"],
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
      res.status(500).json({ success: false, error: "Failed to fetch courses" });
    }
  }
);

router.get("/teacher/my-courses", authenticateToken, isTeacher, getTeacherCourses);

// ✅ FIXED: Now using the controller function instead of inline handler
router.get(
  "/teacher/:courseId/full",
  authenticateToken,
  isTeacher,
  getTeacherCourseFull  // Using the controller function
);

// ⚠ Slug route MUST be last because it catches all dynamic paths
router.get("/:slug", getPublicCourseBySlug);

export default router;