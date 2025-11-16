//routes/__deprecated_enrollmentRoutes.js

const express = require("express");
const router = express.Router();
const {
  confirmEnrollment,
  approveEnrollment,
} = require("../controllers/enrollmentController");
const authenticate = require("../middleware/authMiddleware"); // ✅ matches your other files

router.post("/confirm", authenticate, confirmEnrollment);
router.post("/approve", authenticate, approveEnrollment); // ✅ new route

module.exports = router;
