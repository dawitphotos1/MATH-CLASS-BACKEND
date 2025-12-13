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




import express from "express";
import lessonController from "../controllers/lessonController.js";
// Use cloudinaryUpload.js (the fixed version)
import upload from "../middleware/cloudinaryUpload.js";

const router = express.Router();

/* ---------------------------------------------------------------
   CRUD ROUTES
---------------------------------------------------------------- */

// 🆕 Test endpoint to check upload functionality
router.get("/test-upload", (req, res) => {
  res.json({
    success: true,
    message: "Lesson routes are working",
    endpoints: {
      create: "POST /course/:courseId/lessons",
      update: "PUT /:lessonId",
      get: "GET /:id",
      delete: "DELETE /:lessonId",
      preview: "GET /preview/course/:courseId",
    },
    middleware: {
      name: "cloudinaryUpload",
      configured: upload.USE_CLOUDINARY,
      maxFileSize: process.env.MAX_FILE_SIZE || "150MB",
    },
  });
});

// 🆕 Create lesson with file upload
router.post(
  "/course/:courseId/lessons",
  upload.uploadLessonFiles,
  async (req, res, next) => {
    try {
      // Process uploaded files before controller
      if (req.files && Object.keys(req.files).length > 0) {
        console.log("📤 Processing uploads before create...");
        await upload.processUploadedFiles(req);
      }
      next();
    } catch (err) {
      console.error("❌ Upload processing error:", err);
      res.status(500).json({
        success: false,
        error: "Failed to process uploads",
        details: err.message,
      });
    }
  },
  lessonController.createLesson
);

// 🆕 Update lesson with file upload
router.put(
  "/:lessonId",
  upload.uploadLessonFiles,
  async (req, res, next) => {
    try {
      // Process uploaded files before controller
      if (req.files && Object.keys(req.files).length > 0) {
        console.log("📤 Processing uploads before update...");
        await upload.processUploadedFiles(req);
      }
      next();
    } catch (err) {
      console.error("❌ Upload processing error:", err);
      res.status(500).json({
        success: false,
        error: "Failed to process uploads",
        details: err.message,
      });
    }
  },
  lessonController.updateLesson
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

// Debug endpoints
router.get("/debug/:lessonId/file", lessonController.debugLessonFile);
router.get("/debug/file", lessonController.debugLessonFile);
router.post("/fix-url/:lessonId", lessonController.fixLessonFileUrl);

// 🆕 Test file upload endpoint
router.post("/test/file-upload", upload.single("file"), async (req, res) => {
  try {
    console.log("🧪 Test file upload:", req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    // Process the upload
    const result = await upload.processUploadedFiles({
      files: { file: [req.file] },
    });

    res.json({
      success: true,
      message: "Test upload successful",
      file: {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
      uploadResult: result,
      fileUrl: result.fileUrl,
      cloudinaryUsed: upload.USE_CLOUDINARY,
      backendUrl: process.env.BACKEND_URL,
    });
  } catch (error) {
    console.error("❌ Test upload error:", error);
    res.status(500).json({
      success: false,
      error: "Test upload failed",
      details: error.message,
    });
  }
});

export default router;