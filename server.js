// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import listEndpoints from "express-list-endpoints";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import sequelize from "./config/db.js";

// Routes
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
import fileRoutes from "./routes/fileRoutes.js";

const app = express();
app.set("trust proxy", 1);

// ------------------------------
// Path Configuration
// ------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ------------------------------
// CRITICAL: Static File Serving Configuration
// ------------------------------
const uploadsDir = path.join(process.cwd(), "Uploads");

// Ensure Uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Created Uploads directory:", uploadsDir);
}

// Serve files from Uploads directory via /api/v1/files route
app.use("/api/v1/files", express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    // Set proper headers for different file types
    if (filePath.endsWith('.pdf')) {
      res.set('Content-Type', 'application/pdf');
      res.set('Content-Disposition', 'inline');
    } else if (filePath.endsWith('.mp4')) {
      res.set('Content-Type', 'video/mp4');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.set('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.set('Content-Type', 'image/png');
    }
  }
}));

console.log("✅ Static file serving configured for /api/v1/files ->", uploadsDir);

// Legacy static routes (keep for backward compatibility)
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/uploads_videos", express.static(path.join(__dirname, "Uploads")));

// ------------------------------
// Stripe webhook (must come before JSON middleware)
// ------------------------------
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// ------------------------------
// JSON middleware
// ------------------------------
app.use((req, res, next) => {
  const skipJsonRoutes = ["/api/v1/payments/webhook", "/api/v1/files/upload"];
  if (skipJsonRoutes.some((route) => req.originalUrl.startsWith(route))) return next();
  express.json({ limit: "50mb" })(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ------------------------------
// Security Middleware
// ------------------------------
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(cookieParser());

// ------------------------------
// CORS Setup
// ------------------------------
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "https://math-class-platform.netlify.app",
  "https://leafy-semolina-fc0934.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Postman/server requests
      if (
        allowedOrigins.includes(origin) ||
        origin.includes("localhost") ||
        origin.endsWith(".netlify.app")
      ) {
        return callback(null, true);
      }
      console.warn("🚫 Blocked CORS origin:", origin);
      return callback(new Error(`CORS not allowed for: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Stripe-Signature",
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);
app.options("*", cors());

// ------------------------------
// Rate Limiting
// ------------------------------
import { apiRateLimit, authRateLimit, uploadRateLimit } from "./middleware/rateLimit.js";

if (process.env.NODE_ENV === "production") {
  app.use("/api", apiRateLimit);
  app.use("/api/v1/auth", authRateLimit);
  app.use("/api/v1/upload", uploadRateLimit);
  console.log("✅ Rate limiting enabled");
} else {
  console.log("⚡ Rate limiting disabled (development)");
}

// ------------------------------
// Request Logger
// ------------------------------
app.use((req, _, next) => {
  console.log(
    `📥 [${req.method}] ${req.originalUrl} — Origin: ${req.headers.origin || "N/A"}`
  );
  next();
});

// ------------------------------
// API Routes
// ------------------------------
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
app.use("/api/v1/files", fileRoutes); // Additional file routes

// ------------------------------
// Health check
// ------------------------------
app.get("/api/v1/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      success: true,
      status: "healthy",
      database: "connected",
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      uploadsDir: uploadsDir,
      uploadsExists: fs.existsSync(uploadsDir),
    });
  } catch (err) {
    console.error("❌ Health check failed:", err.message);
    res.status(500).json({ success: false, error: "Database disconnected" });
  }
});

// ------------------------------
// File serving test endpoint
// ------------------------------
app.get("/api/v1/files-test", (req, res) => {
  const testFiles = fs.existsSync(uploadsDir) 
    ? fs.readdirSync(uploadsDir).slice(0, 5) 
    : [];
    
  res.json({
    success: true,
    uploadsDir,
    exists: fs.existsSync(uploadsDir),
    fileCount: testFiles.length,
    sampleFiles: testFiles,
    staticRoutes: {
      "/api/v1/files": "Serves files from Uploads directory",
      "/uploads": "Legacy route for public/uploads",
      "/uploads_videos": "Legacy route for Uploads"
    }
  });
});

// ------------------------------
// API info
// ------------------------------
app.get("/api/v1/info", (req, res) => {
  res.json({
    success: true,
    app: "Math Class Platform API",
    version: "1.0.0",
    env: process.env.NODE_ENV,
    backendUrl: process.env.BACKEND_URL,
    uploadsDir: uploadsDir,
    endpoints: listEndpoints(app).map((e) => ({ path: e.path, methods: e.methods })),
  });
});

// ------------------------------
// 404 handler
// ------------------------------
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: "Route not found", 
    path: req.originalUrl,
    method: req.method 
  });
});

// ------------------------------
// Global Error Handler
// ------------------------------
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.message);
  
  if (err.message.includes("CORS")) {
    return res.status(403).json({ 
      success: false, 
      error: "CORS policy: Origin not allowed" 
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
    ...(process.env.NODE_ENV === "development" && { 
      stack: err.stack,
      path: req.originalUrl
    }),
  });
});

// ------------------------------
// Server Start
// ------------------------------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    const syncOptions =
      process.env.NODE_ENV === "production"
        ? { alter: false }
        : { alter: process.env.ALTER_DB === "true" };
    await sequelize.sync(syncOptions);
    console.log("✅ Models synchronized");

    // Verify Uploads directory
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log("📁 Created Uploads directory on startup");
    }

    console.log("📁 Uploads directory:", uploadsDir);
    console.log("🔗 File serving route: /api/v1/files ->", uploadsDir);

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 URL: ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`);
      console.log(`📁 File serving: ${process.env.BACKEND_URL || `http://localhost:${PORT}`}/api/v1/files/`);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err.message);
    process.exit(1);
  }
};

startServer();

export default app;