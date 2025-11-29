// // server.js
// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import cookieParser from "cookie-parser";
// import listEndpoints from "express-list-endpoints";
// import path from "path";
// import fs from "fs";
// import sequelize from "./config/db.js";

// // routes
// import authRoutes from "./routes/authRoutes.js";
// import adminRoutes from "./routes/admin.js";
// import courseRoutes from "./routes/courses.js";
// import lessonRoutes from "./routes/lessonRoutes.js";
// import enrollmentRoutes from "./routes/enrollmentRoutes.js";
// import paymentRoutes from "./routes/paymentRoutes.js";
// import testEmailRoutes from "./routes/testEmail.js";
// import filesRoutes from "./routes/files.js";
// import unitRoutes from "./routes/unitRoutes.js";
// import teacherRoutes from "./routes/teacher.js";
// import { handleStripeWebhook } from "./controllers/paymentController.js";

// const app = express();
// app.set("trust proxy", 1);

// const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "Uploads");
// if (!fs.existsSync(UPLOAD_DIR)) {
//   fs.mkdirSync(UPLOAD_DIR, { recursive: true });
//   console.log("📁 Created upload directory:", UPLOAD_DIR);
// }

// /* Helmet - relaxed enough for iframe previews */
// app.use(
//   helmet({
//     crossOriginResourcePolicy: { policy: "cross-origin" },
//     contentSecurityPolicy: {
//       directives: {
//         defaultSrc: ["'self'"],
//         scriptSrc: ["'self'", "'unsafe-inline'", "https:"],
//         styleSrc: ["'self'", "'unsafe-inline'", "https:"],
//         imgSrc: ["'self'", "data:", "blob:", "https:"],
//         connectSrc: ["'self'", "https:", "wss:"],
//         frameSrc: ["'self'", process.env.FRONTEND_URL || "http://localhost:3000", "*"],
//         frameAncestors: ["'self'", process.env.FRONTEND_URL || "http://localhost:3000", "*"],
//       },
//     },
//   })
// );

// /* File static middleware - set headers for common types and allow iframe embedding */
// app.use("/api/v1/files", (req, res, next) => {
//   // Remove restrictive header (if any)
//   res.removeHeader("X-Frame-Options");
//   // Allow cross-origin requests to this route (files can be embedded)
//   res.setHeader("Access-Control-Allow-Origin", process.env.FRONTEND_URL || "*");
//   next();
// });

// app.use(
//   "/api/v1/files",
//   express.static(UPLOAD_DIR, {
//     setHeaders: (res, filePath) => {
//       const ext = path.extname(filePath).toLowerCase();
//       if (ext === ".pdf") {
//         res.setHeader("Content-Type", "application/pdf");
//         res.setHeader("Content-Disposition", "inline");
//       } else if (ext === ".mp4") {
//         res.setHeader("Content-Type", "video/mp4");
//       }
//       // Allow framing for previews
//       res.setHeader("X-Frame-Options", "ALLOWALL");
//     },
//   })
// );

// console.log("✅ Static file serving for /api/v1/files ->", UPLOAD_DIR);

// /* Stripe webhook must parse raw */
// app.post(
//   "/api/v1/payments/webhook",
//   express.raw({ type: "application/json" }),
//   handleStripeWebhook
// );

// /* Body parsing */
// app.use((req, res, next) => {
//   const skip = ["/api/v1/payments/webhook"];
//   if (skip.some((s) => req.originalUrl.startsWith(s))) return next();
//   express.json({ limit: "50mb" })(req, res, next);
// });
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// app.use(cookieParser());

// /* CORS */
// const allowedOrigins = [
//   process.env.FRONTEND_URL || "http://localhost:3000",
//   "http://127.0.0.1:3000",
// ];
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.includes(origin) || origin.includes("localhost") || origin.endsWith(".netlify.app")) {
//         return callback(null, true);
//       }
//       return callback(new Error(`CORS not allowed for origin ${origin}`));
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   })
// );

// /* Simple request logger */
// app.use((req, _, next) => {
//   console.log(`📥 [${req.method}] ${req.originalUrl} — Origin: ${req.headers.origin || "N/A"}`);
//   next();
// });

// /* Routes */
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/admin", adminRoutes);
// app.use("/api/v1/courses", courseRoutes);
// app.use("/api/v1/lessons", lessonRoutes);
// app.use("/api/v1/enrollments", enrollmentRoutes);
// app.use("/api/v1/payments", paymentRoutes);
// app.use("/api/v1/test-email", testEmailRoutes);
// app.use("/api/v1/files", filesRoutes); // additional debug + helper endpoints
// app.use("/api/v1/units", unitRoutes);
// app.use("/api/v1/teacher", teacherRoutes);

// /* Health and info */
// app.get("/api/v1/health", async (req, res) => {
//   try {
//     await sequelize.authenticate();
//     res.json({
//       success: true,
//       status: "healthy",
//       database: "connected",
//       env: process.env.NODE_ENV,
//       uploadsDir: UPLOAD_DIR,
//       timestamp: new Date().toISOString(),
//     });
//   } catch (err) {
//     console.error("Health check failed:", err.message);
//     res.status(500).json({ success: false, error: "Database disconnected" });
//   }
// });

// app.get("/api/v1/info", (req, res) => {
//   res.json({
//     success: true,
//     app: "Math Class Platform API",
//     version: "1.0.0",
//     env: process.env.NODE_ENV,
//     backendUrl: process.env.BACKEND_URL,
//     uploadsDir: UPLOAD_DIR,
//     endpoints: listEndpoints(app).map((e) => ({ path: e.path, methods: e.methods })),
//   });
// });

// /* 404 and global error handler */
// app.use((req, res) => {
//   res.status(404).json({ success: false, error: "Route not found", path: req.originalUrl });
// });

// app.use((err, req, res, next) => {
//   console.error("❌ Global Error:", err.message);
//   if (err.message && err.message.includes("CORS")) {
//     return res.status(403).json({ success: false, error: "CORS policy: Origin not allowed" });
//   }
//   res.status(err.statusCode || 500).json({
//     success: false,
//     error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
//     ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
//   });
// });

// /* Start server */
// const PORT = process.env.PORT || 5000;
// const startServer = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("✅ Database connected");
//     await sequelize.sync({ alter: process.env.ALTER_DB === "true" });
//     console.log("✅ Models synchronized");

//     app.listen(PORT, "0.0.0.0", () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//       console.log(`🌐 Backend URL: ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`);
//       console.log(`📁 File serving: ${process.env.BACKEND_URL || `http://localhost:${PORT}`}/api/v1/files/`);
//     });
//   } catch (err) {
//     console.error("❌ Server startup failed:", err.message);
//     process.exit(1);
//   }
// };
// startServer();

// export default app;



// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import listEndpoints from "express-list-endpoints";
import path from "path";
import fs from "fs";
import sequelize from "./config/db.js";

/* Routes */
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/admin.js";
import courseRoutes from "./routes/courses.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import testEmailRoutes from "./routes/testEmail.js";
import filesRoutes from "./routes/files.js";
import unitRoutes from "./routes/unitRoutes.js";
import teacherRoutes from "./routes/teacher.js";
import { handleStripeWebhook } from "./controllers/paymentController.js";

const app = express();
app.set("trust proxy", 1);

/* =========================================================
   UPLOAD DIRECTORY
========================================================= */
const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "Uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log("📁 Created Uploads folder:", UPLOAD_DIR);
}

/* =========================================================
   HELMET - RELAXED FOR IFRAME PREVIEW + PDF
========================================================= */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })
);

/* =========================================================
   FIXED: REMOVE X-FRAME-OPTIONS
========================================================= */
app.use((req, res, next) => {
  res.removeHeader("X-Frame-Options");
  next();
});

/* =========================================================
   CORS CONFIG — OPTION 2 (Netlify + localhost)
========================================================= */
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL, // Netlify
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

console.log("🔵 Allowed CORS origins:", ALLOWED_ORIGINS);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      console.warn("❌ CORS BLOCKED origin:", origin);
      return callback(new Error("CORS: Origin not allowed: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

/* =========================================================
   STATIC FILE SERVER (PDF / VIDEO)
========================================================= */
app.use(
  "/api/v1/files",
  express.static(UPLOAD_DIR, {
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();

      if (ext === ".pdf") {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline");
      }

      if (ext === ".mp4") {
        res.setHeader("Content-Type", "video/mp4");
      }

      // Allow iframe embedding
      res.setHeader("X-Frame-Options", "ALLOWALL");
      res.setHeader("Access-Control-Allow-Origin", "*");
    },
  })
);

/* =========================================================
   STRIPE WEBHOOK — RAW BODY
========================================================= */
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

/* =========================================================
   NORMAL BODY PARSING (after webhook)
========================================================= */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

/* =========================================================
   ROUTES
========================================================= */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/lessons", lessonRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/test-email", testEmailRoutes);
app.use("/api/v1/files", filesRoutes);
app.use("/api/v1/units", unitRoutes);
app.use("/api/v1/teacher", teacherRoutes);

/* =========================================================
   HEALTH CHECK
========================================================= */
app.get("/api/v1/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ success: true, status: "healthy" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Database disconnected" });
  }
});

/* =========================================================
   404
========================================================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err.message);
  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

/* =========================================================
   START SERVER
========================================================= */
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    await sequelize.sync({ alter: process.env.ALTER_DB === "true" });
    console.log("📦 Models synchronized");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on ${PORT}`);
      console.log(`🌍 Backend URL: ${process.env.BACKEND_URL}`);
      console.log(`📁 Files served from /api/v1/files`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

start();

export default app;
