// import express from "express";
// import {
//   createUnit,
//   getUnitsByCourse,
//   updateUnit,
//   deleteUnit,
// } from "../controllers/unitController.js";
// import { authenticate, authorizeTeacher } from "../middleware/auth.js";

// const router = express.Router();

// router.post(
//   "/courses/:courseId/units",
//   authenticate,
//   authorizeTeacher,
//   createUnit
// );
// router.get("/courses/:courseId/units", authenticate, getUnitsByCourse);
// router.put("/units/:unitId", authenticate, authorizeTeacher, updateUnit);
// router.delete("/units/:unitId", authenticate, authorizeTeacher, deleteUnit);

// export default router;



import express from "express";
import {
  createUnit,
  getUnitsByCourse,
  getUnitById,
  updateUnit,
  deleteUnit,
} from "../controllers/unitController.js";
import { authenticate, authorizeTeacher } from "../middleware/auth.js";

const router = express.Router();

// Unit routes
router.post(
  "/courses/:courseId/units",
  authenticate,
  authorizeTeacher,
  createUnit
);
router.get("/courses/:courseId/units", authenticate, getUnitsByCourse);
router.get("/units/:unitId", authenticate, getUnitById);
router.put("/units/:unitId", authenticate, authorizeTeacher, updateUnit);
router.delete("/units/:unitId", authenticate, authorizeTeacher, deleteUnit);

export default router;