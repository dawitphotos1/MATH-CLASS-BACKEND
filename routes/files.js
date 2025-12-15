// routes/files.js
import express from "express";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";

import lessonController from "../controllers/lessonController.js";
import upload, { fixCloudinaryUrl } from "../middleware/cloudinaryUpload.js";

const router = express.Router();

/* ---------------------------------------------------------------
   PATH HELPERS
---------------------------------------------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(process.cwd(), "Uploads");
if (!fsSync.existsSync(UPLOADS_DIR)) {
  fsSync.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/* ---------------------------------------------------------------
   DEBUG ALL ENVIRONMENT VARIABLES
---------------------------------------------------------------- */
router.get("/debug-all-env", (req, res) => {
  // Get all environment variables
  const allEnvVars = {};
  
  // List all variables we care about
  const importantVars = [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'JWT_SECRET',
    'STRIPE_SECRET_KEY',
    'MAIL_USER',
    'MAIL_PASS',
    'FRONTEND_URL',
    'BACKEND_URL',
    'USE_CLOUDINARY',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];
  
  // Add important variables
  importantVars.forEach(varName => {
    if (process.env[varName]) {
      allEnvVars[varName] = process.env[varName].includes('SECRET') || 
                           process.env[varName].includes('KEY') || 
                           process.env[varName].includes('PASS') 
                           ? "***SET***" 
                           : process.env[varName];
    } else {
      allEnvVars[varName] = "NOT SET";
    }
  });
  
  // Also show total count
  const totalVars = Object.keys(process.env).length;
  
  res.json({
    success: true,
    message: "Environment Variables Debug",
    total_variables: totalVars,
    important_variables: allEnvVars,
    timestamp: new Date().toISOString(),
    platform: process.platform,
    node_version: process.version,
    middleware_cloudinary_enabled: upload.IS_CLOUDINARY_ENABLED || false
  });
});

/* ---------------------------------------------------------------
   CLOUDINARY CONFIGURATION TEST
---------------------------------------------------------------- */
router.get("/cloudinary-test", async (req, res) => {
  try {
    const config = {
      USE_CLOUDINARY: process.env.USE_CLOUDINARY,
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? "SET" : "NOT SET",
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
        ? "SET"
        : "NOT SET",
      BACKEND_URL: process.env.BACKEND_URL,
      NODE_ENV: process.env.NODE_ENV,
      UPLOAD_DIR: UPLOADS_DIR,
    };

    let cloudinaryStatus = "NOT_CONFIGURED";
    let cloudinaryPing = null;

    if (config.CLOUDINARY_CLOUD_NAME && config.CLOUDINARY_API_KEY) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });

      try {
        cloudinaryPing = await cloudinary.api.ping();
        cloudinaryStatus = "CONNECTED ✅";
      } catch (err) {
        cloudinaryStatus = `ERROR: ${err.message}`;
      }
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      config,
      cloudinary: {
        status: cloudinaryStatus,
        ping: cloudinaryPing,
        middleware: upload.IS_CLOUDINARY_ENABLED ? "ENABLED ✅" : "DISABLED ❌",
      },
      uploads: {
        directory: UPLOADS_DIR,
        exists: fsSync.existsSync(UPLOADS_DIR),
        fileCount: fsSync.existsSync(UPLOADS_DIR)
          ? fsSync.readdirSync(UPLOADS_DIR).length
          : 0,
      },
    });
  } catch (error) {
    console.error("❌ Cloudinary test error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

/* ---------------------------------------------------------------
   TEST DIRECT CLOUDINARY UPLOAD
---------------------------------------------------------------- */
router.get("/test-direct-upload", async (req, res) => {
  try {
    console.log("🧪 Testing direct Cloudinary upload...");
    
    // Create a simple test PDF
    const testPdf = Buffer.from(`%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
>>
endobj
xref
0 4
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000110 00000 n
trailer
<<
/Size 4
/Root 1 0 R
>>
startxref
150
%%EOF`);
    
    // Upload directly using cloudinary SDK
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "mathe-class/test",
          public_id: `test_${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(testPdf);
    });
    
    res.json({
      success: true,
      message: "Direct Cloudinary upload successful!",
      url: result.secure_url,
      resource_type: result.resource_type,
      uses_raw_upload: result.secure_url.includes('/raw/upload/'),
      file_url: result.secure_url,
      public_id: result.public_id
    });
    
  } catch (error) {
    console.error("❌ Direct upload test failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      cloudinary_config: {
        cloud_name: cloudinary.config().cloud_name,
        api_key: cloudinary.config().api_key ? "SET" : "NOT SET",
        api_secret: cloudinary.config().api_secret ? "SET" : "NOT SET",
      }
    });
  }
});

/* ---------------------------------------------------------------
   DEBUG: Check specific lesson URL
---------------------------------------------------------------- */
router.get("/debug/lesson/:lessonId", async (req, res) => {
  try {
    const { lessonId } = req.params;
    const db = await import("../models/index.js");
    const { Lesson } = db.default;
    
    const lesson = await Lesson.findByPk(lessonId, {
      attributes: ['id', 'title', 'file_url', 'content_type', 'is_preview']
    });
    
    if (!lesson) {
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }
    
    // Test URL accessibility
    let urlTest = { accessible: false, status: null };
    if (lesson.file_url) {
      try {
        const testUrl = fixCloudinaryUrl(lesson.file_url);
        const response = await fetch(testUrl, { method: 'HEAD' });
        urlTest = {
          accessible: response.ok,
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          url: testUrl
        };
      } catch (fetchError) {
        urlTest.error = fetchError.message;
      }
    }
    
    const urlAnalysis = {
      hasUrl: !!lesson.file_url,
      isCloudinary: lesson.file_url?.includes('cloudinary.com') || false,
      usesImageUpload: lesson.file_url?.includes('/image/upload/') || false,
      usesRawUpload: lesson.file_url?.includes('/raw/upload/') || false,
      isPdf: lesson.file_url?.includes('.pdf') || false,
      currentUrl: lesson.file_url,
      fixedUrl: lesson.file_url ? fixCloudinaryUrl(lesson.file_url) : null,
      needsFix: lesson.file_url?.includes('/image/upload/') && 
               (lesson.file_url.includes('.pdf') || lesson.file_url.includes('/pdfs/'))
    };
    
    res.json({
      success: true,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        file_url: lesson.file_url,
        content_type: lesson.content_type,
        is_preview: lesson.is_preview
      },
      analysis: urlAnalysis,
      urlTest,
      suggestedAction: urlAnalysis.needsFix ? 
        `Run: GET /api/v1/lessons/debug/fix/${lessonId} to fix URL` : 
        "URL is correct"
    });
  } catch (error) {
    console.error("❌ Debug lesson error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ---------------------------------------------------------------
   FIX ALL CLOUDINARY URLS IN DATABASE
---------------------------------------------------------------- */
router.get("/fix-all-cloudinary-urls", async (req, res) => {
  try {
    const db = await import("../models/index.js");
    const { Lesson, Sequelize } = db.default;
    
    // Find all lessons with Cloudinary URLs
    const lessons = await Lesson.findAll({
      where: {
        file_url: {
          [Sequelize.Op.like]: '%cloudinary.com%'
        }
      }
    });
    
    console.log(`📊 Found ${lessons.length} lessons with Cloudinary URLs`);
    
    let fixedCount = 0;
    const results = [];
    
    for (const lesson of lessons) {
      const oldUrl = lesson.file_url;
      const newUrl = fixCloudinaryUrl(oldUrl);
      
      if (newUrl !== oldUrl) {
        await lesson.update({ file_url: newUrl });
        fixedCount++;
        
        results.push({
          lessonId: lesson.id,
          title: lesson.title,
          oldUrl: oldUrl.substring(0, 100),
          newUrl: newUrl.substring(0, 100),
          fixed: true
        });
        
        console.log(`✅ Fixed lesson ${lesson.id}: ${oldUrl.substring(0, 80)}... -> ${newUrl.substring(0, 80)}...`);
      } else {
        results.push({
          lessonId: lesson.id,
          title: lesson.title,
          url: oldUrl.substring(0, 100),
          fixed: false,
          reason: "Already correct"
        });
      }
    }
    
    res.json({
      success: true,
      message: `Fixed ${fixedCount} out of ${lessons.length} Cloudinary URLs`,
      totalLessons: lessons.length,
      fixedCount,
      results: results.slice(0, 20)
    });
  } catch (error) {
    console.error("❌ Bulk fix error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/* ---------------------------------------------------------------
   UPLOAD ENV DEBUG
---------------------------------------------------------------- */
router.get("/debug/env", (req, res) => {
  res.json({
    success: true,
    cloudinary: {
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME
        ? "SET"
        : "NOT SET",
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? "SET" : "NOT SET",
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
        ? "SET"
        : "NOT SET",
      USE_CLOUDINARY: process.env.USE_CLOUDINARY || "undefined",
    },
    node_env: process.env.NODE_ENV,
    backend_url: process.env.BACKEND_URL,
    uploads_dir: UPLOADS_DIR,
    max_file_size: process.env.MAX_FILE_SIZE,
    message: "Environment variables check",
    middleware_status: {
      IS_CLOUDINARY_ENABLED: upload.IS_CLOUDINARY_ENABLED || false
    }
  });
});

/* ---------------------------------------------------------------
   TEST UPLOAD with Cloudinary
---------------------------------------------------------------- */
router.post("/test-upload", upload.single("file"), async (req, res) => {
  try {
    console.log(
      "🧪 Test upload received:",
      req.file ? req.file.originalname : "No file"
    );

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    // Process the file using our upload middleware
    const result = await upload.processUploadedFiles({
      files: { file: [req.file] },
    });

    // Test if the URL is accessible
    let urlTest = { accessible: false, status: null };
    if (result.fileUrl && result.fileUrl.startsWith("http")) {
      try {
        const response = await fetch(result.fileUrl, { method: "HEAD" });
        urlTest = {
          accessible: response.ok,
          status: response.status,
          statusText: response.statusText,
        };
      } catch (fetchError) {
        urlTest.error = fetchError.message;
      }
    }

    res.json({
      success: true,
      message: "Upload test successful",
      file: {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        fieldname: req.file.fieldname,
      },
      uploadResult: result,
      urlTest,
      storage: upload.IS_CLOUDINARY_ENABLED ? "Cloudinary ☁️" : "Local 📁",
      cloudinary: upload.IS_CLOUDINARY_ENABLED
        ? {
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            folder: result.uploads?.[0]?.folder || "unknown",
          }
        : null,
    });
  } catch (err) {
    console.error("❌ Test upload error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
});

/* ---------------------------------------------------------------
   DEBUG LIST (LOCAL FILES + DB REFERENCES)
---------------------------------------------------------------- */
router.get("/debug/list", async (req, res) => {
  try {
    const files = fsSync.existsSync(UPLOADS_DIR)
      ? (await fs.readdir(UPLOADS_DIR)).slice(0, 100)
      : [];

    const db = await import("../models/index.js");
    const { Lesson, Course, Sequelize } = db.default;

    const lessons = await Lesson.findAll({
      where: {
        [Sequelize.Op.or]: [
          { file_url: { [Sequelize.Op.ne]: null } },
          { video_url: { [Sequelize.Op.ne]: null } },
        ],
      },
      attributes: [
        "id",
        "title",
        "file_url",
        "video_url",
        "content_type",
        "is_preview",
      ],
      order: [["id", "ASC"]],
      limit: 50,
    });

    // Check Cloudinary URLs
    const cloudinaryFiles = lessons
      .filter((l) => l.file_url && l.file_url.includes("cloudinary.com"))
      .map((l) => {
        const isCorrectType = !l.file_url.includes('/image/upload/') || 
          (!l.file_url.includes('.pdf') && 
           !l.file_url.includes('/mathe-class/pdfs/') && 
           !l.file_url.match(/\.(doc|docx|ppt|pptx|xls|xlsx)(\?|$)/i));
        
        return {
          id: l.id,
          title: l.title,
          file_url: l.file_url,
          is_correct_type: isCorrectType,
          fixed_url: !isCorrectType ? fixCloudinaryUrl(l.file_url) : null,
        };
      });

    res.json({
      success: true,
      uploads: {
        directory: UPLOADS_DIR,
        exists: fsSync.existsSync(UPLOADS_DIR),
        file_count: files.length,
        files: files.slice(0, 20),
      },
      database: {
        lessons_with_files: lessons.length,
        lessons: lessons.slice(0, 10),
        cloudinary_files: cloudinaryFiles.length,
        cloudinary_issues: cloudinaryFiles.filter((f) => !f.is_correct_type)
          .length,
      },
      environment: {
        node_env: process.env.NODE_ENV,
        cloudinary_enabled: upload.IS_CLOUDINARY_ENABLED || false,
        backend_url: process.env.BACKEND_URL,
      },
    });
  } catch (err) {
    console.error("❌ Debug list error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
});

/* ---------------------------------------------------------------
   FILE METADATA TEST (LOCAL)
---------------------------------------------------------------- */
router.get("/test/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const localPath = path.join(UPLOADS_DIR, filename);

    if (!fsSync.existsSync(localPath)) {
      return res.json({
        success: true,
        exists: false,
        filename,
        path: localPath,
        message: "File not found in local storage",
      });
    }

    const stats = fsSync.statSync(localPath);
    const ext = path.extname(filename).toLowerCase();

    res.json({
      success: true,
      exists: true,
      filename,
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      is_directory: stats.isDirectory(),
      extension: ext,
      mime_type:
        {
          ".pdf": "application/pdf",
          ".mp4": "video/mp4",
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".png": "image/png",
          ".gif": "image/gif",
          ".doc": "application/msword",
          ".docx":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }[ext] || "unknown",
    });
  } catch (err) {
    console.error("❌ File test error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

/* ---------------------------------------------------------------
   PUBLIC PREVIEW LESSON
---------------------------------------------------------------- */
router.get(
  "/preview-lesson/:lessonId",
  lessonController.getPublicPreviewByLessonId
);

/* ---------------------------------------------------------------
   UNIVERSAL FILE SERVER
   - Serves local files
   - Redirects Cloudinary URLs
   - Fixes incorrect Cloudinary URLs
---------------------------------------------------------------- */
router.get("/:filename", async (req, res) => {
  try {
    let { filename } = req.params;
    filename = decodeURIComponent(filename);

    console.log(`📤 File request: ${filename}`);

    // Handle Cloudinary URLs
    if (filename.includes("cloudinary.com")) {
      console.log(`☁️ Cloudinary URL detected: ${filename}`);
      
      // Apply URL fixing
      let finalUrl = fixCloudinaryUrl(filename);
      
      if (finalUrl !== filename) {
        console.log(`🔧 Fixed URL for redirect: ${finalUrl.substring(0, 100)}...`);
      }
      
      // Ensure proper content type for redirects
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Access-Control-Allow-Origin", "*");
      
      return res.redirect(301, finalUrl);
    }

    // Handle local files
    const basename = path.basename(filename);
    const localPath = path.join(UPLOADS_DIR, basename);

    if (!fsSync.existsSync(localPath)) {
      console.log(`❌ Local file not found: ${basename}`);
      return res.status(404).json({
        success: false,
        error: "File not found",
        filename: basename,
        path: localPath,
        available_files: fsSync.existsSync(UPLOADS_DIR)
          ? fsSync.readdirSync(UPLOADS_DIR).slice(0, 10)
          : [],
      });
    }

    const ext = path.extname(basename).toLowerCase();
    const mimeTypes = {
      ".pdf": "application/pdf",
      ".mp4": "video/mp4",
      ".mov": "video/quicktime",
      ".avi": "video/x-msvideo",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".doc": "application/msword",
      ".docx":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".txt": "text/plain",
    };

    const contentType = mimeTypes[ext] || "application/octet-stream";
    const stats = fsSync.statSync(localPath);

    console.log(
      `✅ Serving file: ${basename} (${stats.size} bytes, ${contentType})`
    );

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", stats.size);
    res.setHeader("Content-Disposition", `inline; filename="${basename}"`);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=86400");

    const readStream = fsSync.createReadStream(localPath);
    readStream.pipe(res);

    readStream.on("error", (err) => {
      console.error(`❌ Stream error for ${basename}:`, err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: "Failed to stream file",
        });
      }
    });
  } catch (err) {
    console.error("❌ File server error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
});

export default router;