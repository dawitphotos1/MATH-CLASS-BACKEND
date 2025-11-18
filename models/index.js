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
import LessonCompletionModel from "./lessonCompletion.js";
import UserCourseAccessModel from "./UserCourseAccess.js";
import PaymentModel from "./Payment.js";

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
db.LessonCompletion = LessonCompletionModel(sequelize, DataTypes);
db.UserCourseAccess = UserCourseAccessModel(sequelize, DataTypes);
db.Payment = PaymentModel(sequelize, DataTypes);

// ✅ FIXED: Run associations properly
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// ✅ FIXED: Add explicit associations to ensure they work
// Course -> Unit -> Lesson associations
db.Course.hasMany(db.Unit, { foreignKey: 'course_id', as: 'units' });
db.Unit.belongsTo(db.Course, { foreignKey: 'course_id', as: 'course' });
db.Unit.hasMany(db.Lesson, { foreignKey: 'unit_id', as: 'lessons' });
db.Lesson.belongsTo(db.Unit, { foreignKey: 'unit_id', as: 'unit' });
db.Lesson.belongsTo(db.Course, { foreignKey: 'course_id', as: 'course' });

// ✅ Correct exports only
export default db;
export { sequelize };