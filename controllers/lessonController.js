// controllers/lessonController.js
import db from "../models/index.js";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import uploadMiddleware from "../middleware/uploadMiddleware.js"; // UPDATED import

const { Lesson, Course, Unit, LessonView, Enrollment, sequelize } = db;

// Configure Cloudinary (redundant but safe)
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET || "",
    secure: true,
  });
}

/* -------------------------
   Helper: backend URL
------------------------- */
const getBackendUrl = () => {
  if (process.env.BACKEND_URL)
    return process.env.BACKEND_URL.replace(/\/+$/g, "");
  if (process.env.RENDER_EXTERNAL_URL)
    return process.env.RENDER_EXTERNAL_URL.replace(/\/+$/g, "");
  if (process.env.NODE_ENV === "production")
    return "https://mathe-class-website-backend-1.onrender.com";
  const p = process.env.PORT || 5000;
  return `http://localhost:${p}`;
};

/* -------------------------
   Helper: normalize and build file/video URLs
------------------------- */
export const buildFileUrls = (lesson) => {
  if (!lesson) return null;
  const raw =
    typeof lesson.toJSON === "function" ? lesson.toJSON() : { ...lesson };

  const resolveUrl = (url, preferRawForPdf = true) => {
    if (!url || url.trim() === "") return null;
    if (
      typeof url === "string" &&
      (url.startsWith("http://") || url.startsWith("https://"))
    ) {
      // Fix Cloudinary PDF URLs to use raw/upload
      if (
        url.includes("cloudinary.com") &&
        url.includes("/image/upload/") &&
        url.toLowerCase().endsWith(".pdf")
      ) {
        return url.replace("/image/upload/", "/raw/upload/");
      }
      return url;
    }
    if (
      typeof url === "string" &&
      !url.includes("/") &&
      !url.includes("\\") &&
      url.includes("_")
    ) {
      try {
        const cloudinaryUrl = cloudinary.url(url, {
          resource_type: "raw",
          secure: true,
        });
        return cloudinaryUrl;
      } catch (e) {}
    }
    if (
      typeof url === "string" &&
      (url.startsWith("/Uploads/") || url.startsWith("Uploads/"))
    ) {
      const filename = url.replace(/^\/?Uploads\//, "");
      const backend = getBackendUrl();
      return `${backend}/api/v1/files/${encodeURIComponent(filename)}`;
    }
    if (typeof url === "string" && !url.includes("/") && !url.includes("\\")) {
      const backend = getBackendUrl();
      return `${backend}/api/v1/files/${encodeURIComponent(url)}`;
    }
    return null;
  };

  const result = {
    id: raw.id ?? null,
    title: raw.title ?? "",
    contentType: raw.content_type ?? raw.type ?? "text",
    textContent: raw.content ?? raw.text_content ?? "",
    videoUrl: resolveUrl(raw.video_url ?? raw.videoUrl ?? null, false),
    fileUrl: resolveUrl(raw.file_url ?? raw.fileUrl ?? null, true),
    isPreview: Boolean(raw.is_preview ?? raw.isPreview ?? false),
    unitId: raw.unit_id ?? raw.unitId ?? null,
    courseId: raw.course_id ?? raw.courseId ?? null,
    orderIndex: Number.isFinite(raw.order_index ?? raw.orderIndex ?? null)
      ? raw.order_index ?? raw.orderIndex
      : null,
    createdAt: raw.created_at ?? raw.createdAt ?? raw.createdAt ?? null,
    updatedAt: raw.updated_at ?? raw.updatedAt ?? null,
  };

  if (raw.course) {
    result.course = {
      id: raw.course.id ?? raw.course_id ?? null,
      title: raw.course.title ?? "",
      slug: raw.course.slug ?? null,
      teacherId: raw.course.teacher_id ?? raw.course.teacherId ?? null,
    };
  }

  if (raw.unit) {
    result.unit = {
      id: raw.unit.id ?? raw.unit_id ?? null,
      title: raw.unit.title ?? "",
      orderIndex: raw.unit.order_index ?? raw.unit.orderIndex ?? null,
    };
  }

  return result;
};

/* -------------------------
   FIX: Manually set lesson file URL
------------------------- */
export const fixLessonFileUrl = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { fileUrl, contentType = "pdf" } = req.body;

    if (!lessonId || !fileUrl) {
      return res
        .status(400)
        .json({ success: false, error: "Lesson ID and file URL are required" });
    }

    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson)
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });

    if (req.user && req.user.role === "teacher") {
      const course = await Course.findByPk(lesson.course_id);
      if (!course || course.teacher_id !== req.user.id) {
        return res
          .status(403)
          .json({
            success: false,
            error: "You can only edit your own lessons",
          });
      }
    }

    lesson.file_url = fileUrl;
    lesson.content_type = contentType;
    await lesson.save();

    const updated = buildFileUrls(lesson);

    return res.json({
      success: true,
      message: "Lesson file URL updated",
      lesson: updated,
    });
  } catch (err) {
    console.error("fixLessonFileUrl error:", err?.message || err);
    return res
      .status(500)
      .json({
        success: false,
        error: "Failed to fix lesson",
        details:
          process.env.NODE_ENV === "development" ? err?.message : undefined,
      });
  }
};

/* -------------------------
   DEBUG: Get lesson with detailed file info
------------------------- */
export const debugLessonFile = async (req, res) => {
  try {
    const { lessonId } = req.params;
    if (!lessonId || isNaN(parseInt(lessonId, 10))) {
      return res
        .status(400)
        .json({ success: false, error: "Valid lesson ID is required" });
    }

    const id = parseInt(lessonId, 10);

    const lesson = await Lesson.findByPk(id, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "teacher_id"],
        },
      ],
      attributes: [
        "id",
        "title",
        "file_url",
        "video_url",
        "content_type",
        "is_preview",
        "created_at",
        "updated_at",
      ],
    });

    if (!lesson)
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });

    // If file_url looks like a local Uploads path, show file details
    let fileExists = false;
    let filePath = null;
    if (lesson.file_url && lesson.file_url.trim() !== "") {
      const uploadsDir = path.join(process.cwd(), "Uploads");
      let filename = lesson.file_url;
      if (filename.includes("/")) filename = path.basename(filename);
      filePath = path.join(uploadsDir, filename);
      try {
        fileExists = fs.existsSync(filePath);
      } catch (err) {
        console.log("File existence check error:", err.message);
      }
    }

    let fileInfo = null;
    if (fileExists && filePath) {
      try {
        const stats = fs.statSync(filePath);
        fileInfo = {
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          path: filePath,
        };
      } catch (err) {
        console.log("File stat error:", err.message);
      }
    }

    const builtUrl = buildFileUrls(lesson);

    return res.json({
      success: true,
      lesson: {
        id: lesson.id,
        title: lesson.title,
        database_file_url: lesson.file_url,
        database_video_url: lesson.video_url,
        content_type: lesson.content_type,
        built_file_url: builtUrl?.fileUrl,
        built_video_url: builtUrl?.videoUrl,
        course: lesson.course,
        created_at: lesson.created_at,
        updated_at: lesson.updated_at,
      },
      file: { exists: fileExists, path: filePath, info: fileInfo },
      environment: {
        node_env: process.env.NODE_ENV,
        backend_url: process.env.BACKEND_URL,
        cloudinary_configured: !!process.env.CLOUDINARY_CLOUD_NAME,
        use_cloudinary: process.env.USE_CLOUDINARY === "true",
        uploads_dir: path.join(process.cwd(), "Uploads"),
      },
      message: "Debug information for lesson file",
    });
  } catch (err) {
    console.error("debugLessonFile error:", err?.message || err);
    return res
      .status(500)
      .json({
        success: false,
        error: "Debug failed",
        details:
          process.env.NODE_ENV === "development" ? err?.message : undefined,
      });
  }
};

/* -------------------------
   Track Lesson View
------------------------- */
const trackLessonView = async (userId, lessonId) => {
  try {
    if (!userId || !lessonId) return;
    await LessonView.findOrCreate({
      where: { user_id: userId, lesson_id: lessonId },
      defaults: { viewed_at: new Date() },
    });
  } catch (err) {
    console.warn("trackLessonView error:", err?.message || err);
  }
};

/* -------------------------
   UPDATE LESSON
------------------------- */
export const updateLesson = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const lessonId = req.params.lessonId ?? req.params.id;
    if (!lessonId || isNaN(parseInt(lessonId, 10))) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, error: "Valid lesson ID is required" });
    }

    const id = parseInt(lessonId, 10);
    const existing = await Lesson.findByPk(id, { transaction: t });
    if (!existing) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });
    }

    // Auth: teacher must own course
    if (req.user && req.user.role === "teacher") {
      const course = await Course.findByPk(existing.course_id, {
        transaction: t,
      });
      if (!course || course.teacher_id !== req.user.id) {
        await t.rollback();
        return res
          .status(403)
          .json({
            success: false,
            error: "You may only edit lessons in your own courses",
          });
      }
    }

    // Parse body
    const body = req.body ?? {};

    // Process uploaded files (if any) using middleware helper
    const uploads =
      typeof uploadMiddleware.processUploadedFiles === "function"
        ? await uploadMiddleware.processUploadedFiles(req)
        : req.processedUploads || {};

    const updates = {};
    if (body.title !== undefined && body.title !== null)
      updates.title = body.title.toString().trim();
    if (body.textContent !== undefined) updates.content = body.textContent;
    if (body.contentType !== undefined) updates.content_type = body.contentType;
    if (body.videoUrl !== undefined) updates.video_url = body.videoUrl;
    if (body.fileUrl !== undefined) updates.file_url = body.fileUrl;
    if (body.unitId !== undefined) updates.unit_id = body.unitId;
    if (body.orderIndex !== undefined)
      updates.order_index = parseInt(body.orderIndex, 10);
    if (body.isPreview !== undefined)
      updates.is_preview = Boolean(body.isPreview);

    // Apply uploads => set file_url / video_url accordingly
    if (uploads.videoUrl) {
      updates.video_url = uploads.videoUrl;
      updates.file_url = null;
      updates.content_type = "video";
    }
    if (uploads.fileUrl) {
      updates.file_url = uploads.fileUrl;
      updates.video_url = null;
      if (
        uploads.fileUrl.toLowerCase().endsWith(".pdf") ||
        (uploads.fileUrl.includes("cloudinary.com") &&
          uploads.fileUrl.toLowerCase().includes(".pdf"))
      ) {
        updates.content_type = "pdf";
      } else if (
        uploads.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ||
        (uploads.fileUrl.includes("cloudinary.com") &&
          uploads.fileUrl.includes("/image/"))
      ) {
        updates.content_type = "image";
      } else {
        updates.content_type = "file";
      }
    }

    if (Object.keys(updates).length > 0) {
      await existing.update(updates, { transaction: t });
    }

    const updated = await Lesson.findByPk(id, {
      include: [
        { model: Course, as: "course", attributes: ["id", "title"] },
        { model: Unit, as: "unit", attributes: ["id", "title"] },
      ],
      transaction: t,
    });

    await t.commit();
    return res.json({
      success: true,
      lesson: buildFileUrls(updated),
      message: "Lesson updated successfully",
    });
  } catch (err) {
    await t.rollback();
    console.error("updateLesson error:", err?.message || err);
    return res
      .status(500)
      .json({
        success: false,
        error: "Failed to update lesson",
        details:
          process.env.NODE_ENV === "development" ? err?.message : undefined,
      });
  }
};

/* -------------------------
   CREATE LESSON
------------------------- */
export const createLesson = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const courseId = req.params.courseId ?? req.body.courseId;
    if (!courseId || isNaN(parseInt(courseId, 10))) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, error: "Valid course ID is required" });
    }

    const cId = parseInt(courseId, 10);
    const course = await Course.findByPk(cId, { transaction: t });
    if (!course) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });
    }

    const body = req.body ?? {};
    const uploads =
      typeof uploadMiddleware.processUploadedFiles === "function"
        ? await uploadMiddleware.processUploadedFiles(req)
        : req.processedUploads || {};

    // Determine content type
    let contentType = (
      body.contentType ??
      body.content_type ??
      "text"
    ).toString();
    if (uploads.fileUrl) contentType = "pdf";
    if (uploads.videoUrl) contentType = "video";

    // Determine orderIndex
    let orderIndex = body.orderIndex ?? body.order_index;
    if (
      orderIndex === undefined ||
      orderIndex === null ||
      isNaN(parseInt(orderIndex, 10))
    ) {
      const where = body.unitId ? { unit_id: body.unitId } : { course_id: cId };
      const last = await Lesson.findOne({
        where,
        order: [["order_index", "DESC"]],
        transaction: t,
      });
      orderIndex = last ? (last.order_index ?? 0) + 1 : 1;
    }

    const created = await Lesson.create(
      {
        title: (body.title ?? "Untitled Lesson").toString().trim(),
        content: body.textContent ?? body.content ?? "",
        course_id: cId,
        unit_id: body.unitId ?? null,
        order_index: parseInt(orderIndex, 10),
        content_type: contentType,
        video_url: uploads.videoUrl ?? body.videoUrl ?? null,
        file_url: uploads.fileUrl ?? body.fileUrl ?? null,
        is_preview: Boolean(body.isPreview ?? body.is_preview ?? false),
      },
      { transaction: t }
    );

    const full = await Lesson.findByPk(created.id, {
      include: [
        { model: Course, as: "course", attributes: ["id", "title"] },
        { model: Unit, as: "unit", attributes: ["id", "title"] },
      ],
      transaction: t,
    });

    await t.commit();
    return res
      .status(201)
      .json({
        success: true,
        lesson: buildFileUrls(full),
        message: "Lesson created",
      });
  } catch (err) {
    await t.rollback();
    console.error("createLesson error:", err?.message || err);
    return res
      .status(500)
      .json({
        success: false,
        error: "Failed to create lesson",
        details:
          process.env.NODE_ENV === "development" ? err?.message : undefined,
      });
  }
};

/* -------------------------
   GET LESSON BY ID
------------------------- */
export const getLessonById = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const lessonId = req.params.lessonId ?? req.params.id;
    if (!lessonId || isNaN(parseInt(lessonId, 10))) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, error: "Valid lesson ID is required" });
    }

    const id = parseInt(lessonId, 10);
    const lesson = await Lesson.findByPk(id, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "slug", "teacher_id"],
        },
        { model: Unit, as: "unit", attributes: ["id", "title", "order_index"] },
      ],
      transaction: t,
    });

    if (!lesson) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });
    }

    // Access checks
    let hasAccess = false;
    let accessReason = "unknown";
    const user = req.user ?? null;

    if (user) {
      if (user.role === "admin") {
        hasAccess = true;
        accessReason = "admin";
      } else if (
        user.role === "teacher" &&
        lesson.course?.teacher_id === user.id
      ) {
        hasAccess = true;
        accessReason = "teacher_owner";
      } else if (user.role === "student") {
        if (lesson.is_preview) {
          hasAccess = true;
          accessReason = "preview";
        } else {
          const enrollment = await Enrollment.findOne({
            where: {
              user_id: user.id,
              course_id: lesson.course_id,
              approval_status: "approved",
            },
            transaction: t,
          });
          if (enrollment) {
            hasAccess = true;
            accessReason = "enrolled";
          } else {
            hasAccess = false;
            accessReason = "not_enrolled";
          }
        }
      } else {
        hasAccess = Boolean(lesson.is_preview);
        accessReason = lesson.is_preview ? "preview" : "forbidden_role";
      }
    } else {
      hasAccess = Boolean(lesson.is_preview);
      accessReason = lesson.is_preview ? "public_preview" : "requires_login";
    }

    if (!hasAccess) {
      await t.rollback();
      return res
        .status(accessReason === "requires_login" ? 401 : 403)
        .json({
          success: false,
          error:
            accessReason === "requires_login"
              ? "Please log in to access this lesson"
              : "You do not have permission to access this lesson",
          reason: accessReason,
          canPreview: Boolean(lesson.is_preview),
        });
    }

    if (user?.id) {
      try {
        await trackLessonView(user.id, lesson.id);
      } catch (e) {
        console.warn("trackLessonView failed:", e?.message || e);
      }
    }

    const payload = buildFileUrls(lesson);
    await t.commit();
    return res.json({
      success: true,
      lesson: payload,
      access: { reason: accessReason },
    });
  } catch (err) {
    await t.rollback();
    console.error("getLessonById error:", err?.message || err);
    return res
      .status(500)
      .json({
        success: false,
        error: "Failed to load lesson",
        details:
          process.env.NODE_ENV === "development" ? err?.message : undefined,
      });
  }
};

/* -------------------------
   GET PREVIEW LESSON FOR COURSE
------------------------- */
export const getPreviewLessonForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!courseId || isNaN(parseInt(courseId, 10)))
      return res
        .status(400)
        .json({ success: false, error: "Valid course ID is required" });
    const cId = parseInt(courseId, 10);
    const course = await Course.findByPk(cId, {
      attributes: ["id", "title", "slug", "teacher_id"],
    });
    if (!course)
      return res
        .status(404)
        .json({ success: false, error: "Course not found" });

    let lesson = await Lesson.findOne({
      where: { course_id: cId, is_preview: true },
      order: [["order_index", "ASC"]],
      include: [
        { model: Course, as: "course", attributes: ["id", "title", "slug"] },
      ],
    });
    if (!lesson)
      lesson = await Lesson.findOne({
        where: { course_id: cId },
        order: [["order_index", "ASC"]],
        include: [
          { model: Course, as: "course", attributes: ["id", "title", "slug"] },
        ],
      });
    if (!lesson)
      return res
        .status(404)
        .json({ success: false, error: "No lessons found for this course" });
    const payload = buildFileUrls(lesson);
    return res.json({
      success: true,
      lesson: payload,
      course: { id: course.id, title: course.title, slug: course.slug },
    });
  } catch (err) {
    console.error("getPreviewLessonForCourse error:", err?.message || err);
    return res
      .status(500)
      .json({
        success: false,
        error: "Failed to load preview lesson",
        details:
          process.env.NODE_ENV === "development" ? err?.message : undefined,
      });
  }
};

/* -------------------------
   GET PUBLIC PREVIEW BY LESSON ID
------------------------- */
export const getPublicPreviewByLessonId = async (req, res) => {
  try {
    const lessonId = req.params.lessonId ?? req.params.id;
    if (!lessonId || isNaN(parseInt(lessonId, 10)))
      return res
        .status(400)
        .json({ success: false, error: "Valid lesson ID is required" });
    const id = parseInt(lessonId, 10);
    const lesson = await Lesson.findByPk(id, {
      include: [
        { model: Course, as: "course", attributes: ["id", "title", "slug"] },
      ],
    });
    if (!lesson)
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });
    if (!lesson.is_preview && !req.user)
      return res
        .status(403)
        .json({
          success: false,
          error:
            "This lesson is not available for public preview. Please enroll or log in.",
        });
    const payload = buildFileUrls(lesson);
    return res.json({
      success: true,
      lesson: payload,
      access: lesson.is_preview ? "public" : "restricted",
    });
  } catch (err) {
    console.error("getPublicPreviewByLessonId error:", err?.message || err);
    return res
      .status(500)
      .json({
        success: false,
        error: "Failed to load preview",
        details:
          process.env.NODE_ENV === "development" ? err?.message : undefined,
      });
  }
};

/* -------------------------
   GET LESSONS BY COURSE
------------------------- */
export const getLessonsByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId ?? req.params.id;
    if (!courseId || isNaN(parseInt(courseId, 10)))
      return res
        .status(400)
        .json({ success: false, error: "Valid course ID is required" });
    const cId = parseInt(courseId, 10);
    const lessons = await Lesson.findAll({
      where: { course_id: cId },
      include: [
        { model: Unit, as: "unit", attributes: ["id", "title", "order_index"] },
      ],
      order: [["order_index", "ASC"]],
    });
    return res.json({
      success: true,
      lessons: lessons.map(buildFileUrls),
      count: lessons.length,
    });
  } catch (err) {
    console.error("getLessonsByCourse error:", err?.message || err);
    return res
      .status(500)
      .json({
        success: false,
        error: "Failed to fetch lessons",
        details:
          process.env.NODE_ENV === "development" ? err?.message : undefined,
      });
  }
};

/* -------------------------
   GET LESSONS BY UNIT
------------------------- */
export const getLessonsByUnit = async (req, res) => {
  try {
    const unitId = req.params.unitId ?? req.params.id;
    if (!unitId || isNaN(parseInt(unitId, 10)))
      return res
        .status(400)
        .json({ success: false, error: "Valid unit ID is required" });
    const uId = parseInt(unitId, 10);
    const lessons = await Lesson.findAll({
      where: { unit_id: uId },
      order: [["order_index", "ASC"]],
    });
    return res.json({
      success: true,
      lessons: lessons.map(buildFileUrls),
      count: lessons.length,
    });
  } catch (err) {
    console.error("getLessonsByUnit error:", err?.message || err);
    return res
      .status(500)
      .json({
        success: false,
        error: "Failed to fetch unit lessons",
        details:
          process.env.NODE_ENV === "development" ? err?.message : undefined,
      });
  }
};

/* -------------------------
   DELETE LESSON
------------------------- */
export const deleteLesson = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const lessonId = req.params.lessonId ?? req.params.id;
    if (!lessonId || isNaN(parseInt(lessonId, 10))) {
      await t.rollback();
      return res
        .status(400)
        .json({ success: false, error: "Valid lesson ID is required" });
    }
    const id = parseInt(lessonId, 10);
    const lesson = await Lesson.findByPk(id, { transaction: t });
    if (!lesson) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });
    }

    if (req.user && req.user.role === "teacher") {
      const course = await Course.findByPk(lesson.course_id, {
        transaction: t,
      });
      if (!course || course.teacher_id !== req.user.id) {
        await t.rollback();
        return res
          .status(403)
          .json({
            success: false,
            error: "You can only delete lessons from your courses",
          });
      }
    }

    // Optionally: delete Cloudinary files (not implemented automatically)
    await lesson.destroy({ transaction: t });
    await t.commit();
    return res.json({
      success: true,
      message: "Lesson deleted",
      deletedId: id,
    });
  } catch (err) {
    await t.rollback();
    console.error("deleteLesson error:", err?.message || err);
    return res
      .status(500)
      .json({
        success: false,
        error: "Failed to delete lesson",
        details:
          process.env.NODE_ENV === "development" ? err?.message : undefined,
      });
  }
};

/* -------------------------
   Default export
------------------------- */
export default {
  buildFileUrls,
  debugLessonFile,
  fixLessonFileUrl,
  getLessonById,
  getPreviewLessonForCourse,
  getPublicPreviewByLessonId,
  createLesson,
  updateLesson,
  getLessonsByCourse,
  getLessonsByUnit,
  deleteLesson,
};














// // controllers/courseController.js
// import db from "../models/index.js";
// import path from "path";
// import { fileURLToPath } from "url";
// import fs from "fs";

// const { Course, Lesson, User, Unit, Enrollment } = db;

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Import Cloudinary functions
// import { uploadToCloudinary } from "../middleware/cloudinaryUpload.js";

// // Helper function to build full URLs for course files
// const buildCourseFileUrls = (course) => {
//   const courseData = course.toJSON ? course.toJSON() : { ...course };

//   // Get backend URL
//   const getBackendUrl = () => {
//     if (process.env.BACKEND_URL) return process.env.BACKEND_URL.replace(/\/+$/g, "");
//     if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL.replace(/\/+$/g, "");
//     if (process.env.NODE_ENV === "production") return "https://mathe-class-website-backend-1.onrender.com";
//     const p = process.env.PORT || 5000;
//     return `http://localhost:${p}`;
//   };

//   const backend = getBackendUrl();

//   // Helper to resolve URLs
//   const resolveUrl = (url) => {
//     if (!url) return null;
    
//     // Already an absolute URL -> return as-is
//     if (typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://"))) {
//       return url;
//     }

//     // If Uploads path
//     if (typeof url === "string" && (url.startsWith("/Uploads/") || url.startsWith("Uploads/"))) {
//       const filename = url.replace(/^\/?Uploads\//, "");
//       return `${backend}/api/v1/files/${encodeURIComponent(filename)}`;
//     }

//     // If it's just a filename without path
//     if (typeof url === "string" && !url.includes("/") && !url.includes("\\")) {
//       return `${backend}/api/v1/files/${encodeURIComponent(url)}`;
//     }

//     // If it's a local file path
//     if (typeof url === "string" && (url.includes("/") || url.includes("\\"))) {
//       const filename = path.basename(url);
//       return `${backend}/api/v1/files/${encodeURIComponent(filename)}`;
//     }

//     return url;
//   };

//   // Resolve thumbnail URL
//   if (courseData.thumbnail) {
//     courseData.thumbnail = resolveUrl(courseData.thumbnail);
//   }

//   return courseData;
// };

// /* ============================================================
//    Create a new course (with file upload support)
// ============================================================ */
// export const createCourse = async (req, res) => {
//   try {
//     console.log("📝 Course creation request");
//     console.log("👤 User:", req.user?.id, req.user?.role);

//     const { title, slug, description, price, teacher_id } = req.body;
//     const teacherId = req.user?.id || teacher_id;

//     // Validate required fields
//     if (!title || !slug) {
//       return res.status(400).json({
//         success: false,
//         error: "Title and slug are required",
//         received: { title, slug, description, price, teacherId },
//       });
//     }

//     let thumbnailUrl = null;

//     // Process thumbnail if uploaded
//     if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
//       const thumbnail = req.files.thumbnail[0];
      
//       try {
//         // Upload to Cloudinary
//         const result = await uploadToCloudinary(
//           thumbnail.buffer,
//           'mathe-class/course-thumbnails',
//           'image'
//         );
        
//         thumbnailUrl = result.secure_url;
//         console.log("✅ Thumbnail uploaded to Cloudinary:", thumbnailUrl.substring(0, 80) + "...");
        
//       } catch (cloudinaryError) {
//         console.error("❌ Cloudinary upload failed:", cloudinaryError.message);
        
//         // Fallback: Save locally (for development or backup)
//         const uploadsDir = path.join(__dirname, "../Uploads");
//         if (!fs.existsSync(uploadsDir)) {
//           fs.mkdirSync(uploadsDir, { recursive: true });
//         }
        
//         const thumbnailFilename = `thumbnail-${Date.now()}-${thumbnail.originalname.replace(/\s+/g, "-")}`;
//         const thumbnailFullPath = path.join(uploadsDir, thumbnailFilename);
//         fs.writeFileSync(thumbnailFullPath, thumbnail.buffer);
//         thumbnailUrl = `/Uploads/${thumbnailFilename}`;
//         console.log("✅ Thumbnail saved locally (fallback):", thumbnailUrl);
//       }
//     }

//     // Check if course with same slug already exists
//     const existingCourse = await Course.findOne({ where: { slug } });
//     if (existingCourse) {
//       return res.status(400).json({
//         success: false,
//         error: "A course with this slug already exists",
//       });
//     }

//     // Create the course
//     const courseData = {
//       title: title.trim(),
//       slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
//       description: (description || "").trim(),
//       teacher_id: teacherId,
//       price: price ? parseFloat(price) : 0,
//       thumbnail: thumbnailUrl,
//     };

//     console.log("📊 Creating course with data:", {
//       ...courseData,
//       thumbnail: thumbnailUrl ? "URL exists" : "No thumbnail"
//     });

//     const course = await Course.create(courseData);
//     console.log("✅ Course created successfully:", course.id);

//     // Build response with full URLs
//     const courseResponse = buildCourseFileUrls(course);

//     res.status(201).json({
//       success: true,
//       message: "Course created successfully",
//       course: {
//         id: courseResponse.id,
//         title: courseResponse.title,
//         slug: courseResponse.slug,
//         description: courseResponse.description,
//         price: courseResponse.price,
//         thumbnail: courseResponse.thumbnail,
//         teacher_id: courseResponse.teacher_id,
//         created_at: courseResponse.created_at,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error creating course:", error);

//     // Handle specific errors
//     if (error.name === "SequelizeUniqueConstraintError") {
//       return res.status(400).json({
//         success: false,
//         error: "A course with this slug already exists",
//       });
//     }

//     if (error.name === "SequelizeValidationError") {
//       const errors = error.errors.map((err) => err.message);
//       return res.status(400).json({
//         success: false,
//         error: "Validation failed",
//         details: errors,
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: "Failed to create course",
//       details: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// /* ============================================================
//    Create a new course with units and lessons
// ============================================================ */
// export const createCourseWithUnits = async (req, res) => {
//   try {
//     console.log("🎯 Advanced course creation requested");
//     console.log("👤 User:", req.user?.id, req.user?.role);

//     const {
//       title,
//       slug,
//       description,
//       price,
//       teacher_id,
//       units = [],
//     } = req.body;

//     const teacherId = req.user?.id || teacher_id;

//     // Validate required fields
//     if (!title || !slug) {
//       return res.status(400).json({
//         success: false,
//         error: "Title and slug are required",
//       });
//     }

//     let thumbnailUrl = null;

//     // Process thumbnail if uploaded
//     if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
//       const thumbnail = req.files.thumbnail[0];
      
//       try {
//         // Upload to Cloudinary
//         const result = await uploadToCloudinary(
//           thumbnail.buffer,
//           'mathe-class/course-thumbnails',
//           'image'
//         );
        
//         thumbnailUrl = result.secure_url;
//         console.log("✅ Thumbnail uploaded to Cloudinary:", thumbnailUrl.substring(0, 80) + "...");
        
//       } catch (cloudinaryError) {
//         console.error("❌ Cloudinary upload failed:", cloudinaryError.message);
        
//         // Fallback: Save locally
//         const uploadsDir = path.join(__dirname, "../Uploads");
//         if (!fs.existsSync(uploadsDir)) {
//           fs.mkdirSync(uploadsDir, { recursive: true });
//         }
        
//         const thumbnailFilename = `thumbnail-${Date.now()}-${thumbnail.originalname.replace(/\s+/g, "-")}`;
//         const thumbnailFullPath = path.join(uploadsDir, thumbnailFilename);
//         fs.writeFileSync(thumbnailFullPath, thumbnail.buffer);
//         thumbnailUrl = `/Uploads/${thumbnailFilename}`;
//         console.log("✅ Thumbnail saved locally (fallback):", thumbnailUrl);
//       }
//     }

//     // Check if course with same slug already exists
//     const existingCourse = await Course.findOne({ where: { slug } });
//     if (existingCourse) {
//       return res.status(400).json({
//         success: false,
//         error: "A course with this slug already exists",
//       });
//     }

//     // Create the course
//     const courseData = {
//       title: title.trim(),
//       slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
//       description: (description || "").trim(),
//       teacher_id: teacherId,
//       price: price ? parseFloat(price) : 0,
//       thumbnail: thumbnailUrl,
//     };

//     console.log("📊 Creating course with data:", {
//       ...courseData,
//       thumbnail: thumbnailUrl ? "URL exists" : "No thumbnail"
//     });

//     const course = await Course.create(courseData);
//     console.log("✅ Course created successfully:", course.id);

//     // Create units and lessons if provided
//     let createdUnits = [];
//     let createdLessons = [];

//     if (units && Array.isArray(units) && units.length > 0) {
//       console.log(`📚 Creating ${units.length} units with lessons...`);

//       for (const unit of units) {
//         if (unit.title && unit.lessons && Array.isArray(unit.lessons)) {
//           // Create unit header
//           const unitLesson = await Lesson.create({
//             course_id: course.id,
//             title: unit.title,
//             content: unit.description || "",
//             order_index: unit.order_index || 0,
//             content_type: "unit_header",
//             is_preview: false,
//           });
//           createdUnits.push(unitLesson);

//           // Create lessons for this unit
//           for (const lessonData of unit.lessons) {
//             if (lessonData.title) {
//               const lesson = await Lesson.create({
//                 course_id: course.id,
//                 title: lessonData.title,
//                 content: lessonData.content || "",
//                 video_url: lessonData.video_url || null,
//                 order_index: lessonData.order_index || 0,
//                 content_type: lessonData.content_type || "text",
//                 is_preview: lessonData.is_preview || false,
//               });
//               createdLessons.push(lesson);
//             }
//           }
//         }
//       }

//       console.log(`✅ Created ${createdUnits.length} units and ${createdLessons.length} lessons`);
//     }

//     // Build response with full URLs
//     const courseResponse = buildCourseFileUrls(course);

//     res.status(201).json({
//       success: true,
//       message: "Course created successfully with structure",
//       course: {
//         id: courseResponse.id,
//         title: courseResponse.title,
//         slug: courseResponse.slug,
//         description: courseResponse.description,
//         price: courseResponse.price,
//         thumbnail: courseResponse.thumbnail,
//         teacher_id: courseResponse.teacher_id,
//         created_at: courseResponse.created_at,
//       },
//       structure: {
//         units: createdUnits.length,
//         lessons: createdLessons.length,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error creating advanced course:", error);

//     if (error.name === "SequelizeUniqueConstraintError") {
//       return res.status(400).json({
//         success: false,
//         error: "A course with this slug already exists",
//       });
//     }

//     if (error.name === "SequelizeValidationError") {
//       const errors = error.errors.map((err) => err.message);
//       return res.status(400).json({
//         success: false,
//         error: "Validation failed",
//         details: errors,
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: "Failed to create course",
//       details: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// /* ============================================================
//    Get course by ID
// ============================================================ */
// export const getCourseById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const course = await Course.findByPk(id, {
//       attributes: ["id", "title", "description", "price", "thumbnail"],
//       include: [
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email"],
//         },
//       ],
//     });

//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         message: "Course not found",
//       });
//     }

//     const courseData = buildCourseFileUrls(course);

//     res.json({
//       success: true,
//       course: {
//         id: courseData.id,
//         title: courseData.title,
//         description: courseData.description,
//         thumbnail: courseData.thumbnail,
//         teacher: courseData.teacher,
//         price: courseData.price !== undefined && courseData.price !== null
//           ? Number(courseData.price)
//           : 0,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error fetching course by ID:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch course",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// /* ============================================================
//    Get all courses
// ============================================================ */
// export const getCourses = async (req, res) => {
//   try {
//     const courses = await Course.findAll({
//       attributes: [
//         "id",
//         "title",
//         "slug",
//         "description",
//         "teacher_id",
//         "price",
//         "thumbnail",
//         "created_at",
//         "updated_at",
//       ],
//       include: [
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email"],
//         },
//       ],
//       order: [["id", "ASC"]],
//     });

//     const formattedCourses = courses.map((course) => {
//       const courseData = buildCourseFileUrls(course);
//       return {
//         ...courseData,
//         price: courseData.price !== undefined && courseData.price !== null
//           ? Number(courseData.price)
//           : 0,
//       };
//     });

//     res.json({
//       success: true,
//       courses: formattedCourses,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching courses:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch courses",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// /* ============================================================
//    Get public course by slug (with lessons)
// ============================================================ */
// export const getPublicCourseBySlug = async (req, res) => {
//   try {
//     const { slug } = req.params;
//     const course = await Course.findOne({
//       where: { slug },
//       attributes: ["id", "title", "slug", "description", "price", "thumbnail"],
//       include: [
//         {
//           model: Lesson,
//           as: "lessons",
//           attributes: [
//             "id",
//             "title",
//             "content",
//             "video_url",
//             "file_url",
//             "order_index",
//             "content_type",
//             "is_preview",
//           ],
//         },
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email"],
//         },
//       ],
//       order: [[{ model: Lesson, as: "lessons" }, "order_index", "ASC"]],
//     });

//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         message: "Course not found",
//       });
//     }

//     const courseData = buildCourseFileUrls(course);

//     // Build URLs for lessons
//     if (courseData.lessons && Array.isArray(courseData.lessons)) {
//       const backend = process.env.BACKEND_URL || "http://localhost:3000";
      
//       courseData.lessons = courseData.lessons.map((lesson) => {
//         const lessonData = { ...lesson };
        
//         if (lessonData.video_url && !lessonData.video_url.startsWith("http")) {
//           lessonData.video_url = `${backend}${lessonData.video_url}`;
//         }
//         if (lessonData.file_url && !lessonData.file_url.startsWith("http")) {
//           lessonData.file_url = `${backend}${lessonData.file_url}`;
//         }
        
//         return lessonData;
//       });
//     }

//     res.json({
//       success: true,
//       course: {
//         ...courseData,
//         price: courseData.price !== undefined && courseData.price !== null
//           ? Number(courseData.price)
//           : 0,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error fetching course by slug:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch course",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// /* ============================================================
//    Get lessons for a specific course
// ============================================================ */
// export const getLessonsByCourse = async (req, res) => {
//   try {
//     const { courseId } = req.params;
//     const lessons = await Lesson.findAll({
//       where: { course_id: courseId },
//       order: [["order_index", "ASC"]],
//     });

//     const backend = process.env.BACKEND_URL || "http://localhost:3000";
    
//     const lessonsWithUrls = lessons.map((lesson) => {
//       const lessonData = lesson.toJSON ? lesson.toJSON() : { ...lesson };

//       if (lessonData.video_url && !lessonData.video_url.startsWith("http")) {
//         lessonData.video_url = `${backend}${lessonData.video_url}`;
//       }

//       if (lessonData.file_url && !lessonData.file_url.startsWith("http")) {
//         lessonData.file_url = `${backend}${lessonData.file_url}`;
//       }

//       return lessonData;
//     });

//     res.json({
//       success: true,
//       lessons: lessonsWithUrls,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching lessons:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch lessons",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// /* ============================================================
//    Delete course
// ============================================================ */
// export const deleteCourse = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const userId = req.user.id;
//     const userRole = req.user.role;

//     console.log("🗑️ DELETE COURSE REQUEST:", {
//       courseId: id,
//       userId,
//       userRole,
//     });

//     const course = await Course.findByPk(id, {
//       include: [
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email"],
//         },
//       ],
//     });

//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         message: "Course not found",
//       });
//     }

//     // Check authorization
//     if (userRole !== "admin" && course.teacher_id !== userId) {
//       return res.status(403).json({
//         success: false,
//         message: "Not authorized to delete this course",
//         details: "You can only delete courses that you created",
//       });
//     }

//     // Check for existing enrollments
//     const enrollmentCount = await Enrollment.count({
//       where: { course_id: id },
//     });

//     if (enrollmentCount > 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Cannot delete course with existing enrollments",
//         details: `This course has ${enrollmentCount} student enrollment(s).`,
//       });
//     }

//     // Delete the course
//     await course.destroy();

//     console.log("✅ Course deleted successfully:", id);

//     res.json({
//       success: true,
//       message: "Course deleted successfully",
//       deletedCourse: {
//         id: course.id,
//         title: course.title,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error deleting course:", error);

//     if (error.name === "SequelizeForeignKeyConstraintError") {
//       return res.status(400).json({
//         success: false,
//         message: "Cannot delete course. There are existing enrollments or related data.",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Failed to delete course",
//       error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
//     });
//   }
// };

// /* ============================================================
//    Get teacher's courses
// ============================================================ */
// export const getTeacherCourses = async (req, res) => {
//   try {
//     const teacherId = req.user.id;
//     console.log("📚 Fetching courses for teacher:", teacherId);

//     const courses = await Course.findAll({
//       where: { teacher_id: teacherId },
//       attributes: [
//         "id",
//         "title",
//         "description",
//         "slug",
//         "price",
//         "thumbnail",
//         "created_at",
//       ],
//       include: [
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email"],
//         },
//         {
//           model: Unit,
//           as: "units",
//           attributes: ["id"],
//         },
//         {
//           model: Lesson,
//           as: "lessons",
//           attributes: ["id"],
//         },
//       ],
//       order: [["created_at", "DESC"]],
//     });

//     const coursesWithCounts = courses.map((course) => {
//       const courseData = buildCourseFileUrls(course);
//       return {
//         ...courseData,
//         unit_count: course.units?.length || 0,
//         lesson_count: course.lessons?.length || 0,
//       };
//     });

//     console.log(`✅ Found ${coursesWithCounts.length} courses for teacher ${teacherId}`);

//     res.json({
//       success: true,
//       courses: coursesWithCounts,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching teacher courses:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch courses",
//       details: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// /* ============================================================
//    Update course
// ============================================================ */
// export const updateCourse = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, description, price } = req.body;

//     console.log("📝 Course update request:", { id, title, description, price });

//     const course = await Course.findByPk(id);
//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         error: "Course not found",
//       });
//     }

//     // Check authorization
//     const userRole = req.user.role;
//     if (userRole !== "admin" && course.teacher_id !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         error: "Not authorized to update this course",
//       });
//     }

//     // Update fields
//     if (title !== undefined) course.title = title.trim();
//     if (description !== undefined) course.description = description.trim();
//     if (price !== undefined) course.price = parseFloat(price);

//     // Handle thumbnail update
//     if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
//       const thumbnail = req.files.thumbnail[0];
      
//       try {
//         // Upload to Cloudinary
//         const result = await uploadToCloudinary(
//           thumbnail.buffer,
//           'mathe-class/course-thumbnails',
//           'image'
//         );
        
//         course.thumbnail = result.secure_url;
//         console.log("✅ Thumbnail updated on Cloudinary");
        
//       } catch (cloudinaryError) {
//         console.error("❌ Cloudinary upload failed:", cloudinaryError.message);
        
//         // Fallback: Save locally
//         const uploadsDir = path.join(__dirname, "../Uploads");
//         if (!fs.existsSync(uploadsDir)) {
//           fs.mkdirSync(uploadsDir, { recursive: true });
//         }
        
//         const thumbnailFilename = `thumbnail-${Date.now()}-${thumbnail.originalname.replace(/\s+/g, "-")}`;
//         const thumbnailFullPath = path.join(uploadsDir, thumbnailFilename);
//         fs.writeFileSync(thumbnailFullPath, thumbnail.buffer);
//         course.thumbnail = `/Uploads/${thumbnailFilename}`;
//         console.log("✅ Thumbnail updated locally");
//       }
//     }

//     await course.save();

//     const updatedCourse = buildCourseFileUrls(course);

//     res.json({
//       success: true,
//       message: "Course updated successfully",
//       course: updatedCourse,
//     });
//   } catch (error) {
//     console.error("❌ Error updating course:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to update course",
//       details: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// /* ============================================================
//    Get course with full structure (units and lessons)
// ============================================================ */
// export const getCourseWithStructure = async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     const course = await Course.findByPk(id, {
//       attributes: ["id", "title", "description", "slug", "price", "thumbnail", "teacher_id"],
//       include: [
//         {
//           model: Unit,
//           as: "units",
//           attributes: ["id", "title", "description", "order_index"],
//           include: [
//             {
//               model: Lesson,
//               as: "lessons",
//               attributes: [
//                 "id",
//                 "title",
//                 "content",
//                 "video_url",
//                 "file_url",
//                 "order_index",
//                 "content_type",
//                 "is_preview",
//                 "created_at",
//               ],
//               order: [["order_index", "ASC"]],
//             }
//           ],
//           order: [["order_index", "ASC"]],
//         },
//         {
//           model: User,
//           as: "teacher",
//           attributes: ["id", "name", "email"],
//         }
//       ],
//     });

//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         error: "Course not found",
//       });
//     }

//     const courseData = buildCourseFileUrls(course);

//     // Build URLs for lessons in each unit
//     if (courseData.units && Array.isArray(courseData.units)) {
//       const backend = process.env.BACKEND_URL || "http://localhost:3000";
      
//       courseData.units = courseData.units.map((unit) => {
//         const unitData = { ...unit };
        
//         if (unitData.lessons && Array.isArray(unitData.lessons)) {
//           unitData.lessons = unitData.lessons.map((lesson) => {
//             const lessonData = { ...lesson };
            
//             if (lessonData.video_url && !lessonData.video_url.startsWith("http")) {
//               lessonData.video_url = `${backend}${lessonData.video_url}`;
//             }
//             if (lessonData.file_url && !lessonData.file_url.startsWith("http")) {
//               lessonData.file_url = `${backend}${lessonData.file_url}`;
//             }
            
//             return lessonData;
//           });
//         }
        
//         return unitData;
//       });
//     }

//     res.json({
//       success: true,
//       course: courseData,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching course with structure:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to fetch course structure",
//       details: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// /* ============================================================
//    Check if course exists by slug
// ============================================================ */
// export const checkCourseExists = async (req, res) => {
//   try {
//     const { slug } = req.params;
    
//     const course = await Course.findOne({
//       where: { slug },
//       attributes: ["id", "title", "slug"],
//     });

//     res.json({
//       success: true,
//       exists: !!course,
//       course: course || null,
//     });
//   } catch (error) {
//     console.error("❌ Error checking course existence:", error);
//     res.status(500).json({
//       success: false,
//       error: "Failed to check course",
//       details: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };

// export default {
//   createCourse,
//   createCourseWithUnits,
//   getCourseById,
//   getCourses,
//   getPublicCourseBySlug,
//   getLessonsByCourse,
//   deleteCourse,
//   getTeacherCourses,
//   updateCourse,
//   getCourseWithStructure,
//   checkCourseExists,
// };
