// // controllers/adminController.js
// import db, { sequelize } from "../models/index.js";
// import sendEmail from "../utils/sendEmail.js";

// // Email templates
// import userApprovalEmail from "../utils/emails/userApprovalEmail.js";
// import userRejectionEmail from "../utils/emails/userRejectionEmail.js";
// import courseEnrollmentApproved from "../utils/emails/courseEnrollmentApproved.js";
// import courseEnrollmentRejected from "../utils/emails/courseEnrollmentRejected.js";

// const { User, Enrollment, Course, UserCourseAccess } = db;

// /* ============================================================
//    ✉️ Helper for async email sending with logging
// ============================================================ */
// const sendEmailAsync = async (emailData) => {
//   try {
//     await sendEmail(emailData);
//     console.log(`📧 Email sent successfully to ${emailData.to}`);
//     return true;
//   } catch (error) {
//     console.warn(`⚠️ Failed to send email to ${emailData.to}:`, error.message);
//     return false;
//   }
// };

// /* ============================================================
//    👩‍🎓 STUDENTS
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
//    ✅ APPROVE STUDENT + SEND EMAIL (Student + Admin)
// ============================================================ */
// export const approveStudent = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const student = await User.findByPk(id);

//     if (!student || student.role !== "student") {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     student.approval_status = "approved";
//     await student.save();

//     // === Send Student Email ===
//     const { subject, html } = userApprovalEmail({
//       id: student.id,
//       name: student.name,
//       email: student.email,
//     });

//     sendEmailAsync({ to: student.email, subject, html });

//     // === Send Admin Notification ===
//     const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_USER;
//     sendEmailAsync({
//       to: adminEmail,
//       subject: `✅ Student Approved: ${student.name}`,
//       html: `
//         <div style="font-family:Arial,sans-serif;padding:20px;">
//           <h2>Student Approved</h2>
//           <p><strong>Name:</strong> ${student.name}</p>
//           <p><strong>Email:</strong> ${student.email}</p>
//           <p>The student has been approved successfully.</p>
//         </div>
//       `,
//     });

//     return res.json({
//       success: true,
//       message: "Student approved successfully and email sent.",
//       student,
//     });
//   } catch (err) {
//     console.error("❌ Error approving student:", err);
//     return res.status(500).json({ success: false, error: "Failed to approve student" });
//   }
// };

// /* ============================================================
//    ❌ REJECT STUDENT + SEND EMAIL (Student + Admin)
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

//     // === Send Student Email ===
//     const { subject, html } = userRejectionEmail({
//       name: student.name,
//       email: student.email,
//     });

//     sendEmailAsync({ to: student.email, subject, html });

//     // === Send Admin Notification ===
//     const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_USER;
//     sendEmailAsync({
//       to: adminEmail,
//       subject: `❌ Student Rejected: ${student.name}`,
//       html: `
//         <div style="font-family:Arial,sans-serif;padding:20px;">
//           <h2>Student Rejected</h2>
//           <p><strong>Name:</strong> ${student.name}</p>
//           <p><strong>Email:</strong> ${student.email}</p>
//           <p>The student's registration was rejected.</p>
//         </div>
//       `,
//     });

//     return res.json({
//       success: true,
//       message: "Student rejected successfully and email sent.",
//       student,
//     });
//   } catch (err) {
//     console.error("❌ Error rejecting student:", err);
//     return res.status(500).json({ success: false, error: "Failed to reject student" });
//   }
// };

// /* ============================================================
//    🎓 ENROLLMENTS
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
//         { model: User, as: "student", attributes: ["id", "name", "email", "approval_status"] },
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
//    ✅ APPROVE ENROLLMENT + SEND EMAIL (Student + Admin)
// ============================================================ */
// export const approveEnrollment = async (req, res) => {
//   const transaction = await sequelize.transaction();
//   try {
//     const { id } = req.params;

//     const enrollment = await Enrollment.findByPk(id, {
//       include: [
//         { model: User, as: "student", attributes: ["id", "name", "email", "approval_status"] },
//         { model: Course, as: "course", attributes: ["id", "title", "price"] },
//       ],
//       transaction,
//     });

//     if (!enrollment) {
//       await transaction.rollback();
//       return res.status(404).json({ success: false, error: "Enrollment not found" });
//     }

//     if (enrollment.student?.approval_status !== "approved") {
//       await transaction.rollback();
//       return res.status(400).json({
//         success: false,
//         error: "Cannot approve enrollment: student not approved",
//       });
//     }

//     enrollment.approval_status = "approved";
//     await enrollment.save({ transaction });

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

//     await transaction.commit();

//     // === Send Student Email ===
//     const htmlContent = courseEnrollmentApproved({
//       studentName: enrollment.student.name,
//       courseTitle: enrollment.course.title,
//       coursePrice: enrollment.course.price,
//     });

//     sendEmailAsync({
//       to: enrollment.student.email,
//       subject: `✅ Enrollment Approved: ${enrollment.course.title}`,
//       html: htmlContent,
//     });

//     // === Send Admin Notification ===
//     const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_USER;
//     sendEmailAsync({
//       to: adminEmail,
//       subject: `✅ Payment Approved: ${enrollment.student.name}`,
//       html: `
//         <div style="font-family:Arial,sans-serif;padding:20px;">
//           <h2>Payment Approved</h2>
//           <p><strong>Student:</strong> ${enrollment.student.name}</p>
//           <p><strong>Email:</strong> ${enrollment.student.email}</p>
//           <p><strong>Course:</strong> ${enrollment.course.title}</p>
//           <p><strong>Price:</strong> $${enrollment.course.price}</p>
//         </div>
//       `,
//     });

//     return res.json({
//       success: true,
//       message: `Enrollment for ${enrollment.student.name} approved successfully.`,
//       enrollment,
//     });
//   } catch (err) {
//     await transaction.rollback();
//     console.error("❌ Error approving enrollment:", err);
//     return res.status(500).json({ success: false, error: "Failed to approve enrollment" });
//   }
// };

// /* ============================================================
//    ❌ REJECT ENROLLMENT + SEND EMAIL (Student + Admin)
// ============================================================ */
// export const rejectEnrollment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const enrollment = await Enrollment.findByPk(id, {
//       include: [
//         { model: User, as: "student", attributes: ["id", "name", "email"] },
//         { model: Course, as: "course", attributes: ["id", "title"] },
//       ],
//     });

//     if (!enrollment) {
//       return res.status(404).json({ success: false, error: "Enrollment not found" });
//     }

//     enrollment.approval_status = "rejected";
//     await enrollment.save();

//     // === Send Student Email ===
//     const htmlContent = courseEnrollmentRejected({
//       studentName: enrollment.student.name,
//       courseTitle: enrollment.course.title,
//     });

//     sendEmailAsync({
//       to: enrollment.student.email,
//       subject: `❌ Enrollment Rejected: ${enrollment.course.title}`,
//       html: htmlContent,
//     });

//     // === Send Admin Notification ===
//     const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_USER;
//     sendEmailAsync({
//       to: adminEmail,
//       subject: `❌ Payment Rejected: ${enrollment.student.name}`,
//       html: `
//         <div style="font-family:Arial,sans-serif;padding:20px;">
//           <h2>Payment Rejected</h2>
//           <p><strong>Student:</strong> ${enrollment.student.name}</p>
//           <p><strong>Email:</strong> ${enrollment.student.email}</p>
//           <p><strong>Course:</strong> ${enrollment.course.title}</p>
//         </div>
//       `,
//     });

//     return res.json({
//       success: true,
//       message: "Enrollment rejected successfully and email sent.",
//       enrollment,
//     });
//   } catch (err) {
//     console.error("❌ Error rejecting enrollment:", err);
//     return res.status(500).json({ success: false, error: "Failed to reject enrollment" });
//   }
// };






// controllers/adminController.js
import db, { sequelize } from "../models/index.js";
import sendEmail from "../utils/sendEmail.js";
import courseEnrollmentApproved from "../utils/emails/courseEnrollmentApproved.js";
import userApprovalEmail from "../utils/emails/userApprovalEmail.js";

const { User, Enrollment, Course, UserCourseAccess } = db;

/* ============================================================
   ✉️ Enhanced email helper with detailed logging
============================================================ */
const sendEmailWithRetry = async (emailData, maxRetries = 2) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📧 Email attempt ${attempt}/${maxRetries} to: ${emailData.to}`);
      
      const result = await sendEmail(emailData);
      
      console.log(`✅ Email sent successfully to ${emailData.to} (attempt ${attempt})`);
      return {
        success: true,
        attempt: attempt,
        messageId: result.messageId
      };
      
    } catch (error) {
      console.error(`❌ Email attempt ${attempt} failed for ${emailData.to}:`, error.message);
      
      if (attempt === maxRetries) {
        return {
          success: false,
          attempt: attempt,
          error: error.message
        };
      }
      
      // Wait before retry (exponential backoff)
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

/* ============================================================
   👩‍🎓 STUDENTS
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

/* ============================================================
   ✅ APPROVE STUDENT + SEND EMAIL (Enhanced)
============================================================ */
export const approveStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findByPk(id);

    if (!student || student.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    // Update student status
    student.approval_status = "approved";
    await student.save();

    console.log(`✅ Student ${student.name} (${student.email}) approved`);

    // Email results tracking
    const emailResults = {
      studentEmail: null,
      adminEmail: null
    };

    // === Send Student Approval Email ===
    try {
      const { subject, html } = userApprovalEmail({
        name: student.name,
        email: student.email,
      });

      emailResults.studentEmail = await sendEmailWithRetry({
        to: student.email,
        subject,
        html,
      });

    } catch (emailError) {
      console.error(`❌ Failed to send student approval email:`, emailError);
      emailResults.studentEmail = { success: false, error: emailError.message };
    }

    // === Send Admin Notification ===
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_USER;
      
      emailResults.adminEmail = await sendEmailWithRetry({
        to: adminEmail,
        subject: `✅ Student Approved: ${student.name}`,
        html: `
          <div style="font-family:Arial,sans-serif;padding:20px;background:#f8f9fa;border-radius:8px;">
            <h2 style="color:#28a745;">🎓 Student Approved</h2>
            <div style="background:white;padding:15px;border-radius:5px;margin:10px 0;">
              <p><strong>Name:</strong> ${student.name}</p>
              <p><strong>Email:</strong> ${student.email}</p>
              <p><strong>Subject:</strong> ${student.subject || 'Not specified'}</p>
              <p><strong>Approved At:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p style="color:#6c757d;font-size:14px;">This student can now log in and access the platform.</p>
          </div>
        `,
      });

    } catch (adminEmailError) {
      console.error(`❌ Failed to send admin notification:`, adminEmailError);
      emailResults.adminEmail = { success: false, error: adminEmailError.message };
    }

    // Prepare response
    const allEmailsSent = emailResults.studentEmail?.success && emailResults.adminEmail?.success;
    const someEmailsSent = emailResults.studentEmail?.success || emailResults.adminEmail?.success;

    let message = "Student approved successfully";
    if (allEmailsSent) {
      message += " and all emails sent";
    } else if (someEmailsSent) {
      message += " but some emails failed to send";
    } else {
      message += " but email notifications failed";
    }

    return res.json({
      success: true,
      message: message,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        approval_status: student.approval_status,
      },
      emailResults: {
        student: emailResults.studentEmail,
        admin: emailResults.adminEmail
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

/* ============================================================
   ❌ REJECT STUDENT + SEND EMAIL (Enhanced)
============================================================ */
export const rejectStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findByPk(id);

    if (!student || student.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    student.approval_status = "rejected";
    await student.save();

    console.log(`❌ Student ${student.name} (${student.email}) rejected`);

    // Email results tracking
    const emailResults = {
      studentEmail: null,
      adminEmail: null
    };

    // === Send Student Rejection Email ===
    try {
      const rejectionHtml = `
        <div style="font-family:Arial,sans-serif;padding:20px;background:#f8f9fa;border-radius:8px;">
          <h2 style="color:#dc3545;">Account Not Approved</h2>
          <div style="background:white;padding:15px;border-radius:5px;margin:10px 0;">
            <p>Hello ${student.name},</p>
            <p>We regret to inform you that your Math Class Platform account application has not been approved.</p>
            <p>If you believe this is a mistake, please contact our support team.</p>
          </div>
          <p style="color:#6c757d;font-size:14px;">Thank you for your interest in our platform.</p>
        </div>
      `;

      emailResults.studentEmail = await sendEmailWithRetry({
        to: student.email,
        subject: "Math Class Platform - Account Not Approved",
        html: rejectionHtml,
      });

    } catch (emailError) {
      console.error(`❌ Failed to send student rejection email:`, emailError);
      emailResults.studentEmail = { success: false, error: emailError.message };
    }

    // === Send Admin Notification ===
    try {
      const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_USER;
      
      emailResults.adminEmail = await sendEmailWithRetry({
        to: adminEmail,
        subject: `❌ Student Rejected: ${student.name}`,
        html: `
          <div style="font-family:Arial,sans-serif;padding:20px;background:#f8f9fa;border-radius:8px;">
            <h2 style="color:#dc3545;">🚫 Student Rejected</h2>
            <div style="background:white;padding:15px;border-radius:5px;margin:10px 0;">
              <p><strong>Name:</strong> ${student.name}</p>
              <p><strong>Email:</strong> ${student.email}</p>
              <p><strong>Subject:</strong> ${student.subject || 'Not specified'}</p>
              <p><strong>Rejected At:</strong> ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `,
      });

    } catch (adminEmailError) {
      console.error(`❌ Failed to send admin notification:`, adminEmailError);
      emailResults.adminEmail = { success: false, error: adminEmailError.message };
    }

    const message = emailResults.studentEmail?.success ? 
      "Student rejected successfully and email sent" : 
      "Student rejected successfully but email failed to send";

    return res.json({
      success: true,
      message: message,
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        approval_status: student.approval_status,
      },
      emailResults: {
        student: emailResults.studentEmail,
        admin: emailResults.adminEmail
      }
    });

  } catch (err) {
    console.error("❌ Error rejecting student:", err);
    return res.status(500).json({ success: false, error: "Failed to reject student" });
  }
};

/* ============================================================
   🎓 ENROLLMENTS
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

/* ============================================================
   ✅ APPROVE ENROLLMENT + SEND EMAIL
============================================================ */
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

    // ✅ Update enrollment status
    enrollment.approval_status = "approved";
    await enrollment.save({ transaction });

    // ✅ Ensure UserCourseAccess record exists or update it
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

    // ✅ Commit DB transaction
    await transaction.commit();

    // ✅ Send enrollment approval email
    const emailResults = {
      studentEmail: null
    };

    try {
      const htmlContent = courseEnrollmentApproved({
        studentName: enrollment.student.name,
        courseTitle: enrollment.course.title,
      });

      emailResults.studentEmail = await sendEmailWithRetry({
        to: enrollment.student.email,
        subject: `✅ Enrollment Approved: ${enrollment.course.title}`,
        html: htmlContent,
      });

    } catch (emailErr) {
      console.warn("⚠️ Enrollment approved but failed to send email:", emailErr.message);
      emailResults.studentEmail = { success: false, error: emailErr.message };
    }

    return res.json({
      success: true,
      message: `Enrollment for ${enrollment.student.name} approved successfully.`,
      enrollment,
      emailResults
    });

  } catch (err) {
    await transaction.rollback();
    console.error("❌ Error approving enrollment:", err);
    return res.status(500).json({ success: false, error: "Failed to approve enrollment" });
  }
};

/* ============================================================
   ❌ REJECT ENROLLMENT
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