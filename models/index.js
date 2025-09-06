// require("dotenv").config();
// const { Sequelize } = require("sequelize");

// // Initialize Sequelize
// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//   dialect: "postgres",
//   logging: false,
//   dialectOptions: {
//     ssl: {
//       require: true,
//       rejectUnauthorized: false,
//     },
//   },
//   pool: {
//     max: 5,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
// });

// // Import models
// const models = {
//   User: require("./user")(sequelize, Sequelize.DataTypes),
//   Course: require("./course")(sequelize, Sequelize.DataTypes),
//   Lesson: require("./lesson")(sequelize, Sequelize.DataTypes),
//   UserCourseAccess: require("./userCourseAccess")(
//     sequelize,
//     Sequelize.DataTypes
//   ),
//   Teachers: require("./teachers")(sequelize, Sequelize.DataTypes),
// };

// // Setup model associations
// Object.values(models).forEach((model) => {
//   if (typeof model.associate === "function") {
//     model.associate(models);
//   }
// });

// // Sync database
// sequelize
//   .sync({ alter: true })
//   .then(() => console.log("✅ Database tables synchronized"))
//   .catch((error) => console.error("❌ Synchronization error:", error));

// module.exports = {
//   sequelize,
//   ...models,
// };




"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// ✅ Import models
db.User = require("./User")(sequelize, Sequelize.DataTypes);
db.Course = require("./Course")(sequelize, Sequelize.DataTypes);
db.Lesson = require("./Lesson")(sequelize, Sequelize.DataTypes);
db.UserCourseAccess = require("./UserCourseAccess")(
  sequelize,
  Sequelize.DataTypes
);

// If you also have these, load them too
if (fs.existsSync(path.join(__dirname, "lessoncompletion.js"))) {
  db.LessonCompletion = require("./lessoncompletion")(
    sequelize,
    Sequelize.DataTypes
  );
}
if (fs.existsSync(path.join(__dirname, "lessonProgress.js"))) {
  db.LessonProgress = require("./lessonProgress")(
    sequelize,
    Sequelize.DataTypes
  );
}
if (fs.existsSync(path.join(__dirname, "Teachers.js"))) {
  db.Teacher = require("./Teachers")(sequelize, Sequelize.DataTypes);
}

// ✅ Set up associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
