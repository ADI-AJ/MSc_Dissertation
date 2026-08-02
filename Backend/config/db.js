const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD || null,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "postgres",
        logging: false
    }
);

async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log("✓ PostgreSQL Connected");
    }
    catch (err) {
        console.error("Database Connection Failed");
        console.error(err);
        process.exit(1);
    }
}

module.exports = {
    sequelize,
    connectDB
};