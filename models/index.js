// // models/index.js
// import { Sequelize, DataTypes } from "sequelize";
// import sequelize from "../config/db.js";

// // ============================
// // Import Model Definitions
// // ============================
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
// import PaymentModel from "./Payment.js";


// // ============================
// // Initialize Models
// // ============================
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
// const Payment = PaymentModel(sequelize, DataTypes);


// // ============================
// // Define Associations 👇
// // ============================

// // 👨‍🏫 User ↔ Course (Teacher teaches many courses)
// User.hasMany(Course, { foreignKey: "teacher_id", as: "courses" });
// Course.belongsTo(User, { foreignKey: "teacher_id", as: "teacher" });

// // 📘 Course ↔ Lesson (A course has many lessons)
// Course.hasMany(Lesson, { foreignKey: "course_id", as: "lessons" });
// Lesson.belongsTo(Course, { foreignKey: "course_id", as: "course" });

// // 🧑‍🎓 User ↔ Enrollment ↔ Course (Student enrolls in courses)
// User.hasMany(Enrollment, { foreignKey: "user_id", as: "enrollments" });
// Enrollment.belongsTo(User, { foreignKey: "user_id", as: "student" });

// Course.hasMany(Enrollment, { foreignKey: "course_id", as: "enrollments" });
// Enrollment.belongsTo(Course, { foreignKey: "course_id", as: "course" });

// // 📎 Lesson ↔ Attachment (if applicable)
// Lesson.hasMany(Attachment, { foreignKey: "lesson_id", as: "attachments" });
// Attachment.belongsTo(Lesson, { foreignKey: "lesson_id", as: "lesson" });

// // 📝 Lesson ↔ Completion
// Lesson.hasMany(LessonCompletion, { foreignKey: "lesson_id", as: "completions" });
// LessonCompletion.belongsTo(Lesson, { foreignKey: "lesson_id", as: "lesson" });

// // 📊 Optional: Lesson View Tracking
// Lesson.hasMany(LessonView, { foreignKey: "lesson_id", as: "views" });
// LessonView.belongsTo(Lesson, { foreignKey: "lesson_id", as: "lesson" });

// // 🧭 If you need: User ↔ LessonProgress (Progress tracking)
// User.hasMany(LessonProgress, { foreignKey: "user_id", as: "lessonProgress" });
// LessonProgress.belongsTo(User, { foreignKey: "user_id", as: "studentProgress" });
// User.hasMany(Payment, { foreignKey: "user_id", as: "payments" });
// Course.hasMany(Payment, { foreignKey: "course_id", as: "payments" });
// Payment.belongsTo(User, { foreignKey: "user_id", as: "user" });
// Payment.belongsTo(Course, { foreignKey: "course_id", as: "course" });

// // ============================
// // Collect Models
// // ============================
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
//   Payment,
// };

// // ============================
// // Optional: Log in Dev
// // ============================
// if (process.env.NODE_ENV === "development") {
//   console.log("✅ Models initialized and associations configured");
// }

// // ============================
// // Export
// // ============================
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
//   Payment,
// };

// export default models;



import { Sequelize } from "sequelize";
import config from "../config/config.js";

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

// Create sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging || false,
  }
);

const db = {
  sequelize,
  Sequelize,
};

// Import models
import Course from "./Course.js";
import Unit from "./Unit.js";
import Lesson from "./Lesson.js";
import User from "./User.js"; // Make sure you have this

// Initialize models
db.Course = Course;
db.Unit = Unit;
db.Lesson = Lesson;
db.User = User;

// Associations
Course.hasMany(Unit, {
  foreignKey: "course_id",
  as: "units",
  onDelete: "CASCADE",
});

Course.hasMany(Lesson, {
  foreignKey: "course_id",
  as: "lessons",
  onDelete: "CASCADE",
});

Unit.belongsTo(Course, {
  foreignKey: "course_id",
  as: "course",
});

Unit.hasMany(Lesson, {
  foreignKey: "unit_id",
  as: "lessons",
  onDelete: "CASCADE",
});

Lesson.belongsTo(Course, {
  foreignKey: "course_id",
  as: "course",
});

Lesson.belongsTo(Unit, {
  foreignKey: "unit_id",
  as: "unit",
});

// Export both default and named exports
export { sequelize, Course, Unit, Lesson, User };
export default db;