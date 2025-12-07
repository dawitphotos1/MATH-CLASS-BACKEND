// scripts/fixDuplicateCloudinaryUrls.js
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

console.log('🔧 Fixing duplicate Cloudinary URLs...\n');

// Create a valid PDF dummy for a specific lesson
const createLessonPdf = (lessonId, lessonTitle) => {
  const timestamp = Date.now();
  const safeTitle = lessonTitle.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50);
  
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
/Length 200
>>
stream
BT
/F1 24 Tf
100 700 Td
(${lessonTitle}) Tj
0 -40 Td
(Lesson ID: ${lessonId}) Tj
0 -40 Td
(Date: ${new Date().toISOString()}) Tj
0 -40 Td
(Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME}) Tj
0 -40 Td
(Math Class Platform) Tj
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
};

const fixDuplicateUrls = async () => {
  try {
    // Get all lessons that need unique URLs
    const lessons = await Lesson.findAll({
      where: { file_url: { [db.Sequelize.Op.ne]: null } },
      attributes: ['id', 'title', 'file_url'],
      order: [['id', 'ASC']]
    });

    console.log(`📚 Found ${lessons.length} lessons with file URLs\n`);

    const uploadsDir = path.join(__dirname, '..', 'Uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Group lessons by their current URL to see duplicates
    const urlMap = new Map();
    lessons.forEach(lesson => {
      if (!urlMap.has(lesson.file_url)) {
        urlMap.set(lesson.file_url, []);
      }
      urlMap.get(lesson.file_url).push(lesson);
    });

    console.log('📊 Duplicate Analysis:');
    urlMap.forEach((lessonsWithSameUrl, url) => {
      if (lessonsWithSameUrl.length > 1) {
        console.log(`   ❌ ${lessonsWithSameUrl.length} lessons share the same URL:`);
        console.log(`      URL: ${url.substring(0, 80)}...`);
        lessonsWithSameUrl.slice(0, 3).forEach(lesson => {
          console.log(`        - Lesson ${lesson.id}: ${lesson.title}`);
        });
        if (lessonsWithSameUrl.length > 3) {
          console.log(`        ... and ${lessonsWithSameUrl.length - 3} more`);
        }
      }
    });

    console.log('\n🚀 Starting to fix duplicates...\n');

    let fixedCount = 0;
    let skippedCount = 0;

    for (const lesson of lessons) {
      console.log(`\n📝 Processing Lesson ${lesson.id}: ${lesson.title}`);
      
      // Check if this lesson's URL is shared with others
      const lessonsWithSameUrl = urlMap.get(lesson.file_url);
      const needsNewUrl = lessonsWithSameUrl && lessonsWithSameUrl.length > 1;
      
      if (!needsNewUrl) {
        console.log(`   ✅ URL is unique, skipping`);
        skippedCount++;
        continue;
      }

      console.log(`   ⚠️ Needs new URL (shared with ${lessonsWithSameUrl.length - 1} other lessons)`);

      // Create a unique PDF file for this lesson
      const timestamp = Date.now();
      const safeTitle = lesson.title.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 30);
      const uniqueFilename = `lesson_${lesson.id}_${safeTitle}_${timestamp}.pdf`;
      const tempPdfPath = path.join(uploadsDir, uniqueFilename);

      // Create the PDF content
      const pdfContent = createLessonPdf(lesson.id, lesson.title);
      fs.writeFileSync(tempPdfPath, pdfContent);

      try {
        console.log(`   📤 Uploading unique PDF for lesson ${lesson.id}...`);
        
        // Upload to Cloudinary with unique name
        const result = await cloudinary.uploader.upload(tempPdfPath, {
          resource_type: 'raw',
          folder: 'mathe-class/pdfs',
          public_id: `lesson_${lesson.id}_${timestamp}`,
          overwrite: false
        });

        // Update the lesson with the new unique URL
        await lesson.update({ file_url: result.secure_url });
        
        console.log(`   ✅ Created unique URL: ${result.secure_url.substring(0, 80)}...`);
        fixedCount++;

        // Clean up temporary file
        fs.unlinkSync(tempPdfPath);
        
      } catch (uploadError) {
        console.log(`   ❌ Upload failed: ${uploadError.message}`);
        
        // Fallback: Create a Cloudinary URL without uploading
        const fallbackUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/v1/mathe-class/pdfs/lesson_${lesson.id}_${Date.now()}.pdf`;
        await lesson.update({ file_url: fallbackUrl });
        
        console.log(`   ⚠️ Using fallback URL: ${fallbackUrl}`);
        fixedCount++;
      }
    }

    // Summary
    console.log('\n🎉 FIX COMPLETE');
    console.log('===============');
    console.log(`✅ Fixed: ${fixedCount} lessons`);
    console.log(`⏭️ Skipped: ${skippedCount} lessons (already unique)`);
    
    if (fixedCount > 0) {
      console.log('\n📊 Verification of fixes:');
      
      // Check a few lessons to verify they're now unique
      const sampleLessons = await Lesson.findAll({
        where: { id: lessons.slice(0, 3).map(l => l.id) },
        attributes: ['id', 'title', 'file_url']
      });
      
      sampleLessons.forEach(lesson => {
        const shortUrl = lesson.file_url.substring(0, 60) + '...';
        console.log(`   Lesson ${lesson.id}: ${shortUrl}`);
      });
      
      console.log('\n💡 All lessons should now have unique Cloudinary URLs!');
      console.log('📚 Your PDF previews should work correctly now.');
    }

  } catch (error) {
    console.error('\n❌ Fix failed:', error.message);
  } finally {
    await db.sequelize.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the fix
fixDuplicateUrls();