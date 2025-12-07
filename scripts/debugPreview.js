// scripts/debugPreview.js
import db from '../models/index.js';

const { Lesson } = db;

const debugPreview = async () => {
  console.log('🐛 DEBUG: Tracing the preview issue\n');
  
  // Get the specific lesson that's failing
  const lesson = await Lesson.findOne({
    where: { 
      file_url: { 
        [db.Sequelize.Op.like]: '%Class_work_on_increasing_and_decreasing_intervals%' 
      } 
    },
    include: [{ all: true }]
  });
  
  if (!lesson) {
    console.log('❌ Lesson not found');
    await db.sequelize.close();
    return;
  }
  
  console.log('📖 LESSON DETAILS:');
  console.log(`   ID: ${lesson.id}`);
  console.log(`   Title: ${lesson.title}`);
  console.log(`   Course ID: ${lesson.course_id}`);
  console.log(`   File URL: ${lesson.file_url}`);
  console.log(`   Is Preview: ${lesson.is_preview}`);
  console.log(`   Content Type: ${lesson.content_type}`);
  
  // Analyze the Cloudinary URL
  if (lesson.file_url && lesson.file_url.includes('cloudinary')) {
    console.log('\n🔗 CLOUDINARY URL ANALYSIS:');
    
    try {
      const url = new URL(lesson.file_url);
      console.log(`   Protocol: ${url.protocol}`);
      console.log(`   Host: ${url.host}`);
      console.log(`   Path: ${url.pathname}`);
      
      // Check if it's a raw/PDF URL
      if (url.pathname.includes('/raw/')) {
        console.log(`   ✅ This is a raw file URL (correct for PDFs)`);
      } else if (url.pathname.includes('/image/')) {
        console.log(`   ⚠️ This is an image URL (might be wrong for PDFs)`);
        console.log(`   💡 PDFs should use /raw/ not /image/`);
      }
      
      // Check Cloudinary folder structure
      const pathParts = url.pathname.split('/');
      const uploadIndex = pathParts.findIndex(p => p === 'upload');
      if (uploadIndex !== -1) {
        const version = pathParts[uploadIndex + 1];
        const folder = pathParts.slice(uploadIndex + 2, -1).join('/');
        const filename = pathParts[pathParts.length - 1];
        
        console.log(`   Version: ${version}`);
        console.log(`   Folder: ${folder}`);
        console.log(`   Filename: ${filename}`);
        
        if (folder !== 'mathe-class/pdfs') {
          console.log(`   ⚠️ Folder should be 'mathe-class/pdfs' for PDFs`);
        }
      }
    } catch (error) {
      console.log(`   ❌ URL parsing error: ${error.message}`);
    }
  }
  
  console.log('\n💡 POSSIBLE SOLUTIONS:');
  console.log('   1. Check if the Cloudinary URL actually points to a PDF file');
  console.log('   2. Manually upload the PDF to Cloudinary console');
  console.log('   3. Update the database with the correct URL');
  console.log('   4. Ensure PDFs use /raw/ upload type, not /image/');
  
  await db.sequelize.close();
  process.exit(0);
};

debugPreview();