
// scripts/test-preview-fix.js
import fetch from 'node-fetch';

async function testPreviewFix() {
  console.log("🔍 Testing preview functionality fix...");
  
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  
  try {
    // Test 1: Check environment
    console.log("\n1️⃣ Testing environment...");
    try {
      const envRes = await fetch(`${backendUrl}/api/v1/files/debug/env`);
      const envData = await envRes.json();
      console.log("Environment:", envData);
    } catch (envError) {
      console.log("❌ Environment test failed:", envError.message);
    }
    
    // Test 2: Test Cloudinary connection
    console.log("\n2️⃣ Testing Cloudinary connection...");
    try {
      const cloudinaryRes = await fetch(`${backendUrl}/api/v1/files/cloudinary-test`);
      const cloudinaryData = await cloudinaryRes.json();
      console.log("Cloudinary:", cloudinaryData.cloudinary?.status || cloudinaryData);
    } catch (cloudinaryError) {
      console.log("⚠️ Cloudinary test failed:", cloudinaryError.message);
    }
    
    // Test 3: Get a lesson with file - try multiple lesson IDs
    console.log("\n3️⃣ Finding lessons with files...");
    const lessonIdsToTest = [1, 2, 3, 4, 5];
    let lessonWithFile = null;
    
    for (const lessonId of lessonIdsToTest) {
      try {
        const lessonsRes = await fetch(`${backendUrl}/api/v1/lessons/debug/file?lessonId=${lessonId}`);
        const lessonsData = await lessonsRes.json();
        
        if (lessonsData.lesson && (lessonsData.lesson.fileUrl || lessonsData.lesson.file_url)) {
          console.log(`✅ Found lesson ${lessonId} with file`);
          lessonWithFile = lessonsData.lesson;
          break;
        }
      } catch (lessonError) {
        console.log(`❌ Lesson ${lessonId} test failed:`, lessonError.message);
      }
    }
    
    if (lessonWithFile) {
      console.log("Lesson debug:", {
        id: lessonWithFile.id,
        title: lessonWithFile.title,
        fileUrl: lessonWithFile.fileUrl || lessonWithFile.file_url,
        contentType: lessonWithFile.contentType || lessonWithFile.content_type,
      });
      
      const fileUrl = lessonWithFile.fileUrl || lessonWithFile.file_url;
      
      // Test 4: Check if URL needs fixing
      if (fileUrl && fileUrl.includes('cloudinary.com')) {
        console.log("\n4️⃣ Checking Cloudinary URL...");
        const needsFix = fileUrl.includes('/image/upload/') && 
                        (fileUrl.includes('.pdf') || fileUrl.includes('/pdfs/') || fileUrl.includes('/mathe-class/pdfs/'));
        
        if (needsFix) {
          console.log("⚠️ URL needs fixing! Should use /raw/upload/ instead of /image/upload/");
          const fixedUrl = fileUrl.replace('/image/upload/', '/raw/upload/');
          console.log("Original:", fileUrl.substring(0, 100));
          console.log("Fixed:", fixedUrl.substring(0, 100));
          
          // Test 5: Test both URLs
          console.log("\n5️⃣ Testing both URLs...");
          const testUrls = [fileUrl, fixedUrl];
          for (const url of testUrls) {
            try {
              const testUrl = encodeURIComponent(url);
              const fileTestRes = await fetch(`${backendUrl}/api/v1/lessons/debug/test-file?url=${testUrl}`);
              const fileTestData = await fileTestRes.json();
              console.log(`URL ${url.includes('/image/') ? '(image)' : '(raw)'}:`, {
                success: fileTestData.success,
                status: fileTestData.status,
                contentType: fileTestData.headers?.['content-type'],
              });
            } catch (urlError) {
              console.log(`❌ URL test failed:`, urlError.message);
            }
          }
        } else {
          console.log("✅ Cloudinary URL is correct!");
        }
      }
    } else {
      console.log("❌ No lessons with files found. Creating a test lesson...");
      
      // Test creating a lesson first
      try {
        const coursesRes = await fetch(`${backendUrl}/api/v1/courses`);
        const coursesData = await coursesRes.json();
        
        if (coursesData.success && coursesData.courses.length > 0) {
          const courseId = coursesData.courses[0].id;
          console.log(`Found course ID: ${courseId}`);
          
          // Test preview endpoint
          const previewRes = await fetch(`${backendUrl}/api/v1/lessons/preview/course/${courseId}`);
          const previewData = await previewRes.json();
          console.log("Preview test:", {
            success: previewData.success,
            hasLesson: !!previewData.lesson,
            lessonTitle: previewData.lesson?.title,
            fileUrl: previewData.lesson?.fileUrl || previewData.lesson?.file_url,
          });
        }
      } catch (courseError) {
        console.log("❌ Course test failed:", courseError.message);
      }
    }
    
    console.log("\n6️⃣ Testing file access endpoint directly...");
    // Test with a known Cloudinary PDF URL pattern
    const testUrls = [
      'https://res.cloudinary.com/demo/image/upload/v1234567/sample.pdf',
      'https://res.cloudinary.com/demo/raw/upload/v1234567/sample.pdf',
    ];
    
    for (const url of testUrls) {
      try {
        const testUrl = encodeURIComponent(url);
        const fileTestRes = await fetch(`${backendUrl}/api/v1/lessons/debug/test-file?url=${testUrl}`);
        const fileTestData = await fileTestRes.json();
        console.log(`Test ${url.includes('/image/') ? 'Image URL' : 'Raw URL'}:`, {
          success: fileTestData.success,
          status: fileTestData.status,
          contentType: fileTestData.headers?.['content-type'],
        });
      } catch (urlError) {
        console.log(`❌ Test failed for ${url}:`, urlError.message);
      }
    }
    
    console.log("\n🎉 All tests completed!");
    console.log("\n📋 Summary:");
    console.log("1. Check if PDF URLs use /raw/upload/ instead of /image/upload/");
    console.log("2. Verify the file exists in Cloudinary");
    console.log("3. Check CORS settings in Cloudinary");
    console.log("4. Test direct URL access in browser");
    console.log("5. Use debug endpoints to fix URLs: /api/v1/lessons/debug/fix/:lessonId");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

testPreviewFix();