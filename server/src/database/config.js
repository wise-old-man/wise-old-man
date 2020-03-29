require("dotenv").config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });

module.exports = {
  host: process.env.DB_HOST,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  dialect: process.env.DB_DIALECT,
  storage: process.env.DB_STORAGE,
  logging: false,
  pool: { max: 5, min: 0, acquire: 3000, idle: 10000 }
};
