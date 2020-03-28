require("dotenv").config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });

module.exports = {
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  dialect: process.env.DB_DIALECT || "mysql",
  storage: process.env.DB_STORAGE,
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 3000,
    idle: 10000
  }
};
