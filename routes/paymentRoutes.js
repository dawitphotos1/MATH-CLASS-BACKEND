
import express from "express";
import { confirmPayment } from "../controllers/paymentConfirmController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/confirm", authenticateToken, confirmPayment);

export default router;
