// // controllers/lessonController.js
// import db from "../models/index.js";
// import path from "path";

// const { Lesson, Course, Unit, LessonView, Enrollment } = db;

// /* -----------------------------------------------------------
//    BACKEND URL RESOLVER - FIXED FOR RENDER DEPLOYMENT
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
//    NORMALIZATION HELPERS
// ----------------------------------------------------------- */
// const stripLeadingSlash = (p = "") => p.replace(/^\/+/, "");
// const normalizePath = (p = "") => p.replace(/^Uploads\//i, "").replace(/^\/+/, "");

// /* -----------------------------------------------------------
//    Build Full URLs for video / pdf files - UPDATED FOR CLOUDINARY
// ----------------------------------------------------------- */
// export const buildFileUrls = (lesson) => {
//   if (!lesson) return null;

//   const data = lesson.toJSON ? lesson.toJSON() : { ...lesson };
  
//   // ✅ FIX: Cloudinary URLs are already full URLs - return them as-is
//   if (data.video_url && data.video_url.includes('cloudinary.com')) {
//     // Already a Cloudinary URL, ensure it's using raw/ for PDFs
//     if (data.video_url.toLowerCase().endsWith('.pdf') && data.video_url.includes('/image/')) {
//       // Fix: PDFs should use /raw/ not /image/
//       data.video_url = data.video_url.replace('/image/upload/', '/raw/upload/');
//     }
//     return data;
//   }
  
//   if (data.file_url && data.file_url.includes('cloudinary.com')) {
//     // Already a Cloudinary URL, ensure it's using raw/ for PDFs
//     if (data.file_url.toLowerCase().endsWith('.pdf') && data.file_url.includes('/image/')) {
//       // Fix: PDFs should use /raw/ not /image/
//       data.file_url = data.file_url.replace('/image/upload/', '/raw/upload/');
//     }
//     return data;
//   }
  
//   // Only modify local paths (for development)
//   const backend = getBackendUrl();
  
//   if (data.video_url && !data.video_url.startsWith("http")) {
//     const fixed = normalizePath(data.video_url);
//     data.video_url = `${backend}/api/v1/files/${encodeURIComponent(fixed)}`;
//   } else if (data.video_url && data.video_url.includes("localhost")) {
//     if (process.env.NODE_ENV === "production") {
//       const fixed = normalizePath(data.video_url.replace(/https?:\/\/localhost:\d+\//, ""));
//       data.video_url = `${backend}/api/v1/files/${encodeURIComponent(fixed)}`;
//     }
//   }

//   // PDF / FILE
//   if (data.file_url && !data.file_url.startsWith("http")) {
//     const fixed = normalizePath(data.file_url);
//     data.file_url = `${backend}/api/v1/files/${encodeURIComponent(fixed)}`;
//   } else if (data.file_url && data.file_url.includes("localhost")) {
//     if (process.env.NODE_ENV === "production") {
//       const fixed = normalizePath(data.file_url.replace(/https?:\/\/localhost:\d+\//, ""));
//       data.file_url = `${backend}/api/v1/files/${encodeURIComponent(fixed)}`;
//     }
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
//    Handle File Uploads (multer) - returns stored filenames
// ----------------------------------------------------------- */
// const handleFileUploads = (req) => {
//   const out = {};
//   if (req.files?.video?.[0]) out.video_url = req.files.video[0].filename;
//   if (req.files?.pdf?.[0]) out.file_url = req.files.pdf[0].filename;
//   if (req.files?.file?.[0]) out.file_url = req.files.file[0].filename;
//   return out;
// };

// /* -----------------------------------------------------------
//    CREATE LESSON
// ----------------------------------------------------------- */
// export const createLesson = async (req, res) => {
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

//     const course = await Course.findByPk(courseId);
//     if (!course) return res.status(404).json({ success: false, error: "Course not found" });

//     const uploads = handleFileUploads(req);

//     let finalType = contentType || "text";
//     let file_path = uploads.file_url || null;
//     let video_path = uploads.video_url || videoUrl || null;
//     if (uploads.file_url) finalType = "pdf";
//     if (uploads.video_url) finalType = "video";

//     // Auto order indexing
//     let order_index = orderIndex;
//     if (!order_index) {
//       const where = unitId ? { unit_id: unitId } : { course_id: courseId, unit_id: null };
//       const last = await Lesson.findOne({ where, order: [["order_index", "DESC"]] });
//       order_index = last ? (last.order_index || 0) + 1 : 1;
//     }

//     const lesson = await Lesson.create({
//       title,
//       content,
//       course_id: courseId,
//       unit_id: unitId || null,
//       order_index,
//       content_type: finalType,
//       video_url: video_path,
//       file_url: file_path,
//       is_preview: Boolean(isPreview),
//     });

//     const full = await Lesson.findByPk(lesson.id, {
//       include: [{ model: Course, as: "course" }, { model: Unit, as: "unit" }],
//     });

//     return res.status(201).json({ success: true, lesson: buildFileUrls(full) });
//   } catch (err) {
//     console.error("createLesson error:", err);
//     return res.status(500).json({ success: false, error: err?.message || "Server error" });
//   }
// };

// /* -----------------------------------------------------------
//    UPDATE LESSON
// ----------------------------------------------------------- */
// export const updateLesson = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     const existing = await Lesson.findByPk(lessonId);
//     if (!existing) return res.status(404).json({ success: false, error: "Lesson not found" });

//     const uploads = handleFileUploads(req);
//     const updates = {};

//     if (req.body.title !== undefined) updates.title = req.body.title;
//     if (req.body.content !== undefined) updates.content = req.body.content;
//     if (req.body.orderIndex !== undefined) updates.order_index = req.body.orderIndex;
//     if (req.body.unitId !== undefined) updates.unit_id = req.body.unitId;
//     if (req.body.isPreview !== undefined) updates.is_preview = req.body.isPreview;

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

//     await existing.update(updates);

//     const updated = await Lesson.findByPk(lessonId, {
//       include: [{ model: Course, as: "course" }, { model: Unit, as: "unit" }],
//     });

//     return res.json({ success: true, lesson: buildFileUrls(updated) });
//   } catch (err) {
//     console.error("updateLesson error:", err);
//     return res.status(500).json({ success: false, error: err?.message || "Server error" });
//   }
// };

// /* -----------------------------------------------------------
//    GET LESSON
// ----------------------------------------------------------- */
// export const getLessonById = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     const lesson = await Lesson.findByPk(lessonId, {
//       include: [{ model: Course, as: "course" }, { model: Unit, as: "unit" }],
//     });
//     if (!lesson) return res.status(404).json({ success: false, error: "Lesson not found" });

//     trackLessonView(req.user?.id, lessonId);
//     return res.json({ success: true, lesson: buildFileUrls(lesson) });
//   } catch (err) {
//     console.error("getLessonById error:", err);
//     return res.status(500).json({ success: false, error: err?.message || "Server error" });
//   }
// };

// /* -----------------------------------------------------------
//    GET LESSONS BY COURSE
// ----------------------------------------------------------- */
// export const getLessonsByCourse = async (req, res) => {
//   try {
//     const lessons = await Lesson.findAll({
//       where: { course_id: req.params.courseId },
//       order: [["order_index", "ASC"]],
//       include: [{ model: Unit, as: "unit" }],
//     });
//     return res.json({ success: true, lessons: lessons.map(buildFileUrls) });
//   } catch (err) {
//     console.error("getLessonsByCourse error:", err);
//     return res.status(500).json({ success: false, error: err?.message || "Server error" });
//   }
// };

// /* -----------------------------------------------------------
//    GET LESSONS BY UNIT
// ----------------------------------------------------------- */
// export const getLessonsByUnit = async (req, res) => {
//   try {
//     const lessons = await Lesson.findAll({
//       where: { unit_id: req.params.unitId },
//       order: [["order_index", "ASC"]],
//     });
//     return res.json({ success: true, lessons: lessons.map(buildFileUrls) });
//   } catch (err) {
//     console.error("getLessonsByUnit error:", err);
//     return res.status(500).json({ success: false, error: err?.message || "Server error" });
//   }
// };

// /* -----------------------------------------------------------
//    DELETE LESSON
// ----------------------------------------------------------- */
// export const deleteLesson = async (req, res) => {
//   try {
//     const lesson = await Lesson.findByPk(req.params.lessonId);
//     if (!lesson) return res.status(404).json({ success: false, error: "Lesson not found" });

//     await lesson.destroy();
//     return res.json({ success: true, message: "Lesson deleted" });
//   } catch (err) {
//     console.error("deleteLesson error:", err);
//     return res.status(500).json({ success: false, error: err?.message || "Server error" });
//   }
// };

// /* -----------------------------------------------------------
//    GET PREVIEW LESSON FOR A COURSE (public)
//    - returns the first lesson with is_preview=true
//    - if none exists, optionally mark the first lesson as preview and return it
// ----------------------------------------------------------- */
// export const getPreviewLessonForCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;

//     const course = await Course.findByPk(courseId, { attributes: ["id", "title"] });
//     if (!course) return res.status(404).json({ success: false, error: "Course not found" });

//     let lesson = await Lesson.findOne({
//       where: { course_id: courseId, is_preview: true },
//       order: [["order_index", "ASC"]],
//     });

//     // If no preview lesson set, choose first lesson as fallback and mark it preview
//     if (!lesson) {
//       const anyLesson = await Lesson.findOne({
//         where: { course_id: courseId },
//         order: [["order_index", "ASC"]],
//       });
//       if (!anyLesson) {
//         const lessonCount = await Lesson.count({ where: { course_id: courseId } });
//         return res.status(404).json({
//           success: false,
//           error: "No lessons found for this course",
//           lessonCount,
//         });
//       }
//       await anyLesson.update({ is_preview: true });
//       lesson = await Lesson.findByPk(anyLesson.id);
//     }

//     const lessonData = buildFileUrls(lesson);
//     return res.json({
//       success: true,
//       lesson: lessonData,
//       access: "public",
//       backendUrl: getBackendUrl(),
//       timestamp: new Date().toISOString(),
//     });
//   } catch (err) {
//     console.error("getPreviewLessonForCourse error:", err);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to load preview lesson",
//       details: process.env.NODE_ENV === "development" ? err?.message : undefined,
//     });
//   }
// };

// /* -----------------------------------------------------------
//    ✅ NEW: GET PUBLIC PREVIEW BY LESSON ID
//    This is used by /api/v1/files/preview-lesson/:lessonId
// ----------------------------------------------------------- */
// export const getPublicPreviewByLessonId = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
    
//     console.log(`🔓 PUBLIC PREVIEW requested for lesson ${lessonId}`);

//     const lesson = await Lesson.findByPk(lessonId, {
//       include: [{ model: Course, as: "course" }],
//     });

//     if (!lesson) {
//       console.log(`❌ Lesson not found: ${lessonId}`);
//       return res.status(404).json({
//         success: false,
//         error: "Preview lesson not found",
//       });
//     }

//     // Check if this is a preview lesson or if we should allow access anyway
//     if (!lesson.is_preview) {
//       console.log(`⚠️ Lesson ${lessonId} is not marked as preview, but allowing access`);
//     }

//     const lessonData = buildFileUrls(lesson);
    
//     console.log(`✅ Public preview served: ${lesson.title}`);
//     console.log(`   File URL: ${lessonData.file_url?.substring(0, 80) || 'None'}...`);
//     console.log(`   Is Cloudinary: ${lessonData.file_url?.includes('cloudinary') ? 'Yes' : 'No'}`);

//     return res.json({
//       success: true,
//       lesson: lessonData,
//       access: "public",
//       message: "Public preview access granted",
//       timestamp: new Date().toISOString(),
//     });
//   } catch (err) {
//     console.error("❌ getPublicPreviewByLessonId error:", err);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to load preview",
//       details: process.env.NODE_ENV === "development" ? err?.message : undefined,
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
import db from "../models/index.js";
import path from "path";
import { v2 as cloudinary } from 'cloudinary';

const { Lesson, Course, Unit, LessonView, Enrollment } = db;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/* -----------------------------------------------------------
   BACKEND URL RESOLVER
----------------------------------------------------------- */
const getBackendUrl = () => {
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL.replace(/\/+$/g, "");
  }
  if (process.env.RENDER_EXTERNAL_URL) {
    return process.env.RENDER_EXTERNAL_URL.replace(/\/+$/g, "");
  }
  if (process.env.NODE_ENV === "production") {
    return "https://mathe-class-website-backend-1.onrender.com";
  }
  const p = process.env.PORT || 5000;
  return `http://localhost:${p}`;
};

/* -----------------------------------------------------------
   Build Full URLs for files with Cloudinary support
----------------------------------------------------------- */
export const buildFileUrls = (lesson) => {
  if (!lesson) return null;

  const data = lesson.toJSON ? lesson.toJSON() : { ...lesson };
  
  // Helper to process URLs
  const processUrl = (url, isPdf = false) => {
    if (!url) return url;
    
    // Already a Cloudinary URL
    if (url.includes('cloudinary.com')) {
      // Fix PDF URLs to use raw/upload instead of image/upload
      if (isPdf && url.includes('/image/upload/')) {
        return url.replace('/image/upload/', '/raw/upload/');
      }
      return url;
    }
    
    // Local file in production - should be on Cloudinary
    if (process.env.NODE_ENV === "production" && !url.startsWith("http")) {
      const filename = path.basename(url);
      const resourceType = isPdf ? 'raw' : 'auto';
      const folder = isPdf ? 'mathe-class/pdfs' : 'mathe-class/files';
      
      // Try to construct Cloudinary URL
      const publicId = `${folder}/${filename.replace(/\.[^/.]+$/, '')}`;
      return cloudinary.url(publicId, {
        resource_type: resourceType,
        secure: true
      });
    }
    
    // Local file in development
    const backend = getBackendUrl();
    
    if (url.startsWith("/Uploads/") || url.startsWith("Uploads/")) {
      const filename = url.replace(/^\/?Uploads\//, "");
      return `${backend}/api/v1/files/${encodeURIComponent(filename)}`;
    }
    
    // Plain filename
    return `${backend}/api/v1/files/${encodeURIComponent(url)}`;
  };

  // Process file_url (PDFs)
  if (data.file_url) {
    const isPdf = data.file_url.toLowerCase().endsWith('.pdf');
    data.file_url = processUrl(data.file_url, isPdf);
  }
  
  // Process video_url (videos)
  if (data.video_url) {
    data.video_url = processUrl(data.video_url, false);
  }

  return data;
};

/* -----------------------------------------------------------
   Track Lesson View
----------------------------------------------------------- */
const trackLessonView = async (userId, lessonId) => {
  try {
    if (!userId) return;
    await LessonView.findOrCreate({
      where: { user_id: userId, lesson_id: lessonId },
      defaults: { viewed_at: new Date() },
    });
  } catch (err) {
    console.warn("trackLessonView error:", err?.message || err);
  }
};

/* -----------------------------------------------------------
   Handle File Uploads - Updated for Cloudinary
----------------------------------------------------------- */
const handleFileUploads = (req) => {
  const out = {};
  
  // In production with Cloudinary, files are already uploaded
  // The URL will be available in req.file or req.files location/url property
  if (req.files?.video?.[0]) {
    const file = req.files.video[0];
    // Cloudinary returns the URL in file.path or file.location
    out.video_url = file.path || file.location || file.filename;
  }
  
  if (req.files?.pdf?.[0]) {
    const file = req.files.pdf[0];
    out.file_url = file.path || file.location || file.filename;
  }
  
  if (req.files?.file?.[0]) {
    const file = req.files.file[0];
    out.file_url = file.path || file.location || file.filename;
  }
  
  return out;
};

/* -----------------------------------------------------------
   CREATE LESSON
----------------------------------------------------------- */
export const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      content,
      contentType,
      unitId,
      orderIndex,
      isPreview,
      videoUrl,
    } = req.body;

    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });

    const uploads = handleFileUploads(req);

    let finalType = contentType || "text";
    let file_path = uploads.file_url || null;
    let video_path = uploads.video_url || videoUrl || null;
    
    if (uploads.file_url) finalType = "pdf";
    if (uploads.video_url) finalType = "video";

    // Auto order indexing
    let order_index = orderIndex;
    if (!order_index) {
      const where = unitId ? { unit_id: unitId } : { course_id: courseId, unit_id: null };
      const last = await Lesson.findOne({ where, order: [["order_index", "DESC"]] });
      order_index = last ? (last.order_index || 0) + 1 : 1;
    }

    const lesson = await Lesson.create({
      title,
      content,
      course_id: courseId,
      unit_id: unitId || null,
      order_index,
      content_type: finalType,
      video_url: video_path,
      file_url: file_path,
      is_preview: Boolean(isPreview),
    });

    const full = await Lesson.findByPk(lesson.id, {
      include: [{ model: Course, as: "course" }, { model: Unit, as: "unit" }],
    });

    return res.status(201).json({ success: true, lesson: buildFileUrls(full) });
  } catch (err) {
    console.error("createLesson error:", err);
    return res.status(500).json({ success: false, error: err?.message || "Server error" });
  }
};

/* -----------------------------------------------------------
   UPDATE LESSON
----------------------------------------------------------- */
export const updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const existing = await Lesson.findByPk(lessonId);
    if (!existing) return res.status(404).json({ success: false, error: "Lesson not found" });

    const uploads = handleFileUploads(req);
    const updates = {};

    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.content !== undefined) updates.content = req.body.content;
    if (req.body.orderIndex !== undefined) updates.order_index = req.body.orderIndex;
    if (req.body.unitId !== undefined) updates.unit_id = req.body.unitId;
    if (req.body.isPreview !== undefined) updates.is_preview = req.body.isPreview;

    // Priority: uploaded video
    if (uploads.video_url) {
      updates.video_url = uploads.video_url;
      updates.file_url = null;
      updates.content_type = "video";
    }
    // Uploaded PDF/file
    if (uploads.file_url) {
      updates.file_url = uploads.file_url;
      updates.video_url = null;
      updates.content_type = "pdf";
    }
    // Manual content type or videoUrl
    if (req.body.contentType) updates.content_type = req.body.contentType;
    if (req.body.videoUrl && !uploads.video_url) updates.video_url = req.body.videoUrl;

    await existing.update(updates);

    const updated = await Lesson.findByPk(lessonId, {
      include: [{ model: Course, as: "course" }, { model: Unit, as: "unit" }],
    });

    return res.json({ success: true, lesson: buildFileUrls(updated) });
  } catch (err) {
    console.error("updateLesson error:", err);
    return res.status(500).json({ success: false, error: err?.message || "Server error" });
  }
};

/* -----------------------------------------------------------
   GET LESSON
----------------------------------------------------------- */
export const getLessonById = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findByPk(lessonId, {
      include: [{ model: Course, as: "course" }, { model: Unit, as: "unit" }],
    });
    if (!lesson) return res.status(404).json({ success: false, error: "Lesson not found" });

    trackLessonView(req.user?.id, lessonId);
    return res.json({ success: true, lesson: buildFileUrls(lesson) });
  } catch (err) {
    console.error("getLessonById error:", err);
    return res.status(500).json({ success: false, error: err?.message || "Server error" });
  }
};

/* -----------------------------------------------------------
   GET LESSONS BY COURSE
----------------------------------------------------------- */
export const getLessonsByCourse = async (req, res) => {
  try {
    const lessons = await Lesson.findAll({
      where: { course_id: req.params.courseId },
      order: [["order_index", "ASC"]],
      include: [{ model: Unit, as: "unit" }],
    });
    return res.json({ success: true, lessons: lessons.map(buildFileUrls) });
  } catch (err) {
    console.error("getLessonsByCourse error:", err);
    return res.status(500).json({ success: false, error: err?.message || "Server error" });
  }
};

/* -----------------------------------------------------------
   GET LESSONS BY UNIT
----------------------------------------------------------- */
export const getLessonsByUnit = async (req, res) => {
  try {
    const lessons = await Lesson.findAll({
      where: { unit_id: req.params.unitId },
      order: [["order_index", "ASC"]],
    });
    return res.json({ success: true, lessons: lessons.map(buildFileUrls) });
  } catch (err) {
    console.error("getLessonsByUnit error:", err);
    return res.status(500).json({ success: false, error: err?.message || "Server error" });
  }
};

/* -----------------------------------------------------------
   DELETE LESSON
----------------------------------------------------------- */
export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId);
    if (!lesson) return res.status(404).json({ success: false, error: "Lesson not found" });

    // Optional: Delete from Cloudinary if needed
    await lesson.destroy();
    return res.json({ success: true, message: "Lesson deleted" });
  } catch (err) {
    console.error("deleteLesson error:", err);
    return res.status(500).json({ success: false, error: err?.message || "Server error" });
  }
};

/* -----------------------------------------------------------
   GET PREVIEW LESSON FOR A COURSE (public)
----------------------------------------------------------- */
export const getPreviewLessonForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findByPk(courseId, { attributes: ["id", "title"] });
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });

    let lesson = await Lesson.findOne({
      where: { course_id: courseId, is_preview: true },
      order: [["order_index", "ASC"]],
    });

    // If no preview lesson set, choose first lesson as fallback and mark it preview
    if (!lesson) {
      const anyLesson = await Lesson.findOne({
        where: { course_id: courseId },
        order: [["order_index", "ASC"]],
      });
      if (!anyLesson) {
        const lessonCount = await Lesson.count({ where: { course_id: courseId } });
        return res.status(404).json({
          success: false,
          error: "No lessons found for this course",
          lessonCount,
        });
      }
      await anyLesson.update({ is_preview: true });
      lesson = await Lesson.findByPk(anyLesson.id);
    }

    const lessonData = buildFileUrls(lesson);
    return res.json({
      success: true,
      lesson: lessonData,
      access: "public",
      backendUrl: getBackendUrl(),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("getPreviewLessonForCourse error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to load preview lesson",
      details: process.env.NODE_ENV === "development" ? err?.message : undefined,
    });
  }
};

/* -----------------------------------------------------------
   GET PUBLIC PREVIEW BY LESSON ID
----------------------------------------------------------- */
export const getPublicPreviewByLessonId = async (req, res) => {
  try {
    const { lessonId } = req.params;
    
    console.log(`🔓 PUBLIC PREVIEW requested for lesson ${lessonId}`);

    const lesson = await Lesson.findByPk(lessonId, {
      include: [{ model: Course, as: "course" }],
    });

    if (!lesson) {
      console.log(`❌ Lesson not found: ${lessonId}`);
      return res.status(404).json({
        success: false,
        error: "Preview lesson not found",
      });
    }

    // Check if this is a preview lesson or if we should allow access anyway
    if (!lesson.is_preview) {
      console.log(`⚠️ Lesson ${lessonId} is not marked as preview, but allowing access`);
    }

    const lessonData = buildFileUrls(lesson);
    
    console.log(`✅ Public preview served: ${lesson.title}`);
    console.log(`   File URL: ${lessonData.file_url?.substring(0, 80) || 'None'}...`);
    console.log(`   Is Cloudinary: ${lessonData.file_url?.includes('cloudinary') ? 'Yes' : 'No'}`);

    return res.json({
      success: true,
      lesson: lessonData,
      access: "public",
      message: "Public preview access granted",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ getPublicPreviewByLessonId error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to load preview",
      details: process.env.NODE_ENV === "development" ? err?.message : undefined,
    });
  }
};

export default {
  createLesson,
  updateLesson,
  getLessonById,
  getLessonsByCourse,
  getLessonsByUnit,
  deleteLesson,
  getPreviewLessonForCourse,
  getPublicPreviewByLessonId,
  buildFileUrls,
};