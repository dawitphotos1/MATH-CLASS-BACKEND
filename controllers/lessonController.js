
// // controllers/lessonController.js
// import db from "../models/index.js";
// import path from "path";

// const { Lesson, Course, Unit, LessonView, Enrollment } = db;

// /* -----------------------------------------------------------
//    BACKEND URL RESOLVER
// ----------------------------------------------------------- */
// const getBackendUrl = () => {
//   if (process.env.BACKEND_URL)
//     return process.env.BACKEND_URL.replace(/\/+$/g, "");

//   const p = process.env.PORT || 5000;
//   return `http://localhost:${p}`;
// };

// /* -----------------------------------------------------------
//    NORMALIZATION HELPERS
// ----------------------------------------------------------- */
// const stripLeadingSlash = (p = "") => p.replace(/^\/+/, "");

// /* Critical Fix: Remove "Uploads/" from stored DB paths */
// const normalizePath = (p = "") =>
//   p.replace(/^Uploads\//i, "").replace(/^\/+/, "");

// /* -----------------------------------------------------------
//    Build Full URLs for video / pdf files
// ----------------------------------------------------------- */
// const buildFileUrls = (lesson) => {
//   if (!lesson) return null;

//   const data = lesson.toJSON ? lesson.toJSON() : { ...lesson };
//   const backend = getBackendUrl();

//   // Video
//   if (data.video_url && !data.video_url.startsWith("http")) {
//     const fixed = normalizePath(data.video_url);
//     data.video_url = `${backend}/api/v1/files/${fixed}`;
//   }

//   // PDF / FILE
//   if (data.file_url && !data.file_url.startsWith("http")) {
//     const fixed = normalizePath(data.file_url);
//     data.file_url = `${backend}/api/v1/files/${fixed}`;
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
//     console.warn("trackLessonView error:", err.message);
//   }
// };

// /* -----------------------------------------------------------
//    Handle File Uploads
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
//     if (!course)
//       return res.status(404).json({ success: false, error: "Course not found" });

//     const uploads = handleFileUploads(req);

//     let finalType = contentType || "text";
//     let file_path = uploads.file_url || null;
//     let video_path = uploads.video_url || videoUrl || null;

//     if (uploads.file_url) finalType = "pdf";
//     if (uploads.video_url) finalType = "video";

//     // Auto order indexing
//     let order_index = orderIndex;
//     if (!order_index) {
//       const where = unitId
//         ? { unit_id: unitId }
//         : { course_id: courseId, unit_id: null };
//       const last = await Lesson.findOne({
//         where,
//         order: [["order_index", "DESC"]],
//       });
//       order_index = last ? last.order_index + 1 : 1;
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
//       include: [
//         { model: Course, as: "course" },
//         { model: Unit, as: "unit" },
//       ],
//     });

//     return res.status(201).json({ success: true, lesson: buildFileUrls(full) });
//   } catch (err) {
//     console.error("createLesson error:", err);
//     return res.status(500).json({ success: false, error: err.message });
//   }
// };

// /* -----------------------------------------------------------
//    UPDATE LESSON
// ----------------------------------------------------------- */
// export const updateLesson = async (req, res) => {
//   try {
//     const { lessonId } = req.params;

//     const existing = await Lesson.findByPk(lessonId);
//     if (!existing)
//       return res.status(404).json({ success: false, error: "Lesson not found" });

//     const uploads = handleFileUploads(req);
//     const updates = {};

//     if (req.body.title !== undefined) updates.title = req.body.title;
//     if (req.body.content !== undefined) updates.content = req.body.content;
//     if (req.body.orderIndex !== undefined)
//       updates.order_index = req.body.orderIndex;
//     if (req.body.unitId !== undefined) updates.unit_id = req.body.unitId;
//     if (req.body.isPreview !== undefined)
//       updates.is_preview = req.body.isPreview;

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

//     // Manual content type
//     if (req.body.contentType)
//       updates.content_type = req.body.contentType;

//     // Video URL from textbox (if no file upload)
//     if (req.body.videoUrl && !uploads.video_url)
//       updates.video_url = req.body.videoUrl;

//     await existing.update(updates);

//     const updated = await Lesson.findByPk(lessonId, {
//       include: [
//         { model: Course, as: "course" },
//         { model: Unit, as: "unit" },
//       ],
//     });

//     return res.json({ success: true, lesson: buildFileUrls(updated) });
//   } catch (err) {
//     console.error("updateLesson error:", err);
//     return res.status(500).json({ success: false, error: err.message });
//   }
// };

// /* -----------------------------------------------------------
//    GET LESSON
// ----------------------------------------------------------- */
// export const getLessonById = async (req, res) => {
//   try {
//     const { lessonId } = req.params;

//     const lesson = await Lesson.findByPk(lessonId, {
//       include: [
//         { model: Course, as: "course" },
//         { model: Unit, as: "unit" },
//       ],
//     });

//     if (!lesson)
//       return res.status(404).json({ success: false, error: "Lesson not found" });

//     trackLessonView(req.user?.id, lessonId);

//     return res.json({ success: true, lesson: buildFileUrls(lesson) });
//   } catch (err) {
//     console.error("getLessonById error:", err);
//     return res.status(500).json({ success: false, error: err.message });
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

//     return res.json({
//       success: true,
//       lessons: lessons.map(buildFileUrls),
//     });
//   } catch (err) {
//     console.error("getLessonsByCourse error:", err);
//     return res.status(500).json({ success: false, error: err.message });
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

//     return res.json({
//       success: true,
//       lessons: lessons.map(buildFileUrls),
//     });
//   } catch (err) {
//     console.error("getLessonsByUnit error:", err);
//     return res.status(500).json({ success: false, error: err.message });
//   }
// };

// /* -----------------------------------------------------------
//    DELETE LESSON
// ----------------------------------------------------------- */
// export const deleteLesson = async (req, res) => {
//   try {
//     const lesson = await Lesson.findByPk(req.params.lessonId);
//     if (!lesson)
//       return res.status(404).json({ success: false, error: "Lesson not found" });

//     await lesson.destroy();
//     return res.json({ success: true, message: "Lesson deleted" });
//   } catch (err) {
//     console.error("deleteLesson error:", err);
//     return res.status(500).json({ success: false, error: err.message });
//   }
// };





// controllers/lessonController.js
import db from "../models/index.js";
import path from "path";

const { Lesson, Course, Unit, LessonView, Enrollment } = db;

/* -----------------------------------------------------------
   BACKEND URL RESOLVER - FIXED FOR RENDER DEPLOYMENT
----------------------------------------------------------- */
const getBackendUrl = () => {
  // Priority 1: Explicit BACKEND_URL environment variable
  if (process.env.BACKEND_URL) {
    console.log("🔵 Using BACKEND_URL from env:", process.env.BACKEND_URL);
    return process.env.BACKEND_URL.replace(/\/+$/g, "");
  }

  // Priority 2: Render-specific environment variable
  if (process.env.RENDER_EXTERNAL_URL) {
    console.log("🔵 Using RENDER_EXTERNAL_URL:", process.env.RENDER_EXTERNAL_URL);
    return process.env.RENDER_EXTERNAL_URL.replace(/\/+$/g, "");
  }

  // Priority 3: In production mode, use Render default URL
  if (process.env.NODE_ENV === 'production') {
    console.log("⚡ Production mode - using Render URL");
    return 'https://mathe-class-website-backend-1.onrender.com';
  }

  // Only use localhost in development
  const p = process.env.PORT || 5000;
  console.log("🔵 Development mode - using localhost");
  return `http://localhost:${p}`;
};

/* -----------------------------------------------------------
   NORMALIZATION HELPERS
----------------------------------------------------------- */
const stripLeadingSlash = (p = "") => p.replace(/^\/+/, "");

/* Critical Fix: Remove "Uploads/" from stored DB paths */
const normalizePath = (p = "") =>
  p.replace(/^Uploads\//i, "").replace(/^\/+/, "");

/* -----------------------------------------------------------
   Build Full URLs for video / pdf files
----------------------------------------------------------- */
const buildFileUrls = (lesson) => {
  if (!lesson) return null;

  const data = lesson.toJSON ? lesson.toJSON() : { ...lesson };
  const backend = getBackendUrl();

  console.log("🔄 Building file URLs with backend:", backend);

  // Video
  if (data.video_url && !data.video_url.startsWith("http")) {
    const fixed = normalizePath(data.video_url);
    data.video_url = `${backend}/api/v1/files/${fixed}`;
    console.log("🎬 Built video URL:", data.video_url);
  } else if (data.video_url && data.video_url.includes("localhost")) {
    console.warn("⚠️ Video URL contains localhost:", data.video_url);
    // Fix localhost URLs in production
    if (process.env.NODE_ENV === 'production') {
      const fixed = normalizePath(data.video_url.replace('http://localhost:5000/', ''));
      data.video_url = `${backend}/api/v1/files/${fixed}`;
      console.log("🔄 Fixed video URL:", data.video_url);
    }
  }

  // PDF / FILE
  if (data.file_url && !data.file_url.startsWith("http")) {
    const fixed = normalizePath(data.file_url);
    data.file_url = `${backend}/api/v1/files/${fixed}`;
    console.log("📄 Built file URL:", data.file_url);
  } else if (data.file_url && data.file_url.includes("localhost")) {
    console.warn("⚠️ File URL contains localhost:", data.file_url);
    // Fix localhost URLs in production
    if (process.env.NODE_ENV === 'production') {
      const fixed = normalizePath(data.file_url.replace('http://localhost:5000/', ''));
      data.file_url = `${backend}/api/v1/files/${fixed}`;
      console.log("🔄 Fixed file URL:", data.file_url);
    }
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
    console.warn("trackLessonView error:", err.message);
  }
};

/* -----------------------------------------------------------
   Handle File Uploads
----------------------------------------------------------- */
const handleFileUploads = (req) => {
  const out = {};

  if (req.files?.video?.[0]) out.video_url = req.files.video[0].filename;
  if (req.files?.pdf?.[0]) out.file_url = req.files.pdf[0].filename;
  if (req.files?.file?.[0]) out.file_url = req.files.file[0].filename;

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
    if (!course)
      return res.status(404).json({ success: false, error: "Course not found" });

    const uploads = handleFileUploads(req);

    let finalType = contentType || "text";
    let file_path = uploads.file_url || null;
    let video_path = uploads.video_url || videoUrl || null;

    if (uploads.file_url) finalType = "pdf";
    if (uploads.video_url) finalType = "video";

    // Auto order indexing
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
      content_type: finalType,
      video_url: video_path,
      file_url: file_path,
      is_preview: Boolean(isPreview),
    });

    const full = await Lesson.findByPk(lesson.id, {
      include: [
        { model: Course, as: "course" },
        { model: Unit, as: "unit" },
      ],
    });

    return res.status(201).json({ success: true, lesson: buildFileUrls(full) });
  } catch (err) {
    console.error("createLesson error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* -----------------------------------------------------------
   UPDATE LESSON
----------------------------------------------------------- */
export const updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const existing = await Lesson.findByPk(lessonId);
    if (!existing)
      return res.status(404).json({ success: false, error: "Lesson not found" });

    const uploads = handleFileUploads(req);
    const updates = {};

    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.content !== undefined) updates.content = req.body.content;
    if (req.body.orderIndex !== undefined)
      updates.order_index = req.body.orderIndex;
    if (req.body.unitId !== undefined) updates.unit_id = req.body.unitId;
    if (req.body.isPreview !== undefined)
      updates.is_preview = req.body.isPreview;

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

    // Manual content type
    if (req.body.contentType)
      updates.content_type = req.body.contentType;

    // Video URL from textbox (if no file upload)
    if (req.body.videoUrl && !uploads.video_url)
      updates.video_url = req.body.videoUrl;

    await existing.update(updates);

    const updated = await Lesson.findByPk(lessonId, {
      include: [
        { model: Course, as: "course" },
        { model: Unit, as: "unit" },
      ],
    });

    return res.json({ success: true, lesson: buildFileUrls(updated) });
  } catch (err) {
    console.error("updateLesson error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* -----------------------------------------------------------
   GET LESSON
----------------------------------------------------------- */
export const getLessonById = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        { model: Course, as: "course" },
        { model: Unit, as: "unit" },
      ],
    });

    if (!lesson)
      return res.status(404).json({ success: false, error: "Lesson not found" });

    trackLessonView(req.user?.id, lessonId);

    return res.json({ success: true, lesson: buildFileUrls(lesson) });
  } catch (err) {
    console.error("getLessonById error:", err);
    return res.status(500).json({ success: false, error: err.message });
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

    return res.json({
      success: true,
      lessons: lessons.map(buildFileUrls),
    });
  } catch (err) {
    console.error("getLessonsByCourse error:", err);
    return res.status(500).json({ success: false, error: err.message });
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

    return res.json({
      success: true,
      lessons: lessons.map(buildFileUrls),
    });
  } catch (err) {
    console.error("getLessonsByUnit error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

/* -----------------------------------------------------------
   DELETE LESSON
----------------------------------------------------------- */
export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId);
    if (!lesson)
      return res.status(404).json({ success: false, error: "Lesson not found" });

    await lesson.destroy();
    return res.json({ success: true, message: "Lesson deleted" });
  } catch (err) {
    console.error("deleteLesson error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};