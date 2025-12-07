// import cloudinary from "../utils/cloudinary.js";
// import db from "../models/index.js";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const { Lesson, Course } = db;

// const migrateToCloudinary = async () => {
//   console.log("Starting migration to Cloudinary...");

//   try {
//     // Migrate lesson files
//     const lessons = await Lesson.findAll({
//       where: {
//         [db.Sequelize.Op.or]: [
//           { video_url: { [db.Sequelize.Op.ne]: null } },
//           { file_url: { [db.Sequelize.Op.ne]: null } },
//         ],
//       },
//     });

//     console.log(`Found ${lessons.length} lessons with files to migrate`);

//     for (const lesson of lessons) {
//       // Migrate video
//       if (lesson.video_url && !lesson.video_url.includes("cloudinary")) {
//         console.log(
//           `Migrating video for lesson ${lesson.id}: ${lesson.video_url}`
//         );

//         const localPath = path.join(__dirname, "..", lesson.video_url);

//         if (fs.existsSync(localPath)) {
//           try {
//             const result = await cloudinary.v2.uploader.upload(localPath, {
//               resource_type: "video",
//               folder: "mathe-class/videos",
//               public_id: `video_lesson_${lesson.id}_${Date.now()}`,
//             });

//             lesson.video_url = result.secure_url;
//             await lesson.save();
//             console.log(`✓ Video migrated: ${result.secure_url}`);
//           } catch (error) {
//             console.error(
//               `✗ Failed to migrate video for lesson ${lesson.id}:`,
//               error.message
//             );
//           }
//         }
//       }

//       // Migrate PDF/file
//       if (lesson.file_url && !lesson.file_url.includes("cloudinary")) {
//         console.log(
//           `Migrating file for lesson ${lesson.id}: ${lesson.file_url}`
//         );

//         const localPath = path.join(__dirname, "..", lesson.file_url);

//         if (fs.existsSync(localPath)) {
//           try {
//             const isPdf = lesson.file_url.toLowerCase().endsWith(".pdf");
//             const result = await cloudinary.v2.uploader.upload(localPath, {
//               resource_type: isPdf ? "raw" : "auto",
//               folder: isPdf ? "mathe-class/pdfs" : "mathe-class/files",
//               public_id: `${isPdf ? "pdf" : "file"}_lesson_${
//                 lesson.id
//               }_${Date.now()}`,
//             });

//             lesson.file_url = result.secure_url;
//             await lesson.save();
//             console.log(`✓ File migrated: ${result.secure_url}`);
//           } catch (error) {
//             console.error(
//               `✗ Failed to migrate file for lesson ${lesson.id}:`,
//               error.message
//             );
//           }
//         }
//       }
//     }

//     // Migrate course thumbnails
//     const courses = await Course.findAll({
//       where: {
//         thumbnail: { [db.Sequelize.Op.ne]: null },
//       },
//     });

//     console.log(`\nFound ${courses.length} courses with thumbnails to migrate`);

//     for (const course of courses) {
//       if (course.thumbnail && !course.thumbnail.includes("cloudinary")) {
//         console.log(
//           `Migrating thumbnail for course ${course.id}: ${course.thumbnail}`
//         );

//         const localPath = path.join(__dirname, "..", course.thumbnail);

//         if (fs.existsSync(localPath)) {
//           try {
//             const result = await cloudinary.v2.uploader.upload(localPath, {
//               resource_type: "image",
//               folder: "mathe-class/images",
//               public_id: `thumbnail_course_${course.id}_${Date.now()}`,
//             });

//             course.thumbnail = result.secure_url;
//             await course.save();
//             console.log(`✓ Thumbnail migrated: ${result.secure_url}`);
//           } catch (error) {
//             console.error(
//               `✗ Failed to migrate thumbnail for course ${course.id}:`,
//               error.message
//             );
//           }
//         }
//       }
//     }

//     console.log("\n✅ Migration completed!");
//   } catch (error) {
//     console.error("Migration failed:", error);
//   } finally {
//     await db.sequelize.close();
//     process.exit(0);
//   }
// };

// // Run migration
// migrateToCloudinary();




// scripts/migrateToCloudinary.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const cloudinary = require('cloudinary').v2;
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

console.log('🔧 Cloudinary Configuration:');
console.log('   Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('   API Key:', process.env.CLOUDINARY_API_KEY?.substring(0, 8) + '...');
console.log('   Environment:', process.env.NODE_ENV);

// Test Cloudinary connection
const testConnection = async () => {
  try {
    console.log('\n🔗 Testing Cloudinary connection...');
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful!');
    console.log('   Status:', result.status);
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    return false;
  }
};

// Upload a single file to Cloudinary
const uploadFileToCloudinary = async (filePath, options = {}) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`   ❌ File does not exist: ${filePath}`);
      return null;
    }

    console.log(`   📤 Uploading: ${path.basename(filePath)}`);
    
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto',
      ...options
    });

    console.log(`   ✅ Uploaded successfully!`);
    console.log(`      URL: ${result.secure_url.substring(0, 80)}...`);
    return result.secure_url;
  } catch (error) {
    console.error(`   ❌ Upload failed: ${error.message}`);
    return null;
  }
};

// Migrate all files
const migrateToCloudinary = async () => {
  console.log('\n🚀 Starting Cloudinary Migration');
  console.log('=================================');

  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    console.log('❌ Cannot proceed without Cloudinary connection');
    console.log('💡 Check your .env file for CLOUDINARY_* variables');
    process.exit(1);
  }

  try {
    const uploadsDir = path.join(__dirname, '..', 'Uploads');
    console.log(`\n📁 Uploads directory: ${uploadsDir}`);

    // Get all unique files from database
    const allFiles = new Set();

    // Get files from lessons
    const lessons = await Lesson.findAll({
      attributes: ['video_url', 'file_url']
    });

    lessons.forEach(lesson => {
      if (lesson.video_url && !lesson.video_url.includes('cloudinary')) {
        const filename = decodeURIComponent(lesson.video_url.split('/').pop());
        allFiles.add(filename);
      }
      if (lesson.file_url && !lesson.file_url.includes('cloudinary')) {
        const filename = decodeURIComponent(lesson.file_url.split('/').pop());
        allFiles.add(filename);
      }
    });

    // Get files from courses
    const courses = await Course.findAll({
      attributes: ['thumbnail']
    });

    courses.forEach(course => {
      if (course.thumbnail && !course.thumbnail.includes('cloudinary')) {
        const filename = decodeURIComponent(course.thumbnail.split('/').pop());
        allFiles.add(filename);
      }
    });

    console.log(`\n📊 Found ${allFiles.size} unique files to migrate`);
    console.log('Files:', Array.from(allFiles).slice(0, 10).join(', '), allFiles.size > 10 ? '...' : '');

    // Upload each file and create mapping
    const fileMapping = new Map();

    for (const filename of allFiles) {
      const filePath = path.join(uploadsDir, filename);
      
      if (!fs.existsSync(filePath)) {
        console.log(`\n❌ File not found: ${filename}`);
        continue;
      }

      // Determine folder and options based on file type
      let folder = 'mathe-class/files';
      let publicId = `file_${Date.now()}_${filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_')}`;

      if (filename.match(/\.(mp4|mov|avi|wmv|flv|mkv|webm)$/i)) {
        folder = 'mathe-class/videos';
        publicId = `video_${Date.now()}_${filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_')}`;
      } else if (filename.toLowerCase().endsWith('.pdf')) {
        folder = 'mathe-class/pdfs';
        publicId = `pdf_${Date.now()}_${filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_')}`;
      } else if (filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        folder = 'mathe-class/images';
        publicId = `img_${Date.now()}_${filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_')}`;
      }

      console.log(`\n📄 Processing: ${filename}`);
      console.log(`   Type: ${path.extname(filename)}, Folder: ${folder}`);

      const cloudinaryUrl = await uploadFileToCloudinary(filePath, {
        folder: folder,
        public_id: publicId,
        overwrite: false
      });

      if (cloudinaryUrl) {
        fileMapping.set(filename, cloudinaryUrl);
        
        // Update all references to this file in the database
        const localUrlPattern = `%${filename}%`;
        
        // Update lessons with this file_url
        await Lesson.update(
          { file_url: cloudinaryUrl },
          {
            where: {
              file_url: { [db.Sequelize.Op.like]: localUrlPattern },
              file_url: { [db.Sequelize.Op.notLike]: '%cloudinary%' }
            }
          }
        );

        // Update lessons with this video_url
        await Lesson.update(
          { video_url: cloudinaryUrl },
          {
            where: {
              video_url: { [db.Sequelize.Op.like]: localUrlPattern },
              video_url: { [db.Sequelize.Op.notLike]: '%cloudinary%' }
            }
          }
        );

        // Update courses with this thumbnail
        await Course.update(
          { thumbnail: cloudinaryUrl },
          {
            where: {
              thumbnail: { [db.Sequelize.Op.like]: localUrlPattern },
              thumbnail: { [db.Sequelize.Op.notLike]: '%cloudinary%' }
            }
          }
        );

        console.log(`   ✅ Updated database references for ${filename}`);
      }
    }

    console.log('\n🎉 Migration Summary');
    console.log('===================');
    console.log(`📊 Files processed: ${fileMapping.size}`);
    console.log(`📊 Files in mapping:`, fileMapping.size);

    // Show some example URLs
    if (fileMapping.size > 0) {
      console.log('\n📝 Example Cloudinary URLs:');
      const entries = Array.from(fileMapping.entries()).slice(0, 3);
      entries.forEach(([filename, url]) => {
        console.log(`   ${filename} → ${url.substring(0, 80)}...`);
      });
    }

    // Get final statistics
    const cloudinaryLessons = await Lesson.count({
      where: {
        [db.Sequelize.Op.or]: [
          { file_url: { [db.Sequelize.Op.like]: '%cloudinary%' } },
          { video_url: { [db.Sequelize.Op.like]: '%cloudinary%' } }
        ]
      }
    });

    const cloudinaryCourses = await Course.count({
      where: { thumbnail: { [db.Sequelize.Op.like]: '%cloudinary%' } }
    });

    console.log('\n📊 Final Database Stats:');
    console.log(`   Lessons with Cloudinary URLs: ${cloudinaryLessons}`);
    console.log(`   Courses with Cloudinary URLs: ${cloudinaryCourses}`);
    console.log('\n✅ Migration completed successfully!');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('Stack:', error.stack);
  } finally {
    await db.sequelize.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run migration
migrateToCloudinary();