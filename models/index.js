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





require("dotenv").config();
const { Sequelize } = require("sequelize");

// Initialize Sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Import models
const models = {
  User: require("./user")(sequelize, Sequelize.DataTypes),
  Course: require("./course")(sequelize, Sequelize.DataTypes),
  Lesson: require("./lesson")(sequelize, Sequelize.DataTypes),
  UserCourseAccess: require("./userCourseAccess")(
    sequelize,
    Sequelize.DataTypes
  ),
  Teachers: require("./teachers")(sequelize, Sequelize.DataTypes),
};

// Setup model associations
Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

// Sync database
sequelize
  .sync({ alter: true })
  .then(() => console.log("✅ Database tables synchronized"))
  .catch((error) => console.error("❌ Synchronization error:", error));

module.exports = {
  sequelize,
  ...models,
};
