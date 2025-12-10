
// scripts/diagnoseLesson.js
import db from "../models/index.js";

const { Lesson, Course, Unit, User } = db;

const diagnoseLesson = async () => {
  try {
    console.log("🔍 Diagnosing Lesson 5202...");
    
    // Check if lesson exists
    const lesson = await Lesson.findByPk(5202, {
      include: [
        { model: Course, as: "course" },
        { model: Unit, as: "unit" }
      ]
    });
    
    if (!lesson) {
      console.log("❌ Lesson 5202 does NOT exist in the database!");
      
      // Find all lessons in course 84
      const lessonsInCourse84 = await Lesson.findAll({
        where: { course_id: 84 },
        order: [["order_index", "ASC"]],
        limit: 10
      });
      
      console.log(`\n📚 Found ${lessonsInCourse84.length} lessons in course 84:`);
      lessonsInCourse84.forEach((l, i) => {
        console.log(`${i+1}. ID: ${l.id}, Title: "${l.title}", Preview: ${l.is_preview}`);
      });
      
      // Suggest which lesson ID to use instead
      if (lessonsInCourse84.length > 0) {
        console.log(`\n💡 Try using lesson ID: ${lessonsInCourse84[0].id} instead`);
      }
    } else {
      console.log("✅ Lesson 5202 exists!");
      console.log("Lesson details:", {
        id: lesson.id,
        title: lesson.title,
        course_id: lesson.course_id,
        course_title: lesson.course?.title,
        unit_id: lesson.unit_id,
        unit_title: lesson.unit?.title,
        is_preview: lesson.is_preview,
        content_type: lesson.content_type,
        file_url: lesson.file_url ? "Exists" : "None",
        video_url: lesson.video_url ? "Exists" : "None"
      });
      
      // Check if course exists
      const course = await Course.findByPk(lesson.course_id);
      console.log("\n📘 Course details:", course ? {
        id: course.id,
        title: course.title,
        slug: course.slug,
        teacher_id: course.teacher_id
      } : "Course not found!");
    }
    
    // Check database connection
    console.log("\n🔗 Database connection test:");
    try {
      await db.sequelize.authenticate();
      console.log("✅ Database connection OK");
      
      // Count total lessons
      const totalLessons = await Lesson.count();
      console.log(`📊 Total lessons in database: ${totalLessons}`);
      
    } catch (dbError) {
      console.log("❌ Database connection failed:", dbError.message);
    }
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Diagnosis failed:", error);
    process.exit(1);
  }
};

diagnoseLesson();