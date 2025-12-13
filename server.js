// server.js - CLEANED VERSION
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import sequelize from "./config/db.js";

// Import models
import db from "./models/index.js";

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
import { handleStripeWebhook } from "./controllers/paymentController.js";

// =========================================================
// ENVIRONMENT SETUP
// =========================================================
console.log("🔧 Initializing Math Class Platform Backend...");

if (process.env.NODE_ENV === "production") {
  if (!process.env.BACKEND_URL) {
    process.env.BACKEND_URL =
      process.env.RENDER_EXTERNAL_URL ||
      "https://mathe-class-website-backend-1.onrender.com";
  }
  if (!process.env.API_BASE_URL) {
    process.env.API_BASE_URL = `${process.env.BACKEND_URL}/api/v1`;
  }
}

const app = express();
app.set("trust proxy", 1);

// =========================================================
// UPLOAD DIRECTORY
// =========================================================
const UPLOAD_DIR = path.join(process.cwd(), "Uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// =========================================================
// SECURITY MIDDLEWARE
// =========================================================
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "https://js.stripe.com"],
      imgSrc: ["'self'", "data:", "https:", "http:", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "https://*.stripe.com"],
      frameSrc: ["'self'", "https://*.stripe.com"],
    },
  },
}));

// =========================================================
// CORS CONFIG
// =========================================================
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "https://math-class-platform.netlify.app",
      "https://mathe-class-website-backend-1.onrender.com",
      "http://localhost:3000",
      "http://localhost:5000",
      "http://localhost:5173",
    ].filter(Boolean);

    if (!origin || allowedOrigins.includes(origin) || 
        origin.includes(".netlify.app") || 
        origin.includes(".onrender.com") ||
        origin.includes("localhost")) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

app.use(cors(corsOptions));

// =========================================================
// REQUEST LOGGING (Simplified)
// =========================================================
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`📥 ${req.method} ${req.originalUrl}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`📤 ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });
  
  next();
});

// =========================================================
// STATIC FILES
// =========================================================
app.use("/api/v1/files", express.static(UPLOAD_DIR));

// =========================================================
// STRIPE WEBHOOK (must be before json parser)
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
app.use("/api/v1/files", filesRoutes);
app.use("/api/v1/units", unitRoutes);
app.use("/api/v1/teacher", teacherRoutes);

// =========================================================
// HEALTH CHECK
// =========================================================
app.get("/api/v1/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      success: true, 
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      status: "unhealthy",
      error: "Database disconnected"
    });
  }
});

// =========================================================
// ROOT ENDPOINT
// =========================================================
app.get("/", (req, res) => {
  res.json({
    message: "Math Class Platform API",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    endpoints: {
      auth: "/api/v1/auth",
      courses: "/api/v1/courses",
      lessons: "/api/v1/lessons",
      enrollments: "/api/v1/enrollments",
      health: "/api/v1/health",
    },
    timestamp: new Date().toISOString()
  });
});

// =========================================================
// 404 HANDLER
// =========================================================
app.use((req, res) => {
  console.warn(`❌ 404 Not Found: ${req.method} ${req.originalUrl}`);
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
  console.error("❌ SERVER ERROR:", err.message);
  
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";
  
  res.status(statusCode).json({
    success: false,
    error: isProduction && statusCode === 500 
      ? "Internal server error" 
      : err.message,
    timestamp: new Date().toISOString()
  });
});

// =========================================================
// START SERVER
// =========================================================
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    console.log("🔗 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Sync database
    await sequelize.sync({ alter: process.env.ALTER_DB === "true" });
    console.log("✅ Database synced");

    app.listen(PORT, "0.0.0.0", () => {
      console.log("=".repeat(50));
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Backend URL: ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`);
      console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log("=".repeat(50));
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
};

start();

export default app;