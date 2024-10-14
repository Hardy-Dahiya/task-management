const { logger } = require("../../logger");
const Todo = require("../model/Todo");
const Task = require("../model/Task");

// Create a new todo
const createTodo = async (req, res) => {
    try {
        const { todo_name, status, due_date } = req.body;
        const newTodo = new Todo({
            todo_name,
            due_date,
            status,
        });
        const savedTodo = await newTodo.save();
        return res.send({
            status: true,
            message: "Todo created successfully",
            data: savedTodo,
        });
    } catch (error) {
        logger.error(error);
        return res.status(500).send({ status: false, message: error.message });
    }
};
// Get all todos and tasks
const getTodos = async (req, res) => {
    try {
        // Get the current date (without the time) for comparison
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0); // Set the time to the start of the day (00:00:00)

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999); // Set the time to the end of the day (23:59:59)

        // Build the query for today based on createdAt range
        const query = { due_date: { $gte: startOfDay, $lte: endOfDay } };

        const todos = await Todo.find(query); // Fetch todos based on the query
        const tasks = await Task.find(query); // Fetch tasks based on the query

        // Add type 'todo' for todos and type 'task' for tasks
        const todosWithType = todos.map((todo) => ({ ...todo.toObject(), type: "todo" }));
        const tasksWithType = tasks.map((task) => ({ ...task.toObject(), type: "task" }));

        // Combine todos and tasks
        const allItems = [...todosWithType, ...tasksWithType];

        return res.send({ status: true, data: allItems });
    } catch (error) {
        logger.error(error);
        return res.status(500).send({ status: false, message: error.message });
    }
};

// Get a single todo by ID
const getTodoById = async (req, res) => {
    try {
        const todoID = req.params.id;
        const todo = await Todo.findById(todoID);
        if (!todo) {
            return res.status(404).send({ status: false, message: "Todo not found" });
        }
        return res.send({
            status: true,
            data: todo,
        });
    } catch (error) {
        logger.error(error);
        return res.status(500).send({ status: false, message: error.message });
    }
};

// Update a todo by ID
const updateTodo = async (req, res) => {
    try {
        const todoID = req.params.id;
        const { todo_name, status, due_date, completed } = req.body;
        const updatedTask = await Todo.findByIdAndUpdate(
            todoID,
            {
                todo_name: todo_name,
                due_date: due_date,
                status: status,
                completed: status === "Completed" ? true : false,
            },
            { new: true },
        );
        if (!updatedTask) {
            return res.status(404).send({ status: false, message: "Todo not found" });
        }
        return res.send({
            status: true,
            message: "Todo updated successfully",
            data: updatedTask,
        });
    } catch (error) {
        logger.error(error);
        return res.status(500).send({ status: false, message: error.message });
    }
};

// Delete a todo by ID
const deleteTodo = async (req, res) => {
    try {
        const todoID = req.params.id;
        const deletedTask = await Todo.findByIdAndDelete(todoID);
        if (!deletedTask) {
            return res.status(404).send({ status: false, message: "Todo not found" });
        }
        return res.send({
            status: true,
            message: "Todo deleted successfully",
        });
    } catch (error) {
        logger.error(error);
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = {
    createTodo,
    getTodos,
    getTodoById,
    updateTodo,
    deleteTodo,
};
