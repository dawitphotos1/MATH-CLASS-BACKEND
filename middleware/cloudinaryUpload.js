// middleware/cloudinaryUpload.js - UPDATED FOR MULTIPLE FILES
import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// ================================
// CLOUDINARY CONFIGURATION
// ================================

console.log("🔧 Cloudinary Upload Middleware Initializing...");

// Configuration with trimming
const USE_CLOUDINARY = process.env.USE_CLOUDINARY?.trim() === "true";
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY?.trim();
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET?.trim();

const IS_CLOUDINARY_ENABLED = USE_CLOUDINARY && 
  CLOUDINARY_CLOUD_NAME && 
  CLOUDINARY_API_KEY && 
  CLOUDINARY_API_SECRET;

if (IS_CLOUDINARY_ENABLED) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log("✅ Cloudinary configured successfully");
} else {
  console.warn("⚠️ Cloudinary disabled, using local storage");
}

// ================================
// LOCAL STORAGE
// ================================

const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "Uploads");
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

// ================================
// MULTER CONFIGURATION
// ================================

const storage = multer.memoryStorage();

const allowedMimes = [
  "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
  "video/mp4", "video/mpeg", "video/quicktime", "video/webm",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "application/zip",
  "application/x-rar-compressed",
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
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

// ================================
// UPLOAD FUNCTIONS
// ================================

export const uploadToCloudinary = (
  buffer,
  folder = "mathe-class",
  resourceType = "auto",
  filename = "file",
  options = {}
) => {
  return new Promise((resolve, reject) => {
    if (!IS_CLOUDINARY_ENABLED) {
      // Fallback to local storage
      const timestamp = Date.now();
      const safeName = filename.replace(/[^a-zA-Z0-9_\-.]/g, "_");
      const ext = path.extname(filename) || ".pdf";
      const localFilename = `${safeName}_${timestamp}${ext}`;
      const localPath = path.join(LOCAL_UPLOAD_DIR, localFilename);

      try {
        fs.writeFileSync(localPath, buffer);
        resolve({
          secure_url: `/Uploads/${localFilename}`,
          public_id: `local_${timestamp}`,
          resource_type: "raw",
          local_path: localPath,
        });
      } catch (error) {
        reject(error);
      }
      return;
    }

    // Determine resource type
    let finalResourceType = resourceType;
    let finalFolder = folder;

    if (filename.toLowerCase().endsWith(".pdf") || 
        folder.includes("/pdfs/") || 
        options.resource_type === "raw") {
      finalResourceType = "raw";
      finalFolder = "mathe-class/pdfs";
    } else if (filename.toLowerCase().match(/\.(mp4|mov|avi|webm|wmv)$/)) {
      finalResourceType = "video";
      finalFolder = "mathe-class/videos";
    } else if (filename.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      finalResourceType = "image";
      finalFolder = "mathe-class/images";
    }

    const uploadOptions = {
      resource_type: finalResourceType,
      folder: finalFolder,
      timeout: 60000,
      unique_filename: true,
      overwrite: false,
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// ================================
// PROCESS UPLOADED FILES - UPDATED FOR ARRAYS
// ================================

export const processUploadedFiles = async (req) => {
  const result = {
    files: [],        // Array of main lesson files
    videos: [],       // Array of video files
    attachments: [],  // Array of additional attachments
  };

  if (!req.files || Object.keys(req.files).length === 0) {
    req.processedUploads = result;
    return result;
  }

  console.log(`📤 Processing ${Object.keys(req.files).length} file fields`);

  // Process each field
  for (const fieldName of Object.keys(req.files)) {
    const files = req.files[fieldName];

    for (const file of files) {
      try {
        console.log(`📄 Processing ${fieldName}: ${file.originalname}`);

        // Determine folder based on file type
        let folder = "mathe-class/files";
        let resourceType = "auto";

        if (file.mimetype === "application/pdf" || 
            file.originalname.toLowerCase().endsWith(".pdf")) {
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

        // Store in appropriate array based on field name
        if (fieldName === "files" || fieldName === "pdf") {
          result.files.push(fileInfo);
        } else if (fieldName === "videos" || fieldName === "video") {
          result.videos.push(fileInfo);
        } else if (fieldName === "attachments" || 
                   fieldName === "attachment" || 
                   fieldName === "additional_files") {
          result.attachments.push(fileInfo);
        } else {
          // Default to attachments
          result.attachments.push(fileInfo);
        }

        console.log(`✅ Uploaded: ${file.originalname}`);
      } catch (error) {
        console.error(`❌ Failed to upload ${file.originalname}:`, error.message);
      }
    }
  }

  req.processedUploads = result;
  return result;
};

// ================================
// MIDDLEWARE CONFIGURATIONS
// ================================

// For lesson uploads (multiple files, videos, and attachments)
export const uploadLessonFiles = upload.fields([
  { name: "files", maxCount: 10 },        // Main lesson files (PDFs, docs)
  { name: "videos", maxCount: 5 },        // Video files
  { name: "attachments", maxCount: 20 },  // Additional attachments
]);

// For course thumbnails
export const uploadCourseFiles = upload.fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "attachments", maxCount: 10 },
]);

// Single file upload
export const singleUpload = upload.single("file");

// Export everything
export default upload;