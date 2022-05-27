const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const passport = require("passport");
const authorization = require("./authorization");
const logger = require("./logger");
const {createErrorResponse} = require("./response");
const pino = require("pino-http")({
    logger,
});

passport.use(authorization.strategy());

const app = express();
app.use(pino);
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(passport.initialize());

app.use("/", require("./routes"));

app.use((req, res) => {
    res.status(404).json({
        status: "error", error: {
            message: "not found", code: 404,
        },
    });
});

app.use((err, req, res) => {
    const status = err.status || 500;
    const message = err.message || "unable to process request";

    if (status > 499) {
        logger.error({err}, `Error processing request`);
    }

    res.status(status).json(createErrorResponse(status, message));
});

module.exports = app;
