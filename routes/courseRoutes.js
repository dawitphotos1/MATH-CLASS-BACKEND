
// //routs/courseRoutes.js
// const express = require("express");
// const router = express.Router();
// const courseController = require("../controllers/courseController");
// const authMiddleware = require("../middleware/authMiddleware");
// const { authorize: roleMiddleware } = require("../middleware/roleMiddleware"); // ✅ Fixed import
// const checkTeacherOrAdmin = require("../middleware/checkTeacherOrAdmin");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// // ✅ Multer setup for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadPath = path.join(__dirname, "..", "Uploads");
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

// const upload = multer({
//   storage,
//   limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
// });

// const uploadFields = upload.fields([
//   { name: "attachments", maxCount: 10 },
//   { name: "thumbnail", maxCount: 1 },
//   { name: "introVideo", maxCount: 1 },
// ]);

// // ✅ Create a new course
// router.post(
//   "/create",
//   authMiddleware,
//   roleMiddleware("teacher", "admin"),
//   uploadFields,
//   courseController.createCourse
// );

// // ✅ Fetch courses for logged-in user (teacher/admin)
// router.get("/", authMiddleware, courseController.getTeacherCourses);

// // ✅ Get a specific course by slug (public access)
// router.get("/slug/:slug", courseController.getCourseBySlug);

// // ✅ Fetch full course by slug (requires enrollment)
// router.get(
//   "/enrolled/slug/:slug",
//   authMiddleware,
//   courseController.getEnrolledCourseBySlug
// );

// // ✅ Get lessons by course ID
// router.get(
//   "/:courseId/lessons",
//   authMiddleware,
//   courseController.getLessonsByCourse
// );

// // ✅ Delete a course by ID
// router.delete(
//   "/:id",
//   authMiddleware,
//   roleMiddleware("teacher", "admin"),
//   courseController.deleteCourse
// );

// // ✅ Rename course attachment
// router.patch(
//   "/:courseId/attachments/:index/rename",
//   authMiddleware,
//   checkTeacherOrAdmin,
//   courseController.renameAttachment
// );

// // ✅ Delete course attachment
// router.patch(
//   "/:courseId/attachments/:index/delete",
//   authMiddleware,
//   checkTeacherOrAdmin,
//   courseController.deleteAttachment
// );

// // ✅ Admin: Get all courses
// router.get(
//   "/all",
//   authMiddleware,
//   roleMiddleware("admin"),
//   courseController.getAllCourses
// );

// module.exports = router;





// routes/courseRoutes.js
const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const authMiddleware = require("../middleware/authMiddleware");
const { authorize: roleMiddleware } = require("../middleware/roleMiddleware"); // ✅ Fixed import
const checkTeacherOrAdmin = require("../middleware/checkTeacherOrAdmin");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "Uploads");
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

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

const uploadFields = upload.fields([
  { name: "attachments", maxCount: 10 },
  { name: "thumbnail", maxCount: 1 },
  { name: "introVideo", maxCount: 1 },
]);

// ✅ Create a new course
router.post(
  "/create",
  authMiddleware,
  roleMiddleware("teacher", "admin"),
  uploadFields,
  courseController.createCourse
);

// ✅ Fetch courses for logged-in user (teacher/admin)
router.get("/", authMiddleware, courseController.getTeacherCourses);

// ✅ Public route to fetch a course by slug (no auth required)
router.get("/public/slug/:slug", courseController.getCourseBySlug);

// ✅ Get a course by its numeric ID (used by Payment.jsx)
router.get("/:id", courseController.getCourseById);

// ✅ Fetch full course by slug (requires enrollment)
router.get(
  "/enrolled/slug/:slug",
  authMiddleware,
  courseController.getEnrolledCourseBySlug
);

// ✅ Get lessons by course ID
router.get(
  "/:courseId/lessons",
  authMiddleware,
  courseController.getLessonsByCourse
);

// ✅ Delete a course by ID
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("teacher", "admin"),
  courseController.deleteCourse
);

// ✅ Rename course attachment
router.patch(
  "/:courseId/attachments/:index/rename",
  authMiddleware,
  checkTeacherOrAdmin,
  courseController.renameAttachment
);

// ✅ Delete course attachment
router.patch(
  "/:courseId/attachments/:index/delete",
  authMiddleware,
  checkTeacherOrAdmin,
  courseController.deleteAttachment
);

// ✅ Admin: Get all courses
router.get(
  "/all",
  authMiddleware,
  roleMiddleware("admin"),
  courseController.getAllCourses
);

module.exports = router;
