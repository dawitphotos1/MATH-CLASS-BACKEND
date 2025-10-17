// // controllers/adminController.js
// import db from "../models/index.js";
// import sendEmail from "../utils/sendEmail.js";
// import courseEnrollmentApproved from "../utils/emails/courseEnrollmentApproved.js";

// const { User, Enrollment, Course, UserCourseAccess } = db;

// /* ============================================================
//    👩‍🎓 STUDENT MANAGEMENT
// ============================================================ */

// /**
//  * Get students by approval status
//  * @route GET /admin/students?status=pending|approved|rejected
//  */
// export const getStudentsByStatus = async (req, res) => {
//   try {
//     const { status } = req.query;
//     console.log("🔍 ADMIN: Fetching students with status:", status);

//     if (!status || !["pending", "approved", "rejected"].includes(status)) {
//       return res.status(400).json({ error: "Invalid or missing status" });
//     }

//     const students = await User.findAll({
//       where: { role: "student", approval_status: status },
//       attributes: ["id", "name", "email", "subject", "approval_status", "updatedAt"],
//       order: [["createdAt", "DESC"]],
//     });

//     console.log(`✅ ADMIN: Found ${students.length} students with status: ${status}`);
//     return res.json({ students });
//   } catch (err) {
//     console.error("❌ Error fetching students:", err);
//     return res.status(500).json({ error: "Failed to fetch students" });
//   }
// };

// /**
//  * Approve a student manually
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

//     console.log(`✅ ADMIN: Approved student ${student.email}`);
//     return res.json({ message: "Student approved", student });
//   } catch (err) {
//     console.error("❌ Error approving student:", err);
//     return res.status(500).json({ error: "Failed to approve student" });
//   }
// };

// /**
//  * Reject a student manually
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

//     console.log(`❌ ADMIN: Rejected student ${student.email}`);
//     return res.json({ message: "Student rejected", student });
//   } catch (err) {
//     console.error("❌ Error rejecting student:", err);
//     return res.status(500).json({ error: "Failed to reject student" });
//   }
// };

// /* ============================================================
//    🎓 ENROLLMENT MANAGEMENT
// ============================================================ */

// /**
//  * Get enrollments by status
//  * @route GET /admin/enrollments?status=pending|approved|rejected
//  */
// export const getEnrollmentsByStatus = async (req, res) => {
//   try {
//     const { status } = req.query;
//     console.log("🎯 ADMIN: Fetching enrollments with status:", status || "all");

//     const whereCondition = {};
//     if (status && ["pending", "approved", "rejected"].includes(status)) {
//       whereCondition.approval_status = status;
//       console.log("✅ Filtering by approval_status:", status);
//     } else {
//       console.log("⚠️ No valid status filter, showing all enrollments");
//     }

//     // 🛠️ TEMPORARY: Remove payment_status filter for debugging
//     // whereCondition.payment_status = "paid";
    
//     console.log("🔍 DEBUG: Final where condition:", JSON.stringify(whereCondition));

//     const enrollments = await Enrollment.findAll({
//       where: whereCondition,
//       include: [
//         { model: User, as: "student", attributes: ["id", "name", "email"] },
//         { model: Course, as: "course", attributes: ["id", "title", "price"] },
//       ],
//       order: [["createdAt", "DESC"]],
//     });

//     console.log(`📊 ADMIN: Found ${enrollments.length} enrollments matching criteria`);
    
//     // 🛠️ DEBUG: Log each enrollment found
//     enrollments.forEach((enrollment, index) => {
//       console.log(`   ${index + 1}.`, {
//         id: enrollment.id,
//         student: `${enrollment.student?.name} (${enrollment.student?.email})`,
//         course: enrollment.course?.title,
//         payment: enrollment.payment_status,
//         approval: enrollment.approval_status,
//         createdAt: enrollment.createdAt
//       });
//     });

//     return res.json({ success: true, count: enrollments.length, enrollments });
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
//     console.log("✅ ADMIN: Approving enrollment:", id);

//     const enrollment = await Enrollment.findByPk(id, {
//       include: [
//         { model: User, as: "student" },
//         { model: Course, as: "course" },
//       ],
//     });

//     if (!enrollment) {
//       return res.status(404).json({ error: "Enrollment not found" });
//     }

//     enrollment.approval_status = "approved";
//     await enrollment.save();

//     // Update access table if exists
//     await UserCourseAccess.update(
//       { approval_status: "approved" },
//       { where: { user_id: enrollment.user_id, course_id: enrollment.course_id } }
//     );

//     // Send approval email
//     try {
//       const emailTemplate = courseEnrollmentApproved(enrollment.student, enrollment.course);
//       await sendEmail(enrollment.student.email, emailTemplate.subject, emailTemplate.html);
//       console.log("📧 Approval email sent to:", enrollment.student.email);
//     } catch (emailErr) {
//       console.warn("⚠️ Failed to send approval email:", emailErr.message);
//     }

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
//     console.log("❌ ADMIN: Rejecting enrollment:", id);

//     const enrollment = await Enrollment.findByPk(id);
//     if (!enrollment) {
//       return res.status(404).json({ error: "Enrollment not found" });
//     }

//     enrollment.approval_status = "rejected";
//     await enrollment.save();

//     return res.json({ message: "Enrollment rejected", enrollment });
//   } catch (err) {
//     console.error("❌ Error rejecting enrollment:", err);
//     return res.status(500).json({ error: "Failed to reject enrollment" });
//   }
// };

// /* ============================================================
//    🧪 DEBUG UTILITIES (Optional Admin Tools)
// ============================================================ */

// /**
//  * List all enrollments for debugging
//  * @route GET /admin/debug/enrollments
//  */
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

//     console.log("📊 DEBUG Enrollment Stats:", stats);
//     return res.json({ success: true, summary: stats, enrollments: all });
//   } catch (err) {
//     console.error("❌ Debug enrollments error:", err);
//     return res.status(500).json({ error: "Debug failed" });
//   }
// };





// controllers/adminController.js
import { Enrollment, User, Course } from "../models/index.js";

/* =====================================================
   📊 Get Enrollments by Status
===================================================== */
export const getEnrollmentsByStatus = async (req, res) => {
  try {
    const { status } = req.query;

    let whereCondition = {};

    // Default: show all paid enrollments unless status explicitly requested
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      whereCondition.approval_status = status;
    }
    whereCondition.payment_status = "paid"; // ensure only paid enrollments are fetched

    const enrollments = await Enrollment.findAll({
      where: whereCondition,
      include: [
        { model: User, as: "student", attributes: ["id", "name", "email"] },
        { model: Course, as: "course", attributes: ["id", "title", "price"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({ success: true, enrollments });
  } catch (error) {
    console.error("❌ Error fetching enrollments:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch enrollments." });
  }
};
