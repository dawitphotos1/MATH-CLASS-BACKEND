// // middleware/uploadMiddleware.js
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { v2 as cloudinary } from "cloudinary";
// import streamifier from "streamifier";

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
//   secure: true,
// });

// // Create local storage only for development
// const LOCAL_UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "Uploads");
// if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
//   fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
// }

// // Custom Cloudinary storage engine for v2
// const createCloudinaryStorage = () => {
//   return {
//     _handleFile: (req, file, cb) => {
//       const buffer = file.buffer;
//       const originalname = file.originalname;
      
//       // Determine resource type and folder
//       let resourceType = "auto";
//       let folder = "mathe-class/files";
      
//       if (file.mimetype.startsWith("image/")) {
//         resourceType = "image";
//         folder = "mathe-class/images";
//       } else if (file.mimetype.startsWith("video/")) {
//         resourceType = "video";
//         folder = "mathe-class/videos";
//       } else if (file.mimetype === "application/pdf") {
//         resourceType = "raw";
//         folder = "mathe-class/pdfs";
//       } else if (file.mimetype.includes("document") || file.mimetype.includes("text")) {
//         resourceType = "raw";
//         folder = "mathe-class/documents";
//       }
      
//       // Create unique public ID
//       const timestamp = Date.now();
//       const safeName = path.parse(originalname).name.replace(/[^a-zA-Z0-9-_]/g, "_");
//       const publicId = `${safeName}_${timestamp}`;
      
//       // Upload to Cloudinary
//       const uploadStream = cloudinary.uploader.upload_stream(
//         {
//           resource_type: resourceType,
//           public_id: publicId,
//           folder: folder,
//           overwrite: false,
//           access_mode: "public",
//         },
//         (error, result) => {
//           if (error) {
//             console.error("Cloudinary upload error:", error);
//             // Fallback to local storage
//             const localPath = path.join(LOCAL_UPLOAD_DIR, `${safeName}_${timestamp}${path.extname(originalname)}`);
//             fs.writeFileSync(localPath, buffer);
//             cb(null, {
//               filename: `${safeName}_${timestamp}${path.extname(originalname)}`,
//               path: `/Uploads/${safeName}_${timestamp}${path.extname(originalname)}`,
//               size: buffer.length,
//               mimetype: file.mimetype,
//               originalname: originalname,
//             });
//           } else {
//             // Return file info with Cloudinary URL
//             cb(null, {
//               filename: originalname,
//               path: result.secure_url,
//               size: buffer.length,
//               mimetype: file.mimetype,
//               originalname: originalname,
//               location: result.secure_url,
//             });
//           }
//         }
//       );
      
//       streamifier.createReadStream(buffer).pipe(uploadStream);
//     },
    
//     _removeFile: (req, file, cb) => {
//       cb(null);
//     }
//   };
// };

// // Local storage for development
// const localStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, LOCAL_UPLOAD_DIR);
//   },
//   filename: (req, file, cb) => {
//     const timestamp = Date.now();
//     const safeName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, "_");
//     const ext = path.extname(file.originalname);
//     cb(null, `${safeName}_${timestamp}${ext}`);
//   },
// });

// // Choose storage based on environment
// const storage = process.env.NODE_ENV === "production" ? createCloudinaryStorage() : localStorage;

// const allowedMimes = [
//   "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
//   "video/mp4", "video/mpeg", "video/quicktime", "video/webm", "video/x-msvideo",
//   "application/pdf",
//   "application/msword",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   "text/plain",
// ];

// const fileFilter = (req, file, cb) => {
//   if (allowedMimes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error(`File type ${file.mimetype} not allowed`), false);
//   }
// };

// const upload = multer({
//   storage: storage,
//   fileFilter: fileFilter,
//   limits: {
//     fileSize: process.env.MAX_FILE_SIZE ? Number(process.env.MAX_FILE_SIZE) : 150 * 1024 * 1024 // 150MB default
//   }
// });

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

// // Helper function to check if URL is Cloudinary
// export const isCloudinaryUrl = (url) => {
//   return url && url.includes("cloudinary.com");
// };

// export default upload;




// middleware/uploadMiddleware.js
import multer from "multer";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// Configure Cloudinary
console.log("☁️ Cloudinary Configuration:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "Set" : "Not set",
  api_key: process.env.CLOUDINARY_API_KEY ? "Set" : "Not set",
  use_cloudinary: process.env.USE_CLOUDINARY
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true,
});

// Create local storage only for development
const LOCAL_UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "Uploads");
if (!fs.existsSync(LOCAL_UPLOAD_DIR)) {
  fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
}

// Custom Cloudinary storage engine
const createCloudinaryStorage = () => {
  return {
    _handleFile: (req, file, cb) => {
      console.log(`☁️ Uploading to Cloudinary: ${file.originalname} (${file.mimetype})`);
      
      const buffer = file.buffer;
      const originalname = file.originalname;
      
      // Determine resource type and folder
      let resourceType = "auto";
      let folder = "mathe-class/files";
      
      if (file.mimetype.startsWith("image/")) {
        resourceType = "image";
        folder = "mathe-class/images";
      } else if (file.mimetype.startsWith("video/")) {
        resourceType = "video";
        folder = "mathe-class/videos";
      } else if (file.mimetype === "application/pdf") {
        resourceType = "raw";
        folder = "mathe-class/pdfs";
      } else if (file.mimetype.includes("document") || file.mimetype.includes("text")) {
        resourceType = "raw";
        folder = "mathe-class/documents";
      }
      
      // Create unique public ID
      const timestamp = Date.now();
      const safeName = path.parse(originalname).name.replace(/[^a-zA-Z0-9-_]/g, "_");
      const ext = path.extname(originalname);
      const publicId = `${safeName}_${timestamp}`;
      
      // Upload to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          public_id: publicId,
          folder: folder,
          overwrite: false,
          access_mode: "public",
          timeout: 60000,
        },
        (error, result) => {
          if (error) {
            console.error("❌ Cloudinary upload error:", error.message);
            
            // Fallback to local storage
            console.log("📁 Falling back to local storage...");
            const localPath = path.join(LOCAL_UPLOAD_DIR, `${safeName}_${timestamp}${ext}`);
            fs.writeFileSync(localPath, buffer);
            
            cb(null, {
              filename: `${safeName}_${timestamp}${ext}`,
              path: `/Uploads/${safeName}_${timestamp}${ext}`,
              size: buffer.length,
              mimetype: file.mimetype,
              originalname: originalname,
              location: `/Uploads/${safeName}_${timestamp}${ext}`,
            });
          } else {
            console.log(`✅ Cloudinary upload successful: ${result.secure_url.substring(0, 80)}...`);
            
            // Return file info with Cloudinary URL
            cb(null, {
              filename: originalname,
              path: result.secure_url,
              size: buffer.length,
              mimetype: file.mimetype,
              originalname: originalname,
              location: result.secure_url,
              public_id: result.public_id,
              cloudinary: true,
            });
          }
        }
      );
      
      streamifier.createReadStream(buffer).pipe(uploadStream);
    },
    
    _removeFile: (req, file, cb) => {
      cb(null);
    }
  };
};

// Local storage for development
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(`📁 Saving locally to: ${LOCAL_UPLOAD_DIR}`);
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

// Choose storage based on environment and configuration
const shouldUseCloudinary = process.env.USE_CLOUDINARY === "true" && 
                           process.env.CLOUDINARY_CLOUD_NAME && 
                           process.env.CLOUDINARY_API_KEY;

console.log(`🔄 Storage selection: ${shouldUseCloudinary ? 'Cloudinary' : 'Local'}`);

const storage = shouldUseCloudinary ? createCloudinaryStorage() : localStorage;

const allowedMimes = [
  "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
  "video/mp4", "video/mpeg", "video/quicktime", "video/webm", "video/x-msvideo",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const fileFilter = (req, file, cb) => {
  console.log(`🔍 Checking file type: ${file.originalname} (${file.mimetype})`);
  
  if (allowedMimes.includes(file.mimetype)) {
    console.log(`✅ File type allowed: ${file.mimetype}`);
    cb(null, true);
  } else {
    console.log(`❌ File type not allowed: ${file.mimetype}`);
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE ? Number(process.env.MAX_FILE_SIZE) : 150 * 1024 * 1024 // 150MB default
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

export const singleUpload = upload.single("file");

// Helper function to check if URL is Cloudinary
export const isCloudinaryUrl = (url) => {
  return url && url.includes("cloudinary.com");
};

export default upload;