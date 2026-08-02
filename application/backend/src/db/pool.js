const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "database-service",
  user: process.env.DB_USER || "zepto",
  password: process.env.DB_PASSWORD || "zepto_password",
  database: process.env.DB_NAME || "zeptodb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
