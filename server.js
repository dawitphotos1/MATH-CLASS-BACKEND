
// // server.js
// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import cookieParser from "cookie-parser";
// import rateLimit from "express-rate-limit";
// import listEndpoints from "express-list-endpoints";
// import sequelize from "./config/db.js";

// // 🔹 Routes
// import authRoutes from "./routes/authRoutes.js";
// import adminRoutes from "./routes/adminRoutes.js";
// import courseRoutes from "./routes/courses.js";
// import lessonRoutes from "./routes/lessonRoutes.js";
// import enrollmentRoutes from "./routes/enrollmentRoutes.js";
// import paymentRoutes from "./routes/paymentRoutes.js";
// import { handleStripeWebhook } from "./controllers/paymentController.js";

// const app = express();
// app.set("trust proxy", 1);

// /* ========================================================
//    🌍 Environment Info
// ======================================================== */
// console.log("🚀 DATABASE_URL:", !!process.env.DATABASE_URL);
// console.log("🔑 JWT_SECRET:", !!process.env.JWT_SECRET);
// console.log("🌍 FRONTEND_URL:", process.env.FRONTEND_URL);
// console.log("🔔 NODE_ENV:", process.env.NODE_ENV);

// /* ========================================================
//    🧩 STRIPE WEBHOOK (RAW BODY) — MUST BE FIRST!
// ======================================================== */
// app.post(
//   "/api/v1/payments/webhook",
//   express.raw({ type: "application/json" }),
//   handleStripeWebhook
// );

// /* ========================================================
//    🧰 Security & CORS Setup - FIXED FOR DEPLOYMENT
// ======================================================== */
// app.use(helmet());
// app.use(cookieParser());

// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:3001",
//   "https://math-class-platform.netlify.app",
//   "https://leafy-semolina-fc0934.netlify.app",
//   "https://mathe-class-website-frontend.onrender.com",
// ];

// // Enhanced CORS configuration
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Allow requests with no origin (like mobile apps or curl requests)
//       if (!origin) return callback(null, true);
      
//       if (allowedOrigins.includes(origin) || origin.includes(".netlify.app")) {
//         callback(null, true);
//       } else {
//         console.warn("🚫 Blocked by CORS:", origin);
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     allowedHeaders: [
//       "Content-Type", 
//       "Authorization", 
//       "X-Requested-With",
//       "Accept",
//       "Origin"
//     ],
//   })
// );

// // Handle preflight requests
// app.options("*", cors());

// /* ========================================================
//    🧩 JSON Parser (AFTER webhook)
// ======================================================== */
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// /* ========================================================
//    ⚡ Rate Limiting
// ======================================================== */
// if (process.env.NODE_ENV === "production") {
//   const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 500,
//     message: { success: false, error: "Too many requests" },
//   });
//   app.use("/api", limiter);
//   console.log("✅ Rate limiting enabled");
// } else {
//   console.log("⚡ Rate limiting disabled (development)");
// }

// /* ========================================================
//    🧾 Request Logger
// ======================================================== */
// app.use((req, res, next) => {
//   console.log(`📥 [${req.method}] ${req.originalUrl}`, {
//     origin: req.headers.origin,
//     'user-agent': req.headers['user-agent']
//   });
//   next();
// });

// /* ========================================================
//    🔗 Routes (v1)
// ======================================================== */
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/admin", adminRoutes);
// app.use("/api/v1/courses", courseRoutes);
// app.use("/api/v1/lessons", lessonRoutes);
// app.use("/api/v1/enrollments", enrollmentRoutes);
// app.use("/api/v1/payments", paymentRoutes);

// /* ========================================================
//    💓 Health Check
// ======================================================== */
// app.get("/api/v1/health", async (req, res) => {
//   try {
//     await sequelize.authenticate();
//     res.json({ 
//       status: "OK", 
//       db: "connected",
//       environment: process.env.NODE_ENV,
//       timestamp: new Date().toISOString()
//     });
//   } catch (err) {
//     res.status(500).json({ status: "ERROR", error: err.message });
//   }
// });

// // Additional health check for root
// app.get("/", (req, res) => {
//   res.json({ 
//     message: "Math Class Platform API", 
//     status: "running",
//     environment: process.env.NODE_ENV,
//     timestamp: new Date().toISOString()
//   });
// });

// /* ========================================================
//    🚫 404 Handler
// ======================================================== */
// app.use((req, res) => {
//   res.status(404).json({ success: false, error: "Route not found" });
// });

// /* ========================================================
//    🧱 Global Error Handler
// ======================================================== */
// app.use((err, req, res, next) => {
//   console.error("❌ Global Error:", err.message);
  
//   // Handle CORS errors
//   if (err.message.includes("CORS")) {
//     return res.status(403).json({
//       success: false,
//       error: "CORS policy: Origin not allowed",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined
//     });
//   }

//   const status = err.statusCode || 500;
//   res.status(status).json({
//     success: false,
//     error: process.env.NODE_ENV === "production" 
//       ? "Internal server error" 
//       : err.message,
//     ...(process.env.NODE_ENV === "development" && { stack: err.stack })
//   });
// });

// /* ========================================================
//    🚀 Start Server
// ======================================================== */
// const PORT = process.env.PORT || 5000;

// (async () => {
//   try {
//     const shouldAlter = process.env.ALTER_DB === "true";
//     await sequelize.sync({ alter: shouldAlter });
//     console.log("✅ Database synced");

//     app.listen(PORT, "0.0.0.0", () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//       console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
//       console.log(`🔗 Health check: http://localhost:${PORT}/api/v1/health`);
//       console.log(`🎯 Frontend URL: ${process.env.FRONTEND_URL}`);
//     });

//     console.table(listEndpoints(app));
//   } catch (err) {
//     console.error("❌ Startup Error:", err.message);
//     process.exit(1);
//   }
// })();



// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import listEndpoints from "express-list-endpoints";
import sequelize from "./config/db.js";

// 🔹 Routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import courseRoutes from "./routes/courses.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { handleStripeWebhook } from "./controllers/paymentController.js";

const app = express();
app.set("trust proxy", 1);

/* ========================================================
   🌍 Environment Info
======================================================== */
console.log("🚀 DATABASE_URL:", !!process.env.DATABASE_URL);
console.log("🔑 JWT_SECRET:", !!process.env.JWT_SECRET);
console.log("🌍 FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("🔔 NODE_ENV:", process.env.NODE_ENV);

/* ========================================================
   💳 STRIPE WEBHOOK (RAW BODY) — MUST BE FIRST
======================================================== */
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

/* ========================================================
   🧰 SECURITY & CORS (Fixed for Render + Netlify)
======================================================== */
app.use(helmet());
app.use(cookieParser());

// ✅ Allowed origins - Updated with your actual domains
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173", // Vite dev server
  "https://math-class-platform.netlify.app",
  "https://leafy-semolina-fc0934.netlify.app",
  "https://mathe-class-website-frontend.onrender.com",
  "https://mathe-class-website-backend-1.onrender.com", // Your actual backend
  "https://math-class-backend.onrender.com", // Alternative backend URL
];

// ✅ Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);
    
    // Check against allowed origins
    if (
      allowedOrigins.includes(origin) || 
      origin.endsWith(".netlify.app") ||
      origin.endsWith(".onrender.com")
    ) {
      callback(null, true);
    } else {
      console.warn("🚫 Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization", 
    "X-Requested-With",
    "Accept",
    "Origin",
    "Stripe-Signature" // Important for Stripe webhooks
  ],
  exposedHeaders: ["Content-Length", "Authorization"],
  maxAge: 86400, // 24 hours
};

// Apply CORS globally
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options("*", cors(corsOptions));

/* ========================================================
   🧩 BODY PARSERS (AFTER webhook + CORS)
======================================================== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/* ========================================================
   ⚡ RATE LIMITING (Production only)
======================================================== */
if (process.env.NODE_ENV === "production") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    message: { success: false, error: "Too many requests, try again later" },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api", limiter);
  console.log("✅ Rate limiting enabled");
} else {
  console.log("⚡ Rate limiting disabled (development)");
}

/* ========================================================
   🧾 REQUEST LOGGER
======================================================== */
app.use((req, res, next) => {
  console.log(`📥 [${req.method}] ${req.originalUrl}`, {
    origin: req.headers.origin,
    "user-agent": req.headers["user-agent"],
  });
  next();
});

/* ========================================================
   📂 STATIC FILES (Uploads)
======================================================== */
app.use("/Uploads", express.static("Uploads"));

/* ========================================================
   🔗 ROUTES (v1)
======================================================== */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/lessons", lessonRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/payments", paymentRoutes);

/* ========================================================
   💓 HEALTH CHECKS
======================================================== */
app.get("/api/v1/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: "OK",
      db: "connected",
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      cors: "enabled",
      allowedOrigins: allowedOrigins
    });
  } catch (err) {
    res.status(500).json({ status: "ERROR", error: err.message });
  }
});

// Root health check
app.get("/", (req, res) => {
  res.json({
    message: "Math Class Platform API",
    status: "running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    cors: "enabled"
  });
});

/* ========================================================
   🚫 404 HANDLER
======================================================== */
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: "Route not found",
    path: req.originalUrl 
  });
});

/* ========================================================
   🧱 GLOBAL ERROR HANDLER
======================================================== */
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.message);

  // Handle CORS errors gracefully
  if (err.message.includes("CORS")) {
    return res.status(403).json({
      success: false,
      error: "CORS policy: Origin not allowed",
      allowedOrigins: allowedOrigins,
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }

  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error: process.env.NODE_ENV === "production" 
      ? "Internal server error" 
      : err.message,
    ...(process.env.NODE_ENV === "development" && { 
      stack: err.stack,
      path: req.originalUrl 
    }),
  });
});

/* ========================================================
   🚀 START SERVER
======================================================== */
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    const shouldAlter = process.env.ALTER_DB === "true";
    await sequelize.sync({ alter: shouldAlter });
    console.log("✅ Database synced");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/v1/health`);
      console.log(`🎯 Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`🌐 CORS enabled for: ${allowedOrigins.join(", ")}`);
    });

    // Log all endpoints in development
    if (process.env.NODE_ENV === "development") {
      console.table(listEndpoints(app));
    }
  } catch (err) {
    console.error("❌ Startup Error:", err.message);
    process.exit(1);
  }
})();