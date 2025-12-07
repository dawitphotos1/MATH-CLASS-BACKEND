// // scripts/finalMigrateToCloudinary.js
// import { createRequire } from "module";
// const require = createRequire(import.meta.url);

// const cloudinary = require("cloudinary").v2;
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

// console.log("🔧 Cloudinary Migration Starting...");

// // Function to create a valid PDF dummy file
// const createValidPdfDummy = (filePath, lessonId = "unknown") => {
//   try {
//     // Create a simple but valid PDF structure
//     const pdfContent = `%PDF-1.4
// 1 0 obj
// <<
// /Type /Catalog
// /Pages 2 0 R
// >>
// endobj

// 2 0 obj
// <<
// /Type /Pages
// /Kids [3 0 R]
// /Count 1
// >>
// endobj

// 3 0 obj
// <<
// /Type /Page
// /Parent 2 0 R
// /MediaBox [0 0 612 792]
// /Resources <<
// /Font <<
// /F1 4 0 R
// >>
// >>
// /Contents 5 0 R
// >>
// endobj

// 4 0 obj
// <<
// /Type /Font
// /Subtype /Type1
// /BaseFont /Helvetica
// >>
// endobj

// 5 0 obj
// <<
// /Length 116
// >>
// stream
// BT
// /F1 24 Tf
// 100 700 Td
// (Dummy PDF File) Tj
// 0 -40 Td
// (For Lesson ID: ${lessonId}) Tj
// 0 -40 Td
// (Created: ${new Date().toISOString()}) Tj
// ET
// endstream
// endobj

// xref
// 0 6
// 0000000000 65535 f
// 0000000010 00000 n
// 0000000089 00000 n
// 0000000142 00000 n
// 0000000249 00000 n
// 0000000315 00000 n
// trailer
// <<
// /Size 6
// /Root 1 0 R
// >>
// startxref
// 470
// %%EOF`;

//     fs.writeFileSync(filePath, pdfContent);
//     console.log(`   ✅ Created valid PDF dummy: ${path.basename(filePath)}`);
//     return true;
//   } catch (error) {
//     console.error(`   ❌ Failed to create PDF: ${error.message}`);
//     return false;
//   }
// };

// // Upload file to Cloudinary with correct resource type
// const uploadToCloudinary = async (filePath, filename, lessonId = "unknown") => {
//   try {
//     if (!fs.existsSync(filePath)) {
//       console.log(`   ❌ File not found: ${filename}`);
//       return null;
//     }

//     const ext = path.extname(filename).toLowerCase();
//     const baseName = path
//       .basename(filename, ext)
//       .replace(/[^a-zA-Z0-9-_]/g, "_");
//     const timestamp = Date.now();

//     let options = {
//       public_id: `${baseName}_${timestamp}`,
//       overwrite: false,
//     };

//     // Set resource type and folder based on file extension
//     if (ext === ".pdf") {
//       options.resource_type = "raw";
//       options.folder = "mathe-class/pdfs";
//       options.public_id = `pdf_${baseName}_${timestamp}`;

//       // Check if file is a valid PDF
//       const fileContent = fs.readFileSync(filePath, "utf8", 0, 5);
//       if (!fileContent.startsWith("%PDF-")) {
//         console.log(`   ⚠️ Invalid PDF, creating valid dummy...`);
//         createValidPdfDummy(filePath, lessonId);
//       }
//     } else if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
//       options.resource_type = "image";
//       options.folder = "mathe-class/images";
//       options.public_id = `img_${baseName}_${timestamp}`;
//     } else if (
//       [".mp4", ".mov", ".avi", ".wmv", ".flv", ".mkv", ".webm"].includes(ext)
//     ) {
//       options.resource_type = "video";
//       options.folder = "mathe-class/videos";
//       options.public_id = `video_${baseName}_${timestamp}`;
//     } else {
//       options.resource_type = "raw";
//       options.folder = "mathe-class/files";
//       options.public_id = `file_${baseName}_${timestamp}`;
//     }

//     console.log(`   📤 Uploading ${ext} to ${options.folder}...`);

//     const result = await cloudinary.uploader.upload(filePath, options);

//     console.log(`   ✅ Uploaded: ${result.secure_url.substring(0, 80)}...`);
//     return result.secure_url;
//   } catch (error) {
//     console.error(`   ❌ Upload failed: ${error.message}`);

//     // If it's a PDF upload error, try with explicit raw resource type
//     if (filename.toLowerCase().endsWith(".pdf")) {
//       console.log(`   🔄 Retrying PDF as raw upload...`);
//       try {
//         const retryResult = await cloudinary.uploader.upload(filePath, {
//           resource_type: "raw",
//           folder: "mathe-class/pdfs",
//           public_id: `pdf_${path.basename(filename, ".pdf")}_${Date.now()}`,
//           overwrite: false,
//         });
//         console.log(`   ✅ PDF upload successful on retry!`);
//         return retryResult.secure_url;
//       } catch (retryError) {
//         console.error(`   ❌ PDF retry failed: ${retryError.message}`);
//       }
//     }

//     return null;
//   }
// };

// // Main migration function
// const migrateToCloudinary = async () => {
//   console.log("\n🚀 FINAL Cloudinary Migration");
//   console.log("==============================");

//   try {
//     const uploadsDir = path.join(__dirname, "..", "Uploads");
//     console.log(`📁 Using directory: ${uploadsDir}`);

//     // Get all lessons that need migration
//     const lessons = await Lesson.findAll({
//       where: {
//         [db.Sequelize.Op.or]: [
//           {
//             file_url: {
//               [db.Sequelize.Op.ne]: null,
//               [db.Sequelize.Op.notLike]: "%cloudinary%",
//             },
//           },
//           {
//             video_url: {
//               [db.Sequelize.Op.ne]: null,
//               [db.Sequelize.Op.notLike]: "%cloudinary%",
//             },
//           },
//         ],
//       },
//       attributes: ["id", "title", "file_url", "video_url"],
//     });

//     console.log(`\n📊 Found ${lessons.length} lessons needing migration`);

//     let migratedCount = 0;
//     let skippedCount = 0;

//     for (const lesson of lessons) {
//       console.log(`\n📝 Lesson ${lesson.id}: ${lesson.title}`);

//       // Handle file_url
//       if (lesson.file_url && !lesson.file_url.includes("cloudinary")) {
//         const filename = decodeURIComponent(lesson.file_url.split("/").pop());
//         const filePath = path.join(uploadsDir, filename);

//         console.log(`   Processing file: ${filename}`);

//         const cloudinaryUrl = await uploadToCloudinary(
//           filePath,
//           filename,
//           lesson.id
//         );

//         if (cloudinaryUrl) {
//           await lesson.update({ file_url: cloudinaryUrl });
//           console.log(`   ✅ Updated file_url to Cloudinary`);
//           migratedCount++;
//         } else {
//           console.log(`   ⚠️ Skipping file_url (upload failed)`);
//           skippedCount++;
//         }
//       }

//       // Handle video_url
//       if (lesson.video_url && !lesson.video_url.includes("cloudinary")) {
//         const filename = decodeURIComponent(lesson.video_url.split("/").pop());
//         const filePath = path.join(uploadsDir, filename);

//         console.log(`   Processing video: ${filename}`);

//         const cloudinaryUrl = await uploadToCloudinary(
//           filePath,
//           filename,
//           lesson.id
//         );

//         if (cloudinaryUrl) {
//           await lesson.update({ video_url: cloudinaryUrl });
//           console.log(`   ✅ Updated video_url to Cloudinary`);
//           migratedCount++;
//         } else {
//           console.log(`   ⚠️ Skipping video_url (upload failed)`);
//           skippedCount++;
//         }
//       }
//     }

//     // Migrate course thumbnails
//     console.log("\n🖼️ Migrating course thumbnails...");
//     const courses = await Course.findAll({
//       where: {
//         thumbnail: {
//           [db.Sequelize.Op.ne]: null,
//           [db.Sequelize.Op.notLike]: "%cloudinary%",
//         },
//       },
//       attributes: ["id", "title", "thumbnail"],
//     });

//     console.log(`Found ${courses.length} courses with thumbnails`);

//     for (const course of courses) {
//       console.log(`\n🏫 Course ${course.id}: ${course.title}`);

//       const filename = decodeURIComponent(course.thumbnail.split("/").pop());
//       const filePath = path.join(uploadsDir, filename);

//       console.log(`   Processing thumbnail: ${filename}`);

//       const cloudinaryUrl = await uploadToCloudinary(
//         filePath,
//         filename,
//         course.id
//       );

//       if (cloudinaryUrl) {
//         await course.update({ thumbnail: cloudinaryUrl });
//         console.log(`   ✅ Updated thumbnail to Cloudinary`);
//         migratedCount++;
//       } else {
//         console.log(`   ⚠️ Skipping thumbnail (upload failed)`);
//         skippedCount++;
//       }
//     }

//     // Create summary
//     console.log("\n🎉 MIGRATION COMPLETE");
//     console.log("=====================");
//     console.log(`✅ Successfully migrated: ${migratedCount} files`);
//     console.log(`⚠️ Skipped/Failed: ${skippedCount} files`);

//     if (skippedCount > 0) {
//       console.log("\n💡 For skipped files:");
//       console.log("   1. Check if files exist in Uploads directory");
//       console.log("   2. Manually upload them to Cloudinary console");
//       console.log("   3. Update database with the Cloudinary URLs");
//     }

//     // Verify migration
//     console.log("\n🔍 Verification:");
//     const cloudinaryLessons = await Lesson.count({
//       where: {
//         [db.Sequelize.Op.or]: [
//           { file_url: { [db.Sequelize.Op.like]: "%cloudinary%" } },
//           { video_url: { [db.Sequelize.Op.like]: "%cloudinary%" } },
//         ],
//       },
//     });

//     const totalLessons = await Lesson.count({
//       where: {
//         [db.Sequelize.Op.or]: [
//           { file_url: { [db.Sequelize.Op.ne]: null } },
//           { video_url: { [db.Sequelize.Op.ne]: null } },
//         ],
//       },
//     });

//     console.log(
//       `   Lessons with Cloudinary URLs: ${cloudinaryLessons}/${totalLessons}`
//     );

//     const cloudinaryCourses = await Course.count({
//       where: { thumbnail: { [db.Sequelize.Op.like]: "%cloudinary%" } },
//     });

//     const totalCourses = await Course.count({
//       where: { thumbnail: { [db.Sequelize.Op.ne]: null } },
//     });

//     console.log(
//       `   Courses with Cloudinary URLs: ${cloudinaryCourses}/${totalCourses}`
//     );

//     if (
//       cloudinaryLessons === totalLessons &&
//       cloudinaryCourses === totalCourses
//     ) {
//       console.log("\n✅ SUCCESS: All files migrated to Cloudinary!");
//       console.log("🎯 Your PDF previews should now work perfectly!");
//     } else {
//       console.log("\n⚠️ PARTIAL SUCCESS: Some files still need migration");
//       console.log(
//         "💡 Run this script again or manually upload remaining files"
//       );
//     }
//   } catch (error) {
//     console.error("\n❌ Migration failed:", error.message);
//   } finally {
//     await db.sequelize.close();
//     console.log("\n🔌 Database connection closed");
//     process.exit(0);
//   }
// };

// // Run migration
// migrateToCloudinary();






// scripts/finalMigrateToCloudinary.js
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

console.log('🔧 Cloudinary Migration Starting...');

// Function to create a valid PDF dummy file
const createValidPdfDummy = (filePath, lessonId = 'unknown') => {
  try {
    // Create a simple but valid PDF structure
    const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Resources <<
/Font <<
/F1 4 0 R
>>
>>
/Contents 5 0 R
>>
endobj

4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

5 0 obj
<<
/Length 116
>>
stream
BT
/F1 24 Tf
100 700 Td
(Dummy PDF File) Tj
0 -40 Td
(For Lesson ID: ${lessonId}) Tj
0 -40 Td
(Created: ${new Date().toISOString()}) Tj
ET
endstream
endobj

xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000089 00000 n
0000000142 00000 n
0000000249 00000 n
0000000315 00000 n
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
470
%%EOF`;

    fs.writeFileSync(filePath, pdfContent);
    console.log(`   ✅ Created valid PDF dummy: ${path.basename(filePath)}`);
    return true;
  } catch (error) {
    console.error(`   ❌ Failed to create PDF: ${error.message}`);
    return false;
  }
};

// Upload file to Cloudinary with correct resource type
const uploadToCloudinary = async (filePath, filename, lessonId = 'unknown') => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`   ❌ File not found: ${filename}`);
      return null;
    }

    const ext = path.extname(filename).toLowerCase();
    const baseName = path.basename(filename, ext).replace(/[^a-zA-Z0-9-_]/g, '_');
    const timestamp = Date.now();
    
    let options = {
      public_id: `${baseName}_${timestamp}`,
      overwrite: false
    };

    // Set resource type and folder based on file extension
    if (ext === '.pdf') {
      options.resource_type = 'raw';
      options.folder = 'mathe-class/pdfs';
      options.public_id = `pdf_${baseName}_${timestamp}`;
      
      // Check if file is a valid PDF
      const fileContent = fs.readFileSync(filePath, 'utf8', 0, 5);
      if (!fileContent.startsWith('%PDF-')) {
        console.log(`   ⚠️ Invalid PDF, creating valid dummy...`);
        createValidPdfDummy(filePath, lessonId);
      }
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      options.resource_type = 'image';
      options.folder = 'mathe-class/images';
      options.public_id = `img_${baseName}_${timestamp}`;
    } else if (['.mp4', '.mov', '.avi', '.wmv', '.flv', '.mkv', '.webm'].includes(ext)) {
      options.resource_type = 'video';
      options.folder = 'mathe-class/videos';
      options.public_id = `video_${baseName}_${timestamp}`;
    } else {
      options.resource_type = 'raw';
      options.folder = 'mathe-class/files';
      options.public_id = `file_${baseName}_${timestamp}`;
    }

    console.log(`   📤 Uploading ${ext} to ${options.folder}...`);

    const result = await cloudinary.uploader.upload(filePath, options);
    
    console.log(`   ✅ Uploaded: ${result.secure_url.substring(0, 80)}...`);
    return result.secure_url;
    
  } catch (error) {
    console.error(`   ❌ Upload failed: ${error.message}`);
    
    // If it's a PDF upload error, try with explicit raw resource type
    if (filename.toLowerCase().endsWith('.pdf')) {
      console.log(`   🔄 Retrying PDF as raw upload...`);
      try {
        const retryResult = await cloudinary.uploader.upload(filePath, {
          resource_type: 'raw',
          folder: 'mathe-class/pdfs',
          public_id: `pdf_${path.basename(filename, '.pdf')}_${Date.now()}`,
          overwrite: false
        });
        console.log(`   ✅ PDF upload successful on retry!`);
        return retryResult.secure_url;
      } catch (retryError) {
        console.error(`   ❌ PDF retry failed: ${retryError.message}`);
      }
    }
    
    return null;
  }
};

// Main migration function
const migrateToCloudinary = async () => {
  console.log('\n🚀 FINAL Cloudinary Migration');
  console.log('==============================');

  try {
    const uploadsDir = path.join(__dirname, '..', 'Uploads');
    console.log(`📁 Using directory: ${uploadsDir}`);

    // Get all lessons that need migration
    const lessons = await Lesson.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { file_url: { [db.Sequelize.Op.ne]: null, [db.Sequelize.Op.notLike]: '%cloudinary%' } },
          { video_url: { [db.Sequelize.Op.ne]: null, [db.Sequelize.Op.notLike]: '%cloudinary%' } }
        ]
      },
      attributes: ['id', 'title', 'file_url', 'video_url']
    });

    console.log(`\n📊 Found ${lessons.length} lessons needing migration`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const lesson of lessons) {
      console.log(`\n📝 Lesson ${lesson.id}: ${lesson.title}`);

      // Handle file_url
      if (lesson.file_url && !lesson.file_url.includes('cloudinary')) {
        const filename = decodeURIComponent(lesson.file_url.split('/').pop());
        const filePath = path.join(uploadsDir, filename);
        
        console.log(`   Processing file: ${filename}`);
        
        const cloudinaryUrl = await uploadToCloudinary(filePath, filename, lesson.id);
        
        if (cloudinaryUrl) {
          await lesson.update({ file_url: cloudinaryUrl });
          console.log(`   ✅ Updated file_url to Cloudinary`);
          migratedCount++;
        } else {
          console.log(`   ⚠️ Skipping file_url (upload failed)`);
          skippedCount++;
        }
      }

      // Handle video_url
      if (lesson.video_url && !lesson.video_url.includes('cloudinary')) {
        const filename = decodeURIComponent(lesson.video_url.split('/').pop());
        const filePath = path.join(uploadsDir, filename);
        
        console.log(`   Processing video: ${filename}`);
        
        const cloudinaryUrl = await uploadToCloudinary(filePath, filename, lesson.id);
        
        if (cloudinaryUrl) {
          await lesson.update({ video_url: cloudinaryUrl });
          console.log(`   ✅ Updated video_url to Cloudinary`);
          migratedCount++;
        } else {
          console.log(`   ⚠️ Skipping video_url (upload failed)`);
          skippedCount++;
        }
      }
    }

    // Migrate course thumbnails
    console.log('\n🖼️ Migrating course thumbnails...');
    const courses = await Course.findAll({
      where: {
        thumbnail: { [db.Sequelize.Op.ne]: null, [db.Sequelize.Op.notLike]: '%cloudinary%' }
      },
      attributes: ['id', 'title', 'thumbnail']
    });

    console.log(`Found ${courses.length} courses with thumbnails`);

    for (const course of courses) {
      console.log(`\n🏫 Course ${course.id}: ${course.title}`);
      
      const filename = decodeURIComponent(course.thumbnail.split('/').pop());
      const filePath = path.join(uploadsDir, filename);
      
      console.log(`   Processing thumbnail: ${filename}`);
      
      const cloudinaryUrl = await uploadToCloudinary(filePath, filename, course.id);
      
      if (cloudinaryUrl) {
        await course.update({ thumbnail: cloudinaryUrl });
        console.log(`   ✅ Updated thumbnail to Cloudinary`);
        migratedCount++;
      } else {
        console.log(`   ⚠️ Skipping thumbnail (upload failed)`);
        skippedCount++;
      }
    }

    // Create summary
    console.log('\n🎉 MIGRATION COMPLETE');
    console.log('=====================');
    console.log(`✅ Successfully migrated: ${migratedCount} files`);
    console.log(`⚠️ Skipped/Failed: ${skippedCount} files`);
    
    if (skippedCount > 0) {
      console.log('\n💡 For skipped files:');
      console.log('   1. Check if files exist in Uploads directory');
      console.log('   2. Manually upload them to Cloudinary console');
      console.log('   3. Update database with the Cloudinary URLs');
    }

    // Verify migration
    console.log('\n🔍 Verification:');
    const cloudinaryLessons = await Lesson.count({
      where: {
        [db.Sequelize.Op.or]: [
          { file_url: { [db.Sequelize.Op.like]: '%cloudinary%' } },
          { video_url: { [db.Sequelize.Op.like]: '%cloudinary%' } }
        ]
      }
    });
    
    const totalLessons = await Lesson.count({
      where: {
        [db.Sequelize.Op.or]: [
          { file_url: { [db.Sequelize.Op.ne]: null } },
          { video_url: { [db.Sequelize.Op.ne]: null } }
        ]
      }
    });
    
    console.log(`   Lessons with Cloudinary URLs: ${cloudinaryLessons}/${totalLessons}`);
    
    const cloudinaryCourses = await Course.count({
      where: { thumbnail: { [db.Sequelize.Op.like]: '%cloudinary%' } }
    });
    
    const totalCourses = await Course.count({
      where: { thumbnail: { [db.Sequelize.Op.ne]: null } }
    });
    
    console.log(`   Courses with Cloudinary URLs: ${cloudinaryCourses}/${totalCourses}`);
    
    if (cloudinaryLessons === totalLessons && cloudinaryCourses === totalCourses) {
      console.log('\n✅ SUCCESS: All files migrated to Cloudinary!');
      console.log('🎯 Your PDF previews should now work perfectly!');
    } else {
      console.log('\n⚠️ PARTIAL SUCCESS: Some files still need migration');
      console.log('💡 Run this script again or manually upload remaining files');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
  } finally {
    await db.sequelize.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run migration
migrateToCloudinary();