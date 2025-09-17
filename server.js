// // server.js
// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const helmet = require("helmet");
// const cookieParser = require("cookie-parser");
// const rateLimit = require("express-rate-limit");
// const { sequelize } = require("./models");

// const app = express();
// app.set("trust proxy", 1);

// // 🔍 Log important env vars (without exposing secrets)
// console.log("🚀 DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "MISSING");
// console.log("🚀 JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "MISSING");

// // Middleware
// app.use(helmet());
// app.use(cookieParser());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ✅ CORS setup
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
//         console.warn("❌ Blocked by CORS:", origin);
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// // Rate Limiting
// const apiLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 500,
//   message: { success: false, error: "Too many requests. Try again later." },
// });
// app.use("/api", apiLimiter);

// // Logger
// app.use((req, res, next) => {
//   console.log(`📥 [${req.method}] ${req.originalUrl}`);
//   next();
// });

// // Routes
// console.log("🚀 Registering routes: /api/v1/auth, /api/v1/admin");
// app.use("/api/v1/auth", require("./routes/auth"));
// app.use("/api/v1/admin", require("./routes/admin"));

// // Health Check
// app.get("/api/v1/health", (req, res) => {
//   res.json({ status: "OK", time: new Date().toISOString() });
// });

// // 404 Handler
// app.use((req, res) => {
//   console.log("404: Route not found", { url: req.originalUrl });
//   res.status(404).json({ success: false, error: "Not Found" });
// });

// // Global Error Handler
// app.use((err, req, res, next) => {
//   console.error("❌ Global Error:", { error: err.message });
//   res.status(err.status || 500).json({
//     success: false,
//     error: err.message || "Internal Server Error",
//   });
// });

// // Start Server
// const PORT = process.env.PORT || 5000;

// (async () => {
//   try {
//     if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
//       throw new Error("Missing critical env vars: JWT_SECRET, DATABASE_URL");
//     }

//     await sequelize.authenticate();
//     console.log("✅ Connected to PostgreSQL");

//     await sequelize.sync({ alter: false });
//     console.log("✅ Models synced with DB");

//     app.listen(PORT, "0.0.0.0", () => {
//       console.log(`🚀 Server running on port ${PORT}`);
//     });
//   } catch (err) {
//     console.error("❌ Server startup error:", err.message);
//     process.exit(1);
//   }
// })();



// server.js - TEMPORARY SIMPLIFIED VERSION
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("./models");

const app = express();
app.set("trust proxy", 1);

console.log("🚀 DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "MISSING");
console.log("🚀 JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "MISSING");
console.log("🚀 NODE_ENV:", process.env.NODE_ENV || "development");

// Middleware
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// CORS
app.use(cors({
  origin: ["http://localhost:3000", "https://mathe-class-website-frontend.onrender.com"],
  credentials: true
}));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, error: "Too many requests" }
});
app.use("/api", apiLimiter);

// Logger
app.use((req, res, next) => {
  console.log(`📥 [${req.method}] ${req.originalUrl}`);
  next();
});

// ONLY LOAD BASIC ROUTES FOR NOW
console.log("🚀 Registering basic routes...");
app.use("/api/v1/auth", require("./routes/auth"));
// app.use("/api/v1/admin", require("./routes/admin"));
// app.use("/api/v1/courses", require("./routes/courses"));

// Health Check
app.get("/api/v1/health", (req, res) => {
  res.json({ status: "OK", time: new Date().toISOString() });
});

// Test endpoint
app.get("/api/v1/auth/test", (req, res) => {
  res.json({ message: "Auth endpoint is working", timestamp: new Date().toISOString() });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Not Found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.message);
  res.status(500).json({ success: false, error: "Internal Server Error" });
});

// Start Server
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to PostgreSQL");

    await sequelize.sync({ alter: false });
    console.log("✅ Models synced with DB");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup error:", err.message);
    process.exit(1);
  }
})();