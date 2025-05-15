
<<<<<<< HEAD
require("dotenv").config(); // ✅ Load environment variables first

const express = require("express");
const cors = require("cors");
const db = require("./models");
const courseRoutes = require("./routes/courses");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");
const paymentRoutes = require("./routes/payments");
const progressRoutes = require("./routes/progress");
const adminRoutes = require("./routes/admin"); // ✅ NEW: Admin routes
const emailRoutes = require("./routes/email");

const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/progress", progressRoutes);
app.use("/api/v1/admin", adminRoutes); // ✅ NEW: Mount admin routes
app.use("/api/v1/email", emailRoutes); 

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", {
    message: err.message,
    stack: err.stack,
  });
  res.status(500).json({
    success: false,
    error: "Internal server error",
    details: err.message,
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Connect to database and start server
const PORT = process.env.PORT || 5000;
db.sequelize
  .authenticate()
  .then(async () => {
    console.log("✅ MySQL connection established");
    // await db.sequelize.sync({ force: false });
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", {
      message: err.message,
      stack: err.stack,
    });
    process.exit(1);
  });



// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");
// const path = require("path");
=======
// require("dotenv").config(); // ✅ Load environment variables first

// const express = require("express");
// const cors = require("cors");
>>>>>>> 899418cd511bd0d2a4d0b66c9f013b4e49f6b202
// const db = require("./models");
// const courseRoutes = require("./routes/courses");
// const userRoutes = require("./routes/users");
// const authRoutes = require("./routes/auth");
// const paymentRoutes = require("./routes/payments");
// const progressRoutes = require("./routes/progress");
<<<<<<< HEAD
// const adminRoutes = require("./routes/admin");
=======
// const adminRoutes = require("./routes/admin"); // ✅ NEW: Admin routes
>>>>>>> 899418cd511bd0d2a4d0b66c9f013b4e49f6b202
// const emailRoutes = require("./routes/email");

// const app = express();

// // Middleware
<<<<<<< HEAD
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:3000",
//     credentials: true,
//   })
// );
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, "public"))); // Serve static files
=======
// app.use(cors({ origin: "http://localhost:3000", credentials: true }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
>>>>>>> 899418cd511bd0d2a4d0b66c9f013b4e49f6b202

// // Request logging middleware
// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
//   next();
// });

// // Routes
// app.use("/api/v1/users", userRoutes);
// app.use("/api/v1/courses", courseRoutes);
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/payments", paymentRoutes);
// app.use("/api/v1/progress", progressRoutes);
<<<<<<< HEAD
// app.use("/api/v1/admin", adminRoutes);
// app.use("/api/v1/email", emailRoutes);
=======
// app.use("/api/v1/admin", adminRoutes); // ✅ NEW: Mount admin routes
// app.use("/api/v1/email", emailRoutes); 
>>>>>>> 899418cd511bd0d2a4d0b66c9f013b4e49f6b202

// // Global error handling middleware
// app.use((err, req, res, next) => {
//   console.error("Unhandled error:", {
//     message: err.message,
//     stack: err.stack,
//   });
<<<<<<< HEAD
//   res.status(err.statusCode || 500).json({
//     success: false,
//     error: err.statusCode ? err.message : "Internal server error",
//     details: process.env.NODE_ENV === "development" ? err.message : undefined,
=======
//   res.status(500).json({
//     success: false,
//     error: "Internal server error",
//     details: err.message,
>>>>>>> 899418cd511bd0d2a4d0b66c9f013b4e49f6b202
//   });
// });

// // Health check endpoint
// app.get("/health", (req, res) => {
//   res.json({ status: "OK", message: "Server is running" });
// });

// // Connect to database and start server
// const PORT = process.env.PORT || 5000;
// db.sequelize
//   .authenticate()
//   .then(async () => {
//     console.log("✅ MySQL connection established");
<<<<<<< HEAD
//     // Run migrations instead of sync in production
//     // await db.sequelize.sync({ force: false }); // Commented out
=======
//     // await db.sequelize.sync({ force: false });
>>>>>>> 899418cd511bd0d2a4d0b66c9f013b4e49f6b202
//     app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("Unable to connect to the database:", {
//       message: err.message,
//       stack: err.stack,
//     });
//     process.exit(1);
<<<<<<< HEAD
//   });
=======
//   });



// // require("dotenv").config();

// // const express = require("express");
// // const cors = require("cors");
// // const path = require("path");
// // const db = require("./models");
// // const courseRoutes = require("./routes/courses");
// // const userRoutes = require("./routes/users");
// // const authRoutes = require("./routes/auth");
// // const paymentRoutes = require("./routes/payments");
// // const progressRoutes = require("./routes/progress");
// // const adminRoutes = require("./routes/admin");
// // const emailRoutes = require("./routes/email");

// // const app = express();

// // // Middleware
// // app.use(
// //   cors({
// //     origin: process.env.FRONTEND_URL || "http://localhost:3000",
// //     credentials: true,
// //   })
// // );
// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));
// // app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// // // Request logging middleware
// // app.use((req, res, next) => {
// //   console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
// //   next();
// // });

// // // Routes
// // app.use("/api/v1/users", userRoutes);
// // app.use("/api/v1/courses", courseRoutes);
// // app.use("/api/v1/auth", authRoutes);
// // app.use("/api/v1/payments", paymentRoutes);
// // app.use("/api/v1/progress", progressRoutes);
// // app.use("/api/v1/admin", adminRoutes);
// // app.use("/api/v1/email", emailRoutes);

// // // Global error handling middleware
// // app.use((err, req, res, next) => {
// //   console.error("Unhandled error:", {
// //     message: err.message,
// //     stack: err.stack,
// //   });
// //   res.status(err.statusCode || 500).json({
// //     success: false,
// //     error: err.statusCode ? err.message : "Internal server error",
// //     details: process.env.NODE_ENV === "development" ? err.message : undefined,
// //   });
// // });

// // // Health check endpoint
// // app.get("/health", (req, res) => {
// //   res.json({ status: "OK", message: "Server is running" });
// // });

// // // Connect to database and start server
// // const PORT = process.env.PORT || 5000;
// // db.sequelize
// //   .authenticate()
// //   .then(async () => {
// //     console.log("✅ MySQL connection established");
// //     // Run migrations instead of sync in production
// //     // await db.sequelize.sync({ force: false }); // Commented out
// //     app.listen(PORT, () => {
// //       console.log(`Server running on port ${PORT}`);
// //     });
// //   })
// //   .catch((err) => {
// //     console.error("Unable to connect to the database:", {
// //       message: err.message,
// //       stack: err.stack,
// //     });
// //     process.exit(1);
// //   });



const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { sequelize } = require("./models");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/users", require("./routes/users"));
app.use("/api/v1/courses", require("./routes/courses"));
app.use("/api/v1/payments", require("./routes/payments"));
app.use("/api/v1/email", require("./routes/email"));
app.use("/api/v1/admin", require("./routes/admin"));
app.use("/api/v1/progress", require("./routes/progress"));

// Error Handling
app.use(require("./middleware/errorHandler"));

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Start Server
const PORT = process.env.PORT || 5000;
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected");
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });
>>>>>>> 899418cd511bd0d2a4d0b66c9f013b4e49f6b202
