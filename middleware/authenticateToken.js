// // middleware/authenticateToken.js
// import jwt from "jsonwebtoken";
// import db from "../models/index.js";

// const { User } = db;

// const authenticateToken = async (req, res, next) => {
//   console.log(`🔐 Auth check for: ${req.method} ${req.path}`);
  
//   try {
//     let token = null;

//     // Check Authorization header
//     if (req.headers.authorization?.startsWith("Bearer ")) {
//       token = req.headers.authorization.split(" ")[1];
//       console.log("📨 Token from Authorization header");
//     } 
//     // Check cookies
//     else if (req.cookies?.token) {
//       token = req.cookies.token;
//       console.log("🍪 Token from cookie");
//     }
//     // Check query parameter (for testing)
//     else if (req.query.token) {
//       token = req.query.token;
//       console.log("🔗 Token from query parameter");
//     }

//     if (!token) {
//       console.log("❌ No token provided");
//       return res.status(401).json({ 
//         success: false, 
//         error: "Authentication required. Please log in." 
//       });
//     }

//     // Verify token with timeout
//     const decoded = await new Promise((resolve, reject) => {
//       jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//         if (err) reject(err);
//         else resolve(decoded);
//       });
//     });
    
//     if (!decoded?.id) {
//       console.log("❌ Invalid token structure");
//       return res.status(401).json({ success: false, error: "Invalid token" });
//     }

//     console.log(`👤 Token verified for user ID: ${decoded.id}`);

//     // Find user with timeout
//     const user = await Promise.race([
//       User.findByPk(decoded.id, {
//         attributes: ["id", "name", "email", "role", "approval_status"],
//       }),
//       new Promise((_, reject) => 
//         setTimeout(() => reject(new Error('Database query timeout')), 8000)
//       )
//     ]);

//     if (!user) {
//       console.log(`❌ User not found for ID: ${decoded.id}`);
//       return res.status(401).json({ success: false, error: "User not found" });
//     }

//     // Check if user is approved
//     if (user.approval_status !== "approved") {
//       console.log(`⏳ User ${user.email} is not approved (status: ${user.approval_status})`);
//       return res.status(403).json({ 
//         success: false, 
//         error: "Your account is pending approval" 
//       });
//     }

//     console.log(`✅ Authentication successful for: ${user.email} (${user.role})`);

//     req.user = {
//       id: user.id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       approval_status: user.approval_status,
//     };

//     next();
//   } catch (err) {
//     console.error("❌ Auth error:", err.message);
    
//     // Handle specific errors
//     if (err.name === 'TokenExpiredError') {
//       return res.status(401).json({ 
//         success: false, 
//         error: "Session expired. Please log in again." 
//       });
//     }
    
//     if (err.name === 'JsonWebTokenError') {
//       return res.status(401).json({ 
//         success: false, 
//         error: "Invalid authentication token." 
//       });
//     }
    
//     if (err.message === 'Database query timeout') {
//       console.error("⏰ Auth database query timeout");
//       return res.status(408).json({ 
//         success: false, 
//         error: "Authentication timeout. Please try again." 
//       });
//     }
    
//     // Generic error
//     res.status(403).json({ 
//       success: false, 
//       error: "Authentication failed. Please log in again." 
//     });
//   }
// };

// export default authenticateToken;




// middleware/authenticateToken.js
import jwt from "jsonwebtoken";
import db from "../models/index.js";

const { User } = db;

/**
 * Verifies JWT from (1) Authorization Bearer header, (2) cookie 'token', (3) query param 'token'.
 * Loads user from DB and attaches safe profile to req.user.
 * Handles expiration / invalid token / DB timeout gracefully.
 */
const authenticateToken = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.query?.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    // Verify token
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Clear cookie if invalid/expired to help browser UX
      if (req.cookies?.token) {
        res.clearCookie("token");
      }
      const message =
        err.name === "TokenExpiredError"
          ? "Session expired. Please log in again."
          : "Invalid authentication token.";
      return res.status(401).json({ success: false, error: message });
    }

    if (!payload?.id) {
      return res.status(401).json({ success: false, error: "Invalid token payload" });
    }

    // Load user (protect against long DB queries)
    const user = await Promise.race([
      User.findByPk(payload.id, { attributes: ["id", "name", "email", "role", "approval_status"] }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("DB timeout")), 8000)),
    ]);

    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    // Optional: disallow users not approved
    if (user.approval_status && user.approval_status !== "approved") {
      return res.status(403).json({ success: false, error: "Your account is pending approval" });
    }

    // Attach safe user object
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      approval_status: user.approval_status,
    };

    next();
  } catch (err) {
    console.error("authenticateToken error:", err?.message || err);
    if (err.message === "DB timeout") {
      return res.status(408).json({ success: false, error: "Authentication timeout. Try again." });
    }
    return res.status(500).json({ success: false, error: "Authentication error" });
  }
};

export default authenticateToken;
