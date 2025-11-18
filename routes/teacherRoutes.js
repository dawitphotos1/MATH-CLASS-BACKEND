// // routes/teacherRoutes.js
// import express from "express";
// import {
//   getTeacherCourseFull,
//   getAllTeacherCoursesFull,
// } from "../controllers/teacherController.js";

// const router = express.Router();

// router.get("/teacher/:courseId/full", getTeacherCourseFull);

// router.get("/teacher/full-structure", getAllTeacherCoursesFull);

// export default router;




// routes/teacherRoutes.js
import express from "express";
import {
  getTeacherCourseFull,
  getAllTeacherCoursesFull,
} from "../controllers/teacherController.js";

const router = express.Router();

router.get("/teacher/:courseId/full", getTeacherCourseFull);

router.get("/teacher/full-structure", getAllTeacherCoursesFull);

export default router;
