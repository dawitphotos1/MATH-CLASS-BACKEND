require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("./models");

const app = express();
app.set("trust proxy", 1);

console.log("🚀 DATABASE_URL:", process.env.DATABASE_URL);

// =========================
// 🔐 Middleware
// =========================
app.use(helmet());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Allowed origins
const allowedOrigins = [
  "http://localhost:3000", // Local React dev
  "https://mathe-class-website-frontend.onrender.com", // 🔥 your deployed frontend (replace if needed)
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
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: "Too many requests. Try again later." },
});
app.use("/api", apiLimiter);

// ✅ Simple logger
app.use((req, res, next) => {
  console.log(`📥 [${req.method}] ${req.originalUrl}`);
  next();
});

// =========================
// 🛣 Routes
// =========================
app.use("/api/v1/auth", require("./routes/authRoutes"));
app.use("/api/v1/users", require("./routes/userRoutes"));
app.use("/api/v1/courses", require("./routes/courseRoutes"));
app.use("/api/v1/payments", require("./routes/payments"));
app.use("/api/v1/enrollments", require("./routes/enrollments"));
app.use("/api/v1/admin", require("./routes/adminRoutes"));

// ✅ Health Check
app.get("/health", (req, res) => {
  res.json({ status: "OK", time: new Date().toISOString() });
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", err.message, err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// =========================
// 🚀 Start Server
// =========================
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    if (
      !process.env.JWT_SECRET ||
      !process.env.DATABASE_URL ||
      !process.env.STRIPE_SECRET_KEY
    ) {
      throw new Error(
        "Missing critical env vars: JWT_SECRET, DATABASE_URL, STRIPE_SECRET_KEY"
      );
    }

    await sequelize.authenticate();
    console.log("✅ Connected to PostgreSQL");

    await sequelize.sync({ alter: false });
    console.log("✅ Models synced with DB");

    // 🔑 IMPORTANT: 0.0.0.0 for Render
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup error:", err.message, err.stack);
    process.exit(1);
  }
})();
