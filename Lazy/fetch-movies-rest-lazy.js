const API_URL = "http://localhost:4000";
const IMAGE_URL = "https://image.tmdb.org/t/p/original/";

const PAGE_SIZE = 20;

let currentOffset = 0;
let isLoading = false;
let hasMoreMovies = true;
let observer = null;

const EMPTY_FILTERS = {
    genres: [],
    directors: [],
    cast: []
};

let activeFilters = EMPTY_FILTERS;

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

async function retrieveMovieDetails(filters = activeFilters, reset = false) {

    if (isLoading || (!hasMoreMovies && !reset)) return;

    if (reset) {
        currentOffset = 0;
        hasMoreMovies = true;
        activeFilters = filters;
    }

    isLoading = true;
    setLoadingIndicator(true);

    try {

        const response = await fetch(`${API_URL}/fetchMovies`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                genres: activeFilters.genres,
                directors: activeFilters.directors,
                cast: activeFilters.cast,
                limit: PAGE_SIZE,
                offset: currentOffset
            })
        });

        const movies = await response.json();

        renderMovies(movies, !reset);

        if (movies.length < PAGE_SIZE) {
            hasMoreMovies = false;
        } else {
            currentOffset += PAGE_SIZE;
        }
        

    } catch (error) {

        console.error("Error fetching movies:", error);
    }
    finally {
        isLoading = false;
        setLoadingIndicator(false);
    }
}

function renderMovies(movies, append = false) {

    const movieList = document.getElementById("movieList");

    if (!append) {
        movieList.querySelectorAll(".movieContainer").forEach(card => card.remove());

        const noResults = movieList.querySelector(".noResults");
            if (noResults) {
                noResults.remove();
            }
    }  

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

    movieList.appendChild(document.getElementById("loadingIndicator"));
    movieList.appendChild(document.getElementById("scrollSentinel"));
}

function setLoadingIndicator(show) {
    document.getElementById("loadingIndicator").style.display = show ? "block" : "none";
}

function setupInfiniteScroll() {

    const sentinel = document.getElementById("scrollSentinel");

    if (observer) {
        observer.disconnect();
    }

    observer = new IntersectionObserver(entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting && !isLoading && hasMoreMovies) {
                retrieveMovieDetails();
            }

        });

    }, {
        root: null,
        rootMargin: "600px 0px",
        threshold: 0
    });

    observer.observe(sentinel);
}

document.getElementById("applyFilter").addEventListener("click", () => {

    retrieveMovieDetails(getSelectedFilters(), true);

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

    retrieveMovieDetails(EMPTY_FILTERS, true);

});

document.addEventListener("click", event => {

    if (!event.target.closest(".filterGroup")) {

        document.querySelectorAll(".filterGroup").forEach(group => {
            group.classList.remove("open");
        });

    }

});

document.addEventListener("DOMContentLoaded", async () => {

    await loadFilterOptions();

    await retrieveMovieDetails(EMPTY_FILTERS, true);

    setupInfiniteScroll();

});