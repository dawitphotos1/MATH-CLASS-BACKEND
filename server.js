// server.js
import dotenv from "dotenv";
dotenv.config();

// 🔥 CRITICAL FIX FOR RENDER: Ensure environment variables are properly set
console.log("🔧 Initializing environment...");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("BACKEND_URL available:", !!process.env.BACKEND_URL);
console.log("RENDER_EXTERNAL_URL available:", !!process.env.RENDER_EXTERNAL_URL);
console.log("PORT:", process.env.PORT);

// Set default environment variables for Render deployment
if (process.env.NODE_ENV === 'production') {
  console.log("⚡ Production mode detected");
  
  // If BACKEND_URL is not set, use RENDER_EXTERNAL_URL or default Render URL
  if (!process.env.BACKEND_URL) {
    if (process.env.RENDER_EXTERNAL_URL) {
      process.env.BACKEND_URL = process.env.RENDER_EXTERNAL_URL;
      console.log("✅ Set BACKEND_URL from RENDER_EXTERNAL_URL:", process.env.BACKEND_URL);
    } else {
      process.env.BACKEND_URL = 'https://mathe-class-website-backend-1.onrender.com';
      console.log("✅ Set default BACKEND_URL for Render:", process.env.BACKEND_URL);
    }
  }
  
  // Ensure API_BASE_URL is set
  if (!process.env.API_BASE_URL && process.env.BACKEND_URL) {
    process.env.API_BASE_URL = `${process.env.BACKEND_URL}/api/v1`;
    console.log("✅ Set API_BASE_URL:", process.env.API_BASE_URL);
  }
}

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
   FIXED: REMOVE X-FRAME-OPTIONS to allow iframe embedding
========================================================= */
app.use((req, res, next) => {
  res.removeHeader("X-Frame-Options");
  res.setHeader("X-Frame-Options", "ALLOWALL");
  next();
});

/* =========================================================
   CORS CONFIG — Fixed for Netlify + Render
========================================================= */
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL, // Netlify
  "https://math-class-platform.netlify.app",
  "https://mathe-class-website-backend-1.onrender.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
].filter((origin) => origin && origin.trim() !== "");

console.log("🌐 Allowed CORS origins:", ALLOWED_ORIGINS);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) {
        console.log("📨 Request with no origin (allowed)");
        return callback(null, true);
      }
      
      // Check if origin is in allowed list
      if (ALLOWED_ORIGINS.includes(origin)) {
        console.log("✅ CORS allowed for origin:", origin);
        return callback(null, true);
      }
      
      // Allow all Netlify preview deployments
      if (origin.includes('.netlify.app')) {
        console.log("✅ Allowing Netlify deployment:", origin);
        return callback(null, true);
      }
      
      // Allow all Render deployments
      if (origin.includes('.onrender.com')) {
        console.log("✅ Allowing Render deployment:", origin);
        return callback(null, true);
      }
      
      console.warn("⚠️ CORS blocked origin:", origin);
      return callback(null, true); // Temporarily allow all for debugging
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
    exposedHeaders: ["Content-Disposition"],
  })
);

// Handle preflight requests
app.options("*", cors());

/* =========================================================
   STATIC FILE SERVER (PDF / VIDEO) with proper headers
========================================================= */
app.use(
  "/api/v1/files",
  express.static(UPLOAD_DIR, {
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();

      if (ext === ".pdf") {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline; filename=\"preview.pdf\"");
      }

      if (ext === ".mp4") {
        res.setHeader("Content-Type", "video/mp4");
        res.setHeader("Content-Disposition", "inline; filename=\"preview.mp4\"");
      }

      // Allow iframe embedding for previews
      res.setHeader("X-Frame-Options", "ALLOWALL");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

/* =========================================================
   DEBUG ENDPOINT - Check environment variables
========================================================= */
app.get("/api/v1/debug-env", (req, res) => {
  res.json({
    success: true,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      BACKEND_URL: process.env.BACKEND_URL,
      RENDER_EXTERNAL_URL: process.env.RENDER_EXTERNAL_URL,
      FRONTEND_URL: process.env.FRONTEND_URL,
      API_BASE_URL: process.env.API_BASE_URL,
      PORT: process.env.PORT,
      has_backend_url: !!process.env.BACKEND_URL,
      request_origin: req.headers.origin,
      current_time: new Date().toISOString(),
      server_url: `${req.protocol}://${req.get('host')}`
    }
  });
});

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
    res.json({ 
      success: true, 
      status: "healthy",
      backendUrl: process.env.BACKEND_URL,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "Database disconnected" });
  }
});

/* =========================================================
   PREVIEW TEST ENDPOINT
========================================================= */
app.get("/api/v1/test-preview", (req, res) => {
  res.json({
    success: true,
    message: "Preview endpoint is working",
    backendUrl: process.env.BACKEND_URL,
    frontendUrl: process.env.FRONTEND_URL,
    environment: process.env.NODE_ENV,
    filesUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/v1/files`
  });
});

/* =========================================================
   404
========================================================= */
app.use((req, res) => {
  console.log("❌ Route not found:", req.originalUrl);
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
  });
});

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err.message);
  console.error("Stack:", err.stack);
  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

/* =========================================================
   START SERVER
========================================================= */
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await sequelize.sync({ alter: process.env.ALTER_DB === "true" });
    console.log("📦 Database models synchronized");

    app.listen(PORT, "0.0.0.0", () => {
      console.log("=".repeat(50));
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Backend URL: ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
      console.log(`📁 Files served from: ${process.env.BACKEND_URL || `http://localhost:${PORT}`}/api/v1/files`);
      console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log("=".repeat(50));
      
      // List all endpoints for debugging
      console.log("\n📋 Available endpoints:");
      const endpoints = listEndpoints(app);
      endpoints.forEach(endpoint => {
        if (endpoint.path.includes('/api/v1/')) {
          console.log(`  ${endpoint.methods.join(', ')} ${endpoint.path}`);
        }
      });
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    console.error("Error details:", err);
    process.exit(1);
  }
};

start();

export default app;