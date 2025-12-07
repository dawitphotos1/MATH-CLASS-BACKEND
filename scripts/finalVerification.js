// // scripts/finalVerification.js
// import db from "../models/index.js";
// import fetch from "node-fetch";

// const { Lesson } = db;

// const finalVerification = async () => {
//   console.log("✅ FINAL VERIFICATION OF CLOUDINARY INTEGRATION\n");
//   console.log("=".repeat(70));

//   // Test 1: Database URLs
//   console.log("\n📊 TEST 1: Database URLs Check");
//   const lessons = await Lesson.findAll({
//     where: { file_url: { [db.Sequelize.Op.ne]: null } },
//     attributes: ["id", "title", "file_url"],
//     limit: 3,
//   });

//   lessons.forEach((lesson) => {
//     console.log(`\n📝 Lesson ${lesson.id}: ${lesson.title}`);

//     if (lesson.file_url) {
//       const isCloudinary = lesson.file_url.includes("cloudinary");
//       const isRaw = lesson.file_url.includes("/raw/upload/");
//       const isPublic = !lesson.file_url.includes("/authenticated/");

//       console.log(`   🔗 URL: ${lesson.file_url.substring(0, 70)}...`);
//       console.log(`   ☁️ Cloudinary: ${isCloudinary ? "✅ YES" : "❌ NO"}`);
//       console.log(
//         `   📄 Raw Type: ${
//           isRaw ? "✅ YES (correct for PDFs)" : "❌ NO (should be raw/upload)"
//         }`
//       );
//       console.log(
//         `   🔓 Public: ${isPublic ? "✅ YES" : "❌ NO (should be public)"}`
//       );
//     }
//   });

//   // Test 2: Preview Endpoint
//   console.log("\n🌐 TEST 2: Preview Endpoint");
//   const testLessonId = lessons[0]?.id || 5201;
//   const previewUrl = `https://mathe-class-website-backend-1.onrender.com/api/v1/files/preview-lesson/${testLessonId}`;

//   console.log(`   Testing: ${previewUrl}`);

//   try {
//     const response = await fetch(previewUrl);
//     const data = await response.json();

//     if (data.success) {
//       console.log(`   ✅ Preview endpoint works!`);
//       console.log(`   📖 Title: ${data.lesson?.title}`);

//       if (data.lesson?.file_url) {
//         console.log(
//           `   🔗 File URL: ${data.lesson.file_url.substring(0, 70)}...`
//         );

//         // Test 3: Direct Cloudinary Access
//         console.log("\n🔗 TEST 3: Direct Cloudinary Access");

//         // First try HEAD request
//         const headResponse = await fetch(data.lesson.file_url, {
//           method: "HEAD",
//         });
//         console.log(`   HEAD Status: ${headResponse.status}`);
//         console.log(
//           `   Content-Type: ${headResponse.headers.get("content-type")}`
//         );
//         console.log(
//           `   Content-Length: ${headResponse.headers.get(
//             "content-length"
//           )} bytes`
//         );

//         // Then try GET request
//         console.log(`   🔍 Testing GET request...`);
//         const getResponse = await fetch(data.lesson.file_url);
//         console.log(`   GET Status: ${getResponse.status}`);

//         if (getResponse.ok) {
//           const content = await getResponse.text();
//           console.log(`   ✅ File is accessible!`);
//           console.log(`   📄 First 100 chars: ${content.substring(0, 100)}...`);

//           // Check if it's a valid PDF
//           if (content.startsWith("%PDF-")) {
//             console.log(`   🎯 SUCCESS: Valid PDF file!`);
//           } else {
//             console.log(
//               `   ⚠️ Warning: Not a valid PDF (should start with %PDF-)`
//             );
//           }
//         } else {
//           console.log(`   ❌ File not accessible: ${getResponse.status}`);
//           console.log(`   💡 Try opening this URL in your browser:`);
//           console.log(`   ${data.lesson.file_url}`);
//         }
//       }
//     } else {
//       console.log(`   ❌ Preview failed: ${data.error}`);
//     }
//   } catch (error) {
//     console.log(`   ❌ Network error: ${error.message}`);
//   }

//   // Test 4: Manual Browser Test Instructions
//   console.log("\n🌐 TEST 4: Manual Browser Test");
//   console.log("=".repeat(70));
//   console.log("\n📱 Open these URLs in your browser:\n");

//   // Generate test URLs
//   const testUrls = [
//     `https://mathe-class-website-backend-1.onrender.com/api/v1/files/preview-lesson/5201`,
//     `https://mathe-class-website-backend-1.onrender.com/api/v1/files/preview-lesson/5202`,
//     `https://mathe-class-website-backend-1.onrender.com/api/v1/files/preview-lesson/5203`,
//   ];

//   testUrls.forEach((url, index) => {
//     console.log(`${index + 1}. ${url}`);
//   });

//   console.log("\n💡 INSTRUCTIONS:");
//   console.log("   1. Open each URL in browser");
//   console.log("   2. You should see JSON with a Cloudinary URL");
//   console.log("   3. Copy the Cloudinary URL and open it in a new tab");
//   console.log("   4. The PDF should download or display in browser");
//   console.log("\n🔧 If PDF doesn't load:");
//   console.log("   - Check Cloudinary console for files");
//   console.log("   - Ensure PDFs are in mathe-class/pdfs folder");
//   console.log('   - Ensure files have "public" access');
//   console.log("   - Ensure URLs use /raw/upload/ not /image/upload/");

//   await db.sequelize.close();
//   console.log("\n✅ Verification complete");
//   process.exit(0);
// };

// finalVerification();





// scripts/finalVerification.js
import db from '../models/index.js';
import fetch from 'node-fetch';

const { Lesson } = db;

const finalVerification = async () => {
  console.log('✅ FINAL VERIFICATION OF CLOUDINARY INTEGRATION\n');
  console.log('='.repeat(70));

  // Test 1: Database URLs
  console.log('\n📊 TEST 1: Database URLs Check');
  const lessons = await Lesson.findAll({
    where: { file_url: { [db.Sequelize.Op.ne]: null } },
    attributes: ['id', 'title', 'file_url'],
    limit: 3
  });

  lessons.forEach(lesson => {
    console.log(`\n📝 Lesson ${lesson.id}: ${lesson.title}`);
    
    if (lesson.file_url) {
      const isCloudinary = lesson.file_url.includes('cloudinary');
      const isRaw = lesson.file_url.includes('/raw/upload/');
      const isPublic = !lesson.file_url.includes('/authenticated/');
      
      console.log(`   🔗 URL: ${lesson.file_url.substring(0, 70)}...`);
      console.log(`   ☁️ Cloudinary: ${isCloudinary ? '✅ YES' : '❌ NO'}`);
      console.log(`   📄 Raw Type: ${isRaw ? '✅ YES (correct for PDFs)' : '❌ NO (should be raw/upload)'}`);
      console.log(`   🔓 Public: ${isPublic ? '✅ YES' : '❌ NO (should be public)'}`);
    }
  });

  // Test 2: Preview Endpoint
  console.log('\n🌐 TEST 2: Preview Endpoint');
  const testLessonId = lessons[0]?.id || 5201;
  const previewUrl = `https://mathe-class-website-backend-1.onrender.com/api/v1/files/preview-lesson/${testLessonId}`;
  
  console.log(`   Testing: ${previewUrl}`);
  
  try {
    const response = await fetch(previewUrl);
    const data = await response.json();
    
    if (data.success) {
      console.log(`   ✅ Preview endpoint works!`);
      console.log(`   📖 Title: ${data.lesson?.title}`);
      
      if (data.lesson?.file_url) {
        console.log(`   🔗 File URL: ${data.lesson.file_url.substring(0, 70)}...`);
        
        // Test 3: Direct Cloudinary Access
        console.log('\n🔗 TEST 3: Direct Cloudinary Access');
        
        // First try HEAD request
        const headResponse = await fetch(data.lesson.file_url, { method: 'HEAD' });
        console.log(`   HEAD Status: ${headResponse.status}`);
        console.log(`   Content-Type: ${headResponse.headers.get('content-type')}`);
        console.log(`   Content-Length: ${headResponse.headers.get('content-length')} bytes`);
        
        // Then try GET request
        console.log(`   🔍 Testing GET request...`);
        const getResponse = await fetch(data.lesson.file_url);
        console.log(`   GET Status: ${getResponse.status}`);
        
        if (getResponse.ok) {
          const content = await getResponse.text();
          console.log(`   ✅ File is accessible!`);
          console.log(`   📄 First 100 chars: ${content.substring(0, 100)}...`);
          
          // Check if it's a valid PDF
          if (content.startsWith('%PDF-')) {
            console.log(`   🎯 SUCCESS: Valid PDF file!`);
          } else {
            console.log(`   ⚠️ Warning: Not a valid PDF (should start with %PDF-)`);
          }
        } else {
          console.log(`   ❌ File not accessible: ${getResponse.status}`);
          console.log(`   💡 Try opening this URL in your browser:`);
          console.log(`   ${data.lesson.file_url}`);
        }
      }
    } else {
      console.log(`   ❌ Preview failed: ${data.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Network error: ${error.message}`);
  }

  // Test 4: Manual Browser Test Instructions
  console.log('\n🌐 TEST 4: Manual Browser Test');
  console.log('='.repeat(70));
  console.log('\n📱 Open these URLs in your browser:\n');
  
  // Generate test URLs
  const testUrls = [
    `https://mathe-class-website-backend-1.onrender.com/api/v1/files/preview-lesson/5201`,
    `https://mathe-class-website-backend-1.onrender.com/api/v1/files/preview-lesson/5202`,
    `https://mathe-class-website-backend-1.onrender.com/api/v1/files/preview-lesson/5203`
  ];
  
  testUrls.forEach((url, index) => {
    console.log(`${index + 1}. ${url}`);
  });
  
  console.log('\n💡 INSTRUCTIONS:');
  console.log('   1. Open each URL in browser');
  console.log('   2. You should see JSON with a Cloudinary URL');
  console.log('   3. Copy the Cloudinary URL and open it in a new tab');
  console.log('   4. The PDF should download or display in browser');
  console.log('\n🔧 If PDF doesn\'t load:');
  console.log('   - Check Cloudinary console for files');
  console.log('   - Ensure PDFs are in mathe-class/pdfs folder');
  console.log('   - Ensure files have "public" access');
  console.log('   - Ensure URLs use /raw/upload/ not /image/upload/');

  await db.sequelize.close();
  console.log('\n✅ Verification complete');
  process.exit(0);
};

finalVerification();