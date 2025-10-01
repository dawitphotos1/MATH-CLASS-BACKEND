
// // routes/courses.js
// import express from "express";
// import multer from "multer";
// import fs from "fs";
// import path from "path";

// import { 
//   createCourse, 
//   getCourses, 
//   getPublicCourseBySlug, 
//   getLessonsByCourse, 
//   deleteCourse 
// } from "../controllers/courseController.js";

// import authenticateToken from "../middleware/authenticateToken.js";
// import roleMiddleware from "../middleware/roleMiddleware.js";
// import checkTeacherOrAdmin from "../middleware/checkTeacherOrAdmin.js";

// const router = express.Router();

// // Multer setup...
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = path.join(process.cwd(), "Uploads");
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     const unique = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
//     cb(null, unique);
//   },
// });
// const upload = multer({ storage });

// // === Routes ===
// router.post(
//   "/",
//   authenticateToken,
//   roleMiddleware(["teacher"]),
//   upload.none(),
//   createCourse
// );

// router.get("/", authenticateToken, getCourses);
// router.get("/public/slug/:slug", getPublicCourseBySlug);
// router.get("/:courseId/lessons", authenticateToken, getLessonsByCourse);
// router.delete("/:id", authenticateToken, roleMiddleware(["teacher", "admin"]), deleteCourse);

// export default router;





import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

import {
  createCourse,
  getCourses,
  getPublicCourseBySlug,
  getLessonsByCourse,
  deleteCourse,
} from "../controllers/courseController.js";

import authenticateToken from "../middleware/authenticateToken.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import checkTeacherOrAdmin from "../middleware/checkTeacherOrAdmin.js";

const router = express.Router();

// Multer setup...
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "Uploads");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, unique);
  },
});
const upload = multer({ storage });

// === Routes ===
router.post(
  "/",
  authenticateToken,
  roleMiddleware(["teacher"]),
  upload.none(),
  createCourse
);

router.get("/", authenticateToken, getCourses);
router.get("/public/slug/:slug", getPublicCourseBySlug);
router.get("/:courseId/lessons", authenticateToken, getLessonsByCourse);
router.delete(
  "/:id",
  authenticateToken,
  roleMiddleware(["teacher", "admin"]),
  deleteCourse
);

export default router;
