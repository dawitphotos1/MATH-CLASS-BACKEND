// //routes/files.js

// import express from "express";
// import path from "path";
// import fs from "fs/promises";
// import multer from "multer";
// import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const router = express.Router();

// const uploadsDir = path.join(__dirname, "..", "Uploads");

// // ✅ Ensure Uploads directory exists
// const ensureUploadsDir = async () => {
//   try {
//     await fs.access(uploadsDir);
//   } catch (error) {
//     await fs.mkdir(uploadsDir, { recursive: true });
//     console.log("✅ Created Uploads directory");
//   }
// };

// // Initialize directory on server start
// ensureUploadsDir();

// /* ============================================================
//    📁 FILE MANAGER API ROUTES
// ============================================================ */

// /**
//  * ✅ Get all files with metadata (Admin only)
//  * GET /api/v1/files
//  */
// router.get("/", authenticateToken, isAdmin, async (req, res) => {
//   try {
//     await ensureUploadsDir();

//     const files = await fs.readdir(uploadsDir);

//     const filesWithMetadata = await Promise.all(
//       files.map(async (filename) => {
//         const filePath = path.join(uploadsDir, filename);
//         const stats = await fs.stat(filePath);

//         return {
//           name: filename,
//           path: `/Uploads/${filename}`,
//           fullPath: filePath,
//           size: stats.size,
//           sizeFormatted: formatFileSize(stats.size),
//           type: path.extname(filename).toLowerCase(),
//           modified: stats.mtime,
//           created: stats.birthtime,
//           isDirectory: stats.isDirectory(),
//         };
//       })
//     );

//     // Sort by modified date (newest first)
//     const sortedFiles = filesWithMetadata.sort(
//       (a, b) => new Date(b.modified) - new Date(a.modified)
//     );

//     res.json({
//       success: true,
//       files: sortedFiles,
//       totalFiles: sortedFiles.length,
//       totalSize: sortedFiles.reduce((sum, file) => sum + file.size, 0),
//       directory: uploadsDir,
//     });
//   } catch (error) {
//     console.error("❌ Error listing files:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to list files",
//       details: error.message,
//     });
//   }
// });

// /**
//  * ✅ Get file statistics
//  * GET /api/v1/files/stats
//  */
// router.get("/stats", authenticateToken, isAdmin, async (req, res) => {
//   try {
//     await ensureUploadsDir();

//     const files = await fs.readdir(uploadsDir);
//     let totalSize = 0;
//     const fileTypes = {};

//     for (const filename of files) {
//       const filePath = path.join(uploadsDir, filename);
//       const stats = await fs.stat(filePath);
//       totalSize += stats.size;

//       const ext = path.extname(filename).toLowerCase() || "no-extension";
//       fileTypes[ext] = (fileTypes[ext] || 0) + 1;
//     }

//     res.json({
//       success: true,
//       stats: {
//         totalFiles: files.length,
//         totalSize,
//         totalSizeFormatted: formatFileSize(totalSize),
//         fileTypes,
//         directory: uploadsDir,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error getting file stats:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to get file statistics",
//     });
//   }
// });

// /**
//  * ✅ Preview File (PDF/Image) Inline in Browser
//  * GET /api/v1/files/preview/:filename
//  */
// router.get("/preview/:filename", authenticateToken, async (req, res) => {
//   try {
//     const { filename } = req.params;
//     const filePath = path.join(uploadsDir, filename);

//     await fs.access(filePath);

//     // Detect MIME type based on extension
//     const ext = path.extname(filename).toLowerCase();
//     const mimeTypes = {
//       ".pdf": "application/pdf",
//       ".jpg": "image/jpeg",
//       ".jpeg": "image/jpeg",
//       ".png": "image/png",
//       ".gif": "image/gif",
//       ".txt": "text/plain",
//       ".mp4": "video/mp4",
//       ".mp3": "audio/mpeg",
//     };

//     const mimeType = mimeTypes[ext] || "application/octet-stream";
//     res.setHeader("Content-Type", mimeType);
//     res.sendFile(filePath);
//   } catch (error) {
//     console.error("❌ File preview error:", error);
//     res.status(404).json({
//       success: false,
//       error: "File not found",
//     });
//   }
// });

// /**
//  * ✅ Download File Securely
//  * GET /api/v1/files/download/:filename
//  */
// router.get("/download/:filename", authenticateToken, async (req, res) => {
//   try {
//     const { filename } = req.params;
//     const filePath = path.join(uploadsDir, filename);

//     await fs.access(filePath);

//     res.download(filePath, filename, (err) => {
//       if (err) {
//         console.error("Download error:", err);
//         res.status(500).json({
//           success: false,
//           error: "Download failed",
//           details: err.message,
//         });
//       }
//     });
//   } catch (error) {
//     console.error("❌ File download error:", error);
//     res.status(404).json({
//       success: false,
//       error: "File not found",
//     });
//   }
// });

// /**
//  * ✅ Delete File (Admin only)
//  * DELETE /api/v1/files/delete/:filename
//  */
// router.delete(
//   "/delete/:filename",
//   authenticateToken,
//   isAdmin,
//   async (req, res) => {
//     try {
//       const { filename } = req.params;
//       const filePath = path.join(uploadsDir, filename);

//       await fs.access(filePath);
//       await fs.unlink(filePath);

//       console.log(`✅ File deleted: ${filename}`);
//       res.json({
//         success: true,
//         message: `File "${filename}" deleted successfully`,
//       });
//     } catch (error) {
//       console.error("❌ File deletion error:", error);
//       res.status(500).json({
//         success: false,
//         error: "Failed to delete file",
//         details: error.message,
//       });
//     }
//   }
// );

// /**
//  * ✅ Upload File
//  * POST /api/v1/files/upload
//  */
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadsDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueName = `${Date.now()}-${file.originalname.replace(
//       /\s+/g,
//       "_"
//     )}`;
//     cb(null, uniqueName);
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = [
//       "image/jpeg",
//       "image/png",
//       "image/gif",
//       "application/pdf",
//       "text/plain",
//       "video/mp4",
//       "audio/mpeg",
//       "application/msword",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     ];

//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error(`File type ${file.mimetype} not allowed`), false);
//     }
//   },
// });

// router.post(
//   "/upload",
//   authenticateToken,
//   isAdmin,
//   upload.single("file"),
//   async (req, res) => {
//     try {
//       if (!req.file) {
//         return res.status(400).json({
//           success: false,
//           error: "No file uploaded",
//         });
//       }

//       const fileInfo = {
//         name: req.file.filename,
//         originalName: req.file.originalname,
//         path: `/Uploads/${req.file.filename}`,
//         size: req.file.size,
//         sizeFormatted: formatFileSize(req.file.size),
//         type: path.extname(req.file.originalname).toLowerCase(),
//         mimetype: req.file.mimetype,
//       };

//       console.log(`✅ File uploaded: ${fileInfo.name}`);
//       res.json({
//         success: true,
//         message: "File uploaded successfully",
//         file: fileInfo,
//       });
//     } catch (error) {
//       console.error("❌ File upload error:", error);
//       res.status(500).json({
//         success: false,
//         error: "File upload failed",
//         details: error.message,
//       });
//     }
//   }
// );

// /* ============================================================
//    🔧 HELPER FUNCTIONS
// ============================================================ */

// function formatFileSize(bytes) {
//   if (bytes === 0) return "0 Bytes";

//   const k = 1024;
//   const sizes = ["Bytes", "KB", "MB", "GB"];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));

//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
// }

// export default router;





// routes/files.js

import express from "express";
import path from "path";
import fs from "fs/promises";
import multer from "multer";
import { authenticateToken, isAdmin } from "../middleware/authMiddleware.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const uploadsDir = path.join(__dirname, "..", "Uploads");

// ✅ Ensure Uploads directory exists
const ensureUploadsDir = async () => {
  try {
    await fs.access(uploadsDir);
  } catch (error) {
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log("✅ Created Uploads directory");
  }
};

// Initialize directory on server start
ensureUploadsDir();

/* ============================================================
   📁 FILE MANAGER API ROUTES
============================================================ */

/**
 * ✅ Serve uploaded files publicly (for PDFs, images, etc.)
 * GET /api/v1/files/uploads/:filename
 */
router.get("/uploads/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);
    
    console.log("📁 Serving file:", filename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      console.log("❌ File not found:", filename);
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    // Get file stats
    const stats = await fs.stat(filePath);
    
    // Detect MIME type based on extension
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.txt': 'text/plain',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    // Set appropriate headers
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Last-Modified', stats.mtime.toUTCString());
    
    // For PDFs, allow inline display in browser
    if (ext === '.pdf') {
      res.setHeader('Content-Disposition', 'inline; filename="' + filename + '"');
    } else {
      res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
    }
    
    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error("❌ File stream error:", error);
      res.status(500).json({
        success: false,
        error: "Error reading file",
      });
    });

  } catch (error) {
    console.error("❌ Error serving file:", error);
    res.status(500).json({
      success: false,
      error: "Failed to serve file",
    });
  }
});

/**
 * ✅ Get all files with metadata (Admin only)
 * GET /api/v1/files
 */
router.get("/", authenticateToken, isAdmin, async (req, res) => {
  try {
    await ensureUploadsDir();

    const files = await fs.readdir(uploadsDir);

    const filesWithMetadata = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(uploadsDir, filename);
        const stats = await fs.stat(filePath);

        return {
          name: filename,
          path: `/Uploads/${filename}`,
          fullPath: filePath,
          size: stats.size,
          sizeFormatted: formatFileSize(stats.size),
          type: path.extname(filename).toLowerCase(),
          modified: stats.mtime,
          created: stats.birthtime,
          isDirectory: stats.isDirectory(),
        };
      })
    );

    // Sort by modified date (newest first)
    const sortedFiles = filesWithMetadata.sort(
      (a, b) => new Date(b.modified) - new Date(a.modified)
    );

    res.json({
      success: true,
      files: sortedFiles,
      totalFiles: sortedFiles.length,
      totalSize: sortedFiles.reduce((sum, file) => sum + file.size, 0),
      directory: uploadsDir,
    });
  } catch (error) {
    console.error("❌ Error listing files:", error);
    res.status(500).json({
      success: false,
      error: "Failed to list files",
      details: error.message,
    });
  }
});

/**
 * ✅ Get file statistics
 * GET /api/v1/files/stats
 */
router.get("/stats", authenticateToken, isAdmin, async (req, res) => {
  try {
    await ensureUploadsDir();

    const files = await fs.readdir(uploadsDir);
    let totalSize = 0;
    const fileTypes = {};

    for (const filename of files) {
      const filePath = path.join(uploadsDir, filename);
      const stats = await fs.stat(filePath);
      totalSize += stats.size;

      const ext = path.extname(filename).toLowerCase() || "no-extension";
      fileTypes[ext] = (fileTypes[ext] || 0) + 1;
    }

    res.json({
      success: true,
      stats: {
        totalFiles: files.length,
        totalSize,
        totalSizeFormatted: formatFileSize(totalSize),
        fileTypes,
        directory: uploadsDir,
      },
    });
  } catch (error) {
    console.error("❌ Error getting file stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get file statistics",
    });
  }
});

/**
 * ✅ Preview File (PDF/Image) Inline in Browser
 * GET /api/v1/files/preview/:filename
 */
router.get("/preview/:filename", authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);

    await fs.access(filePath);

    // Detect MIME type based on extension
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      ".pdf": "application/pdf",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".txt": "text/plain",
      ".mp4": "video/mp4",
      ".mp3": "audio/mpeg",
    };

    const mimeType = mimeTypes[ext] || "application/octet-stream";
    res.setHeader("Content-Type", mimeType);
    res.sendFile(filePath);
  } catch (error) {
    console.error("❌ File preview error:", error);
    res.status(404).json({
      success: false,
      error: "File not found",
    });
  }
});

/**
 * ✅ Download File Securely
 * GET /api/v1/files/download/:filename
 */
router.get("/download/:filename", authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);

    await fs.access(filePath);

    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Download error:", err);
        res.status(500).json({
          success: false,
          error: "Download failed",
          details: err.message,
        });
      }
    });
  } catch (error) {
    console.error("❌ File download error:", error);
    res.status(404).json({
      success: false,
      error: "File not found",
    });
  }
});

/**
 * ✅ Delete File (Admin only)
 * DELETE /api/v1/files/delete/:filename
 */
router.delete(
  "/delete/:filename",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(uploadsDir, filename);

      await fs.access(filePath);
      await fs.unlink(filePath);

      console.log(`✅ File deleted: ${filename}`);
      res.json({
        success: true,
        message: `File "${filename}" deleted successfully`,
      });
    } catch (error) {
      console.error("❌ File deletion error:", error);
      res.status(500).json({
        success: false,
        error: "Failed to delete file",
        details: error.message,
      });
    }
  }
);

/**
 * ✅ Upload File
 * POST /api/v1/files/upload
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname.replace(
      /\s+/g,
      "_"
    )}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "text/plain",
      "video/mp4",
      "audio/mpeg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`), false);
    }
  },
});

router.post(
  "/upload",
  authenticateToken,
  isAdmin,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No file uploaded",
        });
      }

      const fileInfo = {
        name: req.file.filename,
        originalName: req.file.originalname,
        path: `/Uploads/${req.file.filename}`,
        size: req.file.size,
        sizeFormatted: formatFileSize(req.file.size),
        type: path.extname(req.file.originalname).toLowerCase(),
        mimetype: req.file.mimetype,
      };

      console.log(`✅ File uploaded: ${fileInfo.name}`);
      res.json({
        success: true,
        message: "File uploaded successfully",
        file: fileInfo,
      });
    } catch (error) {
      console.error("❌ File upload error:", error);
      res.status(500).json({
        success: false,
        error: "File upload failed",
        details: error.message,
      });
    }
  }
);

/* ============================================================
   🔧 HELPER FUNCTIONS
============================================================ */

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default router;