// // routes/userRoutes.js
// const express = require("express");
// const router = express.Router();
// const authenticate = require("../middleware/authenticateToken");

// router.get("/me", authenticate, async (req, res) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ error: "Unauthorized" });
//     }
//     res.json({ user: req.user });
//   } catch (error) {
//     console.error("Error in /users/me:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// module.exports = router;




const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { User } = require("../models");

// GET /api/v1/users/me
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ["id", "name", "email", "role", "approvalStatus", "subject"],
    });
    if (!user) {
      console.log("UserRoutes/me: User not found", { userId: req.user.userId });
      return res.status(404).json({ success: false, error: "User not found" });
    }
    console.log("UserRoutes/me: User fetched successfully", {
      email: user.email,
    });
    res.json({ success: true, user });
  } catch (error) {
    console.error("UserRoutes/me: Error", { error: error.message });
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

module.exports = router;