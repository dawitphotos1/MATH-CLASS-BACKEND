// // controllers/lessonController.js (OPTIMIZED VERSION)
// import db from "../models/index.js";
// import path from "path";
// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs";
// import uploadMiddleware from "../middleware/uploadMiddleware.js";

// const { Lesson, Course, Unit, LessonView, Enrollment, sequelize } = db;

// // Configure Cloudinary
// if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
//   cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET || "",
//     secure: true,
//   });
// }

// /* -------------------------
//    Helper: backend URL
// ------------------------- */
// const getBackendUrl = () => {
//   if (process.env.BACKEND_URL)
//     return process.env.BACKEND_URL.replace(/\/+$/g, "");
//   if (process.env.RENDER_EXTERNAL_URL)
//     return process.env.RENDER_EXTERNAL_URL.replace(/\/+$/g, "");
//   if (process.env.NODE_ENV === "production")
//     return "https://mathe-class-website-backend-1.onrender.com";
//   const p = process.env.PORT || 5000;
//   return `http://localhost:${p}`;
// };

// /* -------------------------
//    Helper: normalize and build file/video URLs (OPTIMIZED)
// ------------------------- */
// export const buildFileUrls = (lesson) => {
//   if (!lesson) return null;

//   // Early return for minimal processing
//   const raw =
//     typeof lesson.toJSON === "function" ? lesson.toJSON() : { ...lesson };

//   // Fast path for common cases
//   const resolveUrl = (url) => {
//     if (!url || typeof url !== "string" || url.trim() === "") return null;

//     // Already absolute URL
//     if (url.startsWith("http://") || url.startsWith("https://")) {
//       // Fix Cloudinary PDF URLs efficiently
//       if (
//         url.includes("cloudinary.com") &&
//         url.includes("/image/upload/") &&
//         url.toLowerCase().endsWith(".pdf")
//       ) {
//         return url.replace("/image/upload/", "/raw/upload/");
//       }
//       return url;
//     }

//     const backend = getBackendUrl();

//     // Local Uploads path
//     if (url.startsWith("/Uploads/") || url.startsWith("Uploads/")) {
//       const filename = url.replace(/^\/?Uploads\//, "");
//       return `${backend}/api/v1/files/${encodeURIComponent(filename)}`;
//     }

//     // Simple filename
//     if (!url.includes("/") && !url.includes("\\")) {
//       return `${backend}/api/v1/files/${encodeURIComponent(url)}`;
//     }

//     return null;
//   };

//   // Build result with minimal operations
//   const result = {
//     id: raw.id ?? null,
//     title: raw.title ?? "",
//     contentType: raw.content_type ?? "text",
//     textContent: raw.content ?? "",
//     videoUrl: resolveUrl(raw.video_url),
//     fileUrl: resolveUrl(raw.file_url),
//     isPreview: Boolean(raw.is_preview ?? false),
//     unitId: raw.unit_id ?? null,
//     courseId: raw.course_id ?? null,
//     orderIndex: Number.isFinite(raw.order_index) ? raw.order_index : null,
//   };

//   // Only include course/unit if they exist
//   if (raw.course) {
//     result.course = {
//       id: raw.course.id ?? null,
//       title: raw.course.title ?? "",
//       slug: raw.course.slug ?? null,
//     };
//   }

//   if (raw.unit) {
//     result.unit = {
//       id: raw.unit.id ?? null,
//       title: raw.unit.title ?? "",
//     };
//   }

//   return result;
// };

// // Cache for preview lessons to avoid repeated database queries
// const previewLessonCache = new Map();
// const CACHE_TTL = 300000; // 5 minutes in milliseconds

// /* -------------------------
//    GET PREVIEW LESSON FOR COURSE (OPTIMIZED - MAIN FIX)
// ------------------------- */
// export const getPreviewLessonForCourse = async (req, res) => {
//   const TIMEOUT_MS = 25000; // 25 second timeout
//   const startTime = Date.now();

//   // Set response timeout
//   const timeout = setTimeout(() => {
//     if (!res.headersSent) {
//       res.status(504).json({
//         success: false,
//         error: "Request timeout. Please try again.",
//         timedOut: true,
//       });
//     }
//   }, TIMEOUT_MS);

//   try {
//     const { courseId } = req.params;

//     // Validate input quickly
//     if (!courseId || isNaN(parseInt(courseId, 10))) {
//       clearTimeout(timeout);
//       return res.status(400).json({
//         success: false,
//         error: "Valid course ID is required",
//       });
//     }

//     const cId = parseInt(courseId, 10);

//     // Check cache first
//     const cacheKey = `preview:${cId}`;
//     const cached = previewLessonCache.get(cacheKey);

//     if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
//       clearTimeout(timeout);
//       console.log(`✅ Cache hit for preview lesson of course ${cId}`);
//       return res.json(cached.data);
//     }

//     // FAST DATABASE QUERY - Only fetch what we need
//     // First, check if course exists (fast query)
//     const courseExists = await Course.findByPk(cId, {
//       attributes: ["id"],
//       raw: true,
//     });

//     if (!courseExists) {
//       clearTimeout(timeout);
//       return res.status(404).json({
//         success: false,
//         error: "Course not found",
//       });
//     }

//     // Optimized query for preview lesson
//     let lesson = await Lesson.findOne({
//       where: {
//         course_id: cId,
//         is_preview: true,
//       },
//       order: [["order_index", "ASC"]],
//       attributes: [
//         "id",
//         "title",
//         "content",
//         "file_url",
//         "video_url",
//         "content_type",
//         "is_preview",
//         "order_index",
//         "created_at",
//       ],
//       raw: true, // Get raw data for faster processing
//       limit: 1,
//     });

//     // If no preview lesson, get first lesson (still optimized)
//     if (!lesson) {
//       lesson = await Lesson.findOne({
//         where: { course_id: cId },
//         order: [["order_index", "ASC"]],
//         attributes: [
//           "id",
//           "title",
//           "content",
//           "file_url",
//           "video_url",
//           "content_type",
//           "is_preview",
//           "order_index",
//           "created_at",
//         ],
//         raw: true,
//         limit: 1,
//       });
//     }

//     if (!lesson) {
//       clearTimeout(timeout);
//       return res.status(404).json({
//         success: false,
//         error: "No lessons found for this course",
//       });
//     }

//     // Get minimal course info
//     const course = await Course.findByPk(cId, {
//       attributes: ["id", "title", "slug"],
//       raw: true,
//     });

//     // Build response with minimal processing
//     const payload = {
//       success: true,
//       lesson: {
//         id: lesson.id,
//         title: lesson.title,
//         textContent: lesson.content || "",
//         contentType: lesson.content_type || "text",
//         videoUrl: lesson.video_url || null,
//         fileUrl: lesson.file_url || null,
//         isPreview: Boolean(lesson.is_preview),
//         orderIndex: lesson.order_index,
//         createdAt: lesson.created_at,
//       },
//       course: {
//         id: course.id,
//         title: course.title,
//         slug: course.slug,
//       },
//       _performance: {
//         queryTime: Date.now() - startTime,
//         cached: false,
//       },
//     };

//     // Cache the result
//     previewLessonCache.set(cacheKey, {
//       data: payload,
//       timestamp: Date.now(),
//     });

//     // Clean old cache entries periodically
//     if (previewLessonCache.size > 100) {
//       const now = Date.now();
//       for (const [key, value] of previewLessonCache.entries()) {
//         if (now - value.timestamp > CACHE_TTL) {
//           previewLessonCache.delete(key);
//         }
//       }
//     }

//     clearTimeout(timeout);

//     console.log(
//       `✅ Preview lesson loaded for course ${cId} in ${
//         Date.now() - startTime
//       }ms`
//     );

//     return res.json(payload);
//   } catch (err) {
//     clearTimeout(timeout);
//     console.error("getPreviewLessonForCourse error:", err?.message || err);

//     // Don't send stack traces in production
//     const errorResponse = {
//       success: false,
//       error: "Failed to load preview lesson",
//     };

//     if (process.env.NODE_ENV === "development") {
//       errorResponse.details = err?.message;
//       errorResponse.stack = err?.stack;
//     }

//     return res.status(500).json(errorResponse);
//   }
// };

// /* -------------------------
//    GET PUBLIC PREVIEW BY LESSON ID (OPTIMIZED)
// ------------------------- */
// export const getPublicPreviewByLessonId = async (req, res) => {
//   const TIMEOUT_MS = 20000;
//   const timeout = setTimeout(() => {
//     if (!res.headersSent) {
//       res.status(504).json({
//         success: false,
//         error: "Request timeout",
//         timedOut: true,
//       });
//     }
//   }, TIMEOUT_MS);

//   try {
//     const lessonId = req.params.lessonId ?? req.params.id;

//     if (!lessonId || isNaN(parseInt(lessonId, 10))) {
//       clearTimeout(timeout);
//       return res.status(400).json({
//         success: false,
//         error: "Valid lesson ID is required",
//       });
//     }

//     const id = parseInt(lessonId, 10);

//     // Fast query with only needed fields
//     const lesson = await Lesson.findByPk(id, {
//       attributes: [
//         "id",
//         "title",
//         "content",
//         "file_url",
//         "video_url",
//         "content_type",
//         "is_preview",
//         "course_id",
//       ],
//       raw: true,
//     });

//     if (!lesson) {
//       clearTimeout(timeout);
//       return res.status(404).json({
//         success: false,
//         error: "Lesson not found",
//       });
//     }

//     // Check access - simplified logic
//     const isPublicPreview = lesson.is_preview;
//     const requiresAuth = !isPublicPreview && !req.user;

//     if (requiresAuth) {
//       clearTimeout(timeout);
//       return res.status(403).json({
//         success: false,
//         error:
//           "This lesson is not available for public preview. Please enroll or log in.",
//       });
//     }

//     // Get course info
//     const course = await Course.findByPk(lesson.course_id, {
//       attributes: ["id", "title", "slug"],
//       raw: true,
//     });

//     const payload = {
//       success: true,
//       lesson: {
//         id: lesson.id,
//         title: lesson.title,
//         textContent: lesson.content || "",
//         contentType: lesson.content_type || "text",
//         videoUrl: lesson.video_url || null,
//         fileUrl: lesson.file_url || null,
//         isPreview: Boolean(lesson.is_preview),
//       },
//       course: course
//         ? {
//             id: course.id,
//             title: course.title,
//             slug: course.slug,
//           }
//         : null,
//       access: isPublicPreview ? "public" : "restricted",
//     };

//     clearTimeout(timeout);
//     return res.json(payload);
//   } catch (err) {
//     clearTimeout(timeout);
//     console.error("getPublicPreviewByLessonId error:", err?.message || err);

//     const errorResponse = {
//       success: false,
//       error: "Failed to load preview",
//     };

//     if (process.env.NODE_ENV === "development") {
//       errorResponse.details = err?.message;
//     }

//     return res.status(500).json(errorResponse);
//   }
// };

// /* -------------------------
//    GET LESSONS BY COURSE (OPTIMIZED)
// ------------------------- */
// export const getLessonsByCourse = async (req, res) => {
//   try {
//     const courseId = req.params.courseId ?? req.params.id;

//     if (!courseId || isNaN(parseInt(courseId, 10))) {
//       return res.status(400).json({
//         success: false,
//         error: "Valid course ID is required",
//       });
//     }

//     const cId = parseInt(courseId, 10);

//     // Optimized query - only fetch needed fields
//     const lessons = await Lesson.findAll({
//       where: { course_id: cId },
//       attributes: [
//         "id",
//         "title",
//         "content",
//         "file_url",
//         "video_url",
//         "content_type",
//         "is_preview",
//         "order_index",
//         "unit_id",
//       ],
//       order: [["order_index", "ASC"]],
//       raw: true, // Faster than full instances
//     });

//     // Simple mapping without heavy processing
//     const formattedLessons = lessons.map((lesson) => ({
//       id: lesson.id,
//       title: lesson.title,
//       textContent: lesson.content || "",
//       contentType: lesson.content_type || "text",
//       videoUrl: lesson.video_url || null,
//       fileUrl: lesson.file_url || null,
//       isPreview: Boolean(lesson.is_preview),
//       orderIndex: lesson.order_index,
//       unitId: lesson.unit_id,
//     }));

//     return res.json({
//       success: true,
//       lessons: formattedLessons,
//       count: lessons.length,
//     });
//   } catch (err) {
//     console.error("getLessonsByCourse error:", err?.message || err);

//     const errorResponse = {
//       success: false,
//       error: "Failed to fetch lessons",
//     };

//     if (process.env.NODE_ENV === "development") {
//       errorResponse.details = err?.message;
//     }

//     return res.status(500).json(errorResponse);
//   }
// };

// // Keep other functions the same, but add timeout protection where needed...

// /* -------------------------
//    Add database indexes check/creation
// ------------------------- */
// export const ensureIndexes = async () => {
//   try {
//     // This would be run once on startup
//     console.log("🔍 Checking/creating database indexes for performance...");

//     // You should have these indexes in your database:
//     // CREATE INDEX idx_lessons_course_preview ON lessons(course_id, is_preview);
//     // CREATE INDEX idx_lessons_course_order ON lessons(course_id, order_index);
//     // CREATE INDEX idx_lessons_preview ON lessons(is_preview) WHERE is_preview = true;

//     console.log("✅ Database indexes verified");
//   } catch (err) {
//     console.warn("⚠️ Could not verify indexes:", err.message);
//   }
// };

// // Call on module load if in production
// if (process.env.NODE_ENV === "production") {
//   setTimeout(() => {
//     ensureIndexes().catch(() => {});
//   }, 5000);
// }

// /* -------------------------
//    Default export (updated)
// ------------------------- */
// export default {
//   buildFileUrls,
//   debugLessonFile,
//   fixLessonFileUrl,
//   getLessonById,
//   getPreviewLessonForCourse,
//   getPublicPreviewByLessonId,
//   createLesson,
//   updateLesson,
//   getLessonsByCourse,
//   getLessonsByUnit,
//   deleteLesson,
//   ensureIndexes,
// };







// controllers/lessonController.js
import db from "../models/index.js";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

const { Lesson, Course, Unit, LessonView, Enrollment, sequelize } = db;

/* -------------------------
   Cloudinary config (SAFE)
------------------------- */
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

/* -------------------------
   Helpers
------------------------- */
const getBackendUrl = () => {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL.replace(/\/$/, "");
  if (process.env.RENDER_EXTERNAL_URL)
    return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, "");
  return `http://localhost:${process.env.PORT || 5000}`;
};

export const buildFileUrls = (lesson) => {
  if (!lesson) return null;
  const raw = lesson.toJSON ? lesson.toJSON() : lesson;

  const normalize = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
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
  };
};

/* -------------------------
   REQUIRED CONTROLLER METHODS
   (These were MISSING before → crash)
------------------------- */
export const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson)
      return res.status(404).json({ success: false, error: "Lesson not found" });

    res.json({ success: true, lesson: buildFileUrls(lesson) });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to load lesson" });
  }
};

export const createLesson = async (req, res) => {
  try {
    const lesson = await Lesson.create(req.body);
    res.status(201).json({ success: true, lesson });
  } catch (err) {
    res.status(500).json({ success: false, error: "Create lesson failed" });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId);
    if (!lesson)
      return res.status(404).json({ success: false, error: "Lesson not found" });

    await lesson.update(req.body);
    res.json({ success: true, lesson });
  } catch (err) {
    res.status(500).json({ success: false, error: "Update failed" });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId);
    if (!lesson)
      return res.status(404).json({ success: false, error: "Lesson not found" });

    await lesson.destroy();
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, error: "Delete failed" });
  }
};

export const getLessonsByUnit = async (req, res) => {
  const lessons = await Lesson.findAll({
    where: { unit_id: req.params.unitId },
    order: [["order_index", "ASC"]],
  });
  res.json({ success: true, lessons });
};

/* -------------------------
   PREVIEW — COURSE
------------------------- */
export const getPreviewLessonForCourse = async (req, res) => {
  const lesson =
    (await Lesson.findOne({
      where: { course_id: req.params.courseId, is_preview: true },
      order: [["order_index", "ASC"]],
    })) ||
    (await Lesson.findOne({
      where: { course_id: req.params.courseId },
      order: [["order_index", "ASC"]],
    }));

  if (!lesson)
    return res.status(404).json({ success: false, error: "No lessons found" });

  const course = await Course.findByPk(req.params.courseId, {
    attributes: ["id", "title", "slug"],
  });

  res.json({
    success: true,
    lesson: buildFileUrls(lesson),
    course,
  });
};

/* -------------------------
   PREVIEW — PUBLIC BY LESSON
------------------------- */
export const getPublicPreviewByLessonId = async (req, res) => {
  const lesson = await Lesson.findByPk(req.params.id);
  if (!lesson)
    return res.status(404).json({ success: false, error: "Lesson not found" });

  if (!lesson.is_preview && !req.user)
    return res.status(403).json({ success: false, error: "Not allowed" });

  const course = await Course.findByPk(lesson.course_id, {
    attributes: ["id", "title", "slug"],
  });

  res.json({
    success: true,
    lesson: buildFileUrls(lesson),
    course,
  });
};

/* -------------------------
   EXPORT (SAFE)
------------------------- */
export default {
  buildFileUrls,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonsByUnit,
  getPreviewLessonForCourse,
  getPublicPreviewByLessonId,
};
