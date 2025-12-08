
// SERVER.JS 

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

// =========================================================
// ENVIRONMENT LOGGING + FIXES FOR RENDER
// =========================================================
console.log("🔧 Initializing environment...");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("BACKEND_URL:", process.env.BACKEND_URL);
console.log("RENDER_EXTERNAL_URL:", process.env.RENDER_EXTERNAL_URL);

// Auto-set backend URL in production
if (process.env.NODE_ENV === "production") {
  console.log("⚡ Production mode detected");

  if (!process.env.BACKEND_URL) {
    process.env.BACKEND_URL =
      process.env.RENDER_EXTERNAL_URL ||
      "https://mathe-class-website-backend-1.onrender.com";

    console.log("✅ BACKEND_URL set:", process.env.BACKEND_URL);
  }

  if (!process.env.API_BASE_URL) {
    process.env.API_BASE_URL = `${process.env.BACKEND_URL}/api/v1`;
    console.log("✅ API_BASE_URL:", process.env.API_BASE_URL);
  }
}

const app = express();
app.set("trust proxy", 1);

// =========================================================
// UPLOAD DIRECTORY
// =========================================================
const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(process.cwd(), "Uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log("📁 Created Uploads folder:", UPLOAD_DIR);
}

// =========================================================
// HELMET (Relaxed for PDF/Video Preview)
// =========================================================
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })
);

// Allow iframe embedding
app.use((req, res, next) => {
  res.removeHeader("X-Frame-Options");
  res.setHeader("X-Frame-Options", "ALLOWALL");
  next();
});

// =========================================================
// CORS CONFIG
// =========================================================
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL,
  "https://math-class-platform.netlify.app",
  "https://mathe-class-website-backend-1.onrender.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
].filter(Boolean);

console.log("🌐 Allowed CORS Origins:", ALLOWED_ORIGINS);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (
        ALLOWED_ORIGINS.includes(origin) ||
        origin.includes(".netlify.app") ||
        origin.includes(".onrender.com")
      ) {
        console.log("✅ CORS allowed:", origin);
        return callback(null, true);
      }

      console.warn("⚠️ CORS blocked:", origin);
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);

app.options("*", cors());

// =========================================================
// STATIC FILE SERVER (PDF / VIDEO PREVIEW)
// =========================================================
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
        res.setHeader("Content-Disposition", "inline");
      }

      res.setHeader("X-Frame-Options", "ALLOWALL");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// =========================================================
// DEBUG ENV ENDPOINT
// =========================================================
app.get("/api/v1/debug-env", (req, res) => {
  res.json({
    success: true,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      BACKEND_URL: process.env.BACKEND_URL,
      FRONTEND_URL: process.env.FRONTEND_URL,
      API_BASE_URL: process.env.API_BASE_URL,
    },
  });
});

// =========================================================
// STRIPE WEBHOOK (RAW BODY)
// =========================================================
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// =========================================================
// BODY PARSING
// =========================================================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// =========================================================
// API ROUTES
// =========================================================
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

// =========================================================
// HEALTH CHECK
// =========================================================
app.get("/api/v1/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ success: true, status: "healthy" });
  } catch (err) {
    res.status(500).json({ success: false, error: "Database disconnected" });
  }
});

// =========================================================
// SERVE FRONTEND (React Build)
// =========================================================
const __dirnamePath = path.resolve();

if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirnamePath, "public");

  console.log("📦 Serving React Frontend from:", frontendPath);

  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

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
/* GLOBAL ERROR HANDLER */
// =========================================================
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err);
  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// =========================================================
// START SERVER
// =========================================================
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await sequelize.sync({ alter: process.env.ALTER_DB === "true" });

    app.listen(PORT, "0.0.0.0", () => {
      console.log("==================================================");
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(
        `🌍 Backend URL: ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`
      );
      console.log("==================================================");

      console.log("📋 API Endpoints:");
      listEndpoints(app)
        .filter((e) => e.path.includes("/api/v1"))
        .forEach((e) => console.log(e.methods.join(", "), e.path));
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

start();

export default app;
