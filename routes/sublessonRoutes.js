// // routes/sublessonRoutes.js
// import express from "express";
// import sublessonController from "../controllers/sublessonController.js";
// import upload, {
//   uploadLessonFiles,
//   processUploadedFiles,
// } from "../middleware/cloudinaryUpload.js";
// import { authenticateToken } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // All sublesson routes require authentication
// router.use(authenticateToken);

// /* -------------------------
//    CRUD Operations
// ------------------------- */

// // Get all sublessons for a lesson
// router.get("/lesson/:lessonId", sublessonController.getSubLessonsByLesson);

// // Get a specific sublesson
// router.get("/:sublessonId", sublessonController.getSubLessonById);

// // Create a new sublesson with multiple files
// router.post("/lesson/:lessonId", uploadLessonFiles, async (req, res) => {
//   try {
//     console.log("📝 Creating sublesson for lesson:", req.params.lessonId);

//     // Process uploaded files
//     if (req.files && Object.keys(req.files).length > 0) {
//       console.log("📤 Files received:", Object.keys(req.files));
//       await processUploadedFiles(req);
//     }

//     // Call the controller
//     return await sublessonController.createSubLesson(req, res);
//   } catch (error) {
//     console.error("❌ Create sublesson error in route:", error);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to create sublesson",
//       details:
//         process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// });

// // Update a sublesson with multiple files
// router.put("/:sublessonId", uploadLessonFiles, async (req, res) => {
//   try {
//     console.log("📝 Updating sublesson:", req.params.sublessonId);

//     // Process uploaded files
//     if (req.files && Object.keys(req.files).length > 0) {
//       console.log("📤 Files received:", Object.keys(req.files));
//       await processUploadedFiles(req);
//     }

//     // Call the controller
//     return await sublessonController.updateSubLesson(req, res);
//   } catch (error) {
//     console.error("❌ Update sublesson error in route:", error);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to update sublesson",
//       details:
//         process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// });

// // Delete a sublesson
// router.delete("/:sublessonId", sublessonController.deleteSubLesson);

// // Delete a sublesson attachment
// router.delete(
//   "/attachments/:attachmentId",
//   sublessonController.deleteSubLessonAttachment
// );

// // Test endpoint
// router.get("/test/route", (req, res) => {
//   res.json({
//     success: true,
//     message: "Sublesson routes are working",
//     timestamp: new Date().toISOString(),
//   });
// });

// export default router;





// routes/sublessonRoutes.js
import express from "express";
import sublessonController from "../controllers/sublessonController.js";
import upload, {
  uploadLessonFiles,
  processUploadedFiles,
} from "../middleware/cloudinaryUpload.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// All sublesson routes require authentication
router.use(authenticateToken);

/* -------------------------
   CRUD Operations
------------------------- */

// Get all sublessons for a lesson
router.get("/lesson/:lessonId", sublessonController.getSubLessonsByLesson);

// Get a specific sublesson
router.get("/:sublessonId", sublessonController.getSubLessonById);

// Create a new sublesson with multiple files
router.post(
  "/lesson/:lessonId",
  uploadLessonFiles,
  async (req, res) => {
    try {
      console.log("📝 Creating sublesson for lesson:", req.params.lessonId);

      // Process uploaded files
      if (req.files && Object.keys(req.files).length > 0) {
        console.log("📤 Files received:", Object.keys(req.files));
        await processUploadedFiles(req);
      }

      // Call the controller
      return await sublessonController.createSubLesson(req, res);
    } catch (error) {
      console.error("❌ Create sublesson error in route:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create sublesson",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// Update a sublesson with multiple files
router.put(
  "/:sublessonId",
  uploadLessonFiles,
  async (req, res) => {
    try {
      console.log("📝 Updating sublesson:", req.params.sublessonId);

      // Process uploaded files
      if (req.files && Object.keys(req.files).length > 0) {
        console.log("📤 Files received:", Object.keys(req.files));
        await processUploadedFiles(req);
      }

      // Call the controller
      return await sublessonController.updateSubLesson(req, res);
    } catch (error) {
      console.error("❌ Update sublesson error in route:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update sublesson",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
);

// Delete a sublesson
router.delete("/:sublessonId", sublessonController.deleteSubLesson);

// Delete a sublesson attachment
router.delete("/attachments/:attachmentId", sublessonController.deleteSubLessonAttachment);

// Test endpoint
router.get("/test/route", (req, res) => {
  res.json({
    success: true,
    message: "Sublesson routes are working",
    timestamp: new Date().toISOString(),
  });
});

export default router;