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
   Note: keep POST routes before dynamic GET /:id to avoid accidental
   route collisions in some setups.
============================================================ */

// Create Stripe checkout session
router.post("/create-session", authenticateToken, createCheckoutSession);

// Confirm payment (after checkout success)
router.post("/confirm", authenticateToken, confirmPayment);
router.post("/confirm-payment", authenticateToken, confirmPayment);

// Fetch course info for payment display (dynamic id route last)
router.get("/:id", authenticateToken, getCourseForPayment);

export default router;
