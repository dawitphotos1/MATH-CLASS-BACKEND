// // controllers/courseController.js
// import db from "../models/index.js";
// import path from "path";
// import { fileURLToPath } from "url";
// import fs from "fs";

// const { Course, Lesson, User, Unit, Enrollment } = db;

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // ✅ FIXED: Helper function to build full URLs for course files
// const buildCourseFileUrls = (course) => {
//   const courseData = course.toJSON ? course.toJSON() : { ...course };

//   if (courseData.thumbnail && !courseData.thumbnail.startsWith("http")) {
//     courseData.thumbnail = `${
//       process.env.BACKEND_URL || "http://localhost:3000"
//     }${courseData.thumbnail}`;
//   }

//   return courseData;
// };

// /* ============================================================
//    Create a new course (with file upload support) - SIMPLE CREATION
// ============================================================ */
// export const createCourse = async (req, res) => {
//   try {
//     console.log("📝 Request body:", req.body);
//     console.log("📁 Uploaded files:", req.files);
//     console.log("👤 User:", req.user);

//     const { title, slug, description, price, teacher_id } = req.body;
//     const teacherId = req.user?.id || teacher_id;

//     // Validate required fields
//     if (!title || !slug) {
//       console.log("❌ Missing required fields:", { title, slug });
//       return res.status(400).json({
//         success: false,
//         error: "Title and slug are required",
//         received: { title, slug, description, price, teacherId },
//       });
//     }

//     // ✅ FIXED: Handle file uploads with proper path
//     let thumbnailPath = null;
//     const uploadsDir = path.join(__dirname, "../Uploads");

//     if (!fs.existsSync(uploadsDir)) {
//       fs.mkdirSync(uploadsDir, { recursive: true });
//       console.log("✅ Created Uploads directory");
//     }

//     // Process thumbnail if uploaded
//     if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
//       const thumbnail = req.files.thumbnail[0];
//       const thumbnailFilename = `thumbnail-${Date.now()}-${thumbnail.originalname.replace(
//         /\s+/g,
//         "-"
//       )}`;
//       const thumbnailFullPath = path.join(uploadsDir, thumbnailFilename);

//       fs.writeFileSync(thumbnailFullPath, thumbnail.buffer);
//       thumbnailPath = `/Uploads/${thumbnailFilename}`;
//       console.log("✅ Thumbnail saved:", thumbnailPath);
//     }

//     // Check if course with same slug already exists
//     const existingCourse = await Course.findOne({ where: { slug } });
//     if (existingCourse) {
//       return res.status(400).json({
//         success: false,
//         error: "A course with this slug already exists",
//       });
//     }

//     // Create the course
//     const courseData = {
//       title: title.trim(),
//       slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
//       description: (description || "").trim(),
//       teacher_id: teacherId,
//       price: price ? parseFloat(price) : 0,
//       thumbnail: thumbnailPath,
//     };

//     console.log("📊 Creating course with data:", courseData);

//     const course = await Course.create(courseData);

//     console.log("✅ Course created successfully:", course.id);

//     // ✅ FIXED: Build response with full URLs
//     const courseResponse = buildCourseFileUrls(course);

//     res.status(201).json({
//       success: true,
//       message: "Course created successfully",
//       course: {
//         id: courseResponse.id,
//         title: courseResponse.title,
//         slug: courseResponse.slug,
//         description: courseResponse.description,
//         price: courseResponse.price,
//         thumbnail: courseResponse.thumbnail,
//         teacher_id: courseResponse.teacher_id,
//         created_at: courseResponse.created_at,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error creating course:", error);

//     // Handle specific errors
//     if (error.name === "SequelizeUniqueConstraintError") {
//       return res.status(400).json({
//         success: false,
//         error: "A course with this slug already exists",
//       });
//     }

//     if (error.name === "SequelizeValidationError") {
//       const errors = error.errors.map((err) => err.message);
//       return res.status(400).json({
//         success: false,
//         error: "Validation failed",
//         details: errors,
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: "Failed to create course",
//       details:
//         process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// /* ============================================================
//    Create a new course with units and lessons - ADVANCED CREATION
// ============================================================ */
// export const createCourseWithUnits = async (req, res) => {
//   try {
//     console.log("🎯 Advanced course creation requested");
//     console.log("📝 Request body:", req.body);
//     console.log("📁 Uploaded files:", req.files);
//     console.log("👤 User:", req.user);

//     // Extract form data
//     const {
//       title,
//       slug,
//       description,
//       price,
//       teacher_id,
//       units = [], // Array of units with lessons
//     } = req.body;

//     const teacherId = req.user?.id || teacher_id;

//     // Validate required fields
//     if (!title || !slug) {
//       return res.status(400).json({
//         success: false,
//         error: "Title and slug are required",
//       });
//     }

//     // ✅ FIXED: Handle file uploads with proper path
//     let thumbnailPath = null;
//     const uploadsDir = path.join(__dirname, "../Uploads");

//     if (!fs.existsSync(uploadsDir)) {
//       fs.mkdirSync(uploadsDir, { recursive: true });
//       console.log("✅ Created Uploads directory");
//     }

//     // Process thumbnail if uploaded
//     if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
//       const thumbnail = req.files.thumbnail[0];
//       const thumbnailFilename = `thumbnail-${Date.now()}-${thumbnail.originalname.replace(
//         /\s+/g,
//         "-"
//       )}`;
//       const thumbnailFullPath = path.join(uploadsDir, thumbnailFilename);

//       fs.writeFileSync(thumbnailFullPath, thumbnail.buffer);
//       thumbnailPath = `/Uploads/${thumbnailFilename}`;
//       console.log("✅ Thumbnail saved:", thumbnailPath);
//     }

//     // Check if course with same slug already exists
//     const existingCourse = await Course.findOne({ where: { slug } });
//     if (existingCourse) {
//       return res.status(400).json({
//         success: false,
//         error: "A course with this slug already exists",
//       });
//     }

//     // Create the course
//     const courseData = {
//       title: title.trim(),
//       slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
//       description: (description || "").trim(),
//       teacher_id: teacherId,
//       price: price ? parseFloat(price) : 0,
//       thumbnail: thumbnailPath,
//     };

//     console.log("📊 Creating advanced course with data:", courseData);

//     const course = await Course.create(courseData);
//     console.log("✅ Course created successfully:", course.id);

//     // Create units and lessons if provided
//     let createdUnits = [];
//     let createdLessons = [];

//     if (units && Array.isArray(units) && units.length > 0) {
//       console.log(`📚 Creating ${units.length} units with lessons...`);

//       for (const unit of units) {
//         if (unit.title && unit.lessons && Array.isArray(unit.lessons)) {
//           // Create unit header as a lesson with special type
//           const unitLesson = await Lesson.create({
//             course_id: course.id,
//             title: unit.title,
//             content: unit.description || "",
//             order_index: unit.order_index || 0,
//             content_type: "unit_header",
//             is_preview: false,
//           });
//           createdUnits.push(unitLesson);

//           // Create lessons for this unit
//           for (const lessonData of unit.lessons) {
//             if (lessonData.title) {
//               const lesson = await Lesson.create({
//                 course_id: course.id,
//                 title: lessonData.title,
//                 content: lessonData.content || "",
//                 video_url: lessonData.video_url || null,
//                 order_index: lessonData.order_index || 0,
//                 content_type: lessonData.content_type || "text",
//                 is_preview: lessonData.is_preview || false,
//               });
//               createdLessons.push(lesson);
//             }
//           }
//         }
//       }

//       console.log(
//         `✅ Created ${createdUnits.length} units and ${createdLessons.length} lessons`
//       );
//     }

//     // ✅ FIXED: Build response with full URLs
//     const courseResponse = buildCourseFileUrls(course);

//     res.status(201).json({
//       success: true,
//       message: "Course created successfully with structure",
//       course: {
//         id: courseResponse.id,
//         title: courseResponse.title,
//         slug: courseResponse.slug,
//         description: courseResponse.description,
//         price: courseResponse.price,
//         thumbnail: courseResponse.thumbnail,
//         teacher_id: courseResponse.teacher_id,
//         created_at: courseResponse.created_at,
//       },
//       structure: {
//         units: createdUnits.length,
//         lessons: createdLessons.length,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error creating advanced course:", error);

//     // Handle specific errors
//     if (error.name === "SequelizeUniqueConstraintError") {
//       return res.status(400).json({
//         success: false,
//         error: "A course with this slug already exists",
//       });
//     }

//     if (error.name === "SequelizeValidationError") {
//       const errors = error.errors.map((err) => err.message);
//       return res.status(400).json({
//         success: false,
//         error: "Validation failed",
//         details: errors,
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: "Failed to create course",
//       details:
//         process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// /* ============================================================
//    Get course by ID
// ============================================================ */
// export const getCourseById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const course = await Course.findByPk(id, {
//       attributes: ["id", "title", "description", "price", "thumbnail"],
//       include: [
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email"],
//         },
//       ],
//     });

//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         message: "Course not found",
//       });
//     }

//     // ✅ FIXED: Build full URLs for course
//     const courseData = buildCourseFileUrls(course);

//     res.json({
//       success: true,
//       course: {
//         id: courseData.id,
//         title: courseData.title,
//         description: courseData.description,
//         thumbnail: courseData.thumbnail,
//         teacher: courseData.teacher,
//         price:
//           courseData.price !== undefined && courseData.price !== null
//             ? Number(courseData.price)
//             : 0,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error fetching course by ID:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch course",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// /* ============================================================
//    Get all courses
// ============================================================ */
// export const getCourses = async (req, res) => {
//   try {
//     const courses = await Course.findAll({
//       attributes: [
//         "id",
//         "title",
//         "slug",
//         "description",
//         "teacher_id",
//         "price",
//         "thumbnail",
//         "created_at",
//         "updated_at",
//       ],
//       include: [
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email"],
//         },
//       ],
//       order: [["id", "ASC"]],
//     });

//     // ✅ FIXED: Build full URLs for all courses
//     const formattedCourses = courses.map((course) => {
//       const courseData = buildCourseFileUrls(course);
//       return {
//         ...courseData,
//         price:
//           courseData.price !== undefined && courseData.price !== null
//             ? Number(courseData.price)
//             : 0,
//       };
//     });

//     res.json({
//       success: true,
//       courses: formattedCourses,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching courses:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch courses",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// /* ============================================================
//    Get public course by slug (with lessons)
// ============================================================ */
// export const getPublicCourseBySlug = async (req, res) => {
//   try {
//     const { slug } = req.params;
//     const course = await Course.findOne({
//       where: { slug },
//       attributes: ["id", "title", "slug", "description", "price", "thumbnail"],
//       include: [
//         {
//           model: Lesson,
//           as: "lessons",
//           attributes: [
//             "id",
//             "title",
//             "content",
//             "video_url",
//             "file_url",
//             "order_index",
//             "content_type",
//             "is_preview",
//           ],
//         },
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email"],
//         },
//       ],
//       order: [[{ model: Lesson, as: "lessons" }, "order_index", "ASC"]],
//     });

//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         message: "Course not found",
//       });
//     }

//     // ✅ FIXED: Build full URLs for course and lessons
//     const courseData = buildCourseFileUrls(course);

//     // Build URLs for lessons too
//     if (courseData.lessons && Array.isArray(courseData.lessons)) {
//       courseData.lessons = courseData.lessons.map((lesson) => {
//         const lessonData = { ...lesson };
//         if (lessonData.video_url && !lessonData.video_url.startsWith("http")) {
//           lessonData.video_url = `${
//             process.env.BACKEND_URL || "http://localhost:3000"
//           }${lessonData.video_url}`;
//         }
//         if (lessonData.file_url && !lessonData.file_url.startsWith("http")) {
//           lessonData.file_url = `${
//             process.env.BACKEND_URL || "http://localhost:3000"
//           }${lessonData.file_url}`;
//         }
//         return lessonData;
//       });
//     }

//     res.json({
//       success: true,
//       course: {
//         ...courseData,
//         price:
//           courseData.price !== undefined && courseData.price !== null
//             ? Number(courseData.price)
//             : 0,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error fetching course by slug:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch course",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// /* ============================================================
//    Get lessons for a specific course
// ============================================================ */
// export const getLessonsByCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const lessons = await Lesson.findAll({
//       where: { course_id: courseId },
//       order: [["order_index", "ASC"]],
//     });

//     // ✅ FIXED: Build full URLs for lessons
//     const lessonsWithUrls = lessons.map((lesson) => {
//       const lessonData = lesson.toJSON ? lesson.toJSON() : { ...lesson };

//       if (lessonData.video_url && !lessonData.video_url.startsWith("http")) {
//         lessonData.video_url = `${
//           process.env.BACKEND_URL || "http://localhost:3000"
//         }${lessonData.video_url}`;
//       }

//       if (lessonData.file_url && !lessonData.file_url.startsWith("http")) {
//         lessonData.file_url = `${
//           process.env.BACKEND_URL || "http://localhost:3000"
//         }${lessonData.file_url}`;
//       }

//       return lessonData;
//     });

//     res.json({
//       success: true,
//       lessons: lessonsWithUrls,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching lessons:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch lessons",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// /* ============================================================
//    Delete course - ENHANCED VERSION
// ============================================================ */
// export const deleteCourse = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     console.log("🗑️ DELETE COURSE REQUEST:", {
//       courseId: id,
//       userId,
//       userRole,
//     });

//     // Find the course with teacher info
//     const course = await Course.findByPk(id, {
//       include: [
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email"],
//         },
//       ],
//     });

//     if (!course) {
//       console.log("❌ Course not found:", id);
//       return res.status(404).json({
//         success: false,
//         message: "Course not found",
//       });
//     }

//     console.log("📋 Course found:", {
//       id: course.id,
//       title: course.title,
//       teacher_id: course.teacher_id,
//       current_user_id: userId,
//       user_role: userRole,
//     });

//     // Check authorization - only admin or the course teacher can delete
//     if (userRole !== "admin" && course.teacher_id !== userId) {
//       console.log("❌ Unauthorized delete attempt:", {
//         course_teacher: course.teacher_id,
//         current_user: userId,
//         user_role: userRole,
//       });
//       return res.status(403).json({
//         success: false,
//         message: "Not authorized to delete this course",
//         details: "You can only delete courses that you created",
//       });
//     }

//     // ✅ ENHANCED: Check for existing enrollments before deletion
//     const enrollmentCount = await Enrollment.count({
//       where: { course_id: id },
//     });

//     if (enrollmentCount > 0) {
//       console.log("⚠️ Course has existing enrollments:", enrollmentCount);
//       return res.status(400).json({
//         success: false,
//         message: "Cannot delete course with existing enrollments",
//         details: `This course has ${enrollmentCount} student enrollment(s). Please contact admin for assistance.`,
//       });
//     }

//     console.log("✅ Authorization passed, proceeding with deletion...");

//     // Delete the course (this should cascade delete lessons, units due to foreign key constraints)
//     await course.destroy();

//     console.log("✅ Course deleted successfully:", id);

//     res.json({
//       success: true,
//       message: "Course deleted successfully",
//       deletedCourse: {
//         id: course.id,
//         title: course.title,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error deleting course:", error);

//     // Handle foreign key constraint errors
//     if (error.name === "SequelizeForeignKeyConstraintError") {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Cannot delete course. There are existing enrollments or related data.",
//         error: "Database constraint violation",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Failed to delete course",
//       error:
//         process.env.NODE_ENV === "development"
//           ? error.message
//           : "Internal server error",
//     });
//   }
// };

// // ✅ NEW: Get teacher's courses with enhanced error handling
// export const getTeacherCourses = async (req, res) => {
//   try {
//     const teacherId = req.user.id;
//     console.log("📚 Fetching courses for teacher:", teacherId);

//     const courses = await Course.findAll({
//       where: { teacher_id: teacherId },
//       attributes: [
//         "id",
//         "title",
//         "description",
//         "slug",
//         "price",
//         "thumbnail",
//         "created_at",
//       ],
//       include: [
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email"],
//         },
//         {
//           model: Unit,
//           as: "units",
//           attributes: ["id"],
//         },
//         {
//           model: Lesson,
//           as: "lessons",
//           attributes: ["id"],
//         },
//       ],
//       order: [["created_at", "DESC"]],
//     });

//     // Add counts to each course
//     const coursesWithCounts = courses.map((course) => ({
//       ...course.toJSON(),
//       unit_count: course.units?.length || 0,
//       lesson_count: course.lessons?.length || 0,
//     }));

//     console.log(
//       `✅ Found ${coursesWithCounts.length} courses for teacher ${teacherId}`
//     );

//     res.json({
//       success: true,
//       courses: coursesWithCounts,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching teacher courses:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch courses",
//       details:
//         process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };





// controllers/courseController.js
import db from "../models/index.js";

const { Course, Lesson, User, Enrollment } = db;

/* --------------------------------------------
   CREATE COURSE
-------------------------------------------- */
export const createCourse = async (req, res) => {
  try {
    const { title, slug, description, price } = req.body;

    if (!title || !slug) {
      return res.status(400).json({
        success: false,
        error: "Title and slug are required",
      });
    }

    const existing = await Course.findOne({ where: { slug } });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: "A course with this slug already exists",
      });
    }

    let thumbnail = null;
    if (req.files?.thumbnail?.[0]) {
      thumbnail = req.files.thumbnail[0].path; // Cloudinary URL
    }

    const course = await Course.create({
      title,
      slug,
      description,
      teacher_id: req.user.id,
      price: price ? parseFloat(price) : 0,
      thumbnail,
    });

    res.status(201).json({ success: true, course });
  } catch (err) {
    console.error("Create course error:", err);
    res.status(500).json({ success: false, error: "Failed to create course" });
  }
};

/* --------------------------------------------
   GET ALL COURSES
-------------------------------------------- */
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [{ model: User, as: "teacher" }],
      order: [["created_at", "DESC"]],
    });

    res.json({ success: true, courses });
  } catch {
    res.status(500).json({ success: false, error: "Failed to load courses" });
  }
};

/* --------------------------------------------
   GET COURSE BY SLUG - PUBLIC
-------------------------------------------- */
export const getPublicCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({
      where: { slug: req.params.slug },
      include: [
        { model: Lesson, as: "lessons", order: [["order_index", "ASC"]] },
        { model: User, as: "teacher" },
      ],
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }

    res.json({ success: true, course });
  } catch {
    res.status(500).json({ success: false, error: "Failed to load course" });
  }
};

/* --------------------------------------------
   DELETE COURSE
-------------------------------------------- */
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }

    if (course.teacher_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this course",
      });
    }

    const enrollments = await Enrollment.count({
      where: { course_id: req.params.id },
    });

    if (enrollments > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete course with active enrollments",
      });
    }

    await course.destroy();

    res.json({ success: true, message: "Course deleted" });
  } catch {
    res.status(500).json({ success: false, error: "Failed to delete course" });
  }
};
