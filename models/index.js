
require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT || 3306,
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const models = {
  User: require("./user")(sequelize, Sequelize.DataTypes),
  Course: require("./course")(sequelize, Sequelize.DataTypes),
  Lesson: require("./lesson")(sequelize, Sequelize.DataTypes),
  UserCourseAccess: require("./UserCourseAccess")(
    sequelize,
    Sequelize.DataTypes
  ),
};

// Set up associations
Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});

// Database synchronization
sequelize
  .sync({ alter: true })
  .then(() => console.log("✅ Database tables synchronized"))
  .catch((error) => console.error("❌ Synchronization error:", error));

module.exports = {
  sequelize,
  ...models,
};
