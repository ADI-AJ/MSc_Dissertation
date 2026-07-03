const {Client} = require('pg') // loads the pg package, which is the standard PostgreSQL driver for Node.js.

const express = require ('express') // loads the express package, which is a web framework for Node.js => Required to create REST API
const app = express() // creates an instance of the express application
app.use(express.json()) // parse incoming JSON request bodies into JS objects and make them available under the req.body property.

// Configs to connect to local DB
const con = new Client({
    host: 'localhost',
    user: 'adi',
    port: 5432,
    database: 'moviedb',
})

con.connect().then(()=> console.log('Connected to the database')) // Establishing connection to the database
