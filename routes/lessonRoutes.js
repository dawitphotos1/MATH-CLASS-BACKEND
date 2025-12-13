// // routes/lessonRoutes.js

// import express from "express";
// import lessonController from "../controllers/lessonController.js";
// import upload from "../middleware/uploadMiddleware.js";

// const router = express.Router();

// // Create lesson (multipart)
// router.post(
//   "/course/:courseId/lessons",
//   upload.uploadLessonFiles,
//   lessonController.createLesson
// );

// // Update lesson (multipart)
// router.put(
//   "/:lessonId",
//   upload.uploadLessonFiles,
//   lessonController.updateLesson
// );

// // Get lesson by ID
// router.get("/:id", lessonController.getLessonById);

// // Preview endpoints
// router.get(
//   "/preview/course/:courseId",
//   lessonController.getPreviewLessonForCourse
// );
// router.get(
//   "/public-preview/:lessonId",
//   lessonController.getPublicPreviewByLessonId
// );

// // Lessons by course / unit
// router.get("/course/:courseId/all", lessonController.getLessonsByCourse);
// router.get("/unit/:unitId/all", lessonController.getLessonsByUnit);

// // Delete
// router.delete("/:lessonId", lessonController.deleteLesson);

// export default router;




// routes/lessonRoutes.js
import express from "express";
import lessonController from "../controllers/lessonController.js";
// Import ALL exports from cloudinaryUpload
import upload, {
  uploadLessonFiles,
  processUploadedFiles,
  singleUpload,
} from "../middleware/cloudinaryUpload.js";
import db from "../models/index.js";

const { Lesson } = db;

const router = express.Router();

/* ---------------------------------------------------------------
   SIMPLIFIED & WORKING ROUTES
---------------------------------------------------------------- */

// Test endpoint
router.get("/test-route", (req, res) => {
  res.json({
    success: true,
    message: "Lesson routes are working",
    timestamp: new Date().toISOString(),
    cloudinary: upload.USE_CLOUDINARY ? "ENABLED" : "DISABLED",
  });
});

// Create lesson
router.post(
  "/course/:courseId/lessons",
  uploadLessonFiles, // Use the named export directly
  async (req, res) => {
    try {
      console.log("📝 Creating lesson for course:", req.params.courseId);

      // Process uploaded files
      if (req.files && Object.keys(req.files).length > 0) {
        console.log("📤 Files received:", Object.keys(req.files));
        await processUploadedFiles(req);
      }

      // Call the controller
      return await lessonController.createLesson(req, res);
    } catch (error) {
      console.error("❌ Create lesson error in route:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create lesson",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// Update lesson
router.put(
  "/:lessonId",
  uploadLessonFiles, // Use the named export directly
  async (req, res) => {
    try {
      console.log("📝 Updating lesson:", req.params.lessonId);

      // Process uploaded files
      if (req.files && Object.keys(req.files).length > 0) {
        console.log("📤 Files received:", Object.keys(req.files));
        await processUploadedFiles(req);
      }

      // Call the controller
      return await lessonController.updateLesson(req, res);
    } catch (error) {
      console.error("❌ Update lesson error in route:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update lesson",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// Get lesson by ID
router.get("/:id", lessonController.getLessonById);

// Preview endpoints
router.get(
  "/preview/course/:courseId",
  lessonController.getPreviewLessonForCourse
);
router.get(
  "/public-preview/:lessonId",
  lessonController.getPublicPreviewByLessonId
);

// Lessons by course / unit
router.get("/course/:courseId/all", lessonController.getLessonsByCourse);
router.get("/unit/:unitId/all", lessonController.getLessonsByUnit);

// Delete lesson
router.delete("/:lessonId", lessonController.deleteLesson);

// 🔥 NEW: Debug endpoint to check and fix a specific lesson
router.get("/debug/fix/:lessonId", async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId);
    
    if (!lesson) {
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }
    
    // Import the fixCloudinaryUrl helper
    const fixCloudinaryUrl = (url) => {
      if (!url) return url;
      
      if (url.includes('cloudinary.com') && url.includes('/image/upload/')) {
        if (url.includes('.pdf') || url.includes('/mathe-class/pdfs/')) {
          return url.replace('/image/upload/', '/raw/upload/');
        } else if (url.match(/\.(doc|docx|ppt|pptx|xls|xlsx)(\?|$)/i)) {
          return url.replace('/image/upload/', '/raw/upload/');
        }
      }
      return url;
    };
    
    const oldUrl = lesson.file_url;
    let newUrl = fixCloudinaryUrl(oldUrl);
    
    // Update if changed
    let updated = false;
    if (newUrl !== oldUrl) {
      await lesson.update({ file_url: newUrl });
      updated = true;
    }
    
    // Also fix video URLs if needed
    let videoUpdated = false;
    if (lesson.video_url && lesson.video_url.includes('cloudinary.com/image/upload/')) {
      const oldVideoUrl = lesson.video_url;
      const newVideoUrl = oldVideoUrl.replace('/image/upload/', '/video/upload/');
      if (newVideoUrl !== oldVideoUrl) {
        await lesson.update({ video_url: newVideoUrl });
        videoUpdated = true;
      }
    }
    
    res.json({
      success: true,
      lessonId: lesson.id,
      title: lesson.title,
      file_url: {
        old: oldUrl,
        new: newUrl,
        updated
      },
      video_url: {
        old: lesson.video_url,
        updated: videoUpdated
      },
      previewUrl: lessonController.buildFileUrls(lesson).fileUrl,
      message: updated ? "URL fixed successfully" : "No fix needed"
    });
    
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Debug endpoints
router.get("/debug/:lessonId/file", (req, res) => {
  res.json({
    success: true,
    message: "Debug endpoint",
    lessonId: req.params.lessonId,
  });
});

router.get("/debug/file", (req, res) => {
  res.json({
    success: true,
    message: "File debug endpoint",
    query: req.query,
  });
});

// Simple test upload endpoint
router.post("/test/file-upload", singleUpload, async (req, res) => {
  try {
    console.log("🧪 Test upload received file:", req.file?.originalname);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    // Process the file
    const result = await processUploadedFiles({
      files: { file: [req.file] },
    });

    return res.json({
      success: true,
      message: "Test upload successful",
      file: {
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
      },
      uploadResult: result,
    });
  } catch (error) {
    console.error("❌ Test upload error:", error);
    return res.status(500).json({
      success: false,
      error: "Test upload failed",
      details: error.message,
    });
  }
});

export default router;