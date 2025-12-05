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

// /* Routes */
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

// /* =========================================================
//    UPLOAD DIRECTORY
// ========================================================= */
// const UPLOAD_DIR =
//   process.env.UPLOAD_DIR || path.join(process.cwd(), "Uploads");
// if (!fs.existsSync(UPLOAD_DIR)) {
//   fs.mkdirSync(UPLOAD_DIR, { recursive: true });
//   console.log("📁 Created Uploads folder:", UPLOAD_DIR);
// }

// /* =========================================================
//    HELMET - RELAXED FOR IFRAME PREVIEW + PDF
// ========================================================= */
// app.use(
//   helmet({
//     crossOriginResourcePolicy: false,
//     contentSecurityPolicy: false,
//   })
// );

// /* =========================================================
//    FIXED: REMOVE X-FRAME-OPTIONS
// ========================================================= */
// app.use((req, res, next) => {
//   res.removeHeader("X-Frame-Options");
//   next();
// });

// /* =========================================================
//    CORS CONFIG — OPTION 2 (Netlify + localhost)
// ========================================================= */
// const ALLOWED_ORIGINS = [
//   process.env.FRONTEND_URL, // Netlify
//   "http://localhost:3000",
//   "http://127.0.0.1:3000",
// ].filter(Boolean);

// console.log("🔵 Allowed CORS origins:", ALLOWED_ORIGINS);

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true);

//       if (ALLOWED_ORIGINS.includes(origin)) {
//         return callback(null, true);
//       }

//       console.warn("❌ CORS BLOCKED origin:", origin);
//       return callback(new Error("CORS: Origin not allowed: " + origin));
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//   })
// );

// /* =========================================================
//    STATIC FILE SERVER (PDF / VIDEO)
// ========================================================= */
// app.use(
//   "/api/v1/files",
//   express.static(UPLOAD_DIR, {
//     setHeaders: (res, filePath) => {
//       const ext = path.extname(filePath).toLowerCase();

//       if (ext === ".pdf") {
//         res.setHeader("Content-Type", "application/pdf");
//         res.setHeader("Content-Disposition", "inline");
//       }

//       if (ext === ".mp4") {
//         res.setHeader("Content-Type", "video/mp4");
//       }

//       // Allow iframe embedding
//       res.setHeader("X-Frame-Options", "ALLOWALL");
//       res.setHeader("Access-Control-Allow-Origin", "*");
//     },
//   })
// );

// /* =========================================================
//    STRIPE WEBHOOK — RAW BODY
// ========================================================= */
// app.post(
//   "/api/v1/payments/webhook",
//   express.raw({ type: "application/json" }),
//   handleStripeWebhook
// );

// /* =========================================================
//    NORMAL BODY PARSING (after webhook)
// ========================================================= */
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// app.use(cookieParser());

// /* =========================================================
//    ROUTES
// ========================================================= */
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/admin", adminRoutes);
// app.use("/api/v1/courses", courseRoutes);
// app.use("/api/v1/lessons", lessonRoutes);
// app.use("/api/v1/enrollments", enrollmentRoutes);
// app.use("/api/v1/payments", paymentRoutes);
// app.use("/api/v1/test-email", testEmailRoutes);
// app.use("/api/v1/files", filesRoutes);
// app.use("/api/v1/units", unitRoutes);
// app.use("/api/v1/teacher", teacherRoutes);

// /* =========================================================
//    HEALTH CHECK
// ========================================================= */
// app.get("/api/v1/health", async (req, res) => {
//   try {
//     await sequelize.authenticate();
//     res.json({ success: true, status: "healthy" });
//   } catch (err) {
//     res.status(500).json({ success: false, error: "Database disconnected" });
//   }
// });

// /* =========================================================
//    404
// ========================================================= */
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     error: "Route not found",
//     path: req.originalUrl,
//   });
// });

// /* =========================================================
//    GLOBAL ERROR HANDLER
// ========================================================= */
// app.use((err, req, res, next) => {
//   console.error("❌ SERVER ERROR:", err.message);
//   res.status(500).json({
//     success: false,
//     error:
//       process.env.NODE_ENV === "production"
//         ? "Internal server error"
//         : err.message,
//   });
// });

// /* =========================================================
//    START SERVER
// ========================================================= */
// const PORT = process.env.PORT || 5000;

// const start = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("✅ DB connected");

//     await sequelize.sync({ alter: process.env.ALTER_DB === "true" });
//     console.log("📦 Models synchronized");

//     app.listen(PORT, "0.0.0.0", () => {
//       console.log(`🚀 Server running on ${PORT}`);
//       console.log(`🌍 Backend URL: ${process.env.BACKEND_URL}`);
//       console.log(`📁 Files served from /api/v1/files`);
//     });
//   } catch (err) {
//     console.error("❌ Failed to start server:", err.message);
//     process.exit(1);
//   }
// };

// start();

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

/* If behind a proxy (Heroku / Render / Cloudflare), trust proxy so req.protocol is correct */
app.set("trust proxy", true);

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
   HELMET - relaxed for iframe & PDF handling (we set specific headers later)
========================================================= */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })
);

/* =========================================================
   Remove legacy X-Frame header so in-browser previews work
========================================================= */
app.use((req, res, next) => {
  res.removeHeader("X-Frame-Options");
  next();
});

/* =========================================================
   CORS CONFIG
   - Only allow configured origins
   - Support credentials (cookies)
========================================================= */
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_ADMIN_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

console.log("🔵 Allowed CORS origins:", ALLOWED_ORIGINS);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      console.warn("❌ CORS BLOCKED origin:", origin);
      return callback(new Error("CORS: Origin not allowed: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Accept",
      "X-Requested-With",
      "Origin",
    ],
  })
);

/* =========================================================
   Static files (PDF / VIDEO)
   - Add a tiny middleware to set CORS headers dynamically for the file route
   - Serve files from UPLOAD_DIR via /api/v1/files/*
========================================================= */
app.use("/api/v1/files", (req, res, next) => {
  const origin = req.get("origin");
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else {
    // Files are generally public, allow wide access where useful (but prefer configured origin)
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  // Allow embedding in iframes (for preview)
  res.setHeader("X-Frame-Options", "ALLOWALL");
  next();
});

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
    },
  })
);

/* =========================================================
   STRIPE WEBHOOK — RAW BODY
   (This route must be declared BEFORE express.json())
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
  console.error("❌ SERVER ERROR:", err?.message || err);
  // If it's a CORS error, return 403
  if (err && /CORS/i.test(err.message)) {
    return res.status(403).json({ success: false, error: err.message });
  }
  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err?.message || "Unknown error",
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

    // Sync models optionally in development
    if (process.env.ALTER_DB === "true") {
      await sequelize.sync({ alter: true });
      console.log("📦 Models synchronized (alter)");
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Backend URL: ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`);
      console.log(`📁 Files served from /api/v1/files`);
      console.log("📚 Registered endpoints:");
      console.table(listEndpoints(app));
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err?.message || err);
    process.exit(1);
  }
};

start();

export default app;
