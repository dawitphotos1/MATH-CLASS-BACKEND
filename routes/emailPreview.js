const express = require("express");
const router = express.Router();
const courseEnrollmentPending = require("../utils/emails/courseEnrollmentPending");

router.get("/preview-enrollment-email", (req, res) => {
  const sampleUser = {
    name: "Jane Doe",
    email: "jane@example.com",
  };

  const sampleCourse = {
    title: "Algebra 1",
    description:
      "Learn the fundamentals of algebra: equations, variables, and more.",
    price: 1200,
  };

  const { html } = courseEnrollmentPending(sampleUser, sampleCourse);
  res.send(html);
});

module.exports = router;
