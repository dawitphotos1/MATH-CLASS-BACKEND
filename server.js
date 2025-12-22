// // server.js
// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import cookieParser from "cookie-parser";
// import path from "path";
// import fs from "fs";
// import sequelize from "./config/db.js";

// /* Routes */
// import authRoutes from "./routes/authRoutes.js";
// import adminRoutes from "./routes/admin.js";
// import courseRoutes from "./routes/courses.js";
// import lessonRoutes from "./routes/lessonRoutes.js";
// import enrollmentRoutes from "./routes/enrollmentRoutes.js";
// import paymentRoutes from "./routes/paymentRoutes.js";
// import filesRoutes from "./routes/files.js";
// import unitRoutes from "./routes/unitRoutes.js";
// import teacherRoutes from "./routes/teacher.js";
// import emailRoutes from "./routes/email.js";
// import { handleStripeWebhook } from "./controllers/paymentController.js";
// // In your main server.js or routes/index.js
// import sublessonRoutes from "./routes/sublessonRoutes.js";

// const app = express();
// app.set("trust proxy", 1);

// // =========================================================
// // SECURITY
// // =========================================================
// app.use(
//   helmet({
//     crossOriginResourcePolicy: false,
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         styleSrc: ["'self'", "'unsafe-inline'"],
//         scriptSrc: ["'self'", "https://js.stripe.com"],
//         imgSrc: ["'self'", "data:", "https:"],
//         connectSrc: ["'self'", "https://*.stripe.com"],
//         frameSrc: ["'self'", "https://*.stripe.com"],
//       },
//     },
//   })
// );

// // =========================================================
// // CORS
// // =========================================================
// app.use(
//   cors({
//     origin: true,
//     credentials: true,
//   })
// );

// // =========================================================
// // STRIPE WEBHOOK (RAW BODY)
// // =========================================================
// app.post(
//   "/api/v1/payments/webhook",
//   express.raw({ type: "application/json" }),
//   handleStripeWebhook
// );

// // =========================================================
// // BODY PARSERS
// // =========================================================
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// app.use(cookieParser());

// // =========================================================
// // ROUTES
// // =========================================================
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/admin", adminRoutes);
// app.use("/api/v1/courses", courseRoutes);
// app.use("/api/v1/lessons", lessonRoutes);
// app.use("/api/v1/enrollments", enrollmentRoutes);
// app.use("/api/v1/payments", paymentRoutes);
// app.use("/api/v1/files", filesRoutes);
// app.use("/api/v1/units", unitRoutes);
// app.use("/api/v1/teacher", teacherRoutes);
// app.use("/api/v1/email", emailRoutes);
// app.use("/api/v1/sublessons", sublessonRoutes);
// // =========================================================
// // HEALTH
// // =========================================================
// app.get("/api/v1/health", async (_, res) => {
//   try {
//     await sequelize.authenticate();
//     res.json({ success: true, status: "healthy" });
//   } catch {
//     res.status(500).json({ success: false, status: "unhealthy" });
//   }
// });

// // =========================================================
// // 404
// // =========================================================
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     error: "Route not found",
//   });
// });

// // =========================================================
// // START
// // =========================================================
// const PORT = process.env.PORT || 5000;

// (async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("✅ Database connected");

//     app.listen(PORT, "0.0.0.0", () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ Startup failed:", err.message);
//     process.exit(1);
//   }
// })();

// export default app;





import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import sequelize from "./config/db.js";

/* Routes */
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/admin.js";
import courseRoutes from "./routes/courses.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import filesRoutes from "./routes/files.js";
import unitRoutes from "./routes/unitRoutes.js";
import teacherRoutes from "./routes/teacher.js";
import emailRoutes from "./routes/email.js";
import sublessonRoutes from "./routes/sublessonRoutes.js";
import { handleStripeWebhook } from "./controllers/paymentController.js";

const app = express();
app.set("trust proxy", 1);

// =========================================================
// CORS CONFIGURATION (FIXED)
// =========================================================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "https://mathe-class-platform.netlify.app",
  process.env.FRONTEND_URL || "",
].filter(Boolean); // Remove empty strings

console.log("🌐 Allowed CORS Origins:", allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) {
      return callback(null, true);
    }

    // Allow if origin is in allowed list or contains 'localhost'
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes("localhost")) {
      console.log(`✅ CORS allowed for origin: ${origin}`);
      return callback(null, true);
    } else {
      console.log(`❌ CORS blocked for origin: ${origin}`);
      return callback(
        new Error(`CORS policy: Origin ${origin} not allowed`),
        false
      );
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
  exposedHeaders: ["Content-Disposition"],
  maxAge: 86400, // 24 hours
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests globally
app.options("*", cors(corsOptions));

// =========================================================
// SECURITY
// =========================================================
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "https://js.stripe.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://*.stripe.com"],
        frameSrc: ["'self'", "https://*.stripe.com"],
      },
    },
  })
);

// =========================================================
// STRIPE WEBHOOK (RAW BODY - MUST BE BEFORE JSON PARSER)
// =========================================================
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// =========================================================
// BODY PARSERS
// =========================================================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// =========================================================
// LOGGING MIDDLEWARE
// =========================================================
app.use((req, res, next) => {
  console.log(
    `${req.method} ${req.path} - Origin: ${req.headers.origin || "none"}`
  );
  next();
});

// =========================================================
// ROUTES
// =========================================================
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/lessons", lessonRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/files", filesRoutes);
app.use("/api/v1/units", unitRoutes);
app.use("/api/v1/teacher", teacherRoutes);
app.use("/api/v1/email", emailRoutes);
app.use("/api/v1/sublessons", sublessonRoutes);

// =========================================================
// HEALTH CHECK
// =========================================================
app.get("/api/v1/health", async (_, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (error) {
    console.error("❌ Database health check failed:", error.message);
    res.status(500).json({
      success: false,
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: "disconnected",
    });
  }
});

// CORS test endpoint
app.get("/api/v1/cors-test", (req, res) => {
  res.json({
    success: true,
    message: "CORS is working!",
    yourOrigin: req.headers.origin,
    allowedOrigins: allowedOrigins,
    timestamp: new Date().toISOString(),
  });
});

// =========================================================
// 404 HANDLER
// =========================================================
app.use((req, res) => {
  console.log(`❌ 404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
});

// =========================================================
// ERROR HANDLER
// =========================================================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  console.error(err.stack);

  // Handle CORS errors
  if (err.message.includes("CORS policy")) {
    return res.status(403).json({
      success: false,
      error: "CORS error: " + err.message,
      allowedOrigins: allowedOrigins,
      yourOrigin: req.headers.origin,
    });
  }

  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// =========================================================
// START SERVER
// =========================================================
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || "Not set"}`);
      console.log(`🔄 CORS enabled for origins:`, allowedOrigins);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err.message);
    process.exit(1);
  }
})();

export default app;