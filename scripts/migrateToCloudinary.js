// scripts/migrateToCloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import db from '../models/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Lesson, Course } = db;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

console.log('🔧 Starting Cloudinary Migration\n');

/**
 * Test Cloudinary connection
 */
const testCloudinaryConnection = async () => {
  try {
    console.log('🔗 Testing Cloudinary connection...');
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful');
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    return false;
  }
};

/**
 * Upload a file to Cloudinary
 */
const uploadFile = async (filePath, filename, fileType = 'auto') => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`   ❌ File not found: ${filePath}`);
      return null;
    }

    console.log(`   📤 Uploading: ${filename}`);
    
    // Determine folder based on file type
    let folder = 'mathe-class/files';
    if (filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      folder = 'mathe-class/images';
    } else if (filename.match(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i)) {
      folder = 'mathe-class/videos';
    } else if (filename.toLowerCase().endsWith('.pdf')) {
      folder = 'mathe-class/pdfs';
    }

    // Create unique public ID
    const publicId = `${folder}/${Date.now()}_${filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_')}`;
    
    const result = await cloudinary.uploader.upload(filePath, {
      public_id: publicId,
      resource_type: fileType,
      folder: folder,
      overwrite: false,
      access_mode: 'public',
    });

    console.log(`   ✅ Uploaded: ${result.secure_url.substring(0, 80)}...`);
    return result.secure_url;
  } catch (error) {
    console.error(`   ❌ Upload failed: ${error.message}`);
    return null;
  }
};

/**
 * Extract filename from URL
 */
const extractFilename = (url) => {
  if (!url) return null;
  
  try {
    // Handle local paths
    if (url.includes('/Uploads/')) {
      return url.split('/').pop();
    }
    
    // Handle http URLs
    if (url.startsWith('http')) {
      const urlObj = new URL(url);
      return urlObj.pathname.split('/').pop();
    }
    
    // Just a filename
    return url;
  } catch (error) {
    console.error('Error extracting filename:', error);
    return url;
  }
};

/**
 * Main migration function
 */
const migrateToCloudinary = async () => {
  console.log('🚀 Starting migration to Cloudinary\n');
  
  // Test connection
  const connected = await testCloudinaryConnection();
  if (!connected) {
    console.log('❌ Cannot proceed without Cloudinary connection');
    console.log('💡 Check your .env file for CLOUDINARY_* variables');
    process.exit(1);
  }

  try {
    const uploadsDir = path.join(__dirname, '..', 'Uploads');
    console.log(`📁 Uploads directory: ${uploadsDir}`);
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('❌ Uploads directory not found');
      process.exit(1);
    }

    // Step 1: Get all files in Uploads directory
    const localFiles = fs.readdirSync(uploadsDir);
    console.log(`📊 Found ${localFiles.length} files in Uploads directory\n`);

    // Step 2: Get database records with local files
    console.log('📊 Scanning database for local file references...\n');
    
    // Lessons with file_url
    const lessonsWithFiles = await Lesson.findAll({
      where: {
        file_url: {
          [db.Sequelize.Op.ne]: null,
          [db.Sequelize.Op.notLike]: '%cloudinary%'
        }
      }
    });

    // Lessons with video_url
    const lessonsWithVideos = await Lesson.findAll({
      where: {
        video_url: {
          [db.Sequelize.Op.ne]: null,
          [db.Sequelize.Op.notLike]: '%cloudinary%'
        }
      }
    });

    // Courses with thumbnails
    const coursesWithThumbnails = await Course.findAll({
      where: {
        thumbnail: {
          [db.Sequelize.Op.ne]: null,
          [db.Sequelize.Op.notLike]: '%cloudinary%'
        }
      }
    });

    console.log(`📊 Found:`);
    console.log(`   📚 Lessons with files: ${lessonsWithFiles.length}`);
    console.log(`   🎥 Lessons with videos: ${lessonsWithVideos.length}`);
    console.log(`   🖼️ Courses with thumbnails: ${coursesWithThumbnails.length}\n`);

    // Step 3: Process each record
    let migratedCount = 0;
    let failedCount = 0;

    // Process lessons with files
    for (const lesson of lessonsWithFiles) {
      const filename = extractFilename(lesson.file_url);
      if (!filename) continue;

      const filePath = path.join(uploadsDir, filename);
      
      console.log(`\n📄 Processing lesson ${lesson.id}: ${lesson.title}`);
      console.log(`   File: ${filename}`);

      const cloudinaryUrl = await uploadFile(filePath, filename, 'raw');
      
      if (cloudinaryUrl) {
        await lesson.update({ file_url: cloudinaryUrl });
        console.log(`   ✅ Updated database with Cloudinary URL`);
        migratedCount++;
      } else {
        console.log(`   ❌ Failed to upload`);
        failedCount++;
      }
    }

    // Process lessons with videos
    for (const lesson of lessonsWithVideos) {
      const filename = extractFilename(lesson.video_url);
      if (!filename) continue;

      const filePath = path.join(uploadsDir, filename);
      
      console.log(`\n🎥 Processing lesson ${lesson.id}: ${lesson.title}`);
      console.log(`   Video: ${filename}`);

      const cloudinaryUrl = await uploadFile(filePath, filename, 'video');
      
      if (cloudinaryUrl) {
        await lesson.update({ video_url: cloudinaryUrl });
        console.log(`   ✅ Updated database with Cloudinary URL`);
        migratedCount++;
      } else {
        console.log(`   ❌ Failed to upload`);
        failedCount++;
      }
    }

    // Process courses with thumbnails
    for (const course of coursesWithThumbnails) {
      const filename = extractFilename(course.thumbnail);
      if (!filename) continue;

      const filePath = path.join(uploadsDir, filename);
      
      console.log(`\n🖼️ Processing course ${course.id}: ${course.title}`);
      console.log(`   Thumbnail: ${filename}`);

      const cloudinaryUrl = await uploadFile(filePath, filename, 'image');
      
      if (cloudinaryUrl) {
        await course.update({ thumbnail: cloudinaryUrl });
        console.log(`   ✅ Updated database with Cloudinary URL`);
        migratedCount++;
      } else {
        console.log(`   ❌ Failed to upload`);
        failedCount++;
      }
    }

    // Step 4: Summary
    console.log('\n🎉 Migration Summary');
    console.log('===================');
    console.log(`✅ Successfully migrated: ${migratedCount} files`);
    console.log(`❌ Failed to migrate: ${failedCount} files`);
    
    if (failedCount > 0) {
      console.log('\n⚠️ Some files failed to migrate. You may need to:');
      console.log('   1. Check if files exist in Uploads directory');
      console.log('   2. Check file permissions');
      console.log('   3. Manually upload missing files to Cloudinary');
    }

    console.log('\n✅ Migration completed!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
  } finally {
    await db.sequelize.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run migration
migrateToCloudinary();