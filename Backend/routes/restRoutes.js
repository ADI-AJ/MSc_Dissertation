const express = require("express");

const router = express.Router();

const {

    getFilterOptions,

    fetchMovies

} = require("../controllers/restController");

router.get("/filter-options", getFilterOptions);

router.post("/fetchMovies", fetchMovies);

module.exports = router;