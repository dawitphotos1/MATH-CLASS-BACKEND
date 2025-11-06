
// // controllers/lessonController.js
// import db from "../models/index.js";

// const { Lesson, Course } = db;

// // ====================
// // Create Lesson
// // ====================
// export const createLesson = async (req, res) => {
//   try {
//     const { courseId, title, content, contentType } = req.body;

//     if (!courseId || !title) {
//       return res.status(400).json({ error: "Course ID and title required" });
//     }

//     const lesson = await Lesson.create({
//       courseId,
//       title,
//       content,
//       contentType,
//     });

//     res.status(201).json({ success: true, lesson });
//   } catch (err) {
//     console.error("❌ createLesson error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ====================
// // Get Lessons by Course
// // ====================
// export const getLessonsByCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;

//     const lessons = await Lesson.findAll({
//       where: { courseId },
//       order: [["createdAt", "ASC"]],
//     });

//     res.json({ success: true, lessons });
//   } catch (err) {
//     console.error("❌ getLessonsByCourse error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ====================
// // Get Single Lesson
// // ====================
// export const getLessonById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const lesson = await Lesson.findByPk(id);
//     if (!lesson) return res.status(404).json({ error: "Lesson not found" });

//     res.json({ success: true, lesson });
//   } catch (err) {
//     console.error("❌ getLessonById error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ====================
// // Update Lesson
// // ====================
// export const updateLesson = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, content, contentType } = req.body;

//     const lesson = await Lesson.findByPk(id);
//     if (!lesson) return res.status(404).json({ error: "Lesson not found" });

//     lesson.title = title || lesson.title;
//     lesson.content = content || lesson.content;
//     lesson.contentType = contentType || lesson.contentType;
//     await lesson.save();

//     res.json({ success: true, lesson });
//   } catch (err) {
//     console.error("❌ updateLesson error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ====================
// // Delete Lesson
// // ====================
// export const deleteLesson = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const lesson = await Lesson.findByPk(id);
//     if (!lesson) return res.status(404).json({ error: "Lesson not found" });

//     await lesson.destroy();
//     res.json({ success: true, message: "Lesson deleted" });
//   } catch (err) {
//     console.error("❌ deleteLesson error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };




// controllers/lessonController.js
import db from "../models/index.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const { Lesson, Course } = db;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ============================================================
   Create Lesson
============================================================ */
export const createLesson = async (req, res) => {
  try {
    console.log("📝 Creating lesson - Request body:", req.body);
    console.log("📁 Uploaded files:", req.files);

    const { courseId, title, content, contentType, orderIndex, videoUrl } = req.body;

    // Validate required fields
    if (!courseId || !title) {
      return res.status(400).json({
        success: false,
        error: "Course ID and title are required"
      });
    }

    // Verify course exists and user has access
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found"
      });
    }

    // Check if user is the course teacher or admin
    if (req.user.role !== "admin" && course.teacher_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to create lessons for this course"
      });
    }

    // Handle file uploads
    let videoPath = null;
    let attachmentPaths = [];

    // Ensure Uploads directory exists
    const uploadsDir = path.join(__dirname, "../Uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Process video if uploaded
    if (req.files && req.files.video && req.files.video[0]) {
      const video = req.files.video[0];
      const videoFilename = `video-${Date.now()}-${video.originalname.replace(/\s+/g, '-')}`;
      const videoFullPath = path.join(uploadsDir, videoFilename);
      
      fs.writeFileSync(videoFullPath, video.buffer);
      videoPath = `/Uploads/${videoFilename}`;
      console.log("✅ Video saved:", videoPath);
    }

    // Process attachments if uploaded
    if (req.files && req.files.attachments) {
      for (const file of req.files.attachments) {
        const filename = `attachment-${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
        const filePath = path.join(uploadsDir, filename);
        
        fs.writeFileSync(filePath, file.buffer);
        attachmentPaths.push(`/Uploads/${filename}`);
      }
      console.log("✅ Attachments saved:", attachmentPaths.length);
    }

    // Get the next order index if not provided
    let orderIndexValue = orderIndex;
    if (!orderIndexValue) {
      const lastLesson = await Lesson.findOne({
        where: { course_id: courseId },
        order: [["order_index", "DESC"]]
      });
      orderIndexValue = lastLesson ? lastLesson.order_index + 1 : 1;
    }

    // Create the lesson
    const lessonData = {
      course_id: courseId,
      title: title.trim(),
      content: (content || "").trim(),
      video_url: videoPath || videoUrl || null,
      order_index: orderIndexValue,
      content_type: contentType || "text"
    };

    console.log("📊 Creating lesson with data:", lessonData);

    const lesson = await Lesson.create(lessonData);

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
        created_at: lesson.created_at
      }
    });

  } catch (error) {
    console.error("❌ Error creating lesson:", error);
    
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create lesson",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/* ============================================================
   Get Lessons by Course
============================================================ */
export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const lessons = await Lesson.findAll({
      where: { course_id: courseId },
      order: [["order_index", "ASC"]],
      attributes: [
        "id",
        "title",
        "content",
        "video_url",
        "order_index",
        "content_type",
        "created_at"
      ]
    });

    res.json({
      success: true,
      lessons: lessons || []
    });
  } catch (error) {
    console.error("❌ Error fetching lessons:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch lessons"
    });
  }
};

/* ============================================================
   Get Single Lesson
============================================================ */
export const getLessonById = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "teacher_id"]
        }
      ]
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: "Lesson not found"
      });
    }

    // Check if user has access to this lesson
    if (req.user.role !== "admin" && lesson.course.teacher_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to access this lesson"
      });
    }

    res.json({
      success: true,
      lesson
    });
  } catch (error) {
    console.error("❌ Error fetching lesson:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch lesson"
    });
  }
};

/* ============================================================
   Update Lesson
============================================================ */
export const updateLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, content, contentType, orderIndex, videoUrl } = req.body;

    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "teacher_id"]
        }
      ]
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: "Lesson not found"
      });
    }

    // Check if user is authorized to update this lesson
    if (req.user.role !== "admin" && lesson.course.teacher_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update this lesson"
      });
    }

    // Handle file uploads
    let videoPath = lesson.video_url;

    if (req.files && req.files.video && req.files.video[0]) {
      const video = req.files.video[0];
      const uploadsDir = path.join(__dirname, "../Uploads");
      const videoFilename = `video-${Date.now()}-${video.originalname.replace(/\s+/g, '-')}`;
      const videoFullPath = path.join(uploadsDir, videoFilename);
      
      fs.writeFileSync(videoFullPath, video.buffer);
      videoPath = `/Uploads/${videoFilename}`;
    }

    // Update lesson
    lesson.title = title || lesson.title;
    lesson.content = content || lesson.content;
    lesson.content_type = contentType || lesson.content_type;
    lesson.order_index = orderIndex || lesson.order_index;
    lesson.video_url = videoPath || videoUrl || lesson.video_url;

    await lesson.save();

    res.json({
      success: true,
      message: "Lesson updated successfully",
      lesson
    });
  } catch (error) {
    console.error("❌ Error updating lesson:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update lesson"
    });
  }
};

/* ============================================================
   Delete Lesson
============================================================ */
export const deleteLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    const lesson = await Lesson.findByPk(lessonId, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "teacher_id"]
        }
      ]
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: "Lesson not found"
      });
    }

    // Check if user is authorized to delete this lesson
    if (req.user.role !== "admin" && lesson.course.teacher_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this lesson"
      });
    }

    await lesson.destroy();

    res.json({
      success: true,
      message: "Lesson deleted successfully"
    });
  } catch (error) {
    console.error("❌ Error deleting lesson:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete lesson"
    });
  }
};