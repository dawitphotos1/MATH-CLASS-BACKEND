// // middleware/uploadMiddleware.js
// import multer from "multer";
// import { v2 as cloudinary } from "cloudinary";
// import streamifier from "streamifier";
// import path from "path";
// import fs from "fs";

// console.log("=== uploadMiddleware init ===");

// // === Option A selected by user: prefer Cloudinary ===
// // We'll try to use Cloudinary when properly configured.
// // If Cloudinary is missing we'll FALLBACK to local storage but emit clear logs.
// const CLOUDINARY_CONFIGURED =
//   !!process.env.CLOUDINARY_CLOUD_NAME &&
//   !!process.env.CLOUDINARY_API_KEY &&
//   !!process.env.CLOUDINARY_API_SECRET;

// if (CLOUDINARY_CONFIGURED) {
//   cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
//     secure: true,
//   });
//   console.log("✅ Cloudinary configured (will be used).");
// } else {
//   console.warn(
//     "⚠️ Cloudinary NOT fully configured. Falling back to local storage.\n" +
//       "Set CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET in your env to enable Cloudinary."
//   );
// }

// // Multer memory storage so we can stream directly to cloudinary
// const storage = multer.memoryStorage();

// const upload = multer({
//   storage,
//   limits: {
//     fileSize: process.env.MAX_FILE_SIZE
//       ? Number(process.env.MAX_FILE_SIZE)
//       : 150 * 1024 * 1024, // 150MB fallback
//   },
// });

// // Fields expected for lesson uploads (matches your frontend)
// export const uploadLessonFiles = upload.fields([
//   { name: "video", maxCount: 1 },
//   { name: "file", maxCount: 1 },
//   { name: "pdf", maxCount: 1 },
//   { name: "attachments", maxCount: 10 },
// ]);

// // Local Uploads folder (fallback)
// const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "Uploads");
// if (!fs.existsSync(LOCAL_UPLOAD_DIR)) fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });

// /**
//  * Helper: choose Cloudinary resource type and folder by mimetype/extension
//  */
// const chooseCloudinaryTypeAndFolder = (mimetype = "", originalname = "") => {
//   mimetype = mimetype.toLowerCase();
//   const ext = path.extname(originalname || "").toLowerCase();

//   if (mimetype.startsWith("image/")) return { resourceType: "image", folder: "mathe-class/images" };
//   if (mimetype.startsWith("video/")) return { resourceType: "video", folder: "mathe-class/videos" };

//   if (mimetype === "application/pdf" || [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx"].includes(ext)) {
//     return { resourceType: "raw", folder: "mathe-class/docs" };
//   }

//   return { resourceType: "auto", folder: "mathe-class/files" };
// };

// /**
//  * Upload a buffer to Cloudinary using upload_stream
//  */
// const uploadBufferToCloudinary = (buffer, { resourceType = "auto", folder = "mathe-class/files", public_id } = {}) => {
//   return new Promise((resolve, reject) => {
//     const opts = { resource_type: resourceType, folder, timeout: 120000 };
//     if (public_id) opts.public_id = public_id;

//     const uploadStream = cloudinary.uploader.upload_stream(opts, (error, result) => {
//       if (error) return reject(error);
//       resolve(result);
//     });

//     streamifier.createReadStream(buffer).pipe(uploadStream);
//   });
// };

// /**
//  * Save buffer to local Uploads directory and return a public path (/Uploads/filename)
//  */
// const saveBufferLocally = (buffer, originalname) => {
//   const safeName = path.parse(originalname).name.replace(/[^a-zA-Z0-9-_]/g, "_");
//   const ext = path.extname(originalname) || "";
//   const filename = `${safeName}_${Date.now()}${ext}`;
//   const fullPath = path.join(LOCAL_UPLOAD_DIR, filename);
//   fs.writeFileSync(fullPath, buffer);
//   return `/Uploads/${filename}`;
// };

// /**
//  * processUploadedFiles(req)
//  * - Reads req.files (from multer memoryStorage)
//  * - Uploads each file to Cloudinary (if configured) or saves locally
//  * - Sets req.processedUploads = { fileUrl, videoUrl, attachments: [] }
//  *
//  * Returns the normalized object.
//  */
// export const processUploadedFiles = async (req) => {
//   const out = { fileUrl: null, videoUrl: null, attachments: [] };

//   if (!req.files || Object.keys(req.files).length === 0) {
//     req.processedUploads = out;
//     return out;
//   }

//   const allFields = Object.keys(req.files);

//   for (const field of allFields) {
//     const filesArr = req.files[field] || [];
//     for (const f of filesArr) {
//       const { buffer, originalname, mimetype } = f;
//       try {
//         const { resourceType, folder } = chooseCloudinaryTypeAndFolder(mimetype, originalname);

//         if (CLOUDINARY_CONFIGURED) {
//           const result = await uploadBufferToCloudinary(buffer, { resourceType, folder });
//           let finalUrl = result.secure_url;

//           // If Cloudinary returned an image upload URL for a PDF (rare), convert to raw URL
//           if (result.resource_type === "image" && (originalname || "").toLowerCase().endsWith(".pdf")) {
//             finalUrl = finalUrl.replace("/image/upload/", "/raw/upload/");
//           }

//           const fileObj = {
//             field,
//             originalname,
//             mimetype,
//             url: finalUrl,
//             public_id: result.public_id,
//             resource_type: result.resource_type,
//             format: result.format,
//             bytes: result.bytes,
//           };

//           if (field === "video") out.videoUrl = fileObj.url;
//           else if (field === "pdf" || (field === "file" && (originalname || "").toLowerCase().endsWith(".pdf"))) out.fileUrl = fileObj.url;
//           else if (field === "file" && fileObj.resource_type === "video") out.videoUrl = fileObj.url;
//           else if (fileObj.resource_type === "image") {
//             if (field === "file" && !out.fileUrl) out.fileUrl = fileObj.url;
//             else out.attachments.push(fileObj);
//           } else {
//             if (!out.fileUrl && (field === "file" || field === "attachments")) out.fileUrl = fileObj.url;
//             else out.attachments.push(fileObj);
//           }
//         } else {
//           // Fallback: local save
//           const localPath = saveBufferLocally(buffer, originalname);
//           const fileObj = {
//             field,
//             originalname,
//             mimetype,
//             url: localPath,
//             public_id: null,
//             resource_type: "local",
//             format: path.extname(originalname).replace(".", ""),
//             bytes: buffer.length,
//           };

//           if (field === "video") out.videoUrl = fileObj.url;
//           else if (field === "pdf" || (field === "file" && (originalname || "").toLowerCase().endsWith(".pdf"))) out.fileUrl = fileObj.url;
//           else if (field === "file" && fileObj.resource_type === "video") out.videoUrl = fileObj.url;
//           else if (fileObj.resource_type === "image") {
//             if (field === "file" && !out.fileUrl) out.fileUrl = fileObj.url;
//             else out.attachments.push(fileObj);
//           } else {
//             if (!out.fileUrl && (field === "file" || field === "attachments")) out.fileUrl = fileObj.url;
//             else out.attachments.push(fileObj);
//           }
//         }
//       } catch (err) {
//         console.error("❌ Upload failed for file", originalname, ":", err?.message || err);
//         // continue - controller can handle missing uploads
//       }
//     }
//   }

//   req.processedUploads = out;
//   return out;
// };

// // Attach helper props to multer instance for maximum backward compatibility
// upload.uploadLessonFiles = uploadLessonFiles;
// upload.processUploadedFiles = processUploadedFiles;
// upload.CLOUDINARY_CONFIGURED = CLOUDINARY_CONFIGURED;

// console.log("✅ uploadMiddleware ready. Exports: upload (multer instance), uploadLessonFiles, processUploadedFiles");

// // Default export = multer instance (so old code using `import upload from '...'; upload.single(...)` works)
// // Also provide named exports.
// export default upload;
// export { upload as uploadInstance, uploadLessonFiles, processUploadedFiles, CLOUDINARY_CONFIGURED };




// middleware/uploadMiddleware.js
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import path from "path";
import fs from "fs";

console.log("=== uploadMiddleware init ===");

// -------------------------------------------------------
// CLOUDINARY INITIALIZATION
// -------------------------------------------------------
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
  console.log("✅ Cloudinary configured and enabled.");
} else {
  console.warn(
    "⚠️ Cloudinary NOT configured. Using LOCAL STORAGE fallback.\n" +
      "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to enable Cloudinary."
  );
}

// -------------------------------------------------------
// MULTER MEMORY STORAGE
// -------------------------------------------------------
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE
      ? Number(process.env.MAX_FILE_SIZE)
      : 150 * 1024 * 1024, // 150MB default
  },
});

// Named export for lesson uploads
export const uploadLessonFiles = upload.fields([
  { name: "video", maxCount: 1 },
  { name: "file", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
  { name: "attachments", maxCount: 10 },
]);

// -------------------------------------------------------
// LOCAL STORAGE FALLBACK
// -------------------------------------------------------
const LOCAL_UPLOAD_DIR = path.join(process.cwd(), "Uploads");
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });

const saveBufferLocally = (buffer, originalname) => {
  const safeName = path.parse(originalname).name.replace(/[^a-zA-Z0-9-_]/g, "_");
  const ext = path.extname(originalname) || "";
  const filename = `${safeName}_${Date.now()}${ext}`;
  const fullPath = path.join(LOCAL_UPLOAD_DIR, filename);

  fs.writeFileSync(fullPath, buffer);
  return `/Uploads/${filename}`;
};

// -------------------------------------------------------
// CLOUDINARY HELPERS
// -------------------------------------------------------
const chooseCloudinaryTypeAndFolder = (mimetype = "", originalname = "") => {
  mimetype = mimetype.toLowerCase();
  const ext = path.extname(originalname || "").toLowerCase();

  if (mimetype.startsWith("image/")) return { resourceType: "image", folder: "mathe-class/images" };
  if (mimetype.startsWith("video/")) return { resourceType: "video", folder: "mathe-class/videos" };
  if (
    mimetype === "application/pdf" ||
    [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx"].includes(ext)
  ) return { resourceType: "raw", folder: "mathe-class/docs" };

  return { resourceType: "auto", folder: "mathe-class/files" };
};

const uploadBufferToCloudinary = (buffer, { resourceType = "auto", folder = "mathe-class/files", public_id } = {}) =>
  new Promise((resolve, reject) => {
    const opts = { resource_type: resourceType, folder, timeout: 120000 };
    if (public_id) opts.public_id = public_id;

    const uploadStream = cloudinary.uploader.upload_stream(opts, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });

// -------------------------------------------------------
// MAIN FILE PROCESSOR
// -------------------------------------------------------
export const processUploadedFiles = async (req) => {
  const out = { fileUrl: null, videoUrl: null, attachments: [] };

  if (!req.files || Object.keys(req.files).length === 0) {
    req.processedUploads = out;
    return out;
  }

  for (const field of Object.keys(req.files)) {
    const filesArr = req.files[field] || [];

    for (const f of filesArr) {
      const { buffer, originalname, mimetype } = f;

      try {
        let fileObj;

        if (CLOUDINARY_CONFIGURED) {
          const { resourceType, folder } = chooseCloudinaryTypeAndFolder(mimetype, originalname);
          const result = await uploadBufferToCloudinary(buffer, { resourceType, folder });
          let finalUrl = result.secure_url;

          if (result.resource_type === "image" && originalname.toLowerCase().endsWith(".pdf")) {
            finalUrl = finalUrl.replace("/image/upload/", "/raw/upload/");
          }

          fileObj = {
            field,
            originalname,
            mimetype,
            url: finalUrl,
            public_id: result.public_id,
            resource_type: result.resource_type,
            format: result.format,
            bytes: result.bytes,
          };
        } else {
          const localUrl = saveBufferLocally(buffer, originalname);
          fileObj = {
            field,
            originalname,
            mimetype,
            url: localUrl,
            public_id: null,
            resource_type: "local",
            format: path.extname(originalname).replace(".", ""),
            bytes: buffer.length,
          };
        }

        const lowerName = originalname.toLowerCase();
        if (field === "video") out.videoUrl = fileObj.url;
        else if (field === "pdf" || lowerName.endsWith(".pdf")) out.fileUrl = fileObj.url;
        else if (field === "file" && fileObj.resource_type === "video") out.videoUrl = fileObj.url;
        else if (fileObj.resource_type === "image") {
          if (field === "file" && !out.fileUrl) out.fileUrl = fileObj.url;
          else out.attachments.push(fileObj);
        } else {
          if (!out.fileUrl && (field === "file" || field === "attachments")) out.fileUrl = fileObj.url;
          else out.attachments.push(fileObj);
        }
      } catch (err) {
        console.error("❌ Upload failed:", originalname, err?.message || err);
      }
    }
  }

  req.processedUploads = out;
  return out;
};

// -------------------------------------------------------
// EXPORTS
// -------------------------------------------------------
upload.processUploadedFiles = processUploadedFiles;
upload.CLOUDINARY_CONFIGURED = CLOUDINARY_CONFIGURED;

console.log("✅ uploadMiddleware ready. Exports: upload, uploadLessonFiles, processUploadedFiles");

export default upload; // default export
export { upload as uploadInstance, CLOUDINARY_CONFIGURED }; // named exports (no duplicates)
