// // middleware/rateLimit.js
// import rateLimit from "express-rate-limit";

// // Rate limit for lesson routes
// export const lessonRateLimit = rateLimit({
//   windowMs: 1 * 60 * 1000, // 1 minute
//   max: 100, // Limit each IP to 100 requests per minute
//   message: {
//     success: false,
//     error: "Too many requests to lessons API, please try again later.",
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // General API rate limit
// export const apiRateLimit = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 1000, // Limit each IP to 1000 requests per windowMs
//   message: {
//     success: false,
//     error: "Too many API requests, please try again later.",
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // Strict rate limit for authentication endpoints
// export const authRateLimit = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10, // Limit each IP to 10 login attempts per windowMs
//   message: {
//     success: false,
//     error: "Too many authentication attempts, please try again later.",
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // File upload rate limiting
// export const uploadRateLimit = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 20, // Limit each IP to 20 file uploads per windowMs
//   message: {
//     success: false,
//     error: "Too many file uploads, please try again later.",
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });





// middleware/rateLimit.js
import rateLimit from 'express-rate-limit';

// Rate limit for lesson routes
export const lessonRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  message: {
    success: false,
    error: "Too many requests to lessons API, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limit
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    error: "Too many API requests, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limit for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per windowMs
  message: {
    success: false,
    error: "Too many authentication attempts, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload rate limiting
export const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 file uploads per windowMs
  message: {
    success: false,
    error: "Too many file uploads, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});