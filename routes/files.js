// // routes/files.js
// import express from "express";
// import path from "path";
// import fs from "fs/promises";
// import fsSync from "fs";
// import { authenticateToken } from "../middleware/authMiddleware.js";
// import { fileURLToPath } from "url";

// const router = express.Router();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// /* ---------------------------------------------------------------
//    UPLOADS DIRECTORY
// --------------------------------------------------------------- */
// const uploadsDir = path.join(process.cwd(), "Uploads");

// if (!fsSync.existsSync(uploadsDir)) {
//   fsSync.mkdirSync(uploadsDir, { recursive: true });
//   console.log("📁 Created Uploads directory:", uploadsDir);
// }

// /* ---------------------------------------------------------------
//    PREVIEW LESSON ENDPOINT (Simplified)
//    URL → /api/v1/files/preview-lesson/:lessonId
// --------------------------------------------------------------- */
// router.get("/preview-lesson/:lessonId", authenticateToken, async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     const userId = req.user.id;

//     const db = await import("../models/index.js");
//     const { Lesson, Course, Enrollment } = db.default;

//     const lesson = await Lesson.findByPk(lessonId, {
//       include: [{ model: Course, as: "course" }],
//     });

//     if (!lesson)
//       return res.status(404).json({
//         success: false,
//         error: "Lesson not found",
//       });

//     // Permission check
//     const isAdmin = req.user.role === "admin";
//     const isTeacher = lesson.course?.teacher_id === userId;
//     const isPreview = lesson.is_preview;

//     const isEnrolled = await Enrollment.findOne({
//       where: { user_id: userId, course_id: lesson.course_id, approval_status: "approved" },
//     });

//     if (!isAdmin && !isTeacher && !isPreview && !isEnrolled) {
//       return res.status(403).json({
//         success: false,
//         error: "Access denied. Not enrolled.",
//       });
//     }

//     // Build absolute URLs
//     const backend = (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/+$/, "");

//     const clean = (x) => x?.replace(/^Uploads\//, "").replace(/^\/+/, "");

//     const data = lesson.toJSON();
//     if (data.video_url && !data.video_url.startsWith("http"))
//       data.video_url = `${backend}/api/v1/files/${clean(data.video_url)}`;

//     if (data.file_url && !data.file_url.startsWith("http"))
//       data.file_url = `${backend}/api/v1/files/${clean(data.file_url)}`;

//     return res.json({
//       success: true,
//       lesson: data,
//     });

//   } catch (err) {
//     console.error("preview-lesson error:", err);
//     return res.status(500).json({ success: false, error: "Failed to load preview" });
//   }
// });

// /* ---------------------------------------------------------------
//    UNIVERSAL FILE SERVER — FIXED V3
//    Handles EVERYTHING (PDF, MP4, images, docs)
// --------------------------------------------------------------- */
// router.get("/:filename", async (req, res) => {
//   try {
//     let { filename } = req.params;

//     // Security: strip paths
//     filename = path.basename(filename);

//     // Support missing leading slash & remove accidental "Uploads/"
//     const filePath = path.join(uploadsDir, filename.replace(/^Uploads\//, ""));

//     console.log("📁 File request:", filePath);

//     // Check existence
//     await fs.access(filePath);

//     // Guess MIME type
//     const ext = path.extname(filename).toLowerCase();
//     const mime = {
//       ".pdf": "application/pdf",
//       ".mp4": "video/mp4",
//       ".jpg": "image/jpeg",
//       ".jpeg": "image/jpeg",
//       ".png": "image/png",
//       ".gif": "image/gif",
//       ".doc": "application/msword",
//       ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       ".txt": "text/plain",
//     }[ext] || "application/octet-stream";

//     res.setHeader("Content-Type", mime);

//     // Inline display for PDF / images / mp4
//     res.setHeader(
//       "Content-Disposition",
//       ["pdf", "jpg", "png", "jpeg", "gif", "mp4"].includes(ext.replace(".", ""))
//         ? `inline; filename="${filename}"`
//         : `attachment; filename="${filename}"`
//     );

//     // Stream the file
//     fsSync.createReadStream(filePath).pipe(res);
//   } catch (err) {
//     console.error("❌ File server error:", err.message);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to load file",
//       details: err.message,
//     });
//   }
// });

// export default router;


// routes/files.js
import express from "express";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------------------------------------------------------------
   UPLOADS DIRECTORY
--------------------------------------------------------------- */
const uploadsDir = path.join(process.cwd(), "Uploads");

if (!fsSync.existsSync(uploadsDir)) {
  fsSync.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Created Uploads directory:", uploadsDir);
}

/* ---------------------------------------------------------------
   PUBLIC PREVIEW LESSON ENDPOINT - No authentication required
   URL → /api/v1/files/preview-lesson/:lessonId
--------------------------------------------------------------- */
router.get("/preview-lesson/:lessonId", async (req, res) => {
  try {
    const { lessonId } = req.params;

    console.log("🔓 PUBLIC ACCESS - Preview lesson requested:", lessonId);

    const db = await import("../models/index.js");
    const { Lesson, Course } = db.default;

    const lesson = await Lesson.findByPk(lessonId, {
      include: [{ model: Course, as: "course" }],
    });

    if (!lesson) {
      console.log("❌ Preview lesson not found:", lessonId);
      return res.status(404).json({
        success: false,
        error: "Preview lesson not found",
      });
    }

    // Build absolute URLs
    const backend = (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/+$/, "");

    const clean = (x) => x?.replace(/^Uploads\//, "").replace(/^\/+/, "");

    const data = lesson.toJSON();
    
    // Build full URLs for media
    if (data.video_url && !data.video_url.startsWith("http")) {
      data.video_url = `${backend}/api/v1/files/${clean(data.video_url)}`;
    }

    if (data.file_url && !data.file_url.startsWith("http")) {
      data.file_url = `${backend}/api/v1/files/${clean(data.file_url)}`;
    }

    console.log("✅ Public preview served successfully:", {
      lessonId: data.id,
      title: data.title,
      is_preview: data.is_preview,
      course: data.course?.title
    });

    return res.json({
      success: true,
      lesson: data,
      access: "public",
      message: "Public preview access granted"
    });

  } catch (err) {
    console.error("❌ Public preview error:", err);
    return res.status(500).json({ 
      success: false, 
      error: "Failed to load preview" 
    });
  }
});

/* ---------------------------------------------------------------
   UNIVERSAL FILE SERVER — Public file access
   Handles EVERYTHING (PDF, MP4, images, docs)
--------------------------------------------------------------- */
router.get("/:filename", async (req, res) => {
  try {
    let { filename } = req.params;

    // Security: strip paths
    filename = path.basename(filename);

    // Support missing leading slash & remove accidental "Uploads/"
    const filePath = path.join(uploadsDir, filename.replace(/^Uploads\//, ""));

    console.log("📁 File request:", filePath);

    // Check existence
    await fs.access(filePath);

    // Guess MIME type
    const ext = path.extname(filename).toLowerCase();
    const mime = {
      ".pdf": "application/pdf",
      ".mp4": "video/mp4",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".txt": "text/plain",
    }[ext] || "application/octet-stream";

    res.setHeader("Content-Type", mime);

    // Inline display for PDF / images / mp4
    res.setHeader(
      "Content-Disposition",
      ["pdf", "jpg", "png", "jpeg", "gif", "mp4"].includes(ext.replace(".", ""))
        ? `inline; filename="${filename}"`
        : `attachment; filename="${filename}"`
    );

    // Stream the file
    fsSync.createReadStream(filePath).pipe(res);
  } catch (err) {
    console.error("❌ File server error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to load file",
      details: err.message,
    });
  }
});

export default router;