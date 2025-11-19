// controllers/lessonController.js
import db from "../models/index.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const { Lesson, Course, Unit, Enrollment } = db;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ FIXED: Enhanced helper function to build full file URLs
const buildFileUrls = (lesson) => {
  if (!lesson) return lesson;

  const lessonData = lesson.toJSON ? lesson.toJSON() : { ...lesson };

  console.log("🔗 Building URLs for lesson:", {
    id: lessonData.id,
    current_file_url: lessonData.file_url,
    current_video_url: lessonData.video_url,
  });

  // Build full URLs for files - only if they exist and aren't already full URLs
  if (
    lessonData.video_url &&
    lessonData.video_url !== null &&
    lessonData.video_url !== "" &&
    !lessonData.video_url.startsWith("http")
  ) {
    // FIX: Use the correct file serving route with /api/v1/files prefix
    const fullVideoUrl = `${
      process.env.BACKEND_URL || "http://localhost:3000"
    }/api/v1/files${lessonData.video_url}`;
    console.log("🎥 Video URL transformed:", fullVideoUrl);
    lessonData.video_url = fullVideoUrl;
  }

  if (
    lessonData.file_url &&
    lessonData.file_url !== null &&
    lessonData.file_url !== "" &&
    !lessonData.file_url.startsWith("http")
  ) {
    // FIX: Use the correct file serving route with /api/v1/files prefix
    const fullFileUrl = `${
      process.env.BACKEND_URL || "http://localhost:3000"
    }/api/v1/files${lessonData.file_url}`;
    console.log("📄 File URL transformed:", fullFileUrl);
    lessonData.file_url = fullFileUrl;
  }

  console.log("✅ Final lesson URLs:", {
    file_url: lessonData.file_url,
    video_url: lessonData.video_url,
  });

  return lessonData;
};

// ✅ DEBUG: Get lesson directly from database
const debugGetLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    console.log("🐛 DEBUG: Fetching lesson directly from DB:", lessonId);

    const lesson = await Lesson.findByPk(lessonId, {
      raw: true,
      attributes: [
        "id",
        "title",
        "content",
        "video_url",
        "file_url",
        "content_type",
        "is_preview",
        "course_id",
        "unit_id",
        "created_at",
        "updated_at",
      ],
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: "Lesson not found in database",
      });
    }

    console.log("🐛 DEBUG: Raw database data:", lesson);

    res.json({
      success: true,
      lesson: lesson,
      backend_url: process.env.BACKEND_URL,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("🐛 DEBUG Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ✅ DEBUG: Check if file exists on server
const debugCheckFile = async (req, res) => {
  try {
    const { filename } = req.params;
    const uploadsDir = path.join(__dirname, "../Uploads");
    const filePath = path.join(uploadsDir, filename);

    console.log("🐛 DEBUG: Checking file existence:", {
      filename,
      uploadsDir,
      filePath,
    });

    const fileExists = fs.existsSync(filePath);

    res.json({
      success: true,
      fileExists,
      filename,
      filePath,
      uploadsDir,
    });
  } catch (error) {
    console.error("🐛 DEBUG File Check Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ✅ DEBUG: Check file URL generation
const debugFileUrl = async (req, res) => {
  try {
    const { lessonId } = req.params;
    console.log("🔧 DEBUG: Checking file URL for lesson:", lessonId);

    const lesson = await Lesson.findByPk(lessonId, {
      attributes: ["id", "title", "file_url", "video_url", "content_type"],
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: "Lesson not found",
      });
    }

    const originalFileUrl = lesson.file_url;
    const builtFileUrl = buildFileUrls(lesson).file_url;

    res.json({
      success: true,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        content_type: lesson.content_type,
        original_file_url: originalFileUrl,
        built_file_url: builtFileUrl,
        backend_url: process.env.BACKEND_URL,
        expected_url: `${
          process.env.BACKEND_URL || "http://localhost:3000"
        }/api/v1/files${originalFileUrl}`,
      },
    });
  } catch (error) {
    console.error("🔧 DEBUG Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ✅ FIXED: Enhanced createLesson function
const createLesson = async (req, res) => {
  try {
    console.log("📝 Creating lesson - Request body:", req.body);
    console.log("📁 Uploaded files:", req.files);

    const { courseId } = req.params;
    const {
      title,
      content,
      contentType,
      orderIndex,
      videoUrl,
      unitId,
      isPreview,
    } = req.body;

    // Validate required fields
    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Lesson title is required",
      });
    }

    // Verify course exists
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: `Course with ID ${courseId} not found`,
      });
    }

    // Verify unit exists if provided
    if (unitId) {
      const unit = await Unit.findOne({
        where: { id: unitId, course_id: courseId },
      });
      if (!unit) {
        return res.status(404).json({
          success: false,
          error: `Unit with ID ${unitId} not found in this course`,
        });
      }
    }

    // Check authorization
    if (req.user.role !== "admin" && course.teacher_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to create lessons for this course",
      });
    }

    // ✅ FIXED: Enhanced file upload handling
    let videoPath = null;
    let fileUrl = null;
    const uploadsDir = path.join(__dirname, "../Uploads");

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log("✅ Created Uploads directory");
    }

    // Handle video upload
    if (req.files && req.files.video && req.files.video[0]) {
      const video = req.files.video[0];
      const videoFilename = `video-${Date.now()}-${video.originalname.replace(
        /\s+/g,
        "-"
      )}`;
      const videoFullPath = path.join(uploadsDir, videoFilename);
      fs.writeFileSync(videoFullPath, video.buffer);
      videoPath = `/Uploads/${videoFilename}`;
      console.log("✅ Video saved:", videoPath);
    }

    // Handle file upload (PDF, documents, etc.)
    if (req.files && req.files.file && req.files.file[0]) {
      const file = req.files.file[0];
      const fileFilename = `file-${Date.now()}-${file.originalname.replace(
        /\s+/g,
        "-"
      )}`;
      const fileFullPath = path.join(uploadsDir, fileFilename);
      fs.writeFileSync(fileFullPath, file.buffer);
      fileUrl = `/Uploads/${fileFilename}`;
      console.log("✅ File saved:", fileUrl);
    }

    // Also check for PDF files in the 'pdf' field
    if (req.files && req.files.pdf && req.files.pdf[0]) {
      const pdfFile = req.files.pdf[0];
      const pdfFilename = `pdf-${Date.now()}-${pdfFile.originalname.replace(
        /\s+/g,
        "-"
      )}`;
      const pdfFullPath = path.join(uploadsDir, pdfFilename);
      fs.writeFileSync(pdfFullPath, pdfFile.buffer);
      fileUrl = `/Uploads/${pdfFilename}`;
      console.log("✅ PDF uploaded (pdf field):", fileUrl);
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

    // ✅ FIXED: Enhanced content type determination
    let finalContentType = contentType || "text";

    // Priority: uploaded files > explicit content type > auto-detection
    if (fileUrl) {
      finalContentType = "pdf";
      console.log("✅ Content type set to 'pdf' because file was uploaded");
    } else if (videoPath) {
      finalContentType = "video";
      console.log("✅ Content type set to 'video' because video was uploaded");
    } else if (contentType && contentType !== "") {
      finalContentType = contentType;
      console.log("✅ Content type set from form:", contentType);
    }

    // Create lesson
    const lesson = await Lesson.create({
      course_id: courseId,
      unit_id: unitId || null,
      title: title.trim(),
      content: (content || "").trim(),
      video_url: videoPath || videoUrl || null,
      file_url: fileUrl || null,
      order_index: orderIndexValue,
      content_type: finalContentType,
      is_preview: isPreview || false,
    });

    console.log("✅ Lesson created successfully:", lesson.id);

    // ✅ FIXED: Fetch the complete lesson with associations
    const completeLesson = await Lesson.findByPk(lesson.id, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "teacher_id"],
        },
        {
          model: Unit,
          as: "unit",
          attributes: ["id", "title"],
        },
      ],
    });

    // Build response with full URLs
    const lessonResponse = buildFileUrls(completeLesson);

    console.log("🎉 Lesson creation complete:", {
      id: lessonResponse.id,
      title: lessonResponse.title,
      file_url: lessonResponse.file_url,
      content_type: lessonResponse.content_type,
    });

    res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      lesson: lessonResponse,
    });
  } catch (error) {
    console.error("❌ Error creating lesson:", error);

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
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ✅ FIXED: COMPLETELY REWRITTEN updateLesson function
const updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const {
      title,
      content,
      contentType,
      orderIndex,
      videoUrl,
      unitId,
      isPreview,
      isUnitHeader,
    } = req.body;

    console.log("🔄 UPDATE LESSON - ID:", lessonId);
    console.log("📝 Update data received:", {
      title,
      contentType,
      isPreview,
      isUnitHeader,
      orderIndex,
      unitId,
    });
    console.log("📁 Uploaded files:", req.files);

    // Validate lesson ID
    if (!lessonId || isNaN(lessonId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid lesson ID",
      });
    }

    // Find the lesson with course information
    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "teacher_id"],
        },
      ],
    });

    if (!lesson) {
      console.log("❌ Lesson not found for update:", lessonId);
      return res.status(404).json({
        success: false,
        error: "Lesson not found",
      });
    }

    console.log("📖 Current lesson data:", {
      id: lesson.id,
      title: lesson.title,
      file_url: lesson.file_url,
      video_url: lesson.video_url,
      content_type: lesson.content_type,
    });

    // Check authorization
    if (req.user.role !== "admin" && lesson.course.teacher_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this lesson",
      });
    }

    // ✅ FIXED: Enhanced file upload handling for updates
    let videoPath = lesson.video_url;
    let fileUrl = lesson.file_url;
    const uploadsDir = path.join(__dirname, "../Uploads");

    // Ensure upload directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log("✅ Created Uploads directory");
    }

    // Handle video upload
    if (req.files && req.files.video && req.files.video[0]) {
      const video = req.files.video[0];
      const videoFilename = `video-${Date.now()}-${video.originalname.replace(
        /\s+/g,
        "-"
      )}`;
      const videoFullPath = path.join(uploadsDir, videoFilename);
      fs.writeFileSync(videoFullPath, video.buffer);
      videoPath = `/Uploads/${videoFilename}`;
      console.log("✅ New video uploaded:", videoPath);
    }

    // ✅ FIXED: Enhanced file upload handling - specifically for PDF files
    if (req.files && req.files.file && req.files.file[0]) {
      const file = req.files.file[0];
      const fileFilename = `file-${Date.now()}-${file.originalname.replace(
        /\s+/g,
        "-"
      )}`;
      const fileFullPath = path.join(uploadsDir, fileFilename);
      fs.writeFileSync(fileFullPath, file.buffer);
      fileUrl = `/Uploads/${fileFilename}`;
      console.log("✅ New PDF/file uploaded:", fileUrl);
      console.log("📄 File details:", {
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      });
    }

    // Also check for PDF files in the 'pdf' field
    if (req.files && req.files.pdf && req.files.pdf[0]) {
      const pdfFile = req.files.pdf[0];
      const pdfFilename = `pdf-${Date.now()}-${pdfFile.originalname.replace(
        /\s+/g,
        "-"
      )}`;
      const pdfFullPath = path.join(uploadsDir, pdfFilename);
      fs.writeFileSync(pdfFullPath, pdfFile.buffer);
      fileUrl = `/Uploads/${pdfFilename}`;
      console.log("✅ New PDF uploaded (pdf field):", fileUrl);
    }

    // Prepare update data
    const updateData = {};

    if (title !== undefined && title !== null) updateData.title = title.trim();
    if (content !== undefined && content !== null) updateData.content = content;

    // ✅ FIXED: CRITICAL - Enhanced content type handling
    let finalContentType = lesson.content_type; // Start with current type

    if (isUnitHeader !== undefined && isUnitHeader) {
      finalContentType = "unit_header";
      console.log("✅ Content type set to 'unit_header'");
    }
    // If a file was uploaded, set content type to PDF (HIGHEST PRIORITY)
    else if (fileUrl && fileUrl !== lesson.file_url) {
      finalContentType = "pdf";
      console.log("✅ Content type set to 'pdf' because file was uploaded");
    }
    // If a video was uploaded, set content type to video
    else if (videoPath && videoPath !== lesson.video_url) {
      finalContentType = "video";
      console.log("✅ Content type set to 'video' because video was uploaded");
    }
    // If content type was explicitly provided in form, use it
    else if (
      contentType !== undefined &&
      contentType !== null &&
      contentType !== ""
    ) {
      finalContentType = contentType;
      console.log("✅ Content type set from form data:", contentType);
    }
    // Auto-detect based on existing files if no new files uploaded
    else if (lesson.file_url && !fileUrl) {
      finalContentType = "pdf";
      console.log("✅ Content type auto-detected as 'pdf' from existing file");
    } else if (lesson.video_url && !videoPath) {
      finalContentType = "video";
      console.log(
        "✅ Content type auto-detected as 'video' from existing video"
      );
    } else if (!finalContentType || finalContentType === "") {
      finalContentType = "text";
      console.log("✅ Content type set to 'text' as default");
    }

    updateData.content_type = finalContentType;

    // Handle order index
    if (orderIndex !== undefined && orderIndex !== null) {
      updateData.order_index = parseInt(orderIndex);
    }

    // Handle video URL - only update if provided or changed
    if (videoUrl !== undefined && videoUrl !== null) {
      updateData.video_url = videoUrl;
    }
    if (videoPath !== lesson.video_url) {
      updateData.video_url = videoPath;
    }

    // ✅ FIXED: CRITICAL - Always update file_url if a new file was uploaded
    if (fileUrl !== lesson.file_url) {
      updateData.file_url = fileUrl;
      console.log("✅ File URL updated:", fileUrl);
    }

    if (unitId !== undefined && unitId !== null) {
      updateData.unit_id = unitId;
    }

    if (isPreview !== undefined) {
      updateData.is_preview = Boolean(isPreview);
    }

    console.log("🔄 Final update data to be saved:", updateData);

    // Update lesson
    const [affectedRows] = await Lesson.update(updateData, {
      where: { id: lessonId },
      individualHooks: true,
    });

    if (affectedRows === 0) {
      console.log("❌ No rows affected during update");
      return res.status(500).json({
        success: false,
        error: "Failed to update lesson - no changes made",
      });
    }

    console.log(`✅ ${affectedRows} row(s) updated successfully`);

    // ✅ FIXED: Fetch the complete updated lesson with associations
    const updatedLesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "teacher_id"],
        },
        {
          model: Unit,
          as: "unit",
          attributes: ["id", "title"],
        },
      ],
    });

    if (!updatedLesson) {
      console.log("❌ Failed to fetch updated lesson");
      return res.status(500).json({
        success: false,
        error: "Lesson updated but failed to fetch updated data",
      });
    }

    // Build full URLs
    const lessonResponse = buildFileUrls(updatedLesson);

    console.log("✅ Lesson updated successfully:", {
      id: lessonResponse.id,
      title: lessonResponse.title,
      file_url: lessonResponse.file_url,
      video_url: lessonResponse.video_url,
      content_type: lessonResponse.content_type,
      is_preview: lessonResponse.is_preview,
    });

    res.json({
      success: true,
      message: "Lesson updated successfully",
      lesson: lessonResponse,
    });
  } catch (error) {
    console.error("❌ ERROR updating lesson:", error);

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
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// ✅ FIXED: Enhanced getLessonById function
const getLessonById = async (req, res) => {
  try {
    const { lessonId } = req.params;
    console.log("🔍 Fetching lesson by ID:", lessonId);

    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "teacher_id"],
        },
        {
          model: Unit,
          as: "unit",
          attributes: ["id", "title"],
        },
      ],
      attributes: [
        "id",
        "title",
        "content",
        "video_url",
        "file_url",
        "order_index",
        "content_type",
        "unit_id",
        "is_preview",
        "created_at",
        "updated_at",
      ],
    });

    if (!lesson) {
      console.log("❌ Lesson not found:", lessonId);
      return res.status(404).json({
        success: false,
        error: "Lesson not found",
      });
    }

    // Check if user has access to this lesson
    if (req.user.role !== "admin" && lesson.course.teacher_id !== req.user.id) {
      // For students, check if they're enrolled in the course
      if (req.user.role === "student") {
        const enrollment = await Enrollment.findOne({
          where: {
            user_id: req.user.id,
            course_id: lesson.course_id,
            approval_status: "approved",
          },
        });

        if (!enrollment) {
          return res.status(403).json({
            success: false,
            error: "Not enrolled in this course",
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          error: "Not authorized to access this lesson",
        });
      }
    }

    console.log("✅ Lesson found:", {
      id: lesson.id,
      title: lesson.title,
      file_url: lesson.file_url,
      video_url: lesson.video_url,
      content_type: lesson.content_type,
      is_preview: lesson.is_preview,
    });

    // Build full URLs
    const lessonWithUrls = buildFileUrls(lesson);

    res.json({
      success: true,
      lesson: lessonWithUrls,
    });
  } catch (error) {
    console.error("❌ Error fetching lesson:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch lesson",
    });
  }
};

const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log("📚 Fetching lessons for course:", courseId);

    const lessons = await Lesson.findAll({
      where: { course_id: courseId },
      order: [["order_index", "ASC"]],
      include: [
        {
          association: "unit",
          attributes: ["id", "title"],
        },
      ],
      attributes: [
        "id",
        "title",
        "content",
        "video_url",
        "file_url",
        "order_index",
        "content_type",
        "unit_id",
        "is_preview",
        "created_at",
        "updated_at",
      ],
    });

    console.log(`✅ Found ${lessons.length} lessons for course ${courseId}`);

    // Build full URLs for all lessons
    const lessonsWithUrls = lessons.map((lesson) => buildFileUrls(lesson));

    res.json({
      success: true,
      lessons: lessonsWithUrls,
    });
  } catch (error) {
    console.error("❌ Error fetching lessons:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch lessons",
    });
  }
};

const getLessonsByUnit = async (req, res) => {
  try {
    const { unitId } = req.params;
    console.log("📚 Fetching lessons for unit:", unitId);

    const lessons = await Lesson.findAll({
      where: { unit_id: unitId },
      order: [["order_index", "ASC"]],
      include: [
        {
          association: "unit",
          attributes: ["id", "title"],
        },
      ],
      attributes: [
        "id",
        "title",
        "content",
        "video_url",
        "file_url",
        "order_index",
        "content_type",
        "unit_id",
        "is_preview",
        "created_at",
      ],
    });

    console.log(`✅ Found ${lessons.length} lessons for unit ${unitId}`);

    // Build full URLs for all lessons
    const lessonsWithUrls = lessons.map((lesson) => buildFileUrls(lesson));

    res.json({
      success: true,
      lessons: lessonsWithUrls,
    });
  } catch (error) {
    console.error("❌ Error fetching lessons by unit:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch lessons",
    });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    console.log("🗑️ Deleting lesson:", lessonId);

    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "teacher_id"],
        },
      ],
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: "Lesson not found",
      });
    }

    // Check authorization
    if (req.user.role !== "admin" && lesson.course.teacher_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this lesson",
      });
    }

    await lesson.destroy();

    console.log("✅ Lesson deleted successfully:", lessonId);
    res.json({
      success: true,
      message: "Lesson deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting lesson:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete lesson",
    });
  }
};

// ✅ SINGLE EXPORT STATEMENT - No duplicates
export {
  createLesson,
  getLessonsByCourse,
  getLessonsByUnit,
  getLessonById,
  updateLesson,
  deleteLesson,
  debugGetLesson,
  debugCheckFile,
  debugFileUrl,
};
