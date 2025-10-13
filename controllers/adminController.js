// controllers/adminController.js
import db from "../models/index.js";
import sendEmail from "../utils/sendEmail.js";
import courseEnrollmentApproved from "../utils/emails/courseEnrollmentApproved.js";

const { User, Enrollment, Course, UserCourseAccess } = db;

/**
 * Get students by approval status
 * @route GET /admin/students?status=pending|approved|rejected
 */
export const getStudentsByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    console.log("🔍 ADMIN: Fetching students with status:", status);
    
    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid or missing status" });
    }

    const students = await User.findAll({
      where: { role: "student", approval_status: status },
      attributes: ["id", "name", "email", "subject", "approval_status", "updatedAt"],
    });

    console.log(`✅ ADMIN: Found ${students.length} students with status: ${status}`);
    return res.json({ students });
  } catch (err) {
    console.error("❌ Error fetching students:", err);
    return res.status(500).json({ error: "Failed to fetch students" });
  }
};

/**
 * Get enrollments by status - ENHANCED WITH COMPREHENSIVE LOGGING
 * @route GET /admin/enrollments?status=pending|approved|rejected
 */
export const getEnrollmentsByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    
    console.log("🎯 ADMIN: Fetching enrollments with status:", status || "all");
    
    let whereCondition = {};
    
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      whereCondition.approval_status = status;
      console.log("✅ Filtering by approval_status:", status);
    } else {
      console.log("⚠️ No valid status filter, showing all approval statuses");
    }
    
    // Only show paid enrollments
    whereCondition.payment_status = "paid";
    console.log("✅ Filtering by payment_status: paid");

    console.log("🎯 Final WHERE condition:", JSON.stringify(whereCondition, null, 2));

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

    console.log(`📊 ADMIN: Found ${enrollments.length} enrollments matching criteria`);
    
    // Log each found enrollment
    enrollments.forEach((enrollment, index) => {
      console.log(`   ${index + 1}. Enrollment ${enrollment.id}:`, {
        student: enrollment.student?.email,
        course: enrollment.course?.title,
        payment_status: enrollment.payment_status,
        approval_status: enrollment.approval_status,
        created: enrollment.createdAt
      });
    });

    return res.json({ 
      success: true,
      count: enrollments.length,
      enrollments 
    });
    
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
    console.log("✅ ADMIN: Approving enrollment:", id);
    
    const enrollment = await Enrollment.findByPk(id, {
      include: [
        { model: User, as: "student" },
        { model: Course, as: "course" }
      ]
    });
    
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
      const emailTemplate = courseEnrollmentApproved(enrollment.student, enrollment.course);
      await sendEmail(enrollment.student.email, emailTemplate.subject, emailTemplate.html);
      console.log("📧 Approval email sent to:", enrollment.student.email);
    } catch (emailErr) {
      console.warn("⚠️ Failed to send approval email:", emailErr.message);
    }

    console.log("✅ Enrollment approved successfully:", id);
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
    console.log("❌ ADMIN: Rejecting enrollment:", id);
    
    const enrollment = await Enrollment.findByPk(id);
    
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    enrollment.approval_status = "rejected";
    await enrollment.save();

    console.log("✅ Enrollment rejected successfully:", id);
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
    console.log("🔍 DEBUG: Checking database for all enrollments...");
    
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

    console.log("📊 DEBUG RESULTS:");
    console.log("- Total enrollments count:", allEnrollments.length);
    
    // Count by status
    const pendingCount = allEnrollments.filter(e => e.approval_status === 'pending').length;
    const paidCount = allEnrollments.filter(e => e.payment_status === 'paid').length;
    const paidPendingCount = allEnrollments.filter(e => e.payment_status === 'paid' && e.approval_status === 'pending').length;
    
    console.log("- Pending enrollments:", pendingCount);
    console.log("- Paid enrollments:", paidCount);
    console.log("- Paid & Pending enrollments:", paidPendingCount);

    // Log each enrollment
    allEnrollments.forEach((enrollment, index) => {
      console.log(`   ${index + 1}. ID: ${enrollment.id}`, {
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        payment_status: enrollment.payment_status,
        approval_status: enrollment.approval_status,
        student: enrollment.student?.email || 'No student',
        course: enrollment.course?.title || 'No course',
        created: enrollment.createdAt
      });
    });

    res.json({
      success: true,
      count: allEnrollments.length,
      enrollments: allEnrollments,
      summary: {
        total: allEnrollments.length,
        pending: pendingCount,
        paid: paidCount,
        paidAndPending: paidPendingCount
      }
    });
  } catch (error) {
    console.error("❌ Debug route error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Comprehensive debug endpoint
 */
export const debugFull = async (req, res) => {
  try {
    console.log("🔍 FULL DEBUG: Checking entire enrollment flow...");

    // 1. Check all enrollments
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

    // 2. Check database structure
    const tableInfo = await db.sequelize.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'enrollments'
    `);

    console.log("📊 FULL DEBUG RESULTS:");
    console.log("1. Total enrollments:", allEnrollments.length);
    console.log("2. Enrollment table structure:", tableInfo[0]);

    // Count different status combinations
    const statusCounts = {
      paid_pending: allEnrollments.filter(e => e.payment_status === 'paid' && e.approval_status === 'pending').length,
      paid_approved: allEnrollments.filter(e => e.payment_status === 'paid' && e.approval_status === 'approved').length,
      paid_rejected: allEnrollments.filter(e => e.payment_status === 'paid' && e.approval_status === 'rejected').length,
      pending_payment: allEnrollments.filter(e => e.payment_status === 'pending').length,
    };

    console.log("3. Status counts:", statusCounts);

    res.json({
      success: true,
      enrollments: {
        total: allEnrollments.length,
        data: allEnrollments
      },
      database: {
        tableStructure: tableInfo[0]
      },
      summary: statusCounts
    });

  } catch (error) {
    console.error("❌ Full debug error:", error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Create test enrollment
 */
export const testCreateEnrollment = async (req, res) => {
  try {
    const { user_id, course_id } = req.body;
    
    if (!user_id || !course_id) {
      return res.status(400).json({ error: "Missing user_id or course_id" });
    }

    console.log("🧪 MANUAL TEST: Creating enrollment:", { user_id, course_id });

    const user = await User.findByPk(user_id);
    const course = await Course.findByPk(course_id);

    if (!user) return res.status(404).json({ error: "User not found" });
    if (!course) return res.status(404).json({ error: "Course not found" });

    console.log("✅ Found user:", user.email, "course:", course.title);

    // Create test enrollment
    const enrollment = await Enrollment.create({
      user_id: user_id,
      course_id: course_id,
      payment_status: "paid",
      approval_status: "pending",
    });

    console.log("✅ Manual enrollment created:", enrollment.id);

    res.json({
      success: true,
      message: "Manual enrollment created successfully",
      enrollment: {
        id: enrollment.id,
        user_id: enrollment.user_id,
        course_id: enrollment.course_id,
        payment_status: enrollment.payment_status,
        approval_status: enrollment.approval_status,
        student: user.email,
        course: course.title
      }
    });

  } catch (error) {
    console.error("❌ Manual enrollment error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Student approval functions
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