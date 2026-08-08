const API_URL = "http://localhost:4000";
const IMAGE_URL = "https://image.tmdb.org/t/p/original/";
const API_TYPE = "GraphQL";
const LOADING_TYPE = "Eager";

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
            'Content-Type': 'application/json',
            "x-loading-type": LOADING_TYPE
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
    
    try {
        const query = `
            query GetMovies($filters: MovieFilterInput, $limit:Int, $offset:Int) {
                movies(
                    filters: $filters,
                    limit:$limit,
                    offset:$offset
                ) {
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

        const data = await graphqlRequest(query, { 
            filters,
            limit: 15000,
            offset:0 
        });
        renderMovies(data.movies);
    } catch (error) {
        console.error('Error fetching movies:', error);
    }
}   

function renderMovies(movies) {

    const movieList = document.getElementById("movieList");

    movieList.innerHTML = "";

    if (movies.length === 0) {
        movieList.innerHTML = `<div class="noResults">No movies found</div>`;
        return;
    }

    movies.forEach(movie => {

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

    });

    setTimeout(() => {

        sendFrontendMetrics();

    }, 5000);
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

let fcp = null;
let lcp = null;
const paintObserver = new PerformanceObserver((entryList) => {

    const entries = entryList.getEntries();

    entries.forEach(entry => {

        if (entry.name === "first-contentful-paint") {

            fcp = entry.startTime;

        }

    });

});


paintObserver.observe({
    type: "paint",
    buffered: true
});

const lcpObserver = new PerformanceObserver((entryList) => {

    const entries = entryList.getEntries();

    const lastEntry = entries[entries.length - 1];

    lcp = lastEntry.startTime;

});


lcpObserver.observe({
    type: "largest-contentful-paint",
    buffered: true
});

async function sendFrontendMetrics() {

    try {

        await fetch(`${API_URL}/frontend-metrics`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                api: API_TYPE,

                loadingType: LOADING_TYPE,

                fcp: fcp ? fcp.toFixed(2) : null,

                lcp: lcp ? lcp.toFixed(2) : null

            })

        });


        console.log("Frontend metrics sent", {
            fcp,
            lcp
        });

    }
    catch(error) {

        console.error(
            "Frontend metrics error:",
            error
        );

    }

}

loadFilterOptions();
retrieveMovieDetails({
    genres: [],
    directors: [],
    cast: []
});