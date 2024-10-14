const express = require("express");
const router = express.Router();
// const Middleware = require("../middleware/verifyToken");
const Task = require("../controller/tasks.controller");

router.get("/", Task.getTasks);
router.get("/today", Task.getTodayTasks);
router.get("/:id", Task.getTaskById);
router.post("/", Task.createTask);
router.put("/:id", Task.updateTask);
router.delete("/:id", Task.deleteTask);

module.exports = router;
