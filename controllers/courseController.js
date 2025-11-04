// // controllers/courseController.js
// import db from "../models/index.js";

// const { Course, Lesson, User } = db;

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

//     const courseData = course.toJSON();

//     res.json({
//       success: true,
//       course: {
//         id: courseData.id,
//         title: courseData.title,
//         description: courseData.description,
//         thumbnail: courseData.thumbnail,
//         teacher: courseData.teacher,
//         price:
//           courseData.price !== undefined && courseData.price !== null
//             ? Number(courseData.price)
//             : 0,
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
//       const courseData = course.toJSON();
//       return {
//         ...courseData,
//         price:
//           courseData.price !== undefined && courseData.price !== null
//             ? Number(courseData.price)
//             : 0,
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
//         { model: Lesson, as: "lessons" },
//         { model: User, as: "teacher", attributes: ["id", "name", "email"] },
//       ],
//       order: [[{ model: Lesson, as: "lessons" }, "order_index", "ASC"]],
//     });

//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         message: "Course not found",
//       });
//     }

//     const courseData = course.toJSON();

//     res.json({
//       success: true,
//       course: {
//         ...courseData,
//         price:
//           courseData.price !== undefined && courseData.price !== null
//             ? Number(courseData.price)
//             : 0,
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
//    Create a new course
// ============================================================ */
// export const createCourse = async (req, res) => {
//   try {
//     const { title, slug, description, teacher_id, price } = req.body;
//     const teacherId = req.user?.id || teacher_id;

//     const course = await Course.create({
//       title,
//       slug,
//       description,
//       teacher_id: teacherId,
//       price,
//     });

//     res.status(201).json({ success: true, course });
//   } catch (error) {
//     console.error("❌ Error creating course:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to create course",
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

//     res.json({ success: true, lessons });
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

//     const course = await Course.findByPk(id);
//     if (!course) {
//       return res.status(404).json({
//         success: false,
//         message: "Course not found",
//       });
//     }

//     if (req.user.role !== "admin" && course.teacher_id !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: "Not authorized to delete this course",
//       });
//     }

//     await course.destroy();
//     res.json({
//       success: true,
//       message: "Course deleted successfully",
//     });
//   } catch (error) {
//     console.error("❌ Error deleting course:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete course",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };





// controllers/courseController.js
import db from "../models/index.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const { Course, Lesson, User } = db;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ============================================================
   Create a new course (with file upload support)
============================================================ */
export const createCourse = async (req, res) => {
  try {
    const { title, slug, description, price } = req.body;
    const teacherId = req.user?.id;

    console.log("📝 Creating course with data:", { title, slug, description, price, teacherId });
    console.log("📁 Uploaded files:", req.files);

    if (!title || !slug) {
      return res.status(400).json({
        success: false,
        error: "Title and slug are required"
      });
    }

    // Handle file uploads
    let thumbnailPath = null;
    let attachmentPaths = [];

    // Process thumbnail if uploaded
    if (req.files && req.files.thumbnail) {
      const thumbnail = req.files.thumbnail[0];
      const uploadsDir = path.join(__dirname, "../Uploads");
      
      // Ensure uploads directory exists
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const thumbnailFilename = `thumbnail-${Date.now()}-${thumbnail.originalname}`;
      thumbnailPath = path.join(uploadsDir, thumbnailFilename);
      
      fs.writeFileSync(thumbnailPath, thumbnail.buffer);
      thumbnailPath = `/Uploads/${thumbnailFilename}`;
    }

    // Process attachments if uploaded
    if (req.files && req.files.attachments) {
      const uploadsDir = path.join(__dirname, "../Uploads");
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      for (const file of req.files.attachments) {
        const filename = `attachment-${Date.now()}-${file.originalname}`;
        const filePath = path.join(uploadsDir, filename);
        
        fs.writeFileSync(filePath, file.buffer);
        attachmentPaths.push(`/Uploads/${filename}`);
      }
    }

    // Create the course
    const course = await Course.create({
      title,
      slug,
      description: description || "",
      teacher_id: teacherId,
      price: price ? parseFloat(price) : 0,
      thumbnail: thumbnailPath,
      // If you have an attachments field in your Course model:
      // attachments: attachmentPaths
    });

    console.log("✅ Course created successfully:", course.id);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        description: course.description,
        price: course.price,
        thumbnail: course.thumbnail,
        teacher_id: course.teacher_id
      }
    });

  } catch (error) {
    console.error("❌ Error creating course:", error);
    
    // Handle duplicate slug error
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: "A course with this slug already exists"
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create course",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

/* ============================================================
   Get course by ID
============================================================ */
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id, {
      attributes: ["id", "title", "description", "price", "thumbnail"],
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const courseData = course.toJSON();
    res.json({
      success: true,
      course: {
        id: courseData.id,
        title: courseData.title,
        description: courseData.description,
        thumbnail: courseData.thumbnail,
        teacher: courseData.teacher,
        price:
          courseData.price !== undefined && courseData.price !== null
            ? Number(courseData.price)
            : 0,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching course by ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/* ============================================================
   Get all courses
============================================================ */
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      attributes: [
        "id",
        "title",
        "slug",
        "description",
        "teacher_id",
        "price",
        "created_at",
        "updated_at",
      ],
      include: [
        {
          model: User,
          as: "teacher",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["id", "ASC"]],
    });

    const formattedCourses = courses.map((course) => {
      const courseData = course.toJSON();
      return {
        ...courseData,
        price:
          courseData.price !== undefined && courseData.price !== null
            ? Number(courseData.price)
            : 0,
      };
    });

    res.json({
      success: true,
      courses: formattedCourses,
    });
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/* ============================================================
   Get public course by slug (with lessons)
============================================================ */
export const getPublicCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const course = await Course.findOne({
      where: { slug },
      attributes: ["id", "title", "slug", "description", "price", "thumbnail"],
      include: [
        { model: Lesson, as: "lessons" },
        { model: User, as: "teacher", attributes: ["id", "name", "email"] },
      ],
      order: [[{ model: Lesson, as: "lessons" }, "order_index", "ASC"]],
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const courseData = course.toJSON();
    res.json({
      success: true,
      course: {
        ...courseData,
        price:
          courseData.price !== undefined && courseData.price !== null
            ? Number(courseData.price)
            : 0,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching course by slug:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/* ============================================================
   Get lessons for a specific course
============================================================ */
export const getLessonsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await Lesson.findAll({
      where: { course_id: courseId },
      order: [["order_index", "ASC"]],
    });

    res.json({ success: true, lessons });
  } catch (error) {
    console.error("❌ Error fetching lessons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lessons",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

/* ============================================================
   Delete course
============================================================ */
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (req.user.role !== "admin" && course.teacher_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this course",
      });
    }

    await course.destroy();
    res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting course:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete course",
      error:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};