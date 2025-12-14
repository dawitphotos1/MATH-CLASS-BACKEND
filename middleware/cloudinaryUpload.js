// // middleware/cloudinaryUpload.js

// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { v2 as cloudinary } from "cloudinary";
// import streamifier from "streamifier";

// // Check if Cloudinary should be used
// const USE_CLOUDINARY =
//   process.env.USE_CLOUDINARY === "true" &&
//   process.env.CLOUDINARY_CLOUD_NAME &&
//   process.env.CLOUDINARY_API_KEY;

// // Configure Cloudinary if enabled
// if (USE_CLOUDINARY) {
//   cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
//     secure: true,
//   });
//   console.log(`☁️ Cloudinary configured: ${process.env.CLOUDINARY_CLOUD_NAME}`);
// } else {
//   console.log("📁 Cloudinary disabled, using local storage");
// }

// // Create local storage directory as fallback
// const LOCAL_UPLOAD_DIR =
//   process.env.UPLOAD_DIR || path.join(process.cwd(), "Uploads");
// if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
//   fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
// }

// // Memory storage for Cloudinary uploads
// const storage = multer.memoryStorage();

// const allowedMimes = [
//   "image/jpeg",
//   "image/jpg",
//   "image/png",
//   "image/gif",
//   "image/webp",
//   "video/mp4",
//   "video/mpeg",
//   "video/quicktime",
//   "video/webm",
//   "video/x-msvideo",
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
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: process.env.MAX_FILE_SIZE
//       ? Number(process.env.MAX_FILE_SIZE)
//       : 150 * 1024 * 1024,
//   },
// });

// /**
//  * Upload buffer to Cloudinary with proper resource type detection
//  */
// export const uploadToCloudinary = (
//   buffer,
//   folder = "mathe-class",
//   resourceType = "auto",
//   filename = "file",
//   options = {}
// ) => {
//   return new Promise((resolve, reject) => {
//     if (!USE_CLOUDINARY) {
//       // Fallback to local storage
//       const timestamp = Date.now();
//       const safeName = filename.replace(/[^a-zA-Z0-9-_.]/g, "_");
//       const ext =
//         path.extname(filename) || (resourceType === "raw" ? ".pdf" : ".jpg");
//       const localFilename = `${safeName}_${timestamp}${ext}`;
//       const localPath = path.join(LOCAL_UPLOAD_DIR, localFilename);

//       fs.writeFileSync(localPath, buffer);

//       return resolve({
//         secure_url: `/Uploads/${localFilename}`,
//         public_id: `local_${timestamp}`,
//         resource_type: "raw",
//       });
//     }

//     // 🔥 FIX: Ensure PDFs use correct upload options
//     const uploadOptions = {
//       resource_type: resourceType,
//       folder: folder,
//       timeout: 60000,
//       use_filename: true,
//       unique_filename: true,
//       ...options, // Merge any additional options
//     };

//     // Add specific flags for PDFs
//     if (resourceType === "raw" && filename.toLowerCase().endsWith('.pdf')) {
//       uploadOptions.format = 'pdf';
//       uploadOptions.flags = 'attachment';
//     }

//     console.log(`📤 Cloudinary upload options:`, uploadOptions);

//     const uploadStream = cloudinary.uploader.upload_stream(
//       uploadOptions,
//       (error, result) => {
//         if (error) {
//           console.error("❌ Cloudinary upload error:", error.message);
//           reject(error);
//         } else {
//           console.log(
//             `✅ Cloudinary upload successful: ${result.secure_url.substring(
//               0,
//               100
//             )}...`
//           );
//           console.log(`📊 Resource type: ${result.resource_type}`);
          
//           // 🔥 FIX: Check if PDF was uploaded as image and fix it
//           if (result.resource_type === 'image' && filename.toLowerCase().endsWith('.pdf')) {
//             console.warn(`⚠️ PDF uploaded as image! URL: ${result.secure_url}`);
//             // Try to manually fix the URL
//             const fixedUrl = result.secure_url.replace('/image/upload/', '/raw/upload/');
//             result.secure_url = fixedUrl;
//             result.resource_type = 'raw';
//             console.log(`🔧 Manually fixed URL to: ${fixedUrl}`);
//           }
          
//           resolve(result);
//         }
//       }
//     );

//     streamifier.createReadStream(buffer).pipe(uploadStream);
//   });
// };

// /**
//  * Determine the correct Cloudinary resource type and folder
//  */
// const getCloudinaryConfig = (mimetype, originalname) => {
//   mimetype = mimetype || "";
//   originalname = originalname || "";

//   // 🔥 FIX: Force PDFs to use 'raw' resource type AND ensure proper URL format
//   if (
//     mimetype === "application/pdf" ||
//     originalname.toLowerCase().endsWith(".pdf")
//   ) {
//     console.log(`📄 PDF detected: ${originalname}, forcing resource_type: 'raw'`);
//     return { 
//       resourceType: "raw", 
//       folder: "mathe-class/pdfs",
//       // Add explicit transformation for PDFs
//       transformation: { 
//         flags: "attachment", 
//         format: "pdf" 
//       }
//     };
//   }

//   // Images
//   if (mimetype.startsWith("image/")) {
//     return { resourceType: "image", folder: "mathe-class/images" };
//   }

//   // Videos
//   if (mimetype.startsWith("video/")) {
//     return { resourceType: "video", folder: "mathe-class/videos" };
//   }

//   // Office documents and other files
//   if (
//     mimetype.includes("document") ||
//     originalname.match(/\.(doc|docx|ppt|pptx|xls|xlsx|txt)$/i)
//   ) {
//     return { resourceType: "raw", folder: "mathe-class/documents" };
//   }

//   // Default
//   return { resourceType: "auto", folder: "mathe-class/files" };
// };

// /**
//  * Process uploaded files and upload to Cloudinary or save locally
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

//   // Process each file field
//   for (const fieldName of Object.keys(req.files)) {
//     const files = req.files[fieldName];

//     for (const file of files) {
//       try {
//         console.log(
//           `📄 Processing ${fieldName}: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`
//         );

//         // Get Cloudinary configuration
//         const { resourceType, folder, transformation } = getCloudinaryConfig(
//           file.mimetype,
//           file.originalname
//         );

//         // Upload the file
//         const uploadResult = await uploadToCloudinary(
//           file.buffer,
//           folder,
//           resourceType,
//           file.originalname,
//           transformation ? { transformation } : {}
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

//         // Map to result fields based on field name
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
//         console.error(
//           `❌ Failed to upload ${file.originalname}:`,
//           error.message
//         );
//         // Continue with other files
//       }
//     }
//   }

//   console.log(`✅ Upload processing complete:`, {
//     fileUrl: result.fileUrl,
//     videoUrl: result.videoUrl,
//     attachmentsCount: result.attachments.length,
//   });

//   req.processedUploads = result;
//   return result;
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

// // Add helper methods to the upload object for convenience
// upload.processUploadedFiles = processUploadedFiles;
// upload.uploadToCloudinary = uploadToCloudinary;
// upload.USE_CLOUDINARY = USE_CLOUDINARY;

// export const singleUpload = upload.single("file");

// export default upload;






// middleware/cloudinaryUpload.js
import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// =========================================================
// CLOUDINARY CONFIGURATION - FIXED VERSION
// =========================================================

// Get Cloudinary credentials from environment
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const USE_CLOUDINARY = process.env.USE_CLOUDINARY === "true";

// Debug logging
console.log("🔧 Cloudinary Configuration:");
console.log("USE_CLOUDINARY:", USE_CLOUDINARY);
console.log("CLOUDINARY_CLOUD_NAME:", CLOUDINARY_CLOUD_NAME);
console.log("CLOUDINARY_API_KEY:", CLOUDINARY_API_KEY ? "SET" : "NOT SET");
console.log(
  "CLOUDINARY_API_SECRET:",
  CLOUDINARY_API_SECRET ? "SET" : "NOT SET"
);

// Configure Cloudinary if all credentials are present
if (
  USE_CLOUDINARY &&
  CLOUDINARY_CLOUD_NAME &&
  CLOUDINARY_API_KEY &&
  CLOUDINARY_API_SECRET
) {
  try {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });
    console.log("✅ Cloudinary configured successfully");
  } catch (error) {
    console.error("❌ Cloudinary configuration failed:", error.message);
  }
} else {
  console.warn("⚠️ Cloudinary credentials incomplete. Using local storage.");
}

// Create local storage directory
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "Uploads");
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

// Memory storage for multer
const storage = multer.memoryStorage();

const allowedMimes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
  "video/mp4",
  "video/mpeg",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const fileFilter = (req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE
      ? Number(process.env.MAX_FILE_SIZE)
      : 100 * 1024 * 1024,
  },
});

/**
 * Upload buffer to Cloudinary
 */
export const uploadToCloudinary = (
  buffer,
  folder = "mathe-class",
  resourceType = "auto",
  filename = "file",
  options = {}
) => {
  return new Promise((resolve, reject) => {
    // Check if Cloudinary is properly configured
    const isCloudinaryReady =
      cloudinary.config().cloud_name &&
      cloudinary.config().api_key &&
      cloudinary.config().api_secret;

    if (!isCloudinaryReady) {
      console.log("📁 Cloudinary not ready, using local storage");
      // Fallback to local storage
      const timestamp = Date.now();
      const safeName = filename.replace(/[^a-zA-Z0-9-_.]/g, "_");
      const ext = path.extname(filename) || ".pdf";
      const localFilename = `${safeName}_${timestamp}${ext}`;
      const localPath = path.join(LOCAL_UPLOAD_DIR, localFilename);

      fs.writeFileSync(localPath, buffer);

      return resolve({
        secure_url: `/Uploads/${localFilename}`,
        public_id: `local_${timestamp}`,
        resource_type: "raw",
        local_path: localPath,
      });
    }

    // Determine resource type based on filename and folder
    let finalResourceType = resourceType;
    let finalFolder = folder;

    if (
      filename.toLowerCase().endsWith(".pdf") ||
      folder.includes("/pdfs/") ||
      options.resource_type === "raw"
    ) {
      finalResourceType = "raw";
      finalFolder = "mathe-class/pdfs";
      console.log(`📄 PDF detected: ${filename}, using raw upload`);
    }

    const uploadOptions = {
      resource_type: finalResourceType,
      folder: finalFolder,
      timeout: 60000,
      use_filename: true,
      unique_filename: true,
      ...options,
    };

    console.log(`📤 Uploading to Cloudinary: ${filename}`);

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error("❌ Cloudinary upload error:", error.message);
          reject(error);
        } else {
          console.log(
            `✅ Upload successful: ${result.secure_url.substring(0, 100)}...`
          );
          console.log(`📊 Resource type: ${result.resource_type}`);
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Process uploaded files
 */
export const processUploadedFiles = async (req) => {
  const result = {
    fileUrl: null,
    videoUrl: null,
    attachments: [],
    uploads: [],
  };

  if (!req.files || Object.keys(req.files).length === 0) {
    req.processedUploads = result;
    return result;
  }

  console.log(`📤 Processing ${Object.keys(req.files).length} file fields`);

  for (const fieldName of Object.keys(req.files)) {
    const files = req.files[fieldName];

    for (const file of files) {
      try {
        console.log(`📄 Processing ${fieldName}: ${file.originalname}`);

        // Determine folder based on file type
        let folder = "mathe-class/files";
        let resourceType = "auto";

        if (
          file.mimetype === "application/pdf" ||
          file.originalname.toLowerCase().endsWith(".pdf")
        ) {
          folder = "mathe-class/pdfs";
          resourceType = "raw";
        } else if (file.mimetype.startsWith("image/")) {
          folder = "mathe-class/images";
          resourceType = "image";
        } else if (file.mimetype.startsWith("video/")) {
          folder = "mathe-class/videos";
          resourceType = "video";
        }

        // Upload the file
        const uploadResult = await uploadToCloudinary(
          file.buffer,
          folder,
          resourceType,
          file.originalname
        );

        const fileInfo = {
          field: fieldName,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          resource_type: uploadResult.resource_type,
          folder: folder,
        };

        result.uploads.push(fileInfo);

        // Map to result fields
        if (fieldName === "file" || fieldName === "pdf") {
          result.fileUrl = uploadResult.secure_url;
          console.log(`📄 Set fileUrl: ${uploadResult.secure_url}`);
        } else if (fieldName === "video") {
          result.videoUrl = uploadResult.secure_url;
          console.log(`🎥 Set videoUrl: ${uploadResult.secure_url}`);
        } else {
          result.attachments.push(fileInfo);
        }
      } catch (error) {
        console.error(
          `❌ Failed to upload ${file.originalname}:`,
          error.message
        );
      }
    }
  }

  req.processedUploads = result;
  return result;
};

/**
 * Fix Cloudinary URLs
 */
export const fixCloudinaryUrl = (url) => {
  if (!url || typeof url !== "string") return url;

  if (url.includes("cloudinary.com") && url.includes("/image/upload/")) {
    // Fix PDFs
    if (url.includes(".pdf") || url.includes("/mathe-class/pdfs/")) {
      return url.replace("/image/upload/", "/raw/upload/");
    }
    // Fix videos
    else if (url.match(/\.(mp4|mov|avi|webm|wmv)(\?|$)/i)) {
      return url.replace("/image/upload/", "/video/upload/");
    }
  }

  return url;
};

// Middleware configurations
export const uploadCourseFiles = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "attachments", maxCount: 10 },
]);

export const uploadLessonFiles = upload.fields([
  { name: "video", maxCount: 1 },
  { name: "file", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
  { name: "attachments", maxCount: 10 },
]);

// Export single upload
export const singleUpload = upload.single("file");

// Attach helpers to upload object
upload.processUploadedFiles = processUploadedFiles;
upload.uploadToCloudinary = uploadToCloudinary;
upload.fixCloudinaryUrl = fixCloudinaryUrl;
upload.isCloudinaryConfigured = () => {
  return !!(
    cloudinary.config().cloud_name &&
    cloudinary.config().api_key &&
    cloudinary.config().api_secret
  );
};

export default upload;