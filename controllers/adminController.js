// // controllers/adminController.js
// import User from "../models/User.js";

// /**
//  * Get students by approval status
//  * @route GET /admin/students?status=pending|approved|rejected
//  */
// export const getStudentsByStatus = async (req, res) => {
//   try {
//     const { status } = req.query;

//     if (!status || !["pending", "approved", "rejected"].includes(status)) {
//       return res.status(400).json({ error: "Invalid or missing status" });
//     }

//     const students = await User.findAll({
//       where: { role: "student", approval_status: status },
//       attributes: ["id", "name", "email", "subject", "approval_status", "updatedAt"],
//     });

//     return res.json({ students });
//   } catch (err) {
//     console.error("❌ Error fetching students:", err);
//     return res.status(500).json({ error: "Failed to fetch students" });
//   }
// };

// /**
//  * Approve a student
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

//     return res.json({ message: "Student approved", student });
//   } catch (err) {
//     console.error("❌ Error approving student:", err);
//     return res.status(500).json({ error: "Failed to approve student" });
//   }
// };

// /**
//  * Reject a student
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

//     return res.json({ message: "Student rejected", student });
//   } catch (err) {
//     console.error("❌ Error rejecting student:", err);
//     return res.status(500).json({ error: "Failed to reject student" });
//   }
// };




// controllers/adminController.js
import User from "../models/User.js";

/**
 * Get students by approval status
 * @route GET /admin/students?status=pending|approved|rejected
 */
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
      order: [["updatedAt", "DESC"]], // most recent first
    });

    return res.json({ students });
  } catch (err) {
    console.error("❌ Error fetching students:", err);
    return res.status(500).json({ error: "Failed to fetch students" });
  }
};

/**
 * Approve a student
 * @route PATCH /admin/students/:id/approve
 */
export const approveStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findByPk(id);
    if (!student || student.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    if (student.approval_status === "approved") {
      return res
        .status(400)
        .json({ error: "Student is already approved" });
    }

    student.approval_status = "approved";
    await student.save();

    return res.json({ message: "✅ Student approved", student });
  } catch (err) {
    console.error("❌ Error approving student:", err);
    return res.status(500).json({ error: "Failed to approve student" });
  }
};

/**
 * Reject a student
 * @route PATCH /admin/students/:id/reject
 */
export const rejectStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findByPk(id);
    if (!student || student.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    if (student.approval_status === "rejected") {
      return res
        .status(400)
        .json({ error: "Student is already rejected" });
    }

    student.approval_status = "rejected";
    await student.save();

    return res.json({ message: "🚫 Student rejected", student });
  } catch (err) {
    console.error("❌ Error rejecting student:", err);
    return res.status(500).json({ error: "Failed to reject student" });
  }
};

/**
 * Reset student to pending (optional helper)
 * @route PATCH /admin/students/:id/pending
 */
export const setPendingStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await User.findByPk(id);
    if (!student || student.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    if (student.approval_status === "pending") {
      return res
        .status(400)
        .json({ error: "Student is already pending" });
    }

    student.approval_status = "pending";
    await student.save();

    return res.json({ message: "🔄 Student reset to pending", student });
  } catch (err) {
    console.error("❌ Error setting student pending:", err);
    return res.status(500).json({ error: "Failed to reset student" });
  }
};
