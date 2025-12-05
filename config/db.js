// config/db

const mysql = require("mysql2/promise");

const mySqlPool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "admin",
    password: process.env.DB_PASSWORD || "1234567890",
    database: process.env.DB_NAME || "humanitarian_aid_db"
});

module.exports = mySqlPool;