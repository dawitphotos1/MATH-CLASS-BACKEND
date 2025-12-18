// server.js
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import sequelize from "./config/db.js";

/* Routes */
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/admin.js";
import courseRoutes from "./routes/courses.js";
import lessonRoutes from "./routes/lessonRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import filesRoutes from "./routes/files.js";
import unitRoutes from "./routes/unitRoutes.js";
import teacherRoutes from "./routes/teacher.js";
import emailRoutes from "./routes/email.js";
import { handleStripeWebhook } from "./controllers/paymentController.js";
// In your main server.js or routes/index.js
import sublessonRoutes from "./routes/sublessonRoutes.js";

const app = express();
app.set("trust proxy", 1);

// =========================================================
// SECURITY
// =========================================================
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "https://js.stripe.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://*.stripe.com"],
        frameSrc: ["'self'", "https://*.stripe.com"],
      },
    },
  })
);

// =========================================================
// CORS
// =========================================================
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// =========================================================
// STRIPE WEBHOOK (RAW BODY)
// =========================================================
app.post(
  "/api/v1/payments/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

// =========================================================
// BODY PARSERS
// =========================================================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// =========================================================
// ROUTES
// =========================================================
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/lessons", lessonRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/files", filesRoutes);
app.use("/api/v1/units", unitRoutes);
app.use("/api/v1/teacher", teacherRoutes);
app.use("/api/v1/email", emailRoutes);
app.use("/api/v1/sublessons", sublessonRoutes);
// =========================================================
// HEALTH
// =========================================================
app.get("/api/v1/health", async (_, res) => {
  try {
    await sequelize.authenticate();
    res.json({ success: true, status: "healthy" });
  } catch {
    res.status(500).json({ success: false, status: "unhealthy" });
  }
});

// =========================================================
// 404
// =========================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

// =========================================================
// START
// =========================================================
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Startup failed:", err.message);
    process.exit(1);
  }
})();

export default app;
