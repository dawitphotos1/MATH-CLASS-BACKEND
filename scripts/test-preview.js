
// // scripts/test-preview.js
// import fetch from 'node-fetch';

// async function testPreview() {
//   console.log("🔍 Testing preview endpoint...");
  
//   const backendUrl = 'https://mathe-class-website-backend-1.onrender.com';
  
//   try {
//     // Test 1: Health check
//     console.log("1️⃣ Testing health endpoint...");
//     const healthRes = await fetch(`${backendUrl}/api/v1/health`);
//     const healthData = await healthRes.json();
//     console.log("Health check:", healthData);
    
//     // Test 2: Debug endpoint
//     console.log("2️⃣ Testing debug endpoint...");
//     const debugRes = await fetch(`${backendUrl}/api/v1/debug-env`);
//     const debugData = await debugRes.json();
//     console.log("Environment check:", debugData);
    
//     // Test 3: Get first course for preview test
//     console.log("3️⃣ Getting courses...");
//     const coursesRes = await fetch(`${backendUrl}/api/v1/courses`);
//     const coursesData = await coursesRes.json();
    
//     if (coursesData.success && coursesData.courses.length > 0) {
//       const courseId = coursesData.courses[0].id;
//       console.log(`Found course ID: ${courseId}`);
      
//       // Test 4: Preview endpoint
//       console.log(`4️⃣ Testing preview for course ${courseId}...`);
//       const previewRes = await fetch(`${backendUrl}/api/v1/courses/${courseId}/preview-lesson`);
//       const previewData = await previewRes.json();
//       console.log("Preview response:", {
//         success: previewData.success,
//         hasLesson: !!previewData.lesson,
//         videoUrl: previewData.lesson?.video_url,
//         fileUrl: previewData.lesson?.file_url
//       });
      
//       if (previewData.lesson?.video_url && previewData.lesson.video_url.includes('localhost')) {
//         console.error("❌ ERROR: Preview still contains localhost URL!");
//         console.error("Video URL:", previewData.lesson.video_url);
//         process.exit(1);
//       } else {
//         console.log("✅ SUCCESS: Preview URLs are correctly pointing to Render!");
//       }
//     }
    
//   } catch (error) {
//     console.error("❌ Test failed:", error.message);
//     process.exit(1);
//   }
// }

// testPreview();






// scripts/test-preview-fix.js
import fetch from 'node-fetch';

async function testPreviewFix() {
  console.log("🔍 Testing preview functionality fix...");
  
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  
  try {
    // Test 1: Check environment
    console.log("\n1️⃣ Testing environment...");
    const envRes = await fetch(`${backendUrl}/api/v1/files/debug/env`);
    const envData = await envRes.json();
    console.log("Environment:", envData);
    
    // Test 2: Test Cloudinary connection
    console.log("\n2️⃣ Testing Cloudinary connection...");
    const cloudinaryRes = await fetch(`${backendUrl}/api/v1/files/cloudinary-test`);
    const cloudinaryData = await cloudinaryRes.json();
    console.log("Cloudinary:", cloudinaryData.cloudinary.status);
    
    // Test 3: Get a lesson with file
    console.log("\n3️⃣ Finding lessons with files...");
    const lessonsRes = await fetch(`${backendUrl}/api/v1/lessons/debug/file?lessonId=1`);
    const lessonsData = await lessonsRes.json();
    console.log("Lesson debug:", {
      hasLesson: !!lessonsData.lesson,
      fileUrl: lessonsData.lesson?.fileUrl,
      contentType: lessonsData.lesson?.contentType,
    });
    
    if (lessonsData.lesson?.fileUrl) {
      // Test 4: Test file access
      console.log("\n4️⃣ Testing file access...");
      const testUrl = encodeURIComponent(lessonsData.lesson.fileUrl);
      const fileTestRes = await fetch(`${backendUrl}/api/v1/lessons/debug/test-file?url=${testUrl}`);
      const fileTestData = await fileTestRes.json();
      console.log("File access test:", {
        success: fileTestData.success,
        status: fileTestData.status,
        contentType: fileTestData.headers?.['content-type'],
      });
      
      // Test 5: Check if URL needs fixing
      if (lessonsData.lesson.fileUrl.includes('cloudinary.com')) {
        console.log("\n5️⃣ Checking Cloudinary URL...");
        const needsFix = lessonsData.lesson.fileUrl.includes('/image/upload/') && 
                        (lessonsData.lesson.fileUrl.includes('.pdf') || lessonsData.lesson.fileUrl.includes('/pdfs/'));
        
        if (needsFix) {
          console.log("⚠️ URL needs fixing! Should use /raw/upload/ instead of /image/upload/");
          const fixedUrl = lessonsData.lesson.fileUrl.replace('/image/upload/', '/raw/upload/');
          console.log("Original:", lessonsData.lesson.fileUrl.substring(0, 100));
          console.log("Fixed:", fixedUrl.substring(0, 100));
        } else {
          console.log("✅ Cloudinary URL is correct!");
        }
      }
    }
    
    // Test 6: Test preview endpoint
    console.log("\n6️⃣ Testing preview endpoint...");
    const coursesRes = await fetch(`${backendUrl}/api/v1/courses`);
    const coursesData = await coursesRes.json();
    
    if (coursesData.success && coursesData.courses.length > 0) {
      const courseId = coursesData.courses[0].id;
      const previewRes = await fetch(`${backendUrl}/api/v1/lessons/preview/course/${courseId}`);
      const previewData = await previewRes.json();
      console.log("Preview test:", {
        success: previewData.success,
        hasLesson: !!previewData.lesson,
        lessonTitle: previewData.lesson?.title,
      });
    }
    
    console.log("\n🎉 All tests completed!");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testPreviewFix();