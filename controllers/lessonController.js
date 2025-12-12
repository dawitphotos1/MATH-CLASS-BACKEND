// controllers/lessonController.js
import db from "../models/index.js";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const { Lesson, Course, Unit, LessonView, Enrollment, sequelize } = db;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
  secure: true,
});

/* -------------------------
   Helper: backend URL
------------------------- */
const getBackendUrl = () => {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL.replace(/\/+$/g, "");
  if (process.env.RENDER_EXTERNAL_URL) return process.env.RENDER_EXTERNAL_URL.replace(/\/+$/g, "");
  if (process.env.NODE_ENV === "production") return "https://mathe-class-website-backend-1.onrender.com";
  const p = process.env.PORT || 5000;
  return `http://localhost:${p}`;
};

/* -------------------------
   Helper: normalize and build file/video URLs
------------------------- */
export const buildFileUrls = (lesson) => {
  if (!lesson) return null;
  const raw = typeof lesson.toJSON === "function" ? lesson.toJSON() : { ...lesson };
  
  console.log(`🔄 Building URLs for lesson ${raw.id}:`, {
    file_url: raw.file_url,
    content_type: raw.content_type,
    use_cloudinary: process.env.USE_CLOUDINARY
  });
  
  const resolveUrl = (url, preferRawForPdf = true) => {
    if (!url || url.trim() === "") {
      console.log(`❌ Empty URL for lesson ${raw.id}`);
      return null;
    }
    
    console.log(`🔄 Resolving URL: ${url}`);
    
    // Already an absolute URL -> return as-is
    if (typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://"))) {
      // Fix Cloudinary PDF URLs
      if (url.includes("cloudinary.com") && url.includes("/image/upload/") && url.toLowerCase().endsWith(".pdf")) {
        const correctedUrl = url.replace("/image/upload/", "/raw/upload/");
        console.log(`📄 Fixed Cloudinary PDF URL: ${correctedUrl.substring(0, 80)}...`);
        return correctedUrl;
      }
      return url;
    }
    
    // If it's a Cloudinary public_id (stored in DB as just ID)
    if (typeof url === "string" && !url.includes("/") && !url.includes("\\") && url.includes("_")) {
      try {
        // Try to build Cloudinary URL from public_id
        const cloudinaryUrl = cloudinary.url(url, {
          resource_type: 'raw', // Assume raw for PDFs
          secure: true
        });
        console.log(`☁️ Built Cloudinary URL from public_id: ${cloudinaryUrl.substring(0, 80)}...`);
        return cloudinaryUrl;
      } catch (e) {
        // Fallback to file server
        console.log(`❌ Couldn't build Cloudinary URL: ${e.message}`);
      }
    }
    
    // If Uploads path (starts with /Uploads/ or Uploads/)
    if (typeof url === "string" && (url.startsWith("/Uploads/") || url.startsWith("Uploads/"))) {
      const filename = url.replace(/^\/?Uploads\//, "");
      const backend = getBackendUrl();
      const fileUrl = `${backend}/api/v1/files/${encodeURIComponent(filename)}`;
      console.log(`📁 Converted Uploads path to URL: ${fileUrl}`);
      return fileUrl;
    }
    
    // If it's just a filename without path
    if (typeof url === "string" && !url.includes("/") && !url.includes("\\")) {
      const backend = getBackendUrl();
      const fileUrl = `${backend}/api/v1/files/${encodeURIComponent(url)}`;
      console.log(`📄 Converted filename to URL: ${fileUrl}`);
      return fileUrl;
    }
    
    console.log(`❓ Unknown URL format for lesson ${raw.id}: ${url}`);
    return null;
  };
  
  // Map / normalize fields
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
      ? (raw.order_index ?? raw.orderIndex)
      : null,
    createdAt: raw.created_at ?? raw.createdAt ?? raw.createdAt ?? null,
    updatedAt: raw.updated_at ?? raw.updatedAt ?? null,
  };
  
  // Include minimal course/unit objects if present
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
      return res.status(400).json({ 
        success: false, 
        error: "Lesson ID and file URL are required" 
      });
    }
    
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }
    
    // Authorization
    if (req.user && req.user.role === "teacher") {
      const course = await Course.findByPk(lesson.course_id);
      if (!course || course.teacher_id !== req.user.id) {
        return res.status(403).json({ 
          success: false, 
          error: "You can only edit your own lessons" 
        });
      }
    }
    
    console.log(`🔧 Fixing lesson ${lessonId}:`, {
      before: { file_url: lesson.file_url, content_type: lesson.content_type },
      after: { fileUrl, contentType }
    });
    
    lesson.file_url = fileUrl;
    lesson.content_type = contentType;
    await lesson.save();
    
    const updated = buildFileUrls(lesson);
    
    res.json({
      success: true,
      message: "Lesson file URL updated",
      lesson: updated,
      before: {
        file_url: lesson.file_url,
        content_type: lesson.content_type
      }
    });
    
  } catch (err) {
    console.error("fixLessonFileUrl error:", err?.message || err);
    return res.status(500).json({
      success: false,
      error: "Failed to fix lesson",
      details: process.env.NODE_ENV === "development" ? err?.message : undefined,
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
      return res.status(400).json({ success: false, error: "Valid lesson ID is required" });
    }
    
    const id = parseInt(lessonId, 10);
    
    // Get lesson with all details
    const lesson = await Lesson.findByPk(id, {
      include: [
        { model: Course, as: "course", attributes: ["id", "title", "teacher_id"] },
      ],
      attributes: ["id", "title", "file_url", "video_url", "content_type", "is_preview", "created_at", "updated_at"],
    });
    
    if (!lesson) {
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }
    
    // Check if file exists locally
    let fileExists = false;
    let filePath = null;
    if (lesson.file_url && lesson.file_url.trim() !== "") {
      const uploadsDir = path.join(process.cwd(), "Uploads");
      // Extract filename from URL
      let filename = lesson.file_url;
      if (filename.includes("/")) {
        filename = path.basename(filename);
      }
      filePath = path.join(uploadsDir, filename);
      
      // Check if file exists
      try {
        fileExists = fs.existsSync(filePath);
      } catch (err) {
        console.log("File existence check error:", err.message);
      }
    }
    
    // Get file info
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
    
    // Build file URL using the helper
    const builtUrl = buildFileUrls(lesson);
    
    res.json({
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
      file: {
        exists: fileExists,
        path: filePath,
        info: fileInfo,
      },
      environment: {
        node_env: process.env.NODE_ENV,
        backend_url: process.env.BACKEND_URL,
        cloudinary_configured: !!(process.env.CLOUDINARY_CLOUD_NAME),
        use_cloudinary: process.env.USE_CLOUDINARY === "true",
        uploads_dir: path.join(process.cwd(), "Uploads"),
      },
      message: "Debug information for lesson file",
    });
  } catch (err) {
    console.error("debugLessonFile error:", err?.message || err);
    return res.status(500).json({
      success: false,
      error: "Debug failed",
      details: process.env.NODE_ENV === "development" ? err?.message : undefined,
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
   Handle multer file uploads - UPDATED FOR CLOUDINARY
------------------------- */
const handleFileUploads = (req) => {
  const out = {};
  console.log("=== FILE UPLOADS DEBUG START ===");
  console.log(`☁️ Using Cloudinary: ${process.env.USE_CLOUDINARY === 'true'}`);
  
  if (!req.files) {
    console.log("📭 No files in request");
    console.log("=== FILE UPLOADS DEBUG END ===");
    return out;
  }
  
  console.log("📦 Files received fields:", Object.keys(req.files));
  
  try {
    // Check video files
    if (req.files.video && req.files.video[0]) {
      const file = req.files.video[0];
      console.log("🎥 Video file:", {
        originalname: file.originalname,
        filename: file.filename,
        path: file.path,
        location: file.location,
        size: file.size,
        mimetype: file.mimetype
      });
      
      // Store the location (Cloudinary URL or local path)
      out.videoUrl = file.location || file.path || `/Uploads/${file.filename}`;
      console.log(`🎥 Video URL set to: ${out.videoUrl}`);
    }
    
    // Check PDF files
    if (req.files.pdf && req.files.pdf[0]) {
      const file = req.files.pdf[0];
      console.log("📄 PDF file:", {
        originalname: file.originalname,
        filename: file.filename,
        path: file.path,
        location: file.location,
        size: file.size,
        mimetype: file.mimetype,
        cloudinary: file.cloudinary || false
      });
      
      // IMPORTANT: For PDFs on Cloudinary, ensure they use raw/upload
      if (file.location && file.location.includes("cloudinary.com") && file.location.includes("/image/upload/")) {
        out.fileUrl = file.location.replace("/image/upload/", "/raw/upload/");
        console.log(`📄 Fixed Cloudinary PDF URL: ${out.fileUrl.substring(0, 80)}...`);
      } else {
        out.fileUrl = file.location || file.path || `/Uploads/${file.filename}`;
      }
      console.log(`📄 File URL set to: ${out.fileUrl}`);
    }
    
    // Check generic file uploads
    if (req.files.file && req.files.file[0]) {
      const file = req.files.file[0];
      console.log("📎 Generic file:", {
        originalname: file.originalname,
        filename: file.filename,
        path: file.path,
        location: file.location,
        size: file.size,
        mimetype: file.mimetype,
        cloudinary: file.cloudinary || false
      });
      
      // For Cloudinary files, ensure PDFs use raw/upload
      if (file.location && file.location.includes("cloudinary.com") && 
          file.location.includes("/image/upload/") && 
          file.originalname.toLowerCase().endsWith('.pdf')) {
        out.fileUrl = file.location.replace("/image/upload/", "/raw/upload/");
        console.log(`📎 Fixed Cloudinary PDF URL: ${out.fileUrl.substring(0, 80)}...`);
      } else {
        out.fileUrl = file.location || file.path || `/Uploads/${file.filename}`;
      }
      console.log(`📎 File URL set to: ${out.fileUrl}`);
    }
    
  } catch (e) {
    console.error("❌ handleFileUploads error:", e?.message || e);
  }
  
  console.log("📤 Final uploads result:", out);
  console.log("=== FILE UPLOADS DEBUG END ===");
  
  return out;
};

/* -------------------------
   UPDATE LESSON - UPDATED FOR CLOUDINARY
------------------------- */
export const updateLesson = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const lessonId = req.params.lessonId ?? req.params.id;
    if (!lessonId || isNaN(parseInt(lessonId, 10))) {
      await t.rollback();
      return res.status(400).json({ success: false, error: "Valid lesson ID is required" });
    }
    
    const id = parseInt(lessonId, 10);
    console.log(`=== UPDATE LESSON ${id} START ===`);
    console.log(`👤 User: ${req.user?.id} (${req.user?.role})`);
    console.log(`☁️ Cloudinary enabled: ${process.env.USE_CLOUDINARY === 'true'}`);
    
    const existing = await Lesson.findByPk(id, { transaction: t });
    if (!existing) {
      await t.rollback();
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }
    
    console.log(`📝 Existing lesson: "${existing.title}"`);
    console.log(`   Current file_url: ${existing.file_url}`);
    console.log(`   Current content_type: ${existing.content_type}`);
    
    // Authorization
    if (req.user && req.user.role === "teacher") {
      const course = await Course.findByPk(existing.course_id, { transaction: t });
      if (!course || course.teacher_id !== req.user.id) {
        await t.rollback();
        return res.status(403).json({
          success: false,
          error: "You may only edit lessons in your own courses"
        });
      }
    }
    
    const body = req.body ?? {};
    const uploads = handleFileUploads(req);
    
    console.log("📦 Request body:", JSON.stringify(body, null, 2));
    
    const updates = {};
    if (body.title !== undefined && body.title !== null) updates.title = body.title.toString().trim();
    if (body.textContent !== undefined) updates.content = body.textContent;
    if (body.contentType !== undefined) updates.content_type = body.contentType;
    if (body.videoUrl !== undefined) updates.video_url = body.videoUrl;
    if (body.fileUrl !== undefined) updates.file_url = body.fileUrl;
    if (body.unitId !== undefined) updates.unit_id = body.unitId;
    if (body.orderIndex !== undefined) updates.order_index = parseInt(body.orderIndex, 10);
    if (body.isPreview !== undefined) updates.is_preview = Boolean(body.isPreview);
    
    // Handle uploaded files
    if (uploads.videoUrl) {
      console.log(`🎥 Setting video URL from upload: ${uploads.videoUrl}`);
      updates.video_url = uploads.videoUrl;
      updates.file_url = null;
      updates.content_type = "video";
    }
    
    if (uploads.fileUrl) {
      console.log(`📄 Setting file URL from upload: ${uploads.fileUrl}`);
      updates.file_url = uploads.fileUrl;
      updates.video_url = null;
      
      // Determine content type based on file extension or Cloudinary URL
      if (uploads.fileUrl.toLowerCase().endsWith('.pdf') || 
          (uploads.fileUrl.includes("cloudinary.com") && uploads.fileUrl.toLowerCase().includes(".pdf"))) {
        updates.content_type = "pdf";
      } else if (uploads.fileUrl.match(/\.(jpg|jpeg|png|gif)$/i) ||
                (uploads.fileUrl.includes("cloudinary.com") && uploads.fileUrl.includes("/image/"))) {
        updates.content_type = "image";
      } else {
        updates.content_type = "file";
      }
    }
    
    // Apply updates
    if (Object.keys(updates).length > 0) {
      console.log("💾 Updating database with:", updates);
      await existing.update(updates, { transaction: t });
    }
    
    const updated = await Lesson.findByPk(id, {
      include: [
        { model: Course, as: "course", attributes: ["id", "title"] },
        { model: Unit, as: "unit", attributes: ["id", "title"] },
      ],
      transaction: t,
    });
    
    console.log(`✅ Lesson ${id} updated successfully`);
    console.log(`   New file_url: ${updated.file_url}`);
    console.log(`   New content_type: ${updated.content_type}`);
    
    await t.commit();
    
    // Build response with proper URLs
    const response = buildFileUrls(updated);
    
    console.log(`📤 Sending response:`, {
      fileUrl: response.fileUrl ? `${response.fileUrl.substring(0, 80)}...` : "No file",
      videoUrl: response.videoUrl ? `${response.videoUrl.substring(0, 80)}...` : "No video"
    });
    console.log(`=== UPDATE LESSON ${id} END ===`);
    
    return res.json({
      success: true,
      lesson: response,
      message: "Lesson updated successfully"
    });
  } catch (err) {
    await t.rollback();
    console.error("❌ updateLesson error:", err?.message || err);
    console.error("Stack trace:", err?.stack);
    return res.status(500).json({
      success: false,
      error: "Failed to update lesson",
      details: process.env.NODE_ENV === "development" ? err?.message : undefined,
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
      return res.status(400).json({ success: false, error: "Valid course ID is required" });
    }
    
    const cId = parseInt(courseId, 10);
    const course = await Course.findByPk(cId, { transaction: t });
    
    if (!course) {
      await t.rollback();
      return res.status(404).json({ success: false, error: "Course not found" });
    }
    
    const body = req.body ?? {};
    const uploads = handleFileUploads(req);
    
    console.log("📝 Creating lesson with uploads:", uploads);
    
    // Determine content type
    let contentType = (body.contentType ?? body.content_type ?? "text").toString();
    if (uploads.fileUrl) contentType = "pdf";
    if (uploads.videoUrl) contentType = "video";
    
    // Determine orderIndex
    let orderIndex = (body.orderIndex ?? body.order_index);
    if (orderIndex === undefined || orderIndex === null || isNaN(parseInt(orderIndex, 10))) {
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
    
    console.log("✅ Lesson created:", created.id, "File URL:", created.file_url);
    
    const full = await Lesson.findByPk(created.id, {
      include: [
        { model: Course, as: "course", attributes: ["id", "title"] },
        { model: Unit, as: "unit", attributes: ["id", "title"] },
      ],
      transaction: t,
    });
    
    await t.commit();
    return res.status(201).json({
      success: true,
      lesson: buildFileUrls(full),
      message: "Lesson created"
    });
  } catch (err) {
    await t.rollback();
    console.error("createLesson error:", err?.message || err);
    return res.status(500).json({
      success: false,
      error: "Failed to create lesson",
      details: process.env.NODE_ENV === "development" ? err?.message : undefined,
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
      return res.status(400).json({ success: false, error: "Valid lesson ID is required" });
    }
    
    const id = parseInt(lessonId, 10);
    console.log(`📖 Fetching lesson ${id} for user:`, req.user?.id);
    
    const lesson = await Lesson.findByPk(id, {
      include: [
        { model: Course, as: "course", attributes: ["id", "title", "slug", "teacher_id"] },
        { model: Unit, as: "unit", attributes: ["id", "title", "order_index"] },
      ],
      transaction: t,
    });
    
    if (!lesson) {
      await t.rollback();
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }
    
    // Access checks
    let hasAccess = false;
    let accessReason = "unknown";
    const user = req.user ?? null;
    
    if (user) {
      if (user.role === "admin") {
        hasAccess = true;
        accessReason = "admin";
      } else if (user.role === "teacher" && lesson.course?.teacher_id === user.id) {
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
              approval_status: "approved"
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
      return res.status(accessReason === "requires_login" ? 401 : 403).json({
        success: false,
        error: accessReason === "requires_login"
          ? "Please log in to access this lesson"
          : "You do not have permission to access this lesson",
        reason: accessReason,
        canPreview: Boolean(lesson.is_preview),
      });
    }
    
    // Track view
    if (user?.id) {
      try {
        await trackLessonView(user.id, lesson.id);
      } catch (e) {
        console.warn("trackLessonView failed:", e?.message || e);
      }
    }
    
    const payload = buildFileUrls(lesson);
    
    console.log(`✅ Lesson ${id} payload built:`, {
      title: payload.title,
      fileUrl: payload.fileUrl ? `${payload.fileUrl.substring(0, 80)}...` : "No file",
      videoUrl: payload.videoUrl ? `${payload.videoUrl.substring(0, 80)}...` : "No video"
    });
    
    await t.commit();
    return res.json({
      success: true,
      lesson: payload,
      access: { reason: accessReason }
    });
  } catch (err) {
    await t.rollback();
    console.error("getLessonById error:", err?.message || err);
    return res.status(500).json({
      success: false,
      error: "Failed to load lesson",
      details: process.env.NODE_ENV === "development" ? err?.message : undefined,
    });
  }
};

/* -------------------------
   GET PREVIEW LESSON FOR COURSE
------------------------- */
export const getPreviewLessonForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!courseId || isNaN(parseInt(courseId, 10))) {
      return res.status(400).json({ success: false, error: "Valid course ID is required" });
    }
    
    const cId = parseInt(courseId, 10);
    const course = await Course.findByPk(cId, {
      attributes: ["id", "title", "slug", "teacher_id"]
    });
    
    if (!course) return res.status(404).json({ success: false, error: "Course not found" });
    
    let lesson = await Lesson.findOne({
      where: { course_id: cId, is_preview: true },
      order: [["order_index", "ASC"]],
      include: [{ model: Course, as: "course", attributes: ["id", "title", "slug"] }],
    });
    
    if (!lesson) {
      lesson = await Lesson.findOne({
        where: { course_id: cId },
        order: [["order_index", "ASC"]],
        include: [{ model: Course, as: "course", attributes: ["id", "title", "slug"] }],
      });
    }
    
    if (!lesson) {
      return res.status(404).json({ success: false, error: "No lessons found for this course" });
    }
    
    const payload = buildFileUrls(lesson);
    
    return res.json({
      success: true,
      lesson: payload,
      course: { id: course.id, title: course.title, slug: course.slug }
    });
  } catch (err) {
    console.error("getPreviewLessonForCourse error:", err?.message || err);
    return res.status(500).json({
      success: false,
      error: "Failed to load preview lesson",
      details: process.env.NODE_ENV === "development" ? err?.message : undefined,
    });
  }
};

/* -------------------------
   GET PUBLIC PREVIEW BY LESSON ID
------------------------- */
export const getPublicPreviewByLessonId = async (req, res) => {
  try {
    const lessonId = req.params.lessonId ?? req.params.id;
    if (!lessonId || isNaN(parseInt(lessonId, 10))) {
      return res.status(400).json({ success: false, error: "Valid lesson ID is required" });
    }
    
    const id = parseInt(lessonId, 10);
    const lesson = await Lesson.findByPk(id, {
      include: [{ model: Course, as: "course", attributes: ["id", "title", "slug"] }],
    });
    
    if (!lesson) return res.status(404).json({ success: false, error: "Lesson not found" });
    
    if (!lesson.is_preview && !req.user) {
      return res.status(403).json({
        success: false,
        error: "This lesson is not available for public preview. Please enroll or log in.",
      });
    }
    
    const payload = buildFileUrls(lesson);
    
    return res.json({
      success: true,
      lesson: payload,
      access: lesson.is_preview ? "public" : "restricted"
    });
  } catch (err) {
    console.error("getPublicPreviewByLessonId error:", err?.message || err);
    return res.status(500).json({
      success: false,
      error: "Failed to load preview",
      details: process.env.NODE_ENV === "development" ? err?.message : undefined,
    });
  }
};

/* -------------------------
   GET LESSONS BY COURSE
------------------------- */
export const getLessonsByCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId ?? req.params.id;
    if (!courseId || isNaN(parseInt(courseId, 10))) {
      return res.status(400).json({ success: false, error: "Valid course ID is required" });
    }
    
    const cId = parseInt(courseId, 10);
    const lessons = await Lesson.findAll({
      where: { course_id: cId },
      include: [{ model: Unit, as: "unit", attributes: ["id", "title", "order_index"] }],
      order: [["order_index", "ASC"]],
    });
    
    return res.json({
      success: true,
      lessons: lessons.map(buildFileUrls),
      count: lessons.length
    });
  } catch (err) {
    console.error("getLessonsByCourse error:", err?.message || err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch lessons",
      details: process.env.NODE_ENV === "development" ? err?.message : undefined,
    });
  }
};

/* -------------------------
   GET LESSONS BY UNIT
------------------------- */
export const getLessonsByUnit = async (req, res) => {
  try {
    const unitId = req.params.unitId ?? req.params.id;
    if (!unitId || isNaN(parseInt(unitId, 10))) {
      return res.status(400).json({ success: false, error: "Valid unit ID is required" });
    }
    
    const uId = parseInt(unitId, 10);
    const lessons = await Lesson.findAll({
      where: { unit_id: uId },
      order: [["order_index", "ASC"]],
    });
    
    return res.json({
      success: true,
      lessons: lessons.map(buildFileUrls),
      count: lessons.length
    });
  } catch (err) {
    console.error("getLessonsByUnit error:", err?.message || err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch unit lessons",
      details: process.env.NODE_ENV === "development" ? err?.message : undefined,
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
      return res.status(400).json({ success: false, error: "Valid lesson ID is required" });
    }
    
    const id = parseInt(lessonId, 10);
    const lesson = await Lesson.findByPk(id, { transaction: t });
    
    if (!lesson) {
      await t.rollback();
      return res.status(404).json({ success: false, error: "Lesson not found" });
    }
    
    // Authorization
    if (req.user && req.user.role === "teacher") {
      const course = await Course.findByPk(lesson.course_id, { transaction: t });
      if (!course || course.teacher_id !== req.user.id) {
        await t.rollback();
        return res.status(403).json({
          success: false,
          error: "You can only delete lessons from your courses"
        });
      }
    }
    
    await lesson.destroy({ transaction: t });
    await t.commit();
    
    return res.json({
      success: true,
      message: "Lesson deleted",
      deletedId: id
    });
  } catch (err) {
    await t.rollback();
    console.error("deleteLesson error:", err?.message || err);
    return res.status(500).json({
      success: false,
      error: "Failed to delete lesson",
      details: process.env.NODE_ENV === "development" ? err?.message : undefined,
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