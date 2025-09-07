// const { User, UserCourseAccess, Course } = require("../models");
// const sendEmail = require("../utils/sendEmail");
// const Stripe = require("stripe");
// const courseEnrollmentApproved = require("../utils/emails/courseEnrollmentApproved");

// const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// exports.getMyProfile = async (req, res) => {
//   try {
//     res.json({ user: req.user });
//   } catch (err) {
//     console.error("❌ Error fetching profile:", err.message);
//     res.status(500).json({ error: "Failed to fetch profile" });
//   }
// };

// exports.getUsersByStatus = (status) => async (req, res) => {
//   try {
//     const users = await User.findAll({
//       where: { approval_status: status, role: "student" },
//       attributes: ["id", "name", "email", "subject", "createdAt"],
//     });
//     res.json(users);
//   } catch (err) {
//     console.error(`❌ Error fetching ${status} users:`, err.message);
//     res.status(500).json({ error: `Failed to fetch ${status} users` });
//   }
// };

// exports.approveUser = async (req, res) => {
//   try {
//     const user = await User.findByPk(req.params.id);
//     if (!user) return res.status(404).json({ error: "User not found" });

//     user.approval_status = "approved";
//     await user.save();

//     await sendEmail(
//       user.email,
//       "Your MathClass account has been approved ✅",
//       `<p>Hello ${user.name},</p><p>Your account has been approved. You may now <a href="${process.env.FRONTEND_URL}/login">log in</a>.</p>`
//     );

//     res.json({ message: "User approved successfully" });
//   } catch (err) {
//     console.error("❌ Error approving user:", err.message);
//     res.status(500).json({ error: "Failed to approve user" });
//   }
// };

// exports.rejectUser = async (req, res) => {
//   try {
//     const user = await User.findByPk(req.params.id);
//     if (!user) return res.status(404).json({ error: "User not found" });

//     user.approval_status = "rejected";
//     await user.save();

//     await sendEmail(
//       user.email,
//       "Your MathClass account was rejected ❌",
//       `<p>Hello ${user.name},</p><p>Unfortunately, your account has been rejected. If you believe this is a mistake, please contact support.</p>`
//     );

//     res.json({ message: "User rejected successfully" });
//   } catch (err) {
//     console.error("❌ Error rejecting user:", err.message);
//     res.status(500).json({ error: "Failed to reject user" });
//   }
// };

// exports.deleteUser = async (req, res) => {
//   try {
//     const user = await User.findByPk(req.params.id);
//     if (!user) return res.json({ message: "User deleted successfully" });

//     if (
//       req.user.id !== parseInt(req.params.id) &&
//       !["admin", "teacher"].includes(req.user.role)
//     ) {
//       return res.status(403).json({ error: "Unauthorized" });
//     }

//     await user.destroy();
//     res.json({ message: "User deleted successfully" });
//   } catch (err) {
//     console.error("❌ Error deleting user:", err.message);
//     res.status(500).json({ error: "Failed to delete user" });
//   }
// };

// exports.confirmEnrollment = async (req, res) => {
//   try {
//     const { session_id } = req.body;
//     if (!session_id)
//       return res.status(400).json({ error: "Session ID is required" });

//     const session = await stripe.checkout.sessions.retrieve(session_id);
//     if (session.payment_status !== "paid")
//       return res.status(400).json({ error: "Payment not completed" });

//     const userId = req.user.id;
//     const courseId = parseInt(session.metadata?.courseId, 10);
//     if (!courseId || isNaN(courseId))
//       return res.status(400).json({ error: "Invalid course ID" });

//     const course = await Course.findByPk(courseId);
//     if (!course)
//       return res
//         .status(404)
//         .json({ error: `Course not found for ID ${courseId}` });

//     let enrollment = await UserCourseAccess.findOne({
//       where: { user_id: userId, course_id: courseId },
//     });

//     if (enrollment) {
//       if (enrollment.approval_status === "approved")
//         return res.status(400).json({ error: "Already enrolled" });

//       enrollment.approval_status = "approved";
//       enrollment.accessGrantedAt = new Date();
//       await enrollment.save();
//     } else {
//       enrollment = await UserCourseAccess.create({
//         user_id: userId,
//         course_id: courseId,
//         approval_status: "approved",
//         accessGrantedAt: new Date(),
//       });
//     }

//     const user = await User.findByPk(userId);
//     const { subject, html } = courseEnrollmentApproved(user, course);
//     await sendEmail(user.email, subject, html);

//     res.json({ success: true, message: "Enrollment confirmed successfully" });
//   } catch (err) {
//     console.error("❌ Error confirming enrollment:", err.message);
//     res.status(500).json({ error: "Failed to confirm enrollment" });
//   }
// };

// exports.getMyCourses = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const accessRecords = await UserCourseAccess.findAll({
//       where: { user_id: userId, approval_status: "approved" },
//       include: [
//         {
//           model: Course,
//           as: "course",
//           include: [
//             {
//               model: User,
//               as: "teacher",
//               attributes: ["id", "name", "email"],
//             },
//           ],
//         },
//       ],
//     });

//     const enrolledCourses = accessRecords
//       .filter((record) => record.course)
//       .map((record) => record.course);

//     res.json({ success: true, courses: enrolledCourses });
//   } catch (err) {
//     console.error("❌ Error fetching enrolled courses:", err.message);
//     res.status(500).json({ error: "Failed to fetch enrolled courses" });
//   }
// };



const { Lesson, Course, UserCourseAccess, User } = require("../models");
const path = require("path");
const fs = require("fs");

// 1. Create a new course
exports.createCourse = async (req, res) => {
  try {
    const { title, description, price } = req.body;

    const course = await Course.create({
      title,
      description,
      price,
      teacherId: req.user.id,
    });

    res.status(201).json({ success: true, course });
  } catch (err) {
    console.error("🔥 Create course error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to create course",
      details: err.message,
    });
  }
};

// 2. Get lessons by course ID (auth required)
exports.getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const lessons = await Lesson.findAll({
      where: { course_id: courseId },
      order: [["order_index", "ASC"]],
    });

    res.json({ success: true, lessons });
  } catch (err) {
    console.error("🔥 Get lessons by course error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch lessons",
      details: err.message,
    });
  }
};

// 3. Fetch a public course by slug (no lessons, no auth)
exports.getPublicCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({
      where: { slug },
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
        },
      ],
      attributes: [
        "id",
        "title",
        "slug",
        "description",
        "price",
        "thumbnailUrl",
        "introVideoUrl",
        "attachmentUrls",
        "teacherId",
      ],
    });

    if (!course)
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });

    res.json({ success: true, course });
  } catch (err) {
    console.error("🔥 Fetch public course error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch course",
      details: err.message,
    });
  }
};

// 4. Fetch full course (with lessons) by slug - only if user is enrolled/approved
exports.getCourseWithLessonsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.id;

    const course = await Course.findOne({
      where: { slug },
      include: [
        {
          model: Lesson,
          as: "lessons",
          order: [["order_index", "ASC"]],
        },
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!course)
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });

    const access = await UserCourseAccess.findOne({
      where: {
        course_id: course.id,
        user_id: userId,
        approval_status: "approved",
      },
    });

    if (!access)
      return res.status(403).json({ success: false, error: "Access denied" });

    res.json({ success: true, course });
  } catch (err) {
    console.error("🔥 Fetch full course error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch course",
      details: err.message,
    });
  }
};

// 5. Delete a course (and its lessons) — only teacher or admin
exports.deleteCourse = async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    const course = await Course.findByPk(courseId);

    if (!course)
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });

    if (req.user.role !== "admin" && course.teacherId !== req.user.id) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    await Lesson.destroy({ where: { course_id: courseId } });
    await course.destroy();

    res.json({ success: true, message: "Course and its lessons deleted" });
  } catch (err) {
    console.error("🔥 Delete course error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete course",
      details: err.message,
    });
  }
};

// 6. Rename a course attachment
exports.renameCourseAttachment = async (req, res) => {
  try {
    const { courseId, index } = req.params;
    const { newName } = req.body;
    const course = await Course.findByPk(courseId);

    if (!course)
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });

    if (req.user.role !== "admin" && req.user.id !== course.teacherId) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    const attachments = course.attachmentUrls || [];
    const oldUrl = attachments[+index];
    if (!oldUrl)
      return res
        .status(404)
        .json({ success: false, error: "Attachment not found" });

    const oldPath = path.join(__dirname, "..", oldUrl);
    const ext = path.extname(oldPath);
    const newFileName = `${Date.now()}-${newName}${ext}`;
    const newPath = path.join(__dirname, "..", "Uploads", newFileName);
    const newUrl = `/Uploads/${newFileName}`;

    if (!fs.existsSync(oldPath))
      return res.status(404).json({
        success: false,
        error: "Attachment file not found",
      });

    fs.renameSync(oldPath, newPath);
    attachments[+index] = newUrl;
    course.attachmentUrls = attachments;
    await course.save();

    res.json({ success: true, updatedUrl: newUrl });
  } catch (err) {
    console.error("🔥 Rename attachment error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to rename attachment",
      details: err.message,
    });
  }
};

// 7. Delete a course attachment
exports.deleteCourseAttachment = async (req, res) => {
  try {
    const { courseId, index } = req.params;
    const course = await Course.findByPk(courseId);

    if (!course)
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });

    if (req.user.role !== "admin" && req.user.id !== course.teacherId) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    const attachments = course.attachmentUrls || [];
    const fileUrl = attachments[+index];
    if (!fileUrl)
      return res
        .status(404)
        .json({ success: false, error: "Attachment not found" });

    const filePath = path.join(__dirname, "..", fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    attachments.splice(+index, 1);
    course.attachmentUrls = attachments;
    await course.save();

    res.json({ success: true, message: "Attachment deleted" });
  } catch (err) {
    console.error("🔥 Delete attachment error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete attachment",
      details: err.message,
    });
  }
};

// 8. Get courses for a teacher (auth required)
exports.getTeacherCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { teacherId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, courses });
  } catch (err) {
    console.error("🔥 Get teacher courses error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch teacher courses",
      details: err.message,
    });
  }
};

// 9. Admin: Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [{ model: User, as: "teacher", attributes: ["id", "name", "email"] }],
      order: [["createdAt", "DESC"]],
    });

    res.json({ success: true, courses });
  } catch (err) {
    console.error("🔥 Get all courses error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to fetch all courses",
      details: err.message,
    });
  }
};

// ✅ Aliases for exported function names used in routes
exports.getCourseBySlug = exports.getPublicCourseBySlug;
exports.getEnrolledCourseBySlug = exports.getCourseWithLessonsBySlug;
exports.renameAttachment = exports.renameCourseAttachment;
exports.deleteAttachment = exports.deleteCourseAttachment;
