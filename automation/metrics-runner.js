/*
|--------------------------------------------------------------------------
| metrics-runner.js
|--------------------------------------------------------------------------
|
| Puppeteer-driven benchmark runner. Not called directly - invoked by
| run-eager-metrics.sh / run-lazy-metrics.sh, which set the env vars below.
|
| For RUNS iterations, this script:
|   1. opens a brand-new (empty-cache) browser context
|   2. navigates to PAGE_HTML_PATH with the resolved filters in the URL
|      query string (?genres=..&directors=..&cast=..)
|   3. waits for the page's own POST to /frontend-metrics to complete
|      (that POST is what makes backend_metrics.csv / frontend_metrics.csv
|      grow - see Backend/controllers/metricsController.js)
|   4. closes that context (dropping its cache/cookies) and waits
|      INTERVAL_SECONDS before starting the next run
|
| Env vars (all optional except PAGE_HTML_PATH):
|   PAGE_HTML_PATH   absolute path to the .html file to open      (required)
|   API_BASE         backend base URL                             (default http://localhost:4000)
|   RUNS             number of iterations                         (default 30)
|   INTERVAL_SECONDS pause between runs, in seconds                (default 5)
|   HEADLESS         "true" | "false"                              (default true)
|   LABEL            label used in console output                 (default PAGE_HTML_PATH)
|   GENRE_FILTER     comma-separated genre name(s), or empty       (default "")
|   DIRECTOR_FILTER  comma-separated director name(s), or empty    (default "")
|   CAST_FILTER      comma-separated cast member name(s), or empty (default "")
|
*/

const path = require("path");
const puppeteer = require("puppeteer");

const PAGE_HTML_PATH = process.env.PAGE_HTML_PATH;
const API_BASE = process.env.API_BASE || "http://localhost:4000";
const RUNS = parseInt(process.env.RUNS || "30", 10);
const INTERVAL_SECONDS = parseFloat(process.env.INTERVAL_SECONDS || "5");
const HEADLESS = (process.env.HEADLESS || "true").toLowerCase() !== "false";
const LABEL = process.env.LABEL || PAGE_HTML_PATH;

const GENRE_FILTER = (process.env.GENRE_FILTER || "").trim();
const DIRECTOR_FILTER = (process.env.DIRECTOR_FILTER || "").trim();
const CAST_FILTER = (process.env.CAST_FILTER || "").trim();

if (!PAGE_HTML_PATH) {
    console.error("PAGE_HTML_PATH env var is required.");
    process.exit(1);
}

function sleep(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

function splitNames(value) {
    return value
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
}

async function fetchFilterOptions() {
    const response = await fetch(`${API_BASE}/filter-options`);

    if (!response.ok) {
        throw new Error(`Failed to fetch /filter-options (status ${response.status})`);
    }

    return response.json();
}

function resolveNamesToIds(names, options, idKey, nameKey, filterTypeLabel) {
    const lookup = new Map(
        options.map(item => [String(item[nameKey]).toLowerCase(), item[idKey]])
    );

    return names.map(name => {
        const id = lookup.get(name.toLowerCase());

        if (id === undefined) {
            throw new Error(
                `Could not find ${filterTypeLabel} named "${name}". ` +
                `Check the spelling against what appears in the app's filter dropdown.`
            );
        }

        return id;
    });
}

async function buildQueryString() {
    const wantsGenre = GENRE_FILTER.length > 0;
    const wantsDirector = DIRECTOR_FILTER.length > 0;
    const wantsCast = CAST_FILTER.length > 0;

    if (!wantsGenre && !wantsDirector && !wantsCast) {
        return "";
    }

    const options = await fetchFilterOptions();
    const params = new URLSearchParams();

    if (wantsGenre) {
        const ids = resolveNamesToIds(
            splitNames(GENRE_FILTER),
            options.genres,
            "genre_id",
            "genre_name",
            "genre"
        );
        params.set("genres", ids.join(","));
    }

    if (wantsDirector) {
        const ids = resolveNamesToIds(
            splitNames(DIRECTOR_FILTER),
            options.directors,
            "director_id",
            "director_name",
            "director"
        );
        params.set("directors", ids.join(","));
    }

    if (wantsCast) {
        const ids = resolveNamesToIds(
            splitNames(CAST_FILTER),
            options.cast,
            "cast_id",
            "cast_name",
            "cast member"
        );
        params.set("cast", ids.join(","));
    }

    return `?${params.toString()}`;
}

async function runOnce(browser, url, runNumber) {
    const context = await browser.createBrowserContext();
    const page = await context.newPage();

    let metricsBody = null;

    page.on("response", async response => {
        if (response.url().includes("/frontend-metrics") && response.request().method() === "POST") {
            try {
                metricsBody = JSON.parse(response.request().postData() || "{}");
            } catch {
                metricsBody = {};
            }
        }
    });

    const metricsReceived = new Promise(resolve => {
        const check = setInterval(() => {
            if (metricsBody !== null) {
                clearInterval(check);
                resolve();
            }
        }, 100);

        // Safety timeout well above the page's own 10s image-wait cap.
        // Large unfiltered Eager runs (up to EAGER_LIMIT movies) can spend a
        // long time just synchronously rendering DOM cards before that 10s
        // timer even starts, so this needs a generous margin.
        setTimeout(() => {
            clearInterval(check);
            resolve();
        }, 90000);
    });

    try {
        const client = await page.createCDPSession();
        await client.send("Network.clearBrowserCache");
        await client.send("Network.clearBrowserCookies");

        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

        await metricsReceived;

        if (metricsBody) {
            console.log(
                `[${LABEL}] run ${runNumber}/${RUNS} done — fcp=${metricsBody.fcp}ms lcp=${metricsBody.lcp}ms`
            );
        } else {
            console.warn(
                `[${LABEL}] run ${runNumber}/${RUNS} — no /frontend-metrics call observed within 30s`
            );
        }
    } catch (error) {
        console.error(`[${LABEL}] run ${runNumber}/${RUNS} failed:`, error.message);
    } finally {
        await context.close();
    }
}

async function main() {
    const absolutePath = path.resolve(PAGE_HTML_PATH);
    const queryString = await buildQueryString();
    const url = `file://${absolutePath}${queryString}`;

    console.log(`[${LABEL}] target URL: ${url}`);
    console.log(`[${LABEL}] runs=${RUNS} interval=${INTERVAL_SECONDS}s headless=${HEADLESS}`);

    const browser = await puppeteer.launch({ headless: HEADLESS });

    try {
        for (let i = 1; i <= RUNS; i++) {
            await runOnce(browser, url, i);

            if (i < RUNS) {
                await sleep(INTERVAL_SECONDS);
            }
        }
    } finally {
        await browser.close();
    }

    console.log(`[${LABEL}] all ${RUNS} runs complete.`);
}

main().catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
});
