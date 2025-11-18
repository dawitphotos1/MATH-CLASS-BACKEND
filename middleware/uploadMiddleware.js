// // middleware/uploadMiddleware.js
// import multer from "multer";
// import path from "path";
// import fs from "fs";

// // ✅ FIXED: Ensure Uploads directory exists with proper path
// const uploadsDir = path.join(process.cwd(), "Uploads");

// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
//   console.log("✅ Created Uploads directory:", uploadsDir);
// }

// // Memory storage for file uploads (better for cloud deployment)
// const storage = multer.memoryStorage();

// // Enhanced file filter
// const fileFilter = (req, file, cb) => {
//   // Allow images, videos, PDFs, and documents
//   const allowedMimes = [
//     'image/jpeg',
//     'image/jpg',
//     'image/png',
//     'image/gif',
//     'video/mp4',
//     'video/mpeg',
//     'video/quicktime',
//     'application/pdf',
//     'application/msword',
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//     'text/plain'
//   ];

//   if (allowedMimes.includes(file.mimetype)) {
//     console.log(`✅ File type allowed: ${file.mimetype} - ${file.originalname}`);
//     cb(null, true);
//   } else {
//     console.log(`❌ File type rejected: ${file.mimetype} - ${file.originalname}`);
//     cb(new Error(`File type ${file.mimetype} not allowed`), false);
//   }
// };

// // Course file upload configuration
// export const uploadCourseFiles = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 100 * 1024 * 1024, // 100MB limit
//   }
// }).fields([
//   { name: 'thumbnail', maxCount: 1 },
//   { name: 'attachments', maxCount: 10 }
// ]);

// // ✅ FIXED: Enhanced lesson file upload configuration
// export const uploadLessonFiles = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 100 * 1024 * 1024, // 100MB limit
//   }
// }).fields([
//   { name: 'video', maxCount: 1 },
//   { name: 'file', maxCount: 1 },
//   { name: 'pdf', maxCount: 1 },
//   { name: 'attachments', maxCount: 10 }
// ]);

// // Default export for backward compatibility
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 100 * 1024 * 1024, // 100MB limit
//   }
// });

// export default upload;






// middleware/uploadMiddleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure Uploads directory exists
const uploadsDir = path.join(process.cwd(), "Uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Created Uploads folder:", uploadsDir);
}

// Memory storage (controller writes files manually)
const storage = multer.memoryStorage();

// Accept PDFs, docs, images, videos — everything your Lesson Controller handles
const allowedMimes = [
  "image/jpeg", "image/jpg", "image/png", "image/gif",
  "video/mp4", "video/mpeg", "video/quicktime",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain"
];

const fileFilter = (req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) {
    console.log(`✔ Allowed upload: ${file.mimetype} (${file.originalname})`);
    cb(null, true);
  } else {
    console.log(`✖ Blocked file type: ${file.mimetype} (${file.originalname})`);
    cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }
};

// ---------------------------
// Course File Upload
// ---------------------------
export const uploadCourseFiles = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
}).fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "promoVideo", maxCount: 1 }
]);

// ---------------------------
// Lesson File Upload
// ---------------------------
// Supports file (PDF/doc), pdf (some UIs use this), and video
export const uploadLessonFiles = multer({
  storage,
  fileFilter,
  limits: { fileSize: 150 * 1024 * 1024 }, // 150MB
}).fields([
  { name: "file", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
  { name: "video", maxCount: 1 }
]);

// ---------------------------
// Default single upload (optional)
// ---------------------------
export const uploadSingleFile = multer({
  storage,
  fileFilter,
  limits: { fileSize: 150 * 1024 * 1024 },
}).single("file");

export default uploadSingleFile;
