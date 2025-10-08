
// // models/index.js
// import { Sequelize, DataTypes } from "sequelize";
// import sequelize from "../config/db.js";

// // Import model definition functions
// import UserModel from "./User.js";
// import CourseModel from "./Course.js";
// import LessonModel from "./Lesson.js";
// import EnrollmentModel from "./Enrollment.js";
// import UserCourseAccessModel from "./UserCourseAccess.js";
// import TeacherModel from "./Teacher.js";
// import AttachmentModel from "./attachment.js";
// import LessonCompletionModel from "./lessoncompletion.js";
// import LessonProgressModel from "./lessonProgress.js";
// import LessonViewModel from "./LessonView.js";

// // Initialize models
// const User = UserModel(sequelize, DataTypes);
// const Course = CourseModel(sequelize, DataTypes);
// const Lesson = LessonModel(sequelize, DataTypes);
// const Enrollment = EnrollmentModel(sequelize, DataTypes);
// const UserCourseAccess = UserCourseAccessModel(sequelize, DataTypes);
// const Teacher = TeacherModel(sequelize, DataTypes);
// const Attachment = AttachmentModel(sequelize, DataTypes);
// const LessonCompletion = LessonCompletionModel(sequelize, DataTypes);
// const LessonProgress = LessonProgressModel(sequelize, DataTypes);
// const LessonView = LessonViewModel(sequelize, DataTypes);

// // Associate models (pass all models to each model’s associate method)
// const models = {
//   User,
//   Course,
//   Lesson,
//   Enrollment,
//   UserCourseAccess,
//   Teacher,
//   Attachment,
//   LessonCompletion,
//   LessonProgress,
//   LessonView,
// };

// Object.values(models).forEach((model) => {
//   if (model.associate) {
//     model.associate(models);
//   }
// });

// // Export both named and default
// export {
//   sequelize,
//   User,
//   Course,
//   Lesson,
//   Enrollment,
//   UserCourseAccess,
//   Teacher,
//   Attachment,
//   LessonCompletion,
//   LessonProgress,
//   LessonView,
// };

// export default {
//   sequelize,
//   User,
//   Course,
//   Lesson,
//   Enrollment,
//   UserCourseAccess,
//   Teacher,
//   Attachment,
//   LessonCompletion,
//   LessonProgress,
//   LessonView,
// };





// models/index.js
import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// Import model definition functions
import UserModel from "./User.js";
import CourseModel from "./Course.js";
import LessonModel from "./Lesson.js";
import EnrollmentModel from "./Enrollment.js";
import UserCourseAccessModel from "./UserCourseAccess.js";
import TeacherModel from "./Teacher.js";
import AttachmentModel from "./attachment.js";
import LessonCompletionModel from "./lessoncompletion.js";
import LessonProgressModel from "./lessonProgress.js";
import LessonViewModel from "./LessonView.js";

// ============================
// Initialize Models
// ============================
const User = UserModel(sequelize, DataTypes);
const Course = CourseModel(sequelize, DataTypes);
const Lesson = LessonModel(sequelize, DataTypes);
const Enrollment = EnrollmentModel(sequelize, DataTypes);
const UserCourseAccess = UserCourseAccessModel(sequelize, DataTypes);
const Teacher = TeacherModel(sequelize, DataTypes);
const Attachment = AttachmentModel(sequelize, DataTypes);
const LessonCompletion = LessonCompletionModel(sequelize, DataTypes);
const LessonProgress = LessonProgressModel(sequelize, DataTypes);
const LessonView = LessonViewModel(sequelize, DataTypes);

// ============================
// Model Collection
// ============================
const models = {
  User,
  Course,
  Lesson,
  Enrollment,
  UserCourseAccess,
  Teacher,
  Attachment,
  LessonCompletion,
  LessonProgress,
  LessonView,
};

// ============================
// Define Associations
// ============================
// Automatically call `associate(models)` if defined in each model
Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

// ============================
// Optional: Log associations in dev mode
// ============================
if (process.env.NODE_ENV === "development") {
  console.log("✅ Models initialized and associations configured");
}

// ============================
// Exports
// ============================
export {
  sequelize,
  User,
  Course,
  Lesson,
  Enrollment,
  UserCourseAccess,
  Teacher,
  Attachment,
  LessonCompletion,
  LessonProgress,
  LessonView,
};

export default models;
