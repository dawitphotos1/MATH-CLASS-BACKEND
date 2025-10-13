// // controllers/adminController.js
// import db from "../models/index.js";
// const { User, Enrollment, Course, UserCourseAccess } = db;

// /**
//  * Get students by approval status
//  * @route GET /admin/students?status=pending|approved|rejected
//  */
// export const getStudentsByStatus = async (req, res) => {
//   try {
//     const { status } = req.query;

//     if (!status || !["pending", "approved", "rejected"].includes(status)) {
//       return res.status(400).json({ error: "Invalid or missing status" });
//     }

//     const students = await User.findAll({
//       where: { role: "student", approval_status: status },
//       attributes: [
//         "id",
//         "name",
//         "email",
//         "subject",
//         "approval_status",
//         "updatedAt",
//       ],
//     });

//     return res.json({ students });
//   } catch (err) {
//     console.error("❌ Error fetching students:", err);
//     return res.status(500).json({ error: "Failed to fetch students" });
//   }
// };

// /**
//  * Get enrollments by status - UPDATED TO SHOW PAID ENROLLMENTS
//  * @route GET /admin/enrollments?status=pending|approved|rejected
//  */
// export const getEnrollmentsByStatus = async (req, res) => {
//   try {
//     const { status } = req.query;

//     let whereCondition = {};
    
//     if (status && ["pending", "approved", "rejected"].includes(status)) {
//       whereCondition.approval_status = status;
//     }
    
//     // Only show paid enrollments - THIS IS THE KEY CHANGE
//     whereCondition.payment_status = "paid";

//     const enrollments = await Enrollment.findAll({
//       where: whereCondition,
//       include: [
//         {
//           model: User,
//           as: "student",
//           attributes: ["id", "name", "email"],
//         },
//         {
//           model: Course,
//           as: "course",
//           attributes: ["id", "title", "price"],
//         },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     return res.json({ enrollments });
//   } catch (err) {
//     console.error("❌ Error fetching enrollments:", err);
//     return res.status(500).json({ error: "Failed to fetch enrollments" });
//   }
// };

// /**
//  * Approve an enrollment
//  * @route PATCH /admin/enrollments/:id/approve
//  */
// export const approveEnrollment = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const enrollment = await Enrollment.findByPk(id);
//     if (!enrollment) {
//       return res.status(404).json({ error: "Enrollment not found" });
//     }

//     enrollment.approval_status = "approved";
//     await enrollment.save();

//     // Also update UserCourseAccess if it exists
//     await UserCourseAccess.update(
//       { approval_status: "approved" },
//       { where: { user_id: enrollment.user_id, course_id: enrollment.course_id } }
//     );

//     return res.json({ message: "Enrollment approved", enrollment });
//   } catch (err) {
//     console.error("❌ Error approving enrollment:", err);
//     return res.status(500).json({ error: "Failed to approve enrollment" });
//   }
// };

// /**
//  * Reject an enrollment
//  * @route PATCH /admin/enrollments/:id/reject
//  */
// export const rejectEnrollment = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const enrollment = await Enrollment.findByPk(id);
//     if (!enrollment) {
//       return res.status(404).json({ error: "Enrollment not found" });
//     }

//     enrollment.approval_status = "rejected";
//     await enrollment.save();

//     // Also update UserCourseAccess if it exists
//     await UserCourseAccess.update(
//       { approval_status: "rejected" },
//       { where: { user_id: enrollment.user_id, course_id: enrollment.course_id } }
//     );

//     return res.json({ message: "Enrollment rejected", enrollment });
//   } catch (err) {
//     console.error("❌ Error rejecting enrollment:", err);
//     return res.status(500).json({ error: "Failed to reject enrollment" });
//   }
// };

// /**
//  * Approve a student
//  * @route PATCH /admin/students/:id/approve
//  */
// export const approveStudent = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const student = await User.findByPk(id);
//     if (!student || student.role !== "student") {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     student.approval_status = "approved";
//     await student.save();

//     return res.json({ message: "Student approved", student });
//   } catch (err) {
//     console.error("❌ Error approving student:", err);
//     return res.status(500).json({ error: "Failed to approve student" });
//   }
// };

// /**
//  * Reject a student
//  * @route PATCH /admin/students/:id/reject
//  */
// export const rejectStudent = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const student = await User.findByPk(id);
//     if (!student || student.role !== "student") {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     student.approval_status = "rejected";
//     await student.save();

//     return res.json({ message: "Student rejected", student });
//   } catch (err) {
//     console.error("❌ Error rejecting student:", err);
//     return res.status(500).json({ error: "Failed to reject student" });
//   }
// };




// controllers/adminController.js
import db from "../models/index.js";
const { User, Enrollment, Course, UserCourseAccess } = db;

/**
 * Get students by approval status
 * @route GET /admin/students?status=pending|approved|rejected
 */
export const getStudentsByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid or missing status" });
    }

    const students = await User.findAll({
      where: { role: "student", approval_status: status },
      attributes: ["id", "name", "email", "subject", "approval_status", "updatedAt"],
    });

    return res.json({ students });
  } catch (err) {
    console.error("❌ Error fetching students:", err);
    return res.status(500).json({ error: "Failed to fetch students" });
  }
};

/**
 * Get enrollments by status - ENHANCED VERSION
 * @route GET /admin/enrollments?status=pending|approved|rejected
 */
export const getEnrollmentsByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    let whereCondition = {};
    
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      whereCondition.approval_status = status;
    }
    
    // Only show paid enrollments
    whereCondition.payment_status = "paid";

    console.log("🔍 Fetching enrollments with condition:", whereCondition);

    const enrollments = await Enrollment.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "student",
          attributes: ["id", "name", "email"],
        },
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "price"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    console.log(`✅ Found ${enrollments.length} enrollments for admin`);

    return res.json({ enrollments });
  } catch (err) {
    console.error("❌ Error fetching enrollments:", err);
    return res.status(500).json({ error: "Failed to fetch enrollments" });
  }
};

/**
 * Approve an enrollment
 * @route PATCH /admin/enrollments/:id/approve
 */
export const approveEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findByPk(id);
    
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    enrollment.approval_status = "approved";
    await enrollment.save();

    // Also update UserCourseAccess if it exists
    await UserCourseAccess.update(
      { approval_status: "approved" },
      { where: { user_id: enrollment.user_id, course_id: enrollment.course_id } }
    );

    // Send approval email to student
    try {
      const user = await User.findByPk(enrollment.user_id);
      const course = await Course.findByPk(enrollment.course_id);
      
      if (user && course) {
        const emailTemplate = courseEnrollmentApproved(user, course);
        await sendEmail(user.email, emailTemplate.subject, emailTemplate.html);
        console.log("📧 Approval email sent to:", user.email);
      }
    } catch (emailErr) {
      console.warn("⚠️ Failed to send approval email:", emailErr.message);
    }

    return res.json({ message: "Enrollment approved", enrollment });
  } catch (err) {
    console.error("❌ Error approving enrollment:", err);
    return res.status(500).json({ error: "Failed to approve enrollment" });
  }
};

/**
 * Reject an enrollment
 * @route PATCH /admin/enrollments/:id/reject
 */
export const rejectEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findByPk(id);
    
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    enrollment.approval_status = "rejected";
    await enrollment.save();

    return res.json({ message: "Enrollment rejected", enrollment });
  } catch (err) {
    console.error("❌ Error rejecting enrollment:", err);
    return res.status(500).json({ error: "Failed to reject enrollment" });
  }
};

/**
 * Debug endpoint to see all enrollments
 */
export const debugEnrollments = async (req, res) => {
  try {
    console.log("🔍 Checking database for all enrollments...");
    
    const allEnrollments = await Enrollment.findAll({
      include: [
        {
          model: User,
          as: "student",
          attributes: ["id", "name", "email", "role"]
        },
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "price"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    console.log("📊 Database Results:");
    console.log("- Total enrollments count:", allEnrollments.length);
    
    allEnrollments.forEach(enrollment => {
      console.log(`🎯 Enrollment: ${enrollment.id}`, {
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        payment_status: enrollment.payment_status,
        approval_status: enrollment.approval_status,
        student: enrollment.student?.email,
        course: enrollment.course?.title
      });
    });

    res.json({
      success: true,
      count: allEnrollments.length,
      enrollments: allEnrollments
    });
  } catch (error) {
    console.error("❌ Debug route error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Student approval functions remain the same...
export const approveStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findByPk(id);
    
    if (!student || student.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    student.approval_status = "approved";
    await student.save();

    return res.json({ message: "Student approved", student });
  } catch (err) {
    console.error("❌ Error approving student:", err);
    return res.status(500).json({ error: "Failed to approve student" });
  }
};

export const rejectStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findByPk(id);
    
    if (!student || student.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    student.approval_status = "rejected";
    await student.save();

    return res.json({ message: "Student rejected", student });
  } catch (err) {
    console.error("❌ Error rejecting student:", err);
    return res.status(500).json({ error: "Failed to reject student" });
  }
};