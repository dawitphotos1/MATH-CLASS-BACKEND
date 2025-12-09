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
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { getFolderForFile, uploadLocalFileToCloudinary } from "../utils/cloudinary.js";

const { Course, Lesson, User, Unit, Enrollment } = db;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to build full URLs for course files with Cloudinary support
const buildCourseFileUrls = (course) => {
  const courseData = course.toJSON ? course.toJSON() : { ...course };

  // Process thumbnail URL
  if (courseData.thumbnail) {
    // Already a Cloudinary URL
    if (courseData.thumbnail.includes('cloudinary.com')) {
      return courseData;
    }
    
    // Local file path in production (shouldn't happen after migration)
    if (process.env.NODE_ENV === "production" && !courseData.thumbnail.startsWith("http")) {
      console.warn(`⚠️ Course ${courseData.id} has local thumbnail in production: ${courseData.thumbnail}`);
      // Try to construct Cloudinary URL (may not exist)
      const filename = path.basename(courseData.thumbnail);
      return courseData;
    }
    
    // Development: Build local URL
    if (!courseData.thumbnail.startsWith("http")) {
      courseData.thumbnail = `${process.env.BACKEND_URL || "http://localhost:3000"}${courseData.thumbnail}`;
    }
  }

  return courseData;
};

// Helper to import buildFileUrls from lessonController
const importBuildFileUrls = async () => {
  try {
    const module = await import('./lessonController.js');
    return module.buildFileUrls || module.default?.buildFileUrls;
  } catch (error) {
    console.warn('Could not import buildFileUrls from lessonController:', error.message);
    return null;
  }
};

/* ============================================================
   Create a new course (with file upload support)
============================================================ */
export const createCourse = async (req, res) => {
  try {
    console.log("📝 Course creation request");
    console.log("📝 Request body:", req.body);
    console.log("📁 Uploaded files:", req.files ? Object.keys(req.files) : "None");
    console.log("👤 User:", req.user?.id, req.user?.role);

    const { title, slug, description, price, teacher_id } = req.body;
    const teacherId = req.user?.id || teacher_id;

    // Validate required fields
    if (!title || !slug) {
      console.log("❌ Missing required fields:", { title, slug });
      return res.status(400).json({
        success: false,
        error: "Title and slug are required",
        received: { title, slug, description, price, teacherId },
      });
    }

    let thumbnailPath = null;

    // Process thumbnail if uploaded
    if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
      const thumbnail = req.files.thumbnail[0];
      
      if (process.env.NODE_ENV === "production") {
        // Production: Upload to Cloudinary
        try {
          // Save temporarily to local file
          const uploadsDir = path.join(__dirname, "../Uploads");
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          const tempFilename = `temp_thumbnail_${Date.now()}_${thumbnail.originalname}`;
          const tempPath = path.join(uploadsDir, tempFilename);
          
          // Write buffer to temp file
          fs.writeFileSync(tempPath, thumbnail.buffer);
          
          // Upload to Cloudinary
          const folder = getFolderForFile(thumbnail.originalname);
          thumbnailPath = await uploadLocalFileToCloudinary(tempPath, folder);
          
          // Clean up temp file
          fs.unlinkSync(tempPath);
          
          console.log("✅ Thumbnail uploaded to Cloudinary:", thumbnailPath.substring(0, 80) + "...");
        } catch (cloudinaryError) {
          console.error("❌ Cloudinary upload failed, falling back to local:", cloudinaryError.message);
          
          // Fallback to local storage
          const uploadsDir = path.join(__dirname, "../Uploads");
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          const thumbnailFilename = `thumbnail-${Date.now()}-${thumbnail.originalname.replace(/\s+/g, "-")}`;
          const thumbnailFullPath = path.join(uploadsDir, thumbnailFilename);
          fs.writeFileSync(thumbnailFullPath, thumbnail.buffer);
          thumbnailPath = `/Uploads/${thumbnailFilename}`;
          console.log("✅ Thumbnail saved locally (fallback):", thumbnailPath);
        }
      } else {
        // Local development
        const uploadsDir = path.join(__dirname, "../Uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
          console.log("✅ Created Uploads directory");
        }
        
        const thumbnailFilename = `thumbnail-${Date.now()}-${thumbnail.originalname.replace(/\s+/g, "-")}`;
        const thumbnailFullPath = path.join(uploadsDir, thumbnailFilename);
        fs.writeFileSync(thumbnailFullPath, thumbnail.buffer);
        thumbnailPath = `/Uploads/${thumbnailFilename}`;
        console.log("✅ Thumbnail saved locally:", thumbnailPath);
      }
    }

    // Check if course with same slug already exists
    const existingCourse = await Course.findOne({ where: { slug } });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        error: "A course with this slug already exists",
      });
    }

    // Create the course
    const courseData = {
      title: title.trim(),
      slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
      description: (description || "").trim(),
      teacher_id: teacherId,
      price: price ? parseFloat(price) : 0,
      thumbnail: thumbnailPath,
    };

    console.log("📊 Creating course with data:", {
      ...courseData,
      thumbnail: thumbnailPath ? `${thumbnailPath.substring(0, 60)}...` : null
    });

    const course = await Course.create(courseData);

    console.log("✅ Course created successfully:", course.id);

    // Build response with full URLs
    const courseResponse = buildCourseFileUrls(course);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: {
        id: courseResponse.id,
        title: courseResponse.title,
        slug: courseResponse.slug,
        description: courseResponse.description,
        price: courseResponse.price,
        thumbnail: courseResponse.thumbnail,
        teacher_id: courseResponse.teacher_id,
        created_at: courseResponse.created_at,
      },
    });
  } catch (error) {
    console.error("❌ Error creating course:", error);

    // Handle specific errors
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        error: "A course with this slug already exists",
      });
    }

    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create course",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/* ============================================================
   Create a new course with units and lessons
============================================================ */
export const createCourseWithUnits = async (req, res) => {
  try {
    console.log("🎯 Advanced course creation requested");
    console.log("📝 Request body:", req.body);
    console.log("📁 Uploaded files:", req.files ? Object.keys(req.files) : "None");
    console.log("👤 User:", req.user?.id, req.user?.role);

    // Extract form data
    const {
      title,
      slug,
      description,
      price,
      teacher_id,
      units = [], // Array of units with lessons
    } = req.body;

    const teacherId = req.user?.id || teacher_id;

    // Validate required fields
    if (!title || !slug) {
      return res.status(400).json({
        success: false,
        error: "Title and slug are required",
      });
    }

    let thumbnailPath = null;

    // Process thumbnail if uploaded
    if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
      const thumbnail = req.files.thumbnail[0];
      
      if (process.env.NODE_ENV === "production") {
        // Production: Upload to Cloudinary
        try {
          const uploadsDir = path.join(__dirname, "../Uploads");
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          const tempFilename = `temp_thumbnail_${Date.now()}_${thumbnail.originalname}`;
          const tempPath = path.join(uploadsDir, tempFilename);
          
          fs.writeFileSync(tempPath, thumbnail.buffer);
          
          const folder = getFolderForFile(thumbnail.originalname);
          thumbnailPath = await uploadLocalFileToCloudinary(tempPath, folder);
          
          fs.unlinkSync(tempPath);
          
          console.log("✅ Thumbnail uploaded to Cloudinary:", thumbnailPath.substring(0, 80) + "...");
        } catch (cloudinaryError) {
          console.error("❌ Cloudinary upload failed:", cloudinaryError.message);
          
          // Fallback to local
          const uploadsDir = path.join(__dirname, "../Uploads");
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          const thumbnailFilename = `thumbnail-${Date.now()}-${thumbnail.originalname.replace(/\s+/g, "-")}`;
          const thumbnailFullPath = path.join(uploadsDir, thumbnailFilename);
          fs.writeFileSync(thumbnailFullPath, thumbnail.buffer);
          thumbnailPath = `/Uploads/${thumbnailFilename}`;
          console.log("✅ Thumbnail saved locally (fallback):", thumbnailPath);
        }
      } else {
        // Local development
        const uploadsDir = path.join(__dirname, "../Uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
          console.log("✅ Created Uploads directory");
        }
        
        const thumbnailFilename = `thumbnail-${Date.now()}-${thumbnail.originalname.replace(/\s+/g, "-")}`;
        const thumbnailFullPath = path.join(uploadsDir, thumbnailFilename);
        fs.writeFileSync(thumbnailFullPath, thumbnail.buffer);
        thumbnailPath = `/Uploads/${thumbnailFilename}`;
        console.log("✅ Thumbnail saved locally:", thumbnailPath);
      }
    }

    // Check if course with same slug already exists
    const existingCourse = await Course.findOne({ where: { slug } });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        error: "A course with this slug already exists",
      });
    }

    // Create the course
    const courseData = {
      title: title.trim(),
      slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
      description: (description || "").trim(),
      teacher_id: teacherId,
      price: price ? parseFloat(price) : 0,
      thumbnail: thumbnailPath,
    };

    console.log("📊 Creating advanced course with data:", {
      ...courseData,
      thumbnail: thumbnailPath ? `${thumbnailPath.substring(0, 60)}...` : null
    });

    const course = await Course.create(courseData);
    console.log("✅ Course created successfully:", course.id);

    // Create units and lessons if provided
    let createdUnits = [];
    let createdLessons = [];

    if (units && Array.isArray(units) && units.length > 0) {
      console.log(`📚 Creating ${units.length} units with lessons...`);

      for (const unit of units) {
        if (unit.title && unit.lessons && Array.isArray(unit.lessons)) {
          // Create unit header as a lesson with special type
          const unitLesson = await Lesson.create({
            course_id: course.id,
            title: unit.title,
            content: unit.description || "",
            order_index: unit.order_index || 0,
            content_type: "unit_header",
            is_preview: false,
          });
          createdUnits.push(unitLesson);

          // Create lessons for this unit
          for (const lessonData of unit.lessons) {
            if (lessonData.title) {
              const lesson = await Lesson.create({
                course_id: course.id,
                title: lessonData.title,
                content: lessonData.content || "",
                video_url: lessonData.video_url || null,
                order_index: lessonData.order_index || 0,
                content_type: lessonData.content_type || "text",
                is_preview: lessonData.is_preview || false,
              });
              createdLessons.push(lesson);
            }
          }
        }
      }

      console.log(`✅ Created ${createdUnits.length} units and ${createdLessons.length} lessons`);
    }

    // Build response with full URLs
    const courseResponse = buildCourseFileUrls(course);

    res.status(201).json({
      success: true,
      message: "Course created successfully with structure",
      course: {
        id: courseResponse.id,
        title: courseResponse.title,
        slug: courseResponse.slug,
        description: courseResponse.description,
        price: courseResponse.price,
        thumbnail: courseResponse.thumbnail,
        teacher_id: courseResponse.teacher_id,
        created_at: courseResponse.created_at,
      },
      structure: {
        units: createdUnits.length,
        lessons: createdLessons.length,
      },
    });
  } catch (error) {
    console.error("❌ Error creating advanced course:", error);

    // Handle specific errors
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        error: "A course with this slug already exists",
      });
    }

    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create course",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/* ============================================================
   Get course by ID
============================================================ */
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id, {
      attributes: ["id", "title", "description", "price", "thumbnail"],
      include: [
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
        message: "Course not found",
      });
    }

    // Build full URLs for course
    const courseData = buildCourseFileUrls(course);

    res.json({
      success: true,
      course: {
        id: courseData.id,
        title: courseData.title,
        description: courseData.description,
        thumbnail: courseData.thumbnail,
        teacher: courseData.teacher,
        price: courseData.price !== undefined && courseData.price !== null
          ? Number(courseData.price)
          : 0,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching course by ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/* ============================================================
   Get all courses
============================================================ */
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      attributes: [
        "id",
        "title",
        "slug",
        "description",
        "teacher_id",
        "price",
        "thumbnail",
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

    // Build full URLs for all courses
    const formattedCourses = courses.map((course) => {
      const courseData = buildCourseFileUrls(course);
      return {
        ...courseData,
        price: courseData.price !== undefined && courseData.price !== null
          ? Number(courseData.price)
          : 0,
      };
    });

    res.json({
      success: true,
      courses: formattedCourses,
    });
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/* ============================================================
   Get public course by slug (with lessons)
============================================================ */
export const getPublicCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const course = await Course.findOne({
      where: { slug },
      attributes: ["id", "title", "slug", "description", "price", "thumbnail"],
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
          ],
        },
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [[{ model: Lesson, as: "lessons" }, "order_index", "ASC"]],
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Build full URLs for course
    const courseData = buildCourseFileUrls(course);

    // Get buildFileUrls function for lessons
    const buildFileUrlsFunc = await importBuildFileUrls();
    
    // Build URLs for lessons
    if (courseData.lessons && Array.isArray(courseData.lessons)) {
      if (buildFileUrlsFunc) {
        // Use the imported function
        courseData.lessons = courseData.lessons.map(buildFileUrlsFunc);
      } else {
        // Fallback to manual URL building
        courseData.lessons = courseData.lessons.map((lesson) => {
          const lessonData = { ...lesson };
          const backend = process.env.BACKEND_URL || "http://localhost:3000";
          
          if (lessonData.video_url && !lessonData.video_url.startsWith("http")) {
            lessonData.video_url = `${backend}${lessonData.video_url}`;
          }
          if (lessonData.file_url && !lessonData.file_url.startsWith("http")) {
            lessonData.file_url = `${backend}${lessonData.file_url}`;
          }
          return lessonData;
        });
      }
    }

    res.json({
      success: true,
      course: {
        ...courseData,
        price: courseData.price !== undefined && courseData.price !== null
          ? Number(courseData.price)
          : 0,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching course by slug:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/* ============================================================
   Get lessons for a specific course
============================================================ */
export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.findAll({
      where: { course_id: courseId },
      order: [["order_index", "ASC"]],
    });

    // Get buildFileUrls function
    const buildFileUrlsFunc = await importBuildFileUrls();
    
    let lessonsWithUrls;
    
    if (buildFileUrlsFunc) {
      // Use the imported function
      lessonsWithUrls = lessons.map(buildFileUrlsFunc);
    } else {
      // Fallback to manual URL building
      lessonsWithUrls = lessons.map((lesson) => {
        const lessonData = lesson.toJSON ? lesson.toJSON() : { ...lesson };
        const backend = process.env.BACKEND_URL || "http://localhost:3000";

        if (lessonData.video_url && !lessonData.video_url.startsWith("http")) {
          lessonData.video_url = `${backend}${lessonData.video_url}`;
        }

        if (lessonData.file_url && !lessonData.file_url.startsWith("http")) {
          lessonData.file_url = `${backend}${lessonData.file_url}`;
        }

        return lessonData;
      });
    }

    res.json({
      success: true,
      lessons: lessonsWithUrls,
    });
  } catch (error) {
    console.error("❌ Error fetching lessons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lessons",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/* ============================================================
   Delete course - ENHANCED VERSION
============================================================ */
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log("🗑️ DELETE COURSE REQUEST:", {
      courseId: id,
      userId,
      userRole,
    });

    // Find the course with teacher info
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
      console.log("❌ Course not found:", id);
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    console.log("📋 Course found:", {
      id: course.id,
      title: course.title,
      teacher_id: course.teacher_id,
      current_user_id: userId,
      user_role: userRole,
    });

    // Check authorization - only admin or the course teacher can delete
    if (userRole !== "admin" && course.teacher_id !== userId) {
      console.log("❌ Unauthorized delete attempt:", {
        course_teacher: course.teacher_id,
        current_user: userId,
        user_role: userRole,
      });
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this course",
        details: "You can only delete courses that you created",
      });
    }

    // Check for existing enrollments before deletion
    const enrollmentCount = await Enrollment.count({
      where: { course_id: id },
    });

    if (enrollmentCount > 0) {
      console.log("⚠️ Course has existing enrollments:", enrollmentCount);
      return res.status(400).json({
        success: false,
        message: "Cannot delete course with existing enrollments",
        details: `This course has ${enrollmentCount} student enrollment(s). Please contact admin for assistance.`,
      });
    }

    console.log("✅ Authorization passed, proceeding with deletion...");

    // Delete the course (cascades to lessons, units)
    await course.destroy();

    console.log("✅ Course deleted successfully:", id);

    res.json({
      success: true,
      message: "Course deleted successfully",
      deletedCourse: {
        id: course.id,
        title: course.title,
      },
    });
  } catch (error) {
    console.error("❌ Error deleting course:", error);

    // Handle foreign key constraint errors
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete course. There are existing enrollments or related data.",
        error: "Database constraint violation",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete course",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    });
  }
};

/* ============================================================
   Get teacher's courses with enhanced error handling
============================================================ */
export const getTeacherCourses = async (req, res) => {
  try {
    const teacherId = req.user.id;
    console.log("📚 Fetching courses for teacher:", teacherId);

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
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
        },
        {
          model: Unit,
          as: "units",
          attributes: ["id"],
        },
        {
          model: Lesson,
          as: "lessons",
          attributes: ["id"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // Build URLs and add counts to each course
    const coursesWithCounts = courses.map((course) => {
      const courseData = buildCourseFileUrls(course);
      return {
        ...courseData,
        unit_count: course.units?.length || 0,
        lesson_count: course.lessons?.length || 0,
      };
    });

    console.log(`✅ Found ${coursesWithCounts.length} courses for teacher ${teacherId}`);

    res.json({
      success: true,
      courses: coursesWithCounts,
    });
  } catch (error) {
    console.error("❌ Error fetching teacher courses:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch courses",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/* ============================================================
   Update course
============================================================ */
export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price } = req.body;

    console.log("📝 Course update request:", { id, title, description, price });

    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Check authorization
    const userRole = req.user.role;
    if (userRole !== "admin" && course.teacher_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this course",
      });
    }

    // Update fields
    if (title !== undefined) course.title = title.trim();
    if (description !== undefined) course.description = description.trim();
    if (price !== undefined) course.price = parseFloat(price);

    // Handle thumbnail update
    if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
      const thumbnail = req.files.thumbnail[0];
      
      if (process.env.NODE_ENV === "production") {
        // Production: Upload to Cloudinary
        try {
          const uploadsDir = path.join(__dirname, "../Uploads");
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          const tempFilename = `temp_thumbnail_${Date.now()}_${thumbnail.originalname}`;
          const tempPath = path.join(uploadsDir, tempFilename);
          
          fs.writeFileSync(tempPath, thumbnail.buffer);
          
          const folder = getFolderForFile(thumbnail.originalname);
          const cloudinaryUrl = await uploadLocalFileToCloudinary(tempPath, folder);
          
          fs.unlinkSync(tempPath);
          
          course.thumbnail = cloudinaryUrl;
          console.log("✅ Thumbnail updated on Cloudinary:", cloudinaryUrl.substring(0, 80) + "...");
        } catch (cloudinaryError) {
          console.error("❌ Cloudinary upload failed:", cloudinaryError.message);
          
          // Fallback to local
          const uploadsDir = path.join(__dirname, "../Uploads");
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          const thumbnailFilename = `thumbnail-${Date.now()}-${thumbnail.originalname.replace(/\s+/g, "-")}`;
          const thumbnailFullPath = path.join(uploadsDir, thumbnailFilename);
          fs.writeFileSync(thumbnailFullPath, thumbnail.buffer);
          course.thumbnail = `/Uploads/${thumbnailFilename}`;
          console.log("✅ Thumbnail updated locally (fallback):", course.thumbnail);
        }
      } else {
        // Local development
        const uploadsDir = path.join(__dirname, "../Uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const thumbnailFilename = `thumbnail-${Date.now()}-${thumbnail.originalname.replace(/\s+/g, "-")}`;
        const thumbnailFullPath = path.join(uploadsDir, thumbnailFilename);
        fs.writeFileSync(thumbnailFullPath, thumbnail.buffer);
        course.thumbnail = `/Uploads/${thumbnailFilename}`;
        console.log("✅ Thumbnail updated locally:", course.thumbnail);
      }
    }

    await course.save();

    const updatedCourse = buildCourseFileUrls(course);

    res.json({
      success: true,
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("❌ Error updating course:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update course",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/* ============================================================
   Search courses
============================================================ */
export const searchCourses = async (req, res) => {
  try {
    const { query, minPrice, maxPrice } = req.query;

    const whereClause = {};

    if (query) {
      whereClause[db.Sequelize.Op.or] = [
        { title: { [db.Sequelize.Op.iLike]: `%${query}%` } },
        { description: { [db.Sequelize.Op.iLike]: `%${query}%` } },
      ];
    }

    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[db.Sequelize.Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.price[db.Sequelize.Op.lte] = parseFloat(maxPrice);
    }

    const courses = await Course.findAll({
      where: whereClause,
      attributes: ["id", "title", "description", "price", "thumbnail", "slug"],
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["title", "ASC"]],
    });

    // Build URLs for all courses
    const formattedCourses = courses.map((course) => {
      const courseData = buildCourseFileUrls(course);
      return {
        ...courseData,
        price: courseData.price !== undefined && courseData.price !== null
          ? Number(courseData.price)
          : 0,
      };
    });

    res.json({
      success: true,
      courses: formattedCourses,
      count: formattedCourses.length,
    });
  } catch (error) {
    console.error("❌ Error searching courses:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search courses",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/* ============================================================
   Get course analytics
============================================================ */
export const getCourseAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const course = await Course.findByPk(id, {
      attributes: ["id", "title", "description", "price", "thumbnail", "teacher_id"],
      include: [
        {
          model: Lesson,
          as: "lessons",
          attributes: ["id", "title"],
        },
        {
          model: Enrollment,
          as: "enrollments",
          attributes: ["id", "approval_status", "payment_status"],
        },
      ],
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // Check authorization
    if (userRole !== "admin" && course.teacher_id !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to view analytics for this course",
      });
    }

    const analytics = {
      course: {
        id: course.id,
        title: course.title,
        price: course.price,
        thumbnail: buildCourseFileUrls(course).thumbnail,
      },
      stats: {
        totalLessons: course.lessons?.length || 0,
        totalEnrollments: course.enrollments?.length || 0,
        approvedEnrollments: course.enrollments?.filter(e => e.approval_status === "approved").length || 0,
        pendingEnrollments: course.enrollments?.filter(e => e.approval_status === "pending").length || 0,
        paidEnrollments: course.enrollments?.filter(e => e.payment_status === "paid").length || 0,
      },
    };

    res.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("❌ Error fetching course analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch course analytics",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export default {
  createCourse,
  createCourseWithUnits,
  getCourseById,
  getCourses,
  getPublicCourseBySlug,
  getLessonsByCourse,
  deleteCourse,
  getTeacherCourses,
  updateCourse,
  searchCourses,
  getCourseAnalytics,
};