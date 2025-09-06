// ✅ controllers/userController.js
const { User } = require("../models");

exports.getMyProfile = async (req, res) => {
  console.log("🎯 /me route - req.user =", req.user); // ✅ Debug log
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: [
        "id",
        "name",
        "email",
        "role",
        "subject",
        "createdAt",
        "lastLogin",
        "approval_status", // ✅ Must match DB column name
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};
