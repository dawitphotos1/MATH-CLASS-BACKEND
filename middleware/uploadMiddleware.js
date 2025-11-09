
// // middleware/uploadMiddleware.js
// import multer from "multer";
// import path from "path";
// import fs from "fs";

// // Ensure Uploads directory exists
// const uploadsDir = path.join(process.cwd(), "Uploads");
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
// }

// // Memory storage for file uploads
// const storage = multer.memoryStorage();

// // File filter
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
//     'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
//   ];

//   if (allowedMimes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
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

// // Lesson file upload configuration
// export const uploadLessonFiles = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 100 * 1024 * 1024, // 100MB limit
//   }
// }).fields([
//   { name: 'video', maxCount: 1 },
//   { name: 'attachments', maxCount: 10 }
// ]);

// export default uploadCourseFiles;




// middleware/uploadMiddleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure Uploads directory exists
const uploadsDir = path.join(process.cwd(), "Uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Memory storage for file uploads
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  // Allow images, videos, PDFs, and documents
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

// Course file upload configuration
export const uploadCourseFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
}).fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'attachments', maxCount: 10 }
]);

// Lesson file upload configuration - UPDATED to handle multiple file types
export const uploadLessonFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
}).fields([
  { name: 'video', maxCount: 1 },
  { name: 'file', maxCount: 1 },        // For PDF files
  { name: 'pdf', maxCount: 1 },         // Alternative name for PDF
  { name: 'attachments', maxCount: 10 } // For multiple attachments
]);

// Default export for backward compatibility
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

export default upload;