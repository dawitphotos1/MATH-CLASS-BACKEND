
// routes/paymentRoutes.js
import express from "express";
import {
  confirmPayment,
  createCheckoutSession,
  getCourseForPayment,
} from "../controllers/paymentController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ============================================================
   💰 Payment Routes
============================================================ */

// Fetch course info for payment display
router.get("/:id", authenticateToken, getCourseForPayment);

// Create Stripe checkout session
router.post("/create-session", authenticateToken, createCheckoutSession);

// Confirm payment (after checkout success)
router.post("/confirm", authenticateToken, confirmPayment);
router.post("/confirm-payment", authenticateToken, confirmPayment);

export default router;
