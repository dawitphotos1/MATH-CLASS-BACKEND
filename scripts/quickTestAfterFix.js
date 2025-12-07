// // scripts/quickTestAfterFix.js
// import db from "../models/index.js";

// const { Lesson } = db;

// const quickTest = async () => {
//   console.log("🧪 Quick Test After Fix\n");

//   // Get 5 random lessons
//   const lessons = await Lesson.findAll({
//     attributes: ["id", "title", "file_url"],
//     order: db.Sequelize.literal("RANDOM()"),
//     limit: 5,
//   });

//   console.log("📚 Random Sample of Lessons:");
//   console.log("=".repeat(80));

//   lessons.forEach((lesson, index) => {
//     console.log(`\n${index + 1}. Lesson ${lesson.id}: ${lesson.title}`);

//     if (lesson.file_url) {
//       const isCloudinary = lesson.file_url.includes("cloudinary");
//       console.log(`   ✅ Has Cloudinary URL: ${isCloudinary ? "YES" : "NO"}`);

//       if (isCloudinary) {
//         // Check if URL contains lesson ID (should be unique)
//         const containsLessonId =
//           lesson.file_url.includes(`lesson_${lesson.id}`) ||
//           lesson.file_url.includes(`_${lesson.id}_`);
//         console.log(
//           `   🔍 Contains lesson ID: ${containsLessonId ? "✅ YES" : "⚠️ NO"}`
//         );

//         // Show a portion of the URL
//         const urlPreview =
//           lesson.file_url.length > 80
//             ? lesson.file_url.substring(0, 80) + "..."
//             : lesson.file_url;
//         console.log(`   🔗 URL: ${urlPreview}`);
//       }
//     } else {
//       console.log(`   ⚠️ No file URL`);
//     }
//   });

//   // Check for duplicates
//   console.log("\n🔍 Checking for duplicates...");
//   const allUrls = lessons.map((l) => l.file_url).filter(Boolean);
//   const uniqueUrls = [...new Set(allUrls)];

//   console.log(`   Total URLs: ${allUrls.length}`);
//   console.log(`   Unique URLs: ${uniqueUrls.length}`);
//   console.log(`   Duplicates: ${allUrls.length - uniqueUrls.length}`);

//   if (allUrls.length === uniqueUrls.length) {
//     console.log("\n🎉 SUCCESS: All URLs are unique!");
//   } else {
//     console.log("\n⚠️ WARNING: Some URLs are still duplicates");
//   }

//   await db.sequelize.close();
//   console.log("\n✅ Test complete");
//   process.exit(0);
// };

// quickTest();





// scripts/quickTestAfterFix.js
import db from '../models/index.js';

const { Lesson } = db;

const quickTest = async () => {
  console.log('🧪 Quick Test After Fix\n');
  
  // Get 5 random lessons
  const lessons = await Lesson.findAll({
    attributes: ['id', 'title', 'file_url'],
    order: db.Sequelize.literal('RANDOM()'),
    limit: 5
  });
  
  console.log('📚 Random Sample of Lessons:');
  console.log('='.repeat(80));
  
  lessons.forEach((lesson, index) => {
    console.log(`\n${index + 1}. Lesson ${lesson.id}: ${lesson.title}`);
    
    if (lesson.file_url) {
      const isCloudinary = lesson.file_url.includes('cloudinary');
      console.log(`   ✅ Has Cloudinary URL: ${isCloudinary ? 'YES' : 'NO'}`);
      
      if (isCloudinary) {
        // Check if URL contains lesson ID (should be unique)
        const containsLessonId = lesson.file_url.includes(`lesson_${lesson.id}`) || 
                                lesson.file_url.includes(`_${lesson.id}_`);
        console.log(`   🔍 Contains lesson ID: ${containsLessonId ? '✅ YES' : '⚠️ NO'}`);
        
        // Show a portion of the URL
        const urlPreview = lesson.file_url.length > 80 ? 
                          lesson.file_url.substring(0, 80) + '...' : 
                          lesson.file_url;
        console.log(`   🔗 URL: ${urlPreview}`);
      }
    } else {
      console.log(`   ⚠️ No file URL`);
    }
  });
  
  // Check for duplicates
  console.log('\n🔍 Checking for duplicates...');
  const allUrls = lessons.map(l => l.file_url).filter(Boolean);
  const uniqueUrls = [...new Set(allUrls)];
  
  console.log(`   Total URLs: ${allUrls.length}`);
  console.log(`   Unique URLs: ${uniqueUrls.length}`);
  console.log(`   Duplicates: ${allUrls.length - uniqueUrls.length}`);
  
  if (allUrls.length === uniqueUrls.length) {
    console.log('\n🎉 SUCCESS: All URLs are unique!');
  } else {
    console.log('\n⚠️ WARNING: Some URLs are still duplicates');
  }
  
  await db.sequelize.close();
  console.log('\n✅ Test complete');
  process.exit(0);
};

quickTest();