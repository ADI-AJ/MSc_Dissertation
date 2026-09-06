const fs = require("fs");
const path = require("path");

const metricsFolder = path.join(__dirname, "..", "..", "metrics");
const backendCsv = path.join(metricsFolder, "backend_metrics.csv");

const CSV_HEADER = "RequestNo,Timestamp,API,LoadingType,Method,Endpoint,StatusCode,ResponseTime(ms),ResponseSize(Bytes)\n";

/*
Ensure metrics folder and CSV exist
*/

function ensureBackendCsv() {
    if (!fs.existsSync(metricsFolder)) {
        fs.mkdirSync(metricsFolder, { recursive: true });
    }
    if (!fs.existsSync(backendCsv)) {
        fs.writeFileSync(backendCsv, CSV_HEADER);
    }
}

/*
Get next request number

*/

function getNextRequestNumber() {
    ensureBackendCsv();
    const file = fs.readFileSync(backendCsv, "utf8");
    const lines = file.trim().split("\n");

    // Header only
    if (lines.length === 1) {
        return 1;
    }

    return lines.length;
}

/*
Append metrics
*/

function logBackendMetrics(data) {
    ensureBackendCsv();
    const requestNo = getNextRequestNumber();
    const row = [
        requestNo,
        data.timestamp,
        data.api,
        data.loadingType,
        data.method,
        data.endpoint,
        data.statusCode,
        data.responseTime,
        data.responseSize
    ].join(",") + "\n";

    fs.appendFileSync(backendCsv, row);

}

module.exports = {
    logBackendMetrics
};