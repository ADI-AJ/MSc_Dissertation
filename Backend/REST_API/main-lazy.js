// const {Client} = require('pg') // loads the pg package, which is the standard PostgreSQL driver for Node.js.
// const express = require ('express') // loads the express package, which is a web framework for Node.js => Required to create REST API
// const cors = require('cors');

// const app = express() // creates an instance of the express application
// app.use(cors());
// app.use(express.json()) // parse incoming JSON request bodies into JS objects and make them available under the req.body property.

// // Configs to connect to local DB
// const con = new Client({
//     host: 'localhost',
//     user: 'adi',
//     port: 5432,
//     database: 'moviedb',
// })

// // Establishing connection to the database
// con.connect().then(()=> console.log('Connected to the database')) 

// // Defines a GET endpoint at the path '/fetchMovies' that will be used to fetch all movies from the database
// app.get('/fetchMovies', (req, res) => { 
//     const movie_fetch_query = 'SELECT * FROM movie LIMIT 150' // SQL query to fetch all movies from the movie table
//     const result = con.query(movie_fetch_query, (err, result) => {
//         if (err) {
//             res.send(err)
//         }
//         else{
//             res.json(result.rows) // Sends the result of the query back to the client as a JSON response
//         }
//     })
// })

// // Starts the server and listens on port 3000
// app.listen(3000, () => {
//     console.log('Server is running on port 3000') 
// })

const { Pool } = require('pg');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: 'localhost',
    user: 'adi',
    port: 5432,
    database: 'moviedb',
});

pool.connect()
    .then(() => console.log('Connected to database'))
    .catch(err => console.error('Database connection error', err));

app.get('/filter-options', async (req, res) => {
    try {
        const genresQuery = `
            SELECT DISTINCT g.genre_id, g.genre_name
            FROM genre g
            JOIN movie_genre mg ON g.genre_id = mg.genre_id
            ORDER BY g.genre_name
        `;

        const directorsQuery = `
            SELECT DISTINCT d.director_id, d.director_name
            FROM director d
            JOIN movie_director md ON d.director_id = md.director_id
            ORDER BY d.director_name
        `;

        const castQuery = `
            SELECT DISTINCT c.cast_id, c.cast_name
            FROM cast_member c
            JOIN movie_cast mc ON c.cast_id = mc.cast_id
            ORDER BY c.cast_name
        `;

        const [genres, directors, castMembers] = await Promise.all([
            pool.query(genresQuery),
            pool.query(directorsQuery),
            pool.query(castQuery)
        ]);

        res.json({
            genres: genres.rows,
            directors: directors.rows,
            cast: castMembers.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch filter options' });
    }
});

app.post('/fetchMovies', async (req, res) => {
    try {
        const {
            genres = [],
            directors = [],
            cast = [],
            limit = 20,
            offset = 0
        } = req.body;

        let query = `
            SELECT DISTINCT
                m.movie_id,
                m.original_title,
                m.release_date,
                m.runtime,
                m.adult,
                m.average_rating,
                m.revenue,
                m.status,
                m.poster_path
            FROM movie m
        `;

        const conditions = [];
        const values = [];
        let paramIndex = 1;

        if (genres.length > 0) {
            query += `
                JOIN movie_genre mg ON m.movie_id = mg.movie_id
            `;
            conditions.push(`mg.genre_id = ANY($${paramIndex})`);
            values.push(genres);
            paramIndex++;
        }

        if (directors.length > 0) {
            query += `
                JOIN movie_director md ON m.movie_id = md.movie_id
            `;
            conditions.push(`md.director_id = ANY($${paramIndex})`);
            values.push(directors);
            paramIndex++;
        }

        if (cast.length > 0) {
            query += `
                JOIN movie_cast mc ON m.movie_id = mc.movie_id
            `;
            conditions.push(`mc.cast_id = ANY($${paramIndex})`);
            values.push(cast);
            paramIndex++;
        }

        if (conditions.length > 0) {
            query += ` WHERE ` + conditions.join(' AND ');
        }

        query += ` ORDER BY m.original_title ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

        values.push(limit);
        values.push(offset);

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch filtered movies' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});