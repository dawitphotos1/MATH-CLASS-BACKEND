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

//     // 🔥 UPDATED: Robust backend URL detection for Render deployment
//     let backend;
    
//     // Check multiple sources for backend URL
//     if (process.env.BACKEND_URL) {
//       backend = process.env.BACKEND_URL;
//       console.log("🔵 Using BACKEND_URL from env");
//     } else if (process.env.RENDER_EXTERNAL_URL) {
//       backend = process.env.RENDER_EXTERNAL_URL;
//       console.log("🔵 Using RENDER_EXTERNAL_URL");
//     } else if (process.env.NODE_ENV === 'production') {
//       // Default Render URL if nothing else is set
//       backend = 'https://mathe-class-website-backend-1.onrender.com';
//       console.log("🔵 Using default Render URL for production");
//     } else {
//       // Development fallback
//       backend = `http://localhost:${process.env.PORT || 5000}`;
//       console.log("🔵 Using localhost for development");
//     }
    
//     // Clean up the URL (remove trailing slashes)
//     backend = backend.replace(/\/+$/, "");
//     console.log("🌍 Final backend URL for preview:", backend);

//     const clean = (x) => x?.replace(/^Uploads\//, "").replace(/^\/+/, "");

//     const lessonData = lesson.toJSON();
    
//     // Build full URLs for media files
//     if (lessonData.video_url && !lessonData.video_url.startsWith("http")) {
//       const cleanVideoUrl = clean(lessonData.video_url);
//       lessonData.video_url = `${backend}/api/v1/files/${cleanVideoUrl}`;
//       console.log("🎬 Built video URL:", lessonData.video_url);
//     } else if (lessonData.video_url && lessonData.video_url.includes("localhost")) {
//       // Fix existing localhost URLs
//       console.warn("⚠️ Video URL contains localhost, fixing...");
//       const cleanVideoUrl = clean(lessonData.video_url.replace(/http:\/\/localhost:\d+\//, ""));
//       lessonData.video_url = `${backend}/api/v1/files/${cleanVideoUrl}`;
//       console.log("🔧 Fixed video URL:", lessonData.video_url);
//     }

//     if (lessonData.file_url && !lessonData.file_url.startsWith("http")) {
//       const cleanFileUrl = clean(lessonData.file_url);
//       lessonData.file_url = `${backend}/api/v1/files/${cleanFileUrl}`;
//       console.log("📄 Built file URL:", lessonData.file_url);
//     } else if (lessonData.file_url && lessonData.file_url.includes("localhost")) {
//       // Fix existing localhost URLs
//       console.warn("⚠️ File URL contains localhost, fixing...");
//       const cleanFileUrl = clean(lessonData.file_url.replace(/http:\/\/localhost:\d+\//, ""));
//       lessonData.file_url = `${backend}/api/v1/files/${cleanFileUrl}`;
//       console.log("🔧 Fixed file URL:", lessonData.file_url);
//     }

//     console.log("✅ Preview lesson served publicly:", {
//       lessonId: lessonData.id,
//       title: lessonData.title,
//       course: lessonData.course?.title,
//       backendUsed: backend
//     });

//     res.json({
//       success: true,
//       lesson: lessonData,
//       access: "public",
//       backendUrl: backend // For debugging
//     });

//   } catch (error) {
//     console.error("❌ Preview lesson error:", error.message);
//     res.status(500).json({
//       success: false,
//       error: "Failed to load preview lesson",
//       details: process.env.NODE_ENV === 'development' ? error.message : undefined
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

// ⭐ ENHANCED: Get first preview lesson with file existence check
router.get("/:courseId/preview-lesson", async (req, res) => {
  try {
    const { courseId } = req.params;

    console.log("🔍 Finding preview lesson for course:", courseId);

    const lesson = await Lesson.findOne({
      where: { course_id: courseId, is_preview: true },
      order: [["order_index", "ASC"]],
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "description", "teacher_id"],
        },
      ],
    });

    if (!lesson) {
      console.log("❌ No preview lesson found for course:", courseId);
      return res.status(404).json({
        success: false,
        error: "No preview lesson found for this course",
      });
    }

    // 🔥 UPDATED: Robust backend URL detection
    let backend;

    // Check multiple sources for backend URL
    if (process.env.BACKEND_URL) {
      backend = process.env.BACKEND_URL;
      console.log("🔵 Using BACKEND_URL from env");
    } else if (process.env.RENDER_EXTERNAL_URL) {
      backend = process.env.RENDER_EXTERNAL_URL;
      console.log("🔵 Using RENDER_EXTERNAL_URL");
    } else if (process.env.NODE_ENV === "production") {
      // Default Render URL if nothing else is set
      backend = "https://mathe-class-website-backend-1.onrender.com";
      console.log("🔵 Using default Render URL for production");
    } else {
      // Development fallback
      backend = `http://localhost:${process.env.PORT || 5000}`;
      console.log("🔵 Using localhost for development");
    }

    // Clean up the URL (remove trailing slashes)
    backend = backend.replace(/\/+$/, "");
    console.log("🌍 Final backend URL for preview:", backend);

    const clean = (x) => {
      if (!x) return "";
      return x
        .replace(/^Uploads\//, "")
        .replace(/^\/+/, "")
        .trim();
    };

    const lessonData = lesson.toJSON();

    // 🆕 Check if file exists before building URL
    if (lessonData.file_url && !lessonData.file_url.startsWith("http")) {
      const fileName = clean(lessonData.file_url);
      if (fileName) {
        // Check if file exists in multiple possible locations
        const fs = require("fs");
        const path = require("path");

        const possiblePaths = [
          path.join(process.cwd(), "Uploads", fileName),
          path.join(__dirname, "..", "Uploads", fileName),
          path.join("/opt/render/project/src/Uploads", fileName),
          path.join("/tmp/Uploads", fileName),
        ];

        let fileExists = false;
        for (const filePath of possiblePaths) {
          if (fs.existsSync(filePath)) {
            fileExists = true;
            console.log(`✅ Found PDF file at: ${filePath}`);
            break;
          }
        }

        if (fileExists) {
          lessonData.file_url = `${backend}/api/v1/files/${fileName}`;
          console.log("📄 Built file URL:", lessonData.file_url);
        } else {
          console.warn(`⚠️ PDF file not found: ${fileName}`);
          // Keep the file_url but note it might not work
          lessonData.file_url = `${backend}/api/v1/files/${fileName}`;
          lessonData.file_missing = true;
        }
      }
    }

    // Handle video URLs
    if (lessonData.video_url && !lessonData.video_url.startsWith("http")) {
      const cleanVideoUrl = clean(lessonData.video_url);
      if (cleanVideoUrl) {
        lessonData.video_url = `${backend}/api/v1/files/${cleanVideoUrl}`;
        console.log("🎬 Built video URL:", lessonData.video_url);
      }
    } else if (
      lessonData.video_url &&
      lessonData.video_url.includes("localhost")
    ) {
      // Fix existing localhost URLs
      console.warn("⚠️ Video URL contains localhost, fixing...");
      const cleanVideoUrl = clean(
        lessonData.video_url.replace(/http:\/\/localhost:\d+\//, "")
      );
      lessonData.video_url = `${backend}/api/v1/files/${cleanVideoUrl}`;
      console.log("🔧 Fixed video URL:", lessonData.video_url);
    }

    console.log("✅ Preview lesson served publicly:", {
      lessonId: lessonData.id,
      title: lessonData.title,
      course: lessonData.course?.title,
      hasFile: !!lessonData.file_url,
      fileMissing: lessonData.file_missing || false,
      backendUsed: backend,
    });

    res.json({
      success: true,
      lesson: lessonData,
      access: "public",
      backendUrl: backend,
      fileStatus: lessonData.file_missing
        ? "File may not be available"
        : "File available",
    });
  } catch (error) {
    console.error("❌ Preview lesson error:", error.message);
    res.status(500).json({
      success: false,
      error: "Failed to load preview lesson",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
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