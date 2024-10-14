const { logger } = require("../../logger");
const Task = require("../model/Task");

// Create a new task
const createTask = async (req, res) => {
    try {
        const { task_number, task_name, due_date, status } = req.body;
        const newTask = new Task({
            task_number,
            task_name,
            due_date,
            status,
        });
        const savedTask = await newTask.save();
        return res.send({
            status: true,
            message: "Task created successfully",
            data: savedTask,
        });
    } catch (error) {
        logger.error(error);
        return res.status(500).send({ status: false, message: error.message });
    }
};

// Get all tasks
const getTasks = async (req, res) => {
    try {
        const { completed } = req.query; // Get the completed status from query

        // Build the query based on whether completed is specified
        const query = {};
        if (completed) {
            query.completed = completed === "true"; // Convert to boolean
        }

        const tasks = await Task.find(query).sort({ createdAt: -1 }); // Fetch tasks based on the query
        return res.send({ status: true, data: tasks });
    } catch (error) {
        logger.error(error);
        return res.status(500).send({ status: false, message: error.message });
    }
};

const getTodayTasks = async (req, res) => {
    try {
        const { completed } = req.query; // Get the completed status from query

        // Get the current date (without the time) for comparison
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0); // Set the time to the start of the day (00:00:00)

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999); // Set the time to the end of the day (23:59:59)

        // Build the query for today based on createdAt range
        const query = { createdAt: { $gte: startOfDay, $lte: endOfDay } };

        // If `completed` is specified, add it to the query
        if (completed) {
            query.completed = completed === "true"; // Convert to boolean
        }

        // Fetch tasks that match the query and sort them by creation date in descending order
        const tasks = await Task.find(query).sort({ createdAt: -1 });
        return res.send({ status: true, data: tasks });
    } catch (error) {
        logger.error(error);
        return res.status(500).send({ status: false, message: error.message });
    }
};

// Get a single task by ID
const getTaskById = async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).send({ status: false, message: "Task not found" });
        }
        return res.send({
            status: true,
            data: task,
        });
    } catch (error) {
        logger.error(error);
        return res.status(500).send({ status: false, message: error.message });
    }
};

// Update a task by ID
const updateTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const { task_number, task_name, status, due_date, completed } = req.body;
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            {
                task_name: task_name,
                task_number: task_number,
                due_date: due_date,
                status: status,
                completed: completed,
            },
            { new: true },
        );
        if (!updatedTask) {
            return res.status(404).send({ status: false, message: "Task not found" });
        }
        return res.send({
            status: true,
            message: "Task updated successfully",
            data: updatedTask,
        });
    } catch (error) {
        logger.error(error);
        return res.status(500).send({ status: false, message: error.message });
    }
};

// Delete a task by ID
const deleteTask = async (req, res) => {
    try {
        const taskId = req.params.id;
        const deletedTask = await Task.findByIdAndDelete(taskId);
        if (!deletedTask) {
            return res.status(404).send({ status: false, message: "Task not found" });
        }
        return res.send({
            status: true,
            message: "Task deleted successfully",
        });
    } catch (error) {
        logger.error(error);
        return res.status(500).send({ status: false, message: error.message });
    }
};

module.exports = {
    createTask,
    getTasks,
    getTodayTasks,
    getTaskById,
    updateTask,
    deleteTask,
};
