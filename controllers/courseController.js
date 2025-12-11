// // controllers/courseController.js
// import db from "../models/index.js";
// import path from "path";
// import { fileURLToPath } from "url";
// import fs from "fs";

// const { Course, Lesson, User, Unit, Enrollment } = db;

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Import Cloudinary functions
// import { uploadToCloudinary } from "../middleware/cloudinaryUpload.js";

// // Helper function to build full URLs for course files
// const buildCourseFileUrls = (course) => {
//   const courseData = course.toJSON ? course.toJSON() : { ...course };

//   // If thumbnail is already a Cloudinary URL or full URL, return as-is
//   if (courseData.thumbnail && (courseData.thumbnail.includes('cloudinary.com') || courseData.thumbnail.startsWith('http'))) {
//     return courseData;
//   }

//   // If thumbnail is a local path, convert to URL
//   if (courseData.thumbnail && !courseData.thumbnail.startsWith('http')) {
//     const backend = process.env.BACKEND_URL || 'http://localhost:3000';
//     courseData.thumbnail = `${backend}${courseData.thumbnail}`;
//   }

//   return courseData;
// };

// /* ============================================================
//    Create a new course (with file upload support)
// ============================================================ */
// export const createCourse = async (req, res) => {
//   try {
//     console.log("📝 Course creation request");
//     console.log("👤 User:", req.user?.id, req.user?.role);

//     const { title, slug, description, price, teacher_id } = req.body;
//     const teacherId = req.user?.id || teacher_id;

//     // Validate required fields
//     if (!title || !slug) {
//       return res.status(400).json({
//         success: false,
//         error: "Title and slug are required",
//         received: { title, slug, description, price, teacherId },
//       });
//     }

//     let thumbnailUrl = null;

//     // Process thumbnail if uploaded
//     if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
//       const thumbnail = req.files.thumbnail[0];
      
//       try {
//         // Upload to Cloudinary
//         const result = await uploadToCloudinary(
//           thumbnail.buffer,
//           'mathe-class/course-thumbnails',
//           'image'
//         );
        
//         thumbnailUrl = result.secure_url;
//         console.log("✅ Thumbnail uploaded to Cloudinary:", thumbnailUrl.substring(0, 80) + "...");
        
//       } catch (cloudinaryError) {
//         console.error("❌ Cloudinary upload failed:", cloudinaryError.message);
        
//         // Fallback: Save locally (for development or backup)
//         const uploadsDir = path.join(__dirname, "../Uploads");
//         if (!fs.existsSync(uploadsDir)) {
//           fs.mkdirSync(uploadsDir, { recursive: true });
//         }
        
//         const thumbnailFilename = `thumbnail-${Date.now()}-${thumbnail.originalname.replace(/\s+/g, "-")}`;
//         const thumbnailFullPath = path.join(uploadsDir, thumbnailFilename);
//         fs.writeFileSync(thumbnailFullPath, thumbnail.buffer);
//         thumbnailUrl = `/Uploads/${thumbnailFilename}`;
//         console.log("✅ Thumbnail saved locally (fallback):", thumbnailUrl);
//       }
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
//       thumbnail: thumbnailUrl,
//     };

//     console.log("📊 Creating course with data:", {
//       ...courseData,
//       thumbnail: thumbnailUrl ? "URL exists" : "No thumbnail"
//     });

//     const course = await Course.create(courseData);
//     console.log("✅ Course created successfully:", course.id);

//     // Build response with full URLs
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
//       details: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// /* ============================================================
//    Create a new course with units and lessons
// ============================================================ */
// export const createCourseWithUnits = async (req, res) => {
//   try {
//     console.log("🎯 Advanced course creation requested");
//     console.log("👤 User:", req.user?.id, req.user?.role);

//     const {
//       title,
//       slug,
//       description,
//       price,
//       teacher_id,
//       units = [],
//     } = req.body;

//     const teacherId = req.user?.id || teacher_id;

//     // Validate required fields
//     if (!title || !slug) {
//       return res.status(400).json({
//         success: false,
//         error: "Title and slug are required",
//       });
//     }

//     let thumbnailUrl = null;

//     // Process thumbnail if uploaded
//     if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
//       const thumbnail = req.files.thumbnail[0];
      
//       try {
//         // Upload to Cloudinary
//         const result = await uploadToCloudinary(
//           thumbnail.buffer,
//           'mathe-class/course-thumbnails',
//           'image'
//         );
        
//         thumbnailUrl = result.secure_url;
//         console.log("✅ Thumbnail uploaded to Cloudinary:", thumbnailUrl.substring(0, 80) + "...");
        
//       } catch (cloudinaryError) {
//         console.error("❌ Cloudinary upload failed:", cloudinaryError.message);
        
//         // Fallback: Save locally
//         const uploadsDir = path.join(__dirname, "../Uploads");
//         if (!fs.existsSync(uploadsDir)) {
//           fs.mkdirSync(uploadsDir, { recursive: true });
//         }
        
//         const thumbnailFilename = `thumbnail-${Date.now()}-${thumbnail.originalname.replace(/\s+/g, "-")}`;
//         const thumbnailFullPath = path.join(uploadsDir, thumbnailFilename);
//         fs.writeFileSync(thumbnailFullPath, thumbnail.buffer);
//         thumbnailUrl = `/Uploads/${thumbnailFilename}`;
//         console.log("✅ Thumbnail saved locally (fallback):", thumbnailUrl);
//       }
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
//       thumbnail: thumbnailUrl,
//     };

//     console.log("📊 Creating course with data:", {
//       ...courseData,
//       thumbnail: thumbnailUrl ? "URL exists" : "No thumbnail"
//     });

//     const course = await Course.create(courseData);
//     console.log("✅ Course created successfully:", course.id);

//     // Create units and lessons if provided
//     let createdUnits = [];
//     let createdLessons = [];

//     if (units && Array.isArray(units) && units.length > 0) {
//       console.log(`📚 Creating ${units.length} units with lessons...`);

//       for (const unit of units) {
//         if (unit.title && unit.lessons && Array.isArray(unit.lessons)) {
//           // Create unit header
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

//       console.log(`✅ Created ${createdUnits.length} units and ${createdLessons.length} lessons`);
//     }

//     // Build response with full URLs
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
//       details: process.env.NODE_ENV === "development" ? error.message : undefined,
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

//     const courseData = buildCourseFileUrls(course);

//     res.json({
//       success: true,
//       course: {
//         id: courseData.id,
//         title: courseData.title,
//         description: courseData.description,
//         thumbnail: courseData.thumbnail,
//         teacher: courseData.teacher,
//         price: courseData.price !== undefined && courseData.price !== null
//           ? Number(courseData.price)
//           : 0,
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

//     const formattedCourses = courses.map((course) => {
//       const courseData = buildCourseFileUrls(course);
//       return {
//         ...courseData,
//         price: courseData.price !== undefined && courseData.price !== null
//           ? Number(courseData.price)
//           : 0,
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

//     const courseData = buildCourseFileUrls(course);

//     // Build URLs for lessons
//     if (courseData.lessons && Array.isArray(courseData.lessons)) {
//       const backend = process.env.BACKEND_URL || "http://localhost:3000";
      
//       courseData.lessons = courseData.lessons.map((lesson) => {
//         const lessonData = { ...lesson };
        
//         if (lessonData.video_url && !lessonData.video_url.startsWith("http")) {
//           lessonData.video_url = `${backend}${lessonData.video_url}`;
//         }
//         if (lessonData.file_url && !lessonData.file_url.startsWith("http")) {
//           lessonData.file_url = `${backend}${lessonData.file_url}`;
//         }
        
//         return lessonData;
//       });
//     }

//     res.json({
//       success: true,
//       course: {
//         ...courseData,
//         price: courseData.price !== undefined && courseData.price !== null
//           ? Number(courseData.price)
//           : 0,
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

//     const backend = process.env.BACKEND_URL || "http://localhost:3000";
    
//     const lessonsWithUrls = lessons.map((lesson) => {
//       const lessonData = lesson.toJSON ? lesson.toJSON() : { ...lesson };

//       if (lessonData.video_url && !lessonData.video_url.startsWith("http")) {
//         lessonData.video_url = `${backend}${lessonData.video_url}`;
//       }

//       if (lessonData.file_url && !lessonData.file_url.startsWith("http")) {
//         lessonData.file_url = `${backend}${lessonData.file_url}`;
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
//    Delete course
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
//       return res.status(404).json({
//         success: false,
//         message: "Course not found",
//       });
//     }

//     // Check authorization
//     if (userRole !== "admin" && course.teacher_id !== userId) {
//       return res.status(403).json({
//         success: false,
//         message: "Not authorized to delete this course",
//         details: "You can only delete courses that you created",
//       });
//     }

//     // Check for existing enrollments
//     const enrollmentCount = await Enrollment.count({
//       where: { course_id: id },
//     });

//     if (enrollmentCount > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Cannot delete course with existing enrollments",
//         details: `This course has ${enrollmentCount} student enrollment(s).`,
//       });
//     }

//     // Delete the course
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

//     if (error.name === "SequelizeForeignKeyConstraintError") {
//       return res.status(400).json({
//         success: false,
//         message: "Cannot delete course. There are existing enrollments or related data.",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Failed to delete course",
//       error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
//     });
//   }
// };

// /* ============================================================
//    Get teacher's courses
// ============================================================ */
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

//     const coursesWithCounts = courses.map((course) => {
//       const courseData = buildCourseFileUrls(course);
//       return {
//         ...courseData,
//         unit_count: course.units?.length || 0,
//         lesson_count: course.lessons?.length || 0,
//       };
//     });

//     console.log(`✅ Found ${coursesWithCounts.length} courses for teacher ${teacherId}`);

//     res.json({
//       success: true,
//       courses: coursesWithCounts,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching teacher courses:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch courses",
//       details: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// /* ============================================================
//    Update course
// ============================================================ */
// export const updateCourse = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, description, price } = req.body;

//     console.log("📝 Course update request:", { id, title, description, price });

//     const course = await Course.findByPk(id);
//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         error: "Course not found",
//       });
//     }

//     // Check authorization
//     const userRole = req.user.role;
//     if (userRole !== "admin" && course.teacher_id !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         error: "Not authorized to update this course",
//       });
//     }

//     // Update fields
//     if (title !== undefined) course.title = title.trim();
//     if (description !== undefined) course.description = description.trim();
//     if (price !== undefined) course.price = parseFloat(price);

//     // Handle thumbnail update
//     if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
//       const thumbnail = req.files.thumbnail[0];
      
//       try {
//         // Upload to Cloudinary
//         const result = await uploadToCloudinary(
//           thumbnail.buffer,
//           'mathe-class/course-thumbnails',
//           'image'
//         );
        
//         course.thumbnail = result.secure_url;
//         console.log("✅ Thumbnail updated on Cloudinary");
        
//       } catch (cloudinaryError) {
//         console.error("❌ Cloudinary upload failed:", cloudinaryError.message);
        
//         // Fallback: Save locally
//         const uploadsDir = path.join(__dirname, "../Uploads");
//         if (!fs.existsSync(uploadsDir)) {
//           fs.mkdirSync(uploadsDir, { recursive: true });
//         }
        
//         const thumbnailFilename = `thumbnail-${Date.now()}-${thumbnail.originalname.replace(/\s+/g, "-")}`;
//         const thumbnailFullPath = path.join(uploadsDir, thumbnailFilename);
//         fs.writeFileSync(thumbnailFullPath, thumbnail.buffer);
//         course.thumbnail = `/Uploads/${thumbnailFilename}`;
//         console.log("✅ Thumbnail updated locally");
//       }
//     }

//     await course.save();

//     const updatedCourse = buildCourseFileUrls(course);

//     res.json({
//       success: true,
//       message: "Course updated successfully",
//       course: updatedCourse,
//     });
//   } catch (error) {
//     console.error("❌ Error updating course:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to update course",
//       details: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// export default {
//   createCourse,
//   createCourseWithUnits,
//   getCourseById,
//   getCourses,
//   getPublicCourseBySlug,
//   getLessonsByCourse,
//   deleteCourse,
//   getTeacherCourses,
//   updateCourse,
// };





// controllers/courseController.js
import db from "../models/index.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const { Course, Lesson, User, Unit, Enrollment } = db;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Cloudinary functions
import { uploadToCloudinary } from "../middleware/cloudinaryUpload.js";

// Helper function to build full URLs for course files
const buildCourseFileUrls = (course) => {
  const courseData = course.toJSON ? course.toJSON() : { ...course };

  // Get backend URL
  const getBackendUrl = () => {
    if (process.env.BACKEND_URL) return process.env.BACKEND_URL.replace(/\/+$/g, "");
    if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL.replace(/\/+$/g, "");
    if (process.env.NODE_ENV === "production") return "https://mathe-class-website-backend-1.onrender.com";
    const p = process.env.PORT || 5000;
    return `http://localhost:${p}`;
  };

  const backend = getBackendUrl();

  // Helper to resolve URLs
  const resolveUrl = (url) => {
    if (!url) return null;
    
    // Already an absolute URL -> return as-is
    if (typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://"))) {
      return url;
    }

    // If Uploads path
    if (typeof url === "string" && (url.startsWith("/Uploads/") || url.startsWith("Uploads/"))) {
      const filename = url.replace(/^\/?Uploads\//, "");
      return `${backend}/api/v1/files/${encodeURIComponent(filename)}`;
    }

    // If it's just a filename without path
    if (typeof url === "string" && !url.includes("/") && !url.includes("\\")) {
      return `${backend}/api/v1/files/${encodeURIComponent(url)}`;
    }

    // If it's a local file path
    if (typeof url === "string" && (url.includes("/") || url.includes("\\"))) {
      const filename = path.basename(url);
      return `${backend}/api/v1/files/${encodeURIComponent(filename)}`;
    }

    return url;
  };

  // Resolve thumbnail URL
  if (courseData.thumbnail) {
    courseData.thumbnail = resolveUrl(courseData.thumbnail);
  }

  return courseData;
};

/* ============================================================
   Create a new course (with file upload support)
============================================================ */
export const createCourse = async (req, res) => {
  try {
    console.log("📝 Course creation request");
    console.log("👤 User:", req.user?.id, req.user?.role);

    const { title, slug, description, price, teacher_id } = req.body;
    const teacherId = req.user?.id || teacher_id;

    // Validate required fields
    if (!title || !slug) {
      return res.status(400).json({
        success: false,
        error: "Title and slug are required",
        received: { title, slug, description, price, teacherId },
      });
    }

    let thumbnailUrl = null;

    // Process thumbnail if uploaded
    if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
      const thumbnail = req.files.thumbnail[0];
      
      try {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(
          thumbnail.buffer,
          'mathe-class/course-thumbnails',
          'image'
        );
        
        thumbnailUrl = result.secure_url;
        console.log("✅ Thumbnail uploaded to Cloudinary:", thumbnailUrl.substring(0, 80) + "...");
        
      } catch (cloudinaryError) {
        console.error("❌ Cloudinary upload failed:", cloudinaryError.message);
        
        // Fallback: Save locally (for development or backup)
        const uploadsDir = path.join(__dirname, "../Uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const thumbnailFilename = `thumbnail-${Date.now()}-${thumbnail.originalname.replace(/\s+/g, "-")}`;
        const thumbnailFullPath = path.join(uploadsDir, thumbnailFilename);
        fs.writeFileSync(thumbnailFullPath, thumbnail.buffer);
        thumbnailUrl = `/Uploads/${thumbnailFilename}`;
        console.log("✅ Thumbnail saved locally (fallback):", thumbnailUrl);
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
      thumbnail: thumbnailUrl,
    };

    console.log("📊 Creating course with data:", {
      ...courseData,
      thumbnail: thumbnailUrl ? "URL exists" : "No thumbnail"
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
    console.log("👤 User:", req.user?.id, req.user?.role);

    const {
      title,
      slug,
      description,
      price,
      teacher_id,
      units = [],
    } = req.body;

    const teacherId = req.user?.id || teacher_id;

    // Validate required fields
    if (!title || !slug) {
      return res.status(400).json({
        success: false,
        error: "Title and slug are required",
      });
    }

    let thumbnailUrl = null;

    // Process thumbnail if uploaded
    if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
      const thumbnail = req.files.thumbnail[0];
      
      try {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(
          thumbnail.buffer,
          'mathe-class/course-thumbnails',
          'image'
        );
        
        thumbnailUrl = result.secure_url;
        console.log("✅ Thumbnail uploaded to Cloudinary:", thumbnailUrl.substring(0, 80) + "...");
        
      } catch (cloudinaryError) {
        console.error("❌ Cloudinary upload failed:", cloudinaryError.message);
        
        // Fallback: Save locally
        const uploadsDir = path.join(__dirname, "../Uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const thumbnailFilename = `thumbnail-${Date.now()}-${thumbnail.originalname.replace(/\s+/g, "-")}`;
        const thumbnailFullPath = path.join(uploadsDir, thumbnailFilename);
        fs.writeFileSync(thumbnailFullPath, thumbnail.buffer);
        thumbnailUrl = `/Uploads/${thumbnailFilename}`;
        console.log("✅ Thumbnail saved locally (fallback):", thumbnailUrl);
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
      thumbnail: thumbnailUrl,
    };

    console.log("📊 Creating course with data:", {
      ...courseData,
      thumbnail: thumbnailUrl ? "URL exists" : "No thumbnail"
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
          // Create unit header
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

    const courseData = buildCourseFileUrls(course);

    // Build URLs for lessons
    if (courseData.lessons && Array.isArray(courseData.lessons)) {
      const backend = process.env.BACKEND_URL || "http://localhost:3000";
      
      courseData.lessons = courseData.lessons.map((lesson) => {
        const lessonData = { ...lesson };
        
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

    const backend = process.env.BACKEND_URL || "http://localhost:3000";
    
    const lessonsWithUrls = lessons.map((lesson) => {
      const lessonData = lesson.toJSON ? lesson.toJSON() : { ...lesson };

      if (lessonData.video_url && !lessonData.video_url.startsWith("http")) {
        lessonData.video_url = `${backend}${lessonData.video_url}`;
      }

      if (lessonData.file_url && !lessonData.file_url.startsWith("http")) {
        lessonData.file_url = `${backend}${lessonData.file_url}`;
      }

      return lessonData;
    });

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
   Delete course
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
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check authorization
    if (userRole !== "admin" && course.teacher_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this course",
        details: "You can only delete courses that you created",
      });
    }

    // Check for existing enrollments
    const enrollmentCount = await Enrollment.count({
      where: { course_id: id },
    });

    if (enrollmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete course with existing enrollments",
        details: `This course has ${enrollmentCount} student enrollment(s).`,
      });
    }

    // Delete the course
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

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete course. There are existing enrollments or related data.",
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
   Get teacher's courses
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
      
      try {
        // Upload to Cloudinary
        const result = await uploadToCloudinary(
          thumbnail.buffer,
          'mathe-class/course-thumbnails',
          'image'
        );
        
        course.thumbnail = result.secure_url;
        console.log("✅ Thumbnail updated on Cloudinary");
        
      } catch (cloudinaryError) {
        console.error("❌ Cloudinary upload failed:", cloudinaryError.message);
        
        // Fallback: Save locally
        const uploadsDir = path.join(__dirname, "../Uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const thumbnailFilename = `thumbnail-${Date.now()}-${thumbnail.originalname.replace(/\s+/g, "-")}`;
        const thumbnailFullPath = path.join(uploadsDir, thumbnailFilename);
        fs.writeFileSync(thumbnailFullPath, thumbnail.buffer);
        course.thumbnail = `/Uploads/${thumbnailFilename}`;
        console.log("✅ Thumbnail updated locally");
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
   Get course with full structure (units and lessons)
============================================================ */
export const getCourseWithStructure = async (req, res) => {
  try {
    const { id } = req.params;
    
    const course = await Course.findByPk(id, {
      attributes: ["id", "title", "description", "slug", "price", "thumbnail", "teacher_id"],
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
            }
          ],
          order: [["order_index", "ASC"]],
        },
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
        }
      ],
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    const courseData = buildCourseFileUrls(course);

    // Build URLs for lessons in each unit
    if (courseData.units && Array.isArray(courseData.units)) {
      const backend = process.env.BACKEND_URL || "http://localhost:3000";
      
      courseData.units = courseData.units.map((unit) => {
        const unitData = { ...unit };
        
        if (unitData.lessons && Array.isArray(unitData.lessons)) {
          unitData.lessons = unitData.lessons.map((lesson) => {
            const lessonData = { ...lesson };
            
            if (lessonData.video_url && !lessonData.video_url.startsWith("http")) {
              lessonData.video_url = `${backend}${lessonData.video_url}`;
            }
            if (lessonData.file_url && !lessonData.file_url.startsWith("http")) {
              lessonData.file_url = `${backend}${lessonData.file_url}`;
            }
            
            return lessonData;
          });
        }
        
        return unitData;
      });
    }

    res.json({
      success: true,
      course: courseData,
    });
  } catch (error) {
    console.error("❌ Error fetching course with structure:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch course structure",
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/* ============================================================
   Check if course exists by slug
============================================================ */
export const checkCourseExists = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const course = await Course.findOne({
      where: { slug },
      attributes: ["id", "title", "slug"],
    });

    res.json({
      success: true,
      exists: !!course,
      course: course || null,
    });
  } catch (error) {
    console.error("❌ Error checking course existence:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check course",
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
  getCourseWithStructure,
  checkCourseExists,
};