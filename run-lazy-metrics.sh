#!/usr/bin/env bash
#
# run-lazy-metrics.sh
#
# Automates running the Lazy-loading pages (REST, then GraphQL) N times
# each in a fresh, cache-cleared browser context, generating rows in
# metrics/backend_metrics.csv and metrics/frontend_metrics.csv.
#
# Requires the Backend server to already be running (npm start / node server.js
# inside Backend/) - this script does not start it for you.
#
# Edit the variables below whenever you want to change the run count, the
# wait between runs, headless mode, or the filters applied. Leave a filter
# variable empty ("") to not apply that filter at all.
#
# Filter values are matched by NAME (case-insensitive), exactly as they
# appear in the app's filter dropdowns - e.g. GENRE_FILTER="Animation".
# Multiple values for the same filter type can be comma-separated, e.g.
# CAST_FILTER="Mel Blanc,Tom Hanks".

# --- Editable settings -------------------------------------------------

RUNS=30
INTERVAL_SECONDS=5
HEADLESS=true

# GENRE_FILTER=""
# DIRECTOR_FILTER=""
# CAST_FILTER=""
 
# GENRE_FILTER="Drama"
# DIRECTOR_FILTER=""
# CAST_FILTER=""

# GENRE_FILTER="Animation"
# DIRECTOR_FILTER=""
# CAST_FILTER="Mel Blanc"

# Example filter combination discussed for max non-trivial overlap:
GENRE_FILTER="Animation"
DIRECTOR_FILTER="Friz Freleng"
CAST_FILTER="Mel Blanc"

API_BASE="http://localhost:4000"

# -------------------------------------------------------------------------

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if ! curl -s -o /dev/null -w "%{http_code}" "$API_BASE/filter-options" | grep -q "200"; then
    echo "ERROR: Backend not reachable at $API_BASE (start it with 'node Backend/server.js' first)."
    exit 1
fi

export API_BASE
export RUNS
export INTERVAL_SECONDS
export HEADLESS
export GENRE_FILTER
export DIRECTOR_FILTER
export CAST_FILTER

echo "=== Lazy / REST ==="
PAGE_HTML_PATH="$SCRIPT_DIR/Lazy/index-rest.html" \
LABEL="Lazy REST" \
node "$SCRIPT_DIR/automation/metrics-runner.js"

echo ""
echo "=== Lazy / GraphQL ==="
PAGE_HTML_PATH="$SCRIPT_DIR/Lazy/index-graphql.html" \
LABEL="Lazy GraphQL" \
node "$SCRIPT_DIR/automation/metrics-runner.js"

echo ""
echo "All Lazy runs complete. See metrics/backend_metrics.csv and metrics/frontend_metrics.csv."
