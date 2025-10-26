// // controllers/adminController.js
// import db, { sequelize } from "../models/index.js";
// import sendEmail from "../utils/sendEmail.js";
// import courseEnrollmentApproved from "../utils/emails/courseEnrollmentApproved.js";
// import userApprovalEmail from "../utils/emails/userApprovalEmail.js";

// const { User, Enrollment, Course, UserCourseAccess } = db;

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
//       attributes: [
//         "id",
//         "name",
//         "email",
//         "subject",
//         "approval_status",
//         "updatedAt",
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     return res.json({ success: true, students });
//   } catch (err) {
//     console.error("❌ Error fetching students:", err);
//     return res
//       .status(500)
//       .json({ success: false, error: "Failed to fetch students" });
//   }
// };

// /* ============================================================
//    ✅ APPROVE STUDENT + SEND EMAIL
// ============================================================ */
// export const approveStudent = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const student = await User.findByPk(id);

//     if (!student || student.role !== "student") {
//       return res.status(404).json({ error: "Student not found" });
//     }

//     // Update approval status
//     student.approval_status = "approved";
//     await student.save();

//     // ✅ Send confirmation email
//     try {
//       const { subject, html } = userApprovalEmail({
//         name: student.name,
//         email: student.email,
//       });

//       await sendEmail({
//         to: student.email,
//         subject,
//         html,
//       });

//       console.log(`📧 Approval email sent to ${student.email}`);
//     } catch (emailErr) {
//       console.warn(
//         "⚠️ Approved student but failed to send email:",
//         emailErr.message
//       );
//     }

//     return res.json({
//       success: true,
//       message: "Student approved successfully and email sent.",
//       student: {
//         id: student.id,
//         name: student.name,
//         email: student.email,
//         approval_status: student.approval_status,
//       },
//     });
//   } catch (err) {
//     console.error("❌ Error approving student:", err);
//     return res
//       .status(500)
//       .json({ success: false, error: "Failed to approve student" });
//   }
// };

// /* ============================================================
//    ❌ REJECT STUDENT
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

//     return res.json({
//       success: true,
//       message: "Student rejected successfully",
//       student: {
//         id: student.id,
//         name: student.name,
//         email: student.email,
//         approval_status: student.approval_status,
//       },
//     });
//   } catch (err) {
//     console.error("❌ Error rejecting student:", err);
//     return res
//       .status(500)
//       .json({ success: false, error: "Failed to reject student" });
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
//     return res
//       .status(500)
//       .json({ success: false, error: "Failed to fetch enrollments" });
//   }
// };

// /* ============================================================
//    ✅ APPROVE ENROLLMENT + SEND EMAIL
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
//       return res
//         .status(404)
//         .json({ success: false, error: "Enrollment not found" });
//     }

//     if (enrollment.approval_status === "approved") {
//       await transaction.rollback();
//       return res
//         .status(400)
//         .json({ success: false, error: "Enrollment already approved" });
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

//     // ✅ Send enrollment approval email
//     try {
//       const htmlContent = courseEnrollmentApproved({
//         studentName: enrollment.student.name,
//         courseTitle: enrollment.course.title,
//       });

//       await sendEmail({
//         to: enrollment.student.email,
//         subject: `✅ Enrollment Approved: ${enrollment.course.title}`,
//         html: htmlContent,
//       });

//       console.log(
//         `📧 Enrollment approval email sent to ${enrollment.student.email}`
//       );
//     } catch (emailErr) {
//       console.warn(
//         "⚠️ Enrollment approved but failed to send email:",
//         emailErr.message
//       );
//     }

//     return res.json({
//       success: true,
//       message: `Enrollment for ${enrollment.student.name} approved successfully.`,
//       enrollment,
//     });
//   } catch (err) {
//     await transaction.rollback();
//     console.error("❌ Error approving enrollment:", err);
//     return res
//       .status(500)
//       .json({ success: false, error: "Failed to approve enrollment" });
//   }
// };

// /* ============================================================
//    ❌ REJECT ENROLLMENT
// ============================================================ */
// export const rejectEnrollment = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const enrollment = await Enrollment.findByPk(id);
//     if (!enrollment) {
//       return res
//         .status(404)
//         .json({ success: false, error: "Enrollment not found" });
//     }

//     enrollment.approval_status = "rejected";
//     await enrollment.save();

//     return res.json({
//       success: true,
//       message: "Enrollment rejected successfully",
//       enrollment,
//     });
//   } catch (err) {
//     console.error("❌ Error rejecting enrollment:", err);
//     return res
//       .status(500)
//       .json({ success: false, error: "Failed to reject enrollment" });
//   }
// };




// controllers/adminController.js
import db, { sequelize } from "../models/index.js";
import sendEmail from "../utils/sendEmail.js";

// Email templates
import userApprovalEmail from "../utils/emails/userApprovalEmail.js";
import userRejectionEmail from "../utils/emails/userRejectionEmail.js";
import courseEnrollmentApproved from "../utils/emails/courseEnrollmentApproved.js";
import courseEnrollmentRejected from "../utils/emails/courseEnrollmentRejected.js";

const { User, Enrollment, Course, UserCourseAccess } = db;

/* ============================================================
   ✉️ Helper for async email sending with logging
============================================================ */
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
   ✅ APPROVE STUDENT + SEND EMAIL (Student + Admin)
============================================================ */
export const approveStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findByPk(id);

    if (!student || student.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    student.approval_status = "approved";
    await student.save();

    // === Send Student Email ===
    const { subject, html } = userApprovalEmail({
      id: student.id,
      name: student.name,
      email: student.email,
    });

    sendEmailAsync({ to: student.email, subject, html });

    // === Send Admin Notification ===
    const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_USER;
    sendEmailAsync({
      to: adminEmail,
      subject: `✅ Student Approved: ${student.name}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
          <h2>Student Approved</h2>
          <p><strong>Name:</strong> ${student.name}</p>
          <p><strong>Email:</strong> ${student.email}</p>
          <p>The student has been approved successfully.</p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: "Student approved successfully and email sent.",
      student,
    });
  } catch (err) {
    console.error("❌ Error approving student:", err);
    return res.status(500).json({ success: false, error: "Failed to approve student" });
  }
};

/* ============================================================
   ❌ REJECT STUDENT + SEND EMAIL (Student + Admin)
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

    // === Send Student Email ===
    const { subject, html } = userRejectionEmail({
      name: student.name,
      email: student.email,
    });

    sendEmailAsync({ to: student.email, subject, html });

    // === Send Admin Notification ===
    const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_USER;
    sendEmailAsync({
      to: adminEmail,
      subject: `❌ Student Rejected: ${student.name}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
          <h2>Student Rejected</h2>
          <p><strong>Name:</strong> ${student.name}</p>
          <p><strong>Email:</strong> ${student.email}</p>
          <p>The student's registration was rejected.</p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: "Student rejected successfully and email sent.",
      student,
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
        { model: User, as: "student", attributes: ["id", "name", "email", "approval_status"] },
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
   ✅ APPROVE ENROLLMENT + SEND EMAIL (Student + Admin)
============================================================ */
export const approveEnrollment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const enrollment = await Enrollment.findByPk(id, {
      include: [
        { model: User, as: "student", attributes: ["id", "name", "email", "approval_status"] },
        { model: Course, as: "course", attributes: ["id", "title", "price"] },
      ],
      transaction,
    });

    if (!enrollment) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: "Enrollment not found" });
    }

    if (enrollment.student?.approval_status !== "approved") {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        error: "Cannot approve enrollment: student not approved",
      });
    }

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

    // === Send Student Email ===
    const htmlContent = courseEnrollmentApproved({
      studentName: enrollment.student.name,
      courseTitle: enrollment.course.title,
      coursePrice: enrollment.course.price,
    });

    sendEmailAsync({
      to: enrollment.student.email,
      subject: `✅ Enrollment Approved: ${enrollment.course.title}`,
      html: htmlContent,
    });

    // === Send Admin Notification ===
    const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_USER;
    sendEmailAsync({
      to: adminEmail,
      subject: `✅ Payment Approved: ${enrollment.student.name}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
          <h2>Payment Approved</h2>
          <p><strong>Student:</strong> ${enrollment.student.name}</p>
          <p><strong>Email:</strong> ${enrollment.student.email}</p>
          <p><strong>Course:</strong> ${enrollment.course.title}</p>
          <p><strong>Price:</strong> $${enrollment.course.price}</p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: `Enrollment for ${enrollment.student.name} approved successfully.`,
      enrollment,
    });
  } catch (err) {
    await transaction.rollback();
    console.error("❌ Error approving enrollment:", err);
    return res.status(500).json({ success: false, error: "Failed to approve enrollment" });
  }
};

/* ============================================================
   ❌ REJECT ENROLLMENT + SEND EMAIL (Student + Admin)
============================================================ */
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
      return res.status(404).json({ success: false, error: "Enrollment not found" });
    }

    enrollment.approval_status = "rejected";
    await enrollment.save();

    // === Send Student Email ===
    const htmlContent = courseEnrollmentRejected({
      studentName: enrollment.student.name,
      courseTitle: enrollment.course.title,
    });

    sendEmailAsync({
      to: enrollment.student.email,
      subject: `❌ Enrollment Rejected: ${enrollment.course.title}`,
      html: htmlContent,
    });

    // === Send Admin Notification ===
    const adminEmail = process.env.ADMIN_EMAIL || process.env.MAIL_USER;
    sendEmailAsync({
      to: adminEmail,
      subject: `❌ Payment Rejected: ${enrollment.student.name}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
          <h2>Payment Rejected</h2>
          <p><strong>Student:</strong> ${enrollment.student.name}</p>
          <p><strong>Email:</strong> ${enrollment.student.email}</p>
          <p><strong>Course:</strong> ${enrollment.course.title}</p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: "Enrollment rejected successfully and email sent.",
      enrollment,
    });
  } catch (err) {
    console.error("❌ Error rejecting enrollment:", err);
    return res.status(500).json({ success: false, error: "Failed to reject enrollment" });
  }
};
