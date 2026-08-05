const express = require("express");
const cors = require("cors");
const restRoutes = require("./routes/restRoutes");
const metrics = require("./middleware/metrics");
const app = express();

app.use(cors());
app.use(express.json());
app.use(metrics);
app.use("/", restRoutes);

module.exports = app;