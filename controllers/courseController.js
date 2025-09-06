const { User, UserCourseAccess, Course } = require("../models");
const sendEmail = require("../utils/sendEmail");
const Stripe = require("stripe");
const courseEnrollmentApproved = require("../utils/emails/courseEnrollmentApproved");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

exports.getMyProfile = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    console.error("❌ Error fetching profile:", err.message);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

exports.getUsersByStatus = (status) => async (req, res) => {
  try {
    const users = await User.findAll({
      where: { approval_status: status, role: "student" },
      attributes: ["id", "name", "email", "subject", "createdAt"],
    });
    res.json(users);
  } catch (err) {
    console.error(`❌ Error fetching ${status} users:`, err.message);
    res.status(500).json({ error: `Failed to fetch ${status} users` });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.approval_status = "approved";
    await user.save();

    await sendEmail(
      user.email,
      "Your MathClass account has been approved ✅",
      `<p>Hello ${user.name},</p><p>Your account has been approved. You may now <a href="${process.env.FRONTEND_URL}/login">log in</a>.</p>`
    );

    res.json({ message: "User approved successfully" });
  } catch (err) {
    console.error("❌ Error approving user:", err.message);
    res.status(500).json({ error: "Failed to approve user" });
  }
};

exports.rejectUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.approval_status = "rejected";
    await user.save();

    await sendEmail(
      user.email,
      "Your MathClass account was rejected ❌",
      `<p>Hello ${user.name},</p><p>Unfortunately, your account has been rejected. If you believe this is a mistake, please contact support.</p>`
    );

    res.json({ message: "User rejected successfully" });
  } catch (err) {
    console.error("❌ Error rejecting user:", err.message);
    res.status(500).json({ error: "Failed to reject user" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.json({ message: "User deleted successfully" });

    if (
      req.user.id !== parseInt(req.params.id) &&
      !["admin", "teacher"].includes(req.user.role)
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting user:", err.message);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

exports.confirmEnrollment = async (req, res) => {
  try {
    const { session_id } = req.body;
    if (!session_id)
      return res.status(400).json({ error: "Session ID is required" });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid")
      return res.status(400).json({ error: "Payment not completed" });

    const userId = req.user.id;
    const courseId = parseInt(session.metadata?.courseId, 10);
    if (!courseId || isNaN(courseId))
      return res.status(400).json({ error: "Invalid course ID" });

    const course = await Course.findByPk(courseId);
    if (!course)
      return res
        .status(404)
        .json({ error: `Course not found for ID ${courseId}` });

    let enrollment = await UserCourseAccess.findOne({
      where: { user_id: userId, course_id: courseId },
    });

    if (enrollment) {
      if (enrollment.approval_status === "approved")
        return res.status(400).json({ error: "Already enrolled" });

      enrollment.approval_status = "approved";
      enrollment.accessGrantedAt = new Date();
      await enrollment.save();
    } else {
      enrollment = await UserCourseAccess.create({
        user_id: userId,
        course_id: courseId,
        approval_status: "approved",
        accessGrantedAt: new Date(),
      });
    }

    const user = await User.findByPk(userId);
    const { subject, html } = courseEnrollmentApproved(user, course);
    await sendEmail(user.email, subject, html);

    res.json({ success: true, message: "Enrollment confirmed successfully" });
  } catch (err) {
    console.error("❌ Error confirming enrollment:", err.message);
    res.status(500).json({ error: "Failed to confirm enrollment" });
  }
};

exports.getMyCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const accessRecords = await UserCourseAccess.findAll({
      where: { user_id: userId, approval_status: "approved" },
      include: [
        {
          model: Course,
          as: "course",
          include: [
            {
              model: User,
              as: "teacher",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
    });

    const enrolledCourses = accessRecords
      .filter((record) => record.course)
      .map((record) => record.course);

    res.json({ success: true, courses: enrolledCourses });
  } catch (err) {
    console.error("❌ Error fetching enrolled courses:", err.message);
    res.status(500).json({ error: "Failed to fetch enrolled courses" });
  }
};
