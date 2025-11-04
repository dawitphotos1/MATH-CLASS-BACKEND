
// // server.js — Render-Safe Backend with Warmup + PATCH Fix
// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import cookieParser from "cookie-parser";
// import rateLimit from "express-rate-limit";
// import listEndpoints from "express-list-endpoints";
// import sequelize from "./config/db.js";

// import authRoutes from "./routes/authRoutes.js";
// import adminRoutes from "./routes/admin.js"; // ✅ Use the complete version
// import courseRoutes from "./routes/courses.js";
// import lessonRoutes from "./routes/lessonRoutes.js";
// import enrollmentRoutes from "./routes/enrollmentRoutes.js";
// import paymentRoutes from "./routes/paymentRoutes.js";
// import { handleStripeWebhook } from "./controllers/paymentController.js";


// import testEmailRoutes from "./routes/testEmail.js";


// const app = express();
// app.set("trust proxy", 1);

// console.log("🚀 Starting Math Class Backend...");
// console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
// console.log("🌐 FRONTEND_URL:", process.env.FRONTEND_URL);
// console.log("🔗 BACKEND_URL:", process.env.BACKEND_URL);

// /* ========================================================
//    💳 STRIPE WEBHOOK (MUST BE RAW)
// ======================================================== */
// app.post(
//   "/api/v1/payments/webhook",
//   express.raw({ type: "application/json" }),
//   handleStripeWebhook
// );

// /* ========================================================
//    📦 Enable JSON after webhook
// ======================================================== */
// app.use((req, res, next) => {
//   if (req.originalUrl.startsWith("/api/v1/payments/webhook")) return next();
//   express.json()(req, res, next);
// });
// app.use(express.urlencoded({ extended: true }));

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
//    🧾 Logger
// ======================================================== */
// app.use((req, res, next) => {
//   console.log(`📥 [${req.method}] ${req.originalUrl}`, {
//     origin: req.headers.origin,
//     time: new Date().toISOString(),
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
//   }, 5 * 60 * 1000);
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
import sequelize from "./config/db.js";

// ✅ Import all routes
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/admin.js"; // your full admin route file
import courseRoutes from "./routes/courses.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import testEmailRoutes from "./routes/testEmail.js";

import { handleStripeWebhook } from "./controllers/paymentController.js";

const app = express();
app.set("trust proxy", 1);

console.log("🚀 Starting Math Class Backend...");
console.log("🌍 NODE_ENV:", process.env.NODE_ENV);
console.log("🌐 FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("🔗 BACKEND_URL:", process.env.BACKEND_URL);

/* ========================================================
   🖼️ STATIC FILES — Logo & Email Assets
======================================================== */
app.use("/uploads", express.static("public/uploads"));
// Example: https://mathe-class-website-backend-1.onrender.com/uploads/mathlogo2.jpg

/* ========================================================
   💳 STRIPE WEBHOOK (MUST BE RAW)
======================================================== */
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

/* ========================================================
   📦 Enable JSON after webhook
======================================================== */
app.use((req, res, next) => {
  if (req.originalUrl.startsWith("/api/v1/payments/webhook")) return next();
  express.json()(req, res, next);
});
app.use(express.urlencoded({ extended: true }));

/* ========================================================
   🧰 SECURITY & CORS
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

// ✅ Global OPTIONS preflight
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

// ✅ Explicit PATCH preflight for Render (important)
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
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    message: { success: false, error: "Too many requests" },
  });
  app.use("/api", limiter);
  console.log("✅ Rate limiting enabled");
} else {
  console.log("⚡ Rate limiting disabled (development)");
}

/* ========================================================
   🧾 Logger
======================================================== */
app.use((req, res, next) => {
  console.log(`📥 [${req.method}] ${req.originalUrl}`, {
    origin: req.headers.origin,
    time: new Date().toISOString(),
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
app.use("/api/v1/test-email", testEmailRoutes);

/* ========================================================
   💓 Health Check
======================================================== */
app.get("/api/v1/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: "ok",
      db: "connected",
      env: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
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
    });
  }
  res.status(err.statusCode || 500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

/* ========================================================
   💤 Render Keep-Alive Ping (prevent sleep)
======================================================== */
if (process.env.NODE_ENV === "production" && process.env.BACKEND_URL) {
  setInterval(() => {
    fetch(`${process.env.BACKEND_URL}/api/v1/health`)
      .then(() => console.log("💤 Render ping — backend kept awake"))
      .catch(() => {});
  }, 5 * 60 * 1000); // every 5 minutes
}

/* ========================================================
   🚀 Start Server
======================================================== */
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.sync({ alter: process.env.ALTER_DB === "true" });
    console.log("✅ Database connected & synced");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🎉 Server running on port ${PORT}`);
      console.table(listEndpoints(app));
    });
  } catch (err) {
    console.error("❌ Startup error:", err);
    process.exit(1);
  }
})();

export default app;
