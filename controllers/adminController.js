
// // controllers/adminController.js
// import db, { sequelize } from "../models/index.js";
// const { User, Enrollment, Course, UserCourseAccess } = db;

// /* ============================================================
//    👩‍🎓 STUDENTS - INSTANT APPROVAL (No Email Dependencies)
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

// /* ============================================================
//    ✅ APPROVE STUDENT - INSTANT RESPONSE (No Email)
// ============================================================ */
// export const approveStudent = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const student = await User.findByPk(id);

//     if (!student || student.role !== "student") {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     // Update student status only - SUPER FAST
//     student.approval_status = "approved";
//     await student.save();

//     console.log(`✅ Student ${student.name} (${student.email}) approved instantly`);

//     // 🚀 INSTANT RESPONSE - No email delays
//     return res.json({
//       success: true,
//       message: "Student approved successfully! The student can now log in.",
//       student: {
//         id: student.id,
//         name: student.name,
//         email: student.email,
//         approval_status: student.approval_status,
//       }
//     });

//   } catch (err) {
//     console.error("❌ Error approving student:", err);
//     return res.status(500).json({ 
//       success: false, 
//       error: "Failed to approve student: " + err.message 
//     });
//   }
// };

// /* ============================================================
//    ❌ REJECT STUDENT - INSTANT RESPONSE (No Email)
// ============================================================ */
// export const rejectStudent = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const student = await User.findByPk(id);

//     if (!student || student.role !== "student") {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     student.approval_status = "rejected";
//     await student.save();

//     console.log(`❌ Student ${student.name} (${student.email}) rejected instantly`);

//     return res.json({
//       success: true,
//       message: "Student rejected successfully.",
//       student: {
//         id: student.id,
//         name: student.name,
//         email: student.email,
//         approval_status: student.approval_status,
//       }
//     });

//   } catch (err) {
//     console.error("❌ Error rejecting student:", err);
//     return res.status(500).json({ success: false, error: "Failed to reject student" });
//   }
// };

// /* ============================================================
//    🎓 ENROLLMENTS - INSTANT APPROVAL (No Email)
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
//         {
//           model: User,
//           as: "student",
//           attributes: ["id", "name", "email", "approval_status"],
//         },
//         { model: Course, as: "course", attributes: ["id", "title", "price"] },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     return res.json({ success: true, enrollments });
//   } catch (err) {
//     console.error("❌ Error fetching enrollments:", err);
//     return res.status(500).json({ success: false, error: "Failed to fetch enrollments" });
//   }
// };

// /* ============================================================
//    ✅ APPROVE ENROLLMENT - INSTANT RESPONSE (No Email)
// ============================================================ */
// export const approveEnrollment = async (req, res) => {
//   const transaction = await sequelize.transaction();
//   try {
//     const { id } = req.params;
//     console.log(`🔄 Approving enrollment ID: ${id}`);

//     const enrollment = await Enrollment.findByPk(id, {
//       include: [
//         {
//           model: User,
//           as: "student",
//           attributes: ["id", "name", "email", "approval_status"],
//         },
//         { model: Course, as: "course", attributes: ["id", "title", "price"] },
//       ],
//       transaction,
//     });

//     if (!enrollment) {
//       await transaction.rollback();
//       return res.status(404).json({ success: false, error: "Enrollment not found" });
//     }

//     if (enrollment.approval_status === "approved") {
//       await transaction.rollback();
//       return res.status(400).json({ success: false, error: "Enrollment already approved" });
//     }

//     if (enrollment.student?.approval_status !== "approved") {
//       await transaction.rollback();
//       return res.status(400).json({
//         success: false,
//         error: "Cannot approve enrollment: student account not approved",
//       });
//     }

//     // ✅ Update enrollment status
//     enrollment.approval_status = "approved";
//     await enrollment.save({ transaction });

//     // ✅ Ensure UserCourseAccess record exists or update it
//     await UserCourseAccess.upsert(
//       {
//         user_id: enrollment.user_id,
//         course_id: enrollment.course_id,
//         approval_status: "approved",
//         payment_status: enrollment.payment_status || "paid",
//         access_granted_at: new Date(),
//       },
//       { transaction }
//     );

//     // ✅ Commit DB transaction
//     await transaction.commit();

//     console.log(`✅ Enrollment ${id} approved instantly for student ${enrollment.student.name}`);

//     return res.json({
//       success: true,
//       message: `Enrollment for ${enrollment.student.name} approved successfully.`,
//       enrollment
//     });

//   } catch (err) {
//     await transaction.rollback();
//     console.error("❌ Error approving enrollment:", err);
//     return res.status(500).json({ success: false, error: "Failed to approve enrollment" });
//   }
// };

// /* ============================================================
//    ❌ REJECT ENROLLMENT - INSTANT RESPONSE
// ============================================================ */
// export const rejectEnrollment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const enrollment = await Enrollment.findByPk(id);

//     if (!enrollment) {
//       return res.status(404).json({ success: false, error: "Enrollment not found" });
//     }

//     enrollment.approval_status = "rejected";
//     await enrollment.save();

//     console.log(`❌ Enrollment ${id} rejected instantly`);

//     return res.json({
//       success: true,
//       message: "Enrollment rejected successfully",
//       enrollment,
//     });
//   } catch (err) {
//     console.error("❌ Error rejecting enrollment:", err);
//     return res.status(500).json({ success: false, error: "Failed to reject enrollment" });
//   }
// };

// /* ============================================================
//    ✉️ MANUAL EMAIL ENDPOINTS (Separate - Admin can use later)
// ============================================================ */
// export const sendStudentApprovalEmail = async (req, res) => {
//   try {
//     const { studentId } = req.params;
//     const student = await User.findByPk(studentId);

//     if (!student) {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     // Import email dependencies only when needed
//     const sendEmail = (await import("../utils/sendEmail.js")).default;
    
//     const approvalHtml = `
//       <div style="font-family:Arial,sans-serif;padding:20px;background:#f8f9fa;border-radius:8px;">
//         <h2 style="color:#28a745;">🎉 Account Approved!</h2>
//         <div style="background:white;padding:15px;border-radius:5px;margin:10px 0;">
//           <p>Hello <strong>${student.name}</strong>,</p>
//           <p>Great news! Your Math Class Platform account has been approved.</p>
//           <p>You can now log in and access all available courses.</p>
//           <p><strong>Login URL:</strong> <a href="${process.env.FRONTEND_URL}/login">${process.env.FRONTEND_URL}/login</a></p>
//         </div>
//         <p style="color:#6c757d;font-size:14px;">Happy Learning! 🎓</p>
//       </div>
//     `;

//     await sendEmail({
//       to: student.email,
//       subject: "🎉 Your Math Class Account Has Been Approved!",
//       html: approvalHtml,
//     });

//     return res.json({
//       success: true,
//       message: `Approval email sent to ${student.email}`
//     });

//   } catch (error) {
//     console.error("❌ Manual email error:", error);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to send email: " + error.message
//     });
//   }
// };

// export const sendStudentRejectionEmail = async (req, res) => {
//   try {
//     const { studentId } = req.params;
//     const student = await User.findByPk(studentId);

//     if (!student) {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     // Import email dependencies only when needed
//     const sendEmail = (await import("../utils/sendEmail.js")).default;

//     const rejectionHtml = `
//       <div style="font-family:Arial,sans-serif;padding:20px;background:#f8f9fa;border-radius:8px;">
//         <h2 style="color:#dc3545;">Account Not Approved</h2>
//         <div style="background:white;padding:15px;border-radius:5px;margin:10px 0;">
//           <p>Hello ${student.name},</p>
//           <p>We regret to inform you that your Math Class Platform account application has not been approved.</p>
//           <p>If you believe this is a mistake, please contact our support team.</p>
//         </div>
//         <p style="color:#6c757d;font-size:14px;">Thank you for your interest in our platform.</p>
//       </div>
//     `;

//     await sendEmail({
//       to: student.email,
//       subject: "Math Class Platform - Account Not Approved",
//       html: rejectionHtml,
//     });

//     return res.json({
//       success: true,
//       message: `Rejection email sent to ${student.email}`
//     });

//   } catch (error) {
//     console.error("❌ Manual email error:", error);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to send email: " + error.message
//     });
//   }
// };

// /* ============================================================
//    🎉 WELCOME EMAIL ENDPOINT (Additional email option)
// ============================================================ */
// export const sendStudentWelcomeEmail = async (req, res) => {
//   try {
//     const { studentId } = req.params;
//     const student = await User.findByPk(studentId);

//     if (!student) {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     // Import email dependencies only when needed
//     const sendEmail = (await import("../utils/sendEmail.js")).default;
    
//     const welcomeHtml = `
//       <div style="font-family:Arial,sans-serif;padding:20px;background:#f8f9fa;border-radius:8px;">
//         <h2 style="color:#6f42c1;">🎓 Welcome to Math Class Platform!</h2>
//         <div style="background:white;padding:20px;border-radius:8px;margin:15px 0;">
//           <p>Hello <strong>${student.name}</strong>,</p>
//           <p>Welcome to our Math Class Platform! We're excited to have you join our learning community.</p>
          
//           <div style="background:#f0f8ff;padding:15px;border-radius:5px;margin:15px 0;">
//             <h3 style="color:#6f42c1;margin-top:0;">What's Next?</h3>
//             <ul style="margin-bottom:0;">
//               <li>📚 Explore available courses</li>
//               <li>🎥 Watch video lessons</li>
//               <li>📝 Complete practice exercises</li>
//               <li>📊 Track your progress</li>
//             </ul>
//           </div>
          
//           <p><strong>Get Started:</strong> <a href="${process.env.FRONTEND_URL}/courses" style="color:#6f42c1;font-weight:bold;">Browse Courses</a></p>
//           <p><strong>Need Help?</strong> Contact our support team anytime.</p>
//         </div>
//         <p style="color:#6c757d;font-size:14px;">We're excited to help you achieve your math goals! 🚀</p>
//       </div>
//     `;

//     await sendEmail({
//       to: student.email,
//       subject: "🎓 Welcome to Math Class Platform!",
//       html: welcomeHtml,
//     });

//     return res.json({
//       success: true,
//       message: `Welcome email sent to ${student.email}`
//     });

//   } catch (error) {
//     console.error("❌ Welcome email error:", error);
//     return res.status(500).json({
//       success: false,
//       error: "Failed to send welcome email: " + error.message
//     });
//   }
// };




// controllers/adminController.js
import db, { sequelize } from "../models/index.js";
const { User, Enrollment, Course, UserCourseAccess } = db;

/* ============================================================
   👩‍🎓 STUDENT MANAGEMENT - INSTANT APPROVAL (NO EMAIL)
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

    // INSTANT APPROVAL - No email delays
    student.approval_status = "approved";
    await student.save();

    console.log(`✅ Student ${student.name} (${student.email}) approved instantly`);

    return res.json({
      success: true,
      message: "Student approved successfully! The student can now log in.",
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        approval_status: student.approval_status,
      }
    });

  } catch (err) {
    console.error("❌ Error approving student:", err);
    return res.status(500).json({ 
      success: false, 
      error: "Failed to approve student: " + err.message 
    });
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

    console.log(`❌ Student ${student.name} (${student.email}) rejected instantly`);

    return res.json({
      success: true,
      message: "Student rejected successfully.",
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        approval_status: student.approval_status,
      }
    });

  } catch (err) {
    console.error("❌ Error rejecting student:", err);
    return res.status(500).json({ success: false, error: "Failed to reject student" });
  }
};

/* ============================================================
   🎓 ENROLLMENT MANAGEMENT - INSTANT APPROVAL (NO EMAIL)
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
        {
          model: User,
          as: "student",
          attributes: ["id", "name", "email", "approval_status"],
        },
        { model: Course, as: "course", attributes: ["id", "title", "price"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json({ success: true, enrollments });
  } catch (err) {
    console.error("❌ Error fetching enrollments:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch enrollments" });
  }
};

export const approveEnrollment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    console.log(`🔄 Approving enrollment ID: ${id}`);

    const enrollment = await Enrollment.findByPk(id, {
      include: [
        {
          model: User,
          as: "student",
          attributes: ["id", "name", "email", "approval_status"],
        },
        { model: Course, as: "course", attributes: ["id", "title", "price"] },
      ],
      transaction,
    });

    if (!enrollment) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: "Enrollment not found" });
    }

    if (enrollment.approval_status === "approved") {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: "Enrollment already approved" });
    }

    if (enrollment.student?.approval_status !== "approved") {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: "Cannot approve enrollment: student account not approved",
      });
    }

    // INSTANT APPROVAL - No email delays
    enrollment.approval_status = "approved";
    await enrollment.save({ transaction });

    await UserCourseAccess.upsert(
      {
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        approval_status: "approved",
        payment_status: enrollment.payment_status || "paid",
        access_granted_at: new Date(),
      },
      { transaction }
    );

    await transaction.commit();

    console.log(`✅ Enrollment ${id} approved instantly for student ${enrollment.student.name}`);

    return res.json({
      success: true,
      message: `Enrollment for ${enrollment.student.name} approved successfully.`,
      enrollment
    });

  } catch (err) {
    await transaction.rollback();
    console.error("❌ Error approving enrollment:", err);
    return res.status(500).json({ success: false, error: "Failed to approve enrollment" });
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

    console.log(`❌ Enrollment ${id} rejected instantly`);

    return res.json({
      success: true,
      message: "Enrollment rejected successfully",
      enrollment,
    });
  } catch (err) {
    console.error("❌ Error rejecting enrollment:", err);
    return res.status(500).json({ success: false, error: "Failed to reject enrollment" });
  }
};