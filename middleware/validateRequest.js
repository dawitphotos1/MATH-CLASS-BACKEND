const Joi = require("joi");

// Middleware factory for validating request body
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.details.map((d) => d.message),
      });
    }
    next();
  };
};

module.exports = validateRequest;
