// // controllers/lessonController.js 
// import db from "../models/index.js";
// import path from "path";
// import { v2 as cloudinary } from 'cloudinary';

// const { Lesson, Course, Unit, LessonView, Enrollment, User, sequelize } = db;

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
//   secure: true,
// });

// /* -----------------------------------------------------------
//    BACKEND URL RESOLVER
// ----------------------------------------------------------- */
// const getBackendUrl = () => {
//   if (process.env.BACKEND_URL) {
//     return process.env.BACKEND_URL.replace(/\/+$/g, "");
//   }
//   if (process.env.RENDER_EXTERNAL_URL) {
//     return process.env.RENDER_EXTERNAL_URL.replace(/\/+$/g, "");
//   }
//   if (process.env.NODE_ENV === "production") {
//     return "https://mathe-class-website-backend-1.onrender.com";
//   }
//   const p = process.env.PORT || 5000;
//   return `http://localhost:${p}`;
// };

// /* -----------------------------------------------------------
//    Build Full URLs for files with Cloudinary support
// ----------------------------------------------------------- */
// export const buildFileUrls = (lesson) => {
//   if (!lesson) return null;

//   const data = lesson.toJSON ? lesson.toJSON() : { ...lesson };
  
//   // Helper to process URLs
//   const processUrl = (url, isPdf = false) => {
//     if (!url) return null; // Return null instead of undefined
    
//     // Already a Cloudinary URL
//     if (url.includes('cloudinary.com')) {
//       // Fix PDF URLs to use raw/upload instead of image/upload
//       if (isPdf && url.includes('/image/upload/')) {
//         return url.replace('/image/upload/', '/raw/upload/');
//       }
//       return url;
//     }
    
//     // Local file in production - should be on Cloudinary
//     if (process.env.NODE_ENV === "production" && !url.startsWith("http")) {
//       const filename = path.basename(url);
//       const resourceType = isPdf ? 'raw' : 'auto';
//       const folder = isPdf ? 'mathe-class/pdfs' : 'mathe-class/files';
      
//       // Try to construct Cloudinary URL
//       const publicId = `${folder}/${filename.replace(/\.[^/.]+$/, '')}`;
//       return cloudinary.url(publicId, {
//         resource_type: resourceType,
//         secure: true
//       });
//     }
    
//     // Local file in development
//     const backend = getBackendUrl();
    
//     if (url.startsWith("/Uploads/") || url.startsWith("Uploads/")) {
//       const filename = url.replace(/^\/?Uploads\//, "");
//       return `${backend}/api/v1/files/${encodeURIComponent(filename)}`;
//     }
    
//     // Plain filename
//     return `${backend}/api/v1/files/${encodeURIComponent(url)}`;
//   };

//   // Process file_url (PDFs)
//   if (data.file_url) {
//     const isPdf = data.file_url.toLowerCase().endsWith('.pdf');
//     data.file_url = processUrl(data.file_url, isPdf);
//   }
  
//   // Process video_url (videos)
//   if (data.video_url) {
//     data.video_url = processUrl(data.video_url, false);
//   }

//   return data;
// };

// /* -----------------------------------------------------------
//    Track Lesson View
// ----------------------------------------------------------- */
// const trackLessonView = async (userId, lessonId) => {
//   try {
//     if (!userId) return;
//     await LessonView.findOrCreate({
//       where: { user_id: userId, lesson_id: lessonId },
//       defaults: { viewed_at: new Date() },
//     });
//   } catch (err) {
//     console.warn("trackLessonView error:", err?.message || err);
//   }
// };

// /* -----------------------------------------------------------
//    Handle File Uploads - Updated for Cloudinary
// ----------------------------------------------------------- */
// const handleFileUploads = (req) => {
//   const out = {};
  
//   if (req.files?.video?.[0]) {
//     const file = req.files.video[0];
//     out.video_url = file.path || file.location || file.filename;
//   }
  
//   if (req.files?.pdf?.[0]) {
//     const file = req.files.pdf[0];
//     out.file_url = file.path || file.location || file.filename;
//   }
  
//   if (req.files?.file?.[0]) {
//     const file = req.files.file[0];
//     out.file_url = file.path || file.location || file.filename;
//   }
  
//   return out;
// };

// /* -----------------------------------------------------------
//    GET LESSON BY ID - FIXED (Main Issue)
// ----------------------------------------------------------- */
// export const getLessonById = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { lessonId } = req.params;
    
//     console.log(`📖 Fetching lesson ${lessonId} for user ${req.user?.id || 'anonymous'}`);
    
//     // Validate lessonId
//     if (!lessonId || isNaN(parseInt(lessonId))) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         success: false, 
//         error: "Valid lesson ID is required" 
//       });
//     }

//     const lesson = await Lesson.findByPk(parseInt(lessonId), {
//       include: [
//         { 
//           model: Course, 
//           as: "course", 
//           attributes: ["id", "title", "teacher_id", "slug"] 
//         }, 
//         { 
//           model: Unit, 
//           as: "unit", 
//           attributes: ["id", "title"] 
//         }
//       ],
//       transaction
//     });
    
//     if (!lesson) {
//       await transaction.rollback();
//       console.log(`❌ Lesson ${lessonId} not found in database`);
      
//       // Try to find any lesson in the same course
//       const courseId = req.query.courseId;
//       if (courseId) {
//         const alternativeLesson = await Lesson.findOne({
//           where: { course_id: parseInt(courseId) },
//           order: [["order_index", "ASC"]],
//           transaction
//         });
        
//         if (alternativeLesson) {
//           console.log(`💡 Found alternative lesson ${alternativeLesson.id} in course ${courseId}`);
//           return res.status(404).json({
//             success: false,
//             error: `Lesson ${lessonId} not found. Did you mean lesson ${alternativeLesson.id}?`,
//             alternative: {
//               id: alternativeLesson.id,
//               title: alternativeLesson.title
//             }
//           });
//         }
//       }
      
//       return res.status(404).json({ 
//         success: false, 
//         error: "Lesson not found. The lesson may have been deleted or doesn't exist." 
//       });
//     }

//     // Check access permissions
//     let hasAccess = false;
//     let accessReason = "";
    
//     if (req.user) {
//       // Admins have full access
//       if (req.user.role === "admin") {
//         hasAccess = true;
//         accessReason = "admin_access";
//       }
//       // Teachers can access their own course lessons
//       else if (req.user.role === "teacher" && lesson.course?.teacher_id === req.user.id) {
//         hasAccess = true;
//         accessReason = "teacher_owner";
//       }
//       // Students need to be enrolled or it must be a preview lesson
//       else if (req.user.role === "student") {
//         if (lesson.is_preview) {
//           hasAccess = true;
//           accessReason = "preview_lesson";
//         } else {
//           const enrollment = await Enrollment.findOne({
//             where: { 
//               user_id: req.user.id, 
//               course_id: lesson.course_id,
//               approval_status: "approved" 
//             },
//             transaction
//           });
          
//           if (enrollment) {
//             hasAccess = true;
//             accessReason = "enrolled_student";
//           } else {
//             accessReason = "not_enrolled";
//           }
//         }
//       }
//     } else {
//       // Public access only for preview lessons
//       hasAccess = lesson.is_preview;
//       accessReason = lesson.is_preview ? "public_preview" : "requires_login";
//     }

//     if (!hasAccess) {
//       await transaction.rollback();
//       console.log(`🔒 Access denied for lesson ${lessonId}: ${accessReason}`);
      
//       return res.status(403).json({
//         success: false,
//         error: accessReason === "requires_login" 
//           ? "Please log in to access this lesson"
//           : "You don't have permission to access this lesson",
//         requiresLogin: accessReason === "requires_login",
//         canPreview: lesson.is_preview
//       });
//     }

//     // Track view for authenticated users
//     if (req.user?.id) {
//       await trackLessonView(req.user.id, lesson.id);
//     }

//     const lessonData = buildFileUrls(lesson);
    
//     await transaction.commit();
    
//     console.log(`✅ Successfully loaded lesson ${lessonId}: "${lesson.title}"`);
//     console.log(`   Access: ${accessReason}, Type: ${lesson.content_type}`);
    
//     return res.json({ 
//       success: true, 
//       lesson: lessonData,
//       access: {
//         role: req.user?.role,
//         isPreview: lesson.is_preview,
//         hasAccess: true,
//         reason: accessReason
//       }
//     });
    
//   } catch (err) {
//     await transaction.rollback();
    
//     console.error("❌ getLessonById error:", {
//       message: err.message,
//       stack: err.stack,
//       lessonId: req.params.lessonId,
//       userId: req.user?.id
//     });
    
//     // Handle specific errors
//     if (err.name === 'SequelizeDatabaseError') {
//       return res.status(500).json({
//         success: false,
//         error: "Database error. Please check if the lesson exists.",
//         details: process.env.NODE_ENV === "development" ? err.message : undefined
//       });
//     }
    
//     return res.status(500).json({
//       success: false,
//       error: "Failed to load lesson",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined
//     });
//   }
// };

// /* -----------------------------------------------------------
//    GET PREVIEW LESSON FOR A COURSE (public) - FIXED
// ----------------------------------------------------------- */
// export const getPreviewLessonForCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;
    
//     console.log(`🔍 Looking for preview lesson for course ${courseId}`);
    
//     // Validate courseId
//     if (!courseId || isNaN(parseInt(courseId))) {
//       return res.status(400).json({ 
//         success: false, 
//         error: "Valid course ID is required" 
//       });
//     }

//     const course = await Course.findByPk(parseInt(courseId), { 
//       attributes: ["id", "title", "slug", "teacher_id"] 
//     });
    
//     if (!course) {
//       console.log(`❌ Course ${courseId} not found`);
//       return res.status(404).json({ 
//         success: false, 
//         error: "Course not found" 
//       });
//     }

//     // First, try to find any lesson marked as preview
//     let lesson = await Lesson.findOne({
//       where: { 
//         course_id: parseInt(courseId), 
//         is_preview: true 
//       },
//       order: [["order_index", "ASC"]],
//       include: [
//         { model: Course, as: "course", attributes: ["id", "title", "slug"] }
//       ],
//     });

//     // If no preview lesson, get the first lesson
//     if (!lesson) {
//       console.log(`ℹ️ No preview lesson found for course ${courseId}, getting first lesson`);
      
//       lesson = await Lesson.findOne({
//         where: { course_id: parseInt(courseId) },
//         order: [["order_index", "ASC"]],
//         include: [
//           { model: Course, as: "course", attributes: ["id", "title", "slug"] }
//         ],
//       });
      
//       if (!lesson) {
//         const lessonCount = await Lesson.count({ where: { course_id: parseInt(courseId) } });
//         console.log(`❌ No lessons found for course ${courseId}, total: ${lessonCount}`);
        
//         return res.status(404).json({
//           success: false,
//           error: "No lessons found for this course",
//           lessonCount,
//         });
//       }
//     }

//     const lessonData = buildFileUrls(lesson);
    
//     console.log(`✅ Preview lesson found: ${lesson.id} - "${lesson.title}"`);
    
//     return res.json({
//       success: true,
//       lesson: lessonData,
//       course: {
//         id: course.id,
//         title: course.title,
//         slug: course.slug
//       },
//       access: "public",
//       isPreview: lesson.is_preview,
//       timestamp: new Date().toISOString(),
//     });
    
//   } catch (err) {
//     console.error("❌ getPreviewLessonForCourse error:", {
//       message: err.message,
//       stack: err.stack,
//       courseId: req.params.courseId
//     });
    
//     return res.status(500).json({
//       success: false,
//       error: "Failed to load preview lesson",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined
//     });
//   }
// };

// /* -----------------------------------------------------------
//    GET PUBLIC PREVIEW BY LESSON ID
// ----------------------------------------------------------- */
// export const getPublicPreviewByLessonId = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
    
//     console.log(`🔓 PUBLIC PREVIEW requested for lesson ${lessonId}`);

//     // Validate lessonId
//     if (!lessonId || isNaN(parseInt(lessonId))) {
//       return res.status(400).json({ 
//         success: false, 
//         error: "Valid lesson ID is required" 
//       });
//     }

//     const lesson = await Lesson.findByPk(parseInt(lessonId), {
//       include: [
//         { 
//           model: Course, 
//           as: "course", 
//           attributes: ["id", "title", "slug"] 
//         }
//       ],
//     });

//     if (!lesson) {
//       console.log(`❌ Lesson ${lessonId} not found`);
//       return res.status(404).json({
//         success: false,
//         error: "Preview lesson not found",
//       });
//     }

//     // Check if this is a preview lesson
//     if (!lesson.is_preview) {
//       console.log(`⚠️ Lesson ${lessonId} is not marked as preview`);
      
//       // Check if user is logged in
//       if (!req.user) {
//         return res.status(403).json({
//           success: false,
//           error: "This lesson is not available for preview. Please enroll in the course or log in.",
//           requiresLogin: true
//         });
//       }
//     }

//     const lessonData = buildFileUrls(lesson);
    
//     console.log(`✅ Public preview served: "${lesson.title}"`);
//     console.log(`   Course: ${lesson.course?.title}`);
//     console.log(`   Is Preview: ${lesson.is_preview ? 'Yes' : 'No'}`);

//     return res.json({
//       success: true,
//       lesson: lessonData,
//       access: lesson.is_preview ? "public" : "restricted",
//       message: lesson.is_preview ? "Public preview access granted" : "Access granted",
//       timestamp: new Date().toISOString(),
//     });
//   } catch (err) {
//     console.error("❌ getPublicPreviewByLessonId error:", err);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to load preview",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined
//     });
//   }
// };

// /* -----------------------------------------------------------
//    CREATE LESSON
// ----------------------------------------------------------- */
// export const createLesson = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { courseId } = req.params;
//     const {
//       title,
//       content,
//       contentType,
//       unitId,
//       orderIndex,
//       isPreview,
//       videoUrl,
//     } = req.body;

//     // Validate courseId
//     if (!courseId || isNaN(parseInt(courseId))) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         success: false, 
//         error: "Valid course ID is required" 
//       });
//     }

//     const course = await Course.findByPk(parseInt(courseId), { transaction });
//     if (!course) {
//       await transaction.rollback();
//       return res.status(404).json({ success: false, error: "Course not found" });
//     }

//     const uploads = handleFileUploads(req);

//     let finalType = contentType || "text";
//     let file_path = uploads.file_url || null;
//     let video_path = uploads.video_url || videoUrl || null;
    
//     if (uploads.file_url) finalType = "pdf";
//     if (uploads.video_url) finalType = "video";

//     // Auto order indexing
//     let order_index = orderIndex;
//     if (!order_index && order_index !== 0) {
//       const where = unitId ? { unit_id: unitId } : { course_id: courseId, unit_id: null };
//       const last = await Lesson.findOne({ 
//         where, 
//         order: [["order_index", "DESC"]],
//         transaction
//       });
//       order_index = last ? (last.order_index || 0) + 1 : 1;
//     }

//     const lesson = await Lesson.create({
//       title: title?.trim() || "Untitled Lesson",
//       content: content || "",
//       course_id: parseInt(courseId),
//       unit_id: unitId || null,
//       order_index,
//       content_type: finalType,
//       video_url: video_path,
//       file_url: file_path,
//       is_preview: Boolean(isPreview),
//     }, { transaction });

//     const full = await Lesson.findByPk(lesson.id, {
//       include: [
//         { model: Course, as: "course", attributes: ["id", "title"] }, 
//         { model: Unit, as: "unit", attributes: ["id", "title"] }
//       ],
//       transaction
//     });

//     await transaction.commit();
    
//     return res.status(201).json({ 
//       success: true, 
//       lesson: buildFileUrls(full),
//       message: "Lesson created successfully"
//     });
    
//   } catch (err) {
//     await transaction.rollback();
    
//     console.error("❌ createLesson error:", {
//       message: err.message,
//       stack: err.stack,
//       params: req.params,
//       body: req.body
//     });
    
//     return res.status(500).json({ 
//       success: false, 
//       error: "Failed to create lesson",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined
//     });
//   }
// };

// /* -----------------------------------------------------------
//    UPDATE LESSON
// ----------------------------------------------------------- */
// export const updateLesson = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { lessonId } = req.params;
    
//     // Validate lessonId
//     if (!lessonId || isNaN(parseInt(lessonId))) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         success: false, 
//         error: "Valid lesson ID is required" 
//       });
//     }

//     const existing = await Lesson.findByPk(parseInt(lessonId), { transaction });
//     if (!existing) {
//       await transaction.rollback();
//       return res.status(404).json({ success: false, error: "Lesson not found" });
//     }

//     const uploads = handleFileUploads(req);
//     const updates = {};

//     if (req.body.title !== undefined && req.body.title !== null) updates.title = req.body.title.trim();
//     if (req.body.content !== undefined && req.body.content !== null) updates.content = req.body.content;
//     if (req.body.orderIndex !== undefined && req.body.orderIndex !== null) updates.order_index = parseInt(req.body.orderIndex);
//     if (req.body.unitId !== undefined && req.body.unitId !== null) updates.unit_id = req.body.unitId;
//     if (req.body.isPreview !== undefined && req.body.isPreview !== null) updates.is_preview = Boolean(req.body.isPreview);

//     // Priority: uploaded video
//     if (uploads.video_url) {
//       updates.video_url = uploads.video_url;
//       updates.file_url = null;
//       updates.content_type = "video";
//     }
//     // Uploaded PDF/file
//     if (uploads.file_url) {
//       updates.file_url = uploads.file_url;
//       updates.video_url = null;
//       updates.content_type = "pdf";
//     }
//     // Manual content type or videoUrl
//     if (req.body.contentType) updates.content_type = req.body.contentType;
//     if (req.body.videoUrl && !uploads.video_url) updates.video_url = req.body.videoUrl;

//     await existing.update(updates, { transaction });

//     const updated = await Lesson.findByPk(parseInt(lessonId), {
//       include: [
//         { model: Course, as: "course", attributes: ["id", "title"] }, 
//         { model: Unit, as: "unit", attributes: ["id", "title"] }
//       ],
//       transaction
//     });

//     await transaction.commit();
    
//     return res.json({ 
//       success: true, 
//       lesson: buildFileUrls(updated),
//       message: "Lesson updated successfully"
//     });
    
//   } catch (err) {
//     await transaction.rollback();
    
//     console.error("❌ updateLesson error:", {
//       message: err.message,
//       stack: err.stack,
//       lessonId: req.params.lessonId
//     });
    
//     return res.status(500).json({ 
//       success: false, 
//       error: "Failed to update lesson",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined
//     });
//   }
// };

// /* -----------------------------------------------------------
//    GET LESSONS BY COURSE
// ----------------------------------------------------------- */
// export const getLessonsByCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;
    
//     // Validate courseId
//     if (!courseId || isNaN(parseInt(courseId))) {
//       return res.status(400).json({ 
//         success: false, 
//         error: "Valid course ID is required" 
//       });
//     }

//     const lessons = await Lesson.findAll({
//       where: { course_id: parseInt(courseId) },
//       order: [["order_index", "ASC"]],
//       include: [
//         { model: Unit, as: "unit", attributes: ["id", "title", "order_index"] }
//       ],
//     });
    
//     return res.json({ 
//       success: true, 
//       lessons: lessons.map(buildFileUrls),
//       count: lessons.length 
//     });
//   } catch (err) {
//     console.error("❌ getLessonsByCourse error:", {
//       message: err.message,
//       stack: err.stack,
//       courseId: req.params.courseId
//     });
//     return res.status(500).json({ 
//       success: false, 
//       error: "Failed to fetch lessons",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined
//     });
//   }
// };

// /* -----------------------------------------------------------
//    DELETE LESSON
// ----------------------------------------------------------- */
// export const deleteLesson = async (req, res) => {
//   const transaction = await sequelize.transaction();
  
//   try {
//     const { lessonId } = req.params;
    
//     // Validate lessonId
//     if (!lessonId || isNaN(parseInt(lessonId))) {
//       await transaction.rollback();
//       return res.status(400).json({ 
//         success: false, 
//         error: "Valid lesson ID is required" 
//       });
//     }

//     const lesson = await Lesson.findByPk(parseInt(lessonId), { transaction });
//     if (!lesson) {
//       await transaction.rollback();
//       return res.status(404).json({ success: false, error: "Lesson not found" });
//     }

//     // Check authorization (teacher can only delete their own lessons)
//     if (req.user) {
//       const course = await Course.findByPk(lesson.course_id, { transaction });
//       if (req.user.role === "teacher" && course.teacher_id !== req.user.id) {
//         await transaction.rollback();
//         return res.status(403).json({
//           success: false,
//           error: "You can only delete lessons from your own courses"
//         });
//       }
//     }

//     await lesson.destroy({ transaction });
    
//     await transaction.commit();
    
//     console.log(`✅ Lesson ${lessonId} deleted successfully`);
    
//     return res.json({ 
//       success: true, 
//       message: "Lesson deleted successfully",
//       deletedId: lessonId 
//     });
    
//   } catch (err) {
//     await transaction.rollback();
    
//     console.error("❌ deleteLesson error:", {
//       message: err.message,
//       stack: err.stack,
//       lessonId: req.params.lessonId
//     });
    
//     return res.status(500).json({ 
//       success: false, 
//       error: "Failed to delete lesson",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined
//     });
//   }
// };

// /* -----------------------------------------------------------
//    GET LESSONS BY UNIT
// ----------------------------------------------------------- */
// export const getLessonsByUnit = async (req, res) => {
//   try {
//     const { unitId } = req.params;
    
//     // Validate unitId
//     if (!unitId || isNaN(parseInt(unitId))) {
//       return res.status(400).json({ 
//         success: false, 
//         error: "Valid unit ID is required" 
//       });
//     }

//     const lessons = await Lesson.findAll({
//       where: { unit_id: parseInt(unitId) },
//       order: [["order_index", "ASC"]],
//     });
    
//     return res.json({ 
//       success: true, 
//       lessons: lessons.map(buildFileUrls),
//       count: lessons.length 
//     });
//   } catch (err) {
//     console.error("❌ getLessonsByUnit error:", {
//       message: err.message,
//       stack: err.stack,
//       unitId: req.params.unitId
//     });
//     return res.status(500).json({ 
//       success: false, 
//       error: "Failed to fetch unit lessons",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined
//     });
//   }
// };

// export default {
//   createLesson,
//   updateLesson,
//   getLessonById,
//   getLessonsByCourse,
//   getLessonsByUnit,
//   deleteLesson,
//   getPreviewLessonForCourse,
//   getPublicPreviewByLessonId,
//   buildFileUrls,
// };





// controllers/lessonController.js
/**
 * Clean & Modern Lesson Controller
 * - Outputs camelCase JSON for the frontend (React)
 * - Robust error handling to avoid 500 crashes when DB fields are missing
 * - Simplified Cloudinary/local file URL building
 * - Clean access checks (admin / teacher-owner / enrolled student / preview)
 *
 * NOTE: Keeps DB columns as-is (snake_case) but converts to camelCase in responses.
 */

import db from "../models/index.js";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

const { Lesson, Course, Unit, LessonView, Enrollment, sequelize } = db;

// Configure Cloudinary (safe no-op if env vars missing)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true,
});

/* -------------------------
   Helper: backend URL
   ------------------------- */
const getBackendUrl = () => {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL.replace(/\/+$/g, "");
  if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL.replace(/\/+$/g, "");
  if (process.env.NODE_ENV === "production") return "https://mathe-class-website-backend-1.onrender.com";
  const p = process.env.PORT || 5000;
  return `http://localhost:${p}`;
};

/* -------------------------
   Helper: normalize and build file/video URLs
   - Accepts a lesson instance or plain object (from Sequelize)
   - Returns a plain JS object with camelCase keys
   ------------------------- */
export const buildFileUrls = (lesson) => {
  if (!lesson) return null;
  // Convert Sequelize instance to plain object if needed
  const raw = typeof lesson.toJSON === "function" ? lesson.toJSON() : { ...lesson };

  const backend = getBackendUrl();

  const resolveUrl = (url, preferRawForPdf = true) => {
    if (!url) return null;
    // Already an absolute URL -> return as-is (but ensure https)
    if (typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://"))) {
      // If Cloudinary PDF stored under image/upload, convert to raw/upload
      if (preferRawForPdf && url.toLowerCase().endsWith(".pdf") && url.includes("/image/upload/")) {
        return url.replace("/image/upload/", "/raw/upload/");
      }
      return url;
    }

    // If Cloudinary public id or local path
    if (typeof url === "string" && url.includes("cloudinary.com")) {
      return url;
    }

    // If running in production and url is a local path, attempt to craft a cloudinary fallback using filename (best-effort)
    if (process.env.NODE_ENV === "production" && typeof url === "string" && !url.startsWith("http")) {
      const filename = path.basename(url);
      // choose raw for pdfs
      if (filename.toLowerCase().endsWith(".pdf")) {
        // best-effort: use mathe-class/pdfs/<name-without-ext>
        const publicId = `mathe-class/pdfs/${filename.replace(/\.[^/.]+$/, "")}`;
        try {
          return cloudinary.url(publicId, { resource_type: "raw", secure: true });
        } catch (e) {
          // fallback to backend files endpoint
          return `${backend}/api/v1/files/${encodeURIComponent(filename)}`;
        }
      }

      // non-pdf fallback
      const publicId = `mathe-class/files/${filename.replace(/\.[^/.]+$/, "")}`;
      try {
        return cloudinary.url(publicId, { resource_type: "auto", secure: true });
      } catch (e) {
        return `${backend}/api/v1/files/${encodeURIComponent(filename)}`;
      }
    }

    // If Uploads path (development)
    if (typeof url === "string" && (url.startsWith("/Uploads/") || url.startsWith("Uploads/"))) {
      const filename = url.replace(/^\/?Uploads\//, "");
      return `${backend}/api/v1/files/${encodeURIComponent(filename)}`;
    }

    // Plain filename
    if (typeof url === "string") {
      return `${backend}/api/v1/files/${encodeURIComponent(url)}`;
    }

    // Unknown shape
    return null;
  };

  // Map / normalize fields (DB snake_case -> response camelCase)
  const result = {
    id: raw.id ?? null,
    title: raw.title ?? "",
    contentType: raw.content_type ?? raw.type ?? "text",
    textContent: raw.content ?? raw.text_content ?? "",
    videoUrl: resolveUrl(raw.video_url ?? raw.videoUrl ?? null, false),
    fileUrl: resolveUrl(raw.file_url ?? raw.fileUrl ?? null, true),
    isPreview: Boolean(raw.is_preview ?? raw.isPreview ?? false),
    unitId: raw.unit_id ?? raw.unitId ?? null,
    courseId: raw.course_id ?? raw.courseId ?? null,
    orderIndex: Number.isFinite(raw.order_index ?? raw.orderIndex ?? null)
      ? (raw.order_index ?? raw.orderIndex)
      : null,
    createdAt: raw.created_at ?? raw.createdAt ?? raw.createdAt ?? null,
    updatedAt: raw.updated_at ?? raw.updatedAt ?? null,
  };

  // Include minimal course/unit objects if present
  if (raw.course) {
    result.course = {
      id: raw.course.id ?? raw.course_id ?? null,
      title: raw.course.title ?? "",
      slug: raw.course.slug ?? null,
      teacherId: raw.course.teacher_id ?? raw.course.teacherId ?? null,
    };
  }

  if (raw.unit) {
    result.unit = {
      id: raw.unit.id ?? raw.unit_id ?? null,
      title: raw.unit.title ?? "",
      orderIndex: raw.unit.order_index ?? raw.unit.orderIndex ?? null,
    };
  }

  return result;
};

/* -------------------------
   Track Lesson View (safe)
   ------------------------- */
const trackLessonView = async (userId, lessonId) => {
  try {
    if (!userId || !lessonId) return;
    await LessonView.findOrCreate({
      where: { user_id: userId, lesson_id: lessonId },
      defaults: { viewed_at: new Date() },
    });
  } catch (err) {
    // Non-fatal
    console.warn("trackLessonView error:", err?.message || err);
  }
};

/* -------------------------
   Handle multer file uploads (if used)
   - returns { videoUrl, fileUrl } values (paths or locations)
   ------------------------- */
const handleFileUploads = (req) => {
  const out = {};
  try {
    if (req.files?.video?.[0]) {
      const f = req.files.video[0];
      out.videoUrl = f.path || f.location || f.filename || null;
    }
    if (req.files?.pdf?.[0]) {
      const f = req.files.pdf[0];
      out.fileUrl = f.path || f.location || f.filename || null;
    }
    if (req.files?.file?.[0]) {
      const f = req.files.file[0];
      out.fileUrl = f.path || f.location || f.filename || null;
    }
  } catch (e) {
    // swallow
    console.warn("handleFileUploads warning:", e?.message || e);
  }
  return out;
};

/* -------------------------
   GET LESSON BY ID (camelCase output)
   - permission checks: admin / teacher-owner / enrolled student / preview access
   ------------------------- */
export const getLessonById = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    // Accept either :lessonId or :id route naming
    const lessonId = req.params.lessonId ?? req.params.id;
    if (!lessonId || isNaN(parseInt(lessonId, 10))) {
      await t.rollback();
      return res.status(400).json({ success: false, error: "Valid lesson ID is required" });
    }
    const id = parseInt(lessonId, 10);

    const lesson = await Lesson.findByPk(id, {
      include: [
        { model: Course, as: "course", attributes: ["id", "title", "slug", "teacher_id"] },
        { model: Unit, as: "unit", attributes: ["id", "title", "order_index"] },
      ],
      transaction: t,
    });

    if (!lesson) {
      await t.rollback();
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }

    // Access checks
    let hasAccess = false;
    let accessReason = "unknown";

    const user = req.user ?? null;
    if (user) {
      if (user.role === "admin") {
        hasAccess = true;
        accessReason = "admin";
      } else if (user.role === "teacher" && lesson.course?.teacher_id === user.id) {
        hasAccess = true;
        accessReason = "teacher_owner";
      } else if (user.role === "student") {
        if (lesson.is_preview) {
          hasAccess = true;
          accessReason = "preview";
        } else {
          const enrollment = await Enrollment.findOne({
            where: { user_id: user.id, course_id: lesson.course_id, approval_status: "approved" },
            transaction: t,
          });
          if (enrollment) {
            hasAccess = true;
            accessReason = "enrolled";
          } else {
            hasAccess = false;
            accessReason = "not_enrolled";
          }
        }
      } else {
        // other roles - default deny unless preview
        hasAccess = Boolean(lesson.is_preview);
        accessReason = lesson.is_preview ? "preview" : "forbidden_role";
      }
    } else {
      // public access only for preview lessons
      hasAccess = Boolean(lesson.is_preview);
      accessReason = lesson.is_preview ? "public_preview" : "requires_login";
    }

    if (!hasAccess) {
      await t.rollback();
      return res.status(accessReason === "requires_login" ? 401 : 403).json({
        success: false,
        error:
          accessReason === "requires_login"
            ? "Please log in to access this lesson"
            : "You do not have permission to access this lesson",
        reason: accessReason,
        canPreview: Boolean(lesson.is_preview),
      });
    }

    // Track view (non-blocking)
    if (user?.id) {
      // best-effort tracking
      try {
        await trackLessonView(user.id, lesson.id);
      } catch (e) {
        // don't fail on tracking errors
        console.warn("trackLessonView failed:", e?.message || e);
      }
    }

    const payload = buildFileUrls(lesson);

    await t.commit();
    return res.json({ success: true, lesson: payload, access: { reason: accessReason } });
  } catch (err) {
    await t.rollback();
    console.error("getLessonById error:", err?.message || err);
    return res.status(500).json({
      success: false,
      error: "Failed to load lesson",
      details: process.env.NODE_ENV === "development" ? err?.message : undefined,
    });
  }
};

/* -------------------------
   GET PREVIEW LESSON FOR COURSE (public)
   - returns first preview lesson or first lesson for course
   ------------------------- */
export const getPreviewLessonForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!courseId || isNaN(parseInt(courseId, 10))) {
      return res.status(400).json({ success: false, error: "Valid course ID is required" });
    }
    const cId = parseInt(courseId, 10);

    const course = await Course.findByPk(cId, { attributes: ["id", "title", "slug", "teacher_id"] });
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });

    // prefer explicit preview lesson
    let lesson = await Lesson.findOne({
      where: { course_id: cId, is_preview: true },
      order: [["order_index", "ASC"]],
      include: [{ model: Course, as: "course", attributes: ["id", "title", "slug"] }],
    });

    if (!lesson) {
      // fallback to first lesson
      lesson = await Lesson.findOne({
        where: { course_id: cId },
        order: [["order_index", "ASC"]],
        include: [{ model: Course, as: "course", attributes: ["id", "title", "slug"] }],
      });
    }

    if (!lesson) {
      return res.status(404).json({ success: false, error: "No lessons found for this course" });
    }

    const payload = buildFileUrls(lesson);
    return res.json({ success: true, lesson: payload, course: { id: course.id, title: course.title, slug: course.slug } });
  } catch (err) {
    console.error("getPreviewLessonForCourse error:", err?.message || err);
    return res.status(500).json({
      success: false,
      error: "Failed to load preview lesson",
      details: process.env.NODE_ENV === "development" ? err?.message : undefined,
    });
  }
};

/* -------------------------
   GET PUBLIC PREVIEW BY LESSON ID
   - allows public access only when lesson.is_preview === true
   ------------------------- */
export const getPublicPreviewByLessonId = async (req, res) => {
  try {
    const lessonId = req.params.lessonId ?? req.params.id;
    if (!lessonId || isNaN(parseInt(lessonId, 10))) {
      return res.status(400).json({ success: false, error: "Valid lesson ID is required" });
    }
    const id = parseInt(lessonId, 10);

    const lesson = await Lesson.findByPk(id, {
      include: [{ model: Course, as: "course", attributes: ["id", "title", "slug"] }],
    });

    if (!lesson) return res.status(404).json({ success: false, error: "Lesson not found" });

    if (!lesson.is_preview && !req.user) {
      return res.status(403).json({
        success: false,
        error: "This lesson is not available for public preview. Please enroll or log in.",
      });
    }

    const payload = buildFileUrls(lesson);
    return res.json({ success: true, lesson: payload, access: lesson.is_preview ? "public" : "restricted" });
  } catch (err) {
    console.error("getPublicPreviewByLessonId error:", err?.message || err);
    return res.status(500).json({
      success: false,
      error: "Failed to load preview",
      details: process.env.NODE_ENV === "development" ? err?.message : undefined,
    });
  }
};

/* -------------------------
   CREATE LESSON
   - expects POST /courses/:courseId/lessons or similar
   - returns created lesson in camelCase
   ------------------------- */
export const createLesson = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const courseId = req.params.courseId ?? req.body.courseId;
    if (!courseId || isNaN(parseInt(courseId, 10))) {
      await t.rollback();
      return res.status(400).json({ success: false, error: "Valid course ID is required" });
    }
    const cId = parseInt(courseId, 10);

    const course = await Course.findByPk(cId, { transaction: t });
    if (!course) {
      await t.rollback();
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    const body = req.body ?? {};
    const uploads = handleFileUploads(req);

    // Determine content type
    let contentType = (body.contentType ?? body.content_type ?? "text").toString();
    if (uploads.fileUrl) contentType = "pdf";
    if (uploads.videoUrl) contentType = "video";

    // Determine orderIndex auto if missing
    let orderIndex = (body.orderIndex ?? body.order_index);
    if (orderIndex === undefined || orderIndex === null || isNaN(parseInt(orderIndex, 10))) {
      const where = body.unitId ? { unit_id: body.unitId } : { course_id: cId };
      const last = await Lesson.findOne({
        where,
        order: [["order_index", "DESC"]],
        transaction: t,
      });
      orderIndex = last ? (last.order_index ?? 0) + 1 : 1;
    }

    const created = await Lesson.create(
      {
        title: (body.title ?? "Untitled Lesson").toString().trim(),
        content: body.textContent ?? body.content ?? "",
        course_id: cId,
        unit_id: body.unitId ?? null,
        order_index: parseInt(orderIndex, 10),
        content_type: contentType,
        video_url: uploads.videoUrl ?? body.videoUrl ?? null,
        file_url: uploads.fileUrl ?? body.fileUrl ?? null,
        is_preview: Boolean(body.isPreview ?? body.is_preview ?? false),
      },
      { transaction: t }
    );

    // re-fetch with includes
    const full = await Lesson.findByPk(created.id, {
      include: [
        { model: Course, as: "course", attributes: ["id", "title"] },
        { model: Unit, as: "unit", attributes: ["id", "title"] },
      ],
      transaction: t,
    });

    await t.commit();
    return res.status(201).json({ success: true, lesson: buildFileUrls(full), message: "Lesson created" });
  } catch (err) {
    await t.rollback();
    console.error("createLesson error:", err?.message || err);
    return res.status(500).json({
      success: false,
      error: "Failed to create lesson",
      details: process.env.NODE_ENV === "development" ? err?.message : undefined,
    });
  }
};

/* -------------------------
   UPDATE LESSON
   - PATCH /lessons/:lessonId
   ------------------------- */
export const updateLesson = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const lessonId = req.params.lessonId ?? req.params.id;
    if (!lessonId || isNaN(parseInt(lessonId, 10))) {
      await t.rollback();
      return res.status(400).json({ success: false, error: "Valid lesson ID is required" });
    }
    const id = parseInt(lessonId, 10);

    const existing = await Lesson.findByPk(id, { transaction: t });
    if (!existing) {
      await t.rollback();
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }

    // Authorization: teachers can only edit their own course lessons (admin can edit)
    if (req.user && req.user.role === "teacher") {
      const course = await Course.findByPk(existing.course_id, { transaction: t });
      if (!course || course.teacher_id !== req.user.id) {
        await t.rollback();
        return res.status(403).json({ success: false, error: "You may only edit lessons in your own courses" });
      }
    }

    const body = req.body ?? {};
    const uploads = handleFileUploads(req);

    const updates = {};

    if (body.title !== undefined && body.title !== null) updates.title = body.title.toString().trim();
    if (body.textContent !== undefined) updates.content = body.textContent;
    if (body.contentType !== undefined) updates.content_type = body.contentType;
    if (body.videoUrl !== undefined) updates.video_url = body.videoUrl;
    if (body.fileUrl !== undefined) updates.file_url = body.fileUrl;
    if (body.unitId !== undefined) updates.unit_id = body.unitId;
    if (body.orderIndex !== undefined) updates.order_index = parseInt(body.orderIndex, 10);
    if (body.isPreview !== undefined) updates.is_preview = Boolean(body.isPreview);

    // prioritize uploaded files if present
    if (uploads.videoUrl) {
      updates.video_url = uploads.videoUrl;
      updates.file_url = null;
      updates.content_type = "video";
    }
    if (uploads.fileUrl) {
      updates.file_url = uploads.fileUrl;
      updates.video_url = null;
      updates.content_type = "pdf";
    }

    // apply updates object if not empty
    if (Object.keys(updates).length > 0) {
      await existing.update(updates, { transaction: t });
    }

    const updated = await Lesson.findByPk(id, {
      include: [
        { model: Course, as: "course", attributes: ["id", "title"] },
        { model: Unit, as: "unit", attributes: ["id", "title"] },
      ],
      transaction: t,
    });

    await t.commit();
    return res.json({ success: true, lesson: buildFileUrls(updated), message: "Lesson updated" });
  } catch (err) {
    await t.rollback();
    console.error("updateLesson error:", err?.message || err);
    return res.status(500).json({
      success: false,
      error: "Failed to update lesson",
      details: process.env.NODE_ENV === "development" ? err?.message : undefined,
    });
  }
};

/* -------------------------
   GET LESSONS BY COURSE
   - returns lessons[] in camelCase
   ------------------------- */
export const getLessonsByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId ?? req.params.id;
    if (!courseId || isNaN(parseInt(courseId, 10))) {
      return res.status(400).json({ success: false, error: "Valid course ID is required" });
    }
    const cId = parseInt(courseId, 10);

    const lessons = await Lesson.findAll({
      where: { course_id: cId },
      include: [{ model: Unit, as: "unit", attributes: ["id", "title", "order_index"] }],
      order: [["order_index", "ASC"]],
    });

    return res.json({ success: true, lessons: lessons.map(buildFileUrls), count: lessons.length });
  } catch (err) {
    console.error("getLessonsByCourse error:", err?.message || err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch lessons",
      details: process.env.NODE_ENV === "development" ? err?.message : undefined,
    });
  }
};

/* -------------------------
   GET LESSONS BY UNIT
   - returns lessons[] in camelCase
   ------------------------- */
export const getLessonsByUnit = async (req, res) => {
  try {
    const unitId = req.params.unitId ?? req.params.id;
    if (!unitId || isNaN(parseInt(unitId, 10))) {
      return res.status(400).json({ success: false, error: "Valid unit ID is required" });
    }
    const uId = parseInt(unitId, 10);

    const lessons = await Lesson.findAll({
      where: { unit_id: uId },
      order: [["order_index", "ASC"]],
    });

    return res.json({ success: true, lessons: lessons.map(buildFileUrls), count: lessons.length });
  } catch (err) {
    console.error("getLessonsByUnit error:", err?.message || err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch unit lessons",
      details: process.env.NODE_ENV === "development" ? err?.message : undefined,
    });
  }
};

/* -------------------------
   DELETE LESSON
   - authorization: teacher-owner or admin
   ------------------------- */
export const deleteLesson = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const lessonId = req.params.lessonId ?? req.params.id;
    if (!lessonId || isNaN(parseInt(lessonId, 10))) {
      await t.rollback();
      return res.status(400).json({ success: false, error: "Valid lesson ID is required" });
    }
    const id = parseInt(lessonId, 10);

    const lesson = await Lesson.findByPk(id, { transaction: t });
    if (!lesson) {
      await t.rollback();
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }

    // Authorization
    if (req.user && req.user.role === "teacher") {
      const course = await Course.findByPk(lesson.course_id, { transaction: t });
      if (!course || course.teacher_id !== req.user.id) {
        await t.rollback();
        return res.status(403).json({ success: false, error: "You can only delete lessons from your courses" });
      }
    }

    await lesson.destroy({ transaction: t });
    await t.commit();
    return res.json({ success: true, message: "Lesson deleted", deletedId: id });
  } catch (err) {
    await t.rollback();
    console.error("deleteLesson error:", err?.message || err);
    return res.status(500).json({
      success: false,
      error: "Failed to delete lesson",
      details: process.env.NODE_ENV === "development" ? err?.message : undefined,
    });
  }
};

/* -------------------------
   Default export
   ------------------------- */
export default {
  buildFileUrls,
  getLessonById,
  getPreviewLessonForCourse,
  getPublicPreviewByLessonId,
  createLesson,
  updateLesson,
  getLessonsByCourse,
  getLessonsByUnit,
  deleteLesson,
};
