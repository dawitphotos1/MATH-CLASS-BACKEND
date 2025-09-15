const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { User } = require("../models");

// GET /api/v1/users/me
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ["id", "name", "email", "role", "approval_status", "subject"],
    });
    if (!user) {
      console.log("UserRoutes/me: User not found", { userId: req.user.userId });
      return res.status(404).json({ success: false, error: "User not found" });
    }
    console.log("UserRoutes/me: User fetched successfully", {
      email: user.email,
    });
    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        approval_status: user.approval_status,
        subject: user.subject,
      },
    });
  } catch (error) {
    console.error("UserRoutes/me: Error", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

module.exports = router;