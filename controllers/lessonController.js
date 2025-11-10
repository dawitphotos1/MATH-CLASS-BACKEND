
// // controllers/lessonController.js

// import db from "../models/index.js";
// import path from "path";
// import { fileURLToPath } from "url";
// import fs from "fs";

// const { Lesson, Course, Unit } = db;

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const createLesson = async (req, res) => {
//   try {
//     console.log("📝 Creating lesson - Request body:", req.body);
//     console.log("📁 Uploaded files:", req.files);

//     const { courseId } = req.params;
//     const { title, content, contentType, orderIndex, videoUrl, unitId, isPreview } = req.body;

//     // Validate required fields
//     if (!title) {
//       return res.status(400).json({
//         success: false,
//         error: "Lesson title is required",
//       });
//     }

//     // Verify course exists
//     const course = await Course.findByPk(courseId);
//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         error: `Course with ID ${courseId} not found`,
//       });
//     }

//     // Verify unit exists if provided
//     if (unitId) {
//       const unit = await Unit.findOne({
//         where: { id: unitId, course_id: courseId },
//       });
//       if (!unit) {
//         return res.status(404).json({
//           success: false,
//           error: `Unit with ID ${unitId} not found in this course`,
//         });
//       }
//     }

//     // Check authorization
//     if (req.user.role !== "admin" && course.teacher_id !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         error: "Not authorized to create lessons for this course",
//       });
//     }

//     // Handle file uploads
//     let videoPath = null;
//     let fileUrl = null;
//     const uploadsDir = path.join(__dirname, "../Uploads");

//     if (!fs.existsSync(uploadsDir)) {
//       fs.mkdirSync(uploadsDir, { recursive: true });
//     }

//     // Handle video upload
//     if (req.files && req.files.video && req.files.video[0]) {
//       const video = req.files.video[0];
//       const videoFilename = `video-${Date.now()}-${video.originalname.replace(/\s+/g, "-")}`;
//       const videoFullPath = path.join(uploadsDir, videoFilename);
//       fs.writeFileSync(videoFullPath, video.buffer);
//       videoPath = `/Uploads/${videoFilename}`;
//       console.log("✅ Video saved:", videoPath);
//     }

//     // Handle file upload (PDF, documents, etc.)
//     if (req.files && req.files.file && req.files.file[0]) {
//       const file = req.files.file[0];
//       const fileFilename = `file-${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
//       const fileFullPath = path.join(uploadsDir, fileFilename);
//       fs.writeFileSync(fileFullPath, file.buffer);
//       fileUrl = `/Uploads/${fileFilename}`;
//       console.log("✅ File saved:", fileUrl);
//     }

//     // Get order index
//     let orderIndexValue = orderIndex;
//     if (!orderIndexValue && orderIndexValue !== 0) {
//       const whereClause = unitId
//         ? { unit_id: unitId }
//         : { course_id: courseId, unit_id: null };
//       const lastLesson = await Lesson.findOne({
//         where: whereClause,
//         order: [["order_index", "DESC"]],
//       });
//       orderIndexValue = lastLesson ? lastLesson.order_index + 1 : 1;
//     }

//     // Create lesson
//     const lesson = await Lesson.create({
//       course_id: courseId,
//       unit_id: unitId || null,
//       title: title.trim(),
//       content: (content || "").trim(),
//       video_url: videoPath || videoUrl || null,
//       file_url: fileUrl || null,
//       order_index: orderIndexValue,
//       content_type: contentType || "text",
//       is_preview: isPreview || false,
//     });

//     console.log("✅ Lesson created successfully:", lesson.id);

//     res.status(201).json({
//       success: true,
//       message: "Lesson created successfully",
//       lesson: {
//         id: lesson.id,
//         title: lesson.title,
//         content: lesson.content,
//         video_url: lesson.video_url,
//         file_url: lesson.file_url,
//         order_index: lesson.order_index,
//         content_type: lesson.content_type,
//         is_preview: lesson.is_preview,
//         course_id: lesson.course_id,
//         unit_id: lesson.unit_id,
//         created_at: lesson.created_at,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error creating lesson:", error);

//     if (error.name === "SequelizeValidationError") {
//       const errors = error.errors.map((err) => ({
//         field: err.path,
//         message: err.message,
//       }));
//       return res.status(400).json({
//         success: false,
//         error: "Validation failed",
//         details: errors,
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: "Failed to create lesson",
//       details:
//         process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// const getLessonsByCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     console.log("📚 Fetching lessons for course:", courseId);

//     const lessons = await Lesson.findAll({
//       where: { course_id: courseId },
//       order: [["order_index", "ASC"]],
//       include: [
//         {
//           association: "unit",
//           attributes: ["id", "title"],
//         },
//       ],
//       attributes: [
//         "id",
//         "title",
//         "content",
//         "video_url",
//         "file_url",
//         "order_index",
//         "content_type",
//         "unit_id",
//         "is_preview",
//         "created_at",
//         "updated_at",
//       ],
//     });

//     console.log(`✅ Found ${lessons.length} lessons for course ${courseId}`);

//     res.json({
//       success: true,
//       lessons: lessons || [],
//     });
//   } catch (error) {
//     console.error("❌ Error fetching lessons:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch lessons",
//     });
//   }
// };

// const getLessonById = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     console.log("🔍 Fetching lesson by ID:", lessonId);

//     const lesson = await Lesson.findByPk(lessonId, {
//       include: [
//         {
//           model: Course,
//           as: "course",
//           attributes: ["id", "title", "teacher_id"],
//         },
//         {
//           model: Unit,
//           as: "unit",
//           attributes: ["id", "title"],
//         },
//       ],
//       attributes: [
//         "id",
//         "title",
//         "content",
//         "video_url",
//         "file_url",
//         "order_index",
//         "content_type",
//         "unit_id",
//         "is_preview",
//         "created_at",
//         "updated_at",
//       ],
//     });

//     if (!lesson) {
//       console.log("❌ Lesson not found:", lessonId);
//       return res.status(404).json({
//         success: false,
//         error: "Lesson not found",
//       });
//     }

//     // Check if user has access to this lesson
//     if (req.user.role !== "admin" && lesson.course.teacher_id !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         error: "Not authorized to access this lesson",
//       });
//     }

//     console.log("✅ Lesson found:", {
//       id: lesson.id,
//       title: lesson.title,
//       file_url: lesson.file_url,
//       content_type: lesson.content_type,
//       is_preview: lesson.is_preview
//     });

//     res.json({
//       success: true,
//       lesson,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching lesson:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch lesson",
//     });
//   }
// };

// const updateLesson = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     const { title, content, contentType, orderIndex, videoUrl, unitId, isPreview, isUnitHeader } = req.body;

//     console.log("🔄 UPDATE LESSON - ID:", lessonId);
//     console.log("📦 Request body:", { 
//       title, 
//       contentType, 
//       orderIndex, 
//       videoUrl, 
//       unitId,
//       isPreview,
//       isUnitHeader,
//       contentLength: content ? content.length : 0
//     });
//     console.log("📁 Uploaded files:", req.files);
//     console.log("👤 User:", req.user);

//     // Validate lesson ID
//     if (!lessonId || isNaN(lessonId)) {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid lesson ID",
//       });
//     }

//     // Find the lesson with course information
//     const lesson = await Lesson.findByPk(lessonId, {
//       include: [
//         {
//           model: Course,
//           as: "course",
//           attributes: ["id", "teacher_id"],
//         },
//       ],
//     });

//     if (!lesson) {
//       console.log("❌ Lesson not found for update:", lessonId);
//       return res.status(404).json({
//         success: false,
//         error: "Lesson not found",
//       });
//     }

//     console.log("✅ Lesson found:", {
//       id: lesson.id,
//       title: lesson.title,
//       courseId: lesson.course_id,
//       courseTeacherId: lesson.course?.teacher_id
//     });

//     // Check authorization
//     if (req.user.role !== "admin" && lesson.course.teacher_id !== req.user.id) {
//       console.log("❌ Authorization failed:", {
//         userId: req.user.id,
//         userRole: req.user.role,
//         courseTeacherId: lesson.course.teacher_id
//       });
//       return res.status(403).json({
//         success: false,
//         error: "Not authorized to update this lesson",
//       });
//     }

//     // Handle file uploads
//     let videoPath = lesson.video_url;
//     let fileUrl = lesson.file_url;
//     const uploadsDir = path.join(__dirname, "../Uploads");
    
//     // Ensure upload directory exists
//     if (!fs.existsSync(uploadsDir)) {
//       fs.mkdirSync(uploadsDir, { recursive: true });
//     }

//     // Handle video upload
//     if (req.files && req.files.video && req.files.video[0]) {
//       const video = req.files.video[0];
//       const videoFilename = `video-${Date.now()}-${video.originalname.replace(/\s+/g, "-")}`;
//       const videoFullPath = path.join(uploadsDir, videoFilename);
//       fs.writeFileSync(videoFullPath, video.buffer);
//       videoPath = `/Uploads/${videoFilename}`;
//       console.log("✅ New video uploaded:", videoPath);
//     }

//     // Handle PDF/file upload - check multiple possible field names
//     if (req.files) {
//       // Check for 'file' field (common for PDF uploads)
//       if (req.files.file && req.files.file[0]) {
//         const file = req.files.file[0];
//         const fileFilename = `file-${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
//         const fileFullPath = path.join(uploadsDir, fileFilename);
//         fs.writeFileSync(fileFullPath, file.buffer);
//         fileUrl = `/Uploads/${fileFilename}`;
//         console.log("✅ New PDF file uploaded:", fileUrl);
//       }
      
//       // Check for 'pdf' field
//       else if (req.files.pdf && req.files.pdf[0]) {
//         const file = req.files.pdf[0];
//         const fileFilename = `pdf-${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
//         const fileFullPath = path.join(uploadsDir, fileFilename);
//         fs.writeFileSync(fileFullPath, file.buffer);
//         fileUrl = `/Uploads/${fileFilename}`;
//         console.log("✅ New PDF uploaded:", fileUrl);
//       }
      
//       // Check for 'attachments' field
//       else if (req.files.attachments && req.files.attachments[0]) {
//         const file = req.files.attachments[0];
//         const fileFilename = `attachment-${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
//         const fileFullPath = path.join(uploadsDir, fileFilename);
//         fs.writeFileSync(fileFullPath, file.buffer);
//         fileUrl = `/Uploads/${fileFilename}`;
//         console.log("✅ New attachment uploaded:", fileUrl);
//       }
//     }

//     // Prepare update data - only update provided fields
//     const updateData = {};
    
//     if (title !== undefined && title !== null) updateData.title = title.trim();
//     if (content !== undefined && content !== null) updateData.content = content;
    
//     // Handle content type based on uploaded files and form data
//     if (isUnitHeader !== undefined && isUnitHeader) {
//       updateData.content_type = 'unit_header';
//     } else if (fileUrl && fileUrl !== lesson.file_url) {
//       updateData.content_type = "pdf";
//     } else if (contentType !== undefined && contentType !== null) {
//       updateData.content_type = contentType;
//     }
    
//     if (orderIndex !== undefined && orderIndex !== null) updateData.order_index = parseInt(orderIndex);
//     if (videoUrl !== undefined && videoUrl !== null) updateData.video_url = videoUrl;
//     if (videoPath !== lesson.video_url) updateData.video_url = videoPath;
//     if (fileUrl !== lesson.file_url) updateData.file_url = fileUrl;
//     if (unitId !== undefined && unitId !== null) updateData.unit_id = unitId;
    
//     // Handle boolean fields
//     if (isPreview !== undefined) updateData.is_preview = Boolean(isPreview);

//     console.log("📝 Final update data:", updateData);

//     // Update lesson using direct update
//     const [affectedRows] = await Lesson.update(updateData, {
//       where: { id: lessonId },
//       individualHooks: true
//     });

//     if (affectedRows === 0) {
//       console.log("❌ No rows affected during update");
//       return res.status(500).json({
//         success: false,
//         error: "Failed to update lesson - no changes made",
//       });
//     }

//     // Fetch the updated lesson with all relationships
//     const updatedLesson = await Lesson.findByPk(lessonId, {
//       include: [
//         {
//           model: Course,
//           as: "course",
//           attributes: ["id", "title", "teacher_id"],
//         },
//         {
//           model: Unit,
//           as: "unit",
//           attributes: ["id", "title"],
//         },
//       ],
//     });
    
//     console.log("✅ Lesson updated successfully:", {
//       id: updatedLesson.id,
//       title: updatedLesson.title,
//       content_type: updatedLesson.content_type,
//       file_url: updatedLesson.file_url,
//       video_url: updatedLesson.video_url,
//       is_preview: updatedLesson.is_preview
//     });

//     res.json({
//       success: true,
//       message: "Lesson updated successfully",
//       lesson: {
//         id: updatedLesson.id,
//         title: updatedLesson.title,
//         content: updatedLesson.content,
//         content_type: updatedLesson.content_type,
//         order_index: updatedLesson.order_index,
//         video_url: updatedLesson.video_url,
//         file_url: updatedLesson.file_url,
//         unit_id: updatedLesson.unit_id,
//         is_preview: updatedLesson.is_preview,
//         course: updatedLesson.course,
//         unit: updatedLesson.unit,
//         updated_at: updatedLesson.updated_at,
//       },
//     });

//   } catch (error) {
//     console.error("❌ ERROR updating lesson:", error);
//     console.error("❌ Error name:", error.name);
//     console.error("❌ Error message:", error.message);
    
//     if (error.errors) {
//       console.error("❌ Validation errors:", error.errors);
//     }

//     // Handle specific error types
//     if (error.name === "SequelizeValidationError") {
//       const errors = error.errors.map((err) => ({
//         field: err.path,
//         message: err.message,
//         value: err.value,
//       }));
//       return res.status(400).json({
//         success: false,
//         error: "Validation failed",
//         details: errors,
//       });
//     }
    
//     if (error.name === "SequelizeDatabaseError") {
//       return res.status(400).json({
//         success: false,
//         error: "Database error",
//         details: process.env.NODE_ENV === "development" ? error.message : "Check server logs",
//       });
//     }

//     if (error.name === "SequelizeForeignKeyConstraintError") {
//       return res.status(400).json({
//         success: false,
//         error: "Invalid reference (course or unit does not exist)",
//       });
//     }

//     // Generic error response
//     res.status(500).json({
//       success: false,
//       error: "Failed to update lesson",
//       details: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
//     });
//   }
// };

// const deleteLesson = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     console.log("🗑️ Deleting lesson:", lessonId);

//     const lesson = await Lesson.findByPk(lessonId, {
//       include: [
//         {
//           model: Course,
//           as: "course",
//           attributes: ["id", "teacher_id"],
//         },
//       ],
//     });

//     if (!lesson) {
//       return res.status(404).json({
//         success: false,
//         error: "Lesson not found",
//       });
//     }

//     // Check if user is authorized to delete this lesson
//     if (req.user.role !== "admin" && lesson.course.teacher_id !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         error: "Not authorized to delete this lesson",
//       });
//     }

//     await lesson.destroy();

//     console.log("✅ Lesson deleted successfully:", lessonId);
//     res.json({
//       success: true,
//       message: "Lesson deleted successfully",
//     });
//   } catch (error) {
//     console.error("❌ Error deleting lesson:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to delete lesson",
//     });
//   }
// };

// const getLessonsByUnit = async (req, res) => {
//   try {
//     const { unitId } = req.params;
//     console.log("📚 Fetching lessons for unit:", unitId);

//     const lessons = await Lesson.findAll({
//       where: { unit_id: unitId },
//       order: [["order_index", "ASC"]],
//       include: [
//         {
//           association: "unit",
//           attributes: ["id", "title"],
//         },
//       ],
//       attributes: [
//         "id",
//         "title",
//         "content",
//         "video_url",
//         "file_url",
//         "order_index",
//         "content_type",
//         "unit_id",
//         "is_preview",
//         "created_at",
//       ],
//     });

//     console.log(`✅ Found ${lessons.length} lessons for unit ${unitId}`);

//     res.json({
//       success: true,
//       lessons: lessons || [],
//     });
//   } catch (error) {
//     console.error("❌ Error fetching lessons by unit:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch lessons",
//     });
//   }
// };

// // Export all functions
// export {
//   createLesson,
//   getLessonsByCourse,
//   getLessonsByUnit,
//   getLessonById,
//   updateLesson,
//   deleteLesson
// };






// controllers/lessonController.js
import db from "../models/index.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const { Lesson, Course, Unit } = db;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to build full file URLs
const buildFileUrls = (lesson) => {
  const lessonData = lesson.toJSON ? lesson.toJSON() : { ...lesson };
  
  // Build full URLs for files
  if (lessonData.video_url) {
    lessonData.video_url = `${process.env.BACKEND_URL || 'http://localhost:3000'}${lessonData.video_url}`;
  }
  
  if (lessonData.file_url) {
    lessonData.file_url = `${process.env.BACKEND_URL || 'http://localhost:3000'}${lessonData.file_url}`;
  }
  
  return lessonData;
};

const createLesson = async (req, res) => {
  try {
    console.log("📝 Creating lesson - Request body:", req.body);
    console.log("📁 Uploaded files:", req.files);

    const { courseId } = req.params;
    const { title, content, contentType, orderIndex, videoUrl, unitId, isPreview } = req.body;

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

    // Handle file uploads
    let videoPath = null;
    let fileUrl = null;
    const uploadsDir = path.join(__dirname, "../Uploads");

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Handle video upload
    if (req.files && req.files.video && req.files.video[0]) {
      const video = req.files.video[0];
      const videoFilename = `video-${Date.now()}-${video.originalname.replace(/\s+/g, "-")}`;
      const videoFullPath = path.join(uploadsDir, videoFilename);
      fs.writeFileSync(videoFullPath, video.buffer);
      videoPath = `/Uploads/${videoFilename}`;
      console.log("✅ Video saved:", videoPath);
    }

    // Handle file upload (PDF, documents, etc.)
    if (req.files && req.files.file && req.files.file[0]) {
      const file = req.files.file[0];
      const fileFilename = `file-${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
      const fileFullPath = path.join(uploadsDir, fileFilename);
      fs.writeFileSync(fileFullPath, file.buffer);
      fileUrl = `/Uploads/${fileFilename}`;
      console.log("✅ File saved:", fileUrl);
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
      video_url: videoPath || videoUrl || null,
      file_url: fileUrl || null,
      order_index: orderIndexValue,
      content_type: contentType || "text",
      is_preview: isPreview || false,
    });

    console.log("✅ Lesson created successfully:", lesson.id);

    // Build response with full URLs
    const lessonResponse = buildFileUrls(lesson);

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
      details: process.env.NODE_ENV === "development" ? error.message : undefined,
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
    const lessonsWithUrls = lessons.map(lesson => buildFileUrls(lesson));

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
        const { Enrollment } = db;
        const enrollment = await Enrollment.findOne({
          where: { 
            user_id: req.user.id, 
            course_id: lesson.course_id,
            approval_status: "approved"
          }
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
      content_type: lesson.content_type,
      is_preview: lesson.is_preview
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

const updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, content, contentType, orderIndex, videoUrl, unitId, isPreview, isUnitHeader } = req.body;

    console.log("🔄 UPDATE LESSON - ID:", lessonId);

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

    // Check authorization
    if (req.user.role !== "admin" && lesson.course.teacher_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this lesson",
      });
    }

    // Handle file uploads
    let videoPath = lesson.video_url;
    let fileUrl = lesson.file_url;
    const uploadsDir = path.join(__dirname, "../Uploads");
    
    // Ensure upload directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Handle video upload
    if (req.files && req.files.video && req.files.video[0]) {
      const video = req.files.video[0];
      const videoFilename = `video-${Date.now()}-${video.originalname.replace(/\s+/g, "-")}`;
      const videoFullPath = path.join(uploadsDir, videoFilename);
      fs.writeFileSync(videoFullPath, video.buffer);
      videoPath = `/Uploads/${videoFilename}`;
      console.log("✅ New video uploaded:", videoPath);
    }

    // Handle file upload
    if (req.files && req.files.file && req.files.file[0]) {
      const file = req.files.file[0];
      const fileFilename = `file-${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
      const fileFullPath = path.join(uploadsDir, fileFilename);
      fs.writeFileSync(fileFullPath, file.buffer);
      fileUrl = `/Uploads/${fileFilename}`;
      console.log("✅ New file uploaded:", fileUrl);
    }

    // Prepare update data
    const updateData = {};
    
    if (title !== undefined && title !== null) updateData.title = title.trim();
    if (content !== undefined && content !== null) updateData.content = content;
    
    // Handle content type
    if (isUnitHeader !== undefined && isUnitHeader) {
      updateData.content_type = 'unit_header';
    } else if (fileUrl && fileUrl !== lesson.file_url) {
      updateData.content_type = "pdf";
    } else if (contentType !== undefined && contentType !== null) {
      updateData.content_type = contentType;
    }
    
    if (orderIndex !== undefined && orderIndex !== null) updateData.order_index = parseInt(orderIndex);
    if (videoUrl !== undefined && videoUrl !== null) updateData.video_url = videoUrl;
    if (videoPath !== lesson.video_url) updateData.video_url = videoPath;
    if (fileUrl !== lesson.file_url) updateData.file_url = fileUrl;
    if (unitId !== undefined && unitId !== null) updateData.unit_id = unitId;
    
    if (isPreview !== undefined) updateData.is_preview = Boolean(isPreview);

    // Update lesson
    const [affectedRows] = await Lesson.update(updateData, {
      where: { id: lessonId },
      individualHooks: true
    });

    if (affectedRows === 0) {
      return res.status(500).json({
        success: false,
        error: "Failed to update lesson - no changes made",
      });
    }

    // Fetch the updated lesson
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
    
    // Build full URLs
    const lessonResponse = buildFileUrls(updatedLesson);

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
      details: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
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
    const lessonsWithUrls = lessons.map(lesson => buildFileUrls(lesson));

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

// Export all functions
export {
  createLesson,
  getLessonsByCourse,
  getLessonsByUnit,
  getLessonById,
  updateLesson,
  deleteLesson
};