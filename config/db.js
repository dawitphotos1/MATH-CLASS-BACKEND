
require("dotenv").config();
const { Sequelize } = require("sequelize");
const dbConfig = require("./config.js")[process.env.NODE_ENV || "development"];

// ✅ Use "url" form from config/config.js
const sequelize = new Sequelize(dbConfig.url, {
  ...dbConfig,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// ✅ Test connection
sequelize
  .authenticate()
  .then(() => console.log("✅ PostgreSQL connection established"))
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  });

module.exports = sequelize;
