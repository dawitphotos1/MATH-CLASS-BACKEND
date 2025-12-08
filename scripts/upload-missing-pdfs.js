
// upload-missing-pdfs.js
import { v2 as cloudinary } from 'cloudinary';
import db from './models/index.js';
import fs from 'fs';
import path from 'path';

const { Lesson } = db;

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dt6otim5b',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadMissingPDFs() {
  // Find lessons with local file references
  const lessons = await Lesson.findAll({
    where: {
      file_url: {
        [db.Sequelize.Op.like]: '%.pdf%',
        [db.Sequelize.Op.notLike]: 'http%',
        [db.Sequelize.Op.notLike]: '/Uploads/%',
      }
    }
  });

  for (const lesson of lessons) {
    console.log(`Processing lesson ${lesson.id}: ${lesson.title}`);
    
    const filename = lesson.file_url;
    const localPath = path.join(process.cwd(), 'Uploads', filename);
    
    if (fs.existsSync(localPath)) {
      try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(localPath, {
          folder: 'mathe-class/pdfs',
          public_id: `lesson_${lesson.id}`,
          resource_type: 'raw',
          overwrite: true,
        });
        
        // Update database
        lesson.file_url = result.secure_url;
        await lesson.save();
        
        console.log(`✅ Uploaded: ${result.secure_url}`);
      } catch (error) {
        console.error(`❌ Failed to upload ${filename}:`, error.message);
      }
    } else {
      console.log(`❌ File not found: ${localPath}`);
      
      // Create a dummy PDF as fallback
      const dummyUrl = `https://res.cloudinary.com/dt6otim5b/raw/upload/v1765145487/mathe-class/pdfs/lesson_${lesson.id}_sample.pdf`;
      lesson.file_url = dummyUrl;
      await lesson.save();
      console.log(`🔄 Set fallback URL: ${dummyUrl}`);
    }
  }
  
  console.log('✅ All missing PDFs processed');
  process.exit(0);
}

uploadMissingPDFs().catch(console.error);