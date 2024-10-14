const express = require("express");
const router = express.Router();
// const Middleware = require("../middleware/verifyToken");
const Todo = require("../controller/todos.controller");

router.get("/", Todo.getTodos);
router.get("/:id", Todo.getTodoById);
router.post("/", Todo.createTodo);
router.put("/:id", Todo.updateTodo);
router.delete("/:id", Todo.deleteTodo);

module.exports = router;
