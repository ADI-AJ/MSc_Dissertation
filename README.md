# MSc Dissertation

Code for my MSc dissertation, "An Empirical Study of the Combined Impact of API Design and Frontend Data Loading Strategies on Web Application Performance" (University of Bath).

The project is a movie catalogue app built four ways: REST or GraphQL on the backend, eager or lazy loading on the frontend. All four versions were measured under the same conditions to see how these two choices affect performance.

## Layout

- `Backend/` - Node/Express server, exposes both a REST endpoint and a GraphQL endpoint over the same PostgreSQL database
- `Eager/` - the two eager-loading frontend pages (REST and GraphQL)
- `Lazy/` - the two lazy-loading frontend pages (REST and GraphQL)
- `Staging/` - the SQL schema (`sql_codes.sql`) and the notebook used to build `moviedb_50k` from the raw Kaggle CSV
- `automation/metrics-runner.js` - the Puppeteer script that drives the browser and records measurements
- `run-eager-metrics.sh` / `run-lazy-metrics.sh` - shell scripts that run the automation for a chosen filter combination
- `metrics_data/` - the raw CSVs collected for each of the four filter scenarios reported in the dissertation
- `Analysis.ipynb` - the notebook that produces the tables and figures used in Chapters 5 and 6

## Running it

You'll need Node.js 20+, PostgreSQL 14+, and Python 3 with Jupyter if you want to rerun the analysis.

1. `npm install` in the project root.
2. Create a PostgreSQL database and load the schema from `Staging/sql_codes.sql`.
3. Create a `.env` file in the project root with:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=moviedb_50k
   DB_USER=your_pg_user
   DB_PASSWORD=your_pg_password
   PORT=4000
   ```
4. Start the backend with `node Backend/server.js`. It serves REST at `/fetchMovies` and GraphQL at `/graphql`.
5. Once the backend is running, open any of the frontend pages in `Eager/` or `Lazy/` in a browser (e.g. `Eager/index-rest.html`).

## Reproducing the measurements

Each of the four filter scenarios in the dissertation was collected by editing the filter variables at the top of `run-eager-metrics.sh` and `run-lazy-metrics.sh`, then running both scripts in turn with the backend already up:

```
./run-eager-metrics.sh
./run-lazy-metrics.sh
```

Each run does 30 repetitions per configuration with a fresh, cache-cleared browser context. The results land in `metrics/backend_metrics.csv` and `metrics/frontend_metrics.csv`, which then get moved into a folder under `metrics_data/` named for that scenario.

Once all four scenario folders are populated, running `Analysis.ipynb` top to bottom regenerates every table and chart in the dissertation from the raw data.
