
// // middleware/uploadMiddleware.js
// import multer from "multer";
// import path from "path";
// import fs from "fs";

// // Get the current working directory (project root)
// const projectRoot = process.cwd();
// const uploadsDir = path.join(projectRoot, "Uploads");

// // Ensure Uploads directory exists
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir, { recursive: true });
//   console.log("✅ Created Uploads directory:", uploadsDir);
// }

// // Use disk storage to save files reliably
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, uploadsDir);
//   },
//   filename: (req, file, cb) => {
//     // Create safe filename with timestamp
//     const timestamp = Date.now();
//     const safeName = path
//       .parse(file.originalname)
//       .name.replace(/[^a-zA-Z0-9\-_]/g, "_");
//     const extension = path.extname(file.originalname);
//     const uniqueName = `${safeName}-${timestamp}${extension}`;
//     cb(null, uniqueName);
//   },
// });

// // Enhanced file filter
// const fileFilter = (req, file, cb) => {
//   // Allow images, videos, PDFs, and documents
//   const allowedMimes = [
//     "image/jpeg",
//     "image/jpg",
//     "image/png",
//     "image/gif",
//     "video/mp4",
//     "video/mpeg",
//     "video/quicktime",
//     "video/webm",
//     "application/pdf",
//     "application/msword", // .doc
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
//     "text/plain",
//   ];

//   if (allowedMimes.includes(file.mimetype)) {
//     console.log(`✅ File type allowed: ${file.mimetype} - ${file.originalname}`);
//     cb(null, true);
//   } else {
//     console.log(`❌ File type rejected: ${file.mimetype} - ${file.originalname}`);
//     cb(
//       new Error(
//         `File type ${file.mimetype} not allowed. Please upload a video, PDF, or document.`
//       ),
//       false
//     );
//   }
// };

// // Course file upload configuration
// export const uploadCourseFiles = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 100 * 1024 * 1024, // 100MB limit
//   },
// }).fields([
//   { name: "thumbnail", maxCount: 1 },
//   { name: "attachments", maxCount: 10 },
// ]);

// // Lesson file upload configuration - supports video, file (documents/PDFs), and attachments
// export const uploadLessonFiles = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 100 * 1024 * 1024, // 100MB limit
//   },
// }).fields([
//   { name: "video", maxCount: 1 },
//   { name: "file", maxCount: 1 },
//   { name: "pdf", maxCount: 1 },
//   { name: "attachments", maxCount: 10 },
// ]);

// // Default export for backward compatibility
// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 100 * 1024 * 1024, // 100MB limit
//   },
// });

// export default upload;






// middleware/uploadMiddleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

const uploadsDir = path.join(process.cwd(), "Uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, "_");
    const ext = path.extname(file.originalname);
    cb(null, `${safeName}-${timestamp}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/webm",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error(`File type ${file.mimetype} not allowed`), false);
};

export const uploadLessonFiles = multer({ storage, fileFilter, limits: { fileSize: 150 * 1024 * 1024 } }).fields([
  { name: "video", maxCount: 1 },
  { name: "file", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
  { name: "attachments", maxCount: 10 },
]);

export default multer({ storage, fileFilter });
