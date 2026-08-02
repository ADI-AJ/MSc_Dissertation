const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const MovieCast = sequelize.define(
    "MovieCast",
    {
        movie_id: {
            type: DataTypes.INTEGER
        },

        cast_id: {
            type: DataTypes.INTEGER
        }
    },
    {
        tableName: "movie_cast",
        timestamps: false
    }
);

module.exports = MovieCast;