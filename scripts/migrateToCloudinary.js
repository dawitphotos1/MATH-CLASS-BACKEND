// // scripts/migrateToCloudinary.js
// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);

// const cloudinary = require('cloudinary').v2;
// import db from '../models/index.js';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const { Lesson, Course } = db;

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
//   secure: true
// });

// console.log('🔧 Cloudinary Configuration:');
// console.log('   Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
// console.log('   API Key:', process.env.CLOUDINARY_API_KEY?.substring(0, 8) + '...');
// console.log('   Environment:', process.env.NODE_ENV);

// // Test Cloudinary connection
// const testConnection = async () => {
//   try {
//     console.log('\n🔗 Testing Cloudinary connection...');
//     const result = await cloudinary.api.ping();
//     console.log('✅ Cloudinary connection successful!');
//     console.log('   Status:', result.status);
//     return true;
//   } catch (error) {
//     console.error('❌ Cloudinary connection failed:', error.message);
//     return false;
//   }
// };

// // Upload a single file to Cloudinary
// const uploadFileToCloudinary = async (filePath, options = {}) => {
//   try {
//     if (!fs.existsSync(filePath)) {
//       console.log(`   ❌ File does not exist: ${filePath}`);
//       return null;
//     }

//     console.log(`   📤 Uploading: ${path.basename(filePath)}`);
    
//     const result = await cloudinary.uploader.upload(filePath, {
//       resource_type: 'auto',
//       ...options
//     });

//     console.log(`   ✅ Uploaded successfully!`);
//     console.log(`      URL: ${result.secure_url.substring(0, 80)}...`);
//     return result.secure_url;
//   } catch (error) {
//     console.error(`   ❌ Upload failed: ${error.message}`);
//     return null;
//   }
// };

// // Migrate all files
// const migrateToCloudinary = async () => {
//   console.log('\n🚀 Starting Cloudinary Migration');
//   console.log('=================================');

//   // Test connection first
//   const connected = await testConnection();
//   if (!connected) {
//     console.log('❌ Cannot proceed without Cloudinary connection');
//     console.log('💡 Check your .env file for CLOUDINARY_* variables');
//     process.exit(1);
//   }

//   try {
//     const uploadsDir = path.join(__dirname, '..', 'Uploads');
//     console.log(`\n📁 Uploads directory: ${uploadsDir}`);

//     // Get all unique files from database
//     const allFiles = new Set();

//     // Get files from lessons
//     const lessons = await Lesson.findAll({
//       attributes: ['video_url', 'file_url']
//     });

//     lessons.forEach(lesson => {
//       if (lesson.video_url && !lesson.video_url.includes('cloudinary')) {
//         const filename = decodeURIComponent(lesson.video_url.split('/').pop());
//         allFiles.add(filename);
//       }
//       if (lesson.file_url && !lesson.file_url.includes('cloudinary')) {
//         const filename = decodeURIComponent(lesson.file_url.split('/').pop());
//         allFiles.add(filename);
//       }
//     });

//     // Get files from courses
//     const courses = await Course.findAll({
//       attributes: ['thumbnail']
//     });

//     courses.forEach(course => {
//       if (course.thumbnail && !course.thumbnail.includes('cloudinary')) {
//         const filename = decodeURIComponent(course.thumbnail.split('/').pop());
//         allFiles.add(filename);
//       }
//     });

//     console.log(`\n📊 Found ${allFiles.size} unique files to migrate`);
//     console.log('Files:', Array.from(allFiles).slice(0, 10).join(', '), allFiles.size > 10 ? '...' : '');

//     // Upload each file and create mapping
//     const fileMapping = new Map();

//     for (const filename of allFiles) {
//       const filePath = path.join(uploadsDir, filename);
      
//       if (!fs.existsSync(filePath)) {
//         console.log(`\n❌ File not found: ${filename}`);
//         continue;
//       }

//       // Determine folder and options based on file type
//       let folder = 'mathe-class/files';
//       let publicId = `file_${Date.now()}_${filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_')}`;

//       if (filename.match(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i)) {
//         folder = 'mathe-class/videos';
//         publicId = `video_${Date.now()}_${filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_')}`;
//       } else if (filename.toLowerCase().endsWith('.pdf')) {
//         folder = 'mathe-class/pdfs';
//         publicId = `pdf_${Date.now()}_${filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_')}`;
//       } else if (filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
//         folder = 'mathe-class/images';
//         publicId = `img_${Date.now()}_${filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_')}`;
//       }

//       console.log(`\n📄 Processing: ${filename}`);
//       console.log(`   Type: ${path.extname(filename)}, Folder: ${folder}`);

//       const cloudinaryUrl = await uploadFileToCloudinary(filePath, {
//         folder: folder,
//         public_id: publicId,
//         overwrite: false
//       });

//       if (cloudinaryUrl) {
//         fileMapping.set(filename, cloudinaryUrl);
        
//         // Update all references to this file in the database
//         const localUrlPattern = `%${filename}%`;
        
//         // Update lessons with this file_url
//         await Lesson.update(
//           { file_url: cloudinaryUrl },
//           {
//             where: {
//               file_url: { [db.Sequelize.Op.like]: localUrlPattern },
//               file_url: { [db.Sequelize.Op.notLike]: '%cloudinary%' }
//             }
//           }
//         );

//         // Update lessons with this video_url
//         await Lesson.update(
//           { video_url: cloudinaryUrl },
//           {
//             where: {
//               video_url: { [db.Sequelize.Op.like]: localUrlPattern },
//               video_url: { [db.Sequelize.Op.notLike]: '%cloudinary%' }
//             }
//           }
//         );

//         // Update courses with this thumbnail
//         await Course.update(
//           { thumbnail: cloudinaryUrl },
//           {
//             where: {
//               thumbnail: { [db.Sequelize.Op.like]: localUrlPattern },
//               thumbnail: { [db.Sequelize.Op.notLike]: '%cloudinary%' }
//             }
//           }
//         );

//         console.log(`   ✅ Updated database references for ${filename}`);
//       }
//     }

//     console.log('\n🎉 Migration Summary');
//     console.log('===================');
//     console.log(`📊 Files processed: ${fileMapping.size}`);
//     console.log(`📊 Files in mapping:`, fileMapping.size);

//     // Show some example URLs
//     if (fileMapping.size > 0) {
//       console.log('\n📝 Example Cloudinary URLs:');
//       const entries = Array.from(fileMapping.entries()).slice(0, 3);
//       entries.forEach(([filename, url]) => {
//         console.log(`   ${filename} → ${url.substring(0, 80)}...`);
//       });
//     }

//     // Get final statistics
//     const cloudinaryLessons = await Lesson.count({
//       where: {
//         [db.Sequelize.Op.or]: [
//           { file_url: { [db.Sequelize.Op.like]: '%cloudinary%' } },
//           { video_url: { [db.Sequelize.Op.like]: '%cloudinary%' } }
//         ]
//       }
//     });

//     const cloudinaryCourses = await Course.count({
//       where: { thumbnail: { [db.Sequelize.Op.like]: '%cloudinary%' } }
//     });

//     console.log('\n📊 Final Database Stats:');
//     console.log(`   Lessons with Cloudinary URLs: ${cloudinaryLessons}`);
//     console.log(`   Courses with Cloudinary URLs: ${cloudinaryCourses}`);
//     console.log('\n✅ Migration completed successfully!');

//   } catch (error) {
//     console.error('\n❌ Migration failed:', error);
//     console.error('Stack:', error.stack);
//   } finally {
//     await db.sequelize.close();
//     console.log('\n🔌 Database connection closed');
//     process.exit(0);
//   }
// };

// // Run migration
// migrateToCloudinary();





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