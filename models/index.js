// models/index.js
import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../config/db.js";

// ============================
// Import Model Definitions
// ============================
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
// Define Associations 👇
// ============================

// 👨‍🏫 User ↔ Course (Teacher teaches many courses)
User.hasMany(Course, { foreignKey: "teacher_id", as: "courses" });
Course.belongsTo(User, { foreignKey: "teacher_id", as: "teacher" });

// 📘 Course ↔ Lesson (A course has many lessons)
Course.hasMany(Lesson, { foreignKey: "course_id", as: "lessons" });
Lesson.belongsTo(Course, { foreignKey: "course_id", as: "course" });

// 🧑‍🎓 User ↔ Enrollment ↔ Course (Student enrolls in courses)
User.hasMany(Enrollment, { foreignKey: "user_id", as: "enrollments" });
Enrollment.belongsTo(User, { foreignKey: "user_id", as: "student" });

Course.hasMany(Enrollment, { foreignKey: "course_id", as: "enrollments" });
Enrollment.belongsTo(Course, { foreignKey: "course_id", as: "course" });

// 📎 Lesson ↔ Attachment (if applicable)
Lesson.hasMany(Attachment, { foreignKey: "lesson_id", as: "attachments" });
Attachment.belongsTo(Lesson, { foreignKey: "lesson_id", as: "lesson" });

// 📝 Lesson ↔ Completion
Lesson.hasMany(LessonCompletion, { foreignKey: "lesson_id", as: "completions" });
LessonCompletion.belongsTo(Lesson, { foreignKey: "lesson_id", as: "lesson" });

// 📊 Optional: Lesson View Tracking
Lesson.hasMany(LessonView, { foreignKey: "lesson_id", as: "views" });
LessonView.belongsTo(Lesson, { foreignKey: "lesson_id", as: "lesson" });

// 🧭 If you need: User ↔ LessonProgress (Progress tracking)
User.hasMany(LessonProgress, { foreignKey: "user_id", as: "lessonProgress" });
LessonProgress.belongsTo(User, { foreignKey: "user_id", as: "studentProgress" });

// ============================
// Collect Models
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
// Optional: Log in Dev
// ============================
if (process.env.NODE_ENV === "development") {
  console.log("✅ Models initialized and associations configured");
}

// ============================
// Export
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
