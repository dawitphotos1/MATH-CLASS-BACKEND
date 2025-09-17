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
const path = require("path");
const { sequelize } = require("./models");

const app = express();
app.set("trust proxy", 1);

// 🔍 Log important env vars (without exposing secrets)
console.log("🚀 DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "MISSING");
console.log("🚀 JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "MISSING");
console.log("🚀 NODE_ENV:", process.env.NODE_ENV || "development");

// Middleware
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files (for uploaded files)
app.use("/Uploads", express.static(path.join(__dirname, "Uploads")));

// ✅ CORS setup - More permissive for development
const allowedOrigins = [
  "http://localhost:3000",
  "https://mathe-class-website-frontend.onrender.com",
  "http://localhost:3001",
  "https://mathe-class-website-frontend.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (process.env.NODE_ENV === "development") {
        // Allow all origins in development
        callback(null, true);
      } else {
        console.warn("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Rate Limiting - More generous limits
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased from 500 to 1000
  message: { 
    success: false, 
    error: "Too many requests from this IP. Please try again later." 
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/api/v1/health";
  }
});

app.use("/api", apiLimiter);

// Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`📥 [${req.method}] ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

// Import routes
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const courseRoutes = require("./routes/courses");
const enrollmentRoutes = require("./routes/enrollments");
const lessonRoutes = require("./routes/lessonRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require("./routes/users");
const fileRoutes = require("./routes/files");

// Register routes with proper base paths
console.log("🚀 Registering API routes...");
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/lessons", lessonRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/files", fileRoutes);

console.log("✅ All routes registered successfully");

// Health Check endpoint - More detailed
app.get("/api/v1/health", async (req, res) => {
  try {
    // Test database connection
    await sequelize.authenticate();
    
    res.json({ 
      status: "OK", 
      timestamp: new Date().toISOString(),
      database: "Connected",
      environment: process.env.NODE_ENV || "development",
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({ 
      status: "ERROR", 
      timestamp: new Date().toISOString(),
      database: "Disconnected",
      error: error.message,
      environment: process.env.NODE_ENV || "development"
    });
  }
});

// Test endpoint to verify auth routes are working
app.get("/api/v1/auth/test", (req, res) => {
  res.json({ 
    message: "Auth endpoint is working correctly", 
    timestamp: new Date().toISOString(),
    status: "success"
  });
});

// Test endpoint for courses
app.get("/api/v1/test/courses", async (req, res) => {
  try {
    const { Course } = require("./models");
    const courses = await Course.findAll({ 
      limit: 5,
      attributes: ["id", "title", "description", "price"]
    });
    res.json({ 
      success: true, 
      count: courses.length,
      courses 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Math Class Website Backend API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/v1/auth",
      admin: "/api/v1/admin",
      courses: "/api/v1/courses",
      health: "/api/v1/health"
    },
    documentation: "See API docs for more information"
  });
});

// 404 Handler - More descriptive
app.use((req, res) => {
  console.log("404: Route not found", { 
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });
  
  res.status(404).json({ 
    success: false, 
    error: "Endpoint not found",
    path: req.originalUrl,
    method: req.method,
    available_endpoints: {
      auth: "/api/v1/auth",
      admin: "/api/v1/admin",
      courses: "/api/v1/courses",
      health: "/api/v1/health"
    }
  });
});

// Global Error Handler - More comprehensive
app.use((err, req, res, next) => {
  console.error("❌ Global Error:", {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  // Handle specific error types
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      details: err.message
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Invalid token"
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "Token expired"
    });
  }

  // Default error response
  const statusCode = err.status || 500;
  const errorResponse = {
    success: false,
    error: err.message || "Internal Server Error"
  };

  // Only include stack trace in development
  if (process.env.NODE_ENV === "development") {
    errorResponse.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
});

// Graceful shutdown handling
process.on("SIGINT", async () => {
  console.log("🛑 Received SIGINT. Shutting down gracefully...");
  try {
    await sequelize.close();
    console.log("✅ Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  console.log("🛑 Received SIGTERM. Shutting down gracefully...");
  try {
    await sequelize.close();
    console.log("✅ Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
});

// Start Server
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("Missing JWT_SECRET environment variable");
    }

    if (!process.env.DATABASE_URL) {
      throw new Error("Missing DATABASE_URL environment variable");
    }

    console.log("🔗 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Connected to PostgreSQL database");

    console.log("🔄 Syncing database models...");
    await sequelize.sync({ 
      alter: process.env.NODE_ENV === "development",
      force: false 
    });
    console.log("✅ Database models synced successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/v1/health`);
      console.log(`🔐 Auth test: http://localhost:${PORT}/api/v1/auth/test`);
    });
  } catch (err) {
    console.error("❌ Server startup error:", err.message);
    console.error("Stack trace:", err.stack);
    process.exit(1);
  }
})();