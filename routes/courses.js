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
// } from "../controllers/courseController.js";
// import authenticateToken from "../middleware/authenticateToken.js";
// import checkTeacherOrAdmin from "../middleware/checkTeacherOrAdmin.js";
// import { isTeacher, isAdmin } from "../middleware/authMiddleware.js";
// import { uploadCourseFiles } from "../middleware/uploadMiddleware.js";
// import db from "../models/index.js";

// const { Course, User, Lesson, Unit } = db;

// const router = express.Router();

// /* ========================================================
//    🟢 PUBLIC ROUTES --- accessible without login
// ======================================================== */

// // View all courses (public)
// router.get("/", getCourses);

// // View a specific course by slug (public)
// router.get("/:slug", getPublicCourseBySlug);

// // ✅ Get course by ID (public)
// router.get("/id/:id", getCourseById);

// // View lessons by course (public)
// router.get("/:courseId/lessons", getLessonsByCourse);

// /* ========================================================
//    🔐 PROTECTED ROUTES --- restricted to teachers/admins
// ======================================================== */

// // Create a new course (requires teacher/admin)
// router.post(
//   "/",
//   authenticateToken,
//   checkTeacherOrAdmin,
//   uploadCourseFiles,
//   createCourse
// );

// // Create course with /create endpoint
// router.post(
//   "/create",
//   authenticateToken,
//   checkTeacherOrAdmin,
//   uploadCourseFiles,
//   createCourse
// );

// // Create a new course with units (requires teacher/admin)
// router.post(
//   "/create-with-units",
//   authenticateToken,
//   checkTeacherOrAdmin,
//   uploadCourseFiles,
//   createCourseWithUnits
// );

// // Delete a course (requires teacher/admin)
// router.delete("/:id", authenticateToken, checkTeacherOrAdmin, deleteCourse);

// /* ============================================================
//    👨‍🏫 TEACHER DASHBOARD ROUTES
// ============================================================ */

// /**
//  * ✅ Get teacher's courses with full structure (units + lessons)
//  * GET /api/v1/courses/teacher/my-courses-detailed
//  */
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
//                   "order_index",
//                   "content_type",
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

//       res.json({
//         success: true,
//         courses: courses || [],
//       });
//     } catch (error) {
//       console.error("❌ Error fetching teacher courses with details:", error);
//       res.status(500).json({
//         success: false,
//         error: "Failed to fetch courses",
//       });
//     }
//   }
// );

// /**
//  * ✅ Get single course with full structure for teacher
//  * GET /api/v1/courses/teacher/:courseId/full
//  */
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
//                   "order_index",
//                   "content_type",
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

//       res.json({
//         success: true,
//         course,
//       });
//     } catch (error) {
//       console.error("❌ Error fetching course details:", error);
//       res.status(500).json({
//         success: false,
//         error: "Failed to fetch course",
//       });
//     }
//   }
// );

// /**
//  * ✅ Get teacher's courses (simple list)
//  * GET /api/v1/courses/teacher/my-courses
//  */
// router.get(
//   "/teacher/my-courses",
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
//             model: User,
//             as: "teacher",
//             attributes: ["id", "name", "email"],
//           },
//           {
//             model: Unit,
//             as: "units",
//             attributes: ["id"],
//           },
//           {
//             model: Lesson,
//             as: "lessons",
//             attributes: ["id"],
//           },
//         ],
//         order: [["created_at", "DESC"]],
//       });

//       // Add counts to each course
//       const coursesWithCounts = courses.map(course => ({
//         ...course.toJSON(),
//         unit_count: course.units?.length || 0,
//         lesson_count: course.lessons?.length || 0,
//       }));

//       res.json({
//         success: true,
//         courses: coursesWithCounts,
//       });
//     } catch (error) {
//       console.error("❌ Error fetching teacher courses:", error);
//       res.status(500).json({
//         success: false,
//         error: "Failed to fetch courses",
//       });
//     }
//   }
// );

// /**
//  * ✅ Get lessons for a specific course (protected)
//  * GET /api/v1/courses/:courseId/lessons
//  */
// router.get("/:courseId/lessons", authenticateToken, async (req, res) => {
//   try {
//     const { courseId } = req.params;

//     const lessons = await Lesson.findAll({
//       where: { course_id: courseId },
//       order: [["order_index", "ASC"]],
//       attributes: [
//         "id",
//         "title",
//         "content",
//         "video_url",
//         "order_index",
//         "content_type",
//         "created_at",
//       ],
//       include: [
//         {
//           model: Unit,
//           as: "unit",
//           attributes: ["id", "title"],
//         },
//       ],
//     });

//     res.json({
//       success: true,
//       lessons: lessons || [],
//     });
//   } catch (error) {
//     console.error("❌ Error fetching lessons:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch lessons",
//     });
//   }
// });

// /**
//  * ✅ Delete a course (teacher or admin only)
//  * DELETE /api/v1/courses/:courseId
//  */
// router.delete("/:courseId", authenticateToken, async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     const course = await Course.findByPk(courseId);

//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         error: "Course not found",
//       });
//     }

//     // Check if user is the teacher who owns the course or an admin
//     if (userRole !== "admin" && course.teacher_id !== userId) {
//       return res.status(403).json({
//         success: false,
//         error: "Not authorized to delete this course",
//       });
//     }

//     await course.destroy();

//     res.json({
//       success: true,
//       message: "Course deleted successfully",
//     });
//   } catch (error) {
//     console.error("❌ Error deleting course:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to delete course",
//     });
//   }
// });

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
   🟢 PUBLIC ROUTES --- accessible without login
======================================================== */

// View all courses (public)
router.get("/", getCourses);

// View a specific course by slug (public)
router.get("/:slug", getPublicCourseBySlug);

// ✅ Get course by ID (public)
router.get("/id/:id", getCourseById);

// View lessons by course (public)
router.get("/:courseId/lessons", getLessonsByCourse);

/* ========================================================
   🔐 PROTECTED ROUTES --- restricted to teachers/admins
======================================================== */

// Create a new course (requires teacher/admin)
router.post(
  "/",
  authenticateToken,
  checkTeacherOrAdmin,
  uploadCourseFiles,
  createCourse
);

// Create course with /create endpoint
router.post(
  "/create",
  authenticateToken,
  checkTeacherOrAdmin,
  uploadCourseFiles,
  createCourse
);

// Create a new course with units (requires teacher/admin)
router.post(
  "/create-with-units",
  authenticateToken,
  checkTeacherOrAdmin,
  uploadCourseFiles,
  createCourseWithUnits
);

// ✅ FIXED: Delete a course (requires teacher/admin) - Use the controller function
router.delete("/:id", authenticateToken, deleteCourse);

/* ============================================================
   👨‍🏫 TEACHER DASHBOARD ROUTES
============================================================ */

/**
 * ✅ Get teacher's courses with full structure (units + lessons)
 * GET /api/v1/courses/teacher/my-courses-detailed
 */
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
                  "order_index",
                  "content_type",
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

      res.json({
        success: true,
        courses: courses || [],
      });
    } catch (error) {
      console.error("❌ Error fetching teacher courses with details:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch courses",
      });
    }
  }
);

/**
 * ✅ Get teacher's courses (simple list) - USING CONTROLLER FUNCTION
 * GET /api/v1/courses/teacher/my-courses
 */
router.get(
  "/teacher/my-courses",
  authenticateToken,
  isTeacher,
  getTeacherCourses
);

/**
 * ✅ Get single course with full structure for teacher
 * GET /api/v1/courses/teacher/:courseId/full
 */
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
                  "order_index",
                  "content_type",
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

      res.json({
        success: true,
        course,
      });
    } catch (error) {
      console.error("❌ Error fetching course details:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch course",
      });
    }
  }
);

/**
 * ✅ Get lessons for a specific course (protected)
 * GET /api/v1/courses/:courseId/lessons
 */
router.get("/:courseId/lessons", authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.params;

    const lessons = await Lesson.findAll({
      where: { course_id: courseId },
      order: [["order_index", "ASC"]],
      attributes: [
        "id",
        "title",
        "content",
        "video_url",
        "order_index",
        "content_type",
        "created_at",
      ],
      include: [
        {
          model: Unit,
          as: "unit",
          attributes: ["id", "title"],
        },
      ],
    });

    res.json({
      success: true,
      lessons: lessons || [],
    });
  } catch (error) {
    console.error("❌ Error fetching lessons:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch lessons",
    });
  }
});

export default router;