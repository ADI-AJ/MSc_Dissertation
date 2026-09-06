const { Op } = require("sequelize");

const {
    Movie,
    Genre,
    Director,
    CastMember
} = require("../models");

/*
GET /filter-options
*/

const getFilterOptions = async (req, res) => {

    try {

        const [genres, directors, cast] = await Promise.all([

            Genre.findAll({
                attributes: ["genre_id", "genre_name"],
                order: [["genre_name", "ASC"]]
            }),

            Director.findAll({
                attributes: ["director_id", "director_name"],
                order: [["director_name", "ASC"]]
            }),

            CastMember.findAll({
                attributes: ["cast_id", "cast_name"],
                order: [["cast_name", "ASC"]]
            })

        ]);

        res.json({
            genres,
            directors,
            cast
        });

    }
    catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Failed to fetch filter options"
        });

    }

};

/*
POST /fetchMovies
*/

const fetchMovies = async (req, res) => {

    try {

        const {
            genres = [],
            directors = [],
            cast = [],
            limit = 20,
            offset = 0
        } = req.body;

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
                "release_date",
                "runtime",
                "adult",
                "average_rating",
                "revenue",
                "status",
                "poster_path",
                "budget",
                "overview"
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
        
        res.json(movies);

    }
    catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Failed to fetch filtered movies"
        });

    }

};

module.exports = {

    getFilterOptions,

    fetchMovies

};