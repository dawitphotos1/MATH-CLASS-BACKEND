
// // controllers/lessonController.js

// import db from "../models/index.js";
// import path from "path";
// import { fileURLToPath } from "url";
// import fs from "fs";

// const { Lesson, Course, Unit } = db;

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export const createLesson = async (req, res) => {
//   try {
//     console.log("📝 Creating lesson - Request body:", req.body);
//     console.log("📁 Uploaded files:", req.files);

//     const { courseId } = req.params;
//     const { title, content, contentType, orderIndex, videoUrl, unitId } =
//       req.body;

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
//     const uploadsDir = path.join(__dirname, "../Uploads");

//     if (!fs.existsSync(uploadsDir)) {
//       fs.mkdirSync(uploadsDir, { recursive: true });
//     }

//     if (req.files && req.files.video && req.files.video[0]) {
//       const video = req.files.video[0];
//       const videoFilename = `video-${Date.now()}-${video.originalname.replace(
//         /\s+/g,
//         "-"
//       )}`;
//       const videoFullPath = path.join(uploadsDir, videoFilename);
//       fs.writeFileSync(videoFullPath, video.buffer);
//       videoPath = `/Uploads/${videoFilename}`;
//       console.log("✅ Video saved:", videoPath);
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
//       order_index: orderIndexValue,
//       content_type: contentType || "text",
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
//         order_index: lesson.order_index,
//         content_type: lesson.content_type,
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

// export const getLessonsByCourse = async (req, res) => {
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

// export const getLessonById = async (req, res) => {
//   try {
//     const { lessonId } = req.params;

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
//     });

//     if (!lesson) {
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

// export const updateLesson = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     const { title, content, contentType, orderIndex, videoUrl, unitId } =
//       req.body;

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

//     // Check if user is authorized to update this lesson
//     if (req.user.role !== "admin" && lesson.course.teacher_id !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         error: "Not authorized to update this lesson",
//       });
//     }

//     // Handle file uploads
//     let videoPath = lesson.video_url;

//     if (req.files && req.files.video && req.files.video[0]) {
//       const video = req.files.video[0];
//       const uploadsDir = path.join(__dirname, "../Uploads");
//       const videoFilename = `video-${Date.now()}-${video.originalname.replace(
//         /\s+/g,
//         "-"
//       )}`;
//       const videoFullPath = path.join(uploadsDir, videoFilename);

//       fs.writeFileSync(videoFullPath, video.buffer);
//       videoPath = `/Uploads/${videoFilename}`;
//     }

//     // Update lesson
//     lesson.title = title || lesson.title;
//     lesson.content = content || lesson.content;
//     lesson.content_type = contentType || lesson.content_type;
//     lesson.order_index = orderIndex || lesson.order_index;
//     lesson.video_url = videoPath || videoUrl || lesson.video_url;
//     if (unitId) lesson.unit_id = unitId;

//     await lesson.save();

//     res.json({
//       success: true,
//       message: "Lesson updated successfully",
//       lesson,
//     });
//   } catch (error) {
//     console.error("❌ Error updating lesson:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to update lesson",
//     });
//   }
// };

// export const deleteLesson = async (req, res) => {
//   try {
//     const { lessonId } = req.params;

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

// export const getLessonsByUnit = async (req, res) => {
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





// controllers/lessonController.js

import db from "../models/index.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const { Lesson, Course, Unit } = db;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createLesson = async (req, res) => {
  try {
    console.log("📝 Creating lesson - Request body:", req.body);
    console.log("📁 Uploaded files:", req.files);

    const { courseId } = req.params;
    const { title, content, contentType, orderIndex, videoUrl, unitId } = req.body;

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
    const uploadsDir = path.join(__dirname, "../Uploads");

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

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
      order_index: orderIndexValue,
      content_type: contentType || "text",
    });

    console.log("✅ Lesson created successfully:", lesson.id);

    res.status(201).json({
      success: true,
      message: "Lesson created successfully",
      lesson: {
        id: lesson.id,
        title: lesson.title,
        content: lesson.content,
        video_url: lesson.video_url,
        order_index: lesson.order_index,
        content_type: lesson.content_type,
        course_id: lesson.course_id,
        unit_id: lesson.unit_id,
        created_at: lesson.created_at,
      },
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

export const getLessonsByCourse = async (req, res) => {
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
        "created_at",
        "updated_at",
      ],
    });

    console.log(`✅ Found ${lessons.length} lessons for course ${courseId}`);

    res.json({
      success: true,
      lessons: lessons || [],
    });
  } catch (error) {
    console.error("❌ Error fetching lessons:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch lessons",
    });
  }
};

export const getLessonById = async (req, res) => {
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
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this lesson",
      });
    }

    console.log("✅ Lesson found:", lesson.id, lesson.title);
    res.json({
      success: true,
      lesson,
    });
  } catch (error) {
    console.error("❌ Error fetching lesson:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch lesson",
    });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, content, contentType, orderIndex, videoUrl, unitId } = req.body;

    console.log("🔄 UPDATE LESSON - ID:", lessonId);
    console.log("📦 Request body:", { 
      title, 
      contentType, 
      orderIndex, 
      videoUrl, 
      unitId,
      contentLength: content ? content.length : 0
    });
    console.log("👤 User:", req.user);

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

    console.log("✅ Lesson found:", {
      id: lesson.id,
      title: lesson.title,
      courseId: lesson.course_id,
      courseTeacherId: lesson.course?.teacher_id
    });

    // Check authorization
    if (req.user.role !== "admin" && lesson.course.teacher_id !== req.user.id) {
      console.log("❌ Authorization failed:", {
        userId: req.user.id,
        userRole: req.user.role,
        courseTeacherId: lesson.course.teacher_id
      });
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this lesson",
      });
    }

    // Handle file uploads
    let videoPath = lesson.video_url;
    if (req.files && req.files.video && req.files.video[0]) {
      const video = req.files.video[0];
      const uploadsDir = path.join(__dirname, "../Uploads");
      
      // Ensure upload directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      const videoFilename = `video-${Date.now()}-${video.originalname.replace(/\s+/g, "-")}`;
      const videoFullPath = path.join(uploadsDir, videoFilename);
      fs.writeFileSync(videoFullPath, video.buffer);
      videoPath = `/Uploads/${videoFilename}`;
      console.log("✅ New video uploaded:", videoPath);
    }

    // Prepare update data - only update provided fields
    const updateData = {};
    
    if (title !== undefined && title !== null) updateData.title = title.trim();
    if (content !== undefined && content !== null) updateData.content = content;
    if (contentType !== undefined && contentType !== null) updateData.content_type = contentType;
    if (orderIndex !== undefined && orderIndex !== null) updateData.order_index = parseInt(orderIndex);
    if (videoUrl !== undefined && videoUrl !== null) updateData.video_url = videoUrl;
    if (videoPath !== lesson.video_url) updateData.video_url = videoPath;
    if (unitId !== undefined && unitId !== null) updateData.unit_id = unitId;

    console.log("📝 Update data:", updateData);

    // Update lesson using direct update
    const [affectedRows] = await Lesson.update(updateData, {
      where: { id: lessonId },
      individualHooks: true
    });

    if (affectedRows === 0) {
      console.log("❌ No rows affected during update");
      return res.status(500).json({
        success: false,
        error: "Failed to update lesson - no changes made",
      });
    }

    // Fetch the updated lesson
    const updatedLesson = await Lesson.findByPk(lessonId);
    
    console.log("✅ Lesson updated successfully:", lessonId);

    res.json({
      success: true,
      message: "Lesson updated successfully",
      lesson: {
        id: updatedLesson.id,
        title: updatedLesson.title,
        content: updatedLesson.content,
        content_type: updatedLesson.content_type,
        order_index: updatedLesson.order_index,
        video_url: updatedLesson.video_url,
        unit_id: updatedLesson.unit_id,
        updated_at: updatedLesson.updated_at,
      },
    });

  } catch (error) {
    console.error("❌ ERROR updating lesson:", error);
    console.error("❌ Error name:", error.name);
    console.error("❌ Error message:", error.message);
    
    if (error.errors) {
      console.error("❌ Validation errors:", error.errors);
    }

    // Handle specific error types
    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => ({
        field: err.path,
        message: err.message,
        value: err.value,
      }));
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
    }
    
    if (error.name === "SequelizeDatabaseError") {
      return res.status(400).json({
        success: false,
        error: "Database error",
        details: process.env.NODE_ENV === "development" ? error.message : "Check server logs",
      });
    }

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        error: "Invalid reference (course or unit does not exist)",
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: "Failed to update lesson",
      details: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    });
  }
};

export const deleteLesson = async (req, res) => {
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

    // Check if user is authorized to delete this lesson
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

export const getLessonsByUnit = async (req, res) => {
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
        "created_at",
      ],
    });

    console.log(`✅ Found ${lessons.length} lessons for unit ${unitId}`);

    res.json({
      success: true,
      lessons: lessons || [],
    });
  } catch (error) {
    console.error("❌ Error fetching lessons by unit:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch lessons",
    });
  }
};