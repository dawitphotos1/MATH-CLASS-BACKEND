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
// import { handleStripeWebhook } from "./controllers/paymentController.js"; // ✅ import directly

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
//    🧩 STRIPE WEBHOOK — must come BEFORE express.json()
// ======================================================== */
// // ⚠️ Must use raw body and call controller directly (not router)
// app.post(
//   "/api/v1/payments/webhook",
//   express.raw({ type: "application/json" }),
//   handleStripeWebhook
// );

// /* ========================================================
//    🧰 Core Security & Middleware
// ======================================================== */
// app.use(helmet());
// app.use(cookieParser());

// /* ========================================================
//    🧩 CORS Configuration
// ======================================================== */
// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:3001",
//   "https://math-class-platform.netlify.app",
//   "https://leafy-semolina-fc0934.netlify.app",
//   "https://mathe-class-website-frontend.onrender.com",
// ];

// app.use(
//   cors({
//     origin(origin, callback) {
//       if (
//         !origin ||
//         allowedOrigins.includes(origin) ||
//         origin.includes(".netlify.app")
//       ) {
//         callback(null, true);
//       } else {
//         console.warn("🚫 Blocked by CORS:", origin);
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );

// app.options("*", cors());

// /* ========================================================
//    🧩 JSON / URL Encoded Middleware (after webhook)
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
//   console.log(`📥 [${req.method}] ${req.originalUrl}`);
//   next();
// });

// /* ========================================================
//    🔗 API Routes (v1)
// ======================================================== */
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/admin", adminRoutes);
// app.use("/api/v1/courses", courseRoutes);
// app.use("/api/v1/lessons", lessonRoutes);
// app.use("/api/v1/enrollments", enrollmentRoutes);
// app.use("/api/v1/payments", paymentRoutes); // Handles /create-session, /confirm, etc.

// /* ========================================================
//    💓 Health Check
// ======================================================== */
// app.get("/api/v1/health", async (req, res) => {
//   try {
//     await sequelize.authenticate();
//     res.json({ status: "OK", db: "connected" });
//   } catch (err) {
//     res.status(500).json({ status: "ERROR", error: err.message });
//   }
// });

// /* ========================================================
//    🚫 404 Handler
// ======================================================== */
// app.use((req, res) => {
//   res.status(404).json({ success: false, error: "Not Found" });
// });

// /* ========================================================
//    🧱 Global Error Handler
// ======================================================== */
// app.use((err, req, res, next) => {
//   console.error("❌ Global Error:", err.message);
//   const status = err.statusCode || 500;
//   res.status(status).json({
//     success: false,
//     error:
//       process.env.NODE_ENV === "production"
//         ? "Internal server error"
//         : err.message,
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

//     app.listen(PORT, "0.0.0.0", () =>
//       console.log(`🚀 Server running on port ${PORT}`)
//     );

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
   🧩 STRIPE WEBHOOK (RAW BODY) — MUST BE FIRST!
======================================================== */
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

/* ========================================================
   🧰 Security & CORS Setup
======================================================== */
app.use(helmet());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://math-class-platform.netlify.app",
  "https://leafy-semolina-fc0934.netlify.app",
  "https://mathe-class-website-frontend.onrender.com",
];

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.includes(".netlify.app")
      ) {
        callback(null, true);
      } else {
        console.warn("🚫 Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.options("*", cors());

/* ========================================================
   🧩 JSON Parser (AFTER webhook)
======================================================== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  console.log(`📥 [${req.method}] ${req.originalUrl}`);
  next();
});

/* ========================================================
   🔗 Routes (v1)
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
    res.json({ status: "OK", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "ERROR", error: err.message });
  }
});

/* ========================================================
   🚫 404 Handler
======================================================== */
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Not Found" });
});

/* ========================================================
   🧱 Global Error Handler
======================================================== */
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.message);
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
   🚀 Start Server
======================================================== */
const PORT = process.env.PORT || 5000;
(async () => {
  try {
    const shouldAlter = process.env.ALTER_DB === "true";
    await sequelize.sync({ alter: shouldAlter });
    console.log("✅ Database synced");

    app.listen(PORT, "0.0.0.0", () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );

    console.table(listEndpoints(app));
  } catch (err) {
    console.error("❌ Startup Error:", err.message);
    process.exit(1);
  }
})();
