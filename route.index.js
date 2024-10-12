const express = require("express");
const router = express.Router();
// task routes
const taskRoute = require("./src/routes/task.route");

router.use("/task", taskRoute);
module.exports = router;
