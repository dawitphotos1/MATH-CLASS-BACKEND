
// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import listEndpoints from "express-list-endpoints";

import sequelize from "./config/db.js"; // DB instance
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";

const app = express();
app.set("trust proxy", 1); // Needed for cookies behind proxy

// 🔍 Log critical env vars presence
console.log(
  "🚀 DATABASE_URL:",
  process.env.DATABASE_URL ? "✅ SET" : "❌ MISSING"
);
console.log("🚀 JWT_SECRET:", process.env.JWT_SECRET ? "✅ SET" : "❌ MISSING");

// ====================
// 🔹 Middleware
// ====================
app.use(helmet());
app.use(cookieParser()); // Needed for JWT cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ CORS (allow frontend domains + credentials)
const allowedOrigins = [
  "http://localhost:3000",
  "https://mathe-class-website-frontend.onrender.com",
];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Rate limiting (disable in dev to prevent 429 flood)
if (process.env.NODE_ENV === "production") {
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 5000,
    max: 500,
    message: { success: false, error: "Too many requests. Try again later." },
  });
  app.use("/api", apiLimiter);
  console.log("✅ Rate limiting enabled (production)");
} else {
  console.log("⚡ Rate limiting disabled (development mode)");
}

// ✅ Logger
app.use((req, res, next) => {
  console.log(`📥 [${req.method}] ${req.originalUrl}`);
  next();
});

// ====================
// 🔹 Routes
// ====================
console.log("📦 Registering routes: /api/v1/auth, /api/v1/admin");
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);

// Debug: list all endpoints
console.log("📋 Registered endpoints:");
console.table(listEndpoints(app));

// ✅ Health check (for Render)
app.get("/api/v1/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ status: "OK", db: "connected", time: new Date().toISOString() });
  } catch (err) {
    res
      .status(500)
      .json({ status: "ERROR", db: "disconnected", error: err.message });
  }
});

// ====================
// 🔹 404 + Error Handlers
// ====================
app.use((req, res) => {
  console.log("❌ 404 Not Found:", req.originalUrl);
  res.status(404).json({ success: false, error: "Not Found" });
});

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
