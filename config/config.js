require("dotenv").config();

const commonOptions = {
  dialect: "postgres",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
};

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    ...commonOptions,
  },
  production: {
    url: process.env.DATABASE_URL,
    ...commonOptions,
  },
};
