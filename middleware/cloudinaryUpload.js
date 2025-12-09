// // middleware/cloudinaryUpload.js
// import multer from "multer";
// import { v2 as cloudinary } from "cloudinary";
// import streamifier from "streamifier";

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
//   secure: true,
// });

// // Memory storage for multer
// const storage = multer.memoryStorage();

// const fileFilter = (req, file, cb) => {
//   const allowedMimes = [
//     "image/jpeg",
//     "image/jpg",
//     "image/png",
//     "image/gif",
//     "image/webp",
//     "video/mp4",
//     "video/mpeg",
//     "video/quicktime",
//     "video/webm",
//     "video/x-msvideo",
//     "application/pdf",
//     "application/msword",
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     "text/plain",
//   ];

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
//     fileSize: process.env.MAX_FILE_SIZE
//       ? Number(process.env.MAX_FILE_SIZE)
//       : 150 * 1024 * 1024,
//   },
// });

// /**
//  * Upload file to Cloudinary
//  */
// const uploadToCloudinary = (
//   buffer,
//   folder = "mathe-class",
//   resourceType = "auto"
// ) => {
//   return new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(
//       {
//         folder,
//         resource_type: resourceType,
//         timeout: 60000,
//       },
//       (error, result) => {
//         if (error) {
//           console.error("❌ Cloudinary upload error:", error);
//           reject(error);
//         } else {
//           console.log("✅ Cloudinary upload successful:", result.public_id);
//           resolve(result);
//         }
//       }
//     );

//     streamifier.createReadStream(buffer).pipe(uploadStream);
//   });
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

// export const singleUpload = upload.single("file");

// export { upload, uploadToCloudinary };




// middleware/cloudinaryUpload.js - ES Module version
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Memory storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm', 'video/x-msvideo',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ];

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
    fileSize: process.env.MAX_FILE_SIZE ? Number(process.env.MAX_FILE_SIZE) : 150 * 1024 * 1024
  }
});

/**
 * Upload file to Cloudinary
 */
export const uploadToCloudinary = (buffer, folder = 'mathe-class', resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        timeout: 60000,
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('✅ Cloudinary upload successful:', result.public_id);
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Middleware configurations
export const uploadCourseFiles = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'attachments', maxCount: 10 },
]);

export const uploadLessonFiles = upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'file', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
  { name: 'attachments', maxCount: 10 },
]);

export const singleUpload = upload.single('file');

export default upload;