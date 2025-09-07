const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { Lesson, Course, User, UserCourseAccess } = require("../models");

const auth = require("../middleware/auth");
const roleMiddleware = require("../middleware/roleMiddleware");
const authenticateToken = require("../middleware/authenticateToken");
const checkTeacherOrAdmin = require("../middleware/checkTeacherOrAdmin");

const courseController = require("../controllers/courseController");

const router = express.Router();

// === Multer Setup ===
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

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "video/mp4",
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type! Only JPG, PNG, GIF, and MP4 are allowed."),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// === ROUTES ===

// Create a new course
router.post(
  "/",
  auth,
  roleMiddleware(["teacher"]),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "introVideo", maxCount: 1 },
    { name: "attachments", maxCount: 10 },
  ]),
  courseController.createCourse
);

// Get all courses for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const filter =
      req.user.role === "teacher" ? { teacherId: req.user.id } : {};
    const courses = await Course.findAll({
      where: filter,
      include: [
        { model: User, as: "teacher", attributes: ["id", "name", "email"] },
      ],
    });

    if (!courses.length)
      return res.status(404).json({ error: "No courses found" });

    res.json({ courses });
  } catch (err) {
    console.error("🔥 Fetch course error:", err.message);
    res
      .status(500)
      .json({ error: "Failed to fetch courses", details: err.message });
  }
});

// Get public course by slug (no auth, no lessons)
router.get("/public/slug/:slug", courseController.getPublicCourseBySlug);

// Get full course (with lessons) by slug - requires access
router.get("/slug/:slug", auth, courseController.getCourseWithLessonsBySlug);

// Get lessons of a course
router.get("/:courseId/lessons", auth, courseController.getLessonsByCourse);

// Delete a course
router.delete(
  "/:id",
  auth,
  roleMiddleware(["teacher", "admin"]),
  courseController.deleteCourse
);

// Rename an attachment
router.patch(
  "/:courseId/attachments/:index/rename",
  authenticateToken,
  checkTeacherOrAdmin,
  courseController.renameCourseAttachment
);

// Delete an attachment
router.patch(
  "/:courseId/attachments/:index/delete",
  authenticateToken,
  checkTeacherOrAdmin,
  courseController.deleteCourseAttachment
);

module.exports = router;
