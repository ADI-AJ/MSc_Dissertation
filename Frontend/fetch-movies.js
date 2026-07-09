async function retrieveMovieDetails() {
    try {
        const response = await fetch('http://localhost:3000/fetchMovies');
        
        if (!response.ok){
            throw new Error('HTTP error! Status: $(response.status)');
        }

        const movies = await response.json();
        console.log(movies);
    }
    catch (error){
        console.error('Error fetching movies:', error);
    }
}

retrieveMovieDetails()