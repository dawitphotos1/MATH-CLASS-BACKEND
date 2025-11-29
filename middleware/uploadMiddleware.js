// middleware/uploadMiddleware.js
import multer from "multer";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "Uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ts = Date.now();
    const safe = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, "_");
    const ext = path.extname(file.originalname);
    cb(null, `${safe}-${ts}${ext}`);
  },
});

const allowedMimes = [
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

const fileFilter = (req, file, cb) => {
  if (allowedMimes.includes(file.mimetype)) cb(null, true);
  else cb(new Error(`File type ${file.mimetype} not allowed`), false);
};

export const uploadCourseFiles = multer({ storage, fileFilter, limits: { fileSize: (process.env.MAX_FILE_SIZE ? Number(process.env.MAX_FILE_SIZE) : 150 * 1024 * 1024) } }).fields([
  { name: "thumbnail", maxCount: 1 },
  { name: "attachments", maxCount: 10 },
]);

export const uploadLessonFiles = multer({ storage, fileFilter, limits: { fileSize: (process.env.MAX_FILE_SIZE ? Number(process.env.MAX_FILE_SIZE) : 150 * 1024 * 1024) } }).fields([
  { name: "video", maxCount: 1 },
  { name: "file", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
  { name: "attachments", maxCount: 10 },
]);

export default multer({ storage, fileFilter });
