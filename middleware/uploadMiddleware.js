// middleware/uploadMiddleware.js
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import path from "path";
import fs from "fs";

console.log("=== uploadMiddleware init ===");

// === Option A selected by user: prefer Cloudinary ===
const CLOUDINARY_CONFIGURED =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (CLOUDINARY_CONFIGURED) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  console.log("✅ Cloudinary configured (will be used).");
} else {
  console.warn(
    "⚠️ Cloudinary NOT fully configured. Falling back to local storage."
  );
}

// Multer memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE
      ? Number(process.env.MAX_FILE_SIZE)
      : 150 * 1024 * 1024,
  },
});

// Fields expected for lesson uploads
export const uploadLessonFiles = upload.fields([
  { name: "video", maxCount: 1 },
  { name: "file", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
  { name: "attachments", maxCount: 10 },
]);

// Local Uploads folder (fallback)
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "Uploads");
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

/* -------------------------
   Helpers
------------------------- */

const chooseCloudinaryTypeAndFolder = (mimetype = "", originalname = "") => {
  mimetype = mimetype.toLowerCase();
  const ext = path.extname(originalname || "").toLowerCase();

  if (mimetype.startsWith("image/"))
    return { resourceType: "image", folder: "mathe-class/images" };

  if (mimetype.startsWith("video/"))
    return { resourceType: "video", folder: "mathe-class/videos" };

  if (
    mimetype === "application/pdf" ||
    [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx"].includes(ext)
  ) {
    return { resourceType: "raw", folder: "mathe-class/docs" };
  }

  return { resourceType: "auto", folder: "mathe-class/files" };
};

const uploadBufferToCloudinary = (buffer, opts = {}) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      opts,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });

const saveBufferLocally = (buffer, originalname) => {
  const safeName = path
    .parse(originalname)
    .name.replace(/[^a-zA-Z0-9-_]/g, "_");
  const ext = path.extname(originalname);
  const filename = `${safeName}_${Date.now()}${ext}`;
  const fullPath = path.join(LOCAL_UPLOAD_DIR, filename);
  fs.writeFileSync(fullPath, buffer);
  return `/Uploads/${filename}`;
};

/* -------------------------
   MAIN PROCESSOR
------------------------- */

export const processUploadedFiles = async (req) => {
  const out = { fileUrl: null, videoUrl: null, attachments: [] };

  if (!req.files || Object.keys(req.files).length === 0) {
    req.processedUploads = out;
    return out;
  }

  for (const field of Object.keys(req.files)) {
    for (const file of req.files[field]) {
      const { buffer, originalname, mimetype } = file;

      try {
        if (CLOUDINARY_CONFIGURED) {
          const { resourceType, folder } = chooseCloudinaryTypeAndFolder(
            mimetype,
            originalname
          );

          const result = await uploadBufferToCloudinary(buffer, {
            resource_type: resourceType,
            folder,
          });

          if (field === "video") out.videoUrl = result.secure_url;
          else if (field === "pdf") out.fileUrl = result.secure_url;
          else out.attachments.push({ url: result.secure_url });
        } else {
          const localUrl = saveBufferLocally(buffer, originalname);
          if (field === "video") out.videoUrl = localUrl;
          else if (field === "pdf") out.fileUrl = localUrl;
          else out.attachments.push({ url: localUrl });
        }
      } catch (err) {
        console.error("❌ Upload failed:", err.message);
      }
    }
  }

  req.processedUploads = out;
  return out;
};

// Attach helpers to multer instance (backward compatibility)
upload.uploadLessonFiles = uploadLessonFiles;
upload.processUploadedFiles = processUploadedFiles;
upload.CLOUDINARY_CONFIGURED = CLOUDINARY_CONFIGURED;

console.log("✅ uploadMiddleware ready");

// Default export ONLY
export default upload;

// ✅ Named exports WITHOUT duplicates
export { upload as uploadInstance, CLOUDINARY_CONFIGURED };


