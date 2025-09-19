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



// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const sequelize = require("./config/db");

const app = express();
app.set("trust proxy", 1); // For cookies over HTTPS in Render

// 🔍 Log env vars presence
console.log("🚀 DATABASE_URL:", process.env.DATABASE_URL ? "✅ SET" : "❌ MISSING");
console.log("🚀 JWT_SECRET:", process.env.JWT_SECRET ? "✅ SET" : "❌ MISSING");

// ====================
// 🔹 Middleware
// ====================
app.use(helmet());
app.use(cookieParser()); // ✅ Required for reading JWT cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS Configuration — allows credentials
const allowedOrigins = [
  "http://localhost:3000",
  "https://mathe-class-website-frontend.onrender.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // ✅ Needed for cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, error: "Too many requests. Try again later." },
});
app.use("/api", apiLimiter);

// ✅ Simple Request Logger
app.use((req, res, next) => {
  console.log(`📥 [${req.method}] ${req.originalUrl}`);
  next();
});

// ====================
// 🔹 Routes
// ====================
console.log("📦 Registering routes: /api/v1/auth, /api/v1/admin");
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/admin", require("./routes/admin")); // leave this as-is

// 🔍 Health check route (for Render)
app.get("/api/v1/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: "OK", db: "connected", time: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: "ERROR", db: "disconnected", error: err.message });
  }
});

// ====================
// 🔹 404 Handler
// ====================
app.use((req, res) => {
  console.log("❌ 404 Not Found:", req.originalUrl);
  res.status(404).json({ success: false, error: "Not Found" });
});

// ====================
// 🔹 Global Error Handler
// ====================
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

// ====================
// 🔹 Start Server
// ====================
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
      throw new Error("Missing critical env vars: JWT_SECRET, DATABASE_URL");
    }

    await sequelize.sync({ alter: false });
    console.log("✅ Models synced with DB");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup error:", err.message);
  }
})();
