const API_URL = "http://localhost:3000";
const IMAGE_URL = "https://image.tmdb.org/t/p/original/";

const EMPTY_FILTERS = {
    genres: [],
    directors: [],
    cast: []
};

const filterDefinitions = [
    {
        key: "genres",
        label: "Genre",
        valueKey: "genre_id",
        textKey: "genre_name"
    },
    {
        key: "directors",
        label: "Director",
        valueKey: "director_id",
        textKey: "director_name"
    },
    {
        key: "cast",
        label: "Cast",
        valueKey: "cast_id",
        textKey: "cast_name"
    }
];

async function loadFilterOptions() {
    try {
        const response = await fetch(`${API_URL}/filter-options`);
        const data = await response.json();
        renderAllFilters(data);
    } catch (error) {
        console.error("Error loading filters:", error);
    }
}

function renderAllFilters(data) {
    const container = document.getElementById("filtersContainer");
    container.innerHTML = "";

    filterDefinitions.forEach(def => {
        const items = data[def.key] || [];
        container.appendChild(createFilterDropdown(def, items));
    });
}

function createFilterDropdown(def, items) {

    const wrapper = document.createElement("div");
    wrapper.className = "filterGroup";
    wrapper.dataset.filterKey = def.key;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "filterDropdownButton";
    button.textContent = def.label;

    const content = document.createElement("div");
    content.className = "filterDropdownContent";

    const search = document.createElement("input");
    search.type = "text";
    search.className = "filterSearch";
    search.placeholder = `Search ${def.label}`;

    const optionsContainer = document.createElement("div");

    items.forEach(item => {

        const label = document.createElement("label");
        label.className = "filterOption";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = def.key;
        checkbox.value = item[def.valueKey];

        checkbox.addEventListener("change", () => {
            updateDropdownLabel(wrapper, def.label);
        });

        const text = document.createElement("span");
        text.textContent = item[def.textKey];

        label.appendChild(checkbox);
        label.appendChild(text);
        optionsContainer.appendChild(label);
    });

    search.addEventListener("input", () => {

        const value = search.value.toLowerCase();

        optionsContainer.querySelectorAll(".filterOption").forEach(option => {
            option.style.display = option.textContent.toLowerCase().includes(value)
                ? "flex"
                : "none";
        });
    });

    button.addEventListener("click", () => {

        document.querySelectorAll(".filterGroup").forEach(group => {
            if (group !== wrapper) {
                group.classList.remove("open");
            }
        });

        wrapper.classList.toggle("open");
    });

    content.appendChild(search);
    content.appendChild(optionsContainer);

    wrapper.appendChild(button);
    wrapper.appendChild(content);

    return wrapper;
}

function updateDropdownLabel(wrapper, label) {

    const count = wrapper.querySelectorAll("input[type='checkbox']:checked").length;

    wrapper.querySelector(".filterDropdownButton").textContent =
        count ? `${label} (${count})` : label;
}

function getSelectedFilters() {

    const filters = {};

    filterDefinitions.forEach(def => {

        filters[def.key] = [...document.querySelectorAll(`input[name="${def.key}"]:checked`)]
            .map(box => Number(box.value));

    });

    return filters;
}

async function retrieveMovieDetails(filters = EMPTY_FILTERS) {

    try {

        const response = await fetch(`${API_URL}/fetchMovies`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(filters)
        });

        const movies = await response.json();

        renderMovies(movies);

    } catch (error) {

        console.error("Error fetching movies:", error);

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
}

document.getElementById("applyFilter").addEventListener("click", () => {

    retrieveMovieDetails(getSelectedFilters());

});

document.getElementById("clearFilter").addEventListener("click", () => {

    document.querySelectorAll(".filterBar input[type='checkbox']").forEach(box => {
        box.checked = false;
    });

    document.querySelectorAll(".filterGroup").forEach(group => {

        const def = filterDefinitions.find(f => f.key === group.dataset.filterKey);

        if (def) {
            updateDropdownLabel(group, def.label);
        }

    });

    retrieveMovieDetails(EMPTY_FILTERS);

});

document.addEventListener("click", event => {

    if (!event.target.closest(".filterGroup")) {

        document.querySelectorAll(".filterGroup").forEach(group => {
            group.classList.remove("open");
        });

    }

});

loadFilterOptions();
retrieveMovieDetails(EMPTY_FILTERS);

// async function retrieveMovieDetails() {
//     try {
//         const response = await fetch('http://localhost:3000/fetchMovies');
        
//         if (!response.ok){
//             throw new Error('HTTP error! Status: $(response.status)');
//         }

//         const movies = await response.json();
//         const movieList = document.getElementById('movieList');
//         const originalCard = document.querySelector('.movieContainer');

//         movies.forEach ( (movie, index) => {
//             let movieCard;

//             if (index===0) {
//                 movieCard = originalCard;
//             }
//             else {
//                 movieCard = originalCard.cloneNode(true);
//                 movieList.appendChild(movieCard);
//             }

//             movieCard.querySelector('.movieTitle').textContent = movie.original_title;
//             movieCard.querySelector('.releaseDate').textContent = movie.release_date ?? 'NA';
//             movieCard.querySelector('.runtime').textContent = movie.runtime ? `${movie.runtime} mins` : 'NA';
//             movieCard.querySelector('.adultRating').textContent = movie.adult;
//             movieCard.querySelector('.rating').textContent = movie.average_rating ?? 'NA';
//             movieCard.querySelector('.revenue').textContent = movie.revenue ?? 'NA';
//             movieCard.querySelector('.status').textContent = movie.status ?? 'NA';

//             const movieImage = movieCard.querySelector('.moviePoster img');
//             movieImage.src = `https://image.tmdb.org/t/p/original/${movie.poster_path}`;
//             movieImage.alt = movie.title;
//         }
//         );
//     }
//     catch (error){
//         console.error('Error fetching movies:', error);
//     }
// }

// retrieveMovieDetails()