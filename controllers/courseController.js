// // controllers/courseController.js
// import db from "../models/index.js";
// import path from "path";
// import { fileURLToPath } from "url";
// import fs from "fs";

// const { Course, Lesson, User } = db;

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// /* ============================================================
//    Create a new course (with file upload support) - SIMPLE CREATION
// ============================================================ */
// export const createCourse = async (req, res) => {
//   try {
//     // Log the incoming request for debugging
//     console.log("📝 Request body:", req.body);
//     console.log("📁 Uploaded files:", req.files);
//     console.log("👤 User:", req.user);

//     // Extract form data - handle both JSON and form-data
//     const { 
//       title, 
//       slug, 
//       description, 
//       price,
//       teacher_id 
//     } = req.body;

//     const teacherId = req.user?.id || teacher_id;

//     // Validate required fields
//     if (!title || !slug) {
//       console.log("❌ Missing required fields:", { title, slug });
//       return res.status(400).json({
//         success: false,
//         error: "Title and slug are required",
//         received: { title, slug, description, price, teacherId }
//       });
//     }

//     // Handle file uploads
//     let thumbnailPath = null;
//     let attachmentPaths = [];

//     // Ensure Uploads directory exists
//     const uploadsDir = path.join(__dirname, "../Uploads");
//     if (!fs.existsSync(uploadsDir)) {
//       fs.mkdirSync(uploadsDir, { recursive: true });
//       console.log("✅ Created Uploads directory");
//     }

//     // Process thumbnail if uploaded
//     if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
//       const thumbnail = req.files.thumbnail[0];
//       const thumbnailFilename = `thumbnail-${Date.now()}-${thumbnail.originalname.replace(/\s+/g, '-')}`;
//       const thumbnailFullPath = path.join(uploadsDir, thumbnailFilename);
      
//       fs.writeFileSync(thumbnailFullPath, thumbnail.buffer);
//       thumbnailPath = `/Uploads/${thumbnailFilename}`;
//       console.log("✅ Thumbnail saved:", thumbnailPath);
//     }

//     // Process attachments if uploaded
//     if (req.files && req.files.attachments) {
//       for (const file of req.files.attachments) {
//         const filename = `attachment-${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
//         const filePath = path.join(uploadsDir, filename);
        
//         fs.writeFileSync(filePath, file.buffer);
//         attachmentPaths.push(`/Uploads/${filename}`);
//       }
//       console.log("✅ Attachments saved:", attachmentPaths.length);
//     }

//     // Check if course with same slug already exists
//     const existingCourse = await Course.findOne({ where: { slug } });
//     if (existingCourse) {
//       return res.status(400).json({
//         success: false,
//         error: "A course with this slug already exists"
//       });
//     }

//     // Create the course
//     const courseData = {
//       title: title.trim(),
//       slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
//       description: (description || "").trim(),
//       teacher_id: teacherId,
//       price: price ? parseFloat(price) : 0,
//       thumbnail: thumbnailPath
//     };

//     console.log("📊 Creating course with data:", courseData);

//     const course = await Course.create(courseData);

//     console.log("✅ Course created successfully:", course.id);

//     res.status(201).json({
//       success: true,
//       message: "Course created successfully",
//       course: {
//         id: course.id,
//         title: course.title,
//         slug: course.slug,
//         description: course.description,
//         price: course.price,
//         thumbnail: course.thumbnail,
//         teacher_id: course.teacher_id,
//         created_at: course.created_at
//       }
//     });

//   } catch (error) {
//     console.error("❌ Error creating course:", error);
    
//     // Handle specific errors
//     if (error.name === 'SequelizeUniqueConstraintError') {
//       return res.status(400).json({
//         success: false,
//         error: "A course with this slug already exists"
//       });
//     }

//     if (error.name === 'SequelizeValidationError') {
//       const errors = error.errors.map(err => err.message);
//       return res.status(400).json({
//         success: false,
//         error: "Validation failed",
//         details: errors
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: "Failed to create course",
//       details: process.env.NODE_ENV === "development" ? error.message : undefined
//     });
//   }
// };

// /* ============================================================
//    Create a new course with units and lessons - ADVANCED CREATION
// ============================================================ */
// export const createCourseWithUnits = async (req, res) => {
//   try {
//     console.log("🎯 Advanced course creation requested");
//     console.log("📝 Request body:", req.body);
//     console.log("📁 Uploaded files:", req.files);
//     console.log("👤 User:", req.user);

//     // Extract form data
//     const { 
//       title, 
//       slug, 
//       description, 
//       price,
//       teacher_id,
//       units = [] // Array of units with lessons
//     } = req.body;

//     const teacherId = req.user?.id || teacher_id;

//     // Validate required fields
//     if (!title || !slug) {
//       return res.status(400).json({
//         success: false,
//         error: "Title and slug are required"
//       });
//     }

//     // Handle file uploads
//     let thumbnailPath = null;

//     // Ensure Uploads directory exists
//     const uploadsDir = path.join(__dirname, "../Uploads");
//     if (!fs.existsSync(uploadsDir)) {
//       fs.mkdirSync(uploadsDir, { recursive: true });
//     }

//     // Process thumbnail if uploaded
//     if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
//       const thumbnail = req.files.thumbnail[0];
//       const thumbnailFilename = `thumbnail-${Date.now()}-${thumbnail.originalname.replace(/\s+/g, '-')}`;
//       const thumbnailFullPath = path.join(uploadsDir, thumbnailFilename);
      
//       fs.writeFileSync(thumbnailFullPath, thumbnail.buffer);
//       thumbnailPath = `/Uploads/${thumbnailFilename}`;
//       console.log("✅ Thumbnail saved:", thumbnailPath);
//     }

//     // Check if course with same slug already exists
//     const existingCourse = await Course.findOne({ where: { slug } });
//     if (existingCourse) {
//       return res.status(400).json({
//         success: false,
//         error: "A course with this slug already exists"
//       });
//     }

//     // Create the course
//     const courseData = {
//       title: title.trim(),
//       slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
//       description: (description || "").trim(),
//       teacher_id: teacherId,
//       price: price ? parseFloat(price) : 0,
//       thumbnail: thumbnailPath
//     };

//     console.log("📊 Creating advanced course with data:", courseData);

//     const course = await Course.create(courseData);
//     console.log("✅ Course created successfully:", course.id);

//     // Create units and lessons if provided
//     let createdUnits = [];
//     let createdLessons = [];

//     if (units && Array.isArray(units) && units.length > 0) {
//       console.log(`📚 Creating ${units.length} units with lessons...`);

//       for (const unit of units) {
//         if (unit.title && unit.lessons && Array.isArray(unit.lessons)) {
//           // Create unit header as a lesson with special type
//           const unitLesson = await Lesson.create({
//             course_id: course.id,
//             title: unit.title,
//             content: unit.description || '',
//             order_index: unit.order_index || 0,
//             content_type: 'unit_header',
//             is_preview: false
//           });
//           createdUnits.push(unitLesson);

//           // Create lessons for this unit
//           for (const lessonData of unit.lessons) {
//             if (lessonData.title) {
//               const lesson = await Lesson.create({
//                 course_id: course.id,
//                 title: lessonData.title,
//                 content: lessonData.content || '',
//                 video_url: lessonData.video_url || null,
//                 order_index: lessonData.order_index || 0,
//                 content_type: lessonData.content_type || 'text',
//                 is_preview: lessonData.is_preview || false
//               });
//               createdLessons.push(lesson);
//             }
//           }
//         }
//       }

//       console.log(`✅ Created ${createdUnits.length} units and ${createdLessons.length} lessons`);
//     }

//     res.status(201).json({
//       success: true,
//       message: "Course created successfully with structure",
//       course: {
//         id: course.id,
//         title: course.title,
//         slug: course.slug,
//         description: course.description,
//         price: course.price,
//         thumbnail: course.thumbnail,
//         teacher_id: course.teacher_id,
//         created_at: course.created_at
//       },
//       structure: {
//         units: createdUnits.length,
//         lessons: createdLessons.length
//       }
//     });

//   } catch (error) {
//     console.error("❌ Error creating advanced course:", error);
    
//     // Handle specific errors
//     if (error.name === 'SequelizeUniqueConstraintError') {
//       return res.status(400).json({
//         success: false,
//         error: "A course with this slug already exists"
//       });
//     }

//     if (error.name === 'SequelizeValidationError') {
//       const errors = error.errors.map(err => err.message);
//       return res.status(400).json({
//         success: false,
//         error: "Validation failed",
//         details: errors
//       });
//     }

//     res.status(500).json({
//       success: false,
//       error: "Failed to create course",
//       details: process.env.NODE_ENV === "development" ? error.message : undefined
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
//       error:
//         process.env.NODE_ENV === "development" ? error.message : undefined,
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
//       error:
//         process.env.NODE_ENV === "development" ? error.message : undefined,
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
//       error:
//         process.env.NODE_ENV === "development" ? error.message : undefined,
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
//       error:
//         process.env.NODE_ENV === "development" ? error.message : undefined,
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
//       error:
//         process.env.NODE_ENV === "development" ? error.message : undefined,
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

// ✅ FIXED: Helper function to build full URLs for course files
const buildCourseFileUrls = (course) => {
  const courseData = course.toJSON ? course.toJSON() : { ...course };
  
  if (courseData.thumbnail && !courseData.thumbnail.startsWith('http')) {
    courseData.thumbnail = `${process.env.BACKEND_URL || 'http://localhost:3000'}${courseData.thumbnail}`;
  }
  
  return courseData;
};

/* ============================================================
   Create a new course (with file upload support) - SIMPLE CREATION
============================================================ */
export const createCourse = async (req, res) => {
  try {
    console.log("📝 Request body:", req.body);
    console.log("📁 Uploaded files:", req.files);
    console.log("👤 User:", req.user);

    const { title, slug, description, price, teacher_id } = req.body;
    const teacherId = req.user?.id || teacher_id;

    // Validate required fields
    if (!title || !slug) {
      console.log("❌ Missing required fields:", { title, slug });
      return res.status(400).json({
        success: false,
        error: "Title and slug are required",
        received: { title, slug, description, price, teacherId }
      });
    }

    // ✅ FIXED: Handle file uploads with proper path
    let thumbnailPath = null;
    const uploadsDir = path.join(__dirname, "../Uploads");

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log("✅ Created Uploads directory");
    }

    // Process thumbnail if uploaded
    if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
      const thumbnail = req.files.thumbnail[0];
      const thumbnailFilename = `thumbnail-${Date.now()}-${thumbnail.originalname.replace(/\s+/g, '-')}`;
      const thumbnailFullPath = path.join(uploadsDir, thumbnailFilename);
      
      fs.writeFileSync(thumbnailFullPath, thumbnail.buffer);
      thumbnailPath = `/Uploads/${thumbnailFilename}`;
      console.log("✅ Thumbnail saved:", thumbnailPath);
    }

    // Check if course with same slug already exists
    const existingCourse = await Course.findOne({ where: { slug } });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        error: "A course with this slug already exists"
      });
    }

    // Create the course
    const courseData = {
      title: title.trim(),
      slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
      description: (description || "").trim(),
      teacher_id: teacherId,
      price: price ? parseFloat(price) : 0,
      thumbnail: thumbnailPath
    };

    console.log("📊 Creating course with data:", courseData);

    const course = await Course.create(courseData);

    console.log("✅ Course created successfully:", course.id);

    // ✅ FIXED: Build response with full URLs
    const courseResponse = buildCourseFileUrls(course);

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course: {
        id: courseResponse.id,
        title: courseResponse.title,
        slug: courseResponse.slug,
        description: courseResponse.description,
        price: courseResponse.price,
        thumbnail: courseResponse.thumbnail,
        teacher_id: courseResponse.teacher_id,
        created_at: courseResponse.created_at
      }
    });

  } catch (error) {
    console.error("❌ Error creating course:", error);
    
    // Handle specific errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: "A course with this slug already exists"
      });
    }

    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors
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
   Create a new course with units and lessons - ADVANCED CREATION
============================================================ */
export const createCourseWithUnits = async (req, res) => {
  try {
    console.log("🎯 Advanced course creation requested");
    console.log("📝 Request body:", req.body);
    console.log("📁 Uploaded files:", req.files);
    console.log("👤 User:", req.user);

    // Extract form data
    const { 
      title, 
      slug, 
      description, 
      price,
      teacher_id,
      units = [] // Array of units with lessons
    } = req.body;

    const teacherId = req.user?.id || teacher_id;

    // Validate required fields
    if (!title || !slug) {
      return res.status(400).json({
        success: false,
        error: "Title and slug are required"
      });
    }

    // ✅ FIXED: Handle file uploads with proper path
    let thumbnailPath = null;
    const uploadsDir = path.join(__dirname, "../Uploads");

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log("✅ Created Uploads directory");
    }

    // Process thumbnail if uploaded
    if (req.files && req.files.thumbnail && req.files.thumbnail[0]) {
      const thumbnail = req.files.thumbnail[0];
      const thumbnailFilename = `thumbnail-${Date.now()}-${thumbnail.originalname.replace(/\s+/g, '-')}`;
      const thumbnailFullPath = path.join(uploadsDir, thumbnailFilename);
      
      fs.writeFileSync(thumbnailFullPath, thumbnail.buffer);
      thumbnailPath = `/Uploads/${thumbnailFilename}`;
      console.log("✅ Thumbnail saved:", thumbnailPath);
    }

    // Check if course with same slug already exists
    const existingCourse = await Course.findOne({ where: { slug } });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        error: "A course with this slug already exists"
      });
    }

    // Create the course
    const courseData = {
      title: title.trim(),
      slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
      description: (description || "").trim(),
      teacher_id: teacherId,
      price: price ? parseFloat(price) : 0,
      thumbnail: thumbnailPath
    };

    console.log("📊 Creating advanced course with data:", courseData);

    const course = await Course.create(courseData);
    console.log("✅ Course created successfully:", course.id);

    // Create units and lessons if provided
    let createdUnits = [];
    let createdLessons = [];

    if (units && Array.isArray(units) && units.length > 0) {
      console.log(`📚 Creating ${units.length} units with lessons...`);

      for (const unit of units) {
        if (unit.title && unit.lessons && Array.isArray(unit.lessons)) {
          // Create unit header as a lesson with special type
          const unitLesson = await Lesson.create({
            course_id: course.id,
            title: unit.title,
            content: unit.description || '',
            order_index: unit.order_index || 0,
            content_type: 'unit_header',
            is_preview: false
          });
          createdUnits.push(unitLesson);

          // Create lessons for this unit
          for (const lessonData of unit.lessons) {
            if (lessonData.title) {
              const lesson = await Lesson.create({
                course_id: course.id,
                title: lessonData.title,
                content: lessonData.content || '',
                video_url: lessonData.video_url || null,
                order_index: lessonData.order_index || 0,
                content_type: lessonData.content_type || 'text',
                is_preview: lessonData.is_preview || false
              });
              createdLessons.push(lesson);
            }
          }
        }
      }

      console.log(`✅ Created ${createdUnits.length} units and ${createdLessons.length} lessons`);
    }

    // ✅ FIXED: Build response with full URLs
    const courseResponse = buildCourseFileUrls(course);

    res.status(201).json({
      success: true,
      message: "Course created successfully with structure",
      course: {
        id: courseResponse.id,
        title: courseResponse.title,
        slug: courseResponse.slug,
        description: courseResponse.description,
        price: courseResponse.price,
        thumbnail: courseResponse.thumbnail,
        teacher_id: courseResponse.teacher_id,
        created_at: courseResponse.created_at
      },
      structure: {
        units: createdUnits.length,
        lessons: createdLessons.length
      }
    });

  } catch (error) {
    console.error("❌ Error creating advanced course:", error);
    
    // Handle specific errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: "A course with this slug already exists"
      });
    }

    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors
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

    // ✅ FIXED: Build full URLs for course
    const courseData = buildCourseFileUrls(course);
    
    res.json({
      success: true,
      course: {
        id: courseData.id,
        title: courseData.title,
        description: courseData.description,
        thumbnail: courseData.thumbnail,
        teacher: courseData.teacher,
        price: courseData.price !== undefined && courseData.price !== null
          ? Number(courseData.price)
          : 0,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching course by ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
        "thumbnail",
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

    // ✅ FIXED: Build full URLs for all courses
    const formattedCourses = courses.map((course) => {
      const courseData = buildCourseFileUrls(course);
      return {
        ...courseData,
        price: courseData.price !== undefined && courseData.price !== null
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
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
        { 
          model: Lesson, 
          as: "lessons",
          attributes: ["id", "title", "content", "video_url", "file_url", "order_index", "content_type", "is_preview"]
        },
        { 
          model: User, 
          as: "teacher", 
          attributes: ["id", "name", "email"] 
        },
      ],
      order: [[{ model: Lesson, as: "lessons" }, "order_index", "ASC"]],
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // ✅ FIXED: Build full URLs for course and lessons
    const courseData = buildCourseFileUrls(course);
    
    // Build URLs for lessons too
    if (courseData.lessons && Array.isArray(courseData.lessons)) {
      courseData.lessons = courseData.lessons.map(lesson => {
        const lessonData = { ...lesson };
        if (lessonData.video_url && !lessonData.video_url.startsWith('http')) {
          lessonData.video_url = `${process.env.BACKEND_URL || 'http://localhost:3000'}${lessonData.video_url}`;
        }
        if (lessonData.file_url && !lessonData.file_url.startsWith('http')) {
          lessonData.file_url = `${process.env.BACKEND_URL || 'http://localhost:3000'}${lessonData.file_url}`;
        }
        return lessonData;
      });
    }

    res.json({
      success: true,
      course: {
        ...courseData,
        price: courseData.price !== undefined && courseData.price !== null
          ? Number(courseData.price)
          : 0,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching course by slug:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch course",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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

    // ✅ FIXED: Build full URLs for lessons
    const lessonsWithUrls = lessons.map(lesson => {
      const lessonData = lesson.toJSON ? lesson.toJSON() : { ...lesson };
      
      if (lessonData.video_url && !lessonData.video_url.startsWith('http')) {
        lessonData.video_url = `${process.env.BACKEND_URL || 'http://localhost:3000'}${lessonData.video_url}`;
      }
      
      if (lessonData.file_url && !lessonData.file_url.startsWith('http')) {
        lessonData.file_url = `${process.env.BACKEND_URL || 'http://localhost:3000'}${lessonData.file_url}`;
      }
      
      return lessonData;
    });

    res.json({ 
      success: true, 
      lessons: lessonsWithUrls 
    });
  } catch (error) {
    console.error("❌ Error fetching lessons:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch lessons",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
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
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};