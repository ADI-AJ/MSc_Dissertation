async function retrieveMovieDetails() {
    try {
        const response = await fetch('http://localhost:4000/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query:`
                    query {
                        movies  {
                            movie_id
                            original_title
                            release_date
                            runtime
                            adult
                            average_rating
                            revenue
                            status
                            poster_path
                        }                        
                    }`
            })
        });
        
        if (!response.ok){
            throw new Error('HTTP error! Status: $(response.status)');
        }

        const result = await response.json();
        const movies = result.data.movies;

        const movieList = document.getElementById('movieList');
        const originalCard = document.querySelector('.movieContainer');

        movies.forEach ( (movie, index) => {
            let movieCard;

            if (index===0) {
                movieCard = originalCard;
            }
            else {
                movieCard = originalCard.cloneNode(true);
                movieList.appendChild(movieCard);
            }

            movieCard.querySelector('.movieTitle').textContent = movie.title;
            movieCard.querySelector('.releaseDate').textContent = movie.release_date ?? 'NA';
            movieCard.querySelector('.runtime').textContent = movie.runtime ? `${movie.runtime} mins` : 'NA';
            movieCard.querySelector('.adultRating').textContent = movie.adult;
            movieCard.querySelector('.rating').textContent = movie.vote_average ?? 'NA';
            movieCard.querySelector('.revenue').textContent = movie.revenue ?? 'NA';
            movieCard.querySelector('.status').textContent = movie.status ?? 'NA';

            const movieImage = movieCard.querySelector('.moviePoster img');
            movieImage.src = `https://image.tmdb.org/t/p/original/${movie.poster_path}`;
            movieImage.alt = movie.title;
        }
        );
    }
    catch (error){
        console.error('Error fetching movies:', error);
    }
}

retrieveMovieDetails()