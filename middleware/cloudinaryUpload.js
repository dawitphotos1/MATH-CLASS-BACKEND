// middleware/cloudinaryUpload.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create local storage only
const LOCAL_UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "Uploads");

// Create directory if it doesn't exist
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

console.log(`📁 Using LOCAL storage at: ${LOCAL_UPLOAD_DIR}`);
console.log(`☁️ Cloudinary disabled (USE_CLOUDINARY=${process.env.USE_CLOUDINARY})`);

// Local storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(`📁 Saving to: ${LOCAL_UPLOAD_DIR}`);
    cb(null, LOCAL_UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, "_");
    const ext = path.extname(file.originalname);
    const filename = `${safeName}_${timestamp}${ext}`;
    console.log(`📄 Local filename: ${filename}`);
    cb(null, filename);
  },
});

const allowedMimes = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm', 'video/x-msvideo',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
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
    fileSize: process.env.MAX_FILE_SIZE ? Number(process.env.MAX_FILE_SIZE) : 150 * 1024 * 1024
  }
});

/**
 * Simple mock function for Cloudinary (not used when USE_CLOUDINARY=false)
 */
export const uploadToCloudinary = (buffer, folder = 'mathe-class', resourceType = 'auto') => {
  console.log(`⚠️ Cloudinary upload called but disabled. Using local fallback.`);
  return Promise.resolve({
    secure_url: `/Uploads/fallback_${Date.now()}.${resourceType === 'raw' ? 'pdf' : 'jpg'}`,
    public_id: `fallback_${Date.now()}`
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