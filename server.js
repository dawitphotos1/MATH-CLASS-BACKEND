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
// import paymentsRoutes from "./routes/payments.js"; // ✅ Added payments route

// const app = express();
// app.set("trust proxy", 1);

// // 🔹 Environment debug
// console.log("🚀 DATABASE_URL set?", !!process.env.DATABASE_URL);
// console.log("🚀 JWT_SECRET set?", !!process.env.JWT_SECRET);
// console.log("🌍 FRONTEND_URL:", process.env.FRONTEND_URL);

// // ========== Middleware ==========
// app.use(helmet());
// app.use(cookieParser());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ========== CORS ==========
// const allowedOrigins = ["http://localhost:3000", process.env.FRONTEND_URL];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       console.log("🌍 Incoming Origin:", origin);
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         console.warn("🚫 Blocked by CORS, origin:", origin);
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//   })
// );

// // ========== Rate Limiting ==========
// if (process.env.NODE_ENV === "production") {
//   const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 500,
//     message: { success: false, error: "Too many requests" },
//   });
//   app.use("/api", limiter);
//   console.log("✅ Rate limiting enabled (production)");
// } else {
//   console.log("⚡ Rate limiting disabled (development)");
// }

// // ========== Logger ==========
// app.use((req, res, next) => {
//   console.log(`📥 [${req.method}] ${req.originalUrl}`);
//   next();
// });

// // ========== Routes ==========
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/admin", adminRoutes);
// app.use("/api/v1/courses", courseRoutes);
// app.use("/api/v1/lessons", lessonRoutes);
// app.use("/api/v1/enrollments", enrollmentRoutes);
// app.use("/api/v1/payments", paymentsRoutes); // ✅ Now properly mounted

// // Health check
// app.get("/api/v1/health", async (req, res) => {
//   try {
//     await sequelize.authenticate();
//     res.json({ status: "OK", db: "connected" });
//   } catch (err) {
//     res.status(500).json({ status: "ERROR", error: err.message });
//   }
// });

// // ========== 404 + Error Handler ==========
// app.use((req, res) => {
//   res.status(404).json({ success: false, error: "Not Found" });
// });

// app.use((err, req, res, next) => {
//   console.error("❌ Global Error Handler:", err.stack || err.message);
//   res.status(500).json({ success: false, error: "Server error" });
// });

// // ========== Start ==========
// const PORT = process.env.PORT || 5000;

// (async () => {
//   try {
//     if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
//       throw new Error("Missing critical env vars");
//     }

//     await sequelize.sync({ alter: false });
//     console.log("✅ DB Synced");

//     app.listen(PORT, "0.0.0.0", () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });

//     console.log("📋 Registered Endpoints:");
//     console.table(listEndpoints(app));
//   } catch (err) {
//     console.error("❌ Startup Error:", err.message);
//   }
// })();




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
import paymentsRoutes from "./routes/payments.js";

const app = express();
app.set("trust proxy", 1);

// 🔹 Environment debug
console.log("🚀 DATABASE_URL set?", !!process.env.DATABASE_URL);
console.log("🚀 JWT_SECRET set?", !!process.env.JWT_SECRET);
console.log("🌍 FRONTEND_URL:", process.env.FRONTEND_URL);

// ========== Middleware ==========
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== CORS ==========
const allowedOrigins = [
  "http://localhost:3000",
  "https://math-class-platform.netlify.app",
  "https://leafy-semolina-fc0934.netlify.app",
  "https://mathe-class-website-backend-1.onrender.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("🌍 Incoming Origin:", origin);

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Allow all Netlify subdomains for preview deployments
        if (origin.includes(".netlify.app")) {
          callback(null, true);
        } else {
          console.warn("🚫 Blocked by CORS, origin:", origin);
          callback(new Error("Not allowed by CORS"));
        }
      }
    },
    credentials: true,
  })
);

// ========== Rate Limiting ==========
if (process.env.NODE_ENV === "production") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: { success: false, error: "Too many requests" },
  });
  app.use("/api", limiter);
  console.log("✅ Rate limiting enabled (production)");
} else {
  console.log("⚡ Rate limiting disabled (development)");
}

// ========== Logger ==========
app.use((req, res, next) => {
  console.log(`📥 [${req.method}] ${req.originalUrl}`);
  next();
});

// ========== Routes ==========
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/lessons", lessonRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/payments", paymentsRoutes);

// ========== Health Check ==========
app.get("/api/v1/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: "OK", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "ERROR", error: err.message });
  }
});

// ========== 404 + Error Handler ==========
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Not Found" });
});

app.use((err, req, res, next) => {
  console.error("❌ Global Error Handler:", err.stack || err.message);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message,
  });
});

// ========== Start Server ==========
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
      throw new Error("Missing critical environment variables");
    }

    // 🧩 SAFE AUTO-SYNC MODE
    const shouldAlter = process.env.ALTER_DB === "true";
    console.log(`🧩 Syncing database (alter: ${shouldAlter})...`);

    await sequelize.sync({ alter: shouldAlter });
    console.log("✅ DB Synced");

    if (shouldAlter) {
      console.warn(
        "⚠️ ALTER_DB=true detected — remember to set it to false after deployment!"
      );
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    console.log("📋 Registered Endpoints:");
    console.table(listEndpoints(app));
  } catch (err) {
    console.error("❌ Startup Error:", err.message);
    process.exit(1);
  }
})();