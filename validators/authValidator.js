


// // validators/authValidator.js
// const { body } = require("express-validator");

// exports.registerValidation = [
//   body("name").notEmpty().withMessage("Name is required"),
//   body("email").isEmail().withMessage("Valid email is required"),
//   body("password")
//     .isLength({ min: 8 })
//     .withMessage("Password must be at least 8 characters"),
//   body("role")
//     .isIn(["admin", "teacher", "student"])
//     .withMessage("Role must be admin, teacher, or student"),
//   body("subject")
//     .optional()
//     .isString()
//     .withMessage("Subject must be a string"),
// ];

// exports.loginValidation = [
//   body("email").isEmail().withMessage("Valid email is required"),
//   body("password").notEmpty().withMessage("Password is required"),
// ];




// validators/authValidator.js
const { body } = require("express-validator");

exports.registerValidation = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .isIn(["admin", "teacher", "student"])
    .withMessage("Role must be admin, teacher, or student"),
  body("subject")
    .optional()
    .isString()
    .withMessage("Subject must be a string"),
];

exports.loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];