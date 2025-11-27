// controllers/lessonController.js
import db from "../models/index.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { Op } from "sequelize";

const { Lesson, Course, Unit, LessonView } = db;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Determine backend URL for file serving.
 * Use BACKEND_URL env var if set, otherwise default to Render hostname.
 */
const getBackendUrl = () => {
  return process.env.BACKEND_URL || "https://mathe-class-website-backend-1.onrender.com";
};

/**
 * Build absolute file/video URLs for lesson content.
 * Leaves absolute URLs untouched.
 */
const buildFileUrls = (lesson) => {
  if (!lesson) return null;
  const data = lesson.toJSON ? lesson.toJSON() : { ...lesson };
  const backend = getBackendUrl();

  const clean = (u) => (u.startsWith("/") ? u.substring(1) : u);

  if (data.video_url && !data.video_url.startsWith("http")) {
    data.video_url = `${backend}/api/v1/files/${clean(data.video_url)}`;
  }
  if (data.file_url && !data.file_url.startsWith("http")) {
    data.file_url = `${backend}/api/v1/files/${clean(data.file_url)}`;
  }

  return data;
};

/**
 * Track lesson view for analytics (idempotent).
 */
const trackLessonView = async (userId, lessonId) => {
  try {
    if (!userId) return;
    if (LessonView) {
      await LessonView.findOrCreate({
        where: { user_id: userId, lesson_id: lessonId },
        defaults: { user_id: userId, lesson_id: lessonId, viewed_at: new Date() }
      });
    }
  } catch (err) {
    console.error("Error tracking lesson view:", err.message);
  }
};

/**
 * Handle uploaded files from multer (uploadMiddleware).
 * Returns paths relative to Uploads/ directory (consistent with DB).
 */
const handleFileUploads = (req) => {
  const update = {};
  let fileUploaded = false;

  // video
  if (req.files?.video && req.files.video[0]) {
    const v = req.files.video[0];
    // multer should provide filename; store path relative to Uploads/
    update.video_url = `Uploads/${v.filename}`;
    update.content_type = "video";
    fileUploaded = true;
  }

  // pdf / file
  if (req.files?.pdf && req.files.pdf[0]) {
    const p = req.files.pdf[0];
    update.file_url = `Uploads/${p.filename}`;
    update.content_type = "pdf";
    fileUploaded = true;
  } else if (req.files?.file && req.files.file[0]) {
    const f = req.files.file[0];
    update.file_url = `Uploads/${f.filename}`;
    update.content_type = "pdf";
    fileUploaded = true;
  }

  // Ensure only one of file/video is set
  if (fileUploaded) {
    if (update.video_url) update.file_url = null;
    if (update.file_url) update.video_url = null;
  }

  return update;
};

/* CREATE LESSON */
export const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, contentType, orderIndex, videoUrl, unitId, isPreview } = req.body;

    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ success: false, error: `Course ${courseId} not found` });

    // authorization: teacher or admin checked by middleware

    const filePaths = handleFileUploads(req);
    let video_path = filePaths.video_url || videoUrl || null;
    let file_path = filePaths.file_url || null;
    let finalType = filePaths.content_type || contentType || "text";

    if (!file_path && !video_path && videoUrl) {
      video_path = videoUrl;
      finalType = finalType === "text" ? "video" : finalType;
    }

    // calculate order index if missing
    let order_index = orderIndex;
    if (order_index === undefined || order_index === null) {
      const where = unitId ? { unit_id: unitId } : { course_id: courseId, unit_id: null };
      const last = await Lesson.findOne({ where, order: [["order_index", "DESC"]] });
      order_index = last ? last.order_index + 1 : 1;
    }

    const lesson = await Lesson.create({
      course_id: courseId,
      unit_id: unitId || null,
      title: (title || "").trim(),
      content: (content || "").trim(),
      video_url: video_path,
      file_url: file_path,
      order_index,
      content_type: finalType,
      is_preview: Boolean(isPreview),
    });

    const fetched = await Lesson.findByPk(lesson.id, {
      include: [
        { model: Course, as: "course", attributes: ["id", "title", "teacher_id"] },
        { model: Unit, as: "unit", attributes: ["id", "title"] },
      ],
    });

    const response = buildFileUrls(fetched);
    res.status(201).json({ success: true, message: "Lesson created", lesson: response });
  } catch (error) {
    console.error("Error creating lesson:", error);
    if (error.name === "SequelizeValidationError") {
      const details = error.errors.map(e => ({ field: e.path, message: e.message }));
      return res.status(400).json({ success: false, error: "Validation failed", details });
    }
    res.status(500).json({ success: false, error: "Failed to create lesson", details: process.env.NODE_ENV === "development" ? error.message : undefined });
  }
};

/* UPDATE LESSON */
export const updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, content, contentType, orderIndex, videoUrl, unitId, isPreview } = req.body;

    const existing = await Lesson.findByPk(lessonId, { attributes: ["id", "content_type", "course_id", "video_url", "file_url"] });
    if (!existing) return res.status(404).json({ success: false, error: "Lesson not found" });
    if (existing.content_type === "unit_header") return res.status(400).json({ success: false, error: "Unit headers cannot be edited here." });

    const lesson = await Lesson.findByPk(lessonId, { include: [{ model: Course, as: "course", attributes: ["id", "teacher_id"] }] });

    // authorization checked by middleware; double-check teacher owns course when not admin
    // (middleware ensures teacher or admin already)

    const filePaths = handleFileUploads(req);
    const updateData = {};

    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content;
    if (orderIndex !== undefined) updateData.order_index = parseInt(orderIndex);
    if (unitId !== undefined) updateData.unit_id = unitId;
    if (isPreview !== undefined) updateData.is_preview = Boolean(isPreview);

    let finalType = existing.content_type;

    if (filePaths.file_url !== undefined) {
      updateData.file_url = filePaths.file_url;
      finalType = filePaths.content_type;
      updateData.video_url = null;
    }
    if (filePaths.video_url !== undefined) {
      updateData.video_url = filePaths.video_url;
      finalType = filePaths.content_type;
      updateData.file_url = null;
    }

    if (!filePaths.video_url && videoUrl) {
      updateData.video_url = videoUrl;
      finalType = "video";
      updateData.file_url = null;
    }

    if (contentType) finalType = contentType;
    updateData.content_type = finalType;

    const [affected] = await Lesson.update(updateData, { where: { id: lessonId } });
    if (affected === 0) return res.status(500).json({ success: false, error: "No changes applied" });

    const updated = await Lesson.findByPk(lessonId, {
      include: [
        { model: Course, as: "course", attributes: ["id", "title", "teacher_id"] },
        { model: Unit, as: "unit", attributes: ["id", "title"] },
      ],
    });

    res.json({ success: true, message: "Lesson updated", lesson: buildFileUrls(updated) });
  } catch (error) {
    console.error("ERROR updating lesson:", error);
    if (error.name === "SequelizeValidationError") {
      const details = error.errors.map(e => ({ field: e.path, message: e.message }));
      return res.status(400).json({ success: false, error: "Validation failed", details });
    }
    res.status(500).json({ success: false, error: "Failed to update lesson", details: process.env.NODE_ENV === "development" ? error.message : undefined });
  }
};

/* GET LESSONS BY COURSE */
export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.findAll({
      where: { course_id: courseId },
      order: [["order_index", "ASC"]],
      include: [{ model: Unit, as: "unit", attributes: ["id", "title"] }],
    });
    res.json({ success: true, lessons: lessons.map(l => buildFileUrls(l)) });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({ success: false, message: "Failed to fetch lessons", error: process.env.NODE_ENV === "development" ? error.message : undefined });
  }
};

/* GET REGULAR LESSONS (exclude unit headers) */
export const getRegularLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.findAll({
      where: { course_id: courseId, content_type: { [Op.ne]: "unit_header" } },
      order: [["order_index", "ASC"]],
    });
    res.json({ success: true, lessons: lessons.map(l => buildFileUrls(l)) });
  } catch (error) {
    console.error("Error fetching regular lessons:", error);
    res.status(500).json({ success: false, error: "Failed to fetch lessons" });
  }
};

/* GET LESSONS BY UNIT */
export const getLessonsByUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    const lessons = await Lesson.findAll({
      where: { unit_id: unitId },
      order: [["order_index", "ASC"]],
    });
    res.json({ success: true, lessons: lessons.map(l => buildFileUrls(l)) });
  } catch (error) {
    console.error("Error fetching unit lessons:", error);
    res.status(500).json({ success: false, error: "Failed to fetch lessons" });
  }
};

/* GET LESSON BY ID (with view tracking) */
export const getLessonById = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user?.id || null;

    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        { model: Course, as: "course", attributes: ["id", "title", "teacher_id"] },
        { model: Unit, as: "unit", attributes: ["id", "title"] },
      ],
    });

    if (!lesson) return res.status(404).json({ success: false, error: "Lesson not found" });

    // Track view (non-blocking)
    trackLessonView(userId, lessonId).catch(() => {});

    res.json({ success: true, lesson: buildFileUrls(lesson) });
  } catch (error) {
    console.error("Error fetching lesson:", error);
    res.status(500).json({ success: false, error: "Failed to fetch lesson" });
  }
};

/* DELETE LESSON */
export const deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const lesson = await Lesson.findByPk(lessonId, {
      include: [{ model: Course, as: "course", attributes: ["id", "title", "teacher_id"] }],
    });

    if (!lesson) return res.status(404).json({ success: false, error: "Lesson not found" });
    if (lesson.content_type === "unit_header") return res.status(400).json({ success: false, error: "Unit headers cannot be deleted" });

    // Authorization assumed handled by middleware

    await lesson.destroy();
    res.json({ success: true, message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    res.status(500).json({ success: false, error: "Failed to delete lesson" });
  }
};

/* DEBUG ROUTES */
export const debugGetLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId, {
      attributes: ["id", "title", "content_type", "file_url", "video_url", "course_id", "unit_id"],
    });
    if (!lesson) return res.status(404).json({ success: false, error: "Lesson not found" });
    res.json({ success: true, original_lesson: lesson.toJSON(), processed_lesson: buildFileUrls(lesson), backend_url: getBackendUrl() });
  } catch (error) {
    console.error("DEBUG error in debugGetLesson:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const debugCheckFile = async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(process.cwd(), "Uploads", filename);
  const fileExists = fs.existsSync(filePath);
  res.json({ success: true, filename, path: filePath, exists: fileExists });
};

export const debugFileUrl = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId);
    if (!lesson) return res.status(404).json({ success: false, error: "Lesson not found" });
    const lessonWithUrls = buildFileUrls(lesson);
    res.json({ success: true, lessonId: req.params.lessonId, stored_file_url: lesson.file_url, stored_video_url: lesson.video_url, processed_file_url: lessonWithUrls.file_url, processed_video_url: lessonWithUrls.video_url, backend_url: getBackendUrl() });
  } catch (error) {
    console.error("DEBUG error in debugFileUrl:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const debugLessonType = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId, { attributes: ["id", "title", "content_type"] });
    if (!lesson) return res.status(404).json({ success: false, error: "Lesson not found" });
    res.json({ success: true, lessonId: req.params.lessonId, content_type: lesson.content_type });
  } catch (error) {
    console.error("DEBUG error in debugLessonType:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


