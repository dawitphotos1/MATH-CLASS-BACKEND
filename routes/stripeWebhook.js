
// routes/stripeWebhookRoutes.js
import express from "express";
import { stripeWebhookHandler } from "../controllers/stripeWebhookController.js";

const router = express.Router();

// Must use express.raw() for Stripe signature verification
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler
);

export default router;
