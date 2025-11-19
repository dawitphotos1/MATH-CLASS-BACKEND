// controllers/teacherController.js
import db from "../models/index.js";
const { Course, Unit, Lesson, User, Enrollment } = db;

/**
 * Get teacher dashboard statistics
 */
export const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Get teacher's courses
    const courses = await Course.findAll({
      where: { teacher_id: teacherId },
      attributes: ["id", "title", "created_at"],
      include: [
        {
          model: Unit,
          as: "units",
          attributes: ["id"],
        },
        {
          model: Lesson,
          as: "lessons",
          attributes: ["id"],
        },
        {
          model: Enrollment,
          as: "enrollments",
          attributes: ["id"],
        },
      ],
    });

    // Calculate statistics
    const totalCourses = courses.length;
    const totalUnits = courses.reduce(
      (sum, course) => sum + (course.units?.length || 0),
      0
    );
    const totalLessons = courses.reduce(
      (sum, course) => sum + (course.lessons?.length || 0),
      0
    );
    const totalStudents = courses.reduce(
      (sum, course) => sum + (course.enrollments?.length || 0),
      0
    );

    // Get recent enrollments for teacher's courses
    const courseIds = courses.map((course) => course.id);
    const recentEnrollments = await Enrollment.findAll({
      where: { course_id: courseIds },
      include: [
        {
          model: User,
          as: "student",
          attributes: ["id", "name", "email"],
        },
        {
          model: Course,
          as: "course",
          attributes: ["id", "title"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    res.json({
      success: true,
      dashboard: {
        statistics: {
          totalCourses,
          totalUnits,
          totalLessons,
          totalStudents,
        },
        recentEnrollments,
        courses: courses.map((course) => ({
          id: course.id,
          title: course.title,
          units: course.units?.length || 0,
          lessons: course.lessons?.length || 0,
          students: course.enrollments?.length || 0,
          created_at: course.created_at,
        })),
      },
    });
  } catch (error) {
    console.error("❌ Error fetching teacher dashboard:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard data",
    });
  }
};

/**
 * Get course analytics for teacher
 */
export const getCourseAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const teacherId = req.user.id;

    // Verify course belongs to teacher
    const course = await Course.findOne({
      where: { id: courseId, teacher_id: teacherId },
      include: [
        {
          model: Unit,
          as: "units",
          attributes: ["id", "title"],
          include: [
            {
              model: Lesson,
              as: "lessons",
              attributes: ["id", "title"],
            },
          ],
        },
      ],
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found or access denied",
      });
    }

    // Get enrollment stats
    const enrollments = await Enrollment.findAll({
      where: { course_id: courseId },
      attributes: ["approval_status", "payment_status"],
    });

    const enrollmentStats = {
      total: enrollments.length,
      approved: enrollments.filter((e) => e.approval_status === "approved")
        .length,
      pending: enrollments.filter((e) => e.approval_status === "pending")
        .length,
      rejected: enrollments.filter((e) => e.approval_status === "rejected")
        .length,
      paid: enrollments.filter((e) => e.payment_status === "paid").length,
    };

    res.json({
      success: true,
      analytics: {
        course: {
          id: course.id,
          title: course.title,
          units: course.units?.length || 0,
          lessons:
            course.units?.reduce(
              (sum, unit) => sum + (unit.lessons?.length || 0),
              0
            ) || 0,
        },
        enrollments: enrollmentStats,
        structure: course.units,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching course analytics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch analytics",
    });
  }
};
