// // models/index.js
// import { Sequelize, DataTypes } from "sequelize";
// import config from "../config/config.js";

// import UserModel from "./User.js";
// import CourseModel from "./Course.js";
// import EnrollmentModel from "./Enrollment.js";
// import UnitModel from "./Unit.js";
// import LessonModel from "./Lesson.js";
// import LessonCompletionModel from "./lessonCompletion.js";
// import UserCourseAccessModel from "./UserCourseAccess.js";
// import PaymentModel from "./Payment.js";

// const env = process.env.NODE_ENV || "development";
// const dbConfig = config[env];

// // Initialize Sequelize
// const sequelize = new Sequelize(dbConfig.url, {
//   dialect: dbConfig.dialect,
//   logging: dbConfig.logging || false,
//   dialectOptions: dbConfig.dialectOptions || {},
//   pool: {
//     max: 10,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
// });

// const db = {};
// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// // Initialize models
// db.User = UserModel(sequelize, DataTypes);
// db.Course = CourseModel(sequelize, DataTypes);
// db.Enrollment = EnrollmentModel(sequelize, DataTypes);
// db.Unit = UnitModel(sequelize, DataTypes);
// db.Lesson = LessonModel(sequelize, DataTypes);
// db.LessonCompletion = LessonCompletionModel(sequelize, DataTypes);
// db.UserCourseAccess = UserCourseAccessModel(sequelize, DataTypes);
// db.Payment = PaymentModel(sequelize, DataTypes);

// // Run associations
// Object.values(db).forEach((model) => {
//   if (model.associate) model.associate(db);
// });

// // ✅ Correct exports only
// export default db;
// export { sequelize };





// models/index.js
import { Sequelize, DataTypes } from "sequelize";
import config from "../config/config.js";

import UserModel from "./User.js";
import CourseModel from "./Course.js";
import EnrollmentModel from "./Enrollment.js";
import UnitModel from "./Unit.js";
import LessonModel from "./Lesson.js";
import SubLessonModel from "./SubLesson.js"; // ✅ ADDED
import LessonCompletionModel from "./LessonCompletion.js";
import UserCourseAccessModel from "./UserCourseAccess.js";
import PaymentModel from "./Payment.js";
import AttachmentModel from "./Attachment.js"; // ✅ ADDED

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.url, {
  dialect: dbConfig.dialect,
  logging: dbConfig.logging || false,
  dialectOptions: dbConfig.dialectOptions || {},
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Initialize models
db.User = UserModel(sequelize, DataTypes);
db.Course = CourseModel(sequelize, DataTypes);
db.Enrollment = EnrollmentModel(sequelize, DataTypes);
db.Unit = UnitModel(sequelize, DataTypes);
db.Lesson = LessonModel(sequelize, DataTypes);
db.SubLesson = SubLessonModel(sequelize, DataTypes); // ✅ ADDED
db.LessonCompletion = LessonCompletionModel(sequelize, DataTypes);
db.UserCourseAccess = UserCourseAccessModel(sequelize, DataTypes);
db.Payment = PaymentModel(sequelize, DataTypes);
db.Attachment = AttachmentModel(sequelize, DataTypes); // ✅ ADDED

// Run associations
Object.values(db).forEach((model) => {
  if (model.associate) model.associate(db);
});

// Correct exports only
export default db;
export { sequelize };