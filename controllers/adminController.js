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