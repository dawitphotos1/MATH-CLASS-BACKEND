// // server.js — Final Render-Safe & CORS-Fixed Version
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
// console.log("🚀 Starting Math Class Platform Backend...");
// console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
// console.log("🌐 FRONTEND_URL:", process.env.FRONTEND_URL);
// console.log("🔗 BACKEND_URL:", process.env.BACKEND_URL);

// /* ========================================================
//    💳 STRIPE WEBHOOK (RAW BODY) — MUST BE FIRST!
// ======================================================== */
// app.post(
//   "/api/v1/payments/webhook",
//   express.raw({ type: "application/json" }),
//   handleStripeWebhook
// );

// /* ========================================================
//    🧰 SECURITY & CORS SETUP
// ======================================================== */
// app.use(helmet());

// // Remove restrictive headers that interfere with CORS
// app.use((req, res, next) => {
//   res.removeHeader("Cross-Origin-Resource-Policy");
//   res.removeHeader("Cross-Origin-Opener-Policy");
//   res.removeHeader("Cross-Origin-Embedder-Policy");
//   next();
// });

// app.use(cookieParser());

// // ✅ Dynamic & Safe CORS Configuration
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

//       if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
//         console.log(`✅ Allowing localhost origin: ${origin}`);
//         return callback(null, true);
//       }

//       if (allowedOrigins.includes(origin) || origin.endsWith(".netlify.app")) {
//         console.log(`✅ Allowing production origin: ${origin}`);
//         return callback(null, true);
//       }

//       console.warn("🚫 CORS blocked origin:", origin);
//       return callback(new Error(`CORS not allowed for origin: ${origin}`));
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

// // ✅ Handle preflight requests globally
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

// /* ========================================================
//    🧩 JSON Parsers
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
//     timestamp: new Date().toISOString(),
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
//       origin: req.headers.origin || "none",
//       cors: "enabled",
//       timestamp: new Date().toISOString(),
//       message: "Backend is healthy and CORS is working! 🎉",
//     });
//   } catch (err) {
//     res.status(500).json({
//       status: "ERROR",
//       error: err.message,
//       cors: "enabled",
//     });
//   }
// });

// // Additional CORS test endpoint
// app.get("/api/v1/cors-test", (req, res) => {
//   res.json({
//     message: "CORS test successful! ✅",
//     yourOrigin: req.headers.origin,
//     cors: "working",
//     timestamp: new Date().toISOString(),
//   });
// });

// app.get("/", (req, res) => {
//   res.json({
//     message: "Math Class Platform API",
//     status: "running",
//     environment: process.env.NODE_ENV,
//     cors: "enabled",
//     timestamp: new Date().toISOString(),
//   });
// });

// /* ========================================================
//    🔧 UNIVERSAL CORS RESPONSE FIX (Render PATCH Bug)
// ======================================================== */
// app.use((req, res, next) => {
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
//   next();
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
//       yourOrigin: req.headers.origin,
//       allowedOrigins,
//     });
//   }

//   const status = err.statusCode || 500;
//   res.status(status).json({
//     success: false,
//     error:
//       process.env.NODE_ENV === "production"
//         ? "Internal server error"
//         : err.message,
//     ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
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
//       console.log(`\n🎉 SERVER STARTED SUCCESSFULLY!`);
//       console.log(`🚀 Port: ${PORT}`);
//       console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
//       console.log(`🔗 Backend URL: ${process.env.BACKEND_URL}`);
//       console.log(`🎯 Frontend URL: ${process.env.FRONTEND_URL}`);
//       console.log(`✅ CORS: ENABLED`);
//       console.log(
//         `📋 Health Check: ${process.env.BACKEND_URL}/api/v1/health`
//       );
//       console.log(
//         `🧪 CORS Test: ${process.env.BACKEND_URL}/api/v1/cors-test`
//       );
//     });

//     console.log("\n📋 Available Endpoints:");
//     console.table(listEndpoints(app));
//   } catch (err) {
//     console.error("❌ Startup Error:", err);
//     process.exit(1);
//   }
// })();

// export default app;






// server.js — Render-safe + PATCH + Warmup Fix
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import listEndpoints from "express-list-endpoints";
import sequelize from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import courseRoutes from "./routes/courses.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { handleStripeWebhook } from "./controllers/paymentController.js";

const app = express();
app.set("trust proxy", 1);

console.log("🚀 Starting Math Class Platform Backend...");
console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
console.log("🌐 FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("🔗 BACKEND_URL:", process.env.BACKEND_URL);

/* ========================================================
   💳 STRIPE WEBHOOK (RAW BODY FIRST)
======================================================== */
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

/* ========================================================
   🧰 RESTORE JSON PARSER AFTER STRIPE WEBHOOK
======================================================== */
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api/v1/payments/webhook")) {
    next();
  } else {
    express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));

/* ========================================================
   🧰 SECURITY & CORS SETUP
======================================================== */
app.use(helmet());
app.use(cookieParser());

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
      if (!origin) return callback(null, true);
      if (
        origin.includes("localhost") ||
        allowedOrigins.includes(origin) ||
        origin.endsWith(".netlify.app")
      ) {
        console.log(`✅ Allowing origin: ${origin}`);
        return callback(null, true);
      }
      console.warn("🚫 CORS blocked origin:", origin);
      return callback(new Error(`CORS not allowed for origin: ${origin}`));
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

// ✅ Handle all OPTIONS quickly
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.status(200).end();
});

// ✅ Explicit PATCH preflight handler (Render-safe)
app.options("/api/v1/admin/students/:id/approve", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.status(200).end();
});

/* ========================================================
   ⚡ Rate Limiting
======================================================== */
if (process.env.NODE_ENV === "production") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { success: false, error: "Too many requests" },
  });
  app.use("/api", limiter);
  console.log("✅ Rate limiting enabled");
} else {
  console.log("⚡ Rate limiting disabled (development)");
}

/* ========================================================
   🧾 Request Logger
======================================================== */
app.use((req, res, next) => {
  console.log(`📥 [${req.method}] ${req.originalUrl}`, {
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
  });
  next();
});

/* ========================================================
   🔗 Routes
======================================================== */
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/lessons", lessonRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/payments", paymentRoutes);

/* ========================================================
   💓 Health Check
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
    });
  } catch (err) {
    res.status(500).json({ status: "ERROR", error: err.message });
  }
});

/* ========================================================
   🚫 404 Handler
======================================================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    path: req.originalUrl,
  });
});

/* ========================================================
   🧱 Global Error Handler
======================================================== */
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.message);
  if (err.message.includes("CORS")) {
    return res.status(403).json({
      success: false,
      error: "CORS policy: Origin not allowed",
      yourOrigin: req.headers.origin,
      allowedOrigins,
    });
  }
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

/* ========================================================
   💤 Render Keep-Alive (prevents cold start timeout)
======================================================== */
if (process.env.NODE_ENV === "production") {
  setInterval(() => {
    fetch(`${process.env.BACKEND_URL}/api/v1/health`)
      .then(() => console.log("💤 Render ping → keeping backend awake"))
      .catch(() => {});
  }, 5 * 60 * 1000); // every 5 minutes
}

/* ========================================================
   🚀 Start Server
======================================================== */
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    const shouldAlter = process.env.ALTER_DB === "true";
    await sequelize.sync({ alter: shouldAlter });
    console.log("✅ Database synced");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`\n🎉 SERVER STARTED SUCCESSFULLY on ${PORT}`);
      console.table(listEndpoints(app));
    });
  } catch (err) {
    console.error("❌ Startup Error:", err);
    process.exit(1);
  }
})();

export default app;
