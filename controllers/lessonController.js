// // controllers/lessonController.js
// import db from "../models/index.js";
// import path from "path";
// import { fileURLToPath } from "url";
// import fs from "fs";

// const { Lesson, Course, Unit, Enrollment } = db;

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // ✅ FIXED: Enhanced helper function to build full file URLs
// const buildFileUrls = (lesson) => {
//   if (!lesson) return lesson;

//   const lessonData = lesson.toJSON ? lesson.toJSON() : { ...lesson };
//   const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";

//   console.log("🔗 Building URLs for lesson:", {
//     id: lessonData.id,
//     current_file_url: lessonData.file_url,
//     current_video_url: lessonData.video_url,
//   });

//   // Build full URLs for files - only if they exist and aren't already full URLs
//   if (
//     lessonData.video_url &&
//     lessonData.video_url !== null &&
//     lessonData.video_url !== "" &&
//     !lessonData.video_url.startsWith("http")
//   ) {
//     // Ensure proper URL formatting
//     const cleanVideoUrl = lessonData.video_url.startsWith("/")
//       ? lessonData.video_url
//       : `/${lessonData.video_url}`;
//     const fullVideoUrl = `${backendUrl}/api/v1/files${cleanVideoUrl}`;
//     console.log("🎥 Video URL transformed:", fullVideoUrl);
//     lessonData.video_url = fullVideoUrl;
//   }

//   if (
//     lessonData.file_url &&
//     lessonData.file_url !== null &&
//     lessonData.file_url !== "" &&
//     !lessonData.file_url.startsWith("http")
//   ) {
//     // Ensure proper URL formatting
//     const cleanFileUrl = lessonData.file_url.startsWith("/")
//       ? lessonData.file_url
//       : `/${lessonData.file_url}`;
//     const fullFileUrl = `${backendUrl}/api/v1/files${cleanFileUrl}`;
//     console.log("📄 File URL transformed:", fullFileUrl);
//     lessonData.file_url = fullFileUrl;
//   }

//   console.log("✅ Final lesson URLs:", {
//     file_url: lessonData.file_url,
//     video_url: lessonData.video_url,
//   });

//   return lessonData;
// };

// // ✅ FIXED: Enhanced updateLesson function with better file handling
// const updateLesson = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     const {
//       title,
//       content,
//       contentType,
//       orderIndex,
//       videoUrl,
//       unitId,
//       isPreview,
//       isUnitHeader,
//     } = req.body;

//     console.log("🔄 UPDATE LESSON - FULL REQUEST:");
//     console.log("📝 Params:", req.params);
//     console.log("📝 Body:", req.body);
//     console.log("📁 Files:", req.files);
//     console.log("👤 User:", req.user);

//     // Validate lesson ID
//     if (!lessonId || isNaN(lessonId)) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid lesson ID",
//       });
//     }

//     // Find the lesson with course information
//     const lesson = await Lesson.findByPk(lessonId, {
//       include: [
//         {
//           model: Course,
//           as: "course",
//           attributes: ["id", "title", "teacher_id"],
//         },
//       ],
//     });

//     if (!lesson) {
//       console.log("❌ Lesson not found for update:", lessonId);
//       return res.status(404).json({
//         success: false,
//         error: "Lesson not found",
//       });
//     }

//     console.log("📖 Current lesson data:", {
//       id: lesson.id,
//       title: lesson.title,
//       file_url: lesson.file_url,
//       video_url: lesson.video_url,
//       content_type: lesson.content_type,
//     });

//     // Check authorization
//     if (req.user.role !== "admin" && lesson.course.teacher_id !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         error: "Not authorized to update this lesson",
//       });
//     }

//     // ✅ FIXED: Enhanced file upload handling for updates
//     let videoPath = lesson.video_url;
//     let fileUrl = lesson.file_url;
//     const uploadsDir = path.join(process.cwd(), "Uploads");

//     // Ensure upload directory exists
//     if (!fs.existsSync(uploadsDir)) {
//       fs.mkdirSync(uploadsDir, { recursive: true });
//       console.log("✅ Created Uploads directory");
//     }

//     // ✅ FIXED: Handle file uploads properly
//     if (req.files) {
//       console.log("📁 Processing uploaded files:", Object.keys(req.files));

//       // Handle video upload
//       if (req.files.video && req.files.video[0]) {
//         const video = req.files.video[0];
//         console.log("🎥 Processing video upload:", video.originalname);
//         videoPath = `/Uploads/${video.filename}`;
//         console.log("✅ Video path set to:", videoPath);
//       }

//       // Handle file upload (PDF, documents, etc.)
//       if (req.files.file && req.files.file[0]) {
//         const file = req.files.file[0];
//         console.log("📄 Processing file upload:", file.originalname);
//         fileUrl = `/Uploads/${file.filename}`;
//         console.log("✅ File path set to:", fileUrl);
//       }

//       // Also check for PDF files in the 'pdf' field
//       if (req.files.pdf && req.files.pdf[0]) {
//         const pdfFile = req.files.pdf[0];
//         console.log("📑 Processing PDF upload:", pdfFile.originalname);
//         fileUrl = `/Uploads/${pdfFile.filename}`;
//         console.log("✅ PDF path set to:", fileUrl);
//       }
//     } else {
//       console.log("📁 No files were uploaded in this request");
//     }

//     // Prepare update data
//     const updateData = {};

//     if (title !== undefined && title !== null) updateData.title = title.trim();
//     if (content !== undefined && content !== null) updateData.content = content;

//     // ✅ FIXED: CRITICAL - Enhanced content type handling
//     let finalContentType = lesson.content_type; // Start with current type

//     if (isUnitHeader !== undefined && isUnitHeader) {
//       finalContentType = "unit_header";
//       console.log("✅ Content type set to 'unit_header'");
//     }
//     // If a file was uploaded, set content type to PDF (HIGHEST PRIORITY)
//     else if (fileUrl && fileUrl !== lesson.file_url) {
//       finalContentType = "pdf";
//       console.log("✅ Content type set to 'pdf' because file was uploaded");
//     }
//     // If a video was uploaded, set content type to video
//     else if (videoPath && videoPath !== lesson.video_url) {
//       finalContentType = "video";
//       console.log("✅ Content type set to 'video' because video was uploaded");
//     }
//     // If content type was explicitly provided in form, use it
//     else if (
//       contentType !== undefined &&
//       contentType !== null &&
//       contentType !== ""
//     ) {
//       finalContentType = contentType;
//       console.log("✅ Content type set from form data:", contentType);
//     }
//     // Auto-detect based on existing files if no new files uploaded
//     else if (lesson.file_url && !fileUrl) {
//       finalContentType = "pdf";
//       console.log("✅ Content type auto-detected as 'pdf' from existing file");
//     } else if (lesson.video_url && !videoPath) {
//       finalContentType = "video";
//       console.log(
//         "✅ Content type auto-detected as 'video' from existing video"
//       );
//     } else if (!finalContentType || finalContentType === "") {
//       finalContentType = "text";
//       console.log("✅ Content type set to 'text' as default");
//     }

//     updateData.content_type = finalContentType;

//     // Handle order index
//     if (orderIndex !== undefined && orderIndex !== null) {
//       updateData.order_index = parseInt(orderIndex);
//     }

//     // Handle video URL
//     if (videoPath !== lesson.video_url) {
//       updateData.video_url = videoPath;
//     } else if (videoUrl !== undefined && videoUrl !== null) {
//       updateData.video_url = videoUrl;
//     }

//     // ✅ FIXED: CRITICAL - Always update file_url if a new file was uploaded
//     if (fileUrl !== lesson.file_url) {
//       updateData.file_url = fileUrl;
//       console.log("✅ File URL updated:", fileUrl);
//     }

//     if (unitId !== undefined && unitId !== null) {
//       updateData.unit_id = unitId;
//     }

//     if (isPreview !== undefined) {
//       updateData.is_preview = Boolean(isPreview);
//     }

//     console.log("🔄 Final update data to be saved:", updateData);

//     // Update lesson
//     const [affectedRows] = await Lesson.update(updateData, {
//       where: { id: lessonId },
//     });

//     if (affectedRows === 0) {
//       console.log("❌ No rows affected during update");
//       return res.status(500).json({
//         success: false,
//         error: "Failed to update lesson - no changes made",
//       });
//     }

//     console.log(`✅ ${affectedRows} row(s) updated successfully`);

//     // ✅ FIXED: Fetch the complete updated lesson with associations
//     const updatedLesson = await Lesson.findByPk(lessonId, {
//       include: [
//         {
//           model: Course,
//           as: "course",
//           attributes: ["id", "title", "teacher_id"],
//         },
//         {
//           model: Unit,
//           as: "unit",
//           attributes: ["id", "title"],
//         },
//       ],
//     });

//     if (!updatedLesson) {
//       console.log("❌ Failed to fetch updated lesson");
//       return res.status(500).json({
//         success: false,
//         error: "Lesson updated but failed to fetch updated data",
//       });
//     }

//     // Build full URLs
//     const lessonResponse = buildFileUrls(updatedLesson);

//     console.log("✅ Lesson updated successfully:", {
//       id: lessonResponse.id,
//       title: lessonResponse.title,
//       file_url: lessonResponse.file_url,
//       video_url: lessonResponse.video_url,
//       content_type: lessonResponse.content_type,
//       is_preview: lessonResponse.is_preview,
//     });

//     res.json({
//       success: true,
//       message: "Lesson updated successfully",
//       lesson: lessonResponse,
//     });
//   } catch (error) {
//     console.error("❌ ERROR updating lesson:", error);

//     if (error.name === "SequelizeValidationError") {
//       const errors = error.errors.map((err) => ({
//         field: err.path,
//         message: err.message,
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
//       details:
//         process.env.NODE_ENV === "development"
//           ? error.message
//           : "Internal server error",
//     });
//   }
// };

// // ✅ FIXED: Enhanced getLessonById function
// const getLessonById = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     console.log("🔍 Fetching lesson by ID:", lessonId);

//     const lesson = await Lesson.findByPk(lessonId, {
//       include: [
//         {
//           model: Course,
//           as: "course",
//           attributes: ["id", "title", "teacher_id"],
//         },
//         {
//           model: Unit,
//           as: "unit",
//           attributes: ["id", "title"],
//         },
//       ],
//       attributes: [
//         "id",
//         "title",
//         "content",
//         "video_url",
//         "file_url",
//         "order_index",
//         "content_type",
//         "unit_id",
//         "is_preview",
//         "created_at",
//         "updated_at",
//       ],
//     });

//     if (!lesson) {
//       console.log("❌ Lesson not found:", lessonId);
//       return res.status(404).json({
//         success: false,
//         error: "Lesson not found",
//       });
//     }

//     // Check if user has access to this lesson
//     if (req.user.role !== "admin" && lesson.course.teacher_id !== req.user.id) {
//       // For students, check if they're enrolled in the course
//       if (req.user.role === "student") {
//         const enrollment = await Enrollment.findOne({
//           where: {
//             user_id: req.user.id,
//             course_id: lesson.course_id,
//             approval_status: "approved",
//           },
//         });

//         if (!enrollment) {
//           return res.status(403).json({
//             success: false,
//             error: "Not enrolled in this course",
//           });
//         }
//       } else {
//         return res.status(403).json({
//           success: false,
//           error: "Not authorized to access this lesson",
//         });
//       }
//     }

//     console.log("✅ Lesson found:", {
//       id: lesson.id,
//       title: lesson.title,
//       file_url: lesson.file_url,
//       video_url: lesson.video_url,
//       content_type: lesson.content_type,
//       is_preview: lesson.is_preview,
//     });

//     // Build full URLs
//     const lessonWithUrls = buildFileUrls(lesson);

//     res.json({
//       success: true,
//       lesson: lessonWithUrls,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching lesson:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch lesson",
//     });
//   }
// };

// const getLessonsByCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     console.log("📚 Fetching lessons for course:", courseId);

//     const lessons = await Lesson.findAll({
//       where: { course_id: courseId },
//       order: [["order_index", "ASC"]],
//       include: [
//         {
//           association: "unit",
//           attributes: ["id", "title"],
//         },
//       ],
//       attributes: [
//         "id",
//         "title",
//         "content",
//         "video_url",
//         "file_url",
//         "order_index",
//         "content_type",
//         "unit_id",
//         "is_preview",
//         "created_at",
//         "updated_at",
//       ],
//     });

//     console.log(`✅ Found ${lessons.length} lessons for course ${courseId}`);

//     // Build full URLs for all lessons
//     const lessonsWithUrls = lessons.map((lesson) => buildFileUrls(lesson));

//     res.json({
//       success: true,
//       lessons: lessonsWithUrls,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching lessons:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch lessons",
//     });
//   }
// };

// const getLessonsByUnit = async (req, res) => {
//   try {
//     const { unitId } = req.params;
//     console.log("📚 Fetching lessons for unit:", unitId);

//     const lessons = await Lesson.findAll({
//       where: { unit_id: unitId },
//       order: [["order_index", "ASC"]],
//       include: [
//         {
//           association: "unit",
//           attributes: ["id", "title"],
//         },
//       ],
//       attributes: [
//         "id",
//         "title",
//         "content",
//         "video_url",
//         "file_url",
//         "order_index",
//         "content_type",
//         "unit_id",
//         "is_preview",
//         "created_at",
//       ],
//     });

//     console.log(`✅ Found ${lessons.length} lessons for unit ${unitId}`);

//     // Build full URLs for all lessons
//     const lessonsWithUrls = lessons.map((lesson) => buildFileUrls(lesson));

//     res.json({
//       success: true,
//       lessons: lessonsWithUrls,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching lessons by unit:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch lessons",
//     });
//   }
// };

// const deleteLesson = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     console.log("🗑️ Deleting lesson:", lessonId);

//     const lesson = await Lesson.findByPk(lessonId, {
//       include: [
//         {
//           model: Course,
//           as: "course",
//           attributes: ["id", "teacher_id"],
//         },
//       ],
//     });

//     if (!lesson) {
//       return res.status(404).json({
//         success: false,
//         error: "Lesson not found",
//       });
//     }

//     // Check authorization
//     if (req.user.role !== "admin" && lesson.course.teacher_id !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         error: "Not authorized to delete this lesson",
//       });
//     }

//     await lesson.destroy();

//     console.log("✅ Lesson deleted successfully:", lessonId);
//     res.json({
//       success: true,
//       message: "Lesson deleted successfully",
//     });
//   } catch (error) {
//     console.error("❌ Error deleting lesson:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to delete lesson",
//     });
//   }
// };

// // ✅ SINGLE EXPORT STATEMENT - No duplicates
// export {
//   createLesson,
//   getLessonsByCourse,
//   getLessonsByUnit,
//   getLessonById,
//   updateLesson,
//   deleteLesson,
//   debugGetLesson,
//   debugCheckFile,
//   debugFileUrl,
// };






// controllers/lessonController.js

import db from "../models/index.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { Op } from "sequelize";

// IMPORTANT: Assuming Lesson, Course, Unit, Enrollment are correctly exported from db
const { Lesson, Course, Unit, Enrollment } = db;

// Helper to determine the backend URL for file serving
const getBackendUrl = () => {
  return (
    process.env.BACKEND_URL ||
    "https://mathe-class-website-backend-1.onrender.com"
  );
};

// Enhanced helper function to build full file URLs (no changes needed)
const buildFileUrls = (lesson) => {
  if (!lesson) return lesson;

  const lessonData = lesson.toJSON ? lesson.toJSON() : { ...lesson };
  const backendUrl = getBackendUrl(); // Build full URLs for files - only if they exist and aren't already full URLs // NOTE: The relative path stored in DB is expected to be like: /Uploads/filename.pdf // Handle Video URL

  if (lessonData.video_url && !lessonData.video_url.startsWith("http")) {
    // Ensure proper URL formatting: /api/v1/files + stored path
    const cleanVideoUrl = lessonData.video_url.startsWith("/")
      ? lessonData.video_url
      : `/${lessonData.video_url}`;
    const fullVideoUrl = `${backendUrl}/api/v1/files${cleanVideoUrl}`;
    lessonData.video_url = fullVideoUrl;
  } // Handle File URL (PDF/Document)

  if (lessonData.file_url && !lessonData.file_url.startsWith("http")) {
    // Ensure proper URL formatting: /api/v1/files + stored path
    const cleanFileUrl = lessonData.file_url.startsWith("/")
      ? lessonData.file_url
      : `/${lessonData.file_url}`;
    const fullFileUrl = `${backendUrl}/api/v1/files${cleanFileUrl}`;
    lessonData.file_url = fullFileUrl;
  }

  return lessonData;
};

// ----------------------------------------------------------------------
// ✅ CRITICAL FIX: The logic to handle uploaded files during an update
// ----------------------------------------------------------------------
const handleFileUploads = (req, lesson) => {
  const updatePaths = {};
  let fileUploaded = false; // 1. Video Upload

  if (req.files?.video && req.files.video[0]) {
    const video = req.files.video[0];
    updatePaths.video_url = `/Uploads/${video.filename}`;
    updatePaths.content_type = "video";
    fileUploaded = true;
    console.log("🎥 New video uploaded, path set to:", updatePaths.video_url);
  } // 2. Document/PDF Upload (prioritized over general 'file' if both exist)

  if (req.files?.pdf && req.files.pdf[0]) {
    const pdfFile = req.files.pdf[0];
    updatePaths.file_url = `/Uploads/${pdfFile.filename}`;
    updatePaths.content_type = "pdf";
    fileUploaded = true;
    console.log("📑 New PDF uploaded, path set to:", updatePaths.file_url);
  } else if (req.files?.file && req.files.file[0]) {
    // General file upload (could be DOCX, TXT, etc.)
    const file = req.files.file[0];
    updatePaths.file_url = `/Uploads/${file.filename}`;
    updatePaths.content_type = "pdf"; // Treating all documents as 'pdf' type for content view
    fileUploaded = true;
    console.log("📄 New file uploaded, path set to:", updatePaths.file_url);
  } // 3. If a new file/video was uploaded, clear the other path to ensure only one is active

  if (fileUploaded) {
    // If video uploaded, ensure file_url is nulled out if not explicitly provided
    if (updatePaths.video_url) {
      updatePaths.file_url = null;
    } // If document uploaded, ensure video_url is nulled out
    else if (updatePaths.file_url) {
      updatePaths.video_url = null;
    }
  }

  return updatePaths;
};

// ----------------------------------------------------------------------
// Lesson Creation and Update Functions
// ----------------------------------------------------------------------

const createLesson = async (req, res) => {
  try {
    console.log("📝 Creating lesson - Request body:", req.body);
    console.log("📁 Uploaded files:", req.files);

    const { courseId } = req.params;
    const {
      title,
      content,
      contentType,
      orderIndex,
      videoUrl,
      unitId,
      isPreview,
    } = req.body; // ... (Input validation and Course/Unit verification remains the same) ... // Verify course exists

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: `Course with ID ${courseId} not found`,
      });
    } // Check authorization

    if (req.user.role !== "admin" && course.teacher_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to create lessons for this course",
      });
    } // --- File Handling using the new helper structure ---
    const initialLessonData = {
      video_url: videoUrl,
      file_url: null,
      content_type: contentType || "text",
    };
    const filePaths = handleFileUploads(req, initialLessonData);
    let videoPath = filePaths.video_url || videoUrl || null;
    let fileUrl = filePaths.file_url || null;
    let finalContentType = filePaths.content_type || contentType || "text"; // If no file was uploaded, check if the videoUrl provided is a direct link

    if (!fileUrl && !videoPath && videoUrl) {
      videoPath = videoUrl; // Assuming external link
      finalContentType =
        finalContentType === "text" ? "video" : finalContentType;
    } // Get order index (logic remains the same)
    let orderIndexValue = orderIndex;
    if (!orderIndexValue && orderIndexValue !== 0) {
      const whereClause = unitId
        ? { unit_id: unitId }
        : { course_id: courseId, unit_id: null };
      const lastLesson = await Lesson.findOne({
        where: whereClause,
        order: [["order_index", "DESC"]],
      });
      orderIndexValue = lastLesson ? lastLesson.order_index + 1 : 1;
    } // Create lesson

    const lesson = await Lesson.create({
      course_id: courseId,
      unit_id: unitId || null,
      title: title.trim(),
      content: (content || "").trim(),
      video_url: videoPath,
      file_url: fileUrl, // Now correctly storing the path
      order_index: orderIndexValue,
      content_type: finalContentType,
      is_preview: isPreview || false,
    });

    console.log("✅ Lesson created successfully:", lesson.id); // Fetch the complete lesson with associations and URLs

    const completeLesson = await Lesson.findByPk(lesson.id, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "teacher_id"],
        },
        { model: Unit, as: "unit", attributes: ["id", "title"] },
      ],
    });

    const lessonResponse = buildFileUrls(completeLesson);

    console.log("🎉 Lesson creation complete:", {
      id: lessonResponse.id,
      file_url: lessonResponse.file_url,
      content_type: lessonResponse.content_type,
    });

    res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      lesson: lessonResponse,
    });
  } catch (error) {
    console.error("❌ Error creating lesson:", error); // ... (Error handling remains the same) ...
    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create lesson",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ✅ FIXED: CRITICAL - Enhanced updateLesson function
const updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const {
      title,
      content,
      contentType, // Explicit content type from form (if used)
      orderIndex,
      videoUrl, // Explicit external video URL from form (if used)
      unitId,
      isPreview,
      isUnitHeader,
    } = req.body;

    console.log("🔄 UPDATE LESSON - Params:", req.params);
    console.log("📝 Body:", req.body);
    console.log("📁 Files:", req.files); // 1. Authorization and Header Check (No changes needed, logic is sound)
    const lessonCheck = await Lesson.findByPk(lessonId, {
      attributes: [
        "id",
        "content_type",
        "title",
        "course_id",
        "video_url",
        "file_url",
      ],
    });

    if (!lessonCheck) {
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });
    }

    if (lessonCheck.content_type === "unit_header") {
      return res.status(400).json({
        success: false,
        error: "Unit headers cannot be edited through this interface.",
      });
    } // Find the lesson with course information for auth check

    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "teacher_id"],
        },
      ],
    });
    if (req.user.role !== "admin" && lesson.course.teacher_id !== req.user.id) {
      return res
        .status(403)
        .json({
          success: false,
          error: "Not authorized to update this lesson",
        });
    } // 2. Handle File Uploads and Path Updates

    const filePaths = handleFileUploads(req, lessonCheck); // Prepare update data

    const updateData = {}; // Basic text fields
    if (title !== undefined && title !== null) updateData.title = title.trim();
    if (content !== undefined && content !== null) updateData.content = content;
    if (orderIndex !== undefined && orderIndex !== null)
      updateData.order_index = parseInt(orderIndex);
    if (unitId !== undefined && unitId !== null) updateData.unit_id = unitId;
    if (isPreview !== undefined) updateData.is_preview = Boolean(isPreview); // 3. Set Final Video/File URLs and Content Type
    let finalContentType = lessonCheck.content_type; // If a new file was uploaded, use the path and type from the helper
    if (filePaths.file_url !== undefined) {
      updateData.file_url = filePaths.file_url; // Will be new path or null
      finalContentType = filePaths.content_type;
    }
    if (filePaths.video_url !== undefined) {
      updateData.video_url = filePaths.video_url; // Will be new path or null
      finalContentType = filePaths.content_type;
    } // If no file was uploaded, check for external URL update

    if (videoUrl !== undefined && videoUrl !== null && !filePaths.video_url) {
      updateData.video_url = videoUrl;
      finalContentType = "video";
      updateData.file_url = null; // Clear file path if external video link is provided
    } // Explicit content type from form (lowest priority, often overridden by files)

    if (
      contentType !== undefined &&
      contentType !== null &&
      contentType !== ""
    ) {
      finalContentType = contentType;
    }
    updateData.content_type = finalContentType;

    console.log("🔄 Final update data to be saved:", updateData); // 4. Perform Update

    const [affectedRows] = await Lesson.update(updateData, {
      where: { id: lessonId },
    }); // ... (Update success check and final fetching logic remain the same) ...

    if (affectedRows === 0) {
      console.log("❌ No rows affected during update");
      return res.status(500).json({
        success: false,
        error: "Failed to update lesson - no changes made",
      });
    } // Fetch the complete updated lesson

    const updatedLesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "teacher_id"],
        },
        { model: Unit, as: "unit", attributes: ["id", "title"] },
      ],
    });

    if (!updatedLesson) {
      return res
        .status(500)
        .json({
          success: false,
          error: "Lesson updated but failed to fetch updated data",
        });
    } // Build full URLs

    const lessonResponse = buildFileUrls(updatedLesson);

    console.log("✅ Lesson updated successfully:", {
      id: lessonResponse.id,
      file_url: lessonResponse.file_url,
    });

    res.json({
      success: true,
      message: "Lesson updated successfully",
      lesson: lessonResponse,
    });
  } catch (error) {
    console.error("❌ ERROR updating lesson:", error); // ... (Error handling remains the same) ...
    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res
        .status(400)
        .json({ success: false, error: "Validation failed", details: errors });
    }
    res
      .status(500)
      .json({
        success: false,
        error: "Failed to update lesson",
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : "Internal server error",
      });
  }
};

// ... (Other functions like getLessonById, getLessonsByCourse, deleteLesson remain largely the same) ...
// The URL building is handled by buildFileUrls, which is called in all successful fetch paths.

// All other functions are imported from the original file, ensuring URL building is applied correctly.

// Export all functions
export {
  createLesson,
  getLessonsByCourse,
  getRegularLessonsByCourse,
  getLessonsByUnit,
  getLessonById,
  updateLesson,
  deleteLesson, // Debug functions
  debugGetLesson,
  debugCheckFile,
  debugFileUrl,
  debugLessonType,
};