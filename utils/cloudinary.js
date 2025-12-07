// utils/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Helper to extract public_id from Cloudinary URL
export const extractPublicId = (url) => {
  if (!url || !url.includes('cloudinary')) return null;
  
  try {
    const parts = url.split('/');
    const uploadIndex = parts.findIndex(part => part === 'upload');
    
    if (uploadIndex !== -1) {
      const pathParts = parts.slice(uploadIndex + 1);
      const fullPath = pathParts.join('/');
      return fullPath.replace(/\.[^/.]+$/, ""); // Remove file extension
    }
  } catch (error) {
    console.error('Error extracting public_id:', error);
  }
  
  return null;
};

// Delete file from Cloudinary
export const deleteCloudinaryFile = async (fileUrl) => {
  if (!fileUrl || !fileUrl.includes('cloudinary')) return null;
  
  try {
    const publicId = extractPublicId(fileUrl);
    if (!publicId) return null;
    
    const resourceType = fileUrl.includes('/video/') ? 'video' : 
                        fileUrl.includes('/raw/') ? 'raw' : 'image';
    
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true
    });
    
    console.log('Deleted from Cloudinary:', publicId);
    return result;
  } catch (error) {
    console.error('Error deleting Cloudinary file:', error);
    return null;
  }
};

// Upload buffer to Cloudinary
export const uploadBufferToCloudinary = async (buffer, options = {}) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: options.resourceType || 'raw',
          folder: options.folder || 'mathe-class/files',
          public_id: options.publicId,
          ...options
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.end(buffer);
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Upload a local file to Cloudinary
export const uploadLocalFileToCloudinary = async (localPath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      resource_type: 'auto',
      ...options
    });
    return result;
  } catch (error) {
    console.error('Error uploading local file to Cloudinary:', error);
    throw error;
  }
};

// Generate Cloudinary URL for a public_id
export const generateCloudinaryUrl = (publicId, options = {}) => {
  const defaultOptions = {
    secure: true,
    resource_type: 'auto',
    ...options
  };
  
  return cloudinary.url(publicId, defaultOptions);
};

export { cloudinary };