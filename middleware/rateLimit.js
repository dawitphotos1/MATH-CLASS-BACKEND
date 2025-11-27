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

