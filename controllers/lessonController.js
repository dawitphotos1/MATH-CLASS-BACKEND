
// // controllers/lessonController.js

// import db from "../models/index.js";

// const { Lesson, Course } = db;

// /* -------------------------
//    Helpers
// ------------------------- */
// const getBackendUrl = () => {
//   if (process.env.BACKEND_URL)
//     return process.env.BACKEND_URL.replace(/\/$/, "");
//   if (process.env.RENDER_EXTERNAL_URL)
//     return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, "");
//   return `http://localhost:${process.env.PORT || 5000}`;
// };

// export const buildFileUrls = (lesson) => {
//   if (!lesson) return null;
//   const raw = lesson.toJSON ? lesson.toJSON() : lesson;

//   const normalize = (url) => {
//     if (!url) return null;
//     if (url.startsWith("http")) {
//       // Fix Cloudinary PDF URLs - change from image to raw if needed
//       if (
//         url.includes("cloudinary.com") &&
//         url.includes("/image/upload/") &&
//         (url.includes(".pdf") || url.includes("/mathe-class/pdfs/"))
//       ) {
//         return url.replace("/image/upload/", "/raw/upload/");
//       }
//       return url;
//     }

//     // Local file URL
//     return `${getBackendUrl()}/api/v1/files/${encodeURIComponent(
//       url.replace(/^\/?Uploads\//, "")
//     )}`;
//   };

//   return {
//     id: raw.id,
//     title: raw.title,
//     contentType: raw.content_type,
//     textContent: raw.content,
//     fileUrl: normalize(raw.file_url),
//     videoUrl: normalize(raw.video_url),
//     isPreview: !!raw.is_preview,
//     orderIndex: raw.order_index,
//     unitId: raw.unit_id,
//     courseId: raw.course_id,
//     createdAt: raw.created_at,
//     updatedAt: raw.updated_at,
//   };
// };

// /* -------------------------
//    CRUD — LESSON
// ------------------------- */

// // GET /lessons/:id
// export const getLessonById = async (req, res) => {
//   try {
//     const lesson = await Lesson.findByPk(req.params.id);
//     if (!lesson) {
//       return res
//         .status(404)
//         .json({ success: false, error: "Lesson not found" });
//     }

//     res.json({ success: true, lesson: buildFileUrls(lesson) });
//   } catch (err) {
//     console.error("❌ Get lesson error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to load lesson",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// };

// // POST /course/:courseId/lessons
// export const createLesson = async (req, res) => {
//   try {
//     console.log("📝 Creating lesson for course:", req.params.courseId);
//     console.log(
//       "📤 Files received:",
//       req.files ? Object.keys(req.files) : "No files"
//     );

//     // Get processed uploads from middleware
//     const uploads = req.processedUploads || {};
//     console.log("📄 Processed uploads:", uploads);

//     const lesson = await Lesson.create({
//       ...req.body,
//       course_id: req.params.courseId,
//       file_url: uploads.fileUrl || null,
//       video_url: uploads.videoUrl || null,
//     });

//     console.log(`✅ Lesson created: ${lesson.id} - "${lesson.title}"`);

//     res.status(201).json({
//       success: true,
//       lesson: buildFileUrls(lesson),
//       uploads: uploads,
//     });
//   } catch (err) {
//     console.error("❌ Create lesson error:", err);
//     console.error("Full error:", err.stack);

//     // Handle specific errors
//     if (err.name === "SequelizeValidationError") {
//       const errors = err.errors.map((e) => ({
//         field: e.path,
//         message: e.message,
//       }));
//       return res.status(400).json({
//         success: false,
//         error: "Validation failed",
//         details: errors,
//       });
//     }

//     if (err.name === "SequelizeUniqueConstraintError") {
//       return res.status(400).json({
//         success: false,
//         error: "A lesson with this title already exists in this course",
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: "Failed to create lesson",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// };

// // PUT /lessons/:lessonId - MAIN FIX
// export const updateLesson = async (req, res) => {
//   try {
//     const lessonId = req.params.lessonId;
//     console.log(`📝 Updating lesson ${lessonId}`);
//     console.log("📤 Request body:", req.body);
//     console.log(
//       "📤 Files received:",
//       req.files ? Object.keys(req.files) : "No files"
//     );

//     // Find the lesson
//     const lesson = await Lesson.findByPk(lessonId);
//     if (!lesson) {
//       return res.status(404).json({
//         success: false,
//         error: `Lesson ${lessonId} not found`,
//       });
//     }

//     // Get processed uploads from middleware
//     const uploads = req.processedUploads || {};
//     console.log("📄 Processed uploads:", uploads);

//     // Prepare update data
//     const updateData = {
//       title: req.body.title !== undefined ? req.body.title : lesson.title,
//       content:
//         req.body.content !== undefined ? req.body.content : lesson.content,
//       content_type:
//         req.body.content_type !== undefined
//           ? req.body.content_type
//           : lesson.content_type,
//       is_preview:
//         req.body.is_preview !== undefined
//           ? req.body.is_preview
//           : lesson.is_preview,
//       order_index:
//         req.body.order_index !== undefined
//           ? req.body.order_index
//           : lesson.order_index,
//     };

//     // Update file URLs if new files were uploaded
//     if (uploads.fileUrl) {
//       console.log(`📄 Setting new file_url: ${uploads.fileUrl}`);
//       updateData.file_url = uploads.fileUrl;
//     }

//     if (uploads.videoUrl) {
//       console.log(`🎥 Setting new video_url: ${uploads.videoUrl}`);
//       updateData.video_url = uploads.videoUrl;
//     }

//     // Update the lesson
//     await lesson.update(updateData);

//     // Fetch the updated lesson with relations
//     const updatedLesson = await Lesson.findByPk(lessonId);

//     console.log(`✅ Lesson ${lessonId} updated successfully`);

//     res.json({
//       success: true,
//       message: "Lesson updated successfully",
//       lesson: buildFileUrls(updatedLesson),
//       uploads: uploads,
//     });
//   } catch (err) {
//     console.error("❌ Update lesson error:", err);
//     console.error("Full error:", err.stack);

//     // Handle specific errors
//     if (err.name === "SequelizeValidationError") {
//       const errors = err.errors.map((e) => ({
//         field: e.path,
//         message: e.message,
//       }));
//       return res.status(400).json({
//         success: false,
//         error: "Validation failed",
//         details: errors,
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: "Failed to update lesson",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// };

// // DELETE /lessons/:lessonId
// export const deleteLesson = async (req, res) => {
//   try {
//     const lesson = await Lesson.findByPk(req.params.lessonId);
//     if (!lesson) {
//       return res
//         .status(404)
//         .json({ success: false, error: "Lesson not found" });
//     }

//     await lesson.destroy();

//     res.json({
//       success: true,
//       message: "Lesson deleted successfully",
//       deletedId: req.params.lessonId,
//     });
//   } catch (err) {
//     console.error("❌ Delete lesson error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to delete lesson",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// };

// /* -------------------------
//    LISTING
// ------------------------- */

// export const getLessonsByUnit = async (req, res) => {
//   try {
//     const lessons = await Lesson.findAll({
//       where: { unit_id: req.params.unitId },
//       order: [["order_index", "ASC"]],
//     });

//     res.json({
//       success: true,
//       lessons: lessons.map(buildFileUrls),
//       count: lessons.length,
//     });
//   } catch (err) {
//     console.error("❌ Get lessons by unit error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to load unit lessons",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// };

// export const getLessonsByCourse = async (req, res) => {
//   try {
//     const lessons = await Lesson.findAll({
//       where: { course_id: req.params.courseId },
//       order: [
//         ["unit_id", "ASC"],
//         ["order_index", "ASC"],
//       ],
//     });

//     res.json({
//       success: true,
//       lessons: lessons.map(buildFileUrls),
//       count: lessons.length,
//     });
//   } catch (err) {
//     console.error("❌ Get lessons by course error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to load course lessons",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// };

// /* -------------------------
//    PREVIEW
// ------------------------- */

// export const getPreviewLessonForCourse = async (req, res) => {
//   try {
//     const lesson =
//       (await Lesson.findOne({
//         where: { course_id: req.params.courseId, is_preview: true },
//         order: [["order_index", "ASC"]],
//       })) ||
//       (await Lesson.findOne({
//         where: { course_id: req.params.courseId },
//         order: [["order_index", "ASC"]],
//       }));

//     if (!lesson) {
//       return res.status(404).json({
//         success: false,
//         error: "No lessons found for this course",
//       });
//     }

//     const course = await Course.findByPk(req.params.courseId, {
//       attributes: ["id", "title", "slug", "thumbnail"],
//     });

//     res.json({
//       success: true,
//       lesson: buildFileUrls(lesson),
//       course,
//     });
//   } catch (err) {
//     console.error("❌ Preview lesson error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to load preview lesson",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// };

// export const getPublicPreviewByLessonId = async (req, res) => {
//   try {
//     const lesson = await Lesson.findByPk(req.params.lessonId);
//     if (!lesson) {
//       return res
//         .status(404)
//         .json({ success: false, error: "Lesson not found" });
//     }

//     // Check if it's a preview lesson or user has access
//     if (!lesson.is_preview && !req.user) {
//       return res.status(403).json({
//         success: false,
//         error: "This lesson requires enrollment",
//       });
//     }

//     const course = await Course.findByPk(lesson.course_id, {
//       attributes: ["id", "title", "slug"],
//     });

//     res.json({
//       success: true,
//       lesson: buildFileUrls(lesson),
//       course,
//     });
//   } catch (err) {
//     console.error("❌ Public preview error:", err);
//     res.status(500).json({
//       success: false,
//       error: "Failed to load preview",
//       details: process.env.NODE_ENV === "development" ? err.message : undefined,
//     });
//   }
// };

// /* -------------------------
//    DEBUG HELPERS
// ------------------------- */

// export const debugLessonFile = async (req, res) => {
//   try {
//     const lessonId = req.params.lessonId || req.query.lessonId;
//     const lesson = lessonId ? await Lesson.findByPk(lessonId) : null;

//     res.json({
//       success: true,
//       message: "debugLessonFile OK",
//       lesson: lesson ? buildFileUrls(lesson) : null,
//       timestamp: new Date().toISOString(),
//     });
//   } catch (err) {
//     console.error("❌ Debug error:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

// export const fixLessonFileUrl = async (req, res) => {
//   try {
//     const { lessonId } = req.params;
//     if (!lessonId) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Lesson ID required" });
//     }

//     const lesson = await Lesson.findByPk(lessonId);
//     if (!lesson) {
//       return res
//         .status(404)
//         .json({ success: false, error: "Lesson not found" });
//     }

//     // Fix Cloudinary URLs if needed
//     if (lesson.file_url && lesson.file_url.includes("cloudinary.com")) {
//       const oldUrl = lesson.file_url;
//       const newUrl = oldUrl.replace("/image/upload/", "/raw/upload/");

//       if (oldUrl !== newUrl) {
//         await lesson.update({ file_url: newUrl });
//         return res.json({
//           success: true,
//           message: "File URL fixed",
//           oldUrl,
//           newUrl,
//         });
//       }
//     }

//     res.json({
//       success: true,
//       message: "No fixes needed",
//       file_url: lesson.file_url,
//     });
//   } catch (err) {
//     console.error("❌ Fix file URL error:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

// /* -------------------------
//    EXPORT (DEFAULT)
// ------------------------- */

// export default {
//   buildFileUrls,
//   getLessonById,
//   createLesson,
//   updateLesson,
//   deleteLesson,
//   getLessonsByUnit,
//   getLessonsByCourse,
//   getPreviewLessonForCourse,
//   getPublicPreviewByLessonId,
//   debugLessonFile,
//   fixLessonFileUrl,
// };






// controllers/lessonController.js

import db from "../models/index.js";

const { Lesson, Course } = db;

/* -------------------------
   Helpers
------------------------- */
const getBackendUrl = () => {
  if (process.env.BACKEND_URL)
    return process.env.BACKEND_URL.replace(/\/$/, "");
  if (process.env.RENDER_EXTERNAL_URL)
    return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, "");
  return `http://localhost:${process.env.PORT || 5000}`;
};

// 🔥 NEW: Fix Cloudinary URLs helper
const fixCloudinaryUrl = (url) => {
  if (!url) return url;
  
  // Fix Cloudinary URLs that are incorrectly typed
  if (url.includes('cloudinary.com')) {
    // Fix PDF URLs that are uploaded as images
    if (url.includes('/image/upload/') && 
        (url.includes('.pdf') || url.includes('/mathe-class/pdfs/'))) {
      console.log(`🔧 Fixing Cloudinary URL in database: ${url.substring(0, 80)}...`);
      return url.replace('/image/upload/', '/raw/upload/');
    }
    
    // Ensure raw uploads for documents
    if ((url.includes('.doc') || url.includes('.docx') || url.includes('.ppt') || 
         url.includes('.pptx') || url.includes('.xls') || url.includes('.xlsx')) &&
        url.includes('/image/upload/')) {
      console.log(`🔧 Fixing Office document URL: ${url.substring(0, 80)}...`);
      return url.replace('/image/upload/', '/raw/upload/');
    }
  }
  
  return url;
};

export const buildFileUrls = (lesson) => {
  if (!lesson) return null;
  const raw = lesson.toJSON ? lesson.toJSON() : lesson;

  const normalize = (url) => {
    if (!url) return null;
    
    // 🔥 FIX: Apply Cloudinary URL fixing
    url = fixCloudinaryUrl(url);
    
    if (url.startsWith("http")) {
      return url;
    }

    // Local file URL
    return `${getBackendUrl()}/api/v1/files/${encodeURIComponent(
      url.replace(/^\/?Uploads\//, "")
    )}`;
  };

  return {
    id: raw.id,
    title: raw.title,
    contentType: raw.content_type,
    textContent: raw.content,
    fileUrl: normalize(raw.file_url),
    videoUrl: normalize(raw.video_url),
    isPreview: !!raw.is_preview,
    orderIndex: raw.order_index,
    unitId: raw.unit_id,
    courseId: raw.course_id,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
};

/* -------------------------
   CRUD — LESSON
------------------------- */

// GET /lessons/:id
export const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) {
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });
    }

    res.json({ success: true, lesson: buildFileUrls(lesson) });
  } catch (err) {
    console.error("❌ Get lesson error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to load lesson",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// POST /course/:courseId/lessons
export const createLesson = async (req, res) => {
  try {
    console.log("📝 Creating lesson for course:", req.params.courseId);
    console.log(
      "📤 Files received:",
      req.files ? Object.keys(req.files) : "No files"
    );

    // Get processed uploads from middleware
    const uploads = req.processedUploads || {};
    console.log("📄 Processed uploads:", uploads);

    // 🔥 FIX: Apply Cloudinary URL fixing before saving
    const fixedFileUrl = uploads.fileUrl ? fixCloudinaryUrl(uploads.fileUrl) : null;
    if (fixedFileUrl !== uploads.fileUrl) {
      console.log(`🔧 Fixed file URL before save: ${fixedFileUrl}`);
    }

    const lesson = await Lesson.create({
      ...req.body,
      course_id: req.params.courseId,
      file_url: fixedFileUrl || null,
      video_url: uploads.videoUrl || null,
    });

    console.log(`✅ Lesson created: ${lesson.id} - "${lesson.title}"`);

    res.status(201).json({
      success: true,
      lesson: buildFileUrls(lesson),
      uploads: {
        ...uploads,
        fileUrl: fixedFileUrl
      },
    });
  } catch (err) {
    console.error("❌ Create lesson error:", err);
    console.error("Full error:", err.stack);

    // Handle specific errors
    if (err.name === "SequelizeValidationError") {
      const errors = err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
    }

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        error: "A lesson with this title already exists in this course",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create lesson",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// PUT /lessons/:lessonId - UPDATED WITH FIXES
export const updateLesson = async (req, res) => {
  try {
    const lessonId = req.params.lessonId;
    console.log(`📝 Updating lesson ${lessonId}`);
    console.log("📤 Request body:", req.body);
    console.log(
      "📤 Files received:",
      req.files ? Object.keys(req.files) : "No files"
    );

    // Find the lesson
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: `Lesson ${lessonId} not found`,
      });
    }

    // Get processed uploads from middleware
    const uploads = req.processedUploads || {};
    console.log("📄 Processed uploads:", uploads);

    // Prepare update data
    const updateData = {
      title: req.body.title !== undefined ? req.body.title : lesson.title,
      content:
        req.body.content !== undefined ? req.body.content : lesson.content,
      content_type:
        req.body.content_type !== undefined
          ? req.body.content_type
          : lesson.content_type,
      is_preview:
        req.body.is_preview !== undefined
          ? req.body.is_preview
          : lesson.is_preview,
      order_index:
        req.body.order_index !== undefined
          ? req.body.order_index
          : lesson.order_index,
    };

    // Update file URLs if new files were uploaded
    if (uploads.fileUrl) {
      console.log(`📄 Setting new file_url: ${uploads.fileUrl}`);
      
      // 🔥 FIX: Apply Cloudinary URL fixing before saving
      const fixedUrl = fixCloudinaryUrl(uploads.fileUrl);
      if (fixedUrl !== uploads.fileUrl) {
        console.log(`🔧 Fixed URL before save: ${fixedUrl}`);
      }
      
      updateData.file_url = fixedUrl;
    }

    if (uploads.videoUrl) {
      console.log(`🎥 Setting new video_url: ${uploads.videoUrl}`);
      updateData.video_url = uploads.videoUrl;
    }

    // 🔥 FIX: Also fix existing URLs if they're wrong
    if (!uploads.fileUrl && lesson.file_url) {
      const fixedExistingUrl = fixCloudinaryUrl(lesson.file_url);
      if (fixedExistingUrl !== lesson.file_url) {
        console.log(`🔧 Fixing existing file_url: ${fixedExistingUrl}`);
        updateData.file_url = fixedExistingUrl;
      }
    }

    // Update the lesson
    await lesson.update(updateData);

    // Fetch the updated lesson with relations
    const updatedLesson = await Lesson.findByPk(lessonId);

    console.log(`✅ Lesson ${lessonId} updated successfully`);
    
    // Log the final URL for debugging
    console.log(`📊 Final file_url in database: ${updatedLesson.file_url}`);

    res.json({
      success: true,
      message: "Lesson updated successfully",
      lesson: buildFileUrls(updatedLesson),
      uploads: {
        ...uploads,
        fileUrl: uploads.fileUrl ? fixCloudinaryUrl(uploads.fileUrl) : null
      },
    });
  } catch (err) {
    console.error("❌ Update lesson error:", err);
    console.error("Full error:", err.stack);

    // Handle specific errors
    if (err.name === "SequelizeValidationError") {
      const errors = err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to update lesson",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// DELETE /lessons/:lessonId
export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId);
    if (!lesson) {
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });
    }

    await lesson.destroy();

    res.json({
      success: true,
      message: "Lesson deleted successfully",
      deletedId: req.params.lessonId,
    });
  } catch (err) {
    console.error("❌ Delete lesson error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete lesson",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/* -------------------------
   LISTING
------------------------- */

export const getLessonsByUnit = async (req, res) => {
  try {
    const lessons = await Lesson.findAll({
      where: { unit_id: req.params.unitId },
      order: [["order_index", "ASC"]],
    });

    res.json({
      success: true,
      lessons: lessons.map(buildFileUrls),
      count: lessons.length,
    });
  } catch (err) {
    console.error("❌ Get lessons by unit error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to load unit lessons",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const getLessonsByCourse = async (req, res) => {
  try {
    const lessons = await Lesson.findAll({
      where: { course_id: req.params.courseId },
      order: [
        ["unit_id", "ASC"],
        ["order_index", "ASC"],
      ],
    });

    res.json({
      success: true,
      lessons: lessons.map(buildFileUrls),
      count: lessons.length,
    });
  } catch (err) {
    console.error("❌ Get lessons by course error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to load course lessons",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/* -------------------------
   PREVIEW
------------------------- */

export const getPreviewLessonForCourse = async (req, res) => {
  try {
    const lesson =
      (await Lesson.findOne({
        where: { course_id: req.params.courseId, is_preview: true },
        order: [["order_index", "ASC"]],
      })) ||
      (await Lesson.findOne({
        where: { course_id: req.params.courseId },
        order: [["order_index", "ASC"]],
      }));

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: "No lessons found for this course",
      });
    }

    const course = await Course.findByPk(req.params.courseId, {
      attributes: ["id", "title", "slug", "thumbnail"],
    });

    res.json({
      success: true,
      lesson: buildFileUrls(lesson),
      course,
    });
  } catch (err) {
    console.error("❌ Preview lesson error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to load preview lesson",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

export const getPublicPreviewByLessonId = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId);
    if (!lesson) {
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });
    }

    // Check if it's a preview lesson or user has access
    if (!lesson.is_preview && !req.user) {
      return res.status(403).json({
        success: false,
        error: "This lesson requires enrollment",
      });
    }

    const course = await Course.findByPk(lesson.course_id, {
      attributes: ["id", "title", "slug"],
    });

    res.json({
      success: true,
      lesson: buildFileUrls(lesson),
      course,
    });
  } catch (err) {
    console.error("❌ Public preview error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to load preview",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

/* -------------------------
   DEBUG HELPERS
------------------------- */

export const debugLessonFile = async (req, res) => {
  try {
    const lessonId = req.params.lessonId || req.query.lessonId;
    const lesson = lessonId ? await Lesson.findByPk(lessonId) : null;

    res.json({
      success: true,
      message: "debugLessonFile OK",
      lesson: lesson ? buildFileUrls(lesson) : null,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("❌ Debug error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const fixLessonFileUrl = async (req, res) => {
  try {
    const { lessonId } = req.params;
    if (!lessonId) {
      return res
        .status(400)
        .json({ success: false, error: "Lesson ID required" });
    }

    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) {
      return res
        .status(404)
        .json({ success: false, error: "Lesson not found" });
    }

    // Fix Cloudinary URLs if needed
    if (lesson.file_url && lesson.file_url.includes("cloudinary.com")) {
      const oldUrl = lesson.file_url;
      const newUrl = fixCloudinaryUrl(oldUrl);

      if (oldUrl !== newUrl) {
        await lesson.update({ file_url: newUrl });
        return res.json({
          success: true,
          message: "File URL fixed",
          oldUrl,
          newUrl,
        });
      }
    }

    res.json({
      success: true,
      message: "No fixes needed",
      file_url: lesson.file_url,
    });
  } catch (err) {
    console.error("❌ Fix file URL error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/* -------------------------
   EXPORT (DEFAULT)
------------------------- */

export default {
  buildFileUrls,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessonsByUnit,
  getLessonsByCourse,
  getPreviewLessonForCourse,
  getPublicPreviewByLessonId,
  debugLessonFile,
  fixLessonFileUrl,
};