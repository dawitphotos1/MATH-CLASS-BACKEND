// // server.js
// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import cors from "cors";
// import helmet from "helmet";
// import cookieParser from "cookie-parser";
// import rateLimit from "express-rate-limit";
// import listEndpoints from "express-list-endpoints";

// import sequelize from "./config/db.js"; // DB instance
// import authRoutes from "./routes/auth.js";
// import adminRoutes from "./routes/admin.js";
// import courseRoutes from "./routes/courses.js"; // ✅ Added

// const app = express();
// app.set("trust proxy", 1);

// // 🔍 Log critical env vars
// console.log(
//   "🚀 DATABASE_URL:",
//   process.env.DATABASE_URL ? "✅ SET" : "❌ MISSING"
// );
// console.log("🚀 JWT_SECRET:", process.env.JWT_SECRET ? "✅ SET" : "❌ MISSING");

// // ====================
// // 🔹 Middleware
// // ====================
// app.use(helmet());
// app.use(cookieParser());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ✅ CORS
// const allowedOrigins = [
//   "http://localhost:3000",
//   "https://mathe-class-website-frontend.onrender.com",
// ];
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true);
//       } else {
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// // ✅ Rate limiting
// if (process.env.NODE_ENV === "production") {
//   const apiLimiter = rateLimit({
//     windowMs: 15 * 60 * 1000,
//     max: 500,
//     message: { success: false, error: "Too many requests. Try again later." },
//   });
//   app.use("/api", apiLimiter);
//   console.log("✅ Rate limiting enabled (production)");
// } else {
//   console.log("⚡ Rate limiting disabled (development mode)");
// }

// // ✅ Logger
// app.use((req, res, next) => {
//   console.log(`📥 [${req.method}] ${req.originalUrl}`);
//   next();
// });

// // ====================
// // 🔹 Routes
// // ====================
// console.log("📦 Registering routes: /api/v1/auth, /api/v1/admin, /api/v1/courses");
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/admin", adminRoutes);
// app.use("/api/v1/courses", courseRoutes); // ✅ Registered

// // Debug: list all endpoints
// console.log("📋 Registered endpoints:");
// console.table(listEndpoints(app));

// // ✅ Health check
// app.get("/api/v1/health", async (req, res) => {
//   try {
//     await sequelize.authenticate();
//     res.json({ status: "OK", db: "connected", time: new Date().toISOString() });
//   } catch (err) {
//     res.status(500).json({ status: "ERROR", db: "disconnected", error: err.message });
//   }
// });

// // ====================
// // 🔹 404 + Error Handlers
// // ====================
// app.use((req, res) => {
//   console.log("❌ 404 Not Found:", req.originalUrl);
//   res.status(404).json({ success: false, error: "Not Found" });
// });

// app.use((err, req, res, next) => {
//   console.error("❌ Global Error:", err.stack || err.message);
//   res.status(err.status || 500).json({
//     success: false,
//     error: err.message || "Internal Server Error",
//   });
// });

// // ====================
// // 🔹 Start Server
// // ====================
// const PORT = process.env.PORT || 5000;

// (async () => {
//   try {
//     if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
//       throw new Error("Missing critical env vars: JWT_SECRET, DATABASE_URL");
//     }

//     await sequelize.sync({ alter: false });
//     console.log("✅ Models synced with DB");

//     app.listen(PORT, "0.0.0.0", () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ Server startup error:", err.message);
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
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import courseRoutes from "./routes/courses.js";

const app = express();
app.set("trust proxy", 1); // needed for cookies in many hosted environments

// Log key env vars
console.log("🚀 DATABASE_URL set?", !!process.env.DATABASE_URL);
console.log("🚀 JWT_SECRET set?", !!process.env.JWT_SECRET);
console.log("🌍 FRONTEND_URL:", process.env.FRONTEND_URL);

// ========== Middleware ==========
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== CORS ==========
// Allowed origins should include Netlify frontend + localhost (for dev)
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL, // e.g. https://math-class-platform.netlify.app
];

app.use(
  cors({
    origin: (origin, callback) => {
      console.log("🌍 Incoming Origin:", origin);
      // Accept if no origin (like some requests) OR origin in allowedOrigins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("🚫 Blocked by CORS, origin:", origin);
        callback(new Error("Not allowed by CORS"));
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

// ========== Request Logger ==========
app.use((req, res, next) => {
  console.log(`📥 [${req.method}] ${req.originalUrl}`);
  next();
});

// ========== Routes ==========
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/courses", courseRoutes);

// Health check
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
  res.status(500).json({ success: false, error: "Server error" });
});

// ========== Start Server ==========
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
      throw new Error("Missing critical env vars");
    }
    await sequelize.sync({ alter: false });
    console.log("✅ DB Synced");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup Error:", err.message);
  }
})();
