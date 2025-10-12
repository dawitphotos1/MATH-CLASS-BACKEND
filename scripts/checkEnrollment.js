// // scripts/checkEnrollment.js
// import db from "../models/index.js";

// const { Enrollment, UserCourseAccess } = db;

// const checkEnrollment = async () => {
//   try {
//     const enrollments = await Enrollment.findAll({
//       limit: 5,
//       order: [["createdAt", "DESC"]],
//     });

//     console.log(
//       "Recent enrollments:",
//       enrollments.map((e) => ({
//         id: e.id,
//         user_id: e.user_id,
//         course_id: e.course_id,
//         approval_status: e.approval_status,
//         payment_status: e.payment_status,
//         createdAt: e.createdAt,
//       }))
//     );

//     const accessRecords = await UserCourseAccess.findAll({
//       limit: 5,
//       order: [["createdAt", "DESC"]],
//     });

//     console.log(
//       "Recent UserCourseAccess:",
//       accessRecords.map((a) => ({
//         id: a.id,
//         user_id: a.user_id,
//         course_id: a.course_id,
//         approval_status: a.approval_status,
//         payment_status: a.payment_status,
//         createdAt: a.createdAt,
//       }))
//     );
//   } catch (error) {
//     console.error("Error:", error);
//   }
// };

// checkEnrollment();




// scripts/checkEnrollment.js
import db from "../models/index.js";

const { Enrollment, UserCourseAccess } = db;

const checkEnrollment = async () => {
  try {
    const enrollments = await Enrollment.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']]
    });
    
    console.log('Recent enrollments:', enrollments.map(e => ({
      id: e.id,
      user_id: e.user_id,
      course_id: e.course_id,
      approval_status: e.approval_status,
      payment_status: e.payment_status,
      createdAt: e.createdAt
    })));

    const accessRecords = await UserCourseAccess.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']]
    });

    console.log('Recent UserCourseAccess:', accessRecords.map(a => ({
      id: a.id,
      user_id: a.user_id,
      course_id: a.course_id,
      approval_status: a.approval_status,
      payment_status: a.payment_status,
      createdAt: a.createdAt
    })));
  } catch (error) {
    console.error('Error:', error);
  }
};

checkEnrollment();