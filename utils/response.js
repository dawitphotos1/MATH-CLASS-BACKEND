
// // utils/response.js

// /**
//  * Send a standardized success response
//  * @param {Response} res - Express response
//  * @param {Object} data - Any additional data to send
//  * @param {String} message - Optional success message
//  * @param {Number} status - HTTP status code (default 200)
//  */
// exports.sendSuccess = (res, data = {}, message = "OK", status = 200) => {
//   return res.status(status).json({
//     success: true,
//     message,
//     ...data,
//   });
// };

// /**
//  * Send a standardized error response
//  * @param {Response} res - Express response
//  * @param {Number} status - HTTP status code (default 500)
//  * @param {String} error - Error message
//  * @param {Object} details - Optional extra info (stack, validation errors, etc.)
//  */
// exports.sendError = (res, status = 500, error = "Server error", details = null) => {
//   const response = {
//     success: false,
//     error,
//   };
//   if (details) response.details = details;
//   return res.status(status).json(response);
// };




// utils/response.js

/**
 * Send a standardized success response
 * @param {Response} res - Express response
 * @param {Object} data - Any additional data to send
 * @param {String} message - Optional success message
 * @param {Number} status - HTTP status code (default 200)
 */
exports.sendSuccess = (res, data = {}, message = "OK", status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    ...data,
  });
};

/**
 * Send a standardized error response
 * @param {Response} res - Express response
 * @param {Number} status - HTTP status code (default 500)
 * @param {String} error - Error message
 * @param {Object} details - Optional extra info (stack, validation errors, etc.)
 */
exports.sendError = (res, status = 500, error = "Server error", details = null) => {
  const response = {
    success: false,
    error,
  };
  
  // Only include details in development
  if (details && process.env.NODE_ENV === "development") {
    response.details = details;
  }
  
  return res.status(status).json(response);
};