// // controllers/adminController.js
// import db, { sequelize } from "../models/index.js";
// import sendEmail from "../utils/sendEmail.js";
// import { approvalEmailTemplate } from "../utils/emailTemplates/approvalEmailTemplate.js";
// import { welcomeEmailTemplate } from "../utils/emailTemplates/welcomeEmailTemplate.js";

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

//     console.log(`✅ Student ${student.name} (${student.email}) approved instantly`);

//     return res.json({
//       success: true,
//       message: "Student approved successfully!",
//       student: {
//         id: student.id,
//         name: student.name,
//         email: student.email,
//         approval_status: student.approval_status,
//       },
//     });
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

//     console.log(`❌ Student ${student.name} (${student.email}) rejected instantly`);

//     return res.json({
//       success: true,
//       message: "Student rejected successfully.",
//       student: {
//         id: student.id,
//         name: student.name,
//         email: student.email,
//         approval_status: student.approval_status,
//       },
//     });
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

//     console.log(`✅ Enrollment ${id} approved instantly for ${enrollment.student.name}`);
//     return res.json({
//       success: true,
//       message: `Enrollment approved successfully.`,
//       enrollment,
//     });
//   } catch (err) {
//     await transaction.rollback();
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

//     console.log(`❌ Enrollment ${id} rejected instantly`);
//     return res.json({ success: true, message: "Enrollment rejected successfully", enrollment });
//   } catch (err) {
//     console.error("❌ Error rejecting enrollment:", err);
//     return res.status(500).json({ success: false, error: "Failed to reject enrollment" });
//   }
// };

// /* ============================================================
//    📧 EMAIL MANAGEMENT (Yahoo Mail)
// ============================================================ */
// export const sendApprovalEmail = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const student = await User.findByPk(id);

//     if (!student || student.role !== "student") {
//       return res.status(404).json({ success: false, error: "Student not found" });
//     }

//     const subject = "✅ Your MatheClass Account Has Been Approved!";
//     const html = approvalEmailTemplate(student.name);

//     await sendEmail({ to: student.email, subject, html });

//     console.log(`📧 Approval email sent to ${student.email}`);
//     return res.json({ success: true, message: `Approval email sent to ${student.email}` });
//   } catch (error) {
//     console.error("❌ Error sending approval email:", error);
//     return res.status(500).json({ success: false, error: "Failed to send approval email" });
//   }
// };

// export const sendWelcomeEmail = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const student = await User.findByPk(id);

//     if (!student || student.role !== "student") {
//       return res.status(404).json({ success: false, error: "Student not found" });
//     }

//     const subject = "🎉 Welcome to MatheClass!";
//     const html = welcomeEmailTemplate(student.name);

//     await sendEmail({ to: student.email, subject, html });

//     console.log(`📧 Welcome email sent to ${student.email}`);
//     return res.json({ success: true, message: `Welcome email sent to ${student.email}` });
//   } catch (error) {
//     console.error("❌ Error sending welcome email:", error);
//     return res.status(500).json({ success: false, error: "Failed to send welcome email" });
//   }
// };



// controllers/adminController.js
import db, { sequelize } from "../models/index.js";
import sendEmail from "../utils/sendEmail.js";
import { approvalEmailTemplate } from "../utils/emailTemplates/approvalEmailTemplate.js";
import { welcomeEmailTemplate } from "../utils/emailTemplates/welcomeEmailTemplate.js";

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

    console.log(`✅ Student ${student.name} (${student.email}) approved`);

    return res.json({
      success: true,
      message: "Student approved successfully",
      student,
    });
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

    console.log(`❌ Student ${student.name} (${student.email}) rejected`);

    return res.json({
      success: true,
      message: "Student rejected successfully",
      student,
    });
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

    if (enrollment.approval_status === "approved") {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: "Enrollment already approved" });
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

    console.log(`✅ Enrollment ${id} approved for ${enrollment.student.name}`);
    return res.json({ success: true, message: "Enrollment approved", enrollment });
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

    console.log(`❌ Enrollment ${id} rejected`);
    return res.json({ success: true, message: "Enrollment rejected", enrollment });
  } catch (err) {
    console.error("❌ Error rejecting enrollment:", err);
    return res.status(500).json({ success: false, error: "Failed to reject enrollment" });
  }
};

/* ============================================================
   📧 EMAIL MANAGEMENT (Backend-hosted logo)
============================================================ */
export const sendApprovalEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findByPk(id);

    if (!student || student.role !== "student") {
      return res.status(404).json({ success: false, error: "Student not found" });
    }

    const logoUrl = `${process.env.BACKEND_URL}/uploads/mathlogo2.jpg`;
    const subject = "✅ Your MatheClass Account Has Been Approved!";
    const html = approvalEmailTemplate(student.name, logoUrl);

    await sendEmail({ to: student.email, subject, html });

    console.log(`📧 Approval email sent to ${student.email}`);
    return res.json({ success: true, message: `Approval email sent to ${student.email}` });
  } catch (error) {
    console.error("❌ Error sending approval email:", error);
    return res.status(500).json({ success: false, error: "Failed to send approval email" });
  }
};

export const sendWelcomeEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findByPk(id);

    if (!student || student.role !== "student") {
      return res.status(404).json({ success: false, error: "Student not found" });
    }

    const logoUrl = `${process.env.BACKEND_URL}/uploads/mathlogo2.jpg`;
    const subject = "🎉 Welcome to MatheClass!";
    const html = welcomeEmailTemplate(student.name, logoUrl);

    await sendEmail({ to: student.email, subject, html });

    console.log(`📧 Welcome email sent to ${student.email}`);
    return res.json({ success: true, message: `Welcome email sent to ${student.email}` });
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    return res.status(500).json({ success: false, error: "Failed to send welcome email" });
  }
};
