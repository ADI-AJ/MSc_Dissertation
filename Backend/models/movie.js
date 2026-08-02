const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Movie = sequelize.define(
    "Movie",
    {
        movie_id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },

        original_title: {
            type: DataTypes.TEXT
        },

        average_rating: {
            type: DataTypes.DECIMAL(3, 1)
        },

        status: {
            type: DataTypes.TEXT
        },

        release_date: {
            type: DataTypes.TEXT
        },

        revenue: {
            type: DataTypes.BIGINT
        },

        runtime: {
            type: DataTypes.INTEGER
        },

        adult: {
            type: DataTypes.TEXT
        },

        budget: {
            type: DataTypes.BIGINT
        },

        overview: {
            type: DataTypes.TEXT
        },

        poster_path: {
            type: DataTypes.TEXT
        }
    },
    {
        tableName: "movie",
        timestamps: false
    }
);

module.exports = Movie;