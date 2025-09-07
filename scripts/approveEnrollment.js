const { sequelize, User, UserCourseAccess } = require("../models");

(async () => {
  try {
    const userId = 2; // Change to your student user ID
    const courseId = 4; // Change to your course ID

    // Approve the user
    const user = await User.findByPk(userId);
    if (!user) throw new Error("Student not found");
    user.approvalStatus = "approved";
    await user.save();

    // Enroll or approve access
    const [enrollment, created] = await UserCourseAccess.findOrCreate({
      where: { userId, courseId },
      defaults: {
        approved: true,
        accessGrantedAt: new Date(),
      },
    });

    if (!created) {
      enrollment.approved = true;
      enrollment.accessGrantedAt = new Date();
      await enrollment.save();
    }

    console.log("✅ Student approved and enrolled successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
