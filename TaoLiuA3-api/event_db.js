require("dotenv").config();

const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "charityevents_db",
    dateStrings: true
});

db.connect((error) => {
    if (error) {
        console.error("Database connection failed:", error.message);
        return;
    }

    console.log("Database connected successfully");
});

module.exports = db;
