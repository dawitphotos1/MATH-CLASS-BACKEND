
// // SERVER.JS 

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

// // =========================================================
// // ENVIRONMENT LOGGING + FIXES FOR RENDER
// // =========================================================
// console.log("🔧 Initializing environment...");
// console.log("NODE_ENV:", process.env.NODE_ENV);
// console.log("PORT:", process.env.PORT);
// console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
// console.log("BACKEND_URL:", process.env.BACKEND_URL);
// console.log("RENDER_EXTERNAL_URL:", process.env.RENDER_EXTERNAL_URL);

// // Auto-set backend URL in production
// if (process.env.NODE_ENV === "production") {
//   console.log("⚡ Production mode detected");

//   if (!process.env.BACKEND_URL) {
//     process.env.BACKEND_URL =
//       process.env.RENDER_EXTERNAL_URL ||
//       "https://mathe-class-website-backend-1.onrender.com";

//     console.log("✅ BACKEND_URL set:", process.env.BACKEND_URL);
//   }

//   if (!process.env.API_BASE_URL) {
//     process.env.API_BASE_URL = `${process.env.BACKEND_URL}/api/v1`;
//     console.log("✅ API_BASE_URL:", process.env.API_BASE_URL);
//   }
// }

// const app = express();
// app.set("trust proxy", 1);

// // =========================================================
// // UPLOAD DIRECTORY
// // =========================================================
// const UPLOAD_DIR =
//   process.env.UPLOAD_DIR || path.join(process.cwd(), "Uploads");

// if (!fs.existsSync(UPLOAD_DIR)) {
//   fs.mkdirSync(UPLOAD_DIR, { recursive: true });
//   console.log("📁 Created Uploads folder:", UPLOAD_DIR);
// }

// // =========================================================
// // HELMET (Relaxed for PDF/Video Preview)
// // =========================================================
// app.use(
//   helmet({
//     crossOriginResourcePolicy: false,
//     contentSecurityPolicy: false,
//   })
// );

// // Allow iframe embedding
// app.use((req, res, next) => {
//   res.removeHeader("X-Frame-Options");
//   res.setHeader("X-Frame-Options", "ALLOWALL");
//   next();
// });

// // =========================================================
// // CORS CONFIG
// // =========================================================
// const ALLOWED_ORIGINS = [
//   process.env.FRONTEND_URL,
//   "https://math-class-platform.netlify.app",
//   "https://mathe-class-website-backend-1.onrender.com",
//   "http://localhost:3000",
//   "http://127.0.0.1:3000",
//   "http://localhost:5000",
//   "http://127.0.0.1:5000",
// ].filter(Boolean);

// console.log("🌐 Allowed CORS Origins:", ALLOWED_ORIGINS);

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true);

//       if (
//         ALLOWED_ORIGINS.includes(origin) ||
//         origin.includes(".netlify.app") ||
//         origin.includes(".onrender.com")
//       ) {
//         console.log("✅ CORS allowed:", origin);
//         return callback(null, true);
//       }

//       console.warn("⚠️ CORS blocked:", origin);
//       return callback(null, true);
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
//   })
// );

// app.options("*", cors());

// // =========================================================
// // STATIC FILE SERVER (PDF / VIDEO PREVIEW)
// // =========================================================
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
//         res.setHeader("Content-Disposition", "inline");
//       }

//       res.setHeader("X-Frame-Options", "ALLOWALL");
//       res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
//     },
//   })
// );

// // =========================================================
// // DEBUG ENV ENDPOINT
// // =========================================================
// app.get("/api/v1/debug-env", (req, res) => {
//   res.json({
//     success: true,
//     env: {
//       NODE_ENV: process.env.NODE_ENV,
//       BACKEND_URL: process.env.BACKEND_URL,
//       FRONTEND_URL: process.env.FRONTEND_URL,
//       API_BASE_URL: process.env.API_BASE_URL,
//     },
//   });
// });

// // =========================================================
// // STRIPE WEBHOOK (RAW BODY)
// // =========================================================
// app.post(
//   "/api/v1/payments/webhook",
//   express.raw({ type: "application/json" }),
//   handleStripeWebhook
// );

// // =========================================================
// // BODY PARSING
// // =========================================================
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));
// app.use(cookieParser());

// // =========================================================
// // API ROUTES
// // =========================================================
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

// // =========================================================
// // HEALTH CHECK
// // =========================================================
// app.get("/api/v1/health", async (req, res) => {
//   try {
//     await sequelize.authenticate();
//     res.json({ success: true, status: "healthy" });
//   } catch (err) {
//     res.status(500).json({ success: false, error: "Database disconnected" });
//   }
// });

// // =========================================================
// // SERVE FRONTEND (React Build)
// // =========================================================
// const __dirnamePath = path.resolve();

// if (process.env.NODE_ENV === "production") {
//   const frontendPath = path.join(__dirnamePath, "public");

//   console.log("📦 Serving React Frontend from:", frontendPath);

//   app.use(express.static(frontendPath));

//   app.get("*", (req, res) => {
//     res.sendFile(path.join(frontendPath, "index.html"));
//   });
// }

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
// /* GLOBAL ERROR HANDLER */
// // =========================================================
// app.use((err, req, res, next) => {
//   console.error("❌ SERVER ERROR:", err);
//   res.status(500).json({
//     success: false,
//     error:
//       process.env.NODE_ENV === "production"
//         ? "Internal server error"
//         : err.message,
//   });
// });

// // =========================================================
// // START SERVER
// // =========================================================
// const PORT = process.env.PORT || 5000;

// const start = async () => {
//   try {
//     await sequelize.authenticate();
//     console.log("✅ Database connected");

//     await sequelize.sync({ alter: process.env.ALTER_DB === "true" });

//     app.listen(PORT, "0.0.0.0", () => {
//       console.log("==================================================");
//       console.log(`🚀 Server running on port ${PORT}`);
//       console.log(
//         `🌍 Backend URL: ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`
//       );
//       console.log("==================================================");

//       console.log("📋 API Endpoints:");
//       listEndpoints(app)
//         .filter((e) => e.path.includes("/api/v1"))
//         .forEach((e) => console.log(e.methods.join(", "), e.path));
//     });
//   } catch (err) {
//     console.error("❌ Failed to start server:", err);
//     process.exit(1);
//   }
// };

// start();

// export default app;




// server.js - UPDATED VERSION
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
// GLOBAL ERROR HANDLERS
// =========================================================
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION:', {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION at:', {
    promise: promise,
    reason: reason,
    timestamp: new Date().toISOString()
  });
});

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
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'", "https://*.cloudinary.com", "https://*.stripe.com"],
        frameSrc: ["'self'", "https://*.stripe.com"],
        mediaSrc: ["'self'", "https://*.cloudinary.com"],
      },
    },
  })
);

// Allow iframe embedding for PDF previews
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
  "http://localhost:5173", // Vite dev server
  "http://127.0.0.1:5173",
].filter(Boolean);

console.log("🌐 Allowed CORS Origins:", ALLOWED_ORIGINS);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is allowed
    if (
      ALLOWED_ORIGINS.includes(origin) ||
      origin.includes(".netlify.app") ||
      origin.includes(".onrender.com") ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1")
    ) {
      console.log(`✅ CORS allowed: ${origin}`);
      return callback(null, true);
    }

    console.warn(`⚠️ CORS blocked: ${origin}`);
    return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type", 
    "Authorization", 
    "Cookie", 
    "X-Requested-With",
    "Accept",
    "Origin"
  ],
  exposedHeaders: ["Content-Disposition"],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// =========================================================
// REQUEST LOGGING MIDDLEWARE
// =========================================================
app.use((req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;
  
  // Log request
  console.log(`📥 ${method} ${originalUrl} from ${ip}`);
  
  // Log response time
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const color = statusCode >= 500 ? '31' : statusCode >= 400 ? '33' : '32';
    console.log(`\x1b[${color}m📤 ${method} ${originalUrl} ${statusCode} ${duration}ms\x1b[0m`);
  });
  
  next();
});

// =========================================================
// STATIC FILE SERVER (PDF / VIDEO PREVIEW)
// =========================================================
app.use(
  "/api/v1/files",
  express.static(UPLOAD_DIR, {
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.pdf': 'application/pdf',
        '.mp4': 'video/mp4',
        '.mov': 'video/quicktime',
        '.avi': 'video/x-msvideo',
        '.webm': 'video/webm',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif'
      };
      
      if (mimeTypes[ext]) {
        res.setHeader("Content-Type", mimeTypes[ext]);
        res.setHeader("Content-Disposition", "inline");
      }
      
      // Allow cross-origin embedding
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Cache-Control", "public, max-age=86400"); // 24 hours cache
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
      DATABASE_URL: process.env.DATABASE_URL ? "***REDACTED***" : "Not set",
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? "***SET***" : "Not set",
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? "***SET***" : "Not set",
    },
    timestamp: new Date().toISOString(),
  });
});

// =========================================================
// STRIPE WEBHOOK (RAW BODY)
// =========================================================
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    console.log("💳 Stripe webhook received");
    next();
  },
  handleStripeWebhook
);

// =========================================================
// BODY PARSING
// =========================================================
app.use(express.json({ 
  limit: "50mb",
  verify: (req, res, buf, encoding) => {
    // Store raw body for webhook verification
    if (req.originalUrl === '/api/v1/payments/webhook') {
      req.rawBody = buf.toString(encoding || 'utf8');
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: "50mb" 
}));

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
    
    // Test database query
    const dbTest = await sequelize.query("SELECT 1+1 as result");
    
    res.json({ 
      success: true, 
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      environment: process.env.NODE_ENV,
      uptime: process.uptime()
    });
  } catch (err) {
    console.error("❌ Health check failed:", err.message);
    res.status(500).json({ 
      success: false, 
      status: "unhealthy",
      error: "Database disconnected",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

// =========================================================
// DATABASE STATUS
// =========================================================
app.get("/api/v1/db-status", async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users_count,
        (SELECT COUNT(*) FROM courses) as courses_count,
        (SELECT COUNT(*) FROM lessons) as lessons_count,
        (SELECT COUNT(*) FROM enrollments) as enrollments_count
    `);
    
    res.json({
      success: true,
      database: "connected",
      tables: results[0],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Database error",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

// =========================================================
// SERVE FRONTEND (React Build)
// =========================================================
const __dirnamePath = path.resolve();

if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirnamePath, "public");

  console.log("📦 Serving React Frontend from:", frontendPath);

  // Check if frontend build exists
  if (fs.existsSync(path.join(frontendPath, "index.html"))) {
    app.use(express.static(frontendPath, {
      maxAge: '1d', // Cache static files for 1 day
      setHeaders: (res, filePath) => {
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.html') {
          res.setHeader('Cache-Control', 'public, max-age=0');
        }
      }
    }));

    app.get("*", (req, res) => {
      res.sendFile(path.join(frontendPath, "index.html"));
    });
  } else {
    console.warn("⚠️ Frontend build not found at:", frontendPath);
    app.get("/", (req, res) => {
      res.json({
        message: "Backend API is running",
        frontend: "Frontend build not found",
        api: "Available at /api/v1",
        timestamp: new Date().toISOString()
      });
    });
  }
} else {
  // In development, just show API info
  app.get("/", (req, res) => {
    res.json({
      message: "Math Class Platform API (Development)",
      environment: process.env.NODE_ENV,
      endpoints: "/api/v1",
      health: "/api/v1/health",
      timestamp: new Date().toISOString()
    });
  });
}

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
    availableRoutes: process.env.NODE_ENV === "development" ? 
      listEndpoints(app).filter(e => e.path.includes("/api/v1")) : undefined
  });
});

// =========================================================
// GLOBAL ERROR HANDLER
// =========================================================
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });
  
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";
  
  res.status(statusCode).json({
    success: false,
    error: isProduction && statusCode === 500 
      ? "Internal server error" 
      : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
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

    // Sync database (use carefully in production)
    const syncOptions = { 
      alter: process.env.ALTER_DB === "true",
      force: process.env.FORCE_DB === "true" // NEVER use in production!
    };
    
    console.log("🔄 Syncing database with options:", syncOptions);
    await sequelize.sync(syncOptions);
    console.log("✅ Database synced");

    app.listen(PORT, "0.0.0.0", () => {
      console.log("=".repeat(50));
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Backend URL: ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`);
      console.log(`📊 API Base: ${process.env.API_BASE_URL || `http://localhost:${PORT}/api/v1`}`);
      console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log("=".repeat(50));

      // List all API endpoints
      if (process.env.NODE_ENV !== "production") {
        console.log("\n📋 Available API Endpoints:");
        const endpoints = listEndpoints(app)
          .filter(e => e.path.includes("/api/v1"))
          .sort((a, b) => a.path.localeCompare(b.path));
        
        endpoints.forEach((e, i) => {
          const methods = e.methods.join(", ").padEnd(15);
          console.log(`${i + 1}. ${methods} ${e.path}`);
        });
        console.log(`\nTotal: ${endpoints.length} endpoints`);
      }
    });
  } catch (err) {
    console.error("❌ Failed to start server:", {
      message: err.message,
      stack: err.stack
    });
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('⚠️ SIGTERM received. Shutting down gracefully...');
  await sequelize.close();
  console.log('✅ Database connection closed');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('⚠️ SIGINT received. Shutting down gracefully...');
  await sequelize.close();
  console.log('✅ Database connection closed');
  process.exit(0);
});

start();

export default app;