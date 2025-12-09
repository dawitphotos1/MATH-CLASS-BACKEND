// utils/cloudinaryHelper.js
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadFile = async (buffer, options = {}) => {
  const {
    folder = 'mathe-class',
    resourceType = 'auto',
    publicId,
    overwrite = false
  } = options;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: publicId,
        overwrite,
        timeout: 60000,
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log(`✅ Cloudinary upload successful to ${folder}:`, result.public_id);
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

export const uploadMultipleFiles = async (files, folder = 'mathe-class') => {
  const uploadPromises = files.map(file => 
    uploadFile(file.buffer, { folder, resourceType: file.mimetype.startsWith('image') ? 'image' : 'raw' })
  );
  
  return Promise.all(uploadPromises);
};

export const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('🗑️ Cloudinary delete result:', result);
    return result;
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
    throw error;
  }
};