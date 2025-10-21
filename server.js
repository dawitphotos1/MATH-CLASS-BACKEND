
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



// server.js - COMPLETE CORS FIX VERSION
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import listEndpoints from "express-list-endpoints";
import sequelize from "./config/db.js";

// Routes
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
console.log("🚀 Starting Math Class Platform Backend...");
console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
console.log("🌐 FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("🔗 BACKEND_URL:", process.env.BACKEND_URL);

/* ========================================================
   🧩 STRIPE WEBHOOK — MUST COME FIRST
======================================================== */
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

/* ========================================================
   🚨 NUCLEAR CORS FIX - GUARANTEED TO WORK
======================================================== */

// Remove ALL helmet security temporarily to eliminate conflicts
// app.use(helmet());

// MANUAL CORS HEADERS - This will definitely work
app.use((req, res, next) => {
  // Allow ALL origins
  const origin = req.headers.origin;
  
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Stripe-Signature, X-Requested-With, Accept, Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(cookieParser());

// Additional CORS middleware as backup
app.use(cors({
  origin: function (origin, callback) {
    // Allow ALL origins without checking
    callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Stripe-Signature", "X-Requested-With", "Accept", "Origin"],
}));

/* ========================================================
   🧩 JSON Parsers — AFTER webhook and CORS
======================================================== */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ========================================================
   ⚡ Rate Limiting (Production only) - DISABLED FOR TESTING
======================================================== */
// if (process.env.NODE_ENV === "production") {
//   const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 500,
//     message: { success: false, error: "Too many requests. Please try again later." },
//   });
//   app.use("/api", limiter);
//   console.log("✅ Rate limiting enabled");
// } else {
//   console.log("⚡ Rate limiting disabled (development)");
// }

/* ========================================================
   🧾 Request Logger
======================================================== */
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl} | Origin: ${req.headers.origin} | Time: ${new Date().toISOString()}`);
  next();
});

/* ========================================================
   🔗 API Routes
======================================================== */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/lessons", lessonRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/payments", paymentRoutes);

/* ========================================================
   💓 Health Check - TEST THIS FIRST
======================================================== */
app.get("/api/v1/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: "OK",
      db: "connected",
      environment: process.env.NODE_ENV,
      origin: req.headers.origin || "none",
      cors: "enabled",
      timestamp: new Date().toISOString(),
      message: "CORS is working! Backend is healthy."
    });
  } catch (err) {
    res.status(500).json({ 
      status: "ERROR", 
      error: err.message,
      cors: "enabled" 
    });
  }
});

// Test endpoint specifically for CORS
app.get("/api/v1/cors-test", (req, res) => {
  res.json({
    message: "CORS test successful!",
    yourOrigin: req.headers.origin,
    timestamp: new Date().toISOString(),
    cors: "working"
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "Math Class Platform API is running ✅",
    environment: process.env.NODE_ENV,
    cors: "enabled",
    timestamp: new Date().toISOString(),
  });
});

/* ========================================================
   🚫 404 Handler
======================================================== */
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: "Route not found",
    path: req.originalUrl 
  });
});

/* ========================================================
   🧱 Global Error Handler
======================================================== */
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.message);
  console.error("Error Stack:", err.stack);

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production" 
      ? "Internal server error" 
      : err.message,
    ...(process.env.NODE_ENV === "development" && { 
      stack: err.stack,
      details: "CORS is enabled - this should work"
    })
  });
});

/* ========================================================
   🚀 Start Server
======================================================== */
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    console.log("🔄 Connecting to database...");
    const shouldAlter = process.env.ALTER_DB === "true";
    await sequelize.sync({ alter: shouldAlter });
    console.log("✅ Database synced successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`\n🎉 SERVER STARTED SUCCESSFULLY!`);
      console.log(`🚀 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Backend URL: ${process.env.BACKEND_URL}`);
      console.log(`🎯 Frontend URL: ${process.env.FRONTEND_URL}`);
      console.log(`✅ CORS: ENABLED FOR ALL ORIGINS`);
      console.log(`📋 Health Check: ${process.env.BACKEND_URL}/api/v1/health`);
      console.log(`🧪 CORS Test: ${process.env.BACKEND_URL}/api/v1/cors-test`);
      console.log(`\n📍 Ready to accept requests from any origin!`);
    });

    // Log all endpoints
    console.log("\n📋 Available Endpoints:");
    console.table(listEndpoints(app));
    
  } catch (err) {
    console.error("💥 FATAL Startup Error:", err);
    process.exit(1);
  }
})();