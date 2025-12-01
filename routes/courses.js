// // routes/courses.js
// import express from "express";
// import {
//   createCourse,
//   getCourses,
//   getPublicCourseBySlug,
//   getLessonsByCourse,
//   deleteCourse,
//   getCourseById,
//   createCourseWithUnits,
//   getTeacherCourses,
// } from "../controllers/courseController.js";

// import authenticateToken from "../middleware/authenticateToken.js";
// import checkTeacherOrAdmin from "../middleware/checkTeacherOrAdmin.js";
// import { isTeacher, isAdmin } from "../middleware/authMiddleware.js";
// import { uploadCourseFiles } from "../middleware/uploadMiddleware.js";
// import db from "../models/index.js";

// const { Course, User, Lesson, Unit } = db;

// const router = express.Router();

// /* ========================================================
//    🟢 PUBLIC ROUTES — accessible without login
// ======================================================== */

// // Get all courses
// router.get("/", getCourses);

// // Get course by ID (public)
// router.get("/id/:id", getCourseById);

// // Get all lessons for a course (public)
// router.get("/:courseId/lessons", getLessonsByCourse);

// // ⭐ PUBLIC: Get first preview lesson with full content
// router.get("/:courseId/preview-lesson", async (req, res) => {
//   try {
//     const { courseId } = req.params;

//     console.log("🔍 Finding preview lesson for course:", courseId);

//     const lesson = await Lesson.findOne({
//       where: { course_id: courseId, is_preview: true },
//       order: [["order_index", "ASC"]],
//       include: [
//         { 
//           model: Course, 
//           as: "course",
//           attributes: ["id", "title", "description", "teacher_id"]
//         }
//       ],
//     });

//     if (!lesson) {
//       console.log("❌ No preview lesson found for course:", courseId);
//       return res.status(404).json({
//         success: false,
//         error: "No preview lesson found for this course",
//       });
//     }

//     // Build absolute URLs
//     const backend = (process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/+$/, "");

//     const clean = (x) => x?.replace(/^Uploads\//, "").replace(/^\/+/, "");

//     const lessonData = lesson.toJSON();
    
//     // Build full URLs for media files
//     if (lessonData.video_url && !lessonData.video_url.startsWith("http")) {
//       lessonData.video_url = `${backend}/api/v1/files/${clean(lessonData.video_url)}`;
//     }

//     if (lessonData.file_url && !lessonData.file_url.startsWith("http")) {
//       lessonData.file_url = `${backend}/api/v1/files/${clean(lessonData.file_url)}`;
//     }

//     console.log("✅ Preview lesson served publicly:", {
//       lessonId: lessonData.id,
//       title: lessonData.title,
//       course: lessonData.course?.title
//     });

//     res.json({
//       success: true,
//       lesson: lessonData,
//       access: "public"
//     });

//   } catch (error) {
//     console.error("❌ Preview lesson error:", error.message);
//     res.status(500).json({
//       success: false,
//       error: "Failed to load preview lesson",
//     });
//   }
// });

// // ⚠ Slug route MUST be last because it catches all dynamic paths
// router.get("/:slug", getPublicCourseBySlug);

// /* ========================================================
//    🔐 PROTECTED ROUTES — teachers / admins only
// ======================================================== */

// router.post(
//   "/",
//   authenticateToken,
//   checkTeacherOrAdmin,
//   uploadCourseFiles,
//   createCourse
// );

// router.post(
//   "/create",
//   authenticateToken,
//   checkTeacherOrAdmin,
//   uploadCourseFiles,
//   createCourse
// );

// router.post(
//   "/create-with-units",
//   authenticateToken,
//   checkTeacherOrAdmin,
//   uploadCourseFiles,
//   createCourseWithUnits
// );

// router.delete("/:id", authenticateToken, deleteCourse);

// /* ============================================================
//    👨🏫 TEACHER DASHBOARD ROUTES
// ============================================================ */

// router.get(
//   "/teacher/my-courses-detailed",
//   authenticateToken,
//   isTeacher,
//   async (req, res) => {
//     try {
//       const teacherId = req.user.id;

//       const courses = await Course.findAll({
//         where: { teacher_id: teacherId },
//         attributes: [
//           "id",
//           "title",
//           "description",
//           "slug",
//           "price",
//           "thumbnail",
//           "created_at",
//         ],
//         include: [
//           {
//             model: Unit,
//             as: "units",
//             attributes: ["id", "title", "description", "order_index"],
//             include: [
//               {
//                 model: Lesson,
//                 as: "lessons",
//                 attributes: [
//                   "id",
//                   "title",
//                   "content",
//                   "video_url",
//                   "file_url",
//                   "order_index",
//                   "content_type",
//                   "is_preview",
//                   "created_at",
//                 ],
//                 order: [["order_index", "ASC"]],
//               },
//             ],
//             order: [["order_index", "ASC"]],
//           },
//           {
//             model: User,
//             as: "teacher",
//             attributes: ["id", "name", "email"],
//           },
//         ],
//         order: [["created_at", "DESC"]],
//       });

//       res.json({ success: true, courses });
//     } catch (error) {
//       console.error("❌ Error fetching teacher courses:", error);
//       res.status(500).json({
//         success: false,
//         error: "Failed to fetch courses",
//       });
//     }
//   }
// );

// router.get(
//   "/teacher/my-courses",
//   authenticateToken,
//   isTeacher,
//   getTeacherCourses
// );

// router.get(
//   "/teacher/:courseId/full",
//   authenticateToken,
//   isTeacher,
//   async (req, res) => {
//     try {
//       const { courseId } = req.params;
//       const teacherId = req.user.id;

//       const course = await Course.findOne({
//         where: { id: courseId, teacher_id: teacherId },
//         attributes: [
//           "id",
//           "title",
//           "description",
//           "slug",
//           "price",
//           "thumbnail",
//           "created_at",
//         ],
//         include: [
//           {
//             model: Unit,
//             as: "units",
//             attributes: ["id", "title", "description", "order_index"],
//             include: [
//               {
//                 model: Lesson,
//                 as: "lessons",
//                 attributes: [
//                   "id",
//                   "title",
//                   "content",
//                   "video_url",
//                   "file_url",
//                   "order_index",
//                   "content_type",
//                   "is_preview",
//                   "created_at",
//                 ],
//                 order: [["order_index", "ASC"]],
//               },
//             ],
//             order: [["order_index", "ASC"]],
//           },
//         ],
//       });

//       if (!course) {
//         return res.status(404).json({
//           success: false,
//           error: "Course not found or access denied",
//         });
//       }

//       res.json({ success: true, course });
//     } catch (error) {
//       console.error("❌ Error:", error);
//       res.status(500).json({
//         success: false,
//         error: "Failed to fetch course",
//       });
//     }
//   }
// );

// export default router;



// src/pages/courses/Courses.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import "./Courses.css";

const CourseSkeleton = () => (
  <div className="course-item skeleton">
    <div className="skeleton-title"></div>
    <div className="skeleton-text short"></div>
    <div className="skeleton-text long"></div>
    <div className="skeleton-btn"></div>
  </div>
);

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseSlug, setSelectedCourseSlug] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const { user } = useAuth();
  
  const fromPayment = location.state?.fromPayment || searchParams.get('fromPayment') === 'true';

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axiosInstance.get("/courses");
      const data = res.data.courses || res.data;
      setCourses(data);
    } catch (err) {
      console.error("Failed to load courses:", err);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleViewCurriculum = (slug) => {
    setSelectedCourseSlug(slug);
  };

  const handleEnrollNow = (id) => {
    if (!user) {
      navigate("/login", { state: { from: `/courses` } });
      return;
    }
    navigate(`/payment/${id}`);
  };

  const handleCourseClick = (slug) => {
    navigate(`/courses/${slug}`);
  };

  // ✅ FIXED: Improved Free Preview handler
  const handleFreePreview = async (courseId) => {
    try {
      console.log(`Fetching preview for course ID: ${courseId}`);
      
      // Try the course preview endpoint first
      const response = await axiosInstance.get(`/courses/${courseId}/preview-lesson`);
      
      console.log("Preview API Response:", response.data);
      
      if (response.data.success && response.data.lesson) {
        // Navigate to the preview lesson page
        navigate(`/preview/${response.data.lesson.id}`, { 
          state: { 
            lesson: response.data.lesson,
            courseId: courseId 
          } 
        });
      } else if (response.data.error === "No preview lesson found for this course") {
        // Try alternative: Get first lesson of the course
        const lessonsResponse = await axiosInstance.get(`/courses/${courseId}/lessons`);
        
        if (lessonsResponse.data.success && lessonsResponse.data.lessons.length > 0) {
          const firstLesson = lessonsResponse.data.lessons[0];
          navigate(`/preview/${firstLesson.id}`, { 
            state: { 
              lesson: firstLesson,
              courseId: courseId 
            } 
          });
        } else {
          toast.error("This course doesn't have any preview content yet.");
        }
      } else {
        toast.error("Preview unavailable for this course.");
      }
    } catch (error) {
      console.error("Preview error details:", error);
      
      // If the API endpoint doesn't exist, show a generic message
      if (error.response?.status === 404) {
        toast.error("Preview feature is not configured. Please contact support.");
      } else {
        toast.error("Unable to load preview. Please try again later.");
      }
    }
  };

  if (loading) {
    return (
      <div className="courses">
        {fromPayment && (
          <div className="payment-success-navigation">
            <div className="success-banner">
              <h3>🎉 Payment Successful!</h3>
              <p>Your enrollment is pending admin approval.</p>
            </div>
            <div className="navigation-buttons">
              <button onClick={() => navigate('/')} className="nav-btn home-btn">
                ← Return to Home
              </button>
              <button onClick={() => navigate('/my-courses')} className="nav-btn courses-btn">
                View My Courses
              </button>
            </div>
          </div>
        )}

        <h1>Available Courses</h1>
        <div className="course-list">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <CourseSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!courses.length) {
    return (
      <div className="courses">
        {fromPayment && (
          <div className="payment-success-navigation">
            <div className="success-banner">
              <h3>🎉 Payment Successful!</h3>
              <p>Your enrollment is pending admin approval.</p>
            </div>
            <div className="navigation-buttons">
              <button onClick={() => navigate('/')} className="nav-btn home-btn">
                ← Return to Home
              </button>
              <button onClick={() => navigate('/my-courses')} className="nav-btn courses-btn">
                View My Courses
              </button>
            </div>
          </div>
        )}
        <div className="error">No courses available</div>
      </div>
    );
  }

  return (
    <div className="courses">
      {fromPayment && (
        <div className="payment-success-navigation">
          <div className="success-banner">
            <h3>🎉 Payment Successful!</h3>
            <p>Your enrollment is pending admin approval.</p>
          </div>
          <div className="navigation-buttons">
            <button onClick={() => navigate('/')} className="nav-btn home-btn">
              ← Return to Home
            </button>
            <button onClick={() => navigate('/my-courses')} className="nav-btn courses-btn">
              View My Courses
            </button>
          </div>
        </div>
      )}

      <h1>Available Courses</h1>
      <p className="courses-subtitle">Browse all available math courses</p>
      
      <div className="course-list">
        {courses.map((course) => (
          <div key={course.id || course._id} className="course-item">
            <div className="course-header" onClick={() => handleCourseClick(course.slug)}>
              <h2>{course.title}</h2>
              <p className="course-description">{course.description}</p>
            </div>
            
            <div className="course-details">
              <p className="course-price">
                Price: ${parseFloat(course.price || 0).toFixed(2)}
              </p>
              {course.teacher && (
                <p className="course-teacher">
                  Instructor: {course.teacher.name}
                </p>
              )}
            </div>

            <div className="course-actions">
              <button
                className="btn-enroll"
                onClick={() => handleEnrollNow(course.id || course._id)}
              >
                Enroll Now - ${parseFloat(course.price || 0).toFixed(2)}
              </button>

              <button
                className="btn-preview"
                onClick={() => handleFreePreview(course.id)}
              >
                Free Preview
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;