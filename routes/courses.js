// // routes/courses.js
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

// import authenticateToken from "../middleware/authenticateToken.js";
// import checkTeacherOrAdmin from "../middleware/checkTeacherOrAdmin.js";
// import { isTeacher, isAdmin } from "../middleware/authMiddleware.js";
// import { uploadCourseFiles } from "../middleware/uploadMiddleware.js";
// import db from "../models/index.js";

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

// // ⭐ PUBLIC: Get first preview lesson with full content
// router.get("/:courseId/preview-lesson", async (req, res) => {
//   try {
//     const { courseId } = req.params;

//     console.log("🔍 Finding preview lesson for course:", courseId);

//     const lesson = await Lesson.findOne({
//       where: { course_id: courseId, is_preview: true },
//       order: [["order_index", "ASC"]],
//       include: [
//         { 
//           model: Course, 
//           as: "course",
//           attributes: ["id", "title", "description", "teacher_id"]
//         }
//       ],
//     });

//     if (!lesson) {
//       console.log("❌ No preview lesson found for course:", courseId);
//       return res.status(404).json({
//         success: false,
//         error: "No preview lesson found for this course",
//       });
//     }

//     // Build absolute URLs
//     const backend = (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/+$/, "");

//     const clean = (x) => x?.replace(/^Uploads\//, "").replace(/^\/+/, "");

//     const lessonData = lesson.toJSON();
    
//     // Build full URLs for media files
//     if (lessonData.video_url && !lessonData.video_url.startsWith("http")) {
//       lessonData.video_url = `${backend}/api/v1/files/${clean(lessonData.video_url)}`;
//     }

//     if (lessonData.file_url && !lessonData.file_url.startsWith("http")) {
//       lessonData.file_url = `${backend}/api/v1/files/${clean(lessonData.file_url)}`;
//     }

//     console.log("✅ Preview lesson served publicly:", {
//       lessonId: lessonData.id,
//       title: lessonData.title,
//       course: lessonData.course?.title
//     });

//     res.json({
//       success: true,
//       lesson: lessonData,
//       access: "public"
//     });

//   } catch (error) {
//     console.error("❌ Preview lesson error:", error.message);
//     res.status(500).json({
//       success: false,
//       error: "Failed to load preview lesson",
//     });
//   }
// });

// // ⚠ Slug route MUST be last because it catches all dynamic paths
// router.get("/:slug", getPublicCourseBySlug);

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
//         attributes: [
//           "id",
//           "title",
//           "description",
//           "slug",
//           "price",
//           "thumbnail",
//           "created_at",
//         ],
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
//       console.error("❌ Error fetching teacher courses:", error);
//       res.status(500).json({
//         success: false,
//         error: "Failed to fetch courses",
//       });
//     }
//   }
// );

// router.get(
//   "/teacher/my-courses",
//   authenticateToken,
//   isTeacher,
//   getTeacherCourses
// );

// router.get(
//   "/teacher/:courseId/full",
//   authenticateToken,
//   isTeacher,
//   async (req, res) => {
//     try {
//       const { courseId } = req.params;
//       const teacherId = req.user.id;

//       const course = await Course.findOne({
//         where: { id: courseId, teacher_id: teacherId },
//         attributes: [
//           "id",
//           "title",
//           "description",
//           "slug",
//           "price",
//           "thumbnail",
//           "created_at",
//         ],
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
//         return res.status(404).json({
//           success: false,
//           error: "Course not found or access denied",
//         });
//       }

//       res.json({ success: true, course });
//     } catch (error) {
//       console.error("❌ Error:", error);
//       res.status(500).json({
//         success: false,
//         error: "Failed to fetch course",
//       });
//     }
//   }
// );

// export default router;




// routes/courses.js
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
} from "../controllers/courseController.js";

import authenticateToken from "../middleware/authenticateToken.js";
import checkTeacherOrAdmin from "../middleware/checkTeacherOrAdmin.js";
import { isTeacher, isAdmin } from "../middleware/authMiddleware.js";
import { uploadCourseFiles } from "../middleware/uploadMiddleware.js";
import db from "../models/index.js";

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

// ⭐ PUBLIC: Get first preview lesson with full content
router.get("/:courseId/preview-lesson", async (req, res) => {
  try {
    const { courseId } = req.params;

    console.log("🔍 Finding preview lesson for course:", courseId);

    // First, check if course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    const lesson = await Lesson.findOne({
      where: { course_id: courseId, is_preview: true },
      order: [["order_index", "ASC"]],
      include: [
        { 
          model: Course, 
          as: "course",
          attributes: ["id", "title", "description", "teacher_id"]
        }
      ],
    });

    if (!lesson) {
      console.log("❌ No preview lesson found for course:", courseId);
      
      // Get first lesson as fallback for preview
      const firstLesson = await Lesson.findOne({
        where: { course_id: courseId },
        order: [["order_index", "ASC"]],
        include: [
          { 
            model: Course, 
            as: "course",
            attributes: ["id", "title", "description", "teacher_id"]
          }
        ],
      });

      if (!firstLesson) {
        return res.status(404).json({
          success: false,
          error: "No lessons available for this course",
        });
      }

      console.log("🔄 Using first lesson as fallback preview:", firstLesson.title);

      // Build absolute URLs for fallback lesson
      const backend = (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/+$/, "");
      const clean = (x) => x?.replace(/^Uploads\//, "").replace(/^\/+/, "");

      const lessonData = firstLesson.toJSON();
      
      // Build full URLs for media files
      if (lessonData.video_url && !lessonData.video_url.startsWith("http")) {
        lessonData.video_url = `${backend}/api/v1/files/${clean(lessonData.video_url)}`;
      }

      if (lessonData.file_url && !lessonData.file_url.startsWith("http")) {
        lessonData.file_url = `${backend}/api/v1/files/${clean(lessonData.file_url)}`;
      }

      return res.json({
        success: true,
        lesson: lessonData,
        access: "public",
        fallback: true,
        message: "Using first lesson as preview (no dedicated preview lesson set)"
      });
    }

    // Build absolute URLs
    const backend = (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/+$/, "");
    const clean = (x) => x?.replace(/^Uploads\//, "").replace(/^\/+/, "");

    const lessonData = lesson.toJSON();
    
    // Build full URLs for media files
    if (lessonData.video_url && !lessonData.video_url.startsWith("http")) {
      lessonData.video_url = `${backend}/api/v1/files/${clean(lessonData.video_url)}`;
    }

    if (lessonData.file_url && !lessonData.file_url.startsWith("http")) {
      lessonData.file_url = `${backend}/api/v1/files/${clean(lessonData.file_url)}`;
    }

    console.log("✅ Preview lesson served publicly:", {
      lessonId: lessonData.id,
      title: lessonData.title,
      course: lessonData.course?.title
    });

    res.json({
      success: true,
      lesson: lessonData,
      access: "public"
    });

  } catch (error) {
    console.error("❌ Preview lesson error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to load preview lesson",
    });
  }
});

// 🐛 DEBUG ROUTE: Check course lessons and preview status
router.get("/:courseId/debug-preview", async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Check if course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.json({
        success: false,
        error: "Course not found",
        courseId
      });
    }

    // Find all lessons for this course
    const allLessons = await Lesson.findAll({
      where: { course_id: courseId },
      order: [["order_index", "ASC"]],
      attributes: ["id", "title", "is_preview", "order_index", "content_type"]
    });

    // Find preview lessons specifically
    const previewLessons = allLessons.filter(lesson => lesson.is_preview);

    res.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug
      },
      allLessons: allLessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        is_preview: lesson.is_preview,
        order_index: lesson.order_index,
        content_type: lesson.content_type
      })),
      previewLessons: previewLessons.map(lesson => ({
        id: lesson.id,
        title: lesson.title,
        is_preview: lesson.is_preview,
        order_index: lesson.order_index
      })),
      previewLessonsCount: previewLessons.length,
      totalLessons: allLessons.length,
      firstLesson: allLessons[0] || null
    });

  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ⚠ Slug route MUST be last because it catches all dynamic paths
router.get("/:slug", getPublicCourseBySlug);

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
      console.error("❌ Error fetching teacher courses:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch courses",
      });
    }
  }
);

router.get(
  "/teacher/my-courses",
  authenticateToken,
  isTeacher,
  getTeacherCourses
);

router.get(
  "/teacher/:courseId/full",
  authenticateToken,
  isTeacher,
  async (req, res) => {
    try {
      const { courseId } = req.params;
      const teacherId = req.user.id;

      const course = await Course.findOne({
        where: { id: courseId, teacher_id: teacherId },
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
        ],
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          error: "Course not found or access denied",
        });
      }

      res.json({ success: true, course });
    } catch (error) {
      console.error("❌ Error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch course",
      });
    }
  }
);

export default router;