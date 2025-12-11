// // controllers/lessonController.js 

// import db from "../models/index.js";
// import path from "path";
// import { v2 as cloudinary } from "cloudinary";

// const { Lesson, Course, Unit, LessonView, Enrollment, sequelize } = db;

// // Configure Cloudinary (safe no-op if env vars missing)
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
//   api_key: process.env.CLOUDINARY_API_KEY || "",
//   api_secret: process.env.CLOUDINARY_API_SECRET || "",
//   secure: true,
// });

// /* -------------------------
//    Helper: backend URL
//    ------------------------- */
// const getBackendUrl = () => {
//   if (process.env.BACKEND_URL) return process.env.BACKEND_URL.replace(/\/+$/g, "");
//   if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL.replace(/\/+$/g, "");
//   if (process.env.NODE_ENV === "production") return "https://mathe-class-website-backend-1.onrender.com";
//   const p = process.env.PORT || 5000;
//   return `http://localhost:${p}`;
// };

// /* -------------------------
//    Helper: normalize and build file/video URLs
//    - Accepts a lesson instance or plain object (from Sequelize)
//    - Returns a plain JS object with camelCase keys
//    ------------------------- */
// export const buildFileUrls = (lesson) => {
//   if (!lesson) return null;
//   // Convert Sequelize instance to plain object if needed
//   const raw = typeof lesson.toJSON === "function" ? lesson.toJSON() : { ...lesson };

//   const backend = getBackendUrl();

//   const resolveUrl = (url, preferRawForPdf = true) => {
//     if (!url) return null;
//     // Already an absolute URL -> return as-is (but ensure https)
//     if (typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://"))) {
//       // If Cloudinary PDF stored under image/upload, convert to raw/upload
//       if (preferRawForPdf && url.toLowerCase().endsWith(".pdf") && url.includes("/image/upload/")) {
//         return url.replace("/image/upload/", "/raw/upload/");
//       }
//       return url;
//     }

//     // If Cloudinary public id or local path
//     if (typeof url === "string" && url.includes("cloudinary.com")) {
//       return url;
//     }

//     // If running in production and url is a local path, attempt to craft a cloudinary fallback using filename (best-effort)
//     if (process.env.NODE_ENV === "production" && typeof url === "string" && !url.startsWith("http")) {
//       const filename = path.basename(url);
//       // choose raw for pdfs
//       if (filename.toLowerCase().endsWith(".pdf")) {
//         // best-effort: use mathe-class/pdfs/<name-without-ext>
//         const publicId = `mathe-class/pdfs/${filename.replace(/\.[^/.]+$/, "")}`;
//         try {
//           return cloudinary.url(publicId, { resource_type: "raw", secure: true });
//         } catch (e) {
//           // fallback to backend files endpoint
//           return `${backend}/api/v1/files/${encodeURIComponent(filename)}`;
//         }
//       }

//       // non-pdf fallback
//       const publicId = `mathe-class/files/${filename.replace(/\.[^/.]+$/, "")}`;
//       try {
//         return cloudinary.url(publicId, { resource_type: "auto", secure: true });
//       } catch (e) {
//         return `${backend}/api/v1/files/${encodeURIComponent(filename)}`;
//       }
//     }

//     // If Uploads path (development)
//     if (typeof url === "string" && (url.startsWith("/Uploads/") || url.startsWith("Uploads/"))) {
//       const filename = url.replace(/^\/?Uploads\//, "");
//       return `${backend}/api/v1/files/${encodeURIComponent(filename)}`;
//     }

//     // Plain filename
//     if (typeof url === "string") {
//       return `${backend}/api/v1/files/${encodeURIComponent(url)}`;
//     }

//     // Unknown shape
//     return null;
//   };

//   // Map / normalize fields (DB snake_case -> response camelCase)
//   const result = {
//     id: raw.id ?? null,
//     title: raw.title ?? "",
//     contentType: raw.content_type ?? raw.type ?? "text",
//     textContent: raw.content ?? raw.text_content ?? "",
//     videoUrl: resolveUrl(raw.video_url ?? raw.videoUrl ?? null, false),
//     fileUrl: resolveUrl(raw.file_url ?? raw.fileUrl ?? null, true),
//     isPreview: Boolean(raw.is_preview ?? raw.isPreview ?? false),
//     unitId: raw.unit_id ?? raw.unitId ?? null,
//     courseId: raw.course_id ?? raw.courseId ?? null,
//     orderIndex: Number.isFinite(raw.order_index ?? raw.orderIndex ?? null)
//       ? (raw.order_index ?? raw.orderIndex)
//       : null,
//     createdAt: raw.created_at ?? raw.createdAt ?? raw.createdAt ?? null,
//     updatedAt: raw.updated_at ?? raw.updatedAt ?? null,
//   };

//   // Include minimal course/unit objects if present
//   if (raw.course) {
//     result.course = {
//       id: raw.course.id ?? raw.course_id ?? null,
//       title: raw.course.title ?? "",
//       slug: raw.course.slug ?? null,
//       teacherId: raw.course.teacher_id ?? raw.course.teacherId ?? null,
//     };
//   }

//   if (raw.unit) {
//     result.unit = {
//       id: raw.unit.id ?? raw.unit_id ?? null,
//       title: raw.unit.title ?? "",
//       orderIndex: raw.unit.order_index ?? raw.unit.orderIndex ?? null,
//     };
//   }

//   return result;
// };

// /* -------------------------
//    Track Lesson View (safe)
//    ------------------------- */
// const trackLessonView = async (userId, lessonId) => {
//   try {
//     if (!userId || !lessonId) return;
//     await LessonView.findOrCreate({
//       where: { user_id: userId, lesson_id: lessonId },
//       defaults: { viewed_at: new Date() },
//     });
//   } catch (err) {
//     // Non-fatal
//     console.warn("trackLessonView error:", err?.message || err);
//   }
// };

// /* -------------------------
//    Handle multer file uploads (if used)
//    - returns { videoUrl, fileUrl } values (paths or locations)
//    ------------------------- */
// const handleFileUploads = (req) => {
//   const out = {};
//   try {
//     if (req.files?.video?.[0]) {
//       const f = req.files.video[0];
//       out.videoUrl = f.path || f.location || f.filename || null;
//     }
//     if (req.files?.pdf?.[0]) {
//       const f = req.files.pdf[0];
//       out.fileUrl = f.path || f.location || f.filename || null;
//     }
//     if (req.files?.file?.[0]) {
//       const f = req.files.file[0];
//       out.fileUrl = f.path || f.location || f.filename || null;
//     }
//   } catch (e) {
//     // swallow
//     console.warn("handleFileUploads warning:", e?.message || e);
//   }
//   return out;
// };

// /* -------------------------
//    GET LESSON BY ID (camelCase output)
//    - permission checks: admin / teacher-owner / enrolled student / preview access
//    ------------------------- */
// export const getLessonById = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     // Accept either :lessonId or :id route naming
//     const lessonId = req.params.lessonId ?? req.params.id;
//     if (!lessonId || isNaN(parseInt(lessonId, 10))) {
//       await t.rollback();
//       return res.status(400).json({ success: false, error: "Valid lesson ID is required" });
//     }
//     const id = parseInt(lessonId, 10);

//     const lesson = await Lesson.findByPk(id, {
//       include: [
//         { model: Course, as: "course", attributes: ["id", "title", "slug", "teacher_id"] },
//         { model: Unit, as: "unit", attributes: ["id", "title", "order_index"] },
//       ],
//       transaction: t,
//     });

//     if (!lesson) {
//       await t.rollback();
//       return res.status(404).json({ success: false, error: "Lesson not found" });
//     }

//     // Access checks
//     let hasAccess = false;
//     let accessReason = "unknown";

//     const user = req.user ?? null;
//     if (user) {
//       if (user.role === "admin") {
//         hasAccess = true;
//         accessReason = "admin";
//       } else if (user.role === "teacher" && lesson.course?.teacher_id === user.id) {
//         hasAccess = true;
//         accessReason = "teacher_owner";
//       } else if (user.role === "student") {
//         if (lesson.is_preview) {
//           hasAccess = true;
//           accessReason = "preview";
//         } else {
//           const enrollment = await Enrollment.findOne({
//             where: { user_id: user.id, course_id: lesson.course_id, approval_status: "approved" },
//             transaction: t,
//           });
//           if (enrollment) {
//             hasAccess = true;
//             accessReason = "enrolled";
//           } else {
//             hasAccess = false;
//             accessReason = "not_enrolled";
//           }
//         }
//       } else {
//         // other roles - default deny unless preview
//         hasAccess = Boolean(lesson.is_preview);
//         accessReason = lesson.is_preview ? "preview" : "forbidden_role";
//       }
//     } else {
//       // public access only for preview lessons
//       hasAccess = Boolean(lesson.is_preview);
//       accessReason = lesson.is_preview ? "public_preview" : "requires_login";
//     }

//     if (!hasAccess) {
//       await t.rollback();
//       return res.status(accessReason === "requires_login" ? 401 : 403).json({
//         success: false,
//         error:
//           accessReason === "requires_login"
//             ? "Please log in to access this lesson"
//             : "You do not have permission to access this lesson",
//         reason: accessReason,
//         canPreview: Boolean(lesson.is_preview),
//       });
//     }

//     // Track view (non-blocking)
//     if (user?.id) {
//       // best-effort tracking
//       try {
//         await trackLessonView(user.id, lesson.id);
//       } catch (e) {
//         // don't fail on tracking errors
//         console.warn("trackLessonView failed:", e?.message || e);
//       }
//     }

//     const payload = buildFileUrls(lesson);

//     await t.commit();
//     return res.json({ success: true, lesson: payload, access: { reason: accessReason } });
//   } catch (err) {
//     await t.rollback();
//     console.error("getLessonById error:", err?.message || err);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to load lesson",
//       details: process.env.NODE_ENV === "development" ? err?.message : undefined,
//     });
//   }
// };

// /* -------------------------
//    GET PREVIEW LESSON FOR COURSE (public)
//    - returns first preview lesson or first lesson for course
//    ------------------------- */
// export const getPreviewLessonForCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     if (!courseId || isNaN(parseInt(courseId, 10))) {
//       return res.status(400).json({ success: false, error: "Valid course ID is required" });
//     }
//     const cId = parseInt(courseId, 10);

//     const course = await Course.findByPk(cId, { attributes: ["id", "title", "slug", "teacher_id"] });
//     if (!course) return res.status(404).json({ success: false, error: "Course not found" });

//     // prefer explicit preview lesson
//     let lesson = await Lesson.findOne({
//       where: { course_id: cId, is_preview: true },
//       order: [["order_index", "ASC"]],
//       include: [{ model: Course, as: "course", attributes: ["id", "title", "slug"] }],
//     });

//     if (!lesson) {
//       // fallback to first lesson
//       lesson = await Lesson.findOne({
//         where: { course_id: cId },
//         order: [["order_index", "ASC"]],
//         include: [{ model: Course, as: "course", attributes: ["id", "title", "slug"] }],
//       });
//     }

//     if (!lesson) {
//       return res.status(404).json({ success: false, error: "No lessons found for this course" });
//     }

//     const payload = buildFileUrls(lesson);
//     return res.json({ success: true, lesson: payload, course: { id: course.id, title: course.title, slug: course.slug } });
//   } catch (err) {
//     console.error("getPreviewLessonForCourse error:", err?.message || err);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to load preview lesson",
//       details: process.env.NODE_ENV === "development" ? err?.message : undefined,
//     });
//   }
// };

// /* -------------------------
//    GET PUBLIC PREVIEW BY LESSON ID
//    - allows public access only when lesson.is_preview === true
//    ------------------------- */
// export const getPublicPreviewByLessonId = async (req, res) => {
//   try {
//     const lessonId = req.params.lessonId ?? req.params.id;
//     if (!lessonId || isNaN(parseInt(lessonId, 10))) {
//       return res.status(400).json({ success: false, error: "Valid lesson ID is required" });
//     }
//     const id = parseInt(lessonId, 10);

//     const lesson = await Lesson.findByPk(id, {
//       include: [{ model: Course, as: "course", attributes: ["id", "title", "slug"] }],
//     });

//     if (!lesson) return res.status(404).json({ success: false, error: "Lesson not found" });

//     if (!lesson.is_preview && !req.user) {
//       return res.status(403).json({
//         success: false,
//         error: "This lesson is not available for public preview. Please enroll or log in.",
//       });
//     }

//     const payload = buildFileUrls(lesson);
//     return res.json({ success: true, lesson: payload, access: lesson.is_preview ? "public" : "restricted" });
//   } catch (err) {
//     console.error("getPublicPreviewByLessonId error:", err?.message || err);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to load preview",
//       details: process.env.NODE_ENV === "development" ? err?.message : undefined,
//     });
//   }
// };

// /* -------------------------
//    CREATE LESSON
//    - expects POST /courses/:courseId/lessons or similar
//    - returns created lesson in camelCase
//    ------------------------- */
// export const createLesson = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const courseId = req.params.courseId ?? req.body.courseId;
//     if (!courseId || isNaN(parseInt(courseId, 10))) {
//       await t.rollback();
//       return res.status(400).json({ success: false, error: "Valid course ID is required" });
//     }
//     const cId = parseInt(courseId, 10);

//     const course = await Course.findByPk(cId, { transaction: t });
//     if (!course) {
//       await t.rollback();
//       return res.status(404).json({ success: false, error: "Course not found" });
//     }

//     const body = req.body ?? {};
//     const uploads = handleFileUploads(req);

//     // Determine content type
//     let contentType = (body.contentType ?? body.content_type ?? "text").toString();
//     if (uploads.fileUrl) contentType = "pdf";
//     if (uploads.videoUrl) contentType = "video";

//     // Determine orderIndex auto if missing
//     let orderIndex = (body.orderIndex ?? body.order_index);
//     if (orderIndex === undefined || orderIndex === null || isNaN(parseInt(orderIndex, 10))) {
//       const where = body.unitId ? { unit_id: body.unitId } : { course_id: cId };
//       const last = await Lesson.findOne({
//         where,
//         order: [["order_index", "DESC"]],
//         transaction: t,
//       });
//       orderIndex = last ? (last.order_index ?? 0) + 1 : 1;
//     }

//     const created = await Lesson.create(
//       {
//         title: (body.title ?? "Untitled Lesson").toString().trim(),
//         content: body.textContent ?? body.content ?? "",
//         course_id: cId,
//         unit_id: body.unitId ?? null,
//         order_index: parseInt(orderIndex, 10),
//         content_type: contentType,
//         video_url: uploads.videoUrl ?? body.videoUrl ?? null,
//         file_url: uploads.fileUrl ?? body.fileUrl ?? null,
//         is_preview: Boolean(body.isPreview ?? body.is_preview ?? false),
//       },
//       { transaction: t }
//     );

//     // re-fetch with includes
//     const full = await Lesson.findByPk(created.id, {
//       include: [
//         { model: Course, as: "course", attributes: ["id", "title"] },
//         { model: Unit, as: "unit", attributes: ["id", "title"] },
//       ],
//       transaction: t,
//     });

//     await t.commit();
//     return res.status(201).json({ success: true, lesson: buildFileUrls(full), message: "Lesson created" });
//   } catch (err) {
//     await t.rollback();
//     console.error("createLesson error:", err?.message || err);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to create lesson",
//       details: process.env.NODE_ENV === "development" ? err?.message : undefined,
//     });
//   }
// };

// /* -------------------------
//    UPDATE LESSON
//    - PATCH /lessons/:lessonId
//    ------------------------- */
// export const updateLesson = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const lessonId = req.params.lessonId ?? req.params.id;
//     if (!lessonId || isNaN(parseInt(lessonId, 10))) {
//       await t.rollback();
//       return res.status(400).json({ success: false, error: "Valid lesson ID is required" });
//     }
//     const id = parseInt(lessonId, 10);

//     const existing = await Lesson.findByPk(id, { transaction: t });
//     if (!existing) {
//       await t.rollback();
//       return res.status(404).json({ success: false, error: "Lesson not found" });
//     }

//     // Authorization: teachers can only edit their own course lessons (admin can edit)
//     if (req.user && req.user.role === "teacher") {
//       const course = await Course.findByPk(existing.course_id, { transaction: t });
//       if (!course || course.teacher_id !== req.user.id) {
//         await t.rollback();
//         return res.status(403).json({ success: false, error: "You may only edit lessons in your own courses" });
//       }
//     }

//     const body = req.body ?? {};
//     const uploads = handleFileUploads(req);

//     const updates = {};

//     if (body.title !== undefined && body.title !== null) updates.title = body.title.toString().trim();
//     if (body.textContent !== undefined) updates.content = body.textContent;
//     if (body.contentType !== undefined) updates.content_type = body.contentType;
//     if (body.videoUrl !== undefined) updates.video_url = body.videoUrl;
//     if (body.fileUrl !== undefined) updates.file_url = body.fileUrl;
//     if (body.unitId !== undefined) updates.unit_id = body.unitId;
//     if (body.orderIndex !== undefined) updates.order_index = parseInt(body.orderIndex, 10);
//     if (body.isPreview !== undefined) updates.is_preview = Boolean(body.isPreview);

//     // prioritize uploaded files if present
//     if (uploads.videoUrl) {
//       updates.video_url = uploads.videoUrl;
//       updates.file_url = null;
//       updates.content_type = "video";
//     }
//     if (uploads.fileUrl) {
//       updates.file_url = uploads.fileUrl;
//       updates.video_url = null;
//       updates.content_type = "pdf";
//     }

//     // apply updates object if not empty
//     if (Object.keys(updates).length > 0) {
//       await existing.update(updates, { transaction: t });
//     }

//     const updated = await Lesson.findByPk(id, {
//       include: [
//         { model: Course, as: "course", attributes: ["id", "title"] },
//         { model: Unit, as: "unit", attributes: ["id", "title"] },
//       ],
//       transaction: t,
//     });

//     await t.commit();
//     return res.json({ success: true, lesson: buildFileUrls(updated), message: "Lesson updated" });
//   } catch (err) {
//     await t.rollback();
//     console.error("updateLesson error:", err?.message || err);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to update lesson",
//       details: process.env.NODE_ENV === "development" ? err?.message : undefined,
//     });
//   }
// };

// /* -------------------------
//    GET LESSONS BY COURSE
//    - returns lessons[] in camelCase
//    ------------------------- */
// export const getLessonsByCourse = async (req, res) => {
//   try {
//     const courseId = req.params.courseId ?? req.params.id;
//     if (!courseId || isNaN(parseInt(courseId, 10))) {
//       return res.status(400).json({ success: false, error: "Valid course ID is required" });
//     }
//     const cId = parseInt(courseId, 10);

//     const lessons = await Lesson.findAll({
//       where: { course_id: cId },
//       include: [{ model: Unit, as: "unit", attributes: ["id", "title", "order_index"] }],
//       order: [["order_index", "ASC"]],
//     });

//     return res.json({ success: true, lessons: lessons.map(buildFileUrls), count: lessons.length });
//   } catch (err) {
//     console.error("getLessonsByCourse error:", err?.message || err);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to fetch lessons",
//       details: process.env.NODE_ENV === "development" ? err?.message : undefined,
//     });
//   }
// };

// /* -------------------------
//    GET LESSONS BY UNIT
//    - returns lessons[] in camelCase
//    ------------------------- */
// export const getLessonsByUnit = async (req, res) => {
//   try {
//     const unitId = req.params.unitId ?? req.params.id;
//     if (!unitId || isNaN(parseInt(unitId, 10))) {
//       return res.status(400).json({ success: false, error: "Valid unit ID is required" });
//     }
//     const uId = parseInt(unitId, 10);

//     const lessons = await Lesson.findAll({
//       where: { unit_id: uId },
//       order: [["order_index", "ASC"]],
//     });

//     return res.json({ success: true, lessons: lessons.map(buildFileUrls), count: lessons.length });
//   } catch (err) {
//     console.error("getLessonsByUnit error:", err?.message || err);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to fetch unit lessons",
//       details: process.env.NODE_ENV === "development" ? err?.message : undefined,
//     });
//   }
// };

// /* -------------------------
//    DELETE LESSON
//    - authorization: teacher-owner or admin
//    ------------------------- */
// export const deleteLesson = async (req, res) => {
//   const t = await sequelize.transaction();
//   try {
//     const lessonId = req.params.lessonId ?? req.params.id;
//     if (!lessonId || isNaN(parseInt(lessonId, 10))) {
//       await t.rollback();
//       return res.status(400).json({ success: false, error: "Valid lesson ID is required" });
//     }
//     const id = parseInt(lessonId, 10);

//     const lesson = await Lesson.findByPk(id, { transaction: t });
//     if (!lesson) {
//       await t.rollback();
//       return res.status(404).json({ success: false, error: "Lesson not found" });
//     }

//     // Authorization
//     if (req.user && req.user.role === "teacher") {
//       const course = await Course.findByPk(lesson.course_id, { transaction: t });
//       if (!course || course.teacher_id !== req.user.id) {
//         await t.rollback();
//         return res.status(403).json({ success: false, error: "You can only delete lessons from your courses" });
//       }
//     }

//     await lesson.destroy({ transaction: t });
//     await t.commit();
//     return res.json({ success: true, message: "Lesson deleted", deletedId: id });
//   } catch (err) {
//     await t.rollback();
//     console.error("deleteLesson error:", err?.message || err);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to delete lesson",
//       details: process.env.NODE_ENV === "development" ? err?.message : undefined,
//     });
//   }
// };

// /* -------------------------
//    Default export
//    ------------------------- */
// export default {
//   buildFileUrls,
//   getLessonById,
//   getPreviewLessonForCourse,
//   getPublicPreviewByLessonId,
//   createLesson,
//   updateLesson,
//   getLessonsByCourse,
//   getLessonsByUnit,
//   deleteLesson,
// };





// controllers/lessonController.js
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
    
    // Already an absolute URL -> return as-is
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

    // If Uploads path (development or production with local files)
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