
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

// // ✅ COMPLETELY REWRITTEN: Approve Enrollment Function
// export const approveEnrollment = async (req, res) => {
//   let transaction;
  
//   try {
//     const { id } = req.params;
//     console.log(`🔄 APPROVING ENROLLMENT: Starting approval for enrollment ID: ${id}`);

//     // Start a transaction to ensure data consistency
//     transaction = await db.sequelize.transaction();

//     // Find the enrollment with associated student and course
//     const enrollment = await Enrollment.findByPk(id, {
//       include: [
//         { 
//           model: User, 
//           as: "student", 
//           attributes: ["id", "name", "email", "approval_status"] 
//         },
//         { 
//           model: Course, 
//           as: "course", 
//           attributes: ["id", "title", "description", "price"] 
//         },
//       ],
//       transaction
//     });

//     if (!enrollment) {
//       console.log(`❌ Enrollment not found with ID: ${id}`);
//       await transaction.rollback();
//       return res.status(404).json({ 
//         success: false, 
//         error: "Enrollment not found" 
//       });
//     }

//     console.log(`📝 Found enrollment:`, {
//       id: enrollment.id,
//       user_id: enrollment.user_id,
//       course_id: enrollment.course_id,
//       current_approval_status: enrollment.approval_status,
//       payment_status: enrollment.payment_status,
//       student_approved: enrollment.student?.approval_status
//     });

//     // ✅ Check if student is approved
//     if (enrollment.student?.approval_status !== "approved") {
//       console.log(`❌ Student not approved: ${enrollment.user_id}`);
//       await transaction.rollback();
//       return res.status(400).json({
//         success: false,
//         error: "Cannot approve enrollment: Student account is not approved"
//       });
//     }

//     // ✅ Check if enrollment is already approved
//     if (enrollment.approval_status === "approved") {
//       console.log(`ℹ️ Enrollment already approved: ${enrollment.id}`);
//       await transaction.rollback();
//       return res.status(400).json({
//         success: false,
//         error: "Enrollment is already approved"
//       });
//     }

//     // ✅ Update enrollment status
//     enrollment.approval_status = "approved";
//     enrollment.updatedAt = new Date();
//     await enrollment.save({ transaction });

//     console.log(`✅ Enrollment status updated to: ${enrollment.approval_status}`);

//     // ✅ Update or create UserCourseAccess
//     try {
//       let userCourseAccess = await UserCourseAccess.findOne({
//         where: { 
//           user_id: enrollment.user_id, 
//           course_id: enrollment.course_id 
//         },
//         transaction
//       });

//       if (userCourseAccess) {
//         userCourseAccess.approval_status = "approved";
//         userCourseAccess.updated_at = new Date();
//         await userCourseAccess.save({ transaction });
//         console.log(`✅ Updated existing UserCourseAccess record`);
//       } else {
//         userCourseAccess = await UserCourseAccess.create({
//           user_id: enrollment.user_id,
//           course_id: enrollment.course_id,
//           approval_status: "approved",
//           access_granted_at: new Date(),
//           created_at: new Date(),
//           updated_at: new Date()
//         }, { transaction });
//         console.log(`✅ Created new UserCourseAccess record`);
//       }
//     } catch (accessError) {
//       console.warn("⚠️ UserCourseAccess update warning:", accessError.message);
//       // Continue even if this fails - don't rollback the whole transaction
//     }

//     // ✅ Commit the transaction
//     await transaction.commit();

//     // ✅ Send approval email (outside transaction)
//     try {
//       if (enrollment.student && enrollment.course) {
//         const emailTemplate = courseEnrollmentApproved(enrollment.student, enrollment.course);
//         await sendEmail(enrollment.student.email, emailTemplate.subject, emailTemplate.html);
//         console.log(`📧 Approval email sent to: ${enrollment.student.email}`);
//       }
//     } catch (emailErr) {
//       console.warn("⚠️ Email sending warning:", emailErr.message);
//       // Don't fail the request if email fails
//     }

//     // ✅ Return success response
//     return res.json({ 
//       success: true, 
//       message: "Enrollment approved successfully",
//       enrollment: {
//         id: enrollment.id,
//         user_id: enrollment.user_id,
//         course_id: enrollment.course_id,
//         approval_status: enrollment.approval_status,
//         payment_status: enrollment.payment_status,
//         student: enrollment.student ? {
//           name: enrollment.student.name,
//           email: enrollment.student.email
//         } : null,
//         course: enrollment.course ? {
//           title: enrollment.course.title
//         } : null
//       }
//     });

//   } catch (err) {
//     // ✅ Rollback transaction on error
//     if (transaction) {
//       await transaction.rollback();
//       console.log("🔁 Transaction rolled back due to error");
//     }
    
//     console.error("❌ CRITICAL ERROR approving enrollment:", err);
//     return res.status(500).json({ 
//       success: false, 
//       error: "Failed to approve enrollment",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined
//     });
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

    return res.json({ success: true, message: "Student approved successfully", student });
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

    return res.json({ success: true, message: "Student rejected successfully", student });
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

/* ============================================================
   ✅ Approve Enrollment (Auto-Approve Student)
============================================================ */
export const approveEnrollment = async (req, res) => {
  let transaction;
  try {
    const { id } = req.params;
    console.log(`🔄 Approving enrollment ID: ${id}`);

    // Begin transaction
    transaction = await db.sequelize.transaction();

    const enrollment = await Enrollment.findByPk(id, {
      include: [
        { model: User, as: "student", attributes: ["id", "name", "email", "approval_status"] },
        { model: Course, as: "course", attributes: ["id", "title", "description", "price"] },
      ],
      transaction,
    });

    if (!enrollment) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: "Enrollment not found" });
    }

    // 🔹 Auto-approve student if not approved
    if (enrollment.student?.approval_status !== "approved") {
      console.log(`ℹ️ Auto-approving student ${enrollment.user_id}`);
      enrollment.student.approval_status = "approved";
      await enrollment.student.save({ transaction });
    }

    // 🔹 Check if enrollment already approved
    if (enrollment.approval_status === "approved") {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: "Enrollment is already approved",
      });
    }

    // 🔹 Update enrollment
    enrollment.approval_status = "approved";
    enrollment.updatedAt = new Date();
    await enrollment.save({ transaction });

    // 🔹 Update or create UserCourseAccess
    let userCourseAccess = await UserCourseAccess.findOne({
      where: { user_id: enrollment.user_id, course_id: enrollment.course_id },
      transaction,
    });

    if (userCourseAccess) {
      userCourseAccess.approval_status = "approved";
      userCourseAccess.updated_at = new Date();
      await userCourseAccess.save({ transaction });
      console.log("✅ Updated existing UserCourseAccess");
    } else {
      await UserCourseAccess.create(
        {
          user_id: enrollment.user_id,
          course_id: enrollment.course_id,
          approval_status: "approved",
          access_granted_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        { transaction }
      );
      console.log("✅ Created new UserCourseAccess");
    }

    // Commit
    await transaction.commit();

    // 🔹 Send email (after transaction)
    try {
      if (enrollment.student && enrollment.course) {
        const emailTemplate = courseEnrollmentApproved(enrollment.student, enrollment.course);
        await sendEmail(enrollment.student.email, emailTemplate.subject, emailTemplate.html);
        console.log(`📧 Sent approval email to ${enrollment.student.email}`);
      }
    } catch (emailErr) {
      console.warn("⚠️ Failed to send approval email:", emailErr.message);
    }

    return res.json({
      success: true,
      message: "Enrollment approved successfully",
      enrollment: {
        id: enrollment.id,
        approval_status: enrollment.approval_status,
        payment_status: enrollment.payment_status,
        student: enrollment.student ? {
          id: enrollment.student.id,
          name: enrollment.student.name,
          email: enrollment.student.email,
        } : null,
        course: enrollment.course ? {
          id: enrollment.course.id,
          title: enrollment.course.title,
        } : null,
      },
    });
  } catch (err) {
    if (transaction) await transaction.rollback();
    console.error("❌ Error approving enrollment:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to approve enrollment",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/* ============================================================
   ❌ Reject Enrollment
============================================================ */
export const rejectEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findByPk(id);

    if (!enrollment) {
      return res.status(404).json({ success: false, error: "Enrollment not found" });
    }

    enrollment.approval_status = "rejected";
    await enrollment.save();

    return res.json({ success: true, message: "Enrollment rejected successfully", enrollment });
  } catch (err) {
    console.error("❌ Error rejecting enrollment:", err);
    return res.status(500).json({ success: false, error: "Failed to reject enrollment" });
  }
};

/* ============================================================
   🧪 Debug Utility
============================================================ */
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
