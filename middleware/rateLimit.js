// // middleware/rateLimit.js
// import rateLimit from 'express-rate-limit';

// // Rate limit for lesson routes
// export const lessonRateLimit = rateLimit({
//   windowMs: 1 * 60 * 1000, // 1 minute
//   max: 100, // Limit each IP to 100 requests per minute
//   message: {
//     success: false,
//     error: "Too many requests to lessons API, please try again later."
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
//     error: "Too many API requests, please try again later."
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
//     error: "Too many authentication attempts, please try again later."
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
//     error: "Too many file uploads, please try again later."
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });




// middleware/rateLimit.js
import rateLimit from "express-rate-limit";

/**
 * Dynamic rate limits: strict in production, relaxed in development.
 */
const dynamicLimit = (prodLimit, devLimit) => (process.env.NODE_ENV === "production" ? prodLimit : devLimit);

/**
 * LESSON ROUTES — fetching lessons, previews, heavy traffic
 */
export const lessonRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: dynamicLimit(200, 2000),
  message: { success: false, error: "Too many requests to lessons API. Please wait a moment." },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * GENERAL API LIMIT
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: dynamicLimit(1000, 5000),
  message: { success: false, error: "Too many API requests from this IP. Slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * AUTH LIMIT — login / register endpoints
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: dynamicLimit(10, 200),
  message: { success: false, error: "Too many login attempts. Try again shortly." },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * FILE UPLOAD LIMIT
 */
export const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: dynamicLimit(20, 200),
  message: { success: false, error: "Too many file uploads. Wait a moment and retry." },
  standardHeaders: true,
  legacyHeaders: false,
});

