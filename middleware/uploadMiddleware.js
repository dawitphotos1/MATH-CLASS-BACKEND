// // middleware/uploadMiddleware.js
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { v2 as cloudinary } from "cloudinary";
// import streamifier from "streamifier";

// console.log("=== FILE UPLOAD MIDDLEWARE INIT ===");
// console.log(`📁 Upload directory: ${process.env.UPLOAD_DIR || './Uploads'}`);
// console.log(`☁️ USE_CLOUDINARY: ${process.env.USE_CLOUDINARY || 'false'}`);
// console.log(`🏠 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
// console.log(`☁️ Cloudinary configured: ${!!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)}`);

// // Configure Cloudinary if credentials exist
// if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
//   cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET || "",
//     secure: true,
//   });
//   console.log("✅ Cloudinary configured successfully");
// } else {
//   console.log("⚠️ Cloudinary not configured - using local storage only");
// }

// // Create local storage directory for development/fallback
// const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "Uploads");
// if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
//   console.log(`📁 Creating uploads directory: ${LOCAL_UPLOAD_DIR}`);
//   fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
// }

// // Determine if we should use Cloudinary
// const shouldUseCloudinary = process.env.USE_CLOUDINARY === "true" && 
//                            process.env.CLOUDINARY_CLOUD_NAME && 
//                            process.env.CLOUDINARY_API_KEY;

// console.log(`🔄 Storage selection: ${shouldUseCloudinary ? 'CLOUDINARY ☁️' : 'LOCAL 📁'}`);

// // Custom Cloudinary storage engine
// const createCloudinaryStorage = () => {
//   return {
//     _handleFile: (req, file, cb) => {
//       console.log(`☁️ Uploading to Cloudinary: ${file.originalname} (${file.mimetype})`);
//       const buffer = file.buffer;
//       const originalname = file.originalname;
      
//       // Determine resource type and folder
//       let resourceType = "auto";
//       let folder = "mathe-class/files";
      
//       if (file.mimetype.startsWith("image/")) {
//         resourceType = "image";
//         folder = "mathe-class/images";
//       } else if (file.mimetype.startsWith("video/")) {
//         resourceType = "video";
//         folder = "mathe-class/videos";
//       } else if (file.mimetype === "application/pdf") {
//         resourceType = "raw";
//         folder = "mathe-class/pdfs";
//       } else if (file.mimetype.includes("document") || file.mimetype.includes("text")) {
//         resourceType = "raw";
//         folder = "mathe-class/documents";
//       }
      
//       // Create unique public ID
//       const timestamp = Date.now();
//       const safeName = path.parse(originalname).name.replace(/[^a-zA-Z0-9-_]/g, "_");
//       const ext = path.extname(originalname);
//       const publicId = `${safeName}_${timestamp}`;
      
//       // Upload to Cloudinary
//       const uploadStream = cloudinary.uploader.upload_stream(
//         {
//           resource_type: resourceType,
//           public_id: publicId,
//           folder: folder,
//           overwrite: false,
//           access_mode: "public",
//           timeout: 60000,
//         },
//         (error, result) => {
//           if (error) {
//             console.error("❌ Cloudinary upload error:", error.message);
//             // Fallback to local storage
//             console.log("📁 Falling back to local storage...");
//             const localPath = path.join(LOCAL_UPLOAD_DIR, `${safeName}_${timestamp}${ext}`);
//             fs.writeFileSync(localPath, buffer);
//             cb(null, {
//               filename: `${safeName}_${timestamp}${ext}`,
//               path: `/Uploads/${safeName}_${timestamp}${ext}`,
//               size: buffer.length,
//               mimetype: file.mimetype,
//               originalname: originalname,
//               location: `/Uploads/${safeName}_${timestamp}${ext}`,
//             });
//           } else {
//             console.log(`✅ Cloudinary upload successful: ${result.secure_url.substring(0, 80)}...`);
//             // Return file info with Cloudinary URL
//             cb(null, {
//               filename: originalname,
//               path: result.secure_url,
//               size: buffer.length,
//               mimetype: file.mimetype,
//               originalname: originalname,
//               location: result.secure_url,
//               public_id: result.public_id,
//               cloudinary: true,
//             });
//           }
//         }
//       );
      
//       streamifier.createReadStream(buffer).pipe(uploadStream);
//     },
    
//     _removeFile: (req, file, cb) => {
//       cb(null);
//     }
//   };
// };

// // Local storage for development/fallback
// const localStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     console.log(`📁 Saving locally to: ${LOCAL_UPLOAD_DIR}`);
//     cb(null, LOCAL_UPLOAD_DIR);
//   },
//   filename: (req, file, cb) => {
//     const timestamp = Date.now();
//     const safeName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, "_");
//     const ext = path.extname(file.originalname);
//     const filename = `${safeName}_${timestamp}${ext}`;
//     console.log(`📄 Local filename: ${filename}`);
//     cb(null, filename);
//   },
// });

// // Choose storage based on configuration
// const storage = shouldUseCloudinary ? createCloudinaryStorage() : localStorage;

// const allowedMimes = [
//   "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
//   "video/mp4", "video/mpeg", "video/quicktime", "video/webm", "video/x-msvideo",
//   "application/pdf",
//   "application/msword",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   "text/plain",
// ];

// const fileFilter = (req, file, cb) => {
//   console.log(`🔍 Checking file: ${file.originalname} (${file.mimetype})`);
  
//   if (allowedMimes.includes(file.mimetype)) {
//     console.log(`✅ File type allowed: ${file.mimetype}`);
//     cb(null, true);
//   } else {
//     console.log(`❌ File type not allowed: ${file.mimetype}`);
//     cb(new Error(`File type ${file.mimetype} not allowed`), false);
//   }
// };

// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: process.env.MAX_FILE_SIZE ? Number(process.env.MAX_FILE_SIZE) : 150 * 1024 * 1024 // 150MB default
//   }
// });

// console.log("✅ File upload middleware initialized successfully");

// // Middleware configurations
// export const uploadCourseFiles = upload.fields([
//   { name: "thumbnail", maxCount: 1 },
//   { name: "attachments", maxCount: 10 },
// ]);

// export const uploadLessonFiles = upload.fields([
//   { name: "video", maxCount: 1 },
//   { name: "file", maxCount: 1 },
//   { name: "pdf", maxCount: 1 },
//   { name: "attachments", maxCount: 10 },
// ]);

// export const singleUpload = upload.single("file");

// // Helper function to check if URL is Cloudinary
// export const isCloudinaryUrl = (url) => {
//   return url && url.includes("cloudinary.com");
// };

// export default upload;






// middleware/uploadMiddleware.js
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import path from "path";

console.log("=== uploadMiddleware init ===");

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET || "",
    secure: true,
  });
  console.log("✅ Cloudinary is configured.");
} else {
  console.warn("⚠️ Cloudinary NOT configured. Set CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET in env.");
}

// Use memory storage so we can stream directly to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE ? Number(process.env.MAX_FILE_SIZE) : 150 * 1024 * 1024,
  },
});

// Fields expected for lesson uploads (adjust if your frontend uses different names)
export const uploadLessonFiles = upload.fields([
  { name: "video", maxCount: 1 },
  { name: "file", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
  { name: "attachments", maxCount: 10 },
]);

/**
 * Upload a single buffer to Cloudinary using upload_stream.
 * - resourceType: 'raw' | 'image' | 'video' | 'auto'
 * - folder: optional folder path
 * Returns result object (secure_url, public_id, resource_type, format, bytes, etc.)
 */
const uploadBufferToCloudinary = (buffer, { resourceType = "auto", folder = "mathe-class/files", public_id = undefined, filename = "file" } = {}) => {
  return new Promise((resolve, reject) => {
    const opts = { resource_type: resourceType, folder, timeout: 60000, use_filename: false };
    if (public_id) opts.public_id = public_id;

    const uploadStream = cloudinary.uploader.upload_stream(opts, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Determine Cloudinary resource type and folder by mimetype / filename
 */
const chooseCloudinaryTypeAndFolder = (mimetype, originalname) => {
  mimetype = (mimetype || "").toLowerCase();
  originalname = originalname || "";
  if (mimetype.startsWith("image/")) return { resourceType: "image", folder: "mathe-class/images" };
  if (mimetype.startsWith("video/")) return { resourceType: "video", folder: "mathe-class/videos" };

  // PDFs and Office docs -> upload as raw
  const ext = path.extname(originalname || "").toLowerCase();
  if (mimetype === "application/pdf" || [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx"].includes(ext)) {
    return { resourceType: "raw", folder: "mathe-class/docs" };
  }

  // Fallback to auto
  return { resourceType: "auto", folder: "mathe-class/files" };
};

/**
 * processUploadedFiles(req)
 * - Reads req.files (from multer memoryStorage)
 * - Uploads each file to Cloudinary
 * - Sets req.processedUploads = { fileUrl, videoUrl, attachments: [ { url, public_id, resource_type } ] }
 *
 * Usage:
 *   await processUploadedFiles(req);
 *   const uploads = req.processedUploads;
 */
export const processUploadedFiles = async (req) => {
  const out = { fileUrl: null, videoUrl: null, attachments: [] };

  if (!req.files || Object.keys(req.files).length === 0) {
    req.processedUploads = out;
    return out;
  }

  // Handle known fields video, pdf, file, attachments
  const allFields = Object.keys(req.files);

  for (const field of allFields) {
    const filesArr = req.files[field] || [];
    for (const f of filesArr) {
      const { buffer, originalname, mimetype } = f;
      try {
        const { resourceType, folder } = chooseCloudinaryTypeAndFolder(mimetype, originalname);
        const result = await uploadBufferToCloudinary(buffer, {
          resourceType,
          folder,
          filename: originalname,
        });

        // Build normalized URL:
        let finalUrl = result.secure_url;
        // If Cloudinary returned an image upload URL for a PDF (rare), convert to raw URL
        if (result.resource_type === "image" && (originalname || "").toLowerCase().endsWith(".pdf")) {
          // replace /image/upload/ with /raw/upload/
          finalUrl = finalUrl.replace("/image/upload/", "/raw/upload/");
        }

        const fileObj = {
          field,
          originalname,
          mimetype,
          url: finalUrl,
          public_id: result.public_id,
          resource_type: result.resource_type,
          format: result.format,
          bytes: result.bytes,
        };

        // Map to out fields
        if (field === "video") {
          out.videoUrl = fileObj.url;
        } else if (field === "pdf" || (field === "file" && (originalname || "").toLowerCase().endsWith(".pdf"))) {
          out.fileUrl = fileObj.url;
        } else if (field === "file" && fileObj.resource_type === "video") {
          out.videoUrl = fileObj.url;
        } else if (fileObj.resource_type === "image") {
          // If it's a single image upload intended as lesson file
          if (field === "file" && !out.fileUrl) out.fileUrl = fileObj.url;
          else out.attachments.push(fileObj);
        } else {
          // fallback
          if (!out.fileUrl && (field === "file" || field === "attachments")) {
            out.fileUrl = fileObj.url;
          } else {
            out.attachments.push(fileObj);
          }
        }
      } catch (err) {
        console.error("Cloudinary upload failed for file", originalname, ":", err?.message || err);
        // continue — do not throw; we let controller decide fallback behavior
      }
    }
  }

  req.processedUploads = out;
  return out;
};

export default {
  uploadLessonFiles,
  processUploadedFiles,
};
