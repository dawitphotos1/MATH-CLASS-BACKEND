// // controllers/enrollmentController.js
// import db from "../models/index.js";

// const { Enrollment, User, Course } = db;

// // ========================
// // Get enrollments by status
// // ========================
// export const getEnrollments = async (req, res) => {
//   try {
//     const { status } = req.query;

//     const whereClause = status ? { approval_status: status } : {};

//     const enrollments = await Enrollment.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: User,
//           as: "student",
//           attributes: ["id", "name", "email"],
//         },
//         {
//           model: Course,
//           as: "course",
//           attributes: ["id", "title"],
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     res.json({ enrollments });
//   } catch (err) {
//     console.error("❌ getEnrollments error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ========================
// // Approve enrollment
// // ========================
// export const approveEnrollment = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const enrollment = await Enrollment.findByPk(id, {
//       include: [
//         { model: User, as: "student", attributes: ["id", "name", "email"] },
//         { model: Course, as: "course", attributes: ["id", "title"] },
//       ],
//     });

//     if (!enrollment) {
//       return res.status(404).json({ error: "Enrollment not found" });
//     }

//     enrollment.approval_status = "approved";
//     await enrollment.save();

//     res.json({ success: true, enrollment });
//   } catch (err) {
//     console.error("❌ approveEnrollment error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ========================
// // Reject enrollment (optional)
// // ========================
// export const rejectEnrollment = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const enrollment = await Enrollment.findByPk(id);
//     if (!enrollment) {
//       return res.status(404).json({ error: "Enrollment not found" });
//     }

//     enrollment.approval_status = "rejected";
//     await enrollment.save();

//     res.json({ success: true, enrollment });
//   } catch (err) {
//     console.error("❌ rejectEnrollment error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };




import db from "../models/index.js";

const { Enrollment, User, Course } = db;

// ========================
// Create new enrollment request
// ========================
export const createEnrollment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user.id; // assuming authenticateToken middleware sets req.user

    if (!courseId) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    // Check if enrollment already exists for this student and course
    const existingEnrollment = await Enrollment.findOne({
      where: { courseId, studentId },
    });

    if (existingEnrollment) {
      return res
        .status(400)
        .json({
          error: "You have already requested enrollment for this course.",
        });
    }

    // Create a new enrollment with status 'pending'
    const newEnrollment = await Enrollment.create({
      courseId,
      studentId,
      approval_status: "pending",
    });

    res.status(201).json({ success: true, enrollment: newEnrollment });
  } catch (err) {
    console.error("❌ createEnrollment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ========================
// Get enrollments by status
// ========================
export const getEnrollments = async (req, res) => {
  try {
    const { status } = req.query;

    const whereClause = status ? { approval_status: status } : {};

    const enrollments = await Enrollment.findAll({
      where: whereClause,
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
    });

    res.json({ enrollments });
  } catch (err) {
    console.error("❌ getEnrollments error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ========================
// Approve enrollment
// ========================
export const approveEnrollment = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findByPk(id, {
      include: [
        { model: User, as: "student", attributes: ["id", "name", "email"] },
        { model: Course, as: "course", attributes: ["id", "title"] },
      ],
    });

    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    enrollment.approval_status = "approved";
    await enrollment.save();

    res.json({ success: true, enrollment });
  } catch (err) {
    console.error("❌ approveEnrollment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ========================
// Reject enrollment (optional)
// ========================
export const rejectEnrollment = async (req, res) => {
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findByPk(id);
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    enrollment.approval_status = "rejected";
    await enrollment.save();

    res.json({ success: true, enrollment });
  } catch (err) {
    console.error("❌ rejectEnrollment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ========================
// Check enrollment status for a user and course
// ========================
export const checkEnrollment = async (req, res) => {
  try {
    const userId = req.user.id; // from authenticateToken middleware
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      where: {
        studentId: userId,
        courseId,
      },
    });

    if (!enrollment) {
      return res.status(404).json({ enrolled: false });
    }

    res.json({ enrolled: true, approval_status: enrollment.approval_status });
  } catch (err) {
    console.error("❌ checkEnrollment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ========================
// Get enrollments of logged-in user
// ========================
export const getMyEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await Enrollment.findAll({
      where: { studentId: userId },
      include: [{ model: Course, as: "course", attributes: ["id", "title"] }],
      order: [["createdAt", "DESC"]],
    });

    res.json({ enrollments });
  } catch (err) {
    console.error("❌ getMyEnrollments error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ========================
// Get courses of logged-in user (approved enrollments only)
// ========================
export const getMyCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await Enrollment.findAll({
      where: { studentId: userId, approval_status: "approved" },
      include: [{ model: Course, as: "course", attributes: ["id", "title"] }],
      order: [["createdAt", "DESC"]],
    });

    const courses = enrollments.map((enr) => enr.course);

    res.json({ courses });
  } catch (err) {
    console.error("❌ getMyCourses error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ========================
// Get pending enrollments (for admin/teacher)
// ========================
export const getPendingEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { approval_status: "pending" },
      include: [
        { model: User, as: "student", attributes: ["id", "name", "email"] },
        { model: Course, as: "course", attributes: ["id", "title"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ enrollments });
  } catch (err) {
    console.error("❌ getPendingEnrollments error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ========================
// Get approved enrollments (for admin/teacher)
// ========================
export const getApprovedEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { approval_status: "approved" },
      include: [
        { model: User, as: "student", attributes: ["id", "name", "email"] },
        { model: Course, as: "course", attributes: ["id", "title"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ enrollments });
  } catch (err) {
    console.error("❌ getApprovedEnrollments error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
