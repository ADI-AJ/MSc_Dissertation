const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Genre = sequelize.define(
    "Genre",
    {
        genre_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },

        genre_name: {
            type: DataTypes.TEXT
        }
    },
    {
        tableName: "genre",
        timestamps: false
    }
);

module.exports = Genre;