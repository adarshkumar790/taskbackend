// server/routes/taskRoutes.js
const express = require('express');
const { createTask, getAllTasks, updateTask, deleteTask, filterTasks } = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Task routes
router.post('/create', authMiddleware, createTask);
router.get('/', getAllTasks);
router.put('/:taskId', authMiddleware, updateTask);
router.delete('/:taskId', authMiddleware, deleteTask);
router.get('/filter', authMiddleware, filterTasks);
router.put('/:taskId', authMiddleware, updateTask);

module.exports = router;
