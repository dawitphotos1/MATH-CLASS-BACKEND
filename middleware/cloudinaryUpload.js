// // middleware/cloudinaryUpload.js
// import multer from "multer";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import cloudinary from "../config/cloudinary.js";

// // MIME whitelist
// const allowedMimes = new Set([
//   "image/jpeg",
//   "image/jpg",
//   "image/png",
//   "image/gif",
//   "video/mp4",
//   "video/mpeg",
//   "video/quicktime",
//   "video/webm",
//   "application/pdf",
//   "application/msword",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   "text/plain",
// ]);

// const storage = new CloudinaryStorage({
//   cloudinary,
//   params: async (req, file) => {
//     // Folder by fieldname for easier organization
//     const fieldFolder = file.fieldname || "uploads";

//     // Use explicit video resource_type for better processing
//     const resourceType = file.fieldname === "video" ? "video" : "auto";

//     // Public id: timestamp + sanitized original name (keeps files unique)
//     const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "_");
//     const publicId = `${Date.now()}-${safeName}`;

//     return {
//       folder: `mathe-class-uploads/${fieldFolder}`,
//       resource_type: resourceType,
//       public_id: publicId,
//       overwrite: false,
//     };
//   },
// });

// const fileFilter = (req, file, cb) => {
//   if (!file || !file.mimetype) return cb(new Error("Invalid file"), false);
//   if (allowedMimes.has(file.mimetype)) cb(null, true);
//   else cb(new Error(`File type ${file.mimetype} not allowed`), false);
// };

// export const cloudUpload = multer({ storage, fileFilter });

// export default cloudUpload;





import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isVideo =
      file.mimetype.startsWith("video/") ||
      ["mp4", "mov", "avi", "webm"].some((ext) =>
        file.originalname.toLowerCase().endsWith(ext)
      );

    return {
      folder: "mathe-class",
      resource_type: isVideo ? "video" : "auto",
      public_id: `${Date.now()}-${file.originalname.replace(
        /[^a-zA-Z0-9.]/g,
        "_"
      )}`,
    };
  },
});

export const cloudUpload = multer({ storage });
