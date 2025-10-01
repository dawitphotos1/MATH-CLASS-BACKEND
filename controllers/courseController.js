
// controllers/courseController.js
import { Course } from "../models/index.js";

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findByPk(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (req.user.role !== "admin" && course.teacher_id !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this course" });
    }

    await course.destroy(); // ✅ lessons + attachments auto-deleted

    res.json({ message: "Course and all related data deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Failed to delete course" });
  }
};
