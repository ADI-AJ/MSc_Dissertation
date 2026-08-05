const express = require("express");

const router = express.Router();

const {
    getFilterOptions,
    fetchMovies
} = require("../controllers/restController");

const {
    logFrontendMetrics
} = require("../controllers/metricsController");

router.get("/filter-options", getFilterOptions);

router.post("/fetchMovies", fetchMovies);

router.post("/frontend-metrics", logFrontendMetrics);

module.exports = router;