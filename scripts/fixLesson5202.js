// scripts/fixLesson5202.js
import db from "../models/index.js";

const { Lesson, Course, sequelize } = db;

const fixLesson5202 = async () => {
  const transaction = await sequelize.transaction();
  
  try {
    console.log("🔧 Fixing Lesson 5202 issue...");
    
    // Check if lesson 5202 exists
    const lesson5202 = await Lesson.findByPk(5202, { transaction });
    
    if (lesson5202) {
      console.log("✅ Lesson 5202 exists. No fix needed.");
      console.log("Lesson details:", {
        id: lesson5202.id,
        title: lesson5202.title,
        course_id: lesson5202.course_id
      });
    } else {
      console.log("❌ Lesson 5202 does not exist. Creating a fallback...");
      
      // Find course 84
      const course84 = await Course.findByPk(84, { transaction });
      
      if (!course84) {
        console.log("❌ Course 84 not found either!");
        await transaction.rollback();
        return;
      }
      
      // Find the first lesson in course 84
      const firstLesson = await Lesson.findOne({
        where: { course_id: 84 },
        order: [["order_index", "ASC"]],
        transaction
      });
      
      if (firstLesson) {
        console.log(`💡 Found first lesson in course 84: ID ${firstLesson.id}, Title: "${firstLesson.title}"`);
        console.log(`📝 Update your frontend to use lesson ID ${firstLesson.id} instead of 5202`);
        
        // Create a duplicate lesson with ID 5202 for compatibility
        const newLesson = await Lesson.create({
          id: 5202,
          course_id: firstLesson.course_id,
          unit_id: firstLesson.unit_id,
          title: firstLesson.title,
          content: firstLesson.content,
          video_url: firstLesson.video_url,
          file_url: firstLesson.file_url,
          order_index: firstLesson.order_index,
          content_type: firstLesson.content_type,
          is_preview: firstLesson.is_preview,
          created_at: new Date(),
          updated_at: new Date()
        }, { transaction });
        
        console.log(`✅ Created lesson 5202 as a duplicate of lesson ${firstLesson.id}`);
      } else {
        console.log("❌ No lessons found in course 84");
      }
    }
    
    await transaction.commit();
    console.log("✅ Fix completed");
    
    process.exit(0);
  } catch (error) {
    await transaction.rollback();
    console.error("❌ Fix failed:", error);
    process.exit(1);
  }
};

fixLesson5202();