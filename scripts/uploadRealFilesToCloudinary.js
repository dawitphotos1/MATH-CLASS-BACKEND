// // scripts/uploadRealFilesToCloudinary.js
// import { createRequire } from "module";
// const require = createRequire(import.meta.url);

// const cloudinary = require("cloudinary").v2;
// import db from "../models/index.js";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const { Lesson } = db;

// // Configure Cloudinary
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
//   secure: true,
// });

// console.log("📤 Uploading REAL files to Cloudinary...\n");

// // Create a real PDF file (not dummy)
// const createRealPdf = (lessonId, lessonTitle) => {
//   const timestamp = Date.now();

//   // A more complete PDF structure
//   return `%PDF-1.4
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
// /F2 5 0 R
// >>
// >>
// /Contents 6 0 R
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
// /Type /Font
// /Subtype /Type1
// /BaseFont /Helvetica-Bold
// >>
// endobj

// 6 0 obj
// <<
// /Length 500
// >>
// stream
// BT
// /F2 28 Tf
// 100 750 Td
// (Math Class Platform) Tj
// /F1 20 Tf
// 0 -40 Td
// (Lesson: ${lessonTitle}) Tj
// 0 -40 Td
// (Lesson ID: ${lessonId}) Tj
// 0 -40 Td
// (Date: ${new Date().toLocaleDateString()}) Tj
// 0 -40 Td
// (Time: ${new Date().toLocaleTimeString()}) Tj
// 0 -40 Td
// (This is a preview PDF for the Math Class Platform.) Tj
// 0 -40 Td
// (The full lesson content is available after enrollment.) Tj
// 0 -40 Td
// (For more information, visit our website.) Tj
// /F2 16 Tf
// 0 -60 Td
// (Thank you for your interest in our math courses!) Tj
// ET
// endstream
// endobj

// xref
// 0 7
// 0000000000 65535 f
// 0000000010 00000 n
// 0000000089 00000 n
// 0000000142 00000 n
// 0000000249 00000 n
// 0000000315 00000 n
// 0000000385 00000 n
// trailer
// <<
// /Size 7
// /Root 1 0 R
// >>
// startxref
// 600
// %%EOF`;
// };

// const uploadRealFiles = async () => {
//   try {
//     // Get lessons that need real PDFs
//     const lessons = await Lesson.findAll({
//       where: { file_url: { [db.Sequelize.Op.ne]: null } },
//       attributes: ["id", "title", "file_url"],
//       order: [["id", "ASC"]],
//     });

//     console.log(`📚 Found ${lessons.length} lessons needing real PDFs\n`);

//     const uploadsDir = path.join(__dirname, "..", "Uploads");
//     if (!fs.existsSync(uploadsDir)) {
//       fs.mkdirSync(uploadsDir, { recursive: true });
//     }

//     let successCount = 0;
//     let errorCount = 0;

//     for (const lesson of lessons) {
//       console.log(`\n📝 Lesson ${lesson.id}: ${lesson.title}`);

//       // Create a unique filename
//       const timestamp = Date.now();
//       const safeTitle = lesson.title
//         .replace(/[^a-zA-Z0-9-_]/g, "_")
//         .substring(0, 30);
//       const filename = `lesson_${lesson.id}_${safeTitle}.pdf`;
//       const tempPdfPath = path.join(uploadsDir, filename);

//       // Create the real PDF
//       const pdfContent = createRealPdf(lesson.id, lesson.title);
//       fs.writeFileSync(tempPdfPath, pdfContent);

//       console.log(
//         `   📄 Created PDF: ${filename} (${pdfContent.length} bytes)`
//       );

//       try {
//         // Upload to Cloudinary with explicit raw type
//         console.log(`   📤 Uploading to Cloudinary...`);

//         const result = await cloudinary.uploader.upload(tempPdfPath, {
//           resource_type: "raw", // ✅ CRITICAL: Use 'raw' for PDFs
//           folder: "mathe-class/pdfs",
//           public_id: `lesson_${lesson.id}_${timestamp}`,
//           overwrite: true,
//           type: "upload",
//           access_mode: "public", // ✅ Make it publicly accessible
//         });

//         // Update the lesson with the new URL
//         const newUrl = result.secure_url;
//         await lesson.update({ file_url: newUrl });

//         console.log(`   ✅ Uploaded: ${newUrl.substring(0, 80)}...`);
//         console.log(`   🔗 Public ID: ${result.public_id}`);
//         console.log(`   📊 Size: ${result.bytes} bytes`);

//         successCount++;

//         // Clean up
//         fs.unlinkSync(tempPdfPath);

//         // Test the URL
//         console.log(`   🔍 Testing URL accessibility...`);
//         try {
//           const testResponse = await fetch(newUrl, { method: "HEAD" });
//           console.log(`   🌐 Test Status: ${testResponse.status}`);
//           if (testResponse.status === 200) {
//             console.log(`   ✅ URL is accessible!`);
//           } else {
//             console.log(`   ⚠️ URL returned ${testResponse.status}`);
//           }
//         } catch (testError) {
//           console.log(`   ❌ Test failed: ${testError.message}`);
//         }
//       } catch (uploadError) {
//         console.log(`   ❌ Upload failed: ${uploadError.message}`);
//         errorCount++;
//       }
//     }

//     // Summary
//     console.log("\n🎉 UPLOAD SUMMARY");
//     console.log("================");
//     console.log(`✅ Successful: ${successCount} files`);
//     console.log(`❌ Failed: ${errorCount} files`);

//     if (successCount > 0) {
//       console.log("\n📊 Verification:");

//       // Test a few URLs
//       const sampleLessons = await Lesson.findAll({
//         where: { id: lessons.slice(0, 3).map((l) => l.id) },
//         attributes: ["id", "title", "file_url"],
//       });

//       console.log("\n🔗 Sample URLs:");
//       sampleLessons.forEach((lesson) => {
//         const url = lesson.file_url;
//         const isRaw = url.includes("/raw/upload/");
//         const isPublic = !url.includes("/authenticated/");

//         console.log(`   Lesson ${lesson.id}:`);
//         console.log(`      URL: ${url.substring(0, 60)}...`);
//         console.log(`      Type: ${isRaw ? "✅ raw/upload" : "❌ wrong type"}`);
//         console.log(`      Access: ${isPublic ? "✅ public" : "❌ private"}`);
//       });

//       console.log("\n💡 IMPORTANT:");
//       console.log("   - PDFs must use /raw/upload/ not /image/upload/");
//       console.log('   - Files must be set to "public" access mode');
//       console.log("   - Test URLs in browser to confirm they work");
//     }
//   } catch (error) {
//     console.error("\n❌ Script failed:", error.message);
//     console.error("Stack:", error.stack);
//   } finally {
//     await db.sequelize.close();
//     console.log("\n🔌 Database connection closed");
//     process.exit(0);
//   }
// };

// // Run the upload
// uploadRealFiles();





// scripts/uploadRealFilesToCloudinary.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const cloudinary = require('cloudinary').v2;
import db from '../models/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Lesson } = db;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

console.log('📤 Uploading REAL files to Cloudinary...\n');

// Create a real PDF file (not dummy)
const createRealPdf = (lessonId, lessonTitle) => {
  const timestamp = Date.now();
  
  // A more complete PDF structure
  return `%PDF-1.4
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
/F2 5 0 R
>>
>>
/Contents 6 0 R
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
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica-Bold
>>
endobj

6 0 obj
<<
/Length 500
>>
stream
BT
/F2 28 Tf
100 750 Td
(Math Class Platform) Tj
/F1 20 Tf
0 -40 Td
(Lesson: ${lessonTitle}) Tj
0 -40 Td
(Lesson ID: ${lessonId}) Tj
0 -40 Td
(Date: ${new Date().toLocaleDateString()}) Tj
0 -40 Td
(Time: ${new Date().toLocaleTimeString()}) Tj
0 -40 Td
(This is a preview PDF for the Math Class Platform.) Tj
0 -40 Td
(The full lesson content is available after enrollment.) Tj
0 -40 Td
(For more information, visit our website.) Tj
/F2 16 Tf
0 -60 Td
(Thank you for your interest in our math courses!) Tj
ET
endstream
endobj

xref
0 7
0000000000 65535 f
0000000010 00000 n
0000000089 00000 n
0000000142 00000 n
0000000249 00000 n
0000000315 00000 n
0000000385 00000 n
trailer
<<
/Size 7
/Root 1 0 R
>>
startxref
600
%%EOF`;
};

const uploadRealFiles = async () => {
  try {
    // Get lessons that need real PDFs
    const lessons = await Lesson.findAll({
      where: { file_url: { [db.Sequelize.Op.ne]: null } },
      attributes: ['id', 'title', 'file_url'],
      order: [['id', 'ASC']]
    });

    console.log(`📚 Found ${lessons.length} lessons needing real PDFs\n`);

    const uploadsDir = path.join(__dirname, '..', 'Uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    let successCount = 0;
    let errorCount = 0;

    for (const lesson of lessons) {
      console.log(`\n📝 Lesson ${lesson.id}: ${lesson.title}`);
      
      // Create a unique filename
      const timestamp = Date.now();
      const safeTitle = lesson.title.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 30);
      const filename = `lesson_${lesson.id}_${safeTitle}.pdf`;
      const tempPdfPath = path.join(uploadsDir, filename);

      // Create the real PDF
      const pdfContent = createRealPdf(lesson.id, lesson.title);
      fs.writeFileSync(tempPdfPath, pdfContent);

      console.log(`   📄 Created PDF: ${filename} (${pdfContent.length} bytes)`);

      try {
        // Upload to Cloudinary with explicit raw type
        console.log(`   📤 Uploading to Cloudinary...`);
        
        const result = await cloudinary.uploader.upload(tempPdfPath, {
          resource_type: 'raw',  // ✅ CRITICAL: Use 'raw' for PDFs
          folder: 'mathe-class/pdfs',
          public_id: `lesson_${lesson.id}_${timestamp}`,
          overwrite: true,
          type: 'upload',
          access_mode: 'public'  // ✅ Make it publicly accessible
        });

        // Update the lesson with the new URL
        const newUrl = result.secure_url;
        await lesson.update({ file_url: newUrl });
        
        console.log(`   ✅ Uploaded: ${newUrl.substring(0, 80)}...`);
        console.log(`   🔗 Public ID: ${result.public_id}`);
        console.log(`   📊 Size: ${result.bytes} bytes`);
        
        successCount++;

        // Clean up
        fs.unlinkSync(tempPdfPath);
        
        // Test the URL
        console.log(`   🔍 Testing URL accessibility...`);
        try {
          const testResponse = await fetch(newUrl, { method: 'HEAD' });
          console.log(`   🌐 Test Status: ${testResponse.status}`);
          if (testResponse.status === 200) {
            console.log(`   ✅ URL is accessible!`);
          } else {
            console.log(`   ⚠️ URL returned ${testResponse.status}`);
          }
        } catch (testError) {
          console.log(`   ❌ Test failed: ${testError.message}`);
        }
        
      } catch (uploadError) {
        console.log(`   ❌ Upload failed: ${uploadError.message}`);
        errorCount++;
      }
    }

    // Summary
    console.log('\n🎉 UPLOAD SUMMARY');
    console.log('================');
    console.log(`✅ Successful: ${successCount} files`);
    console.log(`❌ Failed: ${errorCount} files`);
    
    if (successCount > 0) {
      console.log('\n📊 Verification:');
      
      // Test a few URLs
      const sampleLessons = await Lesson.findAll({
        where: { id: lessons.slice(0, 3).map(l => l.id) },
        attributes: ['id', 'title', 'file_url']
      });
      
      console.log('\n🔗 Sample URLs:');
      sampleLessons.forEach(lesson => {
        const url = lesson.file_url;
        const isRaw = url.includes('/raw/upload/');
        const isPublic = !url.includes('/authenticated/');
        
        console.log(`   Lesson ${lesson.id}:`);
        console.log(`      URL: ${url.substring(0, 60)}...`);
        console.log(`      Type: ${isRaw ? '✅ raw/upload' : '❌ wrong type'}`);
        console.log(`      Access: ${isPublic ? '✅ public' : '❌ private'}`);
      });
      
      console.log('\n💡 IMPORTANT:');
      console.log('   - PDFs must use /raw/upload/ not /image/upload/');
      console.log('   - Files must be set to "public" access mode');
      console.log('   - Test URLs in browser to confirm they work');
    }

  } catch (error) {
    console.error('\n❌ Script failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await db.sequelize.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the upload
uploadRealFiles();