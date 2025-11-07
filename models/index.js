
// models/index.js
import { Sequelize, DataTypes } from "sequelize";
import config from "../config/config.js";

import UserModel from "./User.js";
import CourseModel from "./Course.js";
import UnitModel from "./Unit.js";
import LessonModel from "./Lesson.js";
import LessonCompletionModel from "./lessonCompletion.js";

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

// Initialize Sequelize
const sequelize = new Sequelize(dbConfig.url, {
  dialect: dbConfig.dialect,
  logging: dbConfig.logging || false,
  dialectOptions: dbConfig.dialectOptions || {},
});

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Initialize models
db.User = UserModel(sequelize, DataTypes);
db.Course = CourseModel(sequelize, DataTypes);
db.Unit = UnitModel(sequelize, DataTypes);
db.Lesson = LessonModel(sequelize, DataTypes);
db.LessonCompletion = LessonCompletionModel(sequelize, DataTypes);

// Run associations
Object.values(db).forEach((model) => {
  if (model.associate) model.associate(db);
});

// ✅ Correct exports only
export default db;
export { sequelize };
