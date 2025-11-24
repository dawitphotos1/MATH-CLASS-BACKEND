// controllers/lessonController.js
import db from "../models/index.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { Op } from "sequelize";

const { Lesson, Course, Unit, Enrollment, LessonView } = db;

// Helper to determine the backend URL for file serving
const getBackendUrl = () => {
  return process.env.BACKEND_URL || "https://mathe-class-website-backend-1.onrender.com";
};

/**
 * Build full file URLs for lesson content
 */
const buildFileUrls = (lesson) => {
  if (!lesson) return lesson;

  const lessonData = lesson.toJSON ? lesson.toJSON() : { ...lesson };
  const backendUrl = getBackendUrl();

  // Handle Video URL
  if (lessonData.video_url && !lessonData.video_url.startsWith("http")) {
    const cleanVideoUrl = lessonData.video_url.startsWith("/") 
      ? lessonData.video_url.substring(1) 
      : lessonData.video_url;
    lessonData.video_url = `${backendUrl}/api/v1/files/${cleanVideoUrl}`;
  }

  // Handle File URL (PDF/Document)
  if (lessonData.file_url && !lessonData.file_url.startsWith("http")) {
    const cleanFileUrl = lessonData.file_url.startsWith("/")
      ? lessonData.file_url.substring(1)
      : lessonData.file_url;
    lessonData.file_url = `${backendUrl}/api/v1/files/${cleanFileUrl}`;
  }

  return lessonData;
};

/**
 * Track lesson view for analytics
 */
const trackLessonView = async (userId, lessonId) => {
  try {
    if (LessonView) {
      await LessonView.findOrCreate({
        where: { user_id: userId, lesson_id: lessonId },
        defaults: { user_id: userId, lesson_id: lessonId, viewed_at: new Date() }
      });
    }
  } catch (error) {
    console.error('Error tracking lesson view:', error.message);
  }
};

/**
 * Handle file uploads and return paths
 */
const handleFileUploads = (req) => {
  const updatePaths = {};
  let fileUploaded = false;

  // Video Upload
  if (req.files?.video && req.files.video[0]) {
    const video = req.files.video[0];
    updatePaths.video_url = `Uploads/${video.filename}`;
    updatePaths.content_type = "video";
    fileUploaded = true;
  }

  // Document/PDF Upload
  if (req.files?.pdf && req.files.pdf[0]) {
    const pdfFile = req.files.pdf[0];
    updatePaths.file_url = `Uploads/${pdfFile.filename}`;
    updatePaths.content_type = "pdf";
    fileUploaded = true;
  } else if (req.files?.file && req.files.file[0]) {
    const file = req.files.file[0];
    updatePaths.file_url = `Uploads/${file.filename}`;
    updatePaths.content_type = "pdf";
    fileUploaded = true;
  }

  // Clear other path if one is uploaded
  if (fileUploaded) {
    if (updatePaths.video_url) {
      updatePaths.file_url = null;
    } else if (updatePaths.file_url) {
      updatePaths.video_url = null;
    }
  }

  return updatePaths;
};

// Lesson Creation
export const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, content, contentType, orderIndex, videoUrl, unitId, isPreview } = req.body;

    // Verify course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: `Course with ID ${courseId} not found`,
      });
    }

    // Check authorization
    if (req.user.role !== "admin" && course.teacher_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to create lessons for this course",
      });
    }

    // File Handling
    const filePaths = handleFileUploads(req);
    let videoPath = filePaths.video_url || videoUrl || null;
    let fileUrl = filePaths.file_url || null;
    let finalContentType = filePaths.content_type || contentType || "text";

    // If no file was uploaded, check if the videoUrl provided is a direct link
    if (!fileUrl && !videoPath && videoUrl) {
      videoPath = videoUrl;
      finalContentType = finalContentType === "text" ? "video" : finalContentType;
    }

    // Get order index
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
    }

    // Create lesson
    const lesson = await Lesson.create({
      course_id: courseId,
      unit_id: unitId || null,
      title: title.trim(),
      content: (content || "").trim(),
      video_url: videoPath,
      file_url: fileUrl,
      order_index: orderIndexValue,
      content_type: finalContentType,
      is_preview: isPreview || false,
    });

    // Fetch complete lesson with associations
    const completeLesson = await Lesson.findByPk(lesson.id, {
      include: [
        { model: Course, as: "course", attributes: ["id", "title", "teacher_id"] },
        { model: Unit, as: "unit", attributes: ["id", "title"] },
      ],
    });

    const lessonResponse = buildFileUrls(completeLesson);

    res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      lesson: lessonResponse,
    });
  } catch (error) {
    console.error("Error creating lesson:", error);
    
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
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Lesson Update
export const updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, content, contentType, orderIndex, videoUrl, unitId, isPreview } = req.body;

    // Check existence and prevent editing unit headers
    const lessonCheck = await Lesson.findByPk(lessonId, {
      attributes: ["id", "content_type", "title", "course_id", "video_url", "file_url"],
    });

    if (!lessonCheck) {
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }

    if (lessonCheck.content_type === "unit_header") {
      return res.status(400).json({
        success: false,
        error: "Unit headers cannot be edited through this interface.",
      });
    }

    // Find the lesson with course information for authorization
    const lesson = await Lesson.findByPk(lessonId, {
      include: [{ model: Course, as: "course", attributes: ["id", "title", "teacher_id"] }],
    });

    if (req.user.role !== "admin" && lesson.course.teacher_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this lesson",
      });
    }

    // Handle File Uploads and Path Updates
    const filePaths = handleFileUploads(req);

    // Prepare update data
    const updateData = {};

    // Basic text fields
    if (title !== undefined && title !== null) updateData.title = title.trim();
    if (content !== undefined && content !== null) updateData.content = content;
    if (orderIndex !== undefined && orderIndex !== null) updateData.order_index = parseInt(orderIndex);
    if (unitId !== undefined && unitId !== null) updateData.unit_id = unitId;
    if (isPreview !== undefined) updateData.is_preview = Boolean(isPreview);

    // Set Final Video/File URLs and Content Type
    let finalContentType = lessonCheck.content_type;

    // Apply file upload paths
    if (filePaths.file_url !== undefined) {
      updateData.file_url = filePaths.file_url;
      finalContentType = filePaths.content_type;
    }
    if (filePaths.video_url !== undefined) {
      updateData.video_url = filePaths.video_url;
      finalContentType = filePaths.content_type;
    }

    // If no file was uploaded, check for external URL update
    if (videoUrl !== undefined && videoUrl !== null && !filePaths.video_url) {
      updateData.video_url = videoUrl;
      finalContentType = "video";
      updateData.file_url = null;
    }

    // Explicit content type from form
    if (contentType !== undefined && contentType !== null && contentType !== "") {
      finalContentType = contentType;
    }
    updateData.content_type = finalContentType;

    // Perform Update
    const [affectedRows] = await Lesson.update(updateData, { where: { id: lessonId } });

    if (affectedRows === 0) {
      return res.status(500).json({
        success: false,
        error: "Failed to update lesson - no changes made",
      });
    }

    // Fetch the complete updated lesson
    const updatedLesson = await Lesson.findByPk(lessonId, {
      include: [
        { model: Course, as: "course", attributes: ["id", "title", "teacher_id"] },
        { model: Unit, as: "unit", attributes: ["id", "title"] },
      ],
    });

    if (!updatedLesson) {
      return res.status(500).json({
        success: false,
        error: "Lesson updated but failed to fetch updated data",
      });
    }

    const lessonResponse = buildFileUrls(updatedLesson);

    res.json({
      success: true,
      message: "Lesson updated successfully",
      lesson: lessonResponse,
    });
  } catch (error) {
    console.error("ERROR updating lesson:", error);
    
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
      error: "Failed to update lesson",
      details: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    });
  }
};

// Get lessons by course
export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.findAll({
      where: { course_id: courseId },
      order: [["order_index", "ASC"]],
      include: [{ model: Unit, as: "unit", attributes: ["id", "title"] }],
    });

    const lessonsWithUrls = lessons.map(lesson => buildFileUrls(lesson));

    res.json({ success: true, lessons: lessonsWithUrls });
  } catch (error) {
    console.error("Error fetching lessons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lessons",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get lesson by ID with view tracking
export const getLessonById = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        { model: Course, as: "course", attributes: ["id", "title", "teacher_id"] },
        { model: Unit, as: "unit", attributes: ["id", "title"] },
      ],
    });

    if (!lesson) {
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }

    // Track lesson view
    await trackLessonView(userId, lessonId);

    const lessonWithUrls = buildFileUrls(lesson);

    res.json({ success: true, lesson: lessonWithUrls });
  } catch (error) {
    console.error("Error fetching lesson:", error);
    res.status(500).json({ success: false, error: "Failed to fetch lesson" });
  }
};

// Get regular lessons (excluding unit headers)
export const getRegularLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.findAll({
      where: { course_id: courseId, content_type: { [Op.ne]: 'unit_header' } },
      order: [["order_index", "ASC"]],
    });

    const lessonsWithUrls = lessons.map(lesson => buildFileUrls(lesson));

    res.json({ success: true, lessons: lessonsWithUrls });
  } catch (error) {
    console.error("Error fetching regular lessons:", error);
    res.status(500).json({ success: false, error: "Failed to fetch lessons" });
  }
};

// Get lessons by unit
export const getLessonsByUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    const lessons = await Lesson.findAll({
      where: { unit_id: unitId },
      order: [["order_index", "ASC"]],
    });

    const lessonsWithUrls = lessons.map(lesson => buildFileUrls(lesson));

    res.json({ success: true, lessons: lessonsWithUrls });
  } catch (error) {
    console.error("Error fetching unit lessons:", error);
    res.status(500).json({ success: false, error: "Failed to fetch lessons" });
  }
};

// Delete lesson
export const deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Find the lesson with course info
    const lesson = await Lesson.findByPk(lessonId, {
      include: [{ model: Course, as: "course", attributes: ["id", "title", "teacher_id"] }],
    });

    if (!lesson) {
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }

    // Check authorization
    if (userRole !== "admin" && lesson.course.teacher_id !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this lesson",
      });
    }

    // Prevent deletion of unit headers
    if (lesson.content_type === "unit_header") {
      return res.status(400).json({
        success: false,
        error: "Unit headers cannot be deleted",
      });
    }

    await lesson.destroy();

    res.json({ success: true, message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Error deleting lesson:", error);
    res.status(500).json({ success: false, error: "Failed to delete lesson" });
  }
};

// Debug routes
export const debugGetLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId, {
      attributes: ["id", "title", "content_type", "file_url", "video_url", "course_id", "unit_id"],
    });
    
    if (!lesson) {
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }
    
    const lessonWithUrls = buildFileUrls(lesson);
    
    res.json({
      success: true,
      original_lesson: lesson.toJSON(),
      processed_lesson: lessonWithUrls,
      backend_url: getBackendUrl(),
    });
  } catch (error) {
    console.error("DEBUG error in debugGetLesson:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const debugCheckFile = async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(process.cwd(), "Uploads", filename);
  const fileExists = fs.existsSync(filePath);

  res.json({
    success: true,
    filename: filename,
    path: filePath,
    exists: fileExists,
  });
};

export const debugFileUrl = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId);
    
    if (!lesson) {
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }
    
    const lessonWithUrls = buildFileUrls(lesson);
    
    res.json({
      success: true,
      lessonId: req.params.lessonId,
      stored_file_url: lesson.file_url,
      stored_video_url: lesson.video_url,
      processed_file_url: lessonWithUrls.file_url,
      processed_video_url: lessonWithUrls.video_url,
      backend_url: getBackendUrl(),
    });
  } catch (error) {
    console.error("DEBUG error in debugFileUrl:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const debugLessonType = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId, {
      attributes: ["id", "title", "content_type"],
    });
    
    if (!lesson) {
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }
    
    res.json({
      success: true,
      lessonId: req.params.lessonId,
      content_type: lesson.content_type,
    });
  } catch (error) {
    console.error("DEBUG error in debugLessonType:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};