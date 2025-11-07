
// FIXED IMPORT - Remove named import for sequelize
import db from "../models/index.js";
import sendEmail from "../utils/sendEmail.js";

// ✅ Import all email templates
import { approvalEmailTemplate } from "../utils/emailTemplates/approvalEmailTemplate.js";
import { welcomeEmailTemplate } from "../utils/emailTemplates/welcomeEmailTemplate.js";
import { enrollmentApprovalEmailTemplate } from "../utils/emailTemplates/enrollmentApprovalEmailTemplate.js";

const { User, Enrollment, Course, UserCourseAccess, sequelize } = db;

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
      attributes: [
        "id",
        "name",
        "email",
        "subject",
        "approval_status",
        "updatedAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, students });
  } catch (err) {
    console.error("❌ Error fetching students:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch students" });
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

    console.log(`✅ Student ${student.name} approved`);
    res.json({
      success: true,
      message: "Student approved successfully!",
      student,
    });
  } catch (err) {
    console.error("❌ Error approving student:", err);
    res.status(500).json({ success: false, error: "Failed to approve student" });
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

    console.log(`❌ Student ${student.name} rejected`);
    res.json({ success: true, message: "Student rejected successfully." });
  } catch (err) {
    console.error("❌ Error rejecting student:", err);
    res.status(500).json({ success: false, error: "Failed to reject student" });
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

    res.json({ success: true, enrollments });
  } catch (err) {
    console.error("❌ Error fetching enrollments:", err);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch enrollments" });
  }
};

export const approveEnrollment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

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

    console.log(`✅ Enrollment ${id} approved`);
    res.json({ success: true, message: "Enrollment approved successfully", enrollment });
  } catch (err) {
    await transaction.rollback();
    console.error("❌ Error approving enrollment:", err);
    res.status(500).json({ success: false, error: "Failed to approve enrollment" });
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
    res.json({ success: true, message: "Enrollment rejected successfully" });
  } catch (err) {
    console.error("❌ Error rejecting enrollment:", err);
    res.status(500).json({ success: false, error: "Failed to reject enrollment" });
  }
};

/* ============================================================
   📧 EMAIL MANAGEMENT (Yahoo Mail)
============================================================ */
export const sendApprovalEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findByPk(id);
    if (!student) return res.status(404).json({ success: false, error: "Student not found" });

    const subject = "✅ Your MatheClass Account Has Been Approved!";
    const html = approvalEmailTemplate(student.name);
    await sendEmail({ to: student.email, subject, html });

    res.json({ success: true, message: `Approval email sent to ${student.email}` });
  } catch (error) {
    console.error("❌ Error sending approval email:", error);
    res.status(500).json({ success: false, error: "Failed to send approval email" });
  }
};

export const sendWelcomeEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await User.findByPk(id);
    if (!student) return res.status(404).json({ success: false, error: "Student not found" });

    const subject = "🎉 Welcome to MatheClass!";
    const html = welcomeEmailTemplate(student.name);
    await sendEmail({ to: student.email, subject, html });

    res.json({ success: true, message: `Welcome email sent to ${student.email}` });
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
    res.status(500).json({ success: false, error: "Failed to send welcome email" });
  }
};

export const sendEnrollmentApprovalEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const enrollment = await Enrollment.findByPk(id, {
      include: [
        { model: User, as: "student" },
        { model: Course, as: "course" },
      ],
    });

    if (!enrollment) return res.status(404).json({ success: false, error: "Enrollment not found" });

    const subject = `🎓 Enrollment Approved - ${enrollment.course.title}`;
    const html = enrollmentApprovalEmailTemplate(enrollment.student.name, enrollment.course.title);
    await sendEmail({ to: enrollment.student.email, subject, html });

    res.json({ success: true, message: `Enrollment approval email sent to ${enrollment.student.email}` });
  } catch (error) {
    console.error("❌ Error sending enrollment approval email:", error);
    res.status(500).json({ success: false, error: "Failed to send enrollment approval email" });
  }
};

/* ============================================================
   📚 ADMIN DASHBOARD (Courses & Users)
============================================================ */
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      attributes: ["id", "title", "price", "createdAt", "updatedAt"],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, courses });
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    res.status(500).json({ success: false, error: "Failed to fetch courses" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "name", "email", "role", "approval_status", "createdAt"],
      order: [["createdAt", "DESC"]],
    });
    res.json({ success: true, users });
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ success: false, error: "Failed to fetch users" });
  }
};