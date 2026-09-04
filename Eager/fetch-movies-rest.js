const API_URL = "http://localhost:4000";
const IMAGE_URL = "https://image.tmdb.org/t/p/w92/";

const API_TYPE = "REST"
const LOADING_TYPE = "Eager"
const EAGER_LIMIT = 20000;// const EAGER_LIMIT = 15000;
const EMPTY_FILTERS = {
    genres: [],
    directors: [],
    cast: []
};

function getFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    const parseIds = key => {
        const value = params.get(key);
        return value
            ? value.split(",").map(Number).filter(n => !Number.isNaN(n))
            : [];
    };

    return {
        genres: parseIds("genres"),
        directors: parseIds("directors"),
        cast: parseIds("cast")
    };
}

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

    reflectURLFiltersInCheckboxes();
}

function reflectURLFiltersInCheckboxes() {
    const urlFilters = getFiltersFromURL();

    filterDefinitions.forEach(def => {
        const ids = urlFilters[def.key];
        if (!ids.length) return;

        document.querySelectorAll(`input[name="${def.key}"]`).forEach(box => {
            if (ids.includes(Number(box.value))) {
                box.checked = true;
            }
        });

        const wrapper = document.querySelector(`.filterGroup[data-filter-key="${def.key}"]`);
        if (wrapper) {
            updateDropdownLabel(wrapper, def.label);
        }
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
                "Content-Type": "application/json",
                "x-loading-type": LOADING_TYPE
            },
            body: JSON.stringify({
                ...filters,
                limit: EAGER_LIMIT,
                offset:0
            })
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

    triggerMetricsOnRenderComplete();
}

let firstRenderCompleted = false;

async function triggerMetricsOnRenderComplete() {
    if (firstRenderCompleted) return;
    firstRenderCompleted = true;

    const images = Array.from(document.querySelectorAll("#movieList img"));
    await Promise.allSettled(images.map(img => {
        if (!img.src || img.complete) return Promise.resolve();
        return new Promise(resolve => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
        });
    }));

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            sendFrontendMetrics();
        });
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
retrieveMovieDetails(getFiltersFromURL());

let fcp = null;
let lcp = null;


// Measure FCP
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


// Measure LCP
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