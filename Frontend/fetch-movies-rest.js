async function retrieveMovieDetails() {
    try {
        const response = await fetch('http://localhost:3000/fetchMovies');
        
        if (!response.ok){
            throw new Error('HTTP error! Status: $(response.status)');
        }

        const movies = await response.json();
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

            movieCard.querySelector('.movieTitle').textContent = movie.original_title;
            movieCard.querySelector('.releaseDate').textContent = movie.release_date ?? 'NA';
            movieCard.querySelector('.runtime').textContent = movie.runtime ? `${movie.runtime} mins` : 'NA';
            movieCard.querySelector('.adultRating').textContent = movie.adult;
            movieCard.querySelector('.rating').textContent = movie.average_rating ?? 'NA';
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