const Task = require('../models/Task');

// @desc    Get all tasks
// @route   GET /api/tasks
const getTasks = async (req, res, next) => {
    try {
        const { status, category, priority } = req.query;
        const filter = {};

        if (status) filter.status = status;
        if (category) filter.category = category;
        if (priority) filter.priority = priority;

        const tasks = await Task.find(filter).sort({ createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new task
// @route   POST /api/tasks
const createTask = async (req, res, next) => {
    try {
        const { title, description, category, priority, status, dueDate, subtasks } = req.body;

        if (!title || title.trim() === '') {
            res.status(400);
            throw new Error('Task title is required');
        }

        const task = await Task.create({
            title,
            description,
            category,
            priority,
            status,
            dueDate,
            subtasks: subtasks || [],
        });

        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a task (status, subtasks, or any field)
// @route   PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            res.status(404);
            throw new Error('Task not found');
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedTask);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            res.status(404);
            throw new Error('Task not found');
        }

        await Task.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Task removed', id: req.params.id });
    } catch (error) {
        next(error);
    }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
