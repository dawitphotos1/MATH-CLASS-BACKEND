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
//    Build Full URLs for video / pdf files
// ----------------------------------------------------------- */
// export const buildFileUrls = (lesson) => {
//   if (!lesson) return null;

//   const data = lesson.toJSON ? lesson.toJSON() : { ...lesson };
//   const backend = getBackendUrl();

//   // Video
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

// export default {
//   createLesson,
//   updateLesson,
//   getLessonById,
//   getLessonsByCourse,
//   getLessonsByUnit,
//   deleteLesson,
//   getPreviewLessonForCourse,
//   buildFileUrls,
// };





// controllers/lessonController.js
import db from "../models/index.js";

const { Lesson, Course, Unit, LessonView } = db;

/* --------------------------------------------
   Cloudinary Upload Extractor
-------------------------------------------- */
const extractUploadData = (req) => {
  const out = {};

  if (req.files?.video?.[0]) {
    out.video_url = req.files.video[0].path;
    out.content_type = "video";
  }

  if (req.files?.pdf?.[0]) {
    out.file_url = req.files.pdf[0].path;
    out.content_type = "pdf";
  }

  if (req.files?.file?.[0]) {
    out.file_url = req.files.file[0].path;
    out.content_type = "pdf";
  }

  if (req.files?.attachments) {
    out.attachments = req.files.attachments.map((f) => f.path);
  }

  return out;
};

/* --------------------------------------------
   Track Lesson Views
-------------------------------------------- */
const trackLessonView = async (userId, lessonId) => {
  try {
    if (!userId) return;

    await LessonView.findOrCreate({
      where: { user_id: userId, lesson_id: lessonId },
      defaults: { viewed_at: new Date() },
    });
  } catch {}
};

/* --------------------------------------------
   CREATE LESSON
-------------------------------------------- */
export const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, contentType, unitId, orderIndex, isPreview } =
      req.body;

    const course = await Course.findByPk(courseId);
    if (!course)
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });

    const uploads = extractUploadData(req);

    let order_index = orderIndex;
    if (!order_index) {
      const where = unitId
        ? { unit_id: unitId }
        : { course_id: courseId, unit_id: null };
      const last = await Lesson.findOne({
        where,
        order: [["order_index", "DESC"]],
      });

      order_index = last ? last.order_index + 1 : 1;
    }

    const lesson = await Lesson.create({
      title,
      content,
      course_id: courseId,
      unit_id: unitId || null,
      order_index,
      is_preview: Boolean(isPreview),
      content_type: uploads.content_type || contentType || "text",

      video_url: uploads.video_url || null,
      file_url: uploads.file_url || null,
      attachments: uploads.attachments || [],
    });

    res.status(201).json({ success: true, lesson });
  } catch (err) {
    console.error("Create lesson error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* --------------------------------------------
   GET LESSON BY ID
-------------------------------------------- */
export const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId, {
      include: [
        { model: Course, as: "course" },
        { model: Unit, as: "unit" },
      ],
    });

    if (!lesson)
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });

    trackLessonView(req.user?.id, lesson.id);

    res.json({ success: true, lesson });
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to fetch lesson" });
  }
};

/* --------------------------------------------
   UPDATE LESSON
-------------------------------------------- */
export const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId);
    if (!lesson)
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });

    const uploads = extractUploadData(req);
    const updates = {};

    // text fields
    ["title", "content", "unitId", "orderIndex", "isPreview"].forEach(
      (field) => {
        if (req.body[field] !== undefined) {
          updates[field === "unitId" ? "unit_id" : field] = req.body[field];
        }
      }
    );

    // Cloudinary uploaded files
    if (uploads.video_url) {
      updates.video_url = uploads.video_url;
      updates.content_type = "video";
      updates.file_url = null;
    }

    if (uploads.file_url) {
      updates.file_url = uploads.file_url;
      updates.content_type = "pdf";
      updates.video_url = null;
    }

    if (uploads.attachments) {
      updates.attachments = uploads.attachments;
    }

    await lesson.update(updates);

    res.json({ success: true, lesson });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

/* --------------------------------------------
   GET LESSONS FOR COURSE
-------------------------------------------- */
export const getLessonsByCourse = async (req, res) => {
  try {
    const lessons = await Lesson.findAll({
      where: { course_id: req.params.courseId },
      order: [["order_index", "ASC"]],
    });

    res.json({ success: true, lessons });
  } catch {
    res.status(500).json({ success: false, error: "Failed to load lessons" });
  }
};

/* --------------------------------------------
   GET PREVIEW LESSON
-------------------------------------------- */
export const getPreviewLessonForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    let lesson = await Lesson.findOne({
      where: { course_id: courseId, is_preview: true },
      order: [["order_index", "ASC"]],
    });

    if (!lesson) {
      lesson = await Lesson.findOne({
        where: { course_id: courseId },
        order: [["order_index", "ASC"]],
      });

      if (!lesson)
        return res
          .status(404)
          .json({ success: false, error: "No lessons found" });

      await lesson.update({ is_preview: true });
    }

    res.json({ success: true, lesson });
  } catch {
    res.status(500).json({
      success: false,
      error: "Failed to load preview lesson",
    });
  }
};
