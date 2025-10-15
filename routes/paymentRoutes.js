// Mathe-Class-Website-Backend/routes/paymentRoutes.js
import express from "express";
import { confirmPayment, createCheckoutSession } from "../controllers/paymentController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create session (protected)
router.post("/create-session", authenticateToken, createCheckoutSession);

// Primary confirm endpoint
router.post("/confirm", authenticateToken, confirmPayment);

// Backwards-compatible alias (some frontends call confirm-payment)
router.post("/confirm-payment", authenticateToken, confirmPayment);

export default router;
