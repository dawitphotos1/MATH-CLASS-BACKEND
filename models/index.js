
// // models / index.js;

// import SequelizePkg from "sequelize";
// import UserModel from "./User.js";
// import TeacherModel from "./Teacher.js";
// import CourseModel from "./Course.js";
// import LessonModel from "./Lesson.js";
// import EnrollmentModel from "./Enrollment.js";
// import UserCourseAccessModel from "./UserCourseAccess.js";
// import configFile from "../config/config.js";

// const { Sequelize, DataTypes } = SequelizePkg;

// const env = process.env.NODE_ENV || "development";
// const config = configFile[env];

// // ✅ Initialize Sequelize
// const sequelize = config.url
//   ? new Sequelize(config.url, config)
//   : new Sequelize(config.database, config.username, config.password, config);

// // ✅ Define models
// const User = UserModel(sequelize, DataTypes);
// const Teacher = TeacherModel(sequelize, DataTypes);
// const Course = CourseModel(sequelize, DataTypes);
// const Lesson = LessonModel(sequelize, DataTypes);
// const Enrollment = EnrollmentModel(sequelize, DataTypes);
// const UserCourseAccess = UserCourseAccessModel(sequelize, DataTypes);

// // ✅ Collect models
// const db = {
//   User,
//   Teacher,
//   Course,
//   Lesson,
//   Enrollment,
//   UserCourseAccess,
//   sequelize,
//   Sequelize,
// };

// // ✅ Run associations if defined
// Object.keys(db).forEach((modelName) => {
//   if (db[modelName]?.associate) {
//     db[modelName].associate(db);
//   }
// });

// export default db;




// models/index.js

import SequelizePkg from "sequelize";
import UserModel from "./User.js";
import TeacherModel from "./Teacher.js";
import CourseModel from "./Course.js";
import LessonModel from "./Lesson.js";
import EnrollmentModel from "./Enrollment.js";
import UserCourseAccessModel from "./UserCourseAccess.js";
import configFile from "../config/config.js";

const { Sequelize, DataTypes } = SequelizePkg;

const env = process.env.NODE_ENV || "development";
const config = configFile[env];

// Initialize Sequelize instance
const sequelize = config.url
  ? new Sequelize(config.url, config)
  : new Sequelize(config.database, config.username, config.password, config);

// Initialize all models using factory functions
const models = {
  User: UserModel(sequelize, DataTypes),
  Teacher: TeacherModel(sequelize, DataTypes),
  Course: CourseModel(sequelize, DataTypes),
  Lesson: LessonModel(sequelize, DataTypes),
  Enrollment: EnrollmentModel(sequelize, DataTypes),
  UserCourseAccess: UserCourseAccessModel(sequelize, DataTypes),
};

// Run associations after all models are defined
Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

const db = {
  ...models,
  sequelize,
  Sequelize,
};

export default db;
