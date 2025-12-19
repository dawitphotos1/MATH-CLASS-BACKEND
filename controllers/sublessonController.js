
// controllers/sublessonController.js
import db from "../models/index.js";
import { fixCloudinaryUrl } from "../middleware/cloudinaryUpload.js";

const { Lesson, SubLesson, Attachment } = db;

/* -------------------------
   Helpers
------------------------- */
const getBackendUrl = () => {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL.replace(/\/$/, "");
  if (process.env.RENDER_EXTERNAL_URL)
    return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, "");
  return `http://localhost:${process.env.PORT || 5000}`;
};

const normalizeUrl = (url) => {
  if (!url) return null;

  // Apply Cloudinary URL fixing
  url = fixCloudinaryUrl(url);

  if (url.startsWith("http")) {
    return url;
  }

  // Local file URL
  return `${getBackendUrl()}/api/v1/files/${encodeURIComponent(
    url.replace(/^\/?Uploads\//, "")
  )}`;
};

export const buildSubLessonUrls = (sublesson) => {
  if (!sublesson) return null;
  const raw = sublesson.toJSON ? sublesson.toJSON() : { ...sublesson };

  return {
    id: raw.id,
    lesson_id: raw.lesson_id,
    title: raw.title,
    content: raw.content,
    orderIndex: raw.order_index,
    contentType: raw.content_type,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    // ✅ ADDED: Attachments
    attachments: raw.attachments
      ? raw.attachments.map((att) => ({
          id: att.id,
          filePath: normalizeUrl(att.file_path),
          fileType: att.file_type,
          fileName: att.file_name || att.file_path.split("/").pop(),
          fileSize: att.file_size,
          createdAt: att.created_at,
          updatedAt: att.updated_at,
        }))
      : [],
  };
};

/* -------------------------
   Get sublessons for a lesson
------------------------- */
export const getSubLessonsByLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;

    console.log("📚 Fetching sublessons for lesson:", lessonId);

    // Check if lesson exists
    const lesson = await Lesson.findByPk(lessonId);

    if (!lesson) {
      return res.status(200).json({
        success: true,
        sublessons: [],
        message: "Lesson not found — returning empty sublesson list",
      });
    }

    // Fetch sublessons with attachments
    let sublessons = [];
    if (SubLesson && SubLesson.findAll) {
      sublessons = await SubLesson.findAll({
        where: { lesson_id: lessonId },
        include: [
          {
            model: Attachment,
            as: "attachments",
            attributes: ["id", "file_path", "file_type", "file_name", "file_size", "created_at", "updated_at"],
          },
        ],
        order: [["order_index", "ASC"]],
      });
    }

    return res.json({
      success: true,
      sublessons: sublessons.map(buildSubLessonUrls),
      message:
        sublessons.length === 0
          ? "No sublessons found for this lesson"
          : "Sublessons fetched successfully",
    });
  } catch (error) {
    console.error("❌ Error fetching sublessons:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch sublessons",
    });
  }
};

/* -------------------------
   Create a new sublesson
------------------------- */
export const createSubLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, content, order_index, content_type } = req.body;

    // Check if lesson exists
    const lesson = await Lesson.findByPk(lessonId);

    if (!lesson) {
      return res.status(200).json({
        success: false,
        error: "Lesson not found — cannot create sublesson",
      });
    }

    // Get processed uploads from middleware
    const uploads = req.processedUploads || {};
    console.log("📄 Processed uploads for sublesson:", uploads);

    // Create the sublesson
    let newSublesson = null;

    if (SubLesson && SubLesson.create) {
      newSublesson = await SubLesson.create({
        lesson_id: lessonId,
        title,
        content,
        order_index: order_index || 0,
        content_type: content_type || "text",
      });
    } else {
      // Temporary fallback if model is not implemented yet
      newSublesson = {
        lesson_id: parseInt(lessonId),
        title,
        content,
        order_index: order_index || 0,
        content_type: content_type || "text",
      };
    }

    // ✅ CREATE ATTACHMENTS if any
    if (uploads.attachments && uploads.attachments.length > 0) {
      console.log(`📎 Creating ${uploads.attachments.length} attachments for sublesson`);

      const attachmentPromises = uploads.attachments.map((att) =>
        Attachment.create({
          sublesson_id: newSublesson.id,
          file_path: att.url,
          file_type: att.mimetype,
          file_name: att.originalname,
          file_size: att.size,
        })
      );

      await Promise.all(attachmentPromises);
    }

    // Fetch sublesson with attachments
    const sublessonWithAttachments = await SubLesson.findByPk(newSublesson.id, {
      include: [
        {
          model: Attachment,
          as: "attachments",
          attributes: ["id", "file_path", "file_type", "file_name", "file_size", "created_at", "updated_at"],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Sublesson created successfully",
      sublesson: buildSubLessonUrls(sublessonWithAttachments),
    });
  } catch (error) {
    console.error("❌ Error creating sublesson:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create sublesson",
    });
  }
};

/* -------------------------
   Update a sublesson
------------------------- */
export const updateSubLesson = async (req, res) => {
  try {
    const { sublessonId } = req.params;
    const { title, content, order_index, content_type } = req.body;

    // Find the sublesson
    const sublesson = await SubLesson.findByPk(sublessonId, {
      include: [
        {
          model: Attachment,
          as: "attachments",
          attributes: ["id", "file_path", "file_type", "file_name"],
        },
      ],
    });

    if (!sublesson) {
      return res.status(404).json({
        success: false,
        error: "Sublesson not found",
      });
    }

    // Get processed uploads from middleware
    const uploads = req.processedUploads || {};
    console.log("📄 Processed uploads for sublesson update:", uploads);

    // Prepare update data
    const updateData = {
      title: title !== undefined ? title : sublesson.title,
      content: content !== undefined ? content : sublesson.content,
      order_index: order_index !== undefined ? order_index : sublesson.order_index,
      content_type: content_type !== undefined ? content_type : sublesson.content_type,
    };

    // ✅ ADD NEW ATTACHMENTS if any
    if (uploads.attachments && uploads.attachments.length > 0) {
      console.log(`📎 Adding ${uploads.attachments.length} new attachments to sublesson`);

      const attachmentPromises = uploads.attachments.map((att) =>
        Attachment.create({
          sublesson_id: sublesson.id,
          file_path: att.url,
          file_type: att.mimetype,
          file_name: att.originalname,
          file_size: att.size,
        })
      );

      await Promise.all(attachmentPromises);
    }

    // Update the sublesson
    await sublesson.update(updateData);

    // Fetch updated sublesson with attachments
    const updatedSublesson = await SubLesson.findByPk(sublessonId, {
      include: [
        {
          model: Attachment,
          as: "attachments",
          attributes: ["id", "file_path", "file_type", "file_name", "file_size", "created_at", "updated_at"],
        },
      ],
    });

    return res.json({
      success: true,
      message: "Sublesson updated successfully",
      sublesson: buildSubLessonUrls(updatedSublesson),
    });
  } catch (error) {
    console.error("❌ Error updating sublesson:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update sublesson",
    });
  }
};

/* -------------------------
   Delete a sublesson
------------------------- */
export const deleteSubLesson = async (req, res) => {
  try {
    const { sublessonId } = req.params;

    const sublesson = await SubLesson.findByPk(sublessonId);

    if (!sublesson) {
      return res.status(404).json({
        success: false,
        error: "Sublesson not found",
      });
    }

    await sublesson.destroy();

    return res.json({
      success: true,
      message: "Sublesson deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting sublesson:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete sublesson",
    });
  }
};

/* -------------------------
   Get sublesson by ID
------------------------- */
export const getSubLessonById = async (req, res) => {
  try {
    const { sublessonId } = req.params;

    const sublesson = await SubLesson.findByPk(sublessonId, {
      include: [
        {
          model: Attachment,
          as: "attachments",
          attributes: ["id", "file_path", "file_type", "file_name", "file_size", "created_at", "updated_at"],
        },
        {
          model: Lesson,
          as: "lesson",
          attributes: ["id", "title", "course_id"],
        },
      ],
    });

    if (!sublesson) {
      return res.status(404).json({
        success: false,
        error: "Sublesson not found",
      });
    }

    return res.json({
      success: true,
      sublesson: buildSubLessonUrls(sublesson),
    });
  } catch (error) {
    console.error("❌ Error fetching sublesson:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch sublesson",
    });
  }
};

/* -------------------------
   Delete sublesson attachment
------------------------- */
export const deleteSubLessonAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.params;

    const attachment = await Attachment.findByPk(attachmentId);

    if (!attachment) {
      return res.status(404).json({
        success: false,
        error: "Attachment not found",
      });
    }

    // Check if attachment belongs to a sublesson
    if (!attachment.sublesson_id) {
      return res.status(400).json({
        success: false,
        error: "Attachment does not belong to a sublesson",
      });
    }

    // Check if the user owns this lesson
    const sublesson = await SubLesson.findByPk(attachment.sublesson_id, {
      include: [
        {
          model: Lesson,
          as: "lesson",
          attributes: ["id"],
          include: [
            {
              model: db.Course,
              as: "course",
              attributes: ["teacher_id"],
            },
          ],
        },
      ],
    });

    if (!sublesson) {
      return res.status(404).json({
        success: false,
        error: "Sublesson not found",
      });
    }

    // Verify ownership (teacher or admin)
    if (
      req.user.role !== "admin" &&
      (!sublesson.lesson || sublesson.lesson.course.teacher_id !== req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this attachment",
      });
    }

    await attachment.destroy();

    return res.json({
      success: true,
      message: "Sublesson attachment deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting sublesson attachment:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to delete attachment",
    });
  }
};

/* -------------------------
   Export
------------------------- */
export default {
  getSubLessonsByLesson,
  createSubLesson,
  updateSubLesson,
  deleteSubLesson,
  getSubLessonById,
  deleteSubLessonAttachment,
  buildSubLessonUrls,
};