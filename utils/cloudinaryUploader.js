// // utils/cloudinaryUploader.js
// import { v2 as cloudinary } from "cloudinary";
// import streamifier from "streamifier";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
//   secure: true,
// });

// export const uploadFileToCloudinary = (buffer, options = {}) => {
//   return new Promise((resolve, reject) => {
//     const uploadStream = cloudinary.uploader.upload_stream(
//       {
//         folder: options.folder || "mathe-class",
//         resource_type: options.resourceType || "auto",
//         public_id: options.publicId,
//         overwrite: options.overwrite || false,
//         timeout: 60000,
//       },
//       (error, result) => {
//         if (error) reject(error);
//         else resolve(result);
//       }
//     );

//     streamifier.createReadStream(buffer).pipe(uploadStream);
//   });
// };

// export const deleteFromCloudinary = (publicId) => {
//   return cloudinary.uploader.destroy(publicId);
// };

// export const getCloudinaryUrl = (publicId, options = {}) => {
//   return cloudinary.url(publicId, {
//     secure: true,
//     ...options,
//   });
// };




// utils/cloudinaryUploader.js
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadFileToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'mathe-class',
        resource_type: options.resourceType || 'auto',
        public_id: options.publicId,
        overwrite: options.overwrite || false,
        timeout: 60000,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export const deleteFromCloudinary = (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

export const getCloudinaryUrl = (publicId, options = {}) => {
  return cloudinary.url(publicId, {
    secure: true,
    ...options,
  });
};