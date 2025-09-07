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

// ✅ Initialize Sequelize using DATABASE_URL
const sequelize = config.url
  ? new Sequelize(config.url, config)
  : new Sequelize(config.database, config.username, config.password, config);

// ✅ Load models
db.User = require("./User")(sequelize, Sequelize.DataTypes);
db.Teacher = require("./Teacher")(sequelize, Sequelize.DataTypes);
db.Course = require("./Course")(sequelize, Sequelize.DataTypes);
db.Lesson = require("./Lesson")(sequelize, Sequelize.DataTypes);
db.UserCourseAccess = require("./UserCourseAccess")(
  sequelize,
  Sequelize.DataTypes
);

// ✅ Run associations if defined
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
