// // controllers/lessonController.js - UPDATED FOR MULTIPLE FILES
// import db from "../models/index.js";
// import { fixCloudinaryUrl } from "../middleware/cloudinaryUpload.js";

// const { Lesson, Course, Attachment, Sequelize } = db;

// /*
//   ================================
//   HELPERS
//   ================================
// */

// const getBackendUrl = () => {
//   if (process.env.BACKEND_URL) return process.env.BACKEND_URL.replace(/\/$/, "");
//   if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, "");
//   return `http://localhost:${process.env.PORT || 5000}`;
// };

// const normalizeUrl = (url) => {
//   if (!url) return null;
//   url = fixCloudinaryUrl(url);
//   if (url.startsWith("http")) return url;
//   return `${getBackendUrl()}/api/v1/files/${encodeURIComponent(
//     url.replace(/^\/?Uploads\//, "")
//   )}`;
// };

// // Fix PDF URLs for Cloudinary
// const ensureRawUploadForPdf = (url) => {
//   if (!url || typeof url !== "string") return url;

//   if (url.includes("cloudinary.com") && 
//       (url.includes(".pdf") || url.includes("/pdfs/"))) {
//     if (url.includes("/image/upload/")) {
//       return url.replace("/image/upload/", "/raw/upload/");
//     }
//   }
//   return url;
// };

// // Build URLs for lesson with multiple files
// export const buildLessonUrls = (lesson) => {
//   if (!lesson) return null;
//   const raw = lesson.toJSON ? lesson.toJSON() : { ...lesson };

//   // Process file_url as array if it contains multiple URLs
//   let fileUrls = [];
//   if (raw.file_url) {
//     if (Array.isArray(raw.file_url)) {
//       fileUrls = raw.file_url.map(url => normalizeUrl(url));
//     } else if (typeof raw.file_url === "string") {
//       // Try to parse as JSON array, or use as single URL
//       try {
//         const parsed = JSON.parse(raw.file_url);
//         if (Array.isArray(parsed)) {
//           fileUrls = parsed.map(url => normalizeUrl(url));
//         } else {
//           fileUrls = [normalizeUrl(raw.file_url)];
//         }
//       } catch {
//         fileUrls = [normalizeUrl(raw.file_url)];
//       }
//     }
//   }

//   // Process video_url as array
//   let videoUrls = [];
//   if (raw.video_url) {
//     if (Array.isArray(raw.video_url)) {
//       videoUrls = raw.video_url.map(url => normalizeUrl(url));
//     } else if (typeof raw.video_url === "string") {
//       try {
//         const parsed = JSON.parse(raw.video_url);
//         if (Array.isArray(parsed)) {
//           videoUrls = parsed.map(url => normalizeUrl(url));
//         } else {
//           videoUrls = [normalizeUrl(raw.video_url)];
//         }
//       } catch {
//         videoUrls = [normalizeUrl(raw.video_url)];
//       }
//     }
//   }

//   return {
//     id: raw.id,
//     title: raw.title,
//     content: raw.content,
//     contentType: raw.content_type,
//     fileUrls,  // Now an array
//     videoUrls, // Now an array
//     isPreview: !!raw.is_preview,
//     orderIndex: raw.order_index,
//     unitId: raw.unit_id,
//     courseId: raw.course_id,
//     attachments: raw.attachments
//       ? raw.attachments.map((att) => ({
//           id: att.id,
//           filePath: normalizeUrl(att.file_path),
//           fileType: att.file_type,
//           fileName: att.file_name || att.file_path.split("/").pop(),
//           fileSize: att.file_size,
//           createdAt: att.created_at,
//           updatedAt: att.updated_at,
//         }))
//       : [],
//   };
// };

// /*
//   ================================
//   CREATE LESSON WITH MULTIPLE FILES
//   ================================
// */

// export const createLesson = async (req, res) => {
//   try {
//     console.log("📝 Creating lesson for course:", req.params.courseId);
//     console.log("📁 Files received:", req.files ? Object.keys(req.files) : "No files");

//     // Get processed uploads
//     const uploads = req.processedUploads || {};
//     console.log("⚙️ Processed uploads:", uploads);

//     // Process files into arrays
//     const fileUrls = [];
//     const videoUrls = [];

//     // Process main files
//     if (uploads.files && uploads.files.length > 0) {
//       for (const file of uploads.files) {
//         let fixedUrl = ensureRawUploadForPdf(file.url);
//         fixedUrl = fixCloudinaryUrl(fixedUrl);
//         fileUrls.push(fixedUrl);
//         console.log(`📄 Added file: ${file.originalname}`);
//       }
//     }

//     // Process videos
//     if (uploads.videos && uploads.videos.length > 0) {
//       for (const video of uploads.videos) {
//         videoUrls.push(video.url);
//         console.log(`🎬 Added video: ${video.originalname}`);
//       }
//     }

//     // Create the lesson with arrays
//     const lesson = await Lesson.create({
//       ...req.body,
//       course_id: req.params.courseId,
//       file_url: fileUrls.length > 0 ? JSON.stringify(fileUrls) : null,
//       video_url: videoUrls.length > 0 ? JSON.stringify(videoUrls) : null,
//     });

//     console.log(`✅ Lesson created: ${lesson.id} - "${lesson.title}"`);

//     // Create attachments
//     if (uploads.attachments && uploads.attachments.length > 0) {
//       console.log(`📎 Creating ${uploads.attachments.length} attachments`);

//       const attachmentPromises = uploads.attachments.map((att) =>
//         Attachment.create({
//           lesson_id: lesson.id,
//           file_path: att.url,
//           file_type: att.mimetype,
//           file_name: att.originalname,
//           file_size: att.size,
//         })
//       );

//       await Promise.all(attachmentPromises);
//     }

//     // Fetch complete lesson
//     const completeLesson = await Lesson.findByPk(lesson.id, {
//       include: [
//         {
//           model: Attachment,
//           as: "attachments",
//           attributes: ["id", "file_path", "file_type", "file_name", "file_size"],
//         },
//       ],
//     });

//     res.status(201).json({
//       success: true,
//       lesson: buildLessonUrls(completeLesson),
//       uploads: {
//         files: uploads.files?.length || 0,
//         videos: uploads.videos?.length || 0,
//         attachments: uploads.attachments?.length || 0,
//       },
//     });
//   } catch (err) {
//     console.error("❌ Create lesson error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to create lesson",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// };

// /*
//   ================================
//   UPDATE LESSON WITH MULTIPLE FILES
//   ================================
// */

// export const updateLesson = async (req, res) => {
//   try {
//     const lessonId = req.params.lessonId;
//     console.log(`🔄 Updating lesson ${lessonId}`);

//     // Find existing lesson
//     const lesson = await Lesson.findByPk(lessonId, {
//       include: [
//         {
//           model: Attachment,
//           as: "attachments",
//         },
//       ],
//     });

//     if (!lesson) {
//       return res.status(404).json({ success: false, error: "Lesson not found" });
//     }

//     // Get processed uploads
//     const uploads = req.processedUploads || {};
//     console.log("📤 Processed uploads:", uploads);

//     // Parse existing URLs
//     let existingFileUrls = [];
//     let existingVideoUrls = [];

//     if (lesson.file_url) {
//       try {
//         const parsed = JSON.parse(lesson.file_url);
//         existingFileUrls = Array.isArray(parsed) ? parsed : [lesson.file_url];
//       } catch {
//         existingFileUrls = lesson.file_url ? [lesson.file_url] : [];
//       }
//     }

//     if (lesson.video_url) {
//       try {
//         const parsed = JSON.parse(lesson.video_url);
//         existingVideoUrls = Array.isArray(parsed) ? parsed : [lesson.video_url];
//       } catch {
//         existingVideoUrls = lesson.video_url ? [lesson.video_url] : [];
//       }
//     }

//     // Add new files
//     if (uploads.files && uploads.files.length > 0) {
//       for (const file of uploads.files) {
//         let fixedUrl = ensureRawUploadForPdf(file.url);
//         fixedUrl = fixCloudinaryUrl(fixedUrl);
//         existingFileUrls.push(fixedUrl);
//         console.log(`📄 Added new file: ${file.originalname}`);
//       }
//     }

//     // Add new videos
//     if (uploads.videos && uploads.videos.length > 0) {
//       for (const video of uploads.videos) {
//         existingVideoUrls.push(video.url);
//         console.log(`🎬 Added new video: ${video.originalname}`);
//       }
//     }

//     // Prepare update data
//     const updateData = {
//       title: req.body.title !== undefined ? req.body.title : lesson.title,
//       content: req.body.content !== undefined ? req.body.content : lesson.content,
//       content_type: req.body.content_type !== undefined ? req.body.content_type : lesson.content_type,
//       is_preview: req.body.is_preview !== undefined ? req.body.is_preview : lesson.is_preview,
//       order_index: req.body.order_index !== undefined ? req.body.order_index : lesson.order_index,
//       file_url: existingFileUrls.length > 0 ? JSON.stringify(existingFileUrls) : null,
//       video_url: existingVideoUrls.length > 0 ? JSON.stringify(existingVideoUrls) : null,
//     };

//     // Add new attachments
//     if (uploads.attachments && uploads.attachments.length > 0) {
//       console.log(`📎 Adding ${uploads.attachments.length} new attachments`);

//       const attachmentPromises = uploads.attachments.map((att) =>
//         Attachment.create({
//           lesson_id: lesson.id,
//           file_path: att.url,
//           file_type: att.mimetype,
//           file_name: att.originalname,
//           file_size: att.size,
//         })
//       );

//       await Promise.all(attachmentPromises);
//     }

//     // Update lesson
//     await lesson.update(updateData);

//     // Fetch updated lesson
//     const updatedLesson = await Lesson.findByPk(lessonId, {
//       include: [
//         {
//           model: Attachment,
//           as: "attachments",
//         },
//       ],
//     });

//     console.log(`✅ Lesson ${lessonId} updated successfully`);

//     res.json({
//       success: true,
//       message: "Lesson updated successfully",
//       lesson: buildLessonUrls(updatedLesson),
//       stats: {
//         files: existingFileUrls.length,
//         videos: existingVideoUrls.length,
//         attachments: updatedLesson.attachments?.length || 0,
//       },
//     });
//   } catch (err) {
//     console.error("❌ Update lesson error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to update lesson",
//     });
//   }
// };

// /*
//   ================================
//   GET LESSON WITH FILES
//   ================================
// */

// export const getLessonById = async (req, res) => {
//   try {
//     const lesson = await Lesson.findByPk(req.params.id, {
//       include: [
//         {
//           model: Attachment,
//           as: "attachments",
//         },
//         {
//           model: Course,
//           as: "course",
//           attributes: ["id", "title", "slug", "thumbnail"],
//         },
//       ],
//     });

//     if (!lesson) {
//       return res.status(404).json({ success: false, error: "Lesson not found" });
//     }

//     res.json({
//       success: true,
//       lesson: buildLessonUrls(lesson),
//     });
//   } catch (err) {
//     console.error("❌ Get lesson error:", err);
//     res.status(500).json({ success: false, error: "Failed to load lesson" });
//   }
// };

// /*
//   ================================
//   DELETE FILE FROM LESSON
//   ================================
// */

// export const deleteLessonFile = async (req, res) => {
//   try {
//     const { lessonId, fileIndex, fileType } = req.params;
    
//     const lesson = await Lesson.findByPk(lessonId);
//     if (!lesson) {
//       return res.status(404).json({ success: false, error: "Lesson not found" });
//     }

//     let fileUrls = [];
//     let videoUrls = [];

//     // Parse existing URLs
//     if (lesson.file_url) {
//       try {
//         const parsed = JSON.parse(lesson.file_url);
//         fileUrls = Array.isArray(parsed) ? parsed : [lesson.file_url];
//       } catch {
//         fileUrls = lesson.file_url ? [lesson.file_url] : [];
//       }
//     }

//     if (lesson.video_url) {
//       try {
//         const parsed = JSON.parse(lesson.video_url);
//         videoUrls = Array.isArray(parsed) ? parsed : [lesson.video_url];
//       } catch {
//         videoUrls = lesson.video_url ? [lesson.video_url] : [];
//       }
//     }

//     // Remove file based on type and index
//     if (fileType === "file") {
//       if (fileIndex >= 0 && fileIndex < fileUrls.length) {
//         fileUrls.splice(fileIndex, 1);
//         await lesson.update({
//           file_url: fileUrls.length > 0 ? JSON.stringify(fileUrls) : null,
//         });
//       }
//     } else if (fileType === "video") {
//       if (fileIndex >= 0 && fileIndex < videoUrls.length) {
//         videoUrls.splice(fileIndex, 1);
//         await lesson.update({
//           video_url: videoUrls.length > 0 ? JSON.stringify(videoUrls) : null,
//         });
//       }
//     }

//     res.json({
//       success: true,
//       message: "File deleted successfully",
//       lesson: buildLessonUrls(lesson),
//     });
//   } catch (err) {
//     console.error("❌ Delete file error:", err);
//     res.status(500).json({ success: false, error: "Failed to delete file" });
//   }
// };

// /*
//   ================================
//   PREVIEW ENDPOINTS
//   ================================
// */

// export const getPreviewLessonForCourse = async (req, res) => {
//   try {
//     const lesson = await Lesson.findOne({
//       where: { 
//         course_id: req.params.courseId, 
//         is_preview: true 
//       },
//       include: [
//         {
//           model: Attachment,
//           as: "attachments",
//         },
//         {
//           model: Course,
//           as: "course",
//           attributes: ["id", "title", "slug", "thumbnail"],
//         },
//       ],
//       order: [["order_index", "ASC"]],
//     });

//     if (!lesson) {
//       // Get first lesson if no preview
//       const firstLesson = await Lesson.findOne({
//         where: { course_id: req.params.courseId },
//         include: [
//           {
//             model: Attachment,
//             as: "attachments",
//           },
//           {
//             model: Course,
//             as: "course",
//             attributes: ["id", "title", "slug", "thumbnail"],
//           },
//         ],
//         order: [["order_index", "ASC"]],
//       });

//       if (!firstLesson) {
//         return res.status(404).json({ success: false, error: "No lessons found" });
//       }

//       return res.json({
//         success: true,
//         lesson: buildLessonUrls(firstLesson),
//         isPreview: false,
//       });
//     }

//     res.json({
//       success: true,
//       lesson: buildLessonUrls(lesson),
//       isPreview: true,
//     });
//   } catch (err) {
//     console.error("❌ Preview error:", err);
//     res.status(500).json({ success: false, error: "Failed to load preview" });
//   }
// };

// // Export all functions
// export default {
//   buildLessonUrls,
//   createLesson,
//   updateLesson,
//   getLessonById,
//   deleteLessonFile,
//   getPreviewLessonForCourse,
// };



// controllers/lessonController.js - UPDATED FOR MULTIPLE FILES
import db from "../models/index.js";
import { fixCloudinaryUrl } from "../middleware/cloudinaryUpload.js";

const { Lesson, Course, Attachment, Sequelize } = db;

/*
  ================================
  HELPERS
  ================================
*/

const getBackendUrl = () => {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL.replace(/\/$/, "");
  if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, "");
  return `http://localhost:${process.env.PORT || 5000}`;
};

const normalizeUrl = (url) => {
  if (!url) return null;
  url = fixCloudinaryUrl(url);
  if (url.startsWith("http")) return url;
  return `${getBackendUrl()}/api/v1/files/${encodeURIComponent(
    url.replace(/^\/?Uploads\//, "")
  )}`;
};

// Fix PDF URLs for Cloudinary
const ensureRawUploadForPdf = (url) => {
  if (!url || typeof url !== "string") return url;

  if (url.includes("cloudinary.com") && 
      (url.includes(".pdf") || url.includes("/pdfs/"))) {
    if (url.includes("/image/upload/")) {
      return url.replace("/image/upload/", "/raw/upload/");
    }
  }
  return url;
};

// Build URLs for lesson with multiple files
const buildLessonUrls = (lesson) => {
  if (!lesson) return null;
  const raw = lesson.toJSON ? lesson.toJSON() : { ...lesson };

  // Process file_url as array if it contains multiple URLs
  let fileUrls = [];
  if (raw.file_url) {
    if (Array.isArray(raw.file_url)) {
      fileUrls = raw.file_url.map(url => normalizeUrl(url));
    } else if (typeof raw.file_url === "string") {
      // Try to parse as JSON array, or use as single URL
      try {
        const parsed = JSON.parse(raw.file_url);
        if (Array.isArray(parsed)) {
          fileUrls = parsed.map(url => normalizeUrl(url));
        } else {
          fileUrls = [normalizeUrl(raw.file_url)];
        }
      } catch {
        fileUrls = [normalizeUrl(raw.file_url)];
      }
    }
  }

  // Process video_url as array
  let videoUrls = [];
  if (raw.video_url) {
    if (Array.isArray(raw.video_url)) {
      videoUrls = raw.video_url.map(url => normalizeUrl(url));
    } else if (typeof raw.video_url === "string") {
      try {
        const parsed = JSON.parse(raw.video_url);
        if (Array.isArray(parsed)) {
          videoUrls = parsed.map(url => normalizeUrl(url));
        } else {
          videoUrls = [normalizeUrl(raw.video_url)];
        }
      } catch {
        videoUrls = [normalizeUrl(raw.video_url)];
      }
    }
  }

  return {
    id: raw.id,
    title: raw.title,
    content: raw.content,
    contentType: raw.content_type,
    fileUrls,  // Now an array
    videoUrls, // Now an array
    isPreview: !!raw.is_preview,
    orderIndex: raw.order_index,
    unitId: raw.unit_id,
    courseId: raw.course_id,
    attachments: raw.attachments
      ? raw.attachments.map((att) => ({
          id: att.id,
          filePath: normalizeUrl(att.file_path),
          fileType: att.file_type,
          fileName: att.file_name || att.file_path.split("/").pop(),
          fileSize: att.file_size,
          createdAt: att.created_at,
          updatedAt: att.updated_at,
        }))
      : [],
  };
};

/*
  ================================
  CREATE LESSON WITH MULTIPLE FILES
  ================================
*/

const createLesson = async (req, res) => {
  try {
    console.log("📝 Creating lesson for course:", req.params.courseId);
    console.log("📁 Files received:", req.files ? Object.keys(req.files) : "No files");

    // Get processed uploads
    const uploads = req.processedUploads || {};
    console.log("⚙️ Processed uploads:", uploads);

    // Process files into arrays
    const fileUrls = [];
    const videoUrls = [];

    // Process main files
    if (uploads.files && uploads.files.length > 0) {
      for (const file of uploads.files) {
        let fixedUrl = ensureRawUploadForPdf(file.url);
        fixedUrl = fixCloudinaryUrl(fixedUrl);
        fileUrls.push(fixedUrl);
        console.log(`📄 Added file: ${file.originalname}`);
      }
    }

    // Process videos
    if (uploads.videos && uploads.videos.length > 0) {
      for (const video of uploads.videos) {
        videoUrls.push(video.url);
        console.log(`🎬 Added video: ${video.originalname}`);
      }
    }

    // Create the lesson with arrays
    const lesson = await Lesson.create({
      ...req.body,
      course_id: req.params.courseId,
      file_url: fileUrls.length > 0 ? JSON.stringify(fileUrls) : null,
      video_url: videoUrls.length > 0 ? JSON.stringify(videoUrls) : null,
    });

    console.log(`✅ Lesson created: ${lesson.id} - "${lesson.title}"`);

    // Create attachments
    if (uploads.attachments && uploads.attachments.length > 0) {
      console.log(`📎 Creating ${uploads.attachments.length} attachments`);

      const attachmentPromises = uploads.attachments.map((att) =>
        Attachment.create({
          lesson_id: lesson.id,
          file_path: att.url,
          file_type: att.mimetype,
          file_name: att.originalname,
          file_size: att.size,
        })
      );

      await Promise.all(attachmentPromises);
    }

    // Fetch complete lesson
    const completeLesson = await Lesson.findByPk(lesson.id, {
      include: [
        {
          model: Attachment,
          as: "attachments",
          attributes: ["id", "file_path", "file_type", "file_name", "file_size"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      lesson: buildLessonUrls(completeLesson),
      uploads: {
        files: uploads.files?.length || 0,
        videos: uploads.videos?.length || 0,
        attachments: uploads.attachments?.length || 0,
      },
    });
  } catch (err) {
    console.error("❌ Create lesson error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to create lesson",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/*
  ================================
  UPDATE LESSON WITH MULTIPLE FILES
  ================================
*/

const updateLesson = async (req, res) => {
  try {
    const lessonId = req.params.lessonId;
    console.log(`🔄 Updating lesson ${lessonId}`);

    // Find existing lesson
    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Attachment,
          as: "attachments",
        },
      ],
    });

    if (!lesson) {
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }

    // Get processed uploads
    const uploads = req.processedUploads || {};
    console.log("📤 Processed uploads:", uploads);

    // Parse existing URLs
    let existingFileUrls = [];
    let existingVideoUrls = [];

    if (lesson.file_url) {
      try {
        const parsed = JSON.parse(lesson.file_url);
        existingFileUrls = Array.isArray(parsed) ? parsed : [lesson.file_url];
      } catch {
        existingFileUrls = lesson.file_url ? [lesson.file_url] : [];
      }
    }

    if (lesson.video_url) {
      try {
        const parsed = JSON.parse(lesson.video_url);
        existingVideoUrls = Array.isArray(parsed) ? parsed : [lesson.video_url];
      } catch {
        existingVideoUrls = lesson.video_url ? [lesson.video_url] : [];
      }
    }

    // Add new files
    if (uploads.files && uploads.files.length > 0) {
      for (const file of uploads.files) {
        let fixedUrl = ensureRawUploadForPdf(file.url);
        fixedUrl = fixCloudinaryUrl(fixedUrl);
        existingFileUrls.push(fixedUrl);
        console.log(`📄 Added new file: ${file.originalname}`);
      }
    }

    // Add new videos
    if (uploads.videos && uploads.videos.length > 0) {
      for (const video of uploads.videos) {
        existingVideoUrls.push(video.url);
        console.log(`🎬 Added new video: ${video.originalname}`);
      }
    }

    // Prepare update data
    const updateData = {
      title: req.body.title !== undefined ? req.body.title : lesson.title,
      content: req.body.content !== undefined ? req.body.content : lesson.content,
      content_type: req.body.content_type !== undefined ? req.body.content_type : lesson.content_type,
      is_preview: req.body.is_preview !== undefined ? req.body.is_preview : lesson.is_preview,
      order_index: req.body.order_index !== undefined ? req.body.order_index : lesson.order_index,
      file_url: existingFileUrls.length > 0 ? JSON.stringify(existingFileUrls) : null,
      video_url: existingVideoUrls.length > 0 ? JSON.stringify(existingVideoUrls) : null,
    };

    // Add new attachments
    if (uploads.attachments && uploads.attachments.length > 0) {
      console.log(`📎 Adding ${uploads.attachments.length} new attachments`);

      const attachmentPromises = uploads.attachments.map((att) =>
        Attachment.create({
          lesson_id: lesson.id,
          file_path: att.url,
          file_type: att.mimetype,
          file_name: att.originalname,
          file_size: att.size,
        })
      );

      await Promise.all(attachmentPromises);
    }

    // Update lesson
    await lesson.update(updateData);

    // Fetch updated lesson
    const updatedLesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Attachment,
          as: "attachments",
        },
      ],
    });

    console.log(`✅ Lesson ${lessonId} updated successfully`);

    res.json({
      success: true,
      message: "Lesson updated successfully",
      lesson: buildLessonUrls(updatedLesson),
      stats: {
        files: existingFileUrls.length,
        videos: existingVideoUrls.length,
        attachments: updatedLesson.attachments?.length || 0,
      },
    });
  } catch (err) {
    console.error("❌ Update lesson error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to update lesson",
    });
  }
};

/*
  ================================
  GET LESSON WITH FILES
  ================================
*/

const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id, {
      include: [
        {
          model: Attachment,
          as: "attachments",
        },
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "slug", "thumbnail"],
        },
      ],
    });

    if (!lesson) {
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }

    res.json({
      success: true,
      lesson: buildLessonUrls(lesson),
    });
  } catch (err) {
    console.error("❌ Get lesson error:", err);
    res.status(500).json({ success: false, error: "Failed to load lesson" });
  }
};

/*
  ================================
  DELETE FILE FROM LESSON
  ================================
*/

const deleteLessonFile = async (req, res) => {
  try {
    const { lessonId, fileIndex, fileType } = req.params;
    
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }

    let fileUrls = [];
    let videoUrls = [];

    // Parse existing URLs
    if (lesson.file_url) {
      try {
        const parsed = JSON.parse(lesson.file_url);
        fileUrls = Array.isArray(parsed) ? parsed : [lesson.file_url];
      } catch {
        fileUrls = lesson.file_url ? [lesson.file_url] : [];
      }
    }

    if (lesson.video_url) {
      try {
        const parsed = JSON.parse(lesson.video_url);
        videoUrls = Array.isArray(parsed) ? parsed : [lesson.video_url];
      } catch {
        videoUrls = lesson.video_url ? [lesson.video_url] : [];
      }
    }

    // Remove file based on type and index
    if (fileType === "file") {
      if (fileIndex >= 0 && fileIndex < fileUrls.length) {
        fileUrls.splice(fileIndex, 1);
        await lesson.update({
          file_url: fileUrls.length > 0 ? JSON.stringify(fileUrls) : null,
        });
      }
    } else if (fileType === "video") {
      if (fileIndex >= 0 && fileIndex < videoUrls.length) {
        videoUrls.splice(fileIndex, 1);
        await lesson.update({
          video_url: videoUrls.length > 0 ? JSON.stringify(videoUrls) : null,
        });
      }
    }

    res.json({
      success: true,
      message: "File deleted successfully",
      lesson: buildLessonUrls(lesson),
    });
  } catch (err) {
    console.error("❌ Delete file error:", err);
    res.status(500).json({ success: false, error: "Failed to delete file" });
  }
};

/*
  ================================
  PREVIEW ENDPOINTS
  ================================
*/

const getPreviewLessonForCourse = async (req, res) => {
  try {
    const lesson = await Lesson.findOne({
      where: { 
        course_id: req.params.courseId, 
        is_preview: true 
      },
      include: [
        {
          model: Attachment,
          as: "attachments",
        },
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "slug", "thumbnail"],
        },
      ],
      order: [["order_index", "ASC"]],
    });

    if (!lesson) {
      // Get first lesson if no preview
      const firstLesson = await Lesson.findOne({
        where: { course_id: req.params.courseId },
        include: [
          {
            model: Attachment,
            as: "attachments",
          },
          {
            model: Course,
            as: "course",
            attributes: ["id", "title", "slug", "thumbnail"],
          },
        ],
        order: [["order_index", "ASC"]],
      });

      if (!firstLesson) {
        return res.status(404).json({ success: false, error: "No lessons found" });
      }

      return res.json({
        success: true,
        lesson: buildLessonUrls(firstLesson),
        isPreview: false,
      });
    }

    res.json({
      success: true,
      lesson: buildLessonUrls(lesson),
      isPreview: true,
    });
  } catch (err) {
    console.error("❌ Preview error:", err);
    res.status(500).json({ success: false, error: "Failed to load preview" });
  }
};

/*
  ================================
  PREVIEW MANAGEMENT FUNCTIONS
  ================================
*/

const checkCoursePreviewStatus = async (req, res) => {
  try {
    const { courseId } = req.params;

    const previewLesson = await Lesson.findOne({
      where: { 
        course_id: courseId,
        is_preview: true 
      },
      attributes: ["id", "title", "file_url", "content_type"],
    });

    const allLessons = await Lesson.findAll({
      where: { course_id: courseId },
      attributes: ["id", "title", "is_preview", "file_url"],
      order: [["order_index", "ASC"]],
    });

    res.json({
      success: true,
      hasPreview: !!previewLesson,
      previewLesson,
      totalLessons: allLessons.length,
      lessonsWithFiles: allLessons.filter(l => l.file_url).length,
    });
  } catch (err) {
    console.error("❌ Check preview status error:", err);
    res.status(500).json({ success: false, error: "Failed to check preview status" });
  }
};

const markLessonAsPreview = async (req, res) => {
  try {
    const { lessonId } = req.params;

    // Find the lesson
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }

    // Unmark all other lessons in the same course as preview
    await Lesson.update(
      { is_preview: false },
      { where: { course_id: lesson.course_id } }
    );

    // Mark this lesson as preview
    await lesson.update({ is_preview: true });

    res.json({
      success: true,
      message: "Lesson marked as preview successfully",
      lesson: {
        id: lesson.id,
        title: lesson.title,
        is_preview: true,
        course_id: lesson.course_id,
      },
    });
  } catch (err) {
    console.error("❌ Mark lesson as preview error:", err);
    res.status(500).json({ success: false, error: "Failed to mark lesson as preview" });
  }
};

/*
  ================================
  EXPORT ALL FUNCTIONS
  ================================
*/

// Named exports
export {
  buildLessonUrls,
  createLesson,
  updateLesson,
  getLessonById,
  deleteLessonFile,
  getPreviewLessonForCourse,
  checkCoursePreviewStatus,
  markLessonAsPreview,
};

// Default export
export default {
  buildLessonUrls,
  createLesson,
  updateLesson,
  getLessonById,
  deleteLessonFile,
  getPreviewLessonForCourse,
  checkCoursePreviewStatus,
  markLessonAsPreview,
};