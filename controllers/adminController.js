// // controllers/adminController.js
// import db from "../models/index.js";
// import sendEmail from "../utils/sendEmail.js";
// import courseEnrollmentApproved from "../utils/emails/courseEnrollmentApproved.js";

// const { User, Enrollment, Course, UserCourseAccess } = db;

// /* ============================================================
//    👩‍🎓 STUDENT MANAGEMENT
// ============================================================ */
// export const getStudentsByStatus = async (req, res) => {
//   try {
//     const { status } = req.query;

//     if (!status || !["pending", "approved", "rejected"].includes(status)) {
//       return res.status(400).json({ error: "Invalid or missing status" });
//     }

//     const students = await User.findAll({
//       where: { role: "student", approval_status: status },
//       attributes: ["id", "name", "email", "subject", "approval_status", "updatedAt"],
//       order: [["createdAt", "DESC"]],
//     });

//     return res.json({ success: true, students });
//   } catch (err) {
//     console.error("❌ Error fetching students:", err);
//     return res.status(500).json({ success: false, error: "Failed to fetch students" });
//   }
// };

// export const approveStudent = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const student = await User.findByPk(id);

//     if (!student || student.role !== "student") {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     student.approval_status = "approved";
//     await student.save();

//     return res.json({ success: true, message: "Student approved", student });
//   } catch (err) {
//     console.error("❌ Error approving student:", err);
//     return res.status(500).json({ success: false, error: "Failed to approve student" });
//   }
// };

// export const rejectStudent = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const student = await User.findByPk(id);

//     if (!student || student.role !== "student") {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     student.approval_status = "rejected";
//     await student.save();

//     return res.json({ success: true, message: "Student rejected", student });
//   } catch (err) {
//     console.error("❌ Error rejecting student:", err);
//     return res.status(500).json({ success: false, error: "Failed to reject student" });
//   }
// };

// /* ============================================================
//    🎓 ENROLLMENT MANAGEMENT
// ============================================================ */
// export const getEnrollmentsByStatus = async (req, res) => {
//   try {
//     const { status } = req.query;

//     const whereCondition = {};
//     if (status && ["pending", "approved", "rejected"].includes(status)) {
//       whereCondition.approval_status = status;
//     }

//     const enrollments = await Enrollment.findAll({
//       where: whereCondition,
//       include: [
//         { model: User, as: "student", attributes: ["id", "name", "email"] },
//         { model: Course, as: "course", attributes: ["id", "title", "price"] },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     return res.json({ success: true, count: enrollments.length, enrollments });
//   } catch (err) {
//     console.error("❌ Error fetching enrollments:", err);
//     return res.status(500).json({ success: false, error: "Failed to fetch enrollments" });
//   }
// };

// export const approveEnrollment = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const enrollment = await Enrollment.findByPk(id, {
//       include: [
//         { model: User, as: "student" },
//         { model: Course, as: "course" },
//       ],
//     });

//     if (!enrollment) {
//       return res.status(404).json({ success: false, error: "Enrollment not found" });
//     }

//     enrollment.approval_status = "approved";
//     await enrollment.save();

//     if (UserCourseAccess) {
//       await UserCourseAccess.update(
//         { approval_status: "approved" },
//         { where: { user_id: enrollment.user_id, course_id: enrollment.course_id } }
//       );
//     }

//     try {
//       const emailTemplate = courseEnrollmentApproved(enrollment.student, enrollment.course);
//       await sendEmail(enrollment.student.email, emailTemplate.subject, emailTemplate.html);
//     } catch (emailErr) {
//       console.warn("⚠️ Failed to send approval email:", emailErr.message);
//     }

//     return res.json({ success: true, message: "Enrollment approved", enrollment });
//   } catch (err) {
//     console.error("❌ Error approving enrollment:", err);
//     return res.status(500).json({ success: false, error: "Failed to approve enrollment" });
//   }
// };

// export const rejectEnrollment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const enrollment = await Enrollment.findByPk(id);

//     if (!enrollment) {
//       return res.status(404).json({ success: false, error: "Enrollment not found" });
//     }

//     enrollment.approval_status = "rejected";
//     await enrollment.save();

//     return res.json({ success: true, message: "Enrollment rejected", enrollment });
//   } catch (err) {
//     console.error("❌ Error rejecting enrollment:", err);
//     return res.status(500).json({ success: false, error: "Failed to reject enrollment" });
//   }
// };

// export const debugEnrollments = async (req, res) => {
//   try {
//     const all = await Enrollment.findAll({
//       include: [
//         { model: User, as: "student", attributes: ["id", "name", "email"] },
//         { model: Course, as: "course", attributes: ["id", "title", "price"] },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     const stats = {
//       total: all.length,
//       paid: all.filter((e) => e.payment_status === "paid").length,
//       pending: all.filter((e) => e.approval_status === "pending").length,
//       paidPending: all.filter(
//         (e) => e.payment_status === "paid" && e.approval_status === "pending"
//       ).length,
//     };

//     return res.json({ success: true, summary: stats, enrollments: all });
//   } catch (err) {
//     console.error("❌ Debug enrollments error:", err);
//     return res.status(500).json({ success: false, error: "Debug failed" });
//   }
// };




// controllers/adminController.js
import db from "../models/index.js";
import sendEmail from "../utils/sendEmail.js";
import courseEnrollmentApproved from "../utils/emails/courseEnrollmentApproved.js";

const { User, Enrollment, Course, UserCourseAccess } = db;

/* ============================================================
   👩‍🎓 STUDENT MANAGEMENT
============================================================ */
export const getStudentsByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid or missing status" });
    }

    const students = await User.findAll({
      where: { role: "student", approval_status: status },
      attributes: ["id", "name", "email", "subject", "approval_status", "updatedAt"],
      order: [["createdAt", "DESC"]],
    });

    return res.json({ success: true, students });
  } catch (err) {
    console.error("❌ Error fetching students:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch students" });
  }
};

export const approveStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findByPk(id);

    if (!student || student.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    student.approval_status = "approved";
    await student.save();

    return res.json({ success: true, message: "Student approved", student });
  } catch (err) {
    console.error("❌ Error approving student:", err);
    return res.status(500).json({ success: false, error: "Failed to approve student" });
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

    return res.json({ success: true, message: "Student rejected", student });
  } catch (err) {
    console.error("❌ Error rejecting student:", err);
    return res.status(500).json({ success: false, error: "Failed to reject student" });
  }
};

/* ============================================================
   🎓 ENROLLMENT MANAGEMENT
============================================================ */
export const getEnrollmentsByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    const whereCondition = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      whereCondition.approval_status = status;
    }

    const enrollments = await Enrollment.findAll({
      where: whereCondition,
      include: [
        { model: User, as: "student", attributes: ["id", "name", "email"] },
        { model: Course, as: "course", attributes: ["id", "title", "price"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json({ success: true, count: enrollments.length, enrollments });
  } catch (err) {
    console.error("❌ Error fetching enrollments:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch enrollments" });
  }
};

// ✅ FIXED: Approve Enrollment Function
export const approveEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 Approving enrollment ID: ${id}`);

    const enrollment = await Enrollment.findByPk(id, {
      include: [
        { model: User, as: "student" },
        { model: Course, as: "course" },
      ],
    });

    if (!enrollment) {
      console.log(`❌ Enrollment not found: ${id}`);
      return res.status(404).json({ success: false, error: "Enrollment not found" });
    }

    console.log(`📝 Found enrollment:`, {
      id: enrollment.id,
      user_id: enrollment.user_id,
      course_id: enrollment.course_id,
      current_status: enrollment.approval_status
    });

    // ✅ FIX: Update enrollment status
    enrollment.approval_status = "approved";
    await enrollment.save();

    console.log(`✅ Enrollment approved: ${enrollment.id}`);

    // ✅ FIX: Update UserCourseAccess if it exists
    try {
      // Check if UserCourseAccess model exists and update
      const userCourseAccess = await UserCourseAccess.findOne({
        where: { 
          user_id: enrollment.user_id, 
          course_id: enrollment.course_id 
        }
      });

      if (userCourseAccess) {
        userCourseAccess.approval_status = "approved";
        await userCourseAccess.save();
        console.log(`✅ UserCourseAccess updated for user ${enrollment.user_id}`);
      } else {
        // Create new UserCourseAccess record if it doesn't exist
        await UserCourseAccess.create({
          user_id: enrollment.user_id,
          course_id: enrollment.course_id,
          approval_status: "approved",
          access_granted_at: new Date()
        });
        console.log(`✅ Created new UserCourseAccess for user ${enrollment.user_id}`);
      }
    } catch (accessError) {
      console.warn("⚠️ Could not update UserCourseAccess:", accessError.message);
      // Don't fail the whole request if this fails
    }

    // ✅ Send approval email
    try {
      if (enrollment.student && enrollment.course) {
        const emailTemplate = courseEnrollmentApproved(enrollment.student, enrollment.course);
        await sendEmail(enrollment.student.email, emailTemplate.subject, emailTemplate.html);
        console.log(`📧 Approval email sent to: ${enrollment.student.email}`);
      }
    } catch (emailErr) {
      console.warn("⚠️ Failed to send approval email:", emailErr.message);
    }

    return res.json({ 
      success: true, 
      message: "Enrollment approved successfully",
      enrollment: {
        id: enrollment.id,
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        approval_status: enrollment.approval_status,
        student: enrollment.student ? {
          name: enrollment.student.name,
          email: enrollment.student.email
        } : null,
        course: enrollment.course ? {
          title: enrollment.course.title
        } : null
      }
    });

  } catch (err) {
    console.error("❌ Error approving enrollment:", err);
    return res.status(500).json({ 
      success: false, 
      error: "Failed to approve enrollment",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

export const rejectEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findByPk(id);

    if (!enrollment) {
      return res.status(404).json({ success: false, error: "Enrollment not found" });
    }

    enrollment.approval_status = "rejected";
    await enrollment.save();

    return res.json({ success: true, message: "Enrollment rejected", enrollment });
  } catch (err) {
    console.error("❌ Error rejecting enrollment:", err);
    return res.status(500).json({ success: false, error: "Failed to reject enrollment" });
  }
};

export const debugEnrollments = async (req, res) => {
  try {
    const all = await Enrollment.findAll({
      include: [
        { model: User, as: "student", attributes: ["id", "name", "email"] },
        { model: Course, as: "course", attributes: ["id", "title", "price"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    const stats = {
      total: all.length,
      paid: all.filter((e) => e.payment_status === "paid").length,
      pending: all.filter((e) => e.approval_status === "pending").length,
      paidPending: all.filter(
        (e) => e.payment_status === "paid" && e.approval_status === "pending"
      ).length,
    };

    return res.json({ success: true, summary: stats, enrollments: all });
  } catch (err) {
    console.error("❌ Debug enrollments error:", err);
    return res.status(500).json({ success: false, error: "Debug failed" });
  }
};

// ✅ ADDED: Debug function to test approval
export const testApproval = async (req, res) => {
  try {
    const { enrollmentId } = req.body;
    console.log("🧪 Testing approval for:", enrollmentId);
    
    const enrollment = await Enrollment.findByPk(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }
    
    return res.json({
      success: true,
      enrollment: {
        id: enrollment.id,
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        approval_status: enrollment.approval_status,
        payment_status: enrollment.payment_status
      }
    });
  } catch (error) {
    console.error("Test approval error:", error);
    return res.status(500).json({ error: error.message });
  }
};