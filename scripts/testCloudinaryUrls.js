// // scripts/testCloudinaryUrls.js
// import db from "../models/index.js";

// const { Lesson } = db;

// const testCloudinaryUrls = async () => {
//   console.log("🔍 Checking Cloudinary URLs in database...\n");

//   // Get a few lessons with file_url
//   const lessons = await Lesson.findAll({
//     where: { file_url: { [db.Sequelize.Op.ne]: null } },
//     attributes: ["id", "title", "file_url"],
//     limit: 5,
//   });

//   console.log(`📚 Found ${lessons.length} lessons with file URLs:\n`);

//   lessons.forEach((lesson, index) => {
//     console.log(`${index + 1}. Lesson ${lesson.id}: ${lesson.title}`);
//     console.log(`   URL: ${lesson.file_url}`);
//     console.log(
//       `   Is Cloudinary: ${
//         lesson.file_url.includes("cloudinary") ? "✅ YES" : "❌ NO"
//       }`
//     );

//     if (lesson.file_url.includes("cloudinary")) {
//       // Extract Cloudinary info
//       const url = new URL(lesson.file_url);
//       console.log(`   Cloudinary Host: ${url.hostname}`);
//       console.log(`   Path: ${url.pathname.substring(0, 60)}...`);
//     }
//     console.log("");
//   });

//   // Check the specific problem file
//   console.log("\n🔎 Looking for the problem PDF file...");
//   const problemLesson = await Lesson.findOne({
//     where: {
//       file_url: {
//         [db.Sequelize.Op.like]:
//           "%Class_work_on_increasing_and_decreasing_intervals%",
//       },
//     },
//     attributes: ["id", "title", "file_url"],
//   });

//   if (problemLesson) {
//     console.log("\n🎯 Found the problem lesson:");
//     console.log(`   ID: ${problemLesson.id}`);
//     console.log(`   Title: ${problemLesson.title}`);
//     console.log(`   URL: ${problemLesson.file_url}`);

//     // Test if the URL is accessible
//     console.log("\n🌐 Testing URL accessibility...");
//     console.log(`   Try opening this URL in your browser:`);
//     console.log(`   ${problemLesson.file_url}`);
//   } else {
//     console.log("❌ Problem lesson not found in database");
//   }

//   await db.sequelize.close();
//   process.exit(0);
// };

// testCloudinaryUrls();





// scripts/testCloudinaryUrls.js
import db from '../models/index.js';

const { Lesson } = db;

const testCloudinaryUrls = async () => {
  console.log('🔍 Checking Cloudinary URLs in database...\n');
  
  // Get a few lessons with file_url
  const lessons = await Lesson.findAll({
    where: { file_url: { [db.Sequelize.Op.ne]: null } },
    attributes: ['id', 'title', 'file_url'],
    limit: 5
  });
  
  console.log(`📚 Found ${lessons.length} lessons with file URLs:\n`);
  
  lessons.forEach((lesson, index) => {
    console.log(`${index + 1}. Lesson ${lesson.id}: ${lesson.title}`);
    console.log(`   URL: ${lesson.file_url}`);
    console.log(`   Is Cloudinary: ${lesson.file_url.includes('cloudinary') ? '✅ YES' : '❌ NO'}`);
    
    if (lesson.file_url.includes('cloudinary')) {
      // Extract Cloudinary info
      const url = new URL(lesson.file_url);
      console.log(`   Cloudinary Host: ${url.hostname}`);
      console.log(`   Path: ${url.pathname.substring(0, 60)}...`);
    }
    console.log('');
  });
  
  // Check the specific problem file
  console.log('\n🔎 Looking for the problem PDF file...');
  const problemLesson = await Lesson.findOne({
    where: { 
      file_url: { 
        [db.Sequelize.Op.like]: '%Class_work_on_increasing_and_decreasing_intervals%' 
      } 
    },
    attributes: ['id', 'title', 'file_url']
  });
  
  if (problemLesson) {
    console.log('\n🎯 Found the problem lesson:');
    console.log(`   ID: ${problemLesson.id}`);
    console.log(`   Title: ${problemLesson.title}`);
    console.log(`   URL: ${problemLesson.file_url}`);
    
    // Test if the URL is accessible
    console.log('\n🌐 Testing URL accessibility...');
    console.log(`   Try opening this URL in your browser:`);
    console.log(`   ${problemLesson.file_url}`);
  } else {
    console.log('❌ Problem lesson not found in database');
  }
  
  await db.sequelize.close();
  process.exit(0);
};

testCloudinaryUrls();