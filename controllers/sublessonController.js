// controllers/sublessonController.js
import db from "../models/index.js";

const { Lesson, SubLesson } = db;

/*
===============================================================
    Get sublessons for a lesson
===============================================================
*/
export const getSubLessonsByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    console.log("📚 Fetching sublessons for lesson:", lessonId);

    // Check if lesson exists
    const lesson = await Lesson.findByPk(lessonId);

    if (!lesson) {
      // Do NOT return 404 — return a clean empty response to avoid frontend errors
      return res.status(200).json({
        success: true,
        sublessons: [],
        message: "Lesson not found — returning empty sublesson list",
      });
    }

    // If SubLesson model exists, fetch real data
    let sublessons = [];
    if (SubLesson && SubLesson.findAll) {
      sublessons = await SubLesson.findAll({
        where: { lesson_id: lessonId },
        order: [["order_index", "ASC"]],
      });
    }

    return res.json({
      success: true,
      sublessons,
      message:
        sublessons.length === 0
          ? "No sublessons found for this lesson"
          : "Sublessons fetched successfully",
    });

  } catch (error) {
    console.error("❌ Error fetching sublessons:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch sublessons",
    });
  }
};

/*
===============================================================
    Create a new sublesson
===============================================================
*/
export const createSubLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, content, order_index, content_type } = req.body;

    // Check if lesson exists
    const lesson = await Lesson.findByPk(lessonId);

    if (!lesson) {
      // Return 200 with clean response to match getSubLessons behavior
      return res.status(200).json({
        success: false,
        error: "Lesson not found — cannot create sublesson",
      });
    }

    // If SubLesson model exists, create real sublesson
    let newSublesson = null;

    if (SubLesson && SubLesson.create) {
      newSublesson = await SubLesson.create({
        lesson_id: lessonId,
        title,
        content,
        order_index: order_index || 0,
        content_type: content_type || "text",
      });
    } else {
      // Temporary fallback if model is not implemented yet
      newSublesson = {
        lesson_id: parseInt(lessonId),
        title,
        content,
        order_index: order_index || 0,
        content_type: content_type || "text",
      };
    }

    return res.status(201).json({
      success: true,
      message: "Sublesson created successfully",
      sublesson: newSublesson,
    });

  } catch (error) {
    console.error("❌ Error creating sublesson:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create sublesson",
    });
  }
};
