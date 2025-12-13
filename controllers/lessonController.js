// controllers/lessonController.js
import db from "../models/index.js";
import { v2 as cloudinary } from "cloudinary";

const { Lesson, Course } = db;

/* -------------------------
   Cloudinary config (SAFE)
------------------------- */
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
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
   CRUD — LESSON
------------------------- */

// GET /lessons/:id
export const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson)
      return res.status(404).json({ success: false, error: "Lesson not found" });

    res.json({ success: true, lesson: buildFileUrls(lesson) });
  } catch {
    res.status(500).json({ success: false, error: "Failed to load lesson" });
  }
};

// POST /course/:courseId/lessons
export const createLesson = async (req, res) => {
  try {
    const lesson = await Lesson.create({
      ...req.body,
      course_id: req.params.courseId,
    });

    res.status(201).json({
      success: true,
      lesson: buildFileUrls(lesson),
    });
  } catch {
    res.status(500).json({ success: false, error: "Create lesson failed" });
  }
};

// PUT /lessons/:lessonId
export const updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId);
    if (!lesson)
      return res.status(404).json({ success: false, error: "Lesson not found" });

    await lesson.update(req.body);

    res.json({
      success: true,
      lesson: buildFileUrls(lesson),
    });
  } catch {
    res.status(500).json({ success: false, error: "Update lesson failed" });
  }
};

// DELETE /lessons/:lessonId
export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId);
    if (!lesson)
      return res.status(404).json({ success: false, error: "Lesson not found" });

    await lesson.destroy();
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false, error: "Delete lesson failed" });
  }
};

/* -------------------------
   LISTING
------------------------- */

// GET lessons by unit
export const getLessonsByUnit = async (req, res) => {
  try {
    const lessons = await Lesson.findAll({
      where: { unit_id: req.params.unitId },
      order: [["order_index", "ASC"]],
    });

    res.json({
      success: true,
      lessons: lessons.map(buildFileUrls),
    });
  } catch {
    res
      .status(500)
      .json({ success: false, error: "Failed to load unit lessons" });
  }
};

// ✅ GET lessons by course (FIXED)
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
    });
  } catch {
    res
      .status(500)
      .json({ success: false, error: "Failed to load course lessons" });
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

    if (!lesson)
      return res
        .status(404)
        .json({ success: false, error: "No lessons found" });

    const course = await Course.findByPk(req.params.courseId, {
      attributes: ["id", "title", "slug"],
    });

    res.json({
      success: true,
      lesson: buildFileUrls(lesson),
      course,
    });
  } catch {
    res
      .status(500)
      .json({ success: false, error: "Preview lesson failed" });
  }
};

export const getPublicPreviewByLessonId = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId);
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
  } catch {
    res
      .status(500)
      .json({ success: false, error: "Public preview failed" });
  }
};

/* -------------------------
   DEBUG HELPERS
------------------------- */

export const debugLessonFile = async (req, res) => {
  res.json({ success: true, message: "debugLessonFile OK" });
};

export const fixLessonFileUrl = async (req, res) => {
  res.json({ success: true, message: "fixLessonFileUrl OK" });
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
  getLessonsByCourse, // ✅ REQUIRED
  getPreviewLessonForCourse,
  getPublicPreviewByLessonId,
  debugLessonFile,
  fixLessonFileUrl,
};
