// scripts/fixPreviewLessons.js - FIXES ALL COURSES
import db from "../models/index.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { Course, Lesson } = db;

const fixPreviewLessons = async () => {
  try {
    console.log("🔧 Fixing preview lessons for ALL courses...\n");
    
    // Get all courses
    const courses = await Course.findAll({
      attributes: ['id', 'title', 'slug'],
      order: [['id', 'ASC']]
    });
    
    console.log(`📊 Found ${courses.length} courses\n`);
    
    let fixedCount = 0;
    let alreadyFixed = 0;
    let noLessons = 0;
    let errors = 0;
    
    const results = [];
    
    for (const course of courses) {
      console.log(`📚 Course ${course.id}: "${course.title}"`);
      
      try {
        // Get all lessons for this course
        const lessons = await Lesson.findAll({
          where: { course_id: course.id },
          order: [['order_index', 'ASC'], ['id', 'ASC']]
        });
        
        if (lessons.length === 0) {
          console.log(`   ⚠️ No lessons found`);
          results.push({
            courseId: course.id,
            courseTitle: course.title,
            status: 'NO_LESSONS',
            message: 'No lessons found for this course'
          });
          noLessons++;
          continue;
        }
        
        // Check if any lesson is already marked as preview
        const existingPreview = lessons.find(l => l.is_preview);
        
        if (existingPreview) {
          console.log(`   ✅ Already has preview: "${existingPreview.title}" (ID: ${existingPreview.id})`);
          results.push({
            courseId: course.id,
            courseTitle: course.title,
            status: 'ALREADY_HAS_PREVIEW',
            previewLessonId: existingPreview.id,
            previewLessonTitle: existingPreview.title,
            hasFile: !!existingPreview.file_url,
            hasVideo: !!existingPreview.video_url
          });
          alreadyFixed++;
        } else {
          // Mark the first lesson as preview
          const firstLesson = lessons[0];
          await firstLesson.update({ is_preview: true });
          
          console.log(`   🔧 Marked as preview: "${firstLesson.title}" (ID: ${firstLesson.id})`);
          
          results.push({
            courseId: course.id,
            courseTitle: course.title,
            status: 'FIXED',
            previewLessonId: firstLesson.id,
            previewLessonTitle: firstLesson.title,
            hasFile: !!firstLesson.file_url,
            hasVideo: !!firstLesson.video_url,
            action: 'Marked first lesson as preview'
          });
          fixedCount++;
          
          // Check if this lesson has a file
          if (!firstLesson.file_url) {
            console.log(`   ⚠️ Warning: Preview lesson has no file`);
          }
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        results.push({
          courseId: course.id,
          courseTitle: course.title,
          status: 'ERROR',
          error: error.message
        });
        errors++;
      }
      
      console.log('---');
    }
    
    // SUMMARY
    console.log("\n📈 SUMMARY:");
    console.log("=".repeat(50));
    console.log(`✅ Total courses: ${courses.length}`);
    console.log(`🔧 Fixed (added preview): ${fixedCount}`);
    console.log(`✅ Already had preview: ${alreadyFixed}`);
    console.log(`⚠️ No lessons: ${noLessons}`);
    console.log(`❌ Errors: ${errors}`);
    
    // VERIFICATION
    console.log("\n🔍 VERIFICATION:");
    console.log("=".repeat(50));
    
    const verifyCourses = await Course.findAll({
      include: [{
        model: Lesson,
        as: 'lessons',
        where: { is_preview: true },
        required: false,
        attributes: ['id', 'title', 'file_url']
      }]
    });
    
    const coursesWithPreview = verifyCourses.filter(c => c.lessons && c.lessons.length > 0);
    const coursesWithoutPreview = verifyCourses.filter(c => !c.lessons || c.lessons.length === 0);
    
    console.log(`✅ Courses with preview: ${coursesWithPreview.length}`);
    console.log(`⚠️ Courses without preview: ${coursesWithoutPreview.length}`);
    
    if (coursesWithoutPreview.length > 0) {
      console.log("\n📋 Courses WITHOUT preview (need attention):");
      coursesWithoutPreview.forEach(c => {
        console.log(`   - ${c.title} (ID: ${c.id})`);
      });
    }
    
    // Show some examples
    console.log("\n📋 SAMPLE RESULTS:");
    console.log("=".repeat(50));
    
    const sampleResults = results.slice(0, 10);
    sampleResults.forEach(result => {
      const statusIcon = 
        result.status === 'FIXED' ? '🔧' :
        result.status === 'ALREADY_HAS_PREVIEW' ? '✅' :
        result.status === 'NO_LESSONS' ? '⚠️' : '❌';
      
      console.log(`${statusIcon} Course ${result.courseId}: "${result.courseTitle}"`);
      if (result.previewLessonId) {
        console.log(`   Preview: "${result.previewLessonTitle}" (ID: ${result.previewLessonId})`);
        console.log(`   Has file: ${result.hasFile ? '✅' : '❌'}`);
      }
    });
    
    console.log("\n🌐 TEST ENDPOINTS:");
    console.log("=".repeat(50));
    console.log("After fixing, test these URLs:");
    console.log("1. For each course: GET /api/v1/courses/{courseId}/preview-lesson");
    console.log("2. Frontend: /courses/{slug}/preview");
    console.log("3. Teacher dashboard: Check preview functionality");
    
    console.log("\n🎉 Fix completed!");
    
    // Save results to file for reference
    const fs = await import('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const resultsFile = `preview-fix-results-${timestamp}.json`;
    
    fs.writeFileSync(
      resultsFile,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: {
          totalCourses: courses.length,
          fixed: fixedCount,
          alreadyFixed: alreadyFixed,
          noLessons: noLessons,
          errors: errors
        },
        results: results
      }, null, 2)
    );
    
    console.log(`\n📄 Results saved to: ${resultsFile}`);
    
  } catch (error) {
    console.error("❌ Error fixing preview lessons:", error);
    console.error("Stack:", error.stack);
  } finally {
    await db.sequelize.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
};

// Run the fix
fixPreviewLessons();