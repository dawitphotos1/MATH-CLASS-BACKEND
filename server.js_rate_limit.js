//server.js_rate_limit.js

const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 5000, // 15 minutes
  max: 5, // Limit to 5 requests per window
});

app.use("/api/v1/auth/login", loginLimiter);
