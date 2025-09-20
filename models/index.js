// "use strict";

// const fs = require("fs");
// const path = require("path");
// const Sequelize = require("sequelize");
// const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || "development";
// const config = require(__dirname + "/../config/config.js")[env];

// const db = {};

// // ✅ Initialize Sequelize using DATABASE_URL
// const sequelize = config.url
//   ? new Sequelize(config.url, config)
//   : new Sequelize(config.database, config.username, config.password, config);

// // ✅ Load models
// db.User = require("./User")(sequelize, Sequelize.DataTypes);
// db.Teacher = require("./Teacher")(sequelize, Sequelize.DataTypes);
// db.Course = require("./Course")(sequelize, Sequelize.DataTypes);
// db.Lesson = require("./Lesson")(sequelize, Sequelize.DataTypes);
// db.Enrollment = require("./Enrollment")(sequelize, Sequelize.DataTypes);
// db.UserCourseAccess = require("./UserCourseAccess")(
//   sequelize,
//   Sequelize.DataTypes
// );

// // ✅ Run associations if defined
// Object.keys(db).forEach((modelName) => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// module.exports = db;




// models / index.js;

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

// ✅ Initialize Sequelize
const sequelize = config.url
  ? new Sequelize(config.url, config)
  : new Sequelize(config.database, config.username, config.password, config);

// ✅ Define models
const User = UserModel(sequelize, DataTypes);
const Teacher = TeacherModel(sequelize, DataTypes);
const Course = CourseModel(sequelize, DataTypes);
const Lesson = LessonModel(sequelize, DataTypes);
const Enrollment = EnrollmentModel(sequelize, DataTypes);
const UserCourseAccess = UserCourseAccessModel(sequelize, DataTypes);

// ✅ Collect models
const db = {
  User,
  Teacher,
  Course,
  Lesson,
  Enrollment,
  UserCourseAccess,
  sequelize,
  Sequelize,
};

// ✅ Run associations if defined
Object.keys(db).forEach((modelName) => {
  if (db[modelName]?.associate) {
    db[modelName].associate(db);
  }
});

export default db;
