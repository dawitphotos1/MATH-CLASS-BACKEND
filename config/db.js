
// // config/db.js
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
//   retry: {
//     max: 5, // auto-retry failed queries
//   },
// });

// // 🔄 Keep retrying connection instead of killing the app
// async function connectWithRetry() {
//   try {
//     await sequelize.authenticate();
//     console.log("✅ Connected to Neon PostgreSQL");
//   } catch (err) {
//     console.error("❌ DB connection failed, retrying in 5s:", err.message);
//     setTimeout(connectWithRetry, 5000);
//   }
// }

// connectWithRetry();

// module.exports = sequelize;





// config/db.js
import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";
import configFile from "./config.js";

const dbConfig = configFile[process.env.NODE_ENV || "development"];

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

export default sequelize;
