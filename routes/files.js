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

// ✅ FIXED: Correct uploads directory path
const uploadsDir = path.join(__dirname, "../Uploads");

// Ensure Uploads directory exists
const ensureUploadsDir = async () => {
  try {
    await fs.access(uploadsDir);
  } catch (error) {
    await fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("✅ Created Uploads directory");
  }
};

// Initialize directory on server start
ensureUploadsDir();

/* ============================================================
   📁 FILE MANAGER API ROUTES
============================================================ */

/**
 * ✅ FIXED: Serve uploaded files from /Uploads/ path
 * This route handles files stored as /Uploads/filename in the database
 * GET /api/v1/files/Uploads/:filename
 */
router.get("/Uploads/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    
    // ✅ Security - prevent directory traversal attacks
    const safeFilename = path.basename(filename);
    const filePath = path.join(uploadsDir, safeFilename);
    
    console.log("📁 Serving file from Uploads path:", safeFilename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      console.log("❌ File not found:", safeFilename);
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    // Get file stats
    const stats = await fs.stat(filePath);
    
    // Detect MIME type based on extension
    const ext = path.extname(safeFilename).toLowerCase();
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
      '.zip': 'application/zip',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo'
    };

    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    // Set appropriate headers
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Last-Modified', stats.mtime.toUTCString());
    
    // For certain file types, allow inline display in browser
    if (['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.txt'].includes(ext)) {
      res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    } else {
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    }
    
    // Enable CORS for frontend access
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    
    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error("❌ File stream error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: "Error reading file",
        });
      }
    });

  } catch (error) {
    console.error("❌ Error serving file:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Failed to serve file",
      });
    }
  }
});

/**
 * ✅ Serve uploaded files from uploads path (alternative route)
 * GET /api/v1/files/uploads/:filename
 */
router.get("/uploads/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    
    // ✅ Security - prevent directory traversal attacks
    const safeFilename = path.basename(filename);
    const filePath = path.join(uploadsDir, safeFilename);
    
    console.log("📁 Serving file from uploads path:", safeFilename);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      console.log("❌ File not found:", safeFilename);
      return res.status(404).json({
        success: false,
        error: "File not found",
      });
    }

    // Get file stats
    const stats = await fs.stat(filePath);
    
    // Detect MIME type based on extension
    const ext = path.extname(safeFilename).toLowerCase();
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
      '.zip': 'application/zip',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo'
    };

    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    
    // Set appropriate headers
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Last-Modified', stats.mtime.toUTCString());
    
    // For certain file types, allow inline display in browser
    if (['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.txt'].includes(ext)) {
      res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    } else {
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
    }
    
    // Enable CORS for frontend access
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    
    // Create read stream and pipe to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error("❌ File stream error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: "Error reading file",
        });
      }
    });

  } catch (error) {
    console.error("❌ Error serving file:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: "Failed to serve file",
      });
    }
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
      totalSizeFormatted: formatFileSize(sortedFiles.reduce((sum, file) => sum + file.size, 0)),
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
    
    // ✅ Security - prevent directory traversal attacks
    const safeFilename = path.basename(filename);
    const filePath = path.join(uploadsDir, safeFilename);

    await fs.access(filePath);

    // Detect MIME type based on extension
    const ext = path.extname(safeFilename).toLowerCase();
    const mimeTypes = {
      ".pdf": "application/pdf",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".txt": "text/plain",
    };

    const mimeType = mimeTypes[ext] || "application/octet-stream";
    
    // Enable CORS for frontend access
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    res.setHeader("Content-Type", mimeType);
    
    // For PDFs, allow inline display
    if (ext === '.pdf') {
      res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    }
    
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
    
    // ✅ Security - prevent directory traversal attacks
    const safeFilename = path.basename(filename);
    const filePath = path.join(uploadsDir, safeFilename);

    await fs.access(filePath);

    // Enable CORS for frontend access
    res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
    
    res.download(filePath, safeFilename, (err) => {
      if (err) {
        console.error("❌ Download error:", err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: "Download failed",
            details: err.message,
          });
        }
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
      
      // ✅ Security - prevent directory traversal attacks
      const safeFilename = path.basename(filename);
      const filePath = path.join(uploadsDir, safeFilename);

      await fs.access(filePath);
      await fs.unlink(filePath);

      console.log(`✅ File deleted: ${safeFilename}`);
      res.json({
        success: true,
        message: `File "${safeFilename}" deleted successfully`,
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
    ensureUploadsDir().then(() => {
      cb(null, uploadsDir);
    }).catch(err => {
      cb(err, uploadsDir);
    });
  },
  filename: (req, file, cb) => {
    // ✅ Create safe filename with timestamp and original name
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const uniqueName = `${timestamp}-${safeName}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { 
    fileSize: 100 * 1024 * 1024 // ✅ 100MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "text/plain",
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/x-msvideo",
      "audio/mpeg",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/zip"
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
          error: "No file uploaded or file type not allowed",
        });
      }

      const fileInfo = {
        name: req.file.filename,
        originalName: req.file.originalname,
        path: `/Uploads/${req.file.filename}`,
        fullUrl: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/v1/files/Uploads/${req.file.filename}`,
        size: req.file.size,
        sizeFormatted: formatFileSize(req.file.size),
        type: path.extname(req.file.originalname).toLowerCase(),
        mimetype: req.file.mimetype,
        uploadedAt: new Date().toISOString()
      };

      console.log(`✅ File uploaded: ${fileInfo.name} (${fileInfo.sizeFormatted})`);
      
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

/**
 * ✅ Upload Multiple Files
 * POST /api/v1/files/upload-multiple
 */
router.post(
  "/upload-multiple",
  authenticateToken,
  isAdmin,
  upload.array("files", 10), // Max 10 files
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No files uploaded",
        });
      }

      const uploadedFiles = req.files.map(file => ({
        name: file.filename,
        originalName: file.originalname,
        path: `/Uploads/${file.filename}`,
        fullUrl: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/v1/files/Uploads/${file.filename}`,
        size: file.size,
        sizeFormatted: formatFileSize(file.size),
        type: path.extname(file.originalname).toLowerCase(),
        mimetype: file.mimetype,
        uploadedAt: new Date().toISOString()
      }));

      console.log(`✅ ${uploadedFiles.length} files uploaded successfully`);
      
      res.json({
        success: true,
        message: `${uploadedFiles.length} files uploaded successfully`,
        files: uploadedFiles,
      });
    } catch (error) {
      console.error("❌ Multiple file upload error:", error);
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