// middleware/uploadMiddleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

// Create local storage only for development
const LOCAL_UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "Uploads");
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, LOCAL_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, "_");
    const ext = path.extname(file.originalname);
    cb(null, `${safeName}_${timestamp}${ext}`);
  },
});

// For Cloudinary, we'll use memory storage and upload directly
const memoryStorage = multer.memoryStorage();

const allowedMimes = [
  "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
  "video/mp4", "video/mpeg", "video/quicktime", "video/webm", "video/x-msvideo",
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

// Use memory storage for Cloudinary (we'll handle upload in controller)
const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { 
    fileSize: process.env.MAX_FILE_SIZE ? Number(process.env.MAX_FILE_SIZE) : 150 * 1024 * 1024 
  }
});

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

export const singleUpload = upload.single('file');

export default upload;