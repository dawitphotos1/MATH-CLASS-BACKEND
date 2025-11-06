
// // server.js — Render-Safe Backend with Warmup + Static Uploads
// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import cookieParser from "cookie-parser";
// import rateLimit from "express-rate-limit";
// import listEndpoints from "express-list-endpoints";
// import path from "path";
// import { fileURLToPath } from "url";
// import sequelize from "./config/db.js";

// // ✅ Import all routes
// import authRoutes from "./routes/authRoutes.js";
// import adminRoutes from "./routes/admin.js"; // your full admin route file
// import courseRoutes from "./routes/courses.js";
// import lessonRoutes from "./routes/lessonRoutes.js";
// import enrollmentRoutes from "./routes/enrollmentRoutes.js";
// import paymentRoutes from "./routes/paymentRoutes.js";
// import testEmailRoutes from "./routes/testEmail.js";
// import filesRoutes from "./routes/files.js"; // ✅ ADD THIS LINE - File Manager routes
// import unitRoutes from "./routes/unitRoutes.js";
// import { handleStripeWebhook } from "./controllers/paymentController.js";

// const app = express();
// app.set("trust proxy", 1);

// console.log("🚀 Starting Math Class Backend...");
// console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
// console.log("🌐 FRONTEND_URL:", process.env.FRONTEND_URL);
// console.log("🔗 BACKEND_URL:", process.env.BACKEND_URL);

// /* ========================================================
//    🖼️ STATIC FILES — Logo & Email Assets
// ======================================================== */
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // ✅ Serve static uploads (example: /uploads/mathlogo2.jpg)
// app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
// // ✅ Serve Uploads directory for file manager
// app.use("/Uploads", express.static(path.join(__dirname, "Uploads"))); // ✅ ADD THIS LINE

// // Example full URL: https://mathe-class-website-backend-1.onrender.com/uploads/mathlogo2.jpg

// /* ========================================================
//    💳 STRIPE WEBHOOK (MUST BE RAW)
// ======================================================== */
// app.post(
//   "/api/v1/payments/webhook",
//   express.raw({ type: "application/json" }),
//   handleStripeWebhook
// );

// /* ========================================================
//    📦 MIDDLEWARE SETUP - CRITICAL FIX FOR FILE UPLOADS
// ======================================================== */
// // Apply JSON middleware to all routes EXCEPT webhook and file upload routes
// app.use((req, res, next) => {
//   // Skip JSON parsing for webhook and file upload routes
//   if (req.originalUrl.startsWith("/api/v1/payments/webhook") || 
//       req.originalUrl.startsWith("/api/v1/courses/create") ||
//       req.originalUrl.startsWith("/api/v1/courses/")) {
//     return next();
//   }
//   express.json({ limit: '50mb' })(req, res, next);
// });

// // URL-encoded middleware for form data
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// /* ========================================================
//    🧰 SECURITY & CORS
// ======================================================== */
// app.use(helmet());
// app.use(cookieParser());

// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://127.0.0.1:3000",
//   "http://localhost:3001",
//   "https://math-class-platform.netlify.app",
//   "https://leafy-semolina-fc0934.netlify.app",
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin) return callback(null, true);
//       if (
//         origin.includes("localhost") ||
//         allowedOrigins.includes(origin) ||
//         origin.endsWith(".netlify.app")
//       ) {
//         console.log(`✅ Allowing origin: ${origin}`);
//         return callback(null, true);
//       }
//       console.warn("🚫 Blocked CORS origin:", origin);
//       return callback(new Error(`CORS not allowed for: ${origin}`));
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: [
//       "Content-Type",
//       "Authorization",
//       "X-Requested-With",
//       "Accept",
//       "Origin",
//       "Stripe-Signature",
//     ],
//   })
// );

// // ✅ Global OPTIONS preflight
// app.options("*", (req, res) => {
//   res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, PATCH, DELETE, OPTIONS"
//   );
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   res.status(200).end();
// });

// // ✅ Explicit PATCH preflight for Render
// app.options("/api/v1/admin/students/:id/approve", (req, res) => {
//   res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, PATCH, DELETE, OPTIONS"
//   );
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//   );
//   res.status(200).end();
// });

// /* ========================================================
//    ⚡ Rate Limiting
// ======================================================== */
// if (process.env.NODE_ENV === "production") {
//   const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 500,
//     message: { success: false, error: "Too many requests" },
//   });
//   app.use("/api", limiter);
//   console.log("✅ Rate limiting enabled");
// } else {
//   console.log("⚡ Rate limiting disabled (development)");
// }

// /* ========================================================
//    🧾 Logger
// ======================================================== */
// app.use((req, res, next) => {
//   console.log(`📥 [${req.method}] ${req.originalUrl}`, {
//     origin: req.headers.origin,
//     time: new Date().toISOString(),
//     'content-type': req.headers['content-type']
//   });
//   next();
// });

// /* ========================================================
//    🔗 Routes
// ======================================================== */
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/admin", adminRoutes);
// app.use("/api/v1/courses", courseRoutes);
// app.use("/api/v1/lessons", lessonRoutes);
// app.use("/api/v1/enrollments", enrollmentRoutes);
// app.use("/api/v1/payments", paymentRoutes);
// app.use("/api/v1/test-email", testEmailRoutes);
// app.use("/api/v1/files", filesRoutes); // ✅ ADD THIS LINE - File Manager routes
// app.use("/api/v1/units", unitRoutes);
// /* ========================================================
//    💓 Health Check
// ======================================================== */
// app.get("/api/v1/health", async (req, res) => {
//   try {
//     await sequelize.authenticate();
//     res.json({
//       status: "ok",
//       db: "connected",
//       env: process.env.NODE_ENV,
//       timestamp: new Date().toISOString(),
//     });
//   } catch (err) {
//     res.status(500).json({ status: "error", error: err.message });
//   }
// });

// /* ========================================================
//    🚫 404 Handler
// ======================================================== */
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     error: "Route not found",
//     path: req.originalUrl,
//   });
// });

// /* ========================================================
//    🧱 Global Error Handler
// ======================================================== */
// app.use((err, req, res, next) => {
//   console.error("❌ Global Error:", err.message);
//   if (err.message.includes("CORS")) {
//     return res.status(403).json({
//       success: false,
//       error: "CORS policy: Origin not allowed",
//     });
//   }
//   res.status(err.statusCode || 500).json({
//     success: false,
//     error:
//       process.env.NODE_ENV === "production"
//         ? "Internal server error"
//         : err.message,
//   });
// });

// /* ========================================================
//    💤 Render Keep-Alive Ping (prevent sleep)
// ======================================================== */
// if (process.env.NODE_ENV === "production" && process.env.BACKEND_URL) {
//   setInterval(() => {
//     fetch(`${process.env.BACKEND_URL}/api/v1/health`)
//       .then(() => console.log("💤 Render ping — backend kept awake"))
//       .catch(() => {});
//   }, 5 * 60 * 1000); // every 5 minutes
// }

// /* ========================================================
//    🚀 Start Server
// ======================================================== */
// const PORT = process.env.PORT || 5000;

// (async () => {
//   try {
//     await sequelize.sync({ alter: process.env.ALTER_DB === "true" });
//     console.log("✅ Database connected & synced");

//     app.listen(PORT, "0.0.0.0", () => {
//       console.log(`🎉 Server running on port ${PORT}`);
//       console.table(listEndpoints(app));
//     });
//   } catch (err) {
//     console.error("❌ Startup error:", err);
//     process.exit(1);
//   }
// })();

// export default app;








// server.js — Render-Safe Backend with Warmup + Static Uploads
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

// ✅ Import all routes - USING YOUR EXISTING FILES
import authRoutes from "./routes/authRoutes.js"; // You have this file
import adminRoutes from "./routes/admin.js";
import courseRoutes from "./routes/courses.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import testEmailRoutes from "./routes/testEmail.js";
import filesRoutes from "./routes/files.js";
import unitRoutes from "./routes/unitRoutes.js";
import { handleStripeWebhook } from "./controllers/paymentController.js";

const app = express();
app.set("trust proxy", 1);

console.log("🚀 Starting Math Class Backend...");
console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
console.log("🌐 FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("🔗 BACKEND_URL:", process.env.BACKEND_URL);

/* ========================================================
   📁 PATH CONFIGURATION
======================================================== */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ========================================================
   🖼️ STATIC FILES CONFIGURATION
======================================================== */
// Serve static uploads for images and files
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/Uploads", express.static(path.join(__dirname, "Uploads")));

// Example URLs:
// https://mathe-class-website-backend-1.onrender.com/uploads/mathlogo2.jpg
// https://mathe-class-website-backend-1.onrender.com/Uploads/video-file.mp4

/* ========================================================
   💳 STRIPE WEBHOOK (MUST BE RAW - NO JSON PARSING)
======================================================== */
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

/* ========================================================
   📦 MIDDLEWARE SETUP
======================================================== */
// Custom JSON middleware to handle file upload routes properly
app.use((req, res, next) => {
  // Skip JSON parsing for webhook and file upload routes
  const skipJsonRoutes = [
    "/api/v1/payments/webhook",
    "/api/v1/courses/create",
    "/api/v1/courses/",
    "/api/v1/lessons/",
    "/api/v1/files/upload"
  ];
  
  if (skipJsonRoutes.some(route => req.originalUrl.startsWith(route))) {
    return next();
  }
  express.json({ limit: '50mb' })(req, res, next);
});

// URL-encoded middleware for form data
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/* ========================================================
   🛡️ SECURITY MIDDLEWARE
======================================================== */
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cookieParser());

/* ========================================================
   🌐 CORS CONFIGURATION
======================================================== */
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
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (
        origin.includes("localhost") ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".netlify.app")
      ) {
        console.log(`✅ Allowing CORS origin: ${origin}`);
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

// Global OPTIONS preflight handler
app.options("*", cors());

/* ========================================================
   ⚡ RATE LIMITING
======================================================== */
if (process.env.NODE_ENV === "production") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 500 requests per windowMs
    message: { 
      success: false, 
      error: "Too many requests from this IP, please try again later." 
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api", limiter);
  console.log("✅ Rate limiting enabled for production");
} else {
  console.log("⚡ Rate limiting disabled (development mode)");
}

/* ========================================================
   📊 REQUEST LOGGING MIDDLEWARE
======================================================== */
app.use((req, res, next) => {
  console.log(`📥 [${req.method}] ${req.originalUrl}`, {
    origin: req.headers.origin,
    time: new Date().toISOString(),
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length']
  });
  next();
});

/* ========================================================
   🔗 API ROUTES CONFIGURATION
======================================================== */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/lessons", lessonRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/test-email", testEmailRoutes);
app.use("/api/v1/files", filesRoutes);
app.use("/api/v1/units", unitRoutes);

/* ========================================================
   💓 HEALTH CHECK ENDPOINT
======================================================== */
app.get("/api/v1/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      success: true,
      status: "healthy",
      database: "connected",
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (err) {
    console.error("❌ Health check failed:", err.message);
    res.status(500).json({ 
      success: false, 
      status: "unhealthy", 
      error: "Database connection failed",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

/* ========================================================
   📋 API INFO ENDPOINT
======================================================== */
app.get("/api/v1/info", (req, res) => {
  res.json({
    success: true,
    name: "Math Class Platform API",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    endpoints: listEndpoints(app).map(route => ({
      path: route.path,
      methods: route.methods,
    })),
  });
});

/* ========================================================
   🚫 404 NOT FOUND HANDLER
======================================================== */
app.use((req, res) => {
  console.warn(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
    suggestion: "Check the API documentation for available endpoints",
  });
});

/* ========================================================
   🧱 GLOBAL ERROR HANDLER
======================================================== */
app.use((err, req, res, next) => {
  console.error("❌ Global Error Handler:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  // CORS errors
  if (err.message.includes("CORS")) {
    return res.status(403).json({
      success: false,
      error: "CORS policy: Origin not allowed",
      allowedOrigins: allowedOrigins
    });
  }

  // Rate limit errors
  if (err.statusCode === 429) {
    return res.status(429).json({
      success: false,
      error: "Too many requests, please try again later."
    });
  }

  // Default error response
  const errorResponse = {
    success: false,
    error: process.env.NODE_ENV === "production" 
      ? "Internal server error" 
      : err.message,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  res.status(err.statusCode || 500).json(errorResponse);
});

/* ========================================================
   💤 RENDER KEEP-ALIVE PING (prevent sleep)
======================================================== */
if (process.env.NODE_ENV === "production" && process.env.BACKEND_URL) {
  const keepAlive = () => {
    fetch(`${process.env.BACKEND_URL}/api/v1/health`)
      .then(response => {
        if (response.ok) {
          console.log("💤 Render ping — backend kept awake");
        } else {
          console.warn("⚠️ Keep-alive ping failed:", response.status);
        }
      })
      .catch(error => {
        console.error("❌ Keep-alive ping error:", error.message);
      });
  };

  // Ping every 5 minutes to prevent Render from sleeping the service
  setInterval(keepAlive, 5 * 60 * 1000);
  
  // Initial ping
  setTimeout(keepAlive, 10000);
  console.log("✅ Keep-alive service started");
}

/* ========================================================
   🚀 SERVER STARTUP
======================================================== */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Database connection and sync
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully");

    // Sync database models
    const syncOptions = process.env.NODE_ENV === 'production' 
      ? { alter: false } // Be careful with alter in production
      : { alter: process.env.ALTER_DB === "true" };
    
    await sequelize.sync(syncOptions);
    console.log("✅ Database models synchronized");

    // Start server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🎉 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Backend URL: ${process.env.BACKEND_URL || `http://localhost:${PORT}`}`);
      console.log(`📚 Available endpoints:`);
      
      // Display endpoints in a clean format
      const endpoints = listEndpoints(app);
      endpoints.forEach(endpoint => {
        console.log(`   ${endpoint.methods.join(', ')} ${endpoint.path}`);
      });
    });

  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

// Start the server
startServer();

export default app;