
// // controllers/lessonController.js

// import db from "../models/index.js";

// const { Lesson, Course } = db;

// /* -------------------------
//    Helpers
// ------------------------- */
// const getBackendUrl = () => {
//   if (process.env.BACKEND_URL)
//     return process.env.BACKEND_URL.replace(/\/$/, "");
//   if (process.env.RENDER_EXTERNAL_URL)
//     return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, "");
//   return `http://localhost:${process.env.PORT || 5000}`;
// };

// // 🔥 ENHANCED: Fix Cloudinary URLs helper with better logging
// const fixCloudinaryUrl = (url) => {
//   if (!url || typeof url !== 'string') return url;
  
//   // Fix Cloudinary URLs that are incorrectly typed
//   if (url.includes('cloudinary.com')) {
//     const originalUrl = url;
    
//     // Fix PDF URLs that are uploaded as images
//     if (url.includes('/image/upload/') && 
//         (url.includes('.pdf') || url.includes('/mathe-class/pdfs/') || url.includes('/pdfs/'))) {
//       console.log(`🔧 Fixing Cloudinary PDF URL: ${url.substring(0, 80)}...`);
//       url = url.replace('/image/upload/', '/raw/upload/');
//     }
    
//     // Ensure raw uploads for documents
//     else if ((url.includes('.doc') || url.includes('.docx') || url.includes('.ppt') || 
//              url.includes('.pptx') || url.includes('.xls') || url.includes('.xlsx')) &&
//             url.includes('/image/upload/')) {
//       console.log(`🔧 Fixing Office document URL: ${url.substring(0, 80)}...`);
//       url = url.replace('/image/upload/', '/raw/upload/');
//     }
    
//     // Fix video URLs
//     else if (url.includes('/image/upload/') && 
//             (url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') || 
//              url.includes('.webm') || url.includes('.wmv'))) {
//       console.log(`🔧 Fixing Video URL: ${url.substring(0, 80)}...`);
//       url = url.replace('/image/upload/', '/video/upload/');
//     }
    
//     if (originalUrl !== url) {
//       console.log(`✅ Fixed: ${originalUrl.substring(0, 80)}... -> ${url.substring(0, 80)}...`);
//     }
//   }
  
//   return url;
// };

// // 🔥 NEW: Ensure raw upload for PDFs before saving
// const ensureRawUploadForPdf = (url) => {
//   if (!url || typeof url !== 'string') return url;
  
//   // For Cloudinary PDFs, always ensure /raw/upload/
//   if (url.includes('cloudinary.com') && 
//       (url.includes('.pdf') || url.includes('/pdfs/') || url.includes('/mathe-class/pdfs/'))) {
    
//     if (url.includes('/image/upload/')) {
//       const fixedUrl = url.replace('/image/upload/', '/raw/upload/');
//       console.log(`📄 Ensuring raw upload for PDF: ${fixedUrl.substring(0, 80)}...`);
//       return fixedUrl;
//     }
    
//     // If it's not using /image/upload/ but also not /raw/upload/, add it
//     if (!url.includes('/raw/upload/') && !url.includes('/image/upload/')) {
//       // Extract the version and path
//       const match = url.match(/https:\/\/res\.cloudinary\.com\/[^\/]+\/([^\/]+)\/(.+)/);
//       if (match) {
//         const fixedUrl = `https://res.cloudinary.com/${match[1]}/raw/upload/${match[2]}`;
//         console.log(`📄 Added raw upload for PDF: ${fixedUrl.substring(0, 80)}...`);
//         return fixedUrl;
//       }
//     }
//   }
  
//   return url;
// };

// export const buildFileUrls = (lesson) => {
//   if (!lesson) return null;
//   const raw = lesson.toJSON ? lesson.toJSON() : lesson;

//   const normalize = (url) => {
//     if (!url) return null;
    
//     // 🔥 FIX: Apply Cloudinary URL fixing
//     url = fixCloudinaryUrl(url);
    
//     if (url.startsWith("http")) {
//       return url;
//     }

//     // Local file URL
//     return `${getBackendUrl()}/api/v1/files/${encodeURIComponent(
//       url.replace(/^\/?Uploads\//, "")
//     )}`;
//   };

//   return {
//     id: raw.id,
//     title: raw.title,
//     contentType: raw.content_type,
//     textContent: raw.content,
//     fileUrl: normalize(raw.file_url),
//     videoUrl: normalize(raw.video_url),
//     isPreview: !!raw.is_preview,
//     orderIndex: raw.order_index,
//     unitId: raw.unit_id,
//     courseId: raw.course_id,
//     createdAt: raw.created_at,
//     updatedAt: raw.updated_at,
//   };
// };

// /* -------------------------
//    CRUD — LESSON
// ------------------------- */

// // GET /lessons/:id
// export const getLessonById = async (req, res) => {
//   try {
//     const lesson = await Lesson.findByPk(req.params.id);
//     if (!lesson) {
//       return res
//         .status(404)
//         .json({ success: false, error: "Lesson not found" });
//     }

//     res.json({ success: true, lesson: buildFileUrls(lesson) });
//   } catch (err) {
//     console.error("❌ Get lesson error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to load lesson",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// };

// // POST /course/:courseId/lessons
// export const createLesson = async (req, res) => {
//   try {
//     console.log("📝 Creating lesson for course:", req.params.courseId);
//     console.log(
//       "📤 Files received:",
//       req.files ? Object.keys(req.files) : "No files"
//     );

//     // Get processed uploads from middleware
//     const uploads = req.processedUploads || {};
//     console.log("📄 Processed uploads:", uploads);

//     // 🔥 ENHANCED FIX: Apply enhanced Cloudinary URL fixing before saving
//     let fixedFileUrl = null;
//     if (uploads.fileUrl) {
//       // First ensure PDFs use raw upload
//       fixedFileUrl = ensureRawUploadForPdf(uploads.fileUrl);
//       // Then apply general fixes
//       fixedFileUrl = fixCloudinaryUrl(fixedFileUrl);
      
//       if (fixedFileUrl !== uploads.fileUrl) {
//         console.log(`🔧 Fixed file URL before save: ${fixedFileUrl.substring(0, 80)}...`);
//       }
//     }

//     const lesson = await Lesson.create({
//       ...req.body,
//       course_id: req.params.courseId,
//       file_url: fixedFileUrl || null,
//       video_url: uploads.videoUrl || null,
//     });

//     console.log(`✅ Lesson created: ${lesson.id} - "${lesson.title}"`);

//     res.status(201).json({
//       success: true,
//       lesson: buildFileUrls(lesson),
//       uploads: {
//         ...uploads,
//         fileUrl: fixedFileUrl
//       },
//     });
//   } catch (err) {
//     console.error("❌ Create lesson error:", err);
//     console.error("Full error:", err.stack);

//     // Handle specific errors
//     if (err.name === "SequelizeValidationError") {
//       const errors = err.errors.map((e) => ({
//         field: e.path,
//         message: e.message,
//       }));
//       return res.status(400).json({
//         success: false,
//         error: "Validation failed",
//         details: errors,
//       });
//     }

//     if (err.name === "SequelizeUniqueConstraintError") {
//       return res.status(400).json({
//         success: false,
//         error: "A lesson with this title already exists in this course",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: "Failed to create lesson",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// };

// // PUT /lessons/:lessonId - UPDATED WITH ENHANCED FIXES
// export const updateLesson = async (req, res) => {
//   try {
//     const lessonId = req.params.lessonId;
//     console.log(`📝 Updating lesson ${lessonId}`);
//     console.log("📤 Request body:", req.body);
//     console.log(
//       "📤 Files received:",
//       req.files ? Object.keys(req.files) : "No files"
//     );

//     // Find the lesson
//     const lesson = await Lesson.findByPk(lessonId);
//     if (!lesson) {
//       return res.status(404).json({
//         success: false,
//         error: `Lesson ${lessonId} not found`,
//       });
//     }

//     // Get processed uploads from middleware
//     const uploads = req.processedUploads || {};
//     console.log("📄 Processed uploads:", uploads);

//     // Prepare update data
//     const updateData = {
//       title: req.body.title !== undefined ? req.body.title : lesson.title,
//       content:
//         req.body.content !== undefined ? req.body.content : lesson.content,
//       content_type:
//         req.body.content_type !== undefined
//           ? req.body.content_type
//           : lesson.content_type,
//       is_preview:
//         req.body.is_preview !== undefined
//           ? req.body.is_preview
//           : lesson.is_preview,
//       order_index:
//         req.body.order_index !== undefined
//           ? req.body.order_index
//           : lesson.order_index,
//     };

//     // Update file URLs if new files were uploaded
//     if (uploads.fileUrl) {
//       console.log(`📄 Setting new file_url: ${uploads.fileUrl}`);
      
//       // 🔥 ENHANCED FIX: Apply enhanced Cloudinary URL fixing before saving
//       let fixedUrl = ensureRawUploadForPdf(uploads.fileUrl);
//       fixedUrl = fixCloudinaryUrl(fixedUrl);
      
//       if (fixedUrl !== uploads.fileUrl) {
//         console.log(`🔧 Fixed URL before save: ${fixedUrl.substring(0, 80)}...`);
//       }
      
//       updateData.file_url = fixedUrl;
//     }

//     if (uploads.videoUrl) {
//       console.log(`🎥 Setting new video_url: ${uploads.videoUrl}`);
//       updateData.video_url = uploads.videoUrl;
//     }

//     // 🔥 ENHANCED FIX: Also fix existing URLs if they're wrong
//     if (!uploads.fileUrl && lesson.file_url) {
//       const fixedExistingUrl = ensureRawUploadForPdf(lesson.file_url);
//       const finalFixedUrl = fixCloudinaryUrl(fixedExistingUrl);
      
//       if (finalFixedUrl !== lesson.file_url) {
//         console.log(`🔧 Fixing existing file_url: ${finalFixedUrl.substring(0, 80)}...`);
//         updateData.file_url = finalFixedUrl;
//       }
//     }

//     // Update the lesson
//     await lesson.update(updateData);

//     // Fetch the updated lesson with relations
//     const updatedLesson = await Lesson.findByPk(lessonId);

//     console.log(`✅ Lesson ${lessonId} updated successfully`);
    
//     // Log the final URL for debugging
//     console.log(`📊 Final file_url in database: ${updatedLesson.file_url}`);
    
//     // Log if it's a PDF and the URL type
//     if (updatedLesson.file_url && updatedLesson.file_url.includes('cloudinary.com')) {
//       if (updatedLesson.file_url.includes('.pdf') || updatedLesson.file_url.includes('/pdfs/')) {
//         if (updatedLesson.file_url.includes('/raw/upload/')) {
//           console.log(`📄 PDF with correct /raw/upload/ format`);
//         } else if (updatedLesson.file_url.includes('/image/upload/')) {
//           console.log(`⚠️ WARNING: PDF still has /image/upload/ format - will need client-side fixing`);
//         }
//       }
//     }

//     res.json({
//       success: true,
//       message: "Lesson updated successfully",
//       lesson: buildFileUrls(updatedLesson),
//       uploads: {
//         ...uploads,
//         fileUrl: uploads.fileUrl ? fixCloudinaryUrl(uploads.fileUrl) : null
//       },
//     });
//   } catch (err) {
//     console.error("❌ Update lesson error:", err);
//     console.error("Full error:", err.stack);

//     // Handle specific errors
//     if (err.name === "SequelizeValidationError") {
//       const errors = err.errors.map((e) => ({
//         field: e.path,
//         message: e.message,
//       }));
//       return res.status(400).json({
//         success: false,
//         error: "Validation failed",
//         details: errors,
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: "Failed to update lesson",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// };

// // DELETE /lessons/:lessonId
// export const deleteLesson = async (req, res) => {
//   try {
//     const lesson = await Lesson.findByPk(req.params.lessonId);
//     if (!lesson) {
//       return res
//         .status(404)
//         .json({ success: false, error: "Lesson not found" });
//     }

//     await lesson.destroy();

//     res.json({
//       success: true,
//       message: "Lesson deleted successfully",
//       deletedId: req.params.lessonId,
//     });
//   } catch (err) {
//     console.error("❌ Delete lesson error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to delete lesson",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// };

// /* -------------------------
//    LISTING
// ------------------------- */

// export const getLessonsByUnit = async (req, res) => {
//   try {
//     const lessons = await Lesson.findAll({
//       where: { unit_id: req.params.unitId },
//       order: [["order_index", "ASC"]],
//     });

//     res.json({
//       success: true,
//       lessons: lessons.map(buildFileUrls),
//       count: lessons.length,
//     });
//   } catch (err) {
//     console.error("❌ Get lessons by unit error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to load unit lessons",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// };

// export const getLessonsByCourse = async (req, res) => {
//   try {
//     const lessons = await Lesson.findAll({
//       where: { course_id: req.params.courseId },
//       order: [
//         ["unit_id", "ASC"],
//         ["order_index", "ASC"],
//       ],
//     });

//     res.json({
//       success: true,
//       lessons: lessons.map(buildFileUrls),
//       count: lessons.length,
//     });
//   } catch (err) {
//     console.error("❌ Get lessons by course error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to load course lessons",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// };

// /* -------------------------
//    PREVIEW
// ------------------------- */

// export const getPreviewLessonForCourse = async (req, res) => {
//   try {
//     const lesson =
//       (await Lesson.findOne({
//         where: { course_id: req.params.courseId, is_preview: true },
//         order: [["order_index", "ASC"]],
//       })) ||
//       (await Lesson.findOne({
//         where: { course_id: req.params.courseId },
//         order: [["order_index", "ASC"]],
//       }));

//     if (!lesson) {
//       return res.status(404).json({
//         success: false,
//         error: "No lessons found for this course",
//       });
//     }

//     const course = await Course.findByPk(req.params.courseId, {
//       attributes: ["id", "title", "slug", "thumbnail"],
//     });

//     res.json({
//       success: true,
//       lesson: buildFileUrls(lesson),
//       course,
//     });
//   } catch (err) {
//     console.error("❌ Preview lesson error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to load preview lesson",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// };

// export const getPublicPreviewByLessonId = async (req, res) => {
//   try {
//     const lesson = await Lesson.findByPk(req.params.lessonId);
//     if (!lesson) {
//       return res
//         .status(404)
//         .json({ success: false, error: "Lesson not found" });
//     }

//     // Check if it's a preview lesson or user has access
//     if (!lesson.is_preview && !req.user) {
//       return res.status(403).json({
//         success: false,
//         error: "This lesson requires enrollment",
//       });
//     }

//     const course = await Course.findByPk(lesson.course_id, {
//       attributes: ["id", "title", "slug"],
//     });

//     res.json({
//       success: true,
//       lesson: buildFileUrls(lesson),
//       course,
//     });
//   } catch (err) {
//     console.error("❌ Public preview error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to load preview",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// };

// /* -------------------------
//    DEBUG HELPERS
// ------------------------- */

// export const debugLessonFile = async (req, res) => {
//   try {
//     const lessonId = req.params.lessonId || req.query.lessonId;
//     const lesson = lessonId ? await Lesson.findByPk(lessonId) : null;

//     res.json({
//       success: true,
//       message: "debugLessonFile OK",
//       lesson: lesson ? buildFileUrls(lesson) : null,
//       timestamp: new Date().toISOString(),
//     });
//   } catch (err) {
//     console.error("❌ Debug error:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

// export const fixLessonFileUrl = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     if (!lessonId) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Lesson ID required" });
//     }

//     const lesson = await Lesson.findByPk(lessonId);
//     if (!lesson) {
//       return res
//         .status(404)
//         .json({ success: false, error: "Lesson not found" });
//     }

//     // Fix Cloudinary URLs if needed
//     if (lesson.file_url && lesson.file_url.includes("cloudinary.com")) {
//       const oldUrl = lesson.file_url;
      
//       // 🔥 Use enhanced fixing
//       let newUrl = ensureRawUploadForPdf(oldUrl);
//       newUrl = fixCloudinaryUrl(newUrl);

//       if (oldUrl !== newUrl) {
//         await lesson.update({ file_url: newUrl });
//         return res.json({
//           success: true,
//           message: "File URL fixed",
//           oldUrl,
//           newUrl,
//           note: "PDFs should use /raw/upload/ instead of /image/upload/",
//         });
//       }
//     }

//     res.json({
//       success: true,
//       message: "No fixes needed",
//       file_url: lesson.file_url,
//       is_pdf: lesson.file_url?.includes('.pdf'),
//       uses_raw_upload: lesson.file_url?.includes('/raw/upload/'),
//       uses_image_upload: lesson.file_url?.includes('/image/upload/'),
//     });
//   } catch (err) {
//     console.error("❌ Fix file URL error:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

// // 🔥 NEW: Bulk fix all Cloudinary PDF URLs
// export const fixAllCloudinaryUrls = async (req, res) => {
//   try {
//     console.log("🔧 Fixing all Cloudinary URLs in database...");
    
//     // Find all lessons with Cloudinary URLs
//     const lessons = await Lesson.findAll({
//       where: {
//         file_url: {
//           [db.Sequelize.Op.like]: '%cloudinary.com%'
//         }
//       }
//     });
    
//     console.log(`📊 Found ${lessons.length} lessons with Cloudinary URLs`);
    
//     let fixedCount = 0;
//     const results = [];
    
//     for (const lesson of lessons) {
//       const oldUrl = lesson.file_url;
      
//       // Apply enhanced fixing
//       let newUrl = ensureRawUploadForPdf(oldUrl);
//       newUrl = fixCloudinaryUrl(newUrl);
      
//       // Update if changed
//       if (newUrl !== oldUrl) {
//         await lesson.update({ file_url: newUrl });
//         fixedCount++;
        
//         results.push({
//           lessonId: lesson.id,
//           title: lesson.title,
//           oldUrl: oldUrl.substring(0, 100),
//           newUrl: newUrl.substring(0, 100),
//           fixed: true
//         });
        
//         console.log(`✅ Fixed lesson ${lesson.id}: ${oldUrl.substring(0, 80)}... -> ${newUrl.substring(0, 80)}...`);
//       } else {
//         results.push({
//           lessonId: lesson.id,
//           title: lesson.title,
//           url: oldUrl.substring(0, 100),
//           fixed: false,
//           reason: "Already correct"
//         });
//       }
//     }
    
//     res.json({
//       success: true,
//       message: `Fixed ${fixedCount} out of ${lessons.length} Cloudinary URLs`,
//       totalLessons: lessons.length,
//       fixedCount,
//       results: results.slice(0, 20), // Return first 20 results
//     });
    
//   } catch (err) {
//     console.error("❌ Bulk fix error:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

// /* -------------------------
//    DEBUG - TEST FILE ACCESS
// ------------------------- */
// export const testFileAccess = async (req, res) => {
//   try {
//     const { url } = req.query;
    
//     if (!url) {
//       return res.status(400).json({
//         success: false,
//         error: "URL parameter required",
//       });
//     }
    
//     console.log(`🔍 Testing file access: ${url}`);
    
//     // Decode URL
//     const decodedUrl = decodeURIComponent(url);
    
//     // Apply fixes for Cloudinary URLs
//     const testUrl = fixCloudinaryUrl(decodedUrl);
    
//     try {
//       // Try to fetch the file with a timeout
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
//       const response = await fetch(testUrl, { 
//         method: 'HEAD',
//         signal: controller.signal
//       });
      
//       clearTimeout(timeoutId);
      
//       // Check if it's a PDF that needs raw upload
//       const needsRawFix = decodedUrl.includes('/image/upload/') && 
//                          (decodedUrl.includes('.pdf') || decodedUrl.includes('/pdfs/'));
      
//       res.json({
//         success: response.ok,
//         url: testUrl,
//         originalUrl: decodedUrl,
//         status: response.status,
//         statusText: response.statusText,
//         headers: {
//           'content-type': response.headers.get('content-type'),
//           'content-length': response.headers.get('content-length'),
//           'content-disposition': response.headers.get('content-disposition'),
//         },
//         cloudinary: {
//           isCloudinary: testUrl.includes('cloudinary.com'),
//           usesImageUpload: testUrl.includes('/image/upload/'),
//           usesRawUpload: testUrl.includes('/raw/upload/'),
//           isPdf: testUrl.includes('.pdf'),
//           needsRawFix,
//           suggestedFix: needsRawFix ? testUrl.replace('/image/upload/', '/raw/upload/') : null
//         }
//       });
      
//     } catch (fetchError) {
//       console.error("Fetch error:", fetchError);
//       res.json({
//         success: false,
//         url: testUrl,
//         originalUrl: decodedUrl,
//         error: fetchError.message,
//         cloudinary: {
//           isCloudinary: testUrl.includes('cloudinary.com'),
//           usesImageUpload: testUrl.includes('/image/upload/'),
//           usesRawUpload: testUrl.includes('/raw/upload/'),
//           isPdf: testUrl.includes('.pdf'),
//         }
//       });
//     }
    
//   } catch (error) {
//     console.error("Test file access error:", error);
//     res.status(500).json({
//       success: false,
//       error: error.message,
//       url: req.query.url,
//     });
//   }
// };

// /* -------------------------
//    EXPORT (DEFAULT)
// ------------------------- */

// export default {
//   buildFileUrls,
//   getLessonById,
//   createLesson,
//   updateLesson,
//   deleteLesson,
//   getLessonsByUnit,
//   getLessonsByCourse,
//   getPreviewLessonForCourse,
//   getPublicPreviewByLessonId,
//   debugLessonFile,
//   fixLessonFileUrl,
//   testFileAccess,
//   fixAllCloudinaryUrls, // 🔥 NEW
// };





// controllers/lessonController.js
import db from "../models/index.js";
import { fixCloudinaryUrl } from "../middleware/cloudinaryUpload.js";

const { Lesson, Course } = db;

/* -------------------------
   Helpers
------------------------- */
const getBackendUrl = () => {
  if (process.env.BACKEND_URL)
    return process.env.BACKEND_URL.replace(/\/$/, "");
  if (process.env.RENDER_EXTERNAL_URL)
    return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, "");
  return `http://localhost:${process.env.PORT || 5000}`;
};

// Helper to ensure raw upload for PDFs before saving
const ensureRawUploadForPdf = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  // For Cloudinary PDFs, always ensure /raw/upload/
  if (url.includes('cloudinary.com') && 
      (url.includes('.pdf') || url.includes('/pdfs/') || url.includes('/mathe-class/pdfs/'))) {
    
    if (url.includes('/image/upload/')) {
      const fixedUrl = url.replace('/image/upload/', '/raw/upload/');
      console.log(`📄 Ensuring raw upload for PDF: ${fixedUrl.substring(0, 80)}...`);
      return fixedUrl;
    }
    
    // If it's not using /image/upload/ but also not /raw/upload/, add it
    if (!url.includes('/raw/upload/') && !url.includes('/image/upload/')) {
      // Extract the version and path
      const match = url.match(/https:\/\/res\.cloudinary\.com\/[^\/]+\/([^\/]+)\/(.+)/);
      if (match) {
        const fixedUrl = `https://res.cloudinary.com/${match[1]}/raw/upload/${match[2]}`;
        console.log(`📄 Added raw upload for PDF: ${fixedUrl.substring(0, 80)}...`);
        return fixedUrl;
      }
    }
  }
  
  return url;
};

export const buildFileUrls = (lesson) => {
  if (!lesson) return null;
  const raw = lesson.toJSON ? lesson.toJSON() : { ...lesson };

  const normalize = (url) => {
    if (!url) return null;
    
    // FIX: Apply Cloudinary URL fixing using the imported function
    url = fixCloudinaryUrl(url);
    
    if (url.startsWith("http")) {
      return url;
    }

    // Local file URL
    return `${getBackendUrl()}/api/v1/files/${encodeURIComponent(
      url.replace(/^\/?Uploads\//, "")
    )}`;
  };

  return {
    id: raw.id,
    title: raw.title,
    contentType: raw.content_type,
    textContent: raw.content,
    fileUrl: normalize(raw.file_url),
    videoUrl: normalize(raw.video_url),
    isPreview: !!raw.is_preview,
    orderIndex: raw.order_index,
    unitId: raw.unit_id,
    courseId: raw.course_id,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
};

/* -------------------------
   CRUD — LESSON
------------------------- */

// GET /lessons/:id
export const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) {
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });
    }

    res.json({ success: true, lesson: buildFileUrls(lesson) });
  } catch (err) {
    console.error("❌ Get lesson error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to load lesson",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// POST /course/:courseId/lessons
export const createLesson = async (req, res) => {
  try {
    console.log("📝 Creating lesson for course:", req.params.courseId);
    console.log(
      "📤 Files received:",
      req.files ? Object.keys(req.files) : "No files"
    );

    // Get processed uploads from middleware
    const uploads = req.processedUploads || {};
    console.log("📄 Processed uploads:", uploads);

    // ENHANCED FIX: Apply enhanced Cloudinary URL fixing before saving
    let fixedFileUrl = null;
    if (uploads.fileUrl) {
      // First ensure PDFs use raw upload
      fixedFileUrl = ensureRawUploadForPdf(uploads.fileUrl);
      // Then apply general fixes
      fixedFileUrl = fixCloudinaryUrl(fixedFileUrl);
      
      if (fixedFileUrl !== uploads.fileUrl) {
        console.log(`🔧 Fixed file URL before save: ${fixedFileUrl.substring(0, 80)}...`);
      }
    }

    const lesson = await Lesson.create({
      ...req.body,
      course_id: req.params.courseId,
      file_url: fixedFileUrl || null,
      video_url: uploads.videoUrl || null,
    });

    console.log(`✅ Lesson created: ${lesson.id} - "${lesson.title}"`);

    res.status(201).json({
      success: true,
      lesson: buildFileUrls(lesson),
      uploads: {
        ...uploads,
        fileUrl: fixedFileUrl
      },
    });
  } catch (err) {
    console.error("❌ Create lesson error:", err);
    console.error("Full error:", err.stack);

    // Handle specific errors
    if (err.name === "SequelizeValidationError") {
      const errors = err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
    }

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        error: "A lesson with this title already exists in this course",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create lesson",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// PUT /lessons/:lessonId
export const updateLesson = async (req, res) => {
  try {
    const lessonId = req.params.lessonId;
    console.log(`📝 Updating lesson ${lessonId}`);
    console.log("📤 Request body:", req.body);
    console.log(
      "📤 Files received:",
      req.files ? Object.keys(req.files) : "No files"
    );

    // Find the lesson
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: `Lesson ${lessonId} not found`,
      });
    }

    // Get processed uploads from middleware
    const uploads = req.processedUploads || {};
    console.log("📄 Processed uploads:", uploads);

    // Prepare update data
    const updateData = {
      title: req.body.title !== undefined ? req.body.title : lesson.title,
      content:
        req.body.content !== undefined ? req.body.content : lesson.content,
      content_type:
        req.body.content_type !== undefined
          ? req.body.content_type
          : lesson.content_type,
      is_preview:
        req.body.is_preview !== undefined
          ? req.body.is_preview
          : lesson.is_preview,
      order_index:
        req.body.order_index !== undefined
          ? req.body.order_index
          : lesson.order_index,
    };

    // Update file URLs if new files were uploaded
    if (uploads.fileUrl) {
      console.log(`📄 Setting new file_url: ${uploads.fileUrl}`);
      
      // Apply Cloudinary URL fixing before saving
      let fixedUrl = ensureRawUploadForPdf(uploads.fileUrl);
      fixedUrl = fixCloudinaryUrl(fixedUrl);
      
      if (fixedUrl !== uploads.fileUrl) {
        console.log(`🔧 Fixed URL before save: ${fixedUrl.substring(0, 80)}...`);
      }
      
      updateData.file_url = fixedUrl;
    }

    if (uploads.videoUrl) {
      console.log(`🎥 Setting new video_url: ${uploads.videoUrl}`);
      updateData.video_url = uploads.videoUrl;
    }

    // Also fix existing URLs if they're wrong
    if (!uploads.fileUrl && lesson.file_url) {
      const fixedExistingUrl = ensureRawUploadForPdf(lesson.file_url);
      const finalFixedUrl = fixCloudinaryUrl(fixedExistingUrl);
      
      if (finalFixedUrl !== lesson.file_url) {
        console.log(`🔧 Fixing existing file_url: ${finalFixedUrl.substring(0, 80)}...`);
        updateData.file_url = finalFixedUrl;
      }
    }

    // Update the lesson
    await lesson.update(updateData);

    // Fetch the updated lesson with relations
    const updatedLesson = await Lesson.findByPk(lessonId);

    console.log(`✅ Lesson ${lessonId} updated successfully`);
    
    // Log the final URL for debugging
    console.log(`📊 Final file_url in database: ${updatedLesson.file_url}`);
    
    // Log if it's a PDF and the URL type
    if (updatedLesson.file_url && updatedLesson.file_url.includes('cloudinary.com')) {
      if (updatedLesson.file_url.includes('.pdf') || updatedLesson.file_url.includes('/pdfs/')) {
        if (updatedLesson.file_url.includes('/raw/upload/')) {
          console.log(`📄 PDF with correct /raw/upload/ format`);
        } else if (updatedLesson.file_url.includes('/image/upload/')) {
          console.log(`⚠️ WARNING: PDF still has /image/upload/ format - will need client-side fixing`);
        }
      }
    }

    res.json({
      success: true,
      message: "Lesson updated successfully",
      lesson: buildFileUrls(updatedLesson),
      uploads: {
        ...uploads,
        fileUrl: uploads.fileUrl ? fixCloudinaryUrl(uploads.fileUrl) : null
      },
    });
  } catch (err) {
    console.error("❌ Update lesson error:", err);
    console.error("Full error:", err.stack);

    // Handle specific errors
    if (err.name === "SequelizeValidationError") {
      const errors = err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update lesson",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// DELETE /lessons/:lessonId
export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId);
    if (!lesson) {
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });
    }

    await lesson.destroy();

    res.json({
      success: true,
      message: "Lesson deleted successfully",
      deletedId: req.params.lessonId,
    });
  } catch (err) {
    console.error("❌ Delete lesson error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete lesson",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/* -------------------------
   LISTING
------------------------- */

export const getLessonsByUnit = async (req, res) => {
  try {
    const lessons = await Lesson.findAll({
      where: { unit_id: req.params.unitId },
      order: [["order_index", "ASC"]],
    });

    res.json({
      success: true,
      lessons: lessons.map(buildFileUrls),
      count: lessons.length,
    });
  } catch (err) {
    console.error("❌ Get lessons by unit error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to load unit lessons",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const getLessonsByCourse = async (req, res) => {
  try {
    const lessons = await Lesson.findAll({
      where: { course_id: req.params.courseId },
      order: [
        ["unit_id", "ASC"],
        ["order_index", "ASC"],
      ],
    });

    res.json({
      success: true,
      lessons: lessons.map(buildFileUrls),
      count: lessons.length,
    });
  } catch (err) {
    console.error("❌ Get lessons by course error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to load course lessons",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/* -------------------------
   PREVIEW
------------------------- */

export const getPreviewLessonForCourse = async (req, res) => {
  try {
    const lesson =
      (await Lesson.findOne({
        where: { course_id: req.params.courseId, is_preview: true },
        order: [["order_index", "ASC"]],
      })) ||
      (await Lesson.findOne({
        where: { course_id: req.params.courseId },
        order: [["order_index", "ASC"]],
      }));

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: "No lessons found for this course",
      });
    }

    const course = await Course.findByPk(req.params.courseId, {
      attributes: ["id", "title", "slug", "thumbnail"],
    });

    res.json({
      success: true,
      lesson: buildFileUrls(lesson),
      course,
    });
  } catch (err) {
    console.error("❌ Preview lesson error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to load preview lesson",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const getPublicPreviewByLessonId = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId);
    if (!lesson) {
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });
    }

    // Check if it's a preview lesson or user has access
    if (!lesson.is_preview && !req.user) {
      return res.status(403).json({
        success: false,
        error: "This lesson requires enrollment",
      });
    }

    const course = await Course.findByPk(lesson.course_id, {
      attributes: ["id", "title", "slug"],
    });

    res.json({
      success: true,
      lesson: buildFileUrls(lesson),
      course,
    });
  } catch (err) {
    console.error("❌ Public preview error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to load preview",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/* -------------------------
   DEBUG HELPERS
------------------------- */

export const debugLessonFile = async (req, res) => {
  try {
    const lessonId = req.params.lessonId || req.query.lessonId;
    const lesson = lessonId ? await Lesson.findByPk(lessonId) : null;

    res.json({
      success: true,
      message: "debugLessonFile OK",
      lesson: lesson ? buildFileUrls(lesson) : null,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Debug error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const fixLessonFileUrl = async (req, res) => {
  try {
    const { lessonId } = req.params;
    if (!lessonId) {
      return res
        .status(400)
        .json({ success: false, error: "Lesson ID required" });
    }

    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });
    }

    // Fix Cloudinary URLs if needed
    if (lesson.file_url && lesson.file_url.includes("cloudinary.com")) {
      const oldUrl = lesson.file_url;
      
      // Use enhanced fixing
      let newUrl = ensureRawUploadForPdf(oldUrl);
      newUrl = fixCloudinaryUrl(newUrl);

      if (oldUrl !== newUrl) {
        await lesson.update({ file_url: newUrl });
        return res.json({
          success: true,
          message: "File URL fixed",
          oldUrl,
          newUrl,
          note: "PDFs should use /raw/upload/ instead of /image/upload/",
        });
      }
    }

    res.json({
      success: true,
      message: "No fixes needed",
      file_url: lesson.file_url,
      is_pdf: lesson.file_url?.includes('.pdf'),
      uses_raw_upload: lesson.file_url?.includes('/raw/upload/'),
      uses_image_upload: lesson.file_url?.includes('/image/upload/'),
    });
  } catch (err) {
    console.error("❌ Fix file URL error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Bulk fix all Cloudinary PDF URLs
export const fixAllCloudinaryUrls = async (req, res) => {
  try {
    console.log("🔧 Fixing all Cloudinary URLs in database...");
    
    // Find all lessons with Cloudinary URLs
    const lessons = await Lesson.findAll({
      where: {
        file_url: {
          [db.Sequelize.Op.like]: '%cloudinary.com%'
        }
      }
    });
    
    console.log(`📊 Found ${lessons.length} lessons with Cloudinary URLs`);
    
    let fixedCount = 0;
    const results = [];
    
    for (const lesson of lessons) {
      const oldUrl = lesson.file_url;
      
      // Apply enhanced fixing
      let newUrl = ensureRawUploadForPdf(oldUrl);
      newUrl = fixCloudinaryUrl(newUrl);
      
      // Update if changed
      if (newUrl !== oldUrl) {
        await lesson.update({ file_url: newUrl });
        fixedCount++;
        
        results.push({
          lessonId: lesson.id,
          title: lesson.title,
          oldUrl: oldUrl.substring(0, 100),
          newUrl: newUrl.substring(0, 100),
          fixed: true
        });
        
        console.log(`✅ Fixed lesson ${lesson.id}: ${oldUrl.substring(0, 80)}... -> ${newUrl.substring(0, 80)}...`);
      } else {
        results.push({
          lessonId: lesson.id,
          title: lesson.title,
          url: oldUrl.substring(0, 100),
          fixed: false,
          reason: "Already correct"
        });
      }
    }
    
    res.json({
      success: true,
      message: `Fixed ${fixedCount} out of ${lessons.length} Cloudinary URLs`,
      totalLessons: lessons.length,
      fixedCount,
      results: results.slice(0, 20),
    });
    
  } catch (err) {
    console.error("❌ Bulk fix error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* -------------------------
   DEBUG - TEST FILE ACCESS
------------------------- */
export const testFileAccess = async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL parameter required",
      });
    }
    
    console.log(`🔍 Testing file access: ${url}`);
    
    // Decode URL
    const decodedUrl = decodeURIComponent(url);
    
    // Apply fixes for Cloudinary URLs
    const testUrl = fixCloudinaryUrl(decodedUrl);
    
    try {
      // Try to fetch the file with a timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(testUrl, { 
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Check if it's a PDF that needs raw upload
      const needsRawFix = decodedUrl.includes('/image/upload/') && 
                         (decodedUrl.includes('.pdf') || decodedUrl.includes('/pdfs/'));
      
      res.json({
        success: response.ok,
        url: testUrl,
        originalUrl: decodedUrl,
        status: response.status,
        statusText: response.statusText,
        headers: {
          'content-type': response.headers.get('content-type'),
          'content-length': response.headers.get('content-length'),
          'content-disposition': response.headers.get('content-disposition'),
        },
        cloudinary: {
          isCloudinary: testUrl.includes('cloudinary.com'),
          usesImageUpload: testUrl.includes('/image/upload/'),
          usesRawUpload: testUrl.includes('/raw/upload/'),
          isPdf: testUrl.includes('.pdf'),
          needsRawFix,
          suggestedFix: needsRawFix ? testUrl.replace('/image/upload/', '/raw/upload/') : null
        }
      });
      
    } catch (fetchError) {
      console.error("Fetch error:", fetchError);
      res.json({
        success: false,
        url: testUrl,
        originalUrl: decodedUrl,
        error: fetchError.message,
        cloudinary: {
          isCloudinary: testUrl.includes('cloudinary.com'),
          usesImageUpload: testUrl.includes('/image/upload/'),
          usesRawUpload: testUrl.includes('/raw/upload/'),
          isPdf: testUrl.includes('.pdf'),
        }
      });
    }
    
  } catch (error) {
    console.error("Test file access error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      url: req.query.url,
    });
  }
};

/* -------------------------
   EXPORT (DEFAULT)
------------------------- */

export default {
  buildFileUrls,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonsByUnit,
  getLessonsByCourse,
  getPreviewLessonForCourse,
  getPublicPreviewByLessonId,
  debugLessonFile,
  fixLessonFileUrl,
  testFileAccess,
  fixAllCloudinaryUrls,
};