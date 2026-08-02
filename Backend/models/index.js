const Movie = require("./Movie");
const Genre = require("./Genre");
const Director = require("./Director");
const CastMember = require("./CastMember");

const MovieGenre = require("./MovieGenre");
const MovieDirector = require("./MovieDirector");
const MovieCast = require("./MovieCast");

/*
|--------------------------------------------------------------------------
| Associations
|--------------------------------------------------------------------------
*/

Movie.belongsToMany(Genre, {
    through: MovieGenre,
    foreignKey: "movie_id",
    otherKey: "genre_id"
});

Genre.belongsToMany(Movie, {
    through: MovieGenre,
    foreignKey: "genre_id",
    otherKey: "movie_id"
});

Movie.belongsToMany(Director, {
    through: MovieDirector,
    foreignKey: "movie_id",
    otherKey: "director_id"
});

Director.belongsToMany(Movie, {
    through: MovieDirector,
    foreignKey: "director_id",
    otherKey: "movie_id"
});

Movie.belongsToMany(CastMember, {
    through: MovieCast,
    foreignKey: "movie_id",
    otherKey: "cast_id"
});

CastMember.belongsToMany(Movie, {
    through: MovieCast,
    foreignKey: "cast_id",
    otherKey: "movie_id"
});

module.exports = {
    Movie,
    Genre,
    Director,
    CastMember,
    MovieGenre,
    MovieDirector,
    MovieCast
};