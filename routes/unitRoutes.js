//routes/unitRoutes.js

import express from "express";
import {
  createUnit,
  getUnitsByCourse,
  getUnitById,
  updateUnit,
  deleteUnit,
} from "../controllers/unitController.js";

// ✅ CORRECT IMPORTS
import  authenticateToken  from "../middleware/authMiddleware.js";
import checkTeacherOrAdmin from "../middleware/checkTeacherOrAdmin.js"; // Default import

const router = express.Router();

// Unit routes
router.post(
  "/courses/:courseId/units",
  authenticateToken,
  checkTeacherOrAdmin,
  createUnit
);
router.get("/courses/:courseId/units", authenticateToken, getUnitsByCourse);
router.get("/units/:unitId", authenticateToken, getUnitById);
router.put(
  "/units/:unitId",
  authenticateToken,
  checkTeacherOrAdmin,
  updateUnit
);
router.delete(
  "/units/:unitId",
  authenticateToken,
  checkTeacherOrAdmin,
  deleteUnit
);

export default router;
