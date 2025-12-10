// scripts/checkLessons.js
import db from "../models/index.js";

const { Lesson, Course } = db;

const checkLessonIssues = async () => {
  try {
    console.log("🔍 Checking for lesson issues...");
    
    // Check lesson 5202
    const lesson5202 = await Lesson.findByPk(5202, {
      include: [{ model: Course, as: "course" }]
    });
    
    console.log("Lesson 5202:", lesson5202 ? {
      id: lesson5202.id,
      title: lesson5202.title,
      courseId: lesson5202.course_id,
      courseTitle: lesson5202.course?.title,
      isPreview: lesson5202.is_preview,
      fileUrl: lesson5202.file_url,
      videoUrl: lesson5202.video_url
    } : "NOT FOUND");
    
    // Check course 84 preview lessons
    const course84 = await Course.findByPk(84, {
      include: [{ 
        model: Lesson, 
        as: "lessons",
        where: { is_preview: true },
        required: false
      }]
    });
    
    console.log("\nCourse 84:", course84 ? {
      id: course84.id,
      title: course84.title,
      previewLessons: course84.lessons?.length || 0,
      lessons: course84.lessons?.map(l => ({
        id: l.id,
        title: l.title,
        isPreview: l.is_preview
      }))
    } : "NOT FOUND");
    
    // Count all lessons for course 84
    const allCourse84Lessons = await Lesson.findAll({
      where: { course_id: 84 },
      order: [["order_index", "ASC"]],
      limit: 5
    });
    
    console.log("\nFirst 5 lessons in course 84:");
    allCourse84Lessons.forEach(lesson => {
      console.log(`- ${lesson.id}: ${lesson.title} (preview: ${lesson.is_preview})`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

checkLessonIssues();