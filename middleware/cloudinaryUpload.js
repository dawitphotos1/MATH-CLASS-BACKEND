// // middleware/cloudinaryUpload.js
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { v2 as cloudinary } from "cloudinary";
// import streamifier from "streamifier";

// // =========================================================
// // 🔍 DEBUGGING ENVIRONMENT VARIABLES - ADD THIS SECTION
// // =========================================================

// console.log("🔍 DEBUGGING ENVIRONMENT VARIABLES:");
// console.log("USE_CLOUDINARY (raw):", JSON.stringify(process.env.USE_CLOUDINARY));
// console.log("CLOUDINARY_CLOUD_NAME (raw):", JSON.stringify(process.env.CLOUDINARY_CLOUD_NAME));
// console.log("CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "SET" : "NOT SET");
// console.log("CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "SET" : "NOT SET");

// // Fix any spaces in the values
// // In middleware/cloudinaryUpload.js, fix this:

// // Fix any spaces in the values
// const USE_CLOUDINARY = process.env.USE_CLOUDINARY ? 
//                       process.env.USE_CLOUDINARY.trim() === "true" : 
//                       false;

// const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME ? 
//                              process.env.CLOUDINARY_CLOUD_NAME.trim() : 
//                              null;

// const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY ? 
//                           process.env.CLOUDINARY_API_KEY.trim() : 
//                           null;

// const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET ? 
//                              process.env.CLOUDINARY_API_SECRET.trim() : 
//                              null;

// console.log("✅ AFTER TRIMMING:");
// console.log("USE_CLOUDINARY (trimmed):", USE_CLOUDINARY);
// console.log("CLOUDINARY_CLOUD_NAME (trimmed):", CLOUDINARY_CLOUD_NAME);
// console.log("CLOUDINARY_API_KEY (trimmed):", CLOUDINARY_API_KEY ? "SET" : "NOT SET");
// console.log("CLOUDINARY_API_SECRET (trimmed):", CLOUDINARY_API_SECRET ? "SET" : "NOT SET");

// // =========================================================
// // CLOUDINARY CONFIGURATION - FIXED VERSION
// // =========================================================

// // Debug logging
// console.log("🔧 Cloudinary Configuration Check:");
// console.log("USE_CLOUDINARY:", USE_CLOUDINARY);
// console.log("CLOUDINARY_CLOUD_NAME:", CLOUDINARY_CLOUD_NAME);
// console.log("CLOUDINARY_API_KEY:", CLOUDINARY_API_KEY ? "SET" : "NOT SET");
// console.log("CLOUDINARY_API_SECRET:", CLOUDINARY_API_SECRET ? "SET" : "NOT SET");

// // FIX: Use !! to convert to boolean
// const IS_CLOUDINARY_ENABLED = USE_CLOUDINARY && 
//                              !!CLOUDINARY_CLOUD_NAME && 
//                              !!CLOUDINARY_API_KEY && 
//                              !!CLOUDINARY_API_SECRET;

// console.log("☁️ IS_CLOUDINARY_ENABLED:", IS_CLOUDINARY_ENABLED);  // Should be true/false

// if (IS_CLOUDINARY_ENABLED) {
//   try {
//     cloudinary.config({
//       cloud_name: CLOUDINARY_CLOUD_NAME,
//       api_key: CLOUDINARY_API_KEY,
//       api_secret: CLOUDINARY_API_SECRET,
//       secure: true,
//     });
    
//     // Test the configuration
//     console.log("✅ Cloudinary configured successfully");
//     console.log("Cloud Name:", cloudinary.config().cloud_name);
//     console.log("API Key:", cloudinary.config().api_key ? "SET" : "NOT SET");
//     console.log("API Secret:", cloudinary.config().api_secret ? "SET" : "NOT SET");
    
//   } catch (error) {
//     console.error("❌ Cloudinary configuration failed:", error.message);
//     console.error("Full error:", error);
//   }
// } else {
//   console.warn("⚠️ Cloudinary credentials incomplete or disabled. Using local storage.");
//   console.warn("Missing or false:", {
//     USE_CLOUDINARY,
//     CLOUDINARY_CLOUD_NAME: !!CLOUDINARY_CLOUD_NAME,
//     CLOUDINARY_API_KEY: !!CLOUDINARY_API_KEY,
//     CLOUDINARY_API_SECRET: !!CLOUDINARY_API_SECRET
//   });
// }

// // Create local storage directory
// const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "Uploads");
// if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
//   fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
// }

// // Memory storage for multer
// const storage = multer.memoryStorage();

// const allowedMimes = [
//   "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
//   "video/mp4", "video/mpeg", "video/quicktime", "video/webm", "video/x-msvideo",
//   "application/pdf",
//   "application/msword",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   "text/plain",
// ];

// const fileFilter = (req, file, cb) => {
//   if (allowedMimes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error(`File type ${file.mimetype} not allowed`), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: process.env.MAX_FILE_SIZE ? Number(process.env.MAX_FILE_SIZE) : 100 * 1024 * 1024,
//   },
// });

// /**
//  * Upload buffer to Cloudinary
//  */
// export const uploadToCloudinary = (
//   buffer,
//   folder = "mathe-class",
//   resourceType = "auto",
//   filename = "file",
//   options = {}
// ) => {
//   return new Promise((resolve, reject) => {
//     // Check if Cloudinary is properly configured
//     const isCloudinaryReady = IS_CLOUDINARY_ENABLED && 
//                              cloudinary.config().cloud_name && 
//                              cloudinary.config().api_key && 
//                              cloudinary.config().api_secret;

//     console.log("📤 Upload Request:");
//     console.log("  - Filename:", filename);
//     console.log("  - IS_CLOUDINARY_ENABLED:", IS_CLOUDINARY_ENABLED);
//     console.log("  - isCloudinaryReady:", isCloudinaryReady);
    
//     if (!isCloudinaryReady) {
//       console.log("📁 Cloudinary not ready, using local storage");
//       // Fallback to local storage
//       const timestamp = Date.now();
//       const safeName = filename.replace(/[^a-zA-Z0-9-_.]/g, "_");
//       const ext = path.extname(filename) || ".pdf";
//       const localFilename = `${safeName}_${timestamp}${ext}`;
//       const localPath = path.join(LOCAL_UPLOAD_DIR, localFilename);

//       try {
//         fs.writeFileSync(localPath, buffer);
//         console.log(`📁 Saved locally: /Uploads/${localFilename}`);
        
//         resolve({
//           secure_url: `/Uploads/${localFilename}`,
//           public_id: `local_${timestamp}`,
//           resource_type: "raw",
//           local_path: localPath,
//         });
//       } catch (writeError) {
//         console.error("❌ Failed to save locally:", writeError.message);
//         reject(writeError);
//       }
//       return;
//     }

//     // Determine resource type based on filename and folder
//     let finalResourceType = resourceType;
//     let finalFolder = folder;
    
//     if (filename.toLowerCase().endsWith('.pdf') || 
//         folder.includes('/pdfs/') || 
//         options.resource_type === 'raw') {
//       finalResourceType = 'raw';
//       finalFolder = 'mathe-class/pdfs';
//       console.log(`📄 PDF detected: ${filename}, using raw upload`);
//     }

//     const uploadOptions = {
//       resource_type: finalResourceType,
//       folder: finalFolder,
//       timeout: 60000,
//       use_filename: true,
//       unique_filename: true,
//       ...options,
//     };

//     console.log(`📤 Uploading to Cloudinary: ${filename}`);
//     console.log(`📤 Options:`, uploadOptions);

//     const uploadStream = cloudinary.uploader.upload_stream(
//       uploadOptions,
//       (error, result) => {
//         if (error) {
//           console.error("❌ Cloudinary upload error:", error.message);
//           reject(error);
//         } else {
//           console.log(`✅ Upload successful: ${result.secure_url.substring(0, 100)}...`);
//           console.log(`📊 Resource type: ${result.resource_type}`);
//           resolve(result);
//         }
//       }
//     );

//     streamifier.createReadStream(buffer).pipe(uploadStream);
//   });
// };

// /**
//  * Process uploaded files
//  */
// export const processUploadedFiles = async (req) => {
//   const result = {
//     fileUrl: null,
//     videoUrl: null,
//     attachments: [],
//     uploads: [],
//   };

//   if (!req.files || Object.keys(req.files).length === 0) {
//     req.processedUploads = result;
//     return result;
//   }

//   console.log(`📤 Processing ${Object.keys(req.files).length} file fields`);

//   for (const fieldName of Object.keys(req.files)) {
//     const files = req.files[fieldName];

//     for (const file of files) {
//       try {
//         console.log(`📄 Processing ${fieldName}: ${file.originalname}`);

//         // Determine folder based on file type
//         let folder = "mathe-class/files";
//         let resourceType = "auto";
        
//         if (file.mimetype === "application/pdf" || 
//             file.originalname.toLowerCase().endsWith('.pdf')) {
//           folder = "mathe-class/pdfs";
//           resourceType = "raw";
//         } else if (file.mimetype.startsWith("image/")) {
//           folder = "mathe-class/images";
//           resourceType = "image";
//         } else if (file.mimetype.startsWith("video/")) {
//           folder = "mathe-class/videos";
//           resourceType = "video";
//         }

//         // Upload the file
//         const uploadResult = await uploadToCloudinary(
//           file.buffer,
//           folder,
//           resourceType,
//           file.originalname
//         );

//         const fileInfo = {
//           field: fieldName,
//           originalname: file.originalname,
//           mimetype: file.mimetype,
//           size: file.size,
//           url: uploadResult.secure_url,
//           public_id: uploadResult.public_id,
//           resource_type: uploadResult.resource_type,
//           folder: folder,
//         };

//         result.uploads.push(fileInfo);

//         // Map to result fields
//         if (fieldName === "file" || fieldName === "pdf") {
//           result.fileUrl = uploadResult.secure_url;
//           console.log(`📄 Set fileUrl: ${uploadResult.secure_url}`);
//         } else if (fieldName === "video") {
//           result.videoUrl = uploadResult.secure_url;
//           console.log(`🎥 Set videoUrl: ${uploadResult.secure_url}`);
//         } else {
//           result.attachments.push(fileInfo);
//         }
//       } catch (error) {
//         console.error(`❌ Failed to upload ${file.originalname}:`, error.message);
//       }
//     }
//   }

//   req.processedUploads = result;
//   return result;
// };

// /**
//  * Fix Cloudinary URLs
//  */
// export const fixCloudinaryUrl = (url) => {
//   if (!url || typeof url !== 'string') return url;
  
//   if (url.includes('cloudinary.com') && url.includes('/image/upload/')) {
//     // Fix PDFs
//     if (url.includes('.pdf') || url.includes('/mathe-class/pdfs/')) {
//       return url.replace('/image/upload/', '/raw/upload/');
//     }
//     // Fix videos
//     else if (url.match(/\.(mp4|mov|avi|webm|wmv)(\?|$)/i)) {
//       return url.replace('/image/upload/', '/video/upload/');
//     }
//   }
  
//   return url;
// };

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

// // Export single upload
// export const singleUpload = upload.single("file");

// // Attach helpers to upload object
// upload.processUploadedFiles = processUploadedFiles;
// upload.uploadToCloudinary = uploadToCloudinary;
// upload.fixCloudinaryUrl = fixCloudinaryUrl;
// upload.IS_CLOUDINARY_ENABLED = IS_CLOUDINARY_ENABLED;  // Export this for debugging

// export default upload;






// middleware/cloudinaryUpload.js
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import streamifier from "streamifier";

/* -------------------------
   Cloudinary Config
------------------------- */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* -------------------------
   Multer (memory storage)
------------------------- */
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

/* -------------------------
   Upload Helpers
------------------------- */

// Upload ANY file (PDF, DOCX, etc.) as RAW
export const uploadFileToCloudinary = (file, folder = "math-class/files") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          console.error("❌ Cloudinary RAW upload error:", error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

// Upload videos
export const uploadVideoToCloudinary = (file, folder = "math-class/videos") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "video",
        folder,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          console.error("❌ Cloudinary VIDEO upload error:", error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

/* -------------------------
   MAIN MIDDLEWARE
------------------------- */
export const cloudinaryUploadMiddleware = async (req, res, next) => {
  try {
    req.processedUploads = {};

    if (req.files?.file?.[0]) {
      req.processedUploads.fileUrl = await uploadFileToCloudinary(
        req.files.file[0]
      );
    }

    if (req.files?.video?.[0]) {
      req.processedUploads.videoUrl = await uploadVideoToCloudinary(
        req.files.video[0]
      );
    }

    next();
  } catch (err) {
    console.error("❌ Cloudinary middleware error:", err);
    res.status(500).json({
      success: false,
      error: "File upload failed",
    });
  }
};

/* -------------------------
   URL FIXER (IMPORTANT)
------------------------- */
export const fixCloudinaryUrl = (url) => {
  if (!url || typeof url !== "string") return url;

  // PDFs MUST use raw/upload
  if (
    url.includes("cloudinary.com") &&
    url.endsWith(".pdf") &&
    url.includes("/image/upload/")
  ) {
    return url.replace("/image/upload/", "/raw/upload/");
  }

  return url;
};

/* -------------------------
   EXPORT DEFAULT (OPTIONAL)
------------------------- */
export default {
  upload,
  cloudinaryUploadMiddleware,
  uploadFileToCloudinary,
  uploadVideoToCloudinary,
  fixCloudinaryUrl,
};
