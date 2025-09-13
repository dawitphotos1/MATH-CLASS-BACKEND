const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const { authMiddleware } = require("../middleware/auth");
const { authorize: roleMiddleware } = require("../middleware/roleMiddleware");
const checkTeacherOrAdmin = require("../middleware/checkTeacherOrAdmin");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Multer setup for file uploads
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

// Routes
router.post(
  "/create",
  authMiddleware,
  roleMiddleware("teacher", "admin"),
  uploadFields,
  courseController.createCourse
);

router.get("/", authMiddleware, courseController.getTeacherCourses);

router.get("/slug/:slug", courseController.getCourseBySlug);

router.get(
  "/enrolled/slug/:slug",
  authMiddleware,
  courseController.getEnrolledCourseBySlug
);

router.get(
  "/:courseId/lessons",
  authMiddleware,
  courseController.getLessonsByCourse
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("teacher", "admin"),
  courseController.deleteCourse
);

router.patch(
  "/:courseId/attachments/:index/rename",
  authMiddleware,
  checkTeacherOrAdmin,
  courseController.renameAttachment
);

router.patch(
  "/:courseId/attachments/:index/delete",
  authMiddleware,
  checkTeacherOrAdmin,
  courseController.deleteAttachment
);

router.get(
  "/all",
  authMiddleware,
  roleMiddleware("admin"),
  courseController.getAllCourses
);

module.exports = router;
