// // scripts/migrateExistingFiles.js
// import { v2 as cloudinary } from "cloudinary";
// import db from "../models/index.js";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const { Lesson, Course } = db;

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
//   secure: true,
// });

// console.log("🚀 Starting migration of existing files to Cloudinary\n");

// const migrateFiles = async () => {
//   try {
//     const uploadsDir = path.join(__dirname, "..", "Uploads");

//     if (!fs.existsSync(uploadsDir)) {
//       console.log("❌ Uploads directory not found");
//       return;
//     }

//     console.log(`📁 Uploads directory: ${uploadsDir}`);

//     // 1. Migrate Lesson files
//     console.log("\n📚 Migrating lesson files...");
//     const lessons = await Lesson.findAll({
//       where: {
//         file_url: {
//           [db.Sequelize.Op.ne]: null,
//           [db.Sequelize.Op.notLike]: "%cloudinary.com%",
//         },
//       },
//     });

//     console.log(`Found ${lessons.length} lessons with local files`);

//     for (const lesson of lessons) {
//       const filename = path.basename(lesson.file_url);
//       const localPath = path.join(uploadsDir, filename);

//       if (fs.existsSync(localPath)) {
//         console.log(`\n📄 Processing: ${filename} (Lesson ${lesson.id})`);

//         try {
//           // Determine folder
//           let folder = "mathe-class/files";
//           if (filename.toLowerCase().endsWith(".pdf")) {
//             folder = "mathe-class/pdfs";
//           }

//           // Upload to Cloudinary
//           const result = await cloudinary.uploader.upload(localPath, {
//             folder: folder,
//             resource_type: folder.includes("pdfs") ? "raw" : "auto",
//             public_id: `lesson_${lesson.id}_${Date.now()}`,
//             overwrite: false,
//             access_mode: "public",
//           });

//           // Update database
//           await lesson.update({ file_url: result.secure_url });
//           console.log(
//             `✅ Uploaded to: ${result.secure_url.substring(0, 80)}...`
//           );
//         } catch (error) {
//           console.log(`❌ Failed to upload ${filename}:`, error.message);
//         }
//       } else {
//         console.log(`⚠️ File not found: ${localPath}`);
//       }
//     }

//     // 2. Migrate Course thumbnails
//     console.log("\n🖼️ Migrating course thumbnails...");
//     const courses = await Course.findAll({
//       where: {
//         thumbnail: {
//           [db.Sequelize.Op.ne]: null,
//           [db.Sequelize.Op.notLike]: "%cloudinary.com%",
//         },
//       },
//     });

//     console.log(`Found ${courses.length} courses with local thumbnails`);

//     for (const course of courses) {
//       const filename = path.basename(course.thumbnail);
//       const localPath = path.join(uploadsDir, filename);

//       if (fs.existsSync(localPath)) {
//         console.log(`\n🖼️ Processing: ${filename} (Course ${course.id})`);

//         try {
//           // Upload to Cloudinary
//           const result = await cloudinary.uploader.upload(localPath, {
//             folder: "mathe-class/images",
//             public_id: `course_${course.id}_thumbnail_${Date.now()}`,
//             overwrite: false,
//             access_mode: "public",
//           });

//           // Update database
//           await course.update({ thumbnail: result.secure_url });
//           console.log(
//             `✅ Uploaded to: ${result.secure_url.substring(0, 80)}...`
//           );
//         } catch (error) {
//           console.log(`❌ Failed to upload ${filename}:`, error.message);
//         }
//       } else {
//         console.log(`⚠️ File not found: ${localPath}`);
//       }
//     }

//     console.log("\n🎉 Migration completed!");
//   } catch (error) {
//     console.error("\n❌ Migration failed:", error);
//   } finally {
//     await db.sequelize.close();
//     process.exit(0);
//   }
// };

// // Run migration
// migrateFiles();





// scripts/migrateExistingFiles.js
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
  secure: true,
});

console.log('🚀 Starting migration of existing files to Cloudinary\n');

const migrateFiles = async () => {
  try {
    const uploadsDir = path.join(__dirname, '..', 'Uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      console.log('❌ Uploads directory not found');
      return;
    }
    
    console.log(`📁 Uploads directory: ${uploadsDir}`);
    
    // 1. Migrate Lesson files
    console.log('\n📚 Migrating lesson files...');
    const lessons = await Lesson.findAll({
      where: {
        file_url: {
          [db.Sequelize.Op.ne]: null,
          [db.Sequelize.Op.notLike]: '%cloudinary.com%'
        }
      }
    });
    
    console.log(`Found ${lessons.length} lessons with local files`);
    
    for (const lesson of lessons) {
      const filename = path.basename(lesson.file_url);
      const localPath = path.join(uploadsDir, filename);
      
      if (fs.existsSync(localPath)) {
        console.log(`\n📄 Processing: ${filename} (Lesson ${lesson.id})`);
        
        try {
          // Determine folder
          let folder = 'mathe-class/files';
          if (filename.toLowerCase().endsWith('.pdf')) {
            folder = 'mathe-class/pdfs';
          }
          
          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(localPath, {
            folder: folder,
            resource_type: folder.includes('pdfs') ? 'raw' : 'auto',
            public_id: `lesson_${lesson.id}_${Date.now()}`,
            overwrite: false,
            access_mode: 'public',
          });
          
          // Update database
          await lesson.update({ file_url: result.secure_url });
          console.log(`✅ Uploaded to: ${result.secure_url.substring(0, 80)}...`);
          
        } catch (error) {
          console.log(`❌ Failed to upload ${filename}:`, error.message);
        }
      } else {
        console.log(`⚠️ File not found: ${localPath}`);
      }
    }
    
    // 2. Migrate Course thumbnails
    console.log('\n🖼️ Migrating course thumbnails...');
    const courses = await Course.findAll({
      where: {
        thumbnail: {
          [db.Sequelize.Op.ne]: null,
          [db.Sequelize.Op.notLike]: '%cloudinary.com%'
        }
      }
    });
    
    console.log(`Found ${courses.length} courses with local thumbnails`);
    
    for (const course of courses) {
      const filename = path.basename(course.thumbnail);
      const localPath = path.join(uploadsDir, filename);
      
      if (fs.existsSync(localPath)) {
        console.log(`\n🖼️ Processing: ${filename} (Course ${course.id})`);
        
        try {
          // Upload to Cloudinary
          const result = await cloudinary.uploader.upload(localPath, {
            folder: 'mathe-class/images',
            public_id: `course_${course.id}_thumbnail_${Date.now()}`,
            overwrite: false,
            access_mode: 'public',
          });
          
          // Update database
          await course.update({ thumbnail: result.secure_url });
          console.log(`✅ Uploaded to: ${result.secure_url.substring(0, 80)}...`);
          
        } catch (error) {
          console.log(`❌ Failed to upload ${filename}:`, error.message);
        }
      } else {
        console.log(`⚠️ File not found: ${localPath}`);
      }
    }
    
    console.log('\n🎉 Migration completed!');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
  } finally {
    await db.sequelize.close();
    process.exit(0);
  }
};

// Run migration
migrateFiles();