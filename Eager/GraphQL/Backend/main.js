// const express = require('express');
// const cors = require('cors');

// //Importing the Sequelize class from the installed 'sequelize' package
// const {Sequelize, DataTypes} = require('sequelize')
// const {ApolloServer} = require('@apollo/server')
// const {expressMiddleware} = require('@as-integrations/express5')

// const app = express()

// const sequelize = new Sequelize(
//     'moviedb', //db
//     'adi', //user
//     null, //password
//     {
//         host: 'localhost',
//         dialect: 'postgres',
//         port: 5432,
//         logging: false, // Sequelize does not print SQL statements or debug logs to the console by default
//     }
// )

// const Movie = sequelize.define('Movie', {
//     movie_id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true},
//     original_title: {
//         type: DataTypes.TEXT},
//     average_rating: {
//         type: DataTypes.DECIMAL(3, 1)},
//     status: {
//         type: DataTypes.TEXT},
//     release_date: {
//         type: DataTypes.TEXT},
//     revenue: {
//         type: DataTypes.BIGINT},
//     runtime: {
//         type: DataTypes.INTEGER},
//     adult: {
//         type: DataTypes.TEXT},
//     budget: {
//         type: DataTypes.BIGINT},
//     overview: {
//         type: DataTypes.TEXT},
//     poster_path: {
//         type: DataTypes.TEXT}}, 
//     {
//     tableName: 'movie',
//     timestamps: false
//     }
// )

// const typeDefs = `#graphql
//     type Movie {
//         movie_id: Int
//         original_title: String
//         average_rating: Float
//         status: String
//         release_date: String
//         revenue: String
//         runtime: Int
//         adult: String
//         budget: String
//         overview: String
//         poster_path: String
//     }

//     type Query {
//         hello: String
//         movies: [Movie]
//     }
// `

// const resolvers = {
//     Query: {
//         hello: () => 'Hello from GraphQL',
//         movies: async () => {
//             return await Movie.findAll({ limit: 150 })
//         }
//     }
// }
// // Connects to the PostgreSQL database and handles any connection errors.
// async function startServer(){ //async = This function may take some time to finish, so don't stop the whole program while waiting.
//     try{
//         await sequelize.authenticate() //Wait until the connection succeeds or fails before moving to the next line
//         console.log('PostgreSQL connected')

//         const server = new ApolloServer({
//             typeDefs,
//             resolvers,
//         })

//         await server.start()

//         app.use(cors());
//         app.use(express.json())
//         app.use('/graphql', expressMiddleware(server))

//         app.listen(4000, () =>{
//             console.log('Server running at http://localhost:4000/graphql')
//         })
//     }
//     catch (err){
//         console.error(err)
//     }
// }

// startServer()

const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes, Op } = require('sequelize');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');

const app = express();

const sequelize = new Sequelize(
    'moviedb',
    'adi',
    null,
    {
        host: 'localhost',
        dialect: 'postgres',
        port: 5432,
        logging: false,
    }
);

const Movie = sequelize.define('Movie', {
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
}, {
    tableName: 'movie',
    timestamps: false
});

const Genre = sequelize.define('Genre', {
    genre_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    genre_name: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'genre',
    timestamps: false
});

const Director = sequelize.define('Director', {
    director_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    director_name: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'director',
    timestamps: false
});

const CastMember = sequelize.define('CastMember', {
    cast_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    cast_name: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'cast_member',
    timestamps: false
});

const MovieGenre = sequelize.define('MovieGenre', {
    movie_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    genre_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    }
}, {
    tableName: 'movie_genre',
    timestamps: false
});

const MovieDirector = sequelize.define('MovieDirector', {
    movie_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    director_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    }
}, {
    tableName: 'movie_director',
    timestamps: false
});

const MovieCast = sequelize.define('MovieCast', {
    movie_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    cast_id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    }
}, {
    tableName: 'movie_cast',
    timestamps: false
});

Movie.belongsToMany(Genre, {
    through: MovieGenre,
    foreignKey: 'movie_id',
    otherKey: 'genre_id'
});

Genre.belongsToMany(Movie, {
    through: MovieGenre,
    foreignKey: 'genre_id',
    otherKey: 'movie_id'
});

Movie.belongsToMany(Director, {
    through: MovieDirector,
    foreignKey: 'movie_id',
    otherKey: 'director_id'
});

Director.belongsToMany(Movie, {
    through: MovieDirector,
    foreignKey: 'director_id',
    otherKey: 'movie_id'
});

Movie.belongsToMany(CastMember, {
    through: MovieCast,
    foreignKey: 'movie_id',
    otherKey: 'cast_id'
});

CastMember.belongsToMany(Movie, {
    through: MovieCast,
    foreignKey: 'cast_id',
    otherKey: 'movie_id'
});

const typeDefs = `#graphql
    type Movie {
        movie_id: Int
        original_title: String
        average_rating: Float
        status: String
        release_date: String
        revenue: String
        runtime: Int
        adult: String
        budget: String
        overview: String
        poster_path: String
    }

    type Genre {
        genre_id: Int
        genre_name: String
    }

    type Director {
        director_id: Int
        director_name: String
    }

    type CastMember {
        cast_id: Int
        cast_name: String
    }

    type FilterOptions {
        genres: [Genre]
        directors: [Director]
        cast: [CastMember]
    }

    input MovieFilterInput {
        genres: [Int]
        directors: [Int]
        cast: [Int]
    }

    type Query {
        hello: String
        movies(filters: MovieFilterInput): [Movie]
        filterOptions: FilterOptions
    }
`;

const resolvers = {
    Query: {
        hello: () => 'Hello from GraphQL',

        filterOptions: async () => {
            const [genres, directors, castMembers] = await Promise.all([
                Genre.findAll({
                    include: [{
                        model: Movie,
                        attributes: [],
                        through: { attributes: [] }
                    }],
                    order: [['genre_name', 'ASC']]
                }),
                Director.findAll({
                    include: [{
                        model: Movie,
                        attributes: [],
                        through: { attributes: [] }
                    }],
                    order: [['director_name', 'ASC']]
                }),
                CastMember.findAll({
                    include: [{
                        model: Movie,
                        attributes: [],
                        through: { attributes: [] }
                    }],
                    order: [['cast_name', 'ASC']]
                })
            ]);

            return {
                genres,
                directors,
                cast: castMembers
            };
        },

        movies: async (_, { filters }) => {
            const genres = filters?.genres || [];
            const directors = filters?.directors || [];
            const cast = filters?.cast || [];

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

            return await Movie.findAll({
                include,
                limit: 150,
                order: [['original_title', 'ASC']],
                distinct: true
            });
        }
    }
};

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL connected');

        const server = new ApolloServer({
            typeDefs,
            resolvers,
        });

        await server.start();

        app.use(cors());
        app.use(express.json());
        app.use('/graphql', expressMiddleware(server));

        app.listen(4000, () => {
            console.log('Server running at http://localhost:4000/graphql');
        });
    } catch (err) {
        console.error(err);
    }
}

startServer();