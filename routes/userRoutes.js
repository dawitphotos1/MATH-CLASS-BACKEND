// routes/userRoutes.js
const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticateToken");

router.get("/me", authenticate, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.json({ user: req.user });
  } catch (error) {
    console.error("Error in /users/me:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
