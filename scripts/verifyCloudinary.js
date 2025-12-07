// // scripts/verifyCloudinary.js
// import db from "../models/index.js";
// import fetch from "node-fetch";

// const { Lesson } = db;

// const verifyCloudinary = async () => {
//   console.log("✅ Cloudinary Integration Verification\n");
//   console.log("=".repeat(50));

//   // Test 1: Check database
//   console.log("\n📊 TEST 1: Database Check");
//   const lessons = await Lesson.findAll({
//     where: { file_url: { [db.Sequelize.Op.ne]: null } },
//     attributes: ["id", "title", "file_url"],
//     limit: 3,
//   });

//   lessons.forEach((lesson) => {
//     const isCloudinary = lesson.file_url.includes("cloudinary");
//     console.log(
//       `   Lesson ${lesson.id}: ${
//         isCloudinary ? "✅ Cloudinary" : "❌ Not Cloudinary"
//       }`
//     );
//   });

//   // Test 2: Test preview endpoint
//   console.log("\n🌐 TEST 2: Preview Endpoint");
//   const testLessonId = lessons[0]?.id || 5202;
//   const previewUrl = `https://mathe-class-website-backend-1.onrender.com/api/v1/files/preview-lesson/${testLessonId}`;

//   try {
//     const response = await fetch(previewUrl);
//     const data = await response.json();

//     if (data.success && data.lesson?.file_url) {
//       console.log(`   ✅ Preview works for lesson ${testLessonId}`);
//       console.log(
//         `   📄 File URL: ${data.lesson.file_url.substring(0, 80)}...`
//       );

//       // Test 3: Test Cloudinary URL directly
//       console.log("\n🔗 TEST 3: Cloudinary Direct Access");
//       const cloudinaryResponse = await fetch(data.lesson.file_url, {
//         method: "HEAD",
//       });
//       console.log(`   Status: ${cloudinaryResponse.status}`);
//       console.log(
//         `   Content-Type: ${cloudinaryResponse.headers.get("content-type")}`
//       );

//       if (cloudinaryResponse.status === 200) {
//         console.log("   ✅ Cloudinary file is accessible!");
//       } else {
//         console.log("   ❌ Cloudinary file not accessible");
//       }
//     } else {
//       console.log(`   ❌ Preview failed: ${data.error}`);
//     }
//   } catch (error) {
//     console.log(`   ❌ Network error: ${error.message}`);
//   }

//   // Summary
//   console.log("\n📈 SUMMARY:");
//   console.log("=".repeat(50));
//   console.log("If all tests pass:");
//   console.log("   ✅ Your PDFs are stored in Cloudinary");
//   console.log("   ✅ Preview endpoint works");
//   console.log("   ✅ Cloudinary URLs are accessible");
//   console.log('\nIf you still see "File not found":');
//   console.log("   1. The Cloudinary URL might be wrong");
//   console.log("   2. The PDF might not be uploaded to Cloudinary");
//   console.log("   3. The URL might point to /image/ instead of /raw/");

//   await db.sequelize.close();
//   process.exit(0);
// };

// verifyCloudinary();





// scripts/verifyCloudinary.js
import db from '../models/index.js';
import fetch from 'node-fetch';

const { Lesson } = db;

const verifyCloudinary = async () => {
  console.log('✅ Cloudinary Integration Verification\n');
  console.log('=' .repeat(50));
  
  // Test 1: Check database
  console.log('\n📊 TEST 1: Database Check');
  const lessons = await Lesson.findAll({
    where: { file_url: { [db.Sequelize.Op.ne]: null } },
    attributes: ['id', 'title', 'file_url'],
    limit: 3
  });
  
  lessons.forEach(lesson => {
    const isCloudinary = lesson.file_url.includes('cloudinary');
    console.log(`   Lesson ${lesson.id}: ${isCloudinary ? '✅ Cloudinary' : '❌ Not Cloudinary'}`);
  });
  
  // Test 2: Test preview endpoint
  console.log('\n🌐 TEST 2: Preview Endpoint');
  const testLessonId = lessons[0]?.id || 5202;
  const previewUrl = `https://mathe-class-website-backend-1.onrender.com/api/v1/files/preview-lesson/${testLessonId}`;
  
  try {
    const response = await fetch(previewUrl);
    const data = await response.json();
    
    if (data.success && data.lesson?.file_url) {
      console.log(`   ✅ Preview works for lesson ${testLessonId}`);
      console.log(`   📄 File URL: ${data.lesson.file_url.substring(0, 80)}...`);
      
      // Test 3: Test Cloudinary URL directly
      console.log('\n🔗 TEST 3: Cloudinary Direct Access');
      const cloudinaryResponse = await fetch(data.lesson.file_url, { method: 'HEAD' });
      console.log(`   Status: ${cloudinaryResponse.status}`);
      console.log(`   Content-Type: ${cloudinaryResponse.headers.get('content-type')}`);
      
      if (cloudinaryResponse.status === 200) {
        console.log('   ✅ Cloudinary file is accessible!');
      } else {
        console.log('   ❌ Cloudinary file not accessible');
      }
    } else {
      console.log(`   ❌ Preview failed: ${data.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Network error: ${error.message}`);
  }
  
  // Summary
  console.log('\n📈 SUMMARY:');
  console.log('=' .repeat(50));
  console.log('If all tests pass:');
  console.log('   ✅ Your PDFs are stored in Cloudinary');
  console.log('   ✅ Preview endpoint works');
  console.log('   ✅ Cloudinary URLs are accessible');
  console.log('\nIf you still see "File not found":');
  console.log('   1. The Cloudinary URL might be wrong');
  console.log('   2. The PDF might not be uploaded to Cloudinary');
  console.log('   3. The URL might point to /image/ instead of /raw/');
  
  await db.sequelize.close();
  process.exit(0);
};

verifyCloudinary();