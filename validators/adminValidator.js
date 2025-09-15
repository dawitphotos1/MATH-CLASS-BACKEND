

// validators/adminValidator.js
const { body, param } = require("express-validator");

exports.updateUserApprovalValidation = [
  param("userId").isInt().withMessage("User ID must be an integer"),
  body("status")
    .isIn(["approved", "rejected"])
    .withMessage("Status must be either approved or rejected"),
];
