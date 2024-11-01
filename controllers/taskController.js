const Task = require('../models/Task');

// Create Task
const createTask = async (req, res) => {
    const { title, priority, dueDate, category, checklist, assignedTo } = req.body;

    // Validate incoming data
    if (!title || !priority) {
        return res.status(400).json({ message: 'Title and Priority are required' });
    }

    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority.toLowerCase())) { // Check for lowercase
        return res.status(400).json({ message: 'Invalid priority value' });
    }

    try {
        const task = new Task({
            title,
            priority: priority.toLowerCase(), // Store as lowercase
            dueDate,
            category,
            checklist,
            assignedTo,
            createdBy: req.user._id, // Ensure req.user._id is available
        });

        await task.save();
        res.status(201).json(task);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get All Tasks
const getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ createdBy: req.user._id });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Update Task
const updateTask = async (req, res) => {
    const { taskId } = req.params;
    const { title, priority, dueDate, category, checklist, status, assignedTo } = req.body;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if the user is the creator of the task
        if (task.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Update task properties
        if (title) task.title = title;
        if (priority) task.priority = priority.toLowerCase(); // Store as lowercase
        if (dueDate) task.dueDate = dueDate;
        if (category) task.category = category;
        if (checklist) task.checklist = checklist;
        if (status) task.status = status;
        if (assignedTo) task.assignedTo = assignedTo;

        await task.save();
        res.json({ message: 'Task updated successfully', task });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete Task
// Delete Task
const deleteTask = async (req, res) => {
    const { taskId } = req.params; // Check if taskId is correctly passed

    try {
        // Find task by ID
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' }); // Error if task is missing
        }

        // Check if user is the creator of the task
        if (task.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' }); // Error if user is not the creator
        }

        // Delete task
        await task.remove();
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error); // Log error for debugging
        res.status(500).json({ message: 'Server error' });
    }
};


// Filter Tasks
const filterTasks = async (req, res) => {
    const { filter } = req.query; // today, this week, this month
    let dateRange = {};

    const today = new Date();
    switch (filter) {
        case 'today':
            dateRange = {
                $gte: new Date(today.setHours(0, 0, 0, 0)),
                $lte: new Date(today.setHours(23, 59, 59, 999)),
            };
            break;
        case 'thisWeek':
            const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
            const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
            dateRange = { $gte: startOfWeek, $lte: endOfWeek };
            break;
        case 'thisMonth':
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            dateRange = { $gte: startOfMonth, $lte: endOfMonth };
            break;
        default:
            return res.status(400).json({ message: 'Invalid filter' });
    }

    try {
        const tasks = await Task.find({
            createdBy: req.user._id,
            dueDate: dateRange,
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Get Single Task by ID
const getTaskById = async (req, res) => {
    const { taskId } = req.params;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if the user is the creator or assigned user
        if (task.createdBy.toString() !== req.user._id.toString() && task.assignedTo !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createTask, getAllTasks, updateTask, deleteTask, filterTasks, getTaskById };
