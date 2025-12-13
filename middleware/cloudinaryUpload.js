// // middleware/cloudinaryUpload.js
// import multer from 'multer';
// import path from 'path';
// import fs from 'fs';

// // Create local storage only
// const LOCAL_UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "Uploads");

// // Create directory if it doesn't exist
// if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
//   fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
// }

// console.log(`📁 Using LOCAL storage at: ${LOCAL_UPLOAD_DIR}`);
// console.log(`☁️ Cloudinary disabled (USE_CLOUDINARY=${process.env.USE_CLOUDINARY})`);

// // Local storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     console.log(`📁 Saving to: ${LOCAL_UPLOAD_DIR}`);
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

// const allowedMimes = [
//   'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
//   'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm', 'video/x-msvideo',
//   'application/pdf',
//   'application/msword',
//   'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//   'text/plain',
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
//     fileSize: process.env.MAX_FILE_SIZE ? Number(process.env.MAX_FILE_SIZE) : 150 * 1024 * 1024
//   }
// });

// /**
//  * Simple mock function for Cloudinary (not used when USE_CLOUDINARY=false)
//  */
// export const uploadToCloudinary = (buffer, folder = 'mathe-class', resourceType = 'auto') => {
//   console.log(`⚠️ Cloudinary upload called but disabled. Using local fallback.`);
//   return Promise.resolve({
//     secure_url: `/Uploads/fallback_${Date.now()}.${resourceType === 'raw' ? 'pdf' : 'jpg'}`,
//     public_id: `fallback_${Date.now()}`
//   });
// };

// // Middleware configurations
// export const uploadCourseFiles = upload.fields([
//   { name: 'thumbnail', maxCount: 1 },
//   { name: 'attachments', maxCount: 10 },
// ]);

// export const uploadLessonFiles = upload.fields([
//   { name: 'video', maxCount: 1 },
//   { name: 'file', maxCount: 1 },
//   { name: 'pdf', maxCount: 1 },
//   { name: 'attachments', maxCount: 10 },
// ]);

// export const singleUpload = upload.single('file');

// export default upload;






import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// Check if Cloudinary should be used
const USE_CLOUDINARY =
  process.env.USE_CLOUDINARY === "true" &&
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY;

// Configure Cloudinary if enabled
if (USE_CLOUDINARY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log(`☁️ Cloudinary configured: ${process.env.CLOUDINARY_CLOUD_NAME}`);
} else {
  console.log("📁 Cloudinary disabled, using local storage");
}

// Create local storage directory as fallback
const LOCAL_UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "Uploads");
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

// Memory storage for Cloudinary uploads
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
  console.log(`🔍 Checking file: ${file.originalname} (${file.mimetype})`);

  if (allowedMimes.includes(file.mimetype)) {
    console.log(`✅ File type allowed: ${file.mimetype}`);
    cb(null, true);
  } else {
    console.log(`❌ File type not allowed: ${file.mimetype}`);
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE
      ? Number(process.env.MAX_FILE_SIZE)
      : 150 * 1024 * 1024,
  },
});

/**
 * Upload buffer to Cloudinary with proper resource type detection
 */
export const uploadToCloudinary = (
  buffer,
  folder = "mathe-class",
  resourceType = "auto",
  filename = "file"
) => {
  return new Promise((resolve, reject) => {
    if (!USE_CLOUDINARY) {
      // Fallback to local storage
      const timestamp = Date.now();
      const safeName = filename.replace(/[^a-zA-Z0-9-_.]/g, "_");
      const ext =
        path.extname(filename) || (resourceType === "raw" ? ".pdf" : ".jpg");
      const localFilename = `${safeName}_${timestamp}${ext}`;
      const localPath = path.join(LOCAL_UPLOAD_DIR, localFilename);

      fs.writeFileSync(localPath, buffer);

      return resolve({
        secure_url: `/Uploads/${localFilename}`,
        public_id: `local_${timestamp}`,
        resource_type: "raw",
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: folder,
        timeout: 60000,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error) {
          console.error("❌ Cloudinary upload error:", error.message);
          reject(error);
        } else {
          console.log(
            `✅ Cloudinary upload successful: ${result.secure_url.substring(
              0,
              80
            )}...`
          );
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Determine the correct Cloudinary resource type and folder
 */
const getCloudinaryConfig = (mimetype, originalname) => {
  mimetype = mimetype || "";
  originalname = originalname || "";

  // Force PDFs to use 'raw' resource type
  if (
    mimetype === "application/pdf" ||
    originalname.toLowerCase().endsWith(".pdf")
  ) {
    return { resourceType: "raw", folder: "mathe-class/pdfs" };
  }

  // Images
  if (mimetype.startsWith("image/")) {
    return { resourceType: "image", folder: "mathe-class/images" };
  }

  // Videos
  if (mimetype.startsWith("video/")) {
    return { resourceType: "video", folder: "mathe-class/videos" };
  }

  // Office documents and other files
  if (
    mimetype.includes("document") ||
    originalname.match(/\.(doc|docx|ppt|pptx|xls|xlsx|txt)$/i)
  ) {
    return { resourceType: "raw", folder: "mathe-class/documents" };
  }

  // Default
  return { resourceType: "auto", folder: "mathe-class/files" };
};

/**
 * Process uploaded files and upload to Cloudinary or save locally
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

  // Process each file field
  for (const fieldName of Object.keys(req.files)) {
    const files = req.files[fieldName];

    for (const file of files) {
      try {
        console.log(
          `📄 Processing ${fieldName}: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`
        );

        // Get Cloudinary configuration
        const { resourceType, folder } = getCloudinaryConfig(
          file.mimetype,
          file.originalname
        );

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

        // Map to result fields based on field name
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
        // Continue with other files
      }
    }
  }

  console.log(`✅ Upload processing complete:`, {
    fileUrl: result.fileUrl,
    videoUrl: result.videoUrl,
    attachmentsCount: result.attachments.length,
  });

  req.processedUploads = result;
  return result;
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

// Add helper methods to the upload object for convenience
upload.processUploadedFiles = processUploadedFiles;
upload.uploadToCloudinary = uploadToCloudinary;
upload.USE_CLOUDINARY = USE_CLOUDINARY;

export const singleUpload = upload.single("file");

export default upload;