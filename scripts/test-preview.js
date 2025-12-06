
// test-preview.js
import fetch from 'node-fetch';

async function testPreview() {
  console.log("🔍 Testing preview endpoint...");
  
  const backendUrl = 'https://mathe-class-website-backend-1.onrender.com';
  
  try {
    // Test 1: Health check
    console.log("1️⃣ Testing health endpoint...");
    const healthRes = await fetch(`${backendUrl}/api/v1/health`);
    const healthData = await healthRes.json();
    console.log("Health check:", healthData);
    
    // Test 2: Debug endpoint
    console.log("2️⃣ Testing debug endpoint...");
    const debugRes = await fetch(`${backendUrl}/api/v1/debug-env`);
    const debugData = await debugRes.json();
    console.log("Environment check:", debugData);
    
    // Test 3: Get first course for preview test
    console.log("3️⃣ Getting courses...");
    const coursesRes = await fetch(`${backendUrl}/api/v1/courses`);
    const coursesData = await coursesRes.json();
    
    if (coursesData.success && coursesData.courses.length > 0) {
      const courseId = coursesData.courses[0].id;
      console.log(`Found course ID: ${courseId}`);
      
      // Test 4: Preview endpoint
      console.log(`4️⃣ Testing preview for course ${courseId}...`);
      const previewRes = await fetch(`${backendUrl}/api/v1/courses/${courseId}/preview-lesson`);
      const previewData = await previewRes.json();
      console.log("Preview response:", {
        success: previewData.success,
        hasLesson: !!previewData.lesson,
        videoUrl: previewData.lesson?.video_url,
        fileUrl: previewData.lesson?.file_url
      });
      
      if (previewData.lesson?.video_url && previewData.lesson.video_url.includes('localhost')) {
        console.error("❌ ERROR: Preview still contains localhost URL!");
        console.error("Video URL:", previewData.lesson.video_url);
        process.exit(1);
      } else {
        console.log("✅ SUCCESS: Preview URLs are correctly pointing to Render!");
      }
    }
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

testPreview();