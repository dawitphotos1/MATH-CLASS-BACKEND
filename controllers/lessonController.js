// controllers/lessonController.js 
import db from "../models/index.js";
import path from "path";
import { v2 as cloudinary } from 'cloudinary';

const { Lesson, Course, Unit, LessonView, Enrollment, User, sequelize } = db;

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
    if (!url) return null; // Return null instead of undefined
    
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
  
  if (req.files?.video?.[0]) {
    const file = req.files.video[0];
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
   GET LESSON BY ID - FIXED (Main Issue)
----------------------------------------------------------- */
export const getLessonById = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { lessonId } = req.params;
    
    console.log(`📖 Fetching lesson ${lessonId} for user ${req.user?.id || 'anonymous'}`);
    
    // Validate lessonId
    if (!lessonId || isNaN(parseInt(lessonId))) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        error: "Valid lesson ID is required" 
      });
    }

    const lesson = await Lesson.findByPk(parseInt(lessonId), {
      include: [
        { 
          model: Course, 
          as: "course", 
          attributes: ["id", "title", "teacher_id", "slug"] 
        }, 
        { 
          model: Unit, 
          as: "unit", 
          attributes: ["id", "title"] 
        }
      ],
      transaction
    });
    
    if (!lesson) {
      await transaction.rollback();
      console.log(`❌ Lesson ${lessonId} not found in database`);
      
      // Try to find any lesson in the same course
      const courseId = req.query.courseId;
      if (courseId) {
        const alternativeLesson = await Lesson.findOne({
          where: { course_id: parseInt(courseId) },
          order: [["order_index", "ASC"]],
          transaction
        });
        
        if (alternativeLesson) {
          console.log(`💡 Found alternative lesson ${alternativeLesson.id} in course ${courseId}`);
          return res.status(404).json({
            success: false,
            error: `Lesson ${lessonId} not found. Did you mean lesson ${alternativeLesson.id}?`,
            alternative: {
              id: alternativeLesson.id,
              title: alternativeLesson.title
            }
          });
        }
      }
      
      return res.status(404).json({ 
        success: false, 
        error: "Lesson not found. The lesson may have been deleted or doesn't exist." 
      });
    }

    // Check access permissions
    let hasAccess = false;
    let accessReason = "";
    
    if (req.user) {
      // Admins have full access
      if (req.user.role === "admin") {
        hasAccess = true;
        accessReason = "admin_access";
      }
      // Teachers can access their own course lessons
      else if (req.user.role === "teacher" && lesson.course?.teacher_id === req.user.id) {
        hasAccess = true;
        accessReason = "teacher_owner";
      }
      // Students need to be enrolled or it must be a preview lesson
      else if (req.user.role === "student") {
        if (lesson.is_preview) {
          hasAccess = true;
          accessReason = "preview_lesson";
        } else {
          const enrollment = await Enrollment.findOne({
            where: { 
              user_id: req.user.id, 
              course_id: lesson.course_id,
              approval_status: "approved" 
            },
            transaction
          });
          
          if (enrollment) {
            hasAccess = true;
            accessReason = "enrolled_student";
          } else {
            accessReason = "not_enrolled";
          }
        }
      }
    } else {
      // Public access only for preview lessons
      hasAccess = lesson.is_preview;
      accessReason = lesson.is_preview ? "public_preview" : "requires_login";
    }

    if (!hasAccess) {
      await transaction.rollback();
      console.log(`🔒 Access denied for lesson ${lessonId}: ${accessReason}`);
      
      return res.status(403).json({
        success: false,
        error: accessReason === "requires_login" 
          ? "Please log in to access this lesson"
          : "You don't have permission to access this lesson",
        requiresLogin: accessReason === "requires_login",
        canPreview: lesson.is_preview
      });
    }

    // Track view for authenticated users
    if (req.user?.id) {
      await trackLessonView(req.user.id, lesson.id);
    }

    const lessonData = buildFileUrls(lesson);
    
    await transaction.commit();
    
    console.log(`✅ Successfully loaded lesson ${lessonId}: "${lesson.title}"`);
    console.log(`   Access: ${accessReason}, Type: ${lesson.content_type}`);
    
    return res.json({ 
      success: true, 
      lesson: lessonData,
      access: {
        role: req.user?.role,
        isPreview: lesson.is_preview,
        hasAccess: true,
        reason: accessReason
      }
    });
    
  } catch (err) {
    await transaction.rollback();
    
    console.error("❌ getLessonById error:", {
      message: err.message,
      stack: err.stack,
      lessonId: req.params.lessonId,
      userId: req.user?.id
    });
    
    // Handle specific errors
    if (err.name === 'SequelizeDatabaseError') {
      return res.status(500).json({
        success: false,
        error: "Database error. Please check if the lesson exists.",
        details: process.env.NODE_ENV === "development" ? err.message : undefined
      });
    }
    
    return res.status(500).json({
      success: false,
      error: "Failed to load lesson",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

/* -----------------------------------------------------------
   GET PREVIEW LESSON FOR A COURSE (public) - FIXED
----------------------------------------------------------- */
export const getPreviewLessonForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    console.log(`🔍 Looking for preview lesson for course ${courseId}`);
    
    // Validate courseId
    if (!courseId || isNaN(parseInt(courseId))) {
      return res.status(400).json({ 
        success: false, 
        error: "Valid course ID is required" 
      });
    }

    const course = await Course.findByPk(parseInt(courseId), { 
      attributes: ["id", "title", "slug", "teacher_id"] 
    });
    
    if (!course) {
      console.log(`❌ Course ${courseId} not found`);
      return res.status(404).json({ 
        success: false, 
        error: "Course not found" 
      });
    }

    // First, try to find any lesson marked as preview
    let lesson = await Lesson.findOne({
      where: { 
        course_id: parseInt(courseId), 
        is_preview: true 
      },
      order: [["order_index", "ASC"]],
      include: [
        { model: Course, as: "course", attributes: ["id", "title", "slug"] }
      ],
    });

    // If no preview lesson, get the first lesson
    if (!lesson) {
      console.log(`ℹ️ No preview lesson found for course ${courseId}, getting first lesson`);
      
      lesson = await Lesson.findOne({
        where: { course_id: parseInt(courseId) },
        order: [["order_index", "ASC"]],
        include: [
          { model: Course, as: "course", attributes: ["id", "title", "slug"] }
        ],
      });
      
      if (!lesson) {
        const lessonCount = await Lesson.count({ where: { course_id: parseInt(courseId) } });
        console.log(`❌ No lessons found for course ${courseId}, total: ${lessonCount}`);
        
        return res.status(404).json({
          success: false,
          error: "No lessons found for this course",
          lessonCount,
        });
      }
    }

    const lessonData = buildFileUrls(lesson);
    
    console.log(`✅ Preview lesson found: ${lesson.id} - "${lesson.title}"`);
    
    return res.json({
      success: true,
      lesson: lessonData,
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug
      },
      access: "public",
      isPreview: lesson.is_preview,
      timestamp: new Date().toISOString(),
    });
    
  } catch (err) {
    console.error("❌ getPreviewLessonForCourse error:", {
      message: err.message,
      stack: err.stack,
      courseId: req.params.courseId
    });
    
    return res.status(500).json({
      success: false,
      error: "Failed to load preview lesson",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
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

    // Validate lessonId
    if (!lessonId || isNaN(parseInt(lessonId))) {
      return res.status(400).json({ 
        success: false, 
        error: "Valid lesson ID is required" 
      });
    }

    const lesson = await Lesson.findByPk(parseInt(lessonId), {
      include: [
        { 
          model: Course, 
          as: "course", 
          attributes: ["id", "title", "slug"] 
        }
      ],
    });

    if (!lesson) {
      console.log(`❌ Lesson ${lessonId} not found`);
      return res.status(404).json({
        success: false,
        error: "Preview lesson not found",
      });
    }

    // Check if this is a preview lesson
    if (!lesson.is_preview) {
      console.log(`⚠️ Lesson ${lessonId} is not marked as preview`);
      
      // Check if user is logged in
      if (!req.user) {
        return res.status(403).json({
          success: false,
          error: "This lesson is not available for preview. Please enroll in the course or log in.",
          requiresLogin: true
        });
      }
    }

    const lessonData = buildFileUrls(lesson);
    
    console.log(`✅ Public preview served: "${lesson.title}"`);
    console.log(`   Course: ${lesson.course?.title}`);
    console.log(`   Is Preview: ${lesson.is_preview ? 'Yes' : 'No'}`);

    return res.json({
      success: true,
      lesson: lessonData,
      access: lesson.is_preview ? "public" : "restricted",
      message: lesson.is_preview ? "Public preview access granted" : "Access granted",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ getPublicPreviewByLessonId error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to load preview",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

/* -----------------------------------------------------------
   CREATE LESSON
----------------------------------------------------------- */
export const createLesson = async (req, res) => {
  const transaction = await sequelize.transaction();
  
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

    // Validate courseId
    if (!courseId || isNaN(parseInt(courseId))) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        error: "Valid course ID is required" 
      });
    }

    const course = await Course.findByPk(parseInt(courseId), { transaction });
    if (!course) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: "Course not found" });
    }

    const uploads = handleFileUploads(req);

    let finalType = contentType || "text";
    let file_path = uploads.file_url || null;
    let video_path = uploads.video_url || videoUrl || null;
    
    if (uploads.file_url) finalType = "pdf";
    if (uploads.video_url) finalType = "video";

    // Auto order indexing
    let order_index = orderIndex;
    if (!order_index && order_index !== 0) {
      const where = unitId ? { unit_id: unitId } : { course_id: courseId, unit_id: null };
      const last = await Lesson.findOne({ 
        where, 
        order: [["order_index", "DESC"]],
        transaction
      });
      order_index = last ? (last.order_index || 0) + 1 : 1;
    }

    const lesson = await Lesson.create({
      title: title?.trim() || "Untitled Lesson",
      content: content || "",
      course_id: parseInt(courseId),
      unit_id: unitId || null,
      order_index,
      content_type: finalType,
      video_url: video_path,
      file_url: file_path,
      is_preview: Boolean(isPreview),
    }, { transaction });

    const full = await Lesson.findByPk(lesson.id, {
      include: [
        { model: Course, as: "course", attributes: ["id", "title"] }, 
        { model: Unit, as: "unit", attributes: ["id", "title"] }
      ],
      transaction
    });

    await transaction.commit();
    
    return res.status(201).json({ 
      success: true, 
      lesson: buildFileUrls(full),
      message: "Lesson created successfully"
    });
    
  } catch (err) {
    await transaction.rollback();
    
    console.error("❌ createLesson error:", {
      message: err.message,
      stack: err.stack,
      params: req.params,
      body: req.body
    });
    
    return res.status(500).json({ 
      success: false, 
      error: "Failed to create lesson",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

/* -----------------------------------------------------------
   UPDATE LESSON
----------------------------------------------------------- */
export const updateLesson = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { lessonId } = req.params;
    
    // Validate lessonId
    if (!lessonId || isNaN(parseInt(lessonId))) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        error: "Valid lesson ID is required" 
      });
    }

    const existing = await Lesson.findByPk(parseInt(lessonId), { transaction });
    if (!existing) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }

    const uploads = handleFileUploads(req);
    const updates = {};

    if (req.body.title !== undefined && req.body.title !== null) updates.title = req.body.title.trim();
    if (req.body.content !== undefined && req.body.content !== null) updates.content = req.body.content;
    if (req.body.orderIndex !== undefined && req.body.orderIndex !== null) updates.order_index = parseInt(req.body.orderIndex);
    if (req.body.unitId !== undefined && req.body.unitId !== null) updates.unit_id = req.body.unitId;
    if (req.body.isPreview !== undefined && req.body.isPreview !== null) updates.is_preview = Boolean(req.body.isPreview);

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

    await existing.update(updates, { transaction });

    const updated = await Lesson.findByPk(parseInt(lessonId), {
      include: [
        { model: Course, as: "course", attributes: ["id", "title"] }, 
        { model: Unit, as: "unit", attributes: ["id", "title"] }
      ],
      transaction
    });

    await transaction.commit();
    
    return res.json({ 
      success: true, 
      lesson: buildFileUrls(updated),
      message: "Lesson updated successfully"
    });
    
  } catch (err) {
    await transaction.rollback();
    
    console.error("❌ updateLesson error:", {
      message: err.message,
      stack: err.stack,
      lessonId: req.params.lessonId
    });
    
    return res.status(500).json({ 
      success: false, 
      error: "Failed to update lesson",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

/* -----------------------------------------------------------
   GET LESSONS BY COURSE
----------------------------------------------------------- */
export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Validate courseId
    if (!courseId || isNaN(parseInt(courseId))) {
      return res.status(400).json({ 
        success: false, 
        error: "Valid course ID is required" 
      });
    }

    const lessons = await Lesson.findAll({
      where: { course_id: parseInt(courseId) },
      order: [["order_index", "ASC"]],
      include: [
        { model: Unit, as: "unit", attributes: ["id", "title", "order_index"] }
      ],
    });
    
    return res.json({ 
      success: true, 
      lessons: lessons.map(buildFileUrls),
      count: lessons.length 
    });
  } catch (err) {
    console.error("❌ getLessonsByCourse error:", {
      message: err.message,
      stack: err.stack,
      courseId: req.params.courseId
    });
    return res.status(500).json({ 
      success: false, 
      error: "Failed to fetch lessons",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

/* -----------------------------------------------------------
   DELETE LESSON
----------------------------------------------------------- */
export const deleteLesson = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { lessonId } = req.params;
    
    // Validate lessonId
    if (!lessonId || isNaN(parseInt(lessonId))) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false, 
        error: "Valid lesson ID is required" 
      });
    }

    const lesson = await Lesson.findByPk(parseInt(lessonId), { transaction });
    if (!lesson) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }

    // Check authorization (teacher can only delete their own lessons)
    if (req.user) {
      const course = await Course.findByPk(lesson.course_id, { transaction });
      if (req.user.role === "teacher" && course.teacher_id !== req.user.id) {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          error: "You can only delete lessons from your own courses"
        });
      }
    }

    await lesson.destroy({ transaction });
    
    await transaction.commit();
    
    console.log(`✅ Lesson ${lessonId} deleted successfully`);
    
    return res.json({ 
      success: true, 
      message: "Lesson deleted successfully",
      deletedId: lessonId 
    });
    
  } catch (err) {
    await transaction.rollback();
    
    console.error("❌ deleteLesson error:", {
      message: err.message,
      stack: err.stack,
      lessonId: req.params.lessonId
    });
    
    return res.status(500).json({ 
      success: false, 
      error: "Failed to delete lesson",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

/* -----------------------------------------------------------
   GET LESSONS BY UNIT
----------------------------------------------------------- */
export const getLessonsByUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    
    // Validate unitId
    if (!unitId || isNaN(parseInt(unitId))) {
      return res.status(400).json({ 
        success: false, 
        error: "Valid unit ID is required" 
      });
    }

    const lessons = await Lesson.findAll({
      where: { unit_id: parseInt(unitId) },
      order: [["order_index", "ASC"]],
    });
    
    return res.json({ 
      success: true, 
      lessons: lessons.map(buildFileUrls),
      count: lessons.length 
    });
  } catch (err) {
    console.error("❌ getLessonsByUnit error:", {
      message: err.message,
      stack: err.stack,
      unitId: req.params.unitId
    });
    return res.status(500).json({ 
      success: false, 
      error: "Failed to fetch unit lessons",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
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