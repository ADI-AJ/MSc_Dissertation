const { Op } = require("sequelize");

const {
    Movie,
    Genre,
    Director,
    CastMember
} = require("../models");

module.exports = {

    Query: {

        hello: () => {
            return "Hello from GraphQL";
        },

        filterOptions: async () => {

            const [genres, directors, cast] = await Promise.all([

                Genre.findAll({
                    attributes: ["genre_id", "genre_name"],
                    // include: {
                    //     model: Movie,
                    //     attributes: [],
                    //     through: { attributes: [] }
                    // },
                    order: [["genre_name", "ASC"]]
                }),

                Director.findAll({
                    attributes: ["director_id", "director_name"],
                    // include: {
                    //     model: Movie,
                    //     attributes: [],
                    //     through: { attributes: [] }
                    // },
                    order: [["director_name", "ASC"]]
                }),

                CastMember.findAll({
                    attributes: ["cast_id", "cast_name"],
                    // include: {
                    //     model: Movie,
                    //     attributes: [],
                    //     through: { attributes: [] }
                    // },
                    order: [["cast_name", "ASC"]]
                })

            ]);

            return {
                genres,
                directors,
                cast
            };

        },

        movies: async (_, { filters = {}, limit = 1500, offset = 0 }) => {

            const {
                genres = [],
                directors = [],
                cast = []
            } = filters;

            const include = [];

            if (genres.length > 0) {
                include.push({
                    model: Genre,
                    attributes: [],
                    through: { attributes: [] },
                    where: {
                        genre_id: {
                            [Op.in]: genres
                        }
                    },
                    required: true
                });
            }

            if (directors.length > 0) {
                include.push({
                    model: Director,
                    attributes: [],
                    through: { attributes: [] },
                    where: {
                        director_id: {
                            [Op.in]: directors
                        }
                    },
                    required: true
                });
            }

            if (cast.length > 0) {
                include.push({
                    model: CastMember,
                    attributes: [],
                    through: { attributes: [] },
                    where: {
                        cast_id: {
                            [Op.in]: cast
                        }
                    },
                    required: true
                });
            }

            const movies = await Movie.findAll({

                attributes: [
                    "movie_id",
                    "original_title",
                    "average_rating",
                    "status",
                    "release_date",
                    "revenue",
                    "runtime",
                    "adult",
                    "poster_path"
                ],

                include,

                distinct: true,

                subQuery: false,

                limit,

                offset,

                order: [
                    ["original_title", "ASC"]
                ]

            });

            return movies;

        }

    }

};