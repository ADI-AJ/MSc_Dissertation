// It will do the following: start timer, wait until response finishes, calculate metrics, call csvLogger

const { logBackendMetrics } = require("../utils/csvLogger");

function metricsMiddleware(req, res, next) {
    const startTime = process.hrtime.bigint();
    const originalSend = res.send;

    let responseSize = 0;

    res.send = function (body) {
        if (body) {
            if (Buffer.isBuffer(body)) {
                responseSize = body.length;
            }
            else {
                responseSize = Buffer.byteLength(body.toString());
            }
        }
        return originalSend.call(this, body);
    };

    res.on("finish", () => {
        const endTime = process.hrtime.bigint();
        const responseTime = Number(endTime - startTime) / 1000000;

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
            responseSize
        });
    });

    next();
}

module.exports = metricsMiddleware;