const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Director = sequelize.define(
    "Director",
    {
        director_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },

        director_name: {
            type: DataTypes.TEXT
        }
    },
    {
        tableName: "director",
        timestamps: false
    }
);

module.exports = Director;