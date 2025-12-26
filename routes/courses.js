// // // routes/courses.js - COMPLETE FIXED VERSION
// // import express from "express";
// // import {
// //   createCourse,
// //   getCourses,
// //   getPublicCourseBySlug,
// //   getLessonsByCourse,
// //   deleteCourse,
// //   getCourseById,
// //   createCourseWithUnits,
// //   getTeacherCourses,
// //   getTeacherCourseFull,
// //   updateCourse,
// //   checkCourseExists,
// // } from "../controllers/courseController.js";

// // import {
// //   authenticateToken,
// //   requireTeacherOrAdmin,
// //   requireTeacher,
// //   requireOwnership,
// // } from "../middleware/authMiddleware.js";

// // import { uploadCourseFiles } from "../middleware/cloudinaryUpload.js";
// // import {
// //   getPreviewLessonForCourse,
// //   checkCoursePreviewStatus,
// //   markLessonAsPreview,
// // } from "../controllers/lessonController.js";

// // import db from "../models/index.js";
// // const { Course, User, Unit, Lesson } = db;

// // const router = express.Router();

// // // =========================================================
// // // PUBLIC ROUTES (No Authentication)
// // // =========================================================

// // // Get all courses (public)
// // router.get("/", getCourses);

// // // Get course by ID (public)
// // router.get("/id/:id", getCourseById);

// // // Get all lessons for a course (public)
// // router.get("/:courseId/lessons", getLessonsByCourse);

// // // Get units for a course (public) - FIXED: Added this missing route
// // router.get("/:courseId/units", async (req, res) => {
// //   try {
// //     const { courseId } = req.params;
    
// //     console.log(`🔍 Fetching units for course: ${courseId}`);
    
// //     // Check if Unit model exists
// //     if (!Unit) {
// //       return res.json({
// //         success: true,
// //         units: [],
// //         message: "Units feature not available",
// //       });
// //     }
    
// //     // Get units with their lessons
// //     const units = await Unit.findAll({
// //       where: { course_id: courseId },
// //       order: [["order_index", "ASC"]],
// //       include: [
// //         {
// //           model: Lesson,
// //           as: "lessons",
// //           attributes: ["id", "title", "order_index", "content_type", "is_preview"],
// //           order: [["order_index", "ASC"]],
// //         },
// //       ],
// //     });
    
// //     console.log(`✅ Found ${units.length} units for course ${courseId}`);
    
// //     res.json({
// //       success: true,
// //       units: units || [],
// //     });
// //   } catch (error) {
// //     console.error("❌ Error fetching units:", error);
// //     res.status(500).json({
// //       success: false,
// //       error: "Failed to fetch units",
// //     });
// //   }
// // });

// // // Get preview lesson for a course (public)
// // router.get("/:courseId/preview-lesson", getPreviewLessonForCourse);

// // // Check if course exists by slug
// // router.get("/check/:slug", checkCourseExists);

// // // Get course by slug (public) - MUST be last
// // router.get("/slug/:slug", getPublicCourseBySlug);

// // // =========================================================
// // // PROTECTED ROUTES (Require Authentication)
// // // =========================================================

// // // Create new course (teacher/admin only)
// // router.post(
// //   "/",
// //   authenticateToken,
// //   requireTeacherOrAdmin,
// //   uploadCourseFiles,
// //   createCourse
// // );

// // // Create course with units (teacher/admin only)
// // router.post(
// //   "/create-with-units",
// //   authenticateToken,
// //   requireTeacherOrAdmin,
// //   uploadCourseFiles,
// //   createCourseWithUnits
// // );

// // // Delete course (teacher/admin only, and must own it)
// // router.delete(
// //   "/:id",
// //   authenticateToken,
// //   requireTeacherOrAdmin,
// //   requireOwnership("Course", "teacher_id"),
// //   deleteCourse
// // );

// // // Update course (teacher/admin only, and must own it)
// // router.patch(
// //   "/:id",
// //   authenticateToken,
// //   requireTeacherOrAdmin,
// //   requireOwnership("Course", "teacher_id"),
// //   updateCourse
// // );

// // // Get course for editing (teacher/admin only, and must own it)
// // router.get(
// //   "/edit/:id",
// //   authenticateToken,
// //   requireTeacherOrAdmin,
// //   requireOwnership("Course", "teacher_id"),
// //   async (req, res) => {
// //     try {
// //       const course = req.resource; // From requireOwnership middleware

// //       res.json({
// //         success: true,
// //         course: {
// //           id: course.id,
// //           title: course.title,
// //           description: course.description,
// //           price: parseFloat(course.price) || 0,
// //           thumbnail: course.thumbnail,
// //           teacher_id: course.teacher_id,
// //           slug: course.slug,
// //           created_at: course.created_at,
// //           updated_at: course.updated_at,
// //         },
// //       });
// //     } catch (error) {
// //       console.error("Error fetching course for editing:", error);
// //       res.status(500).json({
// //         success: false,
// //         error: "Failed to fetch course for editing",
// //       });
// //     }
// //   }
// // );

// // // =========================================================
// // // TEACHER DASHBOARD ROUTES
// // // =========================================================

// // // Get teacher's courses (simple list)
// // router.get(
// //   "/teacher/my-courses",
// //   authenticateToken,
// //   requireTeacher,
// //   getTeacherCourses
// // );

// // // Get teacher's courses with full structure
// // router.get(
// //   "/teacher/my-courses-detailed",
// //   authenticateToken,
// //   requireTeacher,
// //   async (req, res) => {
// //     try {
// //       const teacherId = req.user.id;

// //       const courses = await Course.findAll({
// //         where: { teacher_id: teacherId },
// //         attributes: [
// //           "id",
// //           "title",
// //           "description",
// //           "slug",
// //           "price",
// //           "thumbnail",
// //           "created_at",
// //         ],
// //         include: [
// //           {
// //             model: Unit,
// //             as: "units",
// //             attributes: ["id", "title", "description", "order_index"],
// //             include: [
// //               {
// //                 model: Lesson,
// //                 as: "lessons",
// //                 attributes: [
// //                   "id",
// //                   "title",
// //                   "content",
// //                   "video_url",
// //                   "file_url",
// //                   "order_index",
// //                   "content_type",
// //                   "is_preview",
// //                   "created_at",
// //                 ],
// //                 order: [["order_index", "ASC"]],
// //               },
// //             ],
// //             order: [["order_index", "ASC"]],
// //           },
// //           {
// //             model: User,
// //             as: "teacher",
// //             attributes: ["id", "name", "email"],
// //           },
// //         ],
// //         order: [["created_at", "DESC"]],
// //       });

// //       res.json({ success: true, courses });
// //     } catch (error) {
// //       console.error("Error fetching teacher courses:", error);
// //       res.status(500).json({
// //         success: false,
// //         error: "Failed to fetch courses",
// //       });
// //     }
// //   }
// // );

// // // Get teacher course full details
// // router.get(
// //   "/teacher/:courseId/full",
// //   authenticateToken,
// //   requireTeacher,
// //   getTeacherCourseFull
// // );

// // // =========================================================
// // // PREVIEW MANAGEMENT ROUTES
// // // =========================================================

// // // Check preview status for a course
// // router.get(
// //   "/preview/status/:courseId",
// //   authenticateToken,
// //   requireTeacherOrAdmin,
// //   checkCoursePreviewStatus
// // );

// // // Mark/unmark lesson as preview
// // router.put(
// //   "/lessons/:lessonId/mark-preview",
// //   authenticateToken,
// //   requireTeacherOrAdmin,
// //   markLessonAsPreview
// // );

// // // =========================================================
// // // DEBUG & UTILITY ROUTES
// // // =========================================================

// // // Debug: Get course with all lessons and preview status
// // router.get(
// //   "/debug/:courseId",
// //   authenticateToken,
// //   requireTeacherOrAdmin,
// //   async (req, res) => {
// //     try {
// //       const { courseId } = req.params;

// //       const course = await Course.findByPk(courseId, {
// //         attributes: ["id", "title", "slug", "description"],
// //         include: [
// //           {
// //             model: Lesson,
// //             as: "lessons",
// //             attributes: [
// //               "id",
// //               "title",
// //               "is_preview",
// //               "file_url",
// //               "content_type",
// //               "order_index",
// //             ],
// //             order: [["order_index", "ASC"]],
// //           },
// //           {
// //             model: User,
// //             as: "teacher",
// //             attributes: ["id", "name", "email"],
// //           },
// //         ],
// //       });

// //       if (!course) {
// //         return res.status(404).json({
// //           success: false,
// //           error: "Course not found",
// //         });
// //       }

// //       const previewLesson = course.lessons.find((l) => l.is_preview);
// //       const hasPreviewFile = previewLesson && previewLesson.file_url;

// //       res.json({
// //         success: true,
// //         course: {
// //           id: course.id,
// //           title: course.title,
// //           slug: course.slug,
// //           teacher: course.teacher,
// //           totalLessons: course.lessons.length,
// //         },
// //         previewStatus: {
// //           hasPreviewLesson: !!previewLesson,
// //           previewLesson: previewLesson
// //             ? {
// //                 id: previewLesson.id,
// //                 title: previewLesson.title,
// //                 hasFile: !!previewLesson.file_url,
// //                 fileUrl: previewLesson.file_url,
// //                 contentType: previewLesson.content_type,
// //               }
// //             : null,
// //           hasPreviewFile,
// //           allLessons: course.lessons.map((l) => ({
// //             id: l.id,
// //             title: l.title,
// //             is_preview: l.is_preview,
// //             hasFile: !!l.file_url,
// //             order: l.order_index,
// //           })),
// //         },
// //       });
// //     } catch (error) {
// //       console.error("Debug course error:", error);
// //       res.status(500).json({
// //         success: false,
// //         error: error.message,
// //       });
// //     }
// //   }
// // );

// // // Fix preview for a course
// // router.post(
// //   "/fix-preview/:courseId",
// //   authenticateToken,
// //   requireTeacherOrAdmin,
// //   async (req, res) => {
// //     try {
// //       const { courseId } = req.params;
// //       const teacherId = req.user.id;

// //       // Verify course belongs to teacher
// //       const course = await Course.findOne({
// //         where: { id: courseId, teacher_id: teacherId },
// //       });

// //       if (!course) {
// //         return res.status(403).json({
// //           success: false,
// //           error: "Course not found or access denied",
// //         });
// //       }

// //       // Get all lessons for this course
// //       const lessons = await Lesson.findAll({
// //         where: { course_id: courseId },
// //         order: [["order_index", "ASC"]],
// //       });

// //       if (lessons.length === 0) {
// //         return res.json({
// //           success: false,
// //           error: "No lessons found for this course",
// //         });
// //       }

// //       // Unmark all lessons as preview
// //       await Lesson.update(
// //         { is_preview: false },
// //         { where: { course_id: courseId } }
// //       );

// //       // Mark first lesson with a file as preview
// //       let previewLesson = lessons.find((l) => l.file_url);
// //       if (!previewLesson) {
// //         previewLesson = lessons[0];
// //       }

// //       await previewLesson.update({ is_preview: true });

// //       res.json({
// //         success: true,
// //         message: `Preview fixed for course "${course.title}"`,
// //         previewLesson: {
// //           id: previewLesson.id,
// //           title: previewLesson.title,
// //           hasFile: !!previewLesson.file_url,
// //           fileUrl: previewLesson.file_url,
// //         },
// //       });
// //     } catch (error) {
// //       console.error("Fix preview error:", error);
// //       res.status(500).json({
// //         success: false,
// //         error: error.message,
// //       });
// //     }
// //   }
// // );

// // export default router;





// // routes/courses.js - COMPLETE FIXED VERSION
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
//   updateCourse,
//   checkCourseExists,
// } from "../controllers/courseController.js";

// import {
//   authenticateToken,
//   requireTeacherOrAdmin,
//   requireTeacher,
//   requireOwnership,
// } from "../middleware/authMiddleware.js";

// import { uploadCourseFiles } from "../middleware/cloudinaryUpload.js";
// import {
//   getPreviewLessonForCourse,
//   checkCoursePreviewStatus,
//   markLessonAsPreview,
// } from "../controllers/lessonController.js";

// import db from "../models/index.js";
// const { Course, User, Unit, Lesson } = db;

// const router = express.Router();

// // =========================================================
// // PUBLIC ROUTES (No Authentication)
// // =========================================================

// // Get all courses (public)
// router.get("/", getCourses);

// // Get course by ID (public)
// router.get("/id/:id", getCourseById);

// // Get all lessons for a course (public)
// router.get("/:courseId/lessons", getLessonsByCourse);

// // Get units for a course (public) - FIXED: Added this missing route
// router.get("/:courseId/units", async (req, res) => {
//   try {
//     const { courseId } = req.params;
    
//     console.log(`🔍 Fetching units for course: ${courseId}`);
    
//     // Check if Unit model exists
//     if (!Unit) {
//       return res.json({
//         success: true,
//         units: [],
//         message: "Units feature not available",
//       });
//     }
    
//     // Get units with their lessons
//     const units = await Unit.findAll({
//       where: { course_id: courseId },
//       order: [["order_index", "ASC"]],
//       include: [
//         {
//           model: Lesson,
//           as: "lessons",
//           attributes: ["id", "title", "order_index", "content_type", "is_preview"],
//           order: [["order_index", "ASC"]],
//         },
//       ],
//     });
    
//     console.log(`✅ Found ${units.length} units for course ${courseId}`);
    
//     res.json({
//       success: true,
//       units: units || [],
//     });
//   } catch (error) {
//     console.error("❌ Error fetching units:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch units",
//     });
//   }
// });

// // Get preview lesson for a course (public) - IMPORTANT ROUTE
// router.get("/:courseId/preview-lesson", getPreviewLessonForCourse);

// // Check if course exists by slug
// router.get("/check/:slug", checkCourseExists);

// // Get course by slug (public) - MUST be last
// router.get("/slug/:slug", getPublicCourseBySlug);

// // =========================================================
// // PROTECTED ROUTES (Require Authentication)
// // =========================================================

// // Create new course (teacher/admin only)
// router.post(
//   "/",
//   authenticateToken,
//   requireTeacherOrAdmin,
//   uploadCourseFiles,
//   createCourse
// );

// // Create course with units (teacher/admin only)
// router.post(
//   "/create-with-units",
//   authenticateToken,
//   requireTeacherOrAdmin,
//   uploadCourseFiles,
//   createCourseWithUnits
// );

// // Delete course (teacher/admin only, and must own it)
// router.delete(
//   "/:id",
//   authenticateToken,
//   requireTeacherOrAdmin,
//   requireOwnership("Course", "teacher_id"),
//   deleteCourse
// );

// // Update course (teacher/admin only, and must own it)
// router.patch(
//   "/:id",
//   authenticateToken,
//   requireTeacherOrAdmin,
//   requireOwnership("Course", "teacher_id"),
//   updateCourse
// );

// // Get course for editing (teacher/admin only, and must own it)
// router.get(
//   "/edit/:id",
//   authenticateToken,
//   requireTeacherOrAdmin,
//   requireOwnership("Course", "teacher_id"),
//   async (req, res) => {
//     try {
//       const course = req.resource; // From requireOwnership middleware

//       res.json({
//         success: true,
//         course: {
//           id: course.id,
//           title: course.title,
//           description: course.description,
//           price: parseFloat(course.price) || 0,
//           thumbnail: course.thumbnail,
//           teacher_id: course.teacher_id,
//           slug: course.slug,
//           created_at: course.created_at,
//           updated_at: course.updated_at,
//         },
//       });
//     } catch (error) {
//       console.error("Error fetching course for editing:", error);
//       res.status(500).json({
//         success: false,
//         error: "Failed to fetch course for editing",
//       });
//     }
//   }
// );

// // =========================================================
// // TEACHER DASHBOARD ROUTES
// // =========================================================

// // Get teacher's courses (simple list)
// router.get(
//   "/teacher/my-courses",
//   authenticateToken,
//   requireTeacher,
//   getTeacherCourses
// );

// // Get teacher's courses with full structure
// router.get(
//   "/teacher/my-courses-detailed",
//   authenticateToken,
//   requireTeacher,
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
//       console.error("Error fetching teacher courses:", error);
//       res.status(500).json({
//         success: false,
//         error: "Failed to fetch courses",
//       });
//     }
//   }
// );

// // Get teacher course full details
// router.get(
//   "/teacher/:courseId/full",
//   authenticateToken,
//   requireTeacher,
//   getTeacherCourseFull
// );

// // =========================================================
// // PREVIEW MANAGEMENT ROUTES
// // =========================================================

// // Check preview status for a course
// router.get(
//   "/preview/status/:courseId",
//   authenticateToken,
//   requireTeacherOrAdmin,
//   checkCoursePreviewStatus
// );

// // Mark/unmark lesson as preview
// router.put(
//   "/lessons/:lessonId/mark-preview",
//   authenticateToken,
//   requireTeacherOrAdmin,
//   markLessonAsPreview
// );

// // =========================================================
// // DEBUG & UTILITY ROUTES - ENHANCED
// // =========================================================

// // Debug: Get course with all lessons and preview status
// router.get(
//   "/debug/:courseId",
//   authenticateToken,
//   requireTeacherOrAdmin,
//   async (req, res) => {
//     try {
//       const { courseId } = req.params;

//       const course = await Course.findByPk(courseId, {
//         attributes: ["id", "title", "slug", "description"],
//         include: [
//           {
//             model: Lesson,
//             as: "lessons",
//             attributes: [
//               "id",
//               "title",
//               "is_preview",
//               "file_url",
//               "content_type",
//               "order_index",
//             ],
//             order: [["order_index", "ASC"]],
//           },
//           {
//             model: User,
//             as: "teacher",
//             attributes: ["id", "name", "email"],
//           },
//         ],
//       });

//       if (!course) {
//         return res.status(404).json({
//           success: false,
//           error: "Course not found",
//         });
//       }

//       const previewLesson = course.lessons.find((l) => l.is_preview);
//       const hasPreviewFile = previewLesson && previewLesson.file_url;

//       res.json({
//         success: true,
//         course: {
//           id: course.id,
//           title: course.title,
//           slug: course.slug,
//           teacher: course.teacher,
//           totalLessons: course.lessons.length,
//         },
//         previewStatus: {
//           hasPreviewLesson: !!previewLesson,
//           previewLesson: previewLesson
//             ? {
//                 id: previewLesson.id,
//                 title: previewLesson.title,
//                 hasFile: !!previewLesson.file_url,
//                 fileUrl: previewLesson.file_url,
//                 contentType: previewLesson.content_type,
//               }
//             : null,
//           hasPreviewFile,
//           allLessons: course.lessons.map((l) => ({
//             id: l.id,
//             title: l.title,
//             is_preview: l.is_preview,
//             hasFile: !!l.file_url,
//             hasContent: !!(l.content && l.content.trim().length > 0),
//             order: l.order_index,
//           })),
//         },
//       });
//     } catch (error) {
//       console.error("Debug course error:", error);
//       res.status(500).json({
//         success: false,
//         error: error.message,
//       });
//     }
//   }
// );

// // Enhanced: Test preview for a course
// router.get(
//   "/test-preview/:courseId",
//   async (req, res) => {
//     try {
//       const { courseId } = req.params;
      
//       console.log(`🧪 Testing preview for course: ${courseId}`);
      
//       const course = await Course.findByPk(courseId, {
//         attributes: ["id", "title", "slug"],
//         include: [
//           {
//             model: Lesson,
//             as: "lessons",
//             attributes: ["id", "title", "is_preview", "file_url", "content", "content_type"],
//             order: [["order_index", "ASC"]],
//           },
//         ],
//       });
      
//       if (!course) {
//         return res.status(404).json({
//           success: false,
//           error: "Course not found",
//         });
//       }
      
//       // Simulate the preview logic
//       const previewLesson = course.lessons.find(l => l.is_preview);
//       let foundLesson = previewLesson;
      
//       if (!previewLesson || !previewLesson.file_url) {
//         // Find first lesson with content
//         foundLesson = course.lessons.find(l => 
//           l.file_url || 
//           (l.content && l.content.trim().length > 0)
//         );
        
//         if (!foundLesson && course.lessons.length > 0) {
//           foundLesson = course.lessons[0];
//         }
//       }
      
//       const hasPreviewContent = foundLesson && (
//         foundLesson.file_url || 
//         (foundLesson.content && foundLesson.content.trim().length > 0)
//       );
      
//       res.json({
//         success: true,
//         course: {
//           id: course.id,
//           title: course.title,
//           slug: course.slug,
//           totalLessons: course.lessons.length,
//         },
//         analysis: {
//           hasMarkedPreview: !!previewLesson,
//           markedPreviewLesson: previewLesson ? {
//             id: previewLesson.id,
//             title: previewLesson.title,
//             hasFile: !!previewLesson.file_url,
//             hasContent: !!(previewLesson.content && previewLesson.content.trim().length > 0),
//           } : null,
//           foundLesson: foundLesson ? {
//             id: foundLesson.id,
//             title: foundLesson.title,
//             hasFile: !!foundLesson.file_url,
//             fileUrl: foundLesson.file_url ? foundLesson.file_url.substring(0, 100) + "..." : null,
//             hasContent: !!(foundLesson.content && foundLesson.content.trim().length > 0),
//             contentLength: foundLesson.content ? foundLesson.content.length : 0,
//           } : null,
//           hasPreviewContent,
//           allLessons: course.lessons.map(l => ({
//             id: l.id,
//             title: l.title,
//             is_preview: l.is_preview,
//             hasFile: !!l.file_url,
//             fileUrl: l.file_url ? l.file_url.substring(0, 80) + "..." : null,
//             hasContent: !!(l.content && l.content.trim().length > 0),
//             contentLength: l.content ? l.content.length : 0,
//             order: l.order_index,
//           })),
//         },
//         recommendation: !hasPreviewContent ? 
//           "❌ No preview content found. Mark a lesson as preview or add content to lessons." :
//           "✅ Preview should work correctly.",
//       });
//     } catch (error) {
//       console.error("Test preview error:", error);
//       res.status(500).json({
//         success: false,
//         error: error.message,
//       });
//     }
//   }
// );

// // Fix preview for a course
// router.post(
//   "/fix-preview/:courseId",
//   authenticateToken,
//   requireTeacherOrAdmin,
//   async (req, res) => {
//     try {
//       const { courseId } = req.params;
//       const teacherId = req.user.id;

//       // Verify course belongs to teacher
//       const course = await Course.findOne({
//         where: { id: courseId, teacher_id: teacherId },
//       });

//       if (!course) {
//         return res.status(403).json({
//           success: false,
//           error: "Course not found or access denied",
//         });
//       }

//       // Get all lessons for this course
//       const lessons = await Lesson.findAll({
//         where: { course_id: courseId },
//         order: [["order_index", "ASC"]],
//       });

//       if (lessons.length === 0) {
//         return res.json({
//           success: false,
//           error: "No lessons found for this course",
//         });
//       }

//       // Unmark all lessons as preview
//       await Lesson.update(
//         { is_preview: false },
//         { where: { course_id: courseId } }
//       );

//       // Try to find a lesson with a file first
//       let previewLesson = lessons.find((l) => l.file_url);
      
//       // If no lesson with file, find first lesson with content
//       if (!previewLesson) {
//         previewLesson = lessons.find((l) => l.content && l.content.trim().length > 0);
//       }
      
//       // If still no lesson, use the first lesson
//       if (!previewLesson) {
//         previewLesson = lessons[0];
//       }

//       await previewLesson.update({ is_preview: true });

//       res.json({
//         success: true,
//         message: `Preview fixed for course "${course.title}"`,
//         previewLesson: {
//           id: previewLesson.id,
//           title: previewLesson.title,
//           hasFile: !!previewLesson.file_url,
//           fileUrl: previewLesson.file_url,
//           hasContent: !!(previewLesson.content && previewLesson.content.trim().length > 0),
//         },
//       });
//     } catch (error) {
//       console.error("Fix preview error:", error);
//       res.status(500).json({
//         success: false,
//         error: error.message,
//       });
//     }
//   }
// );

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
  getPublicPreviewByLessonId,
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

// Get units for a course (public)
router.get("/:courseId/units", async (req, res) => {
  try {
    const { courseId } = req.params;
    
    console.log(`🔍 Fetching units for course: ${courseId}`);
    
    // Check if Unit model exists
    if (!Unit) {
      return res.json({
        success: true,
        units: [],
        message: "Units feature not available",
      });
    }
    
    // Get units with their lessons
    const units = await Unit.findAll({
      where: { course_id: courseId },
      order: [["order_index", "ASC"]],
      include: [
        {
          model: Lesson,
          as: "lessons",
          attributes: ["id", "title", "order_index", "content_type", "is_preview"],
          order: [["order_index", "ASC"]],
        },
      ],
    });
    
    console.log(`✅ Found ${units.length} units for course ${courseId}`);
    
    res.json({
      success: true,
      units: units || [],
    });
  } catch (error) {
    console.error("❌ Error fetching units:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch units",
    });
  }
});

// Get preview lesson for a course (public) - FIXED ROUTE
router.get("/:courseId/preview-lesson", async (req, res) => {
  try {
    const { courseId } = req.params;
    
    console.log(`🔍 Getting preview lesson for course: ${courseId}`);
    
    // Call the preview function from lessonController
    const previewReq = { params: { courseId } };
    const previewRes = {
      json: (data) => res.json(data),
      status: (code) => ({ json: (data) => res.status(code).json(data) })
    };
    
    await getPreviewLessonForCourse(previewReq, previewRes);
  } catch (error) {
    console.error("❌ Preview route error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load preview",
    });
  }
});

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

// Enhanced preview test endpoint
router.get("/test-preview/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    
    console.log(`🧪 Testing preview for course: ${courseId}`);
    
    const course = await Course.findByPk(courseId, {
      attributes: ["id", "title", "slug"],
      include: [
        {
          model: Lesson,
          as: "lessons",
          attributes: ["id", "title", "is_preview", "file_url", "content", "content_type"],
          order: [["order_index", "ASC"]],
        },
      ],
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }
    
    // Test the preview function directly
    const previewReq = { params: { courseId } };
    const previewRes = {
      json: (data) => {
        res.json({
          success: true,
          course: {
            id: course.id,
            title: course.title,
            slug: course.slug,
            totalLessons: course.lessons.length,
          },
          previewResult: data,
          analysis: {
            hasMarkedPreview: !!course.lessons.find(l => l.is_preview),
            lessonsWithFiles: course.lessons.filter(l => l.file_url).length,
            totalLessons: course.lessons.length,
          },
        });
      },
      status: (code) => ({ json: (data) => res.status(code).json(data) })
    };
    
    await getPreviewLessonForCourse(previewReq, previewRes);
  } catch (error) {
    console.error("❌ Test preview error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// URL comparison test
router.get("/test/url-comparison/:lessonId", async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    // Import buildLessonUrls
    const { buildLessonUrls } = await import("../controllers/lessonController.js");
    
    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Attachment,
          as: "attachments",
        },
      ],
    });
    
    if (!lesson) {
      return res.status(404).json({ error: "Lesson not found" });
    }
    
    // Method 1: Old way
    const backend = process.env.BACKEND_URL || "http://localhost:3000";
    const oldStyleUrl = lesson.file_url && !lesson.file_url.startsWith("http") 
      ? `${backend}${lesson.file_url}`
      : lesson.file_url;
    
    // Method 2: New way
    const newStyleUrls = buildLessonUrls(lesson);
    
    res.json({
      success: true,
      comparison: {
        oldMethod: {
          url: oldStyleUrl,
          isCloudinary: oldStyleUrl?.includes('cloudinary.com'),
          usesRawUpload: oldStyleUrl?.includes('/raw/upload/'),
          usesImageUpload: oldStyleUrl?.includes('/image/upload/'),
        },
        newMethod: {
          urls: newStyleUrls.fileUrls,
          firstUrl: newStyleUrls.fileUrls?.[0],
          isCloudinary: newStyleUrls.fileUrls?.[0]?.includes('cloudinary.com'),
          usesRawUpload: newStyleUrls.fileUrls?.[0]?.includes('/raw/upload/'),
          usesImageUpload: newStyleUrls.fileUrls?.[0]?.includes('/image/upload/'),
        },
        difference: oldStyleUrl !== newStyleUrls.fileUrls?.[0] ? "URLs differ" : "URLs match",
      },
      recommendation: oldStyleUrl !== newStyleUrls.fileUrls?.[0] 
        ? "❌ Use buildLessonUrls() for proper URL formatting"
        : "✅ URLs match, issue elsewhere",
    });
  } catch (error) {
    console.error("❌ URL comparison error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;