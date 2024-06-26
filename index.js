const winston = require("winston");
const express = require("express");
const app = express();
const cors = require("cors");

const corsOptions = {
    origin: "*",
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/validation");
require("./startup/prod")(app);

const port = process.env.PORT || 4000;
const server = app.listen(port, () => winston.info(`listening in port ${port}...`));

module.exports = server;
