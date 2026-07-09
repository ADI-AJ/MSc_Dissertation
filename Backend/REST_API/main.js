const {Client} = require('pg') // loads the pg package, which is the standard PostgreSQL driver for Node.js.
const express = require ('express') // loads the express package, which is a web framework for Node.js => Required to create REST API
const cors = require('cors');

const app = express() // creates an instance of the express application
app.use(cors());
app.use(express.json()) // parse incoming JSON request bodies into JS objects and make them available under the req.body property.

// Configs to connect to local DB
const con = new Client({
    host: 'localhost',
    user: 'adi',
    port: 5432,
    database: 'moviedb',
})

// Establishing connection to the database
con.connect().then(()=> console.log('Connected to the database')) 

// Defines a GET endpoint at the path '/fetchMovies' that will be used to fetch all movies from the database
app.get('/fetchMovies', (req, res) => { 
    const movie_fetch_query = 'SELECT * FROM movie LIMIT 5' // SQL query to fetch all movies from the movie table
    const result = con.query(movie_fetch_query, (err, result) => {
        if (err) {
            res.send(err)
        }
        else{
            res.json(result.rows) // Sends the result of the query back to the client as a JSON response
        }
    })
})

// Starts the server and listens on port 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000') 
})