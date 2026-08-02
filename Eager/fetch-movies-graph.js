const IMAGE_URL = "https://image.tmdb.org/t/p/w185/";

const filterDefinitions = [
    {
        key: 'genres',
        label: 'Genre',
        valueKey: 'genre_id',
        textKey: 'genre_name'
    },
    {
        key: 'directors',
        label: 'Director',
        valueKey: 'director_id',
        textKey: 'director_name'
    },
    {
        key: 'cast',
        label: 'Cast',
        valueKey: 'cast_id',
        textKey: 'cast_name'
    }
];

async function graphqlRequest(query, variables = {}) {
    const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
        console.error(result.errors);
        throw new Error('GraphQL query failed');
    }

    return result.data;
}

async function loadFilterOptions() {
    try {
        const query = `
            query GetFilterOptions {
                filterOptions {
                    genres {
                        genre_id
                        genre_name
                    }
                    directors {
                        director_id
                        director_name
                    }
                    cast {
                        cast_id
                        cast_name
                    }
                }
            }
        `;

        const data = await graphqlRequest(query);
        renderAllFilters(data.filterOptions);
    } catch (error) {
        console.error('Error loading filters:', error);
    }
}

function renderAllFilters(data) {
    const container = document.getElementById('filtersContainer');
    container.innerHTML = '';

    filterDefinitions.forEach(def => {
        const items = data[def.key] || [];
        const filterGroup = createFilterDropdown(def, items);
        container.appendChild(filterGroup);
    });
}

function createFilterDropdown(def, items) {
    const wrapper = document.createElement('div');
    wrapper.className = 'filterGroup';
    wrapper.dataset.filterKey = def.key;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filterDropdownButton';
    button.textContent = def.label;

    const content = document.createElement('div');
    content.className = 'filterDropdownContent';

    const search = document.createElement('input');
    search.type = 'text';
    search.className = 'filterSearch';
    search.placeholder = `Search ${def.label}`;

    const optionsContainer = document.createElement('div');

    items.forEach(item => {
        const label = document.createElement('label');
        label.className = 'filterOption';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = def.key;
        checkbox.value = item[def.valueKey];

        checkbox.addEventListener('change', () => {
            updateDropdownLabel(wrapper, def.label);
        });

        const text = document.createElement('span');
        text.textContent = item[def.textKey];

        label.appendChild(checkbox);
        label.appendChild(text);
        optionsContainer.appendChild(label);
    });

    search.addEventListener('input', () => {
        const searchText = search.value.toLowerCase();
        const options = optionsContainer.querySelectorAll('.filterOption');

        options.forEach(option => {
            const text = option.textContent.toLowerCase();
            option.style.display = text.includes(searchText) ? 'flex' : 'none';
        });
    });

    button.addEventListener('click', () => {
        document.querySelectorAll('.filterGroup').forEach(group => {
            if (group !== wrapper) {
                group.classList.remove('open');
            }
        });

        wrapper.classList.toggle('open');
    });

    content.appendChild(search);
    content.appendChild(optionsContainer);

    wrapper.appendChild(button);
    wrapper.appendChild(content);

    return wrapper;
}

function updateDropdownLabel(wrapper, baseLabel) {
    const checked = wrapper.querySelectorAll('input[type="checkbox"]:checked').length;
    const button = wrapper.querySelector('.filterDropdownButton');

    if (checked > 0) {
        button.textContent = `${baseLabel} (${checked})`;
    } else {
        button.textContent = baseLabel;
    }
}

function getSelectedFilters() {
    const filters = {};

    filterDefinitions.forEach(def => {
        filters[def.key] = [...document.querySelectorAll(`input[name="${def.key}"]:checked`)]
            .map(input => Number(input.value));
    });

    return filters;
}

async function retrieveMovieDetails(filters = { genres: [], directors: [], cast: [] }) {
    console.log("retrieveMovieDetails called")
    
    try {
        const query = `
            query GetMovies($filters: MovieFilterInput) {
                movies(filters: $filters) {
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
            }
        `;

        const data = await graphqlRequest(query, { filters });
        console.log(data)
        renderMovies(data.movies);
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}

// function renderMovies(movies) {
//     const movieList = document.getElementById('movieList');
//     const originalCard = document.querySelector('.movieContainer');

//     if (!movieList || !originalCard) {
//         console.error('movieList or movieContainer not found in HTML');
//         return;
//     }

//     movieList.innerHTML = '';

//     if (!movies || movies.length === 0) {
//         movieList.innerHTML = `<div class="noResults">No movies found</div>`;
//         return;
//     }

//     movies.forEach((movie) => {
//         const movieCard = originalCard.cloneNode(true);

//         movieCard.querySelector('.movieTitle').textContent = movie.original_title ?? 'NA';
//         movieCard.querySelector('.releaseDate').textContent = movie.release_date ?? 'NA';
//         movieCard.querySelector('.runtime').textContent = movie.runtime ? `${movie.runtime} mins` : 'NA';
//         movieCard.querySelector('.adultRating').textContent = movie.adult ?? 'NA';
//         movieCard.querySelector('.rating').textContent = movie.average_rating ?? 'NA';
//         movieCard.querySelector('.revenue').textContent = movie.revenue ?? 'NA';
//         movieCard.querySelector('.status').textContent = movie.status ?? 'NA';

//         const movieImage = movieCard.querySelector('.moviePoster img');

//         if (movie.poster_path) {
//             movieImage.src = `https://image.tmdb.org/t/p/original/${movie.poster_path}`;
//         } else {
//             movieImage.src = '';
//         }

//         movieImage.alt = movie.original_title ?? 'Movie Poster';

//         movieList.appendChild(movieCard);
//     });
// }

function renderMovies(movies) {



    const movieList = document.getElementById("movieList");
    
    console.log("Movies length:", movies.length);
    console.log("First movie:", movies[0]);

    movies.slice(0, 5).forEach(movie => {
        console.log(movie.original_title);
    });

    movieList.innerHTML = "";

    if (movies.length === 0) {
        movieList.innerHTML = `<div class="noResults">No movies found</div>`;
        return;
    }

    // movies.
    movies.slice(0,20).forEach(movie => {

        const card = document.createElement("div");
        card.className = "movieContainer";

        card.innerHTML = `
            <div class="moviePoster">
                <img
                    src="${movie.poster_path ? IMAGE_URL + movie.poster_path : ""}"
                    alt="${movie.original_title || "Movie Poster"}">
            </div>

            <div class="movieDetails">

                <h2 class="movieTitle">${movie.original_title ?? "NA"}</h2>

                <div class="movieAttributes">

                    <h4>${movie.release_date ?? "NA"}</h4>
                    <h4>${movie.runtime ? movie.runtime + " mins" : "NA"}</h4>
                    <h4>${movie.adult ?? "NA"}</h4>
                    <h4>${movie.average_rating ?? "NA"}</h4>
                    <h4>${movie.revenue ?? "NA"}</h4>
                    <h4>${movie.status ?? "NA"}</h4>

                </div>

            </div>
        `;

        movieList.appendChild(card);

        console.log(movieList.children.length);

    });
}

document.addEventListener('click', (event) => {
    if (!event.target.closest('.filterGroup')) {
        document.querySelectorAll('.filterGroup').forEach(group => {
            group.classList.remove('open');
        });
    }
});


const applyButton = document.getElementById('applyFilter');
const clearButton = document.getElementById('clearFilter');

if (applyButton) {
    applyButton.addEventListener('click', () => {
        const filters = getSelectedFilters();
        retrieveMovieDetails(filters);
    });
}

if (clearButton) {
    clearButton.addEventListener('click', () => {
        document.querySelectorAll('.filterBar input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });

        document.querySelectorAll('.filterGroup').forEach(group => {
            const label = filterDefinitions.find(def => def.key === group.dataset.filterKey)?.label || 'Filter';
            updateDropdownLabel(group, label);
        });

        retrieveMovieDetails({
            genres: [],
            directors: [],
            cast: []
        });
    });
}

loadFilterOptions();
retrieveMovieDetails({
    genres: [],
    directors: [],
    cast: []
});