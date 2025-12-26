// // server.js
// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import cookieParser from "cookie-parser";
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
// import sublessonRoutes from "./routes/sublessonRoutes.js";

// import { handleStripeWebhook } from "./controllers/paymentController.js";

// const app = express();
// app.set("trust proxy", 1);

// // =========================================================
// // CORS CONFIGURATION
// // =========================================================
// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:5173",
//   "http://127.0.0.1:3000",
//   "http://127.0.0.1:5173",
//   "https://mathe-class-platform.netlify.app",
//   process.env.FRONTEND_URL,
// ].filter(Boolean);

// const corsOptions = {
//   origin: (origin, callback) => {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin) || origin.includes("localhost")) {
//       return callback(null, true);
//     }
//     return callback(new Error(`CORS blocked for origin: ${origin}`));
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization", "Accept"],
//   exposedHeaders: ["Content-Disposition"],
// };

// app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));

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
// // STRIPE WEBHOOK (MUST BE BEFORE JSON PARSER)
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
// // HEALTH CHECK
// // =========================================================
// app.get("/api/v1/health", async (_, res) => {
//   try {
//     await sequelize.authenticate();
//     res.json({
//       success: true,
//       status: "healthy",
//       database: "connected",
//       timestamp: new Date().toISOString(),
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       status: "unhealthy",
//       database: "disconnected",
//       timestamp: new Date().toISOString(),
//     });
//   }
// });

// // =========================================================
// // 404 HANDLER
// // =========================================================
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     error: "Route not found",
//     path: req.originalUrl,
//   });
// });

// // =========================================================
// // GLOBAL ERROR HANDLER
// // =========================================================
// app.use((err, req, res, next) => {
//   console.error("❌ Error:", err.message);

//   if (err.message.includes("CORS")) {
//     return res.status(403).json({
//       success: false,
//       error: err.message,
//     });
//   }

//   res.status(500).json({
//     success: false,
//     error: "Internal server error",
//     message:
//       process.env.NODE_ENV === "development" ? err.message : undefined,
//   });
// });

// // =========================================================
// // START SERVER
// // =========================================================
// const PORT = process.env.PORT || 5000;

// (async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("✅ Database connected");

//     app.listen(PORT, "0.0.0.0", () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//       console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
//     });
//   } catch (err) {
//     console.error("❌ Startup failed:", err.message);
//     process.exit(1);
//   }
// })();

// export default app;




// server.js - UPDATED WITH PDF PROXY
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
import pdfProxyRouter from "./routes/pdfProxy.js"; // ✅ ADD THIS IMPORT

import { handleStripeWebhook } from "./controllers/paymentController.js";

const app = express();
app.set("trust proxy", 1);

// =========================================================
// CORS CONFIGURATION
// =========================================================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "https://mathe-class-platform.netlify.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.includes("localhost")) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  exposedHeaders: ["Content-Disposition"],
};

app.use(cors(corsOptions));
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
// STRIPE WEBHOOK (MUST BE BEFORE JSON PARSER)
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
app.use("/api/v1/pdf-proxy", pdfProxyRouter); // ✅ ADD THIS ROUTE

// =========================================================
// HEALTH CHECK
// =========================================================
app.get("/api/v1/health", async (_, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      success: true,
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      status: "unhealthy",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

// =========================================================
// 404 HANDLER
// =========================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

// =========================================================
// GLOBAL ERROR HANDLER
// =========================================================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);

  if (err.message.includes("CORS")) {
    return res.status(403).json({
      success: false,
      error: err.message,
    });
  }

  res.status(500).json({
    success: false,
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development" ? err.message : undefined,
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
      console.log(`📚 Available routes:`);
      console.log(`   - /api/v1/courses`);
      console.log(`   - /api/v1/lessons`);
      console.log(`   - /api/v1/pdf-proxy (✅ NEW: PDF proxy route)`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err.message);
    process.exit(1);
  }
})();

export default app;