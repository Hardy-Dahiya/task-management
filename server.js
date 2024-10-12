const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
// mongodb
const mongoDB = require("./src/db/db.connection");
const path = require("path");
const rootRoute = require("./route.index");
// logger
const { logger, apiLoggerMiddleware } = require("./logger");

dotenv.config();

app.use(express.static("public"));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false, limit: "10mb" }));

// parse application/json
app.use(bodyParser.json({ limit: "10mb" }));
// cors
app.use(cors());

app.get("/v1/healthCheck", async (req, res) => {
    try {
        res.send({ status: true, data: "server is live" });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});
app.use(apiLoggerMiddleware);
app.use("/v1", rootRoute);

// page template
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "multilang.html"));
});

// Routes

// connection to mongoDB
mongoDB()
    .then(() => {
        logger.info(`Database Connected`);
    })
    .catch((err) => logger.error(err));

// Set EJS as the view engine
app.set("view engine", "ejs");

app.listen(process.env.PORT, () => {
    logger.info(`Server is running on port ${process.env.PORT}`);
});
