// // routes/paymentRoutes.js
// const express = require("express");
// const router = express.Router();
// const { createCheckoutSession } = require("../controllers/paymentController");

// router.post("/create-checkout-session", createCheckoutSession);

// module.exports = router;




import express from "express";
import { confirmPayment } from "../controllers/paymentConfirmController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/confirm", authenticateToken, confirmPayment);

export default router;
