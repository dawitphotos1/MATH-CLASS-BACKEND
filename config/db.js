// require("dotenv").config();
// const { Sequelize } = require("sequelize");
// const dbConfig = require("./config.js")[process.env.NODE_ENV || "development"];

// const sequelize = new Sequelize(dbConfig.url, {
//   ...dbConfig,
//   pool: {
//     max: 10,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
// });

// // ✅ Test connection
// sequelize
//   .authenticate()
//   .then(() => console.log("✅ Connected to Neon PostgreSQL"))
//   .catch((err) => {
//     console.error("❌ Neon DB connection failed:", err);
//     process.exit(1);
//   });

// module.exports = sequelize;





// config/db.js
require("dotenv").config();
const { Sequelize } = require("sequelize");
const dbConfig = require("./config.js")[process.env.NODE_ENV || "development"];

const sequelize = new Sequelize(dbConfig.url, {
  ...dbConfig,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  retry: {
    max: 5, // auto-retry failed queries
  },
});

// 🔄 Keep retrying connection instead of killing the app
async function connectWithRetry() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to Neon PostgreSQL");
  } catch (err) {
    console.error("❌ DB connection failed, retrying in 5s:", err.message);
    setTimeout(connectWithRetry, 5000);
  }
}

connectWithRetry();

module.exports = sequelize;
