// utils/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import fs from 'fs';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload file buffer to Cloudinary
 */
export const uploadBufferToCloudinary = async (buffer, originalname, folder = 'mathe-class/files') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'auto',
        folder: folder,
        public_id: `${Date.now()}_${path.parse(originalname).name.replace(/[^a-zA-Z0-9-_]/g, '_')}`,
        overwrite: false,
        access_mode: 'public',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Upload local file to Cloudinary
 */
export const uploadLocalFileToCloudinary = async (localPath, folder = 'mathe-class/files') => {
  try {
    if (!fs.existsSync(localPath)) {
      throw new Error(`File not found: ${localPath}`);
    }
    
    const filename = path.basename(localPath);
    const publicId = `${Date.now()}_${path.parse(filename).name.replace(/[^a-zA-Z0-9-_]/g, '_')}`;
    
    const result = await cloudinary.uploader.upload(localPath, {
      public_id: publicId,
      folder: folder,
      overwrite: false,
      access_mode: 'public',
    });
    
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Get folder based on file type
 */
export const getFolderForFile = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
    return 'mathe-class/images';
  } else if (['.mp4', '.mov', '.avi', '.wmv', '.flv', '.mkv', '.webm'].includes(ext)) {
    return 'mathe-class/videos';
  } else if (ext === '.pdf') {
    return 'mathe-class/pdfs';
  }
  
  return 'mathe-class/files';
};

/**
 * Check if URL is Cloudinary URL
 */
export const isCloudinaryUrl = (url) => {
  return url && url.includes('cloudinary.com');
};

/**
 * Delete file from Cloudinary
 */
export const deleteFromCloudinary = async (url) => {
  if (!isCloudinaryUrl(url)) return;
  
  try {
    // Extract public ID from URL
    const urlParts = url.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex !== -1) {
      const publicIdWithExt = urlParts.slice(uploadIndex + 2).join('/');
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
      
      await cloudinary.uploader.destroy(publicId);
      console.log('Deleted from Cloudinary:', publicId);
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
};

/**
 * Generate Cloudinary URL for a public ID
 */
export const generateCloudinaryUrl = (publicId, options = {}) => {
  const defaultOptions = {
    secure: true,
    resource_type: 'auto',
    ...options
  };
  
  return cloudinary.url(publicId, defaultOptions);
};

export { cloudinary };