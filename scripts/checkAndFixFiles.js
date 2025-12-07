
// scripts/checkAndFixFiles.js
import db from '../models/index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Lesson, Course } = db;

const checkAndFixFiles = async () => {
  console.log('🔍 Checking database for file references...');
  
  // Check lessons
  const lessons = await Lesson.findAll({
    attributes: ['id', 'title', 'video_url', 'file_url'],
    where: {
      [db.Sequelize.Op.or]: [
        { video_url: { [db.Sequelize.Op.ne]: null } },
        { file_url: { [db.Sequelize.Op.ne]: null } }
      ]
    }
  });
  
  console.log(`Found ${lessons.length} lessons with file references`);
  
  const uploadsDir = path.join(__dirname, '..', 'Uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created Uploads directory: ${uploadsDir}`);
  }
  
  // Check each file
  for (const lesson of lessons) {
    console.log(`\nLesson ${lesson.id}: ${lesson.title}`);
    
    if (lesson.video_url) {
      const filename = lesson.video_url.split('/').pop();
      const filePath = path.join(uploadsDir, filename);
      
      if (fs.existsSync(filePath)) {
        console.log(`   ✅ Video exists: ${filename}`);
      } else {
        console.log(`   ❌ Video missing: ${filename}`);
        console.log(`   Creating dummy video file...`);
        fs.writeFileSync(filePath, `Dummy video file for: ${filename}\nLesson ID: ${lesson.id}\nTitle: ${lesson.title}`);
      }
    }
    
    if (lesson.file_url) {
      const filename = lesson.file_url.split('/').pop();
      const filePath = path.join(uploadsDir, filename);
      
      if (fs.existsSync(filePath)) {
        console.log(`   ✅ File exists: ${filename}`);
      } else {
        console.log(`   ❌ File missing: ${filename}`);
        console.log(`   Creating dummy file...`);
        fs.writeFileSync(filePath, `Dummy file for: ${filename}\nLesson ID: ${lesson.id}\nTitle: ${lesson.title}`);
      }
    }
  }
  
  // Check courses
  const courses = await Course.findAll({
    attributes: ['id', 'title', 'thumbnail'],
    where: { thumbnail: { [db.Sequelize.Op.ne]: null } }
  });
  
  console.log(`\nFound ${courses.length} courses with thumbnails`);
  
  for (const course of courses) {
    console.log(`\nCourse ${course.id}: ${course.title}`);
    
    if (course.thumbnail) {
      const filename = course.thumbnail.split('/').pop();
      const filePath = path.join(uploadsDir, filename);
      
      if (fs.existsSync(filePath)) {
        console.log(`   ✅ Thumbnail exists: ${filename}`);
      } else {
        console.log(`   ❌ Thumbnail missing: ${filename}`);
        console.log(`   Creating dummy thumbnail...`);
        fs.writeFileSync(filePath, `Dummy thumbnail for: ${filename}\nCourse ID: ${course.id}\nTitle: ${course.title}`);
      }
    }
  }
  
  console.log('\n✅ File check completed');
  await db.sequelize.close();
  process.exit(0);
};

checkAndFixFiles();