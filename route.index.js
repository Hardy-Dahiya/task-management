const express = require("express");
const router = express.Router();
// task routes
const taskRoute = require("./src/routes/task.route");
// todo routes
const todoRoute = require("./src/routes/todo.route");

router.use("/task", taskRoute);
router.use("/todo", todoRoute);
module.exports = router;
