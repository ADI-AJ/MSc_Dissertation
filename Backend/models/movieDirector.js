const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const MovieDirector = sequelize.define(
    "MovieDirector",
    {
        movie_id: {
            type: DataTypes.INTEGER
        },

        director_id: {
            type: DataTypes.INTEGER
        }
    },
    {
        tableName: "movie_director",
        timestamps: false
    }
);

module.exports = MovieDirector;