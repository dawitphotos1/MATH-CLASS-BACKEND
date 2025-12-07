// scripts/testActualPreview.js
import fetch from 'node-fetch';

const testActualPreview = async () => {
  // Use a lesson ID you know has a PDF
  const lessonIds = [5201, 5202, 5203, 5784]; // Your lesson IDs
  
  console.log('🌐 Testing actual preview endpoints...\n');
  
  for (const lessonId of lessonIds) {
    const url = `https://mathe-class-website-backend-1.onrender.com/api/v1/files/preview-lesson/${lessonId}`;
    
    console.log(`Testing Lesson ${lessonId}: ${url}`);
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        console.log(`   ✅ Success!`);
        console.log(`   📖 Title: ${data.lesson?.title}`);
        
        if (data.lesson?.file_url) {
          console.log(`   🔗 File URL: ${data.lesson.file_url.substring(0, 80)}...`);
          
          // Test the Cloudinary URL
          const cloudinaryResponse = await fetch(data.lesson.file_url, { method: 'HEAD' });
          console.log(`   🌐 Cloudinary Status: ${cloudinaryResponse.status}`);
          
          if (cloudinaryResponse.status === 200) {
            console.log(`   📄 Content-Type: ${cloudinaryResponse.headers.get('content-type')}`);
          }
        }
      } else {
        console.log(`   ❌ Failed: ${data.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Network error: ${error.message}`);
    }
    
    console.log(''); // Empty line between tests
  }
  
  console.log('✅ All tests completed');
  process.exit(0);
};

testActualPreview();