const { logger } = require("../../logger");
const Todo = require("../model/Todo");

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

// Get all todos
const getTodos = async (req, res) => {
    try {
        const { completed } = req.query; // Get the completed status from query

        // Build the query based on whether completed is specified
        const query = {};
        if (completed) {
            query.completed = completed === "true"; // Convert to boolean
        }

        const todos = await Todo.find(query); // Fetch tasks based on the query
        return res.send({ status: true, data: todos });
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
