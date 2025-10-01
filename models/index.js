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
// import AttachmentModel from "./Attachment.js";
// import LessonCompletionModel from "./LessonCompletion.js"; // ✅ canonical

// // Initialize models
// const User = UserModel(sequelize, DataTypes);
// const Course = CourseModel(sequelize, DataTypes);
// const Lesson = LessonModel(sequelize, DataTypes);
// const Enrollment = EnrollmentModel(sequelize, DataTypes);
// const UserCourseAccess = UserCourseAccessModel(sequelize, DataTypes);
// const Teacher = TeacherModel(sequelize, DataTypes);
// const Attachment = AttachmentModel(sequelize, DataTypes);
// const LessonCompletion = LessonCompletionModel(sequelize, DataTypes);

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
import AttachmentModel from "./Attachment.js";
import LessonCompletionModel from "./LessonCompletion.js";
import LessonProgressModel from "./LessonProgress.js";
import LessonViewModel from "./LessonView.js";

// Initialize models
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

// Associate models (pass all models to each model’s associate method)
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

Object.values(models).forEach((model) => {
  if (model.associate) {
    model.associate(models);
  }
});

// Export both named and default
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

export default {
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
