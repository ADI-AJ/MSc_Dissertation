// It will do the following: start timer, wait until response finishes, calculate metrics, call csvLogger

const { logBackendMetrics } = require("../utils/csvLogger");

function metricsMiddleware(req, res, next) {
    if (req.originalUrl.includes("/frontend-metrics")) { //Ignores frontend_metrics log in backend metrics csv file
        return next();
    }

    if (req.originalUrl.includes("/filter-options")) { //Ignore filter loading
        return next();
    }

    if (
        req.originalUrl.includes("/graphql") &&
        req.body &&
        req.body.query &&
        req.body.query.includes("filterOptions")
    ) {
        return next();
    }

    const startTime = process.hrtime.bigint();
    const originalWrite = res.write;
    const originalEnd = res.end;

    let responseSize = 0;

    res.write = function (chunk, encoding, cb) {
        if (chunk) {
            if (Buffer.isBuffer(chunk)) {
                responseSize += chunk.length;
            } else {
                responseSize += Buffer.byteLength(chunk, typeof encoding === "string" ? encoding : "utf8");
            }
        }
        return originalWrite.apply(this, arguments);
    };

    res.end = function (chunk, encoding, cb) {
        if (chunk && typeof chunk !== "function") {
            if (Buffer.isBuffer(chunk)) {
                responseSize += chunk.length;
            } else {
                responseSize += Buffer.byteLength(chunk, typeof encoding === "string" ? encoding : "utf8");
            }
        }
        return originalEnd.apply(this, arguments);
    };

    res.on("finish", () => {
        const endTime = process.hrtime.bigint();
        const responseTime = Number(endTime - startTime) / 1000000;
        const contentLength = res.getHeader("content-length");
        const finalResponseSize = responseSize || (contentLength ? parseInt(contentLength, 10) : 0);

        logBackendMetrics({
            timestamp: new Date().toISOString(),
            api: req.originalUrl.includes("/graphql")
                ? "GraphQL"
                : "REST",
            loadingType: req.headers["x-loading-type"] || "Unknown",
            method: req.method,
            endpoint: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: responseTime.toFixed(2),
            responseSize: finalResponseSize
        });
    });

    next();
}

module.exports = metricsMiddleware;