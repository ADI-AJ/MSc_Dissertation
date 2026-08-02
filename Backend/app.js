const express = require("express");
const cors = require("cors");

const restRoutes = require("./routes/restRoutes");

const app = express();

app.use(cors());

app.use(express.json());

app.use("/", restRoutes);

module.exports = app;