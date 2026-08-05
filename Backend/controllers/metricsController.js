const fs = require("fs");
const path = require("path");

const metricsFolder = path.join(__dirname, "..", "metrics");
const frontendCsv = path.join(metricsFolder, "frontend_metrics.csv");

const CSV_HEADER =
    "RequestNo, Timestamp, API, LoadingType, FCP(ms), LCP(ms)\n";

function ensureFrontendCsv() {
    if (!fs.existsSync(metricsFolder)) {
        fs.mkdirSync(metricsFolder, { recursive: true });
    }
    if (!fs.existsSync(frontendCsv)) {
        fs.writeFileSync(frontendCsv, CSV_HEADER);
    }
}

function getNextRequestNumber() {
    ensureFrontendCsv();
    const file = fs.readFileSync(frontendCsv, "utf8");
    const lines = file.trim().split("\n");
    // Header only
    if (lines.length === 1) {
        return 1;
    }
    return lines.length;
}

const logFrontendMetrics = (req, res) => {
    ensureFrontendCsv();
    const requestNo = getNextRequestNumber();
    const {
        api,
        loadingType,
        fcp,
        lcp
    } = req.body;

    const row = [
        requestNo,
        new Date().toISOString(),
        api,
        loadingType,
        fcp,
        lcp
    ].join(",") + "\n";

    fs.appendFileSync(frontendCsv, row);

    res.status(200).json({
        success: true
    });
};

module.exports = {
    logFrontendMetrics
};