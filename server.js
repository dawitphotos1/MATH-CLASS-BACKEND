// server.js — Clean Production-Ready Backend
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
import sequelize from "./config/db.js";
import {
  apiRateLimit,
  authRateLimit,
  uploadRateLimit,
} from "./middleware/rateLimit.js";
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
import { handleStripeWebhook } from "./controllers/paymentController.js";
// Add with your other route imports
import teacherRoutes from "./routes/teacher.js";

const app = express();
app.set("trust proxy", 1);

// Path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static files
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/uploads_videos", express.static(path.join(__dirname, "Uploads")));

// Stripe webhook (raw body)
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);
app.use(apiRateLimit);
// JSON middleware (skip for file/webhook routes)
app.use((req, res, next) => {
  const skipJsonRoutes = [
    "/api/v1/payments/webhook",
    "/api/v1/files/upload",
  ];
  if (skipJsonRoutes.some((route) => req.originalUrl.startsWith(route))) return next();
  express.json({ limit: "50mb" })(req, res, next);
});
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Security
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(cookieParser());

// CORS setup
const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "https://math-class-platform.netlify.app",
  "https://leafy-semolina-fc0934.netlify.app",
];
app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        origin.includes("localhost") ||
        allowedOrigins.includes(origin) ||
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
  })
);
app.options("*", cors());

// Rate limiting (production only)
if (process.env.NODE_ENV === "production") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: {
      success: false,
      error: "Too many requests. Try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api", limiter);
  console.log("✅ Rate limiting enabled");
} else {
  console.log("⚡ Rate limiting disabled (development)");
}

// Request logger
app.use((req, _, next) => {
  console.log(
    `📥 [${req.method}] ${req.originalUrl} — Origin: ${req.headers.origin || "N/A"}`
  );
  next();
});

// Routes
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
app.use("/api/v1/auth", authRateLimit);
app.use("/api/v1/upload", uploadRateLimit);
// Health check
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
    });
  } catch (err) {
    console.error("❌ Health check failed:", err.message);
    res.status(500).json({ success: false, error: "Database disconnected" });
  }
});

// API info
app.get("/api/v1/info", (req, res) => {
  res.json({
    success: true,
    app: "Math Class Platform API",
    version: "1.0.0",
    env: process.env.NODE_ENV,
    endpoints: listEndpoints(app).map((e) => ({
      path: e.path,
      methods: e.methods,
    })),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.message);
  if (err.message.includes("CORS"))
    return res.status(403).json({ success: false, error: "CORS policy: Origin not allowed" });

  res.status(err.statusCode || 500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Render keep-alive (production)
if (process.env.NODE_ENV === "production" && process.env.BACKEND_URL) {
  const keepAlive = () => {
    fetch(`${process.env.BACKEND_URL}/api/v1/health`)
      .then((r) => r.ok && console.log("💤 Render ping success"))
      .catch((err) => console.warn("⚠️ Keep-alive error:", err.message));
  };
  setInterval(keepAlive, 5 * 60 * 1000);
  setTimeout(keepAlive, 10000);
  console.log("✅ Keep-alive started");
}

// Server start
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

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 URL: ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err.message);
    process.exit(1);
  }
};

// Graceful shutdown
for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, async () => {
    console.log(`🛑 ${signal} received, closing DB...`);
    await sequelize.close();
    process.exit(0);
  });
}

startServer();
export default app;
