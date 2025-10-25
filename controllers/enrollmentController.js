
// // controllers/enrollmentController.js
// import db from "../models/index.js";

// const { Enrollment, User, Course } = db;

// /* ======================================================
//    Create new enrollment request (manual, stays pending)
// ====================================================== */
// export const createEnrollment = async (req, res) => {
//   try {
//     const { courseId } = req.body;
//     const userId = req.user.id;

//     if (!courseId) {
//       return res.status(400).json({ error: "Course ID is required" });
//     }

//     const existingEnrollment = await Enrollment.findOne({
//       where: { course_id: courseId, user_id: userId },
//     });

//     if (existingEnrollment) {
//       return res.status(400).json({
//         success: false,
//         error: "You have already requested enrollment for this course.",
//       });
//     }

//     const newEnrollment = await Enrollment.create({
//       course_id: courseId,
//       user_id: userId,
//       approval_status: "pending",
//     });

//     res.status(201).json({ success: true, enrollment: newEnrollment });
//   } catch (err) {
//     console.error("❌ createEnrollment error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// /* ======================================================
//    Confirm enrollment after successful payment (auto-approved)
// ====================================================== */
// export const confirmEnrollmentAfterPayment = async (req, res) => {
//   try {
//     const { courseId } = req.body;
//     const userId = req.user.id;

//     if (!courseId) {
//       return res.status(400).json({ error: "Course ID is required" });
//     }

//     const existingEnrollment = await Enrollment.findOne({
//       where: { course_id: courseId, user_id: userId },
//     });

//     if (existingEnrollment) {
//       return res.json({
//         success: true,
//         enrollment: existingEnrollment,
//         message: "Already enrolled",
//       });
//     }

//     const newEnrollment = await Enrollment.create({
//       course_id: courseId,
//       user_id: userId,
//       approval_status: "approved",
//       payment_status: "paid",
//     });

//     res.status(201).json({ success: true, enrollment: newEnrollment });
//   } catch (err) {
//     console.error("❌ confirmEnrollmentAfterPayment error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// /* ======================================================
//    Get all enrollments by status (admin use)
// ====================================================== */
// export const getEnrollments = async (req, res) => {
//   try {
//     const { status } = req.query;
//     const whereClause = status ? { approval_status: status } : {};

//     const enrollments = await Enrollment.findAll({
//       where: whereClause,
//       include: [
//         { model: User, as: "student", attributes: ["id", "name", "email"] },
//         { model: Course, as: "course", attributes: ["id", "title"] },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     res.json({ success: true, enrollments });
//   } catch (err) {
//     console.error("❌ getEnrollments error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// /* ======================================================
//    Approve enrollment (manual admin/teacher action)
// ====================================================== */
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

// /* ======================================================
//    Reject enrollment
// ====================================================== */
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

// /* ======================================================
//    Check enrollment for current user and course
// ====================================================== */
// export const checkEnrollment = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { courseId } = req.params;

//     const enrollment = await Enrollment.findOne({
//       where: { user_id: userId, course_id: courseId },
//     });

//     if (!enrollment) {
//       return res.status(404).json({ enrolled: false });
//     }

//     res.json({
//       success: true,
//       enrolled: true,
//       approval_status: enrollment.approval_status,
//     });
//   } catch (err) {
//     console.error("❌ checkEnrollment error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// /* ======================================================
//    Get enrollments of logged-in user (includes course info)
// ====================================================== */
// export const getMyEnrollments = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const enrollments = await Enrollment.findAll({
//       where: { user_id: userId },
//       include: [
//         {
//           model: Course,
//           as: "course",
//           attributes: ["id", "title", "slug", "price"],
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     const formatted = enrollments.map((enr) => ({
//       id: enr.id,
//       approval_status: enr.approval_status,
//       payment_status: enr.payment_status,
//       enrolledAt: enr.createdAt,
//       course: enr.course,
//     }));

//     res.json({ success: true, enrollments: formatted });
//   } catch (err) {
//     console.error("❌ getMyEnrollments error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// /* ======================================================
//    Get my courses (supports ?status=approved|pending)
// ====================================================== */
// export const getMyCourses = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { status } = req.query;

//     const whereClause = { user_id: userId };
//     if (status) whereClause.approval_status = status;

//     const enrollments = await Enrollment.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: Course,
//           as: "course",
//           attributes: [
//             "id",
//             "title",
//             "slug",
//             "description",
//             "price",
//             "teacher_id",
//           ],
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     const courses = enrollments
//       .filter((enr) => enr.course)
//       .map((enr) => ({
//         ...enr.course.toJSON(),
//         approval_status: enr.approval_status,
//         enrolledAt: enr.createdAt,
//       }));

//     res.json({ success: true, courses });
//   } catch (err) {
//     console.error("❌ getMyCourses error:", err);
//     res.status(500).json({ error: "Failed to fetch courses" });
//   }
// };

// /* ======================================================
//    Get pending enrollments (admin use)
// ====================================================== */
// export const getPendingEnrollments = async (req, res) => {
//   try {
//     const enrollments = await Enrollment.findAll({
//       where: { approval_status: "pending" },
//       include: [
//         { model: User, as: "student", attributes: ["id", "name", "email"] },
//         { model: Course, as: "course", attributes: ["id", "title"] },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     res.json({ success: true, enrollments });
//   } catch (err) {
//     console.error("❌ getPendingEnrollments error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// /* ======================================================
//    Get approved enrollments (admin use)
// ====================================================== */
// export const getApprovedEnrollments = async (req, res) => {
//   try {
//     const enrollments = await Enrollment.findAll({
//       where: { approval_status: "approved" },
//       include: [
//         { model: User, as: "student", attributes: ["id", "name", "email"] },
//         { model: Course, as: "course", attributes: ["id", "title"] },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     res.json({ success: true, enrollments });
//   } catch (err) {
//     console.error("❌ getApprovedEnrollments error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// /* ======================================================
//    Check enrollment eligibility and status
// ====================================================== */
// export const checkEnrollmentEligibility = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { courseId } = req.params;

//     const user = await User.findByPk(userId);
//     if (!user || user.approval_status !== "approved") {
//       return res.json({
//         canEnroll: false,
//         reason: "Student account not approved yet",
//         userApproved: false,
//       });
//     }

//     const enrollment = await Enrollment.findOne({
//       where: { user_id: userId, course_id: courseId },
//     });

//     if (enrollment) {
//       return res.json({
//         canEnroll: false,
//         reason: "Already enrolled in this course",
//         enrollmentStatus: enrollment.approval_status,
//         userApproved: true,
//       });
//     }

//     return res.json({
//       canEnroll: true,
//       userApproved: true,
//       message: "Eligible for enrollment",
//     });
//   } catch (err) {
//     console.error("❌ checkEnrollmentEligibility error:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// };



// controllers/enrollmentController.js
import db from "../models/index.js";
import sendEmail from "../utils/sendEmail.js";
import courseEnrollmentApproved from "../utils/emails/courseEnrollmentApproved.js";
import courseEnrollmentRejected from "../utils/emails/courseEnrollmentRejected.js";

const { Enrollment, User, Course } = db;

// Helper function for async email sending
const sendEmailAsync = async (emailData) => {
  try {
    await sendEmail(emailData);
    console.log(`📧 Email sent successfully to ${emailData.to}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ Failed to send email to ${emailData.to}:`, error.message);
    return false;
  }
};

/* ======================================================
   Create new enrollment request
====================================================== */
export const createEnrollment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    const existingEnrollment = await Enrollment.findOne({
      where: { course_id: courseId, user_id: userId },
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: "You have already requested enrollment for this course.",
      });
    }

    const newEnrollment = await Enrollment.create({
      course_id: courseId,
      user_id: userId,
      approval_status: "pending",
    });

    res.status(201).json({ success: true, enrollment: newEnrollment });
  } catch (err) {
    console.error("❌ createEnrollment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ======================================================
   Confirm enrollment after successful payment
====================================================== */
export const confirmEnrollmentAfterPayment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({ error: "Course ID is required" });
    }

    const existingEnrollment = await Enrollment.findOne({
      where: { course_id: courseId, user_id: userId },
    });

    if (existingEnrollment) {
      return res.json({
        success: true,
        enrollment: existingEnrollment,
        message: "Already enrolled",
      });
    }

    const newEnrollment = await Enrollment.create({
      course_id: courseId,
      user_id: userId,
      approval_status: "approved",
      payment_status: "paid",
    });

    res.status(201).json({ success: true, enrollment: newEnrollment });
  } catch (err) {
    console.error("❌ confirmEnrollmentAfterPayment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ======================================================
   Get all enrollments by status
====================================================== */
export const getEnrollments = async (req, res) => {
  try {
    const { status } = req.query;
    const whereClause = status ? { approval_status: status } : {};

    const enrollments = await Enrollment.findAll({
      where: whereClause,
      include: [
        { model: User, as: "student", attributes: ["id", "name", "email"] },
        { model: Course, as: "course", attributes: ["id", "title"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, enrollments });
  } catch (err) {
    console.error("❌ getEnrollments error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ======================================================
   Approve enrollment + SEND EMAIL
====================================================== */
export const approveEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findByPk(id, {
      include: [
        { model: User, as: "student", attributes: ["id", "name", "email"] },
        { model: Course, as: "course", attributes: ["id", "title", "price"] },
      ],
    });

    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    enrollment.approval_status = "approved";
    await enrollment.save();

    // Send email async (don't wait)
    const htmlContent = courseEnrollmentApproved({
      studentName: enrollment.student.name,
      courseTitle: enrollment.course.title,
      coursePrice: enrollment.course.price,
    });

    sendEmailAsync({
      to: enrollment.student.email,
      subject: `✅ Enrollment Approved: ${enrollment.course.title}`,
      html: htmlContent,
    }).then(success => {
      if (success) {
        console.log(`📧 Enrollment approval email sent to ${enrollment.student.email}`);
      }
    });

    res.json({ 
      success: true, 
      message: "Enrollment approved successfully.",
      enrollment 
    });
  } catch (err) {
    console.error("❌ approveEnrollment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ======================================================
   Reject enrollment + SEND EMAIL
====================================================== */
export const rejectEnrollment = async (req, res) => {
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

    enrollment.approval_status = "rejected";
    await enrollment.save();

    // Send email async (don't wait)
    const htmlContent = courseEnrollmentRejected({
      studentName: enrollment.student.name,
      courseTitle: enrollment.course.title,
    });

    sendEmailAsync({
      to: enrollment.student.email,
      subject: `❌ Enrollment Rejected: ${enrollment.course.title}`,
      html: htmlContent,
    }).then(success => {
      if (success) {
        console.log(`📧 Enrollment rejection email sent to ${enrollment.student.email}`);
      }
    });

    res.json({ 
      success: true, 
      message: "Enrollment rejected successfully.",
      enrollment 
    });
  } catch (err) {
    console.error("❌ rejectEnrollment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ======================================================
   Check enrollment for current user and course
====================================================== */
export const checkEnrollment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      where: { user_id: userId, course_id: courseId },
    });

    if (!enrollment) {
      return res.status(404).json({ enrolled: false });
    }

    res.json({
      success: true,
      enrolled: true,
      approval_status: enrollment.approval_status,
    });
  } catch (err) {
    console.error("❌ checkEnrollment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ======================================================
   Get enrollments of logged-in user
====================================================== */
export const getMyEnrollments = async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await Enrollment.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "slug", "price"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const formatted = enrollments.map((enr) => ({
      id: enr.id,
      approval_status: enr.approval_status,
      payment_status: enr.payment_status,
      enrolledAt: enr.createdAt,
      course: enr.course,
    }));

    res.json({ success: true, enrollments: formatted });
  } catch (err) {
    console.error("❌ getMyEnrollments error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ======================================================
   Get my courses
====================================================== */
export const getMyCourses = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    const whereClause = { user_id: userId };
    if (status) whereClause.approval_status = status;

    const enrollments = await Enrollment.findAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: "course",
          attributes: [
            "id",
            "title",
            "slug",
            "description",
            "price",
            "teacher_id",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const courses = enrollments
      .filter((enr) => enr.course)
      .map((enr) => ({
        ...enr.course.toJSON(),
        approval_status: enr.approval_status,
        enrolledAt: enr.createdAt,
      }));

    res.json({ success: true, courses });
  } catch (err) {
    console.error("❌ getMyCourses error:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

/* ======================================================
   Get pending enrollments
====================================================== */
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

    res.json({ success: true, enrollments });
  } catch (err) {
    console.error("❌ getPendingEnrollments error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ======================================================
   Get approved enrollments
====================================================== */
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

    res.json({ success: true, enrollments });
  } catch (err) {
    console.error("❌ getApprovedEnrollments error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/* ======================================================
   Check enrollment eligibility and status
====================================================== */
export const checkEnrollmentEligibility = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const user = await User.findByPk(userId);
    if (!user || user.approval_status !== "approved") {
      return res.json({
        canEnroll: false,
        reason: "Student account not approved yet",
        userApproved: false,
      });
    }

    const enrollment = await Enrollment.findOne({
      where: { user_id: userId, course_id: courseId },
    });

    if (enrollment) {
      return res.json({
        canEnroll: false,
        reason: "Already enrolled in this course",
        enrollmentStatus: enrollment.approval_status,
        userApproved: true,
      });
    }

    return res.json({
      canEnroll: true,
      userApproved: true,
      message: "Eligible for enrollment",
    });
  } catch (err) {
    console.error("❌ checkEnrollmentEligibility error:", err);
    res.status(500).json({ error: "Server error" });
  }
};