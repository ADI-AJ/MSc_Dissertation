const express = require('express')

//Importing the Sequelize class from the installed 'sequelize' package
const {Sequelize, DataTypes} = require('sequelize')
const {ApolloServer} = require('@apollo/server')
const {expressMiddleware} = require('@as-integrations/express5')

const app = express()

const sequelize = new Sequelize(
    'moviedb', //db
    'adi', //user
    null, //password
    {
        host: 'localhost',
        dialect: 'postgres',
        port: 5432,
        logging: false, // Sequelize does not print SQL statements or debug logs to the console by default
    }
)

const Movie = sequelize.define('Movie', {
    movie_id: {
        type: DataTypes.INTEGER,
        primaryKey: true},
    original_title: {
        type: DataTypes.TEXT},
    average_rating: {
        type: DataTypes.DECIMAL(3, 1)},
    status: {
        type: DataTypes.TEXT},
    release_date: {
        type: DataTypes.TEXT},
    revenue: {
        type: DataTypes.BIGINT},
    runtime: {
        type: DataTypes.INTEGER},
    adult: {
        type: DataTypes.TEXT},
    budget: {
        type: DataTypes.BIGINT},
    overview: {
        type: DataTypes.TEXT},
    poster_path: {
        type: DataTypes.TEXT}}, 
    {
    tableName: 'movie',
    timestamps: false
    }
)

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

    type Query {
        hello: String
        movies: [Movie]
    }
`

const resolvers = {
    Query: {
        hello: () => 'Hello from GraphQL',
        movies: async () => {
            return await Movie.findAll({ limit: 10 })
        }
    }
}
// Connects to the PostgreSQL database and handles any connection errors.
async function startServer(){ //async = This function may take some time to finish, so don't stop the whole program while waiting.
    try{
        await sequelize.authenticate() //Wait until the connection succeeds or fails before moving to the next line
        console.log('PostgreSQL connected')

        const server = new ApolloServer({
            typeDefs,
            resolvers,
        })

        await server.start()

        app.use(express.json())
        app.use('/graphql', expressMiddleware(server))

        app.listen(4000, () =>{
            console.log('Server running at http://localhost:4000/graphql')
        })
    }
    catch (err){
        console.error(err)
    }
}

startServer()