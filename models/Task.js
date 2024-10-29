const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'], // Changed to lowercase
        required: true,
    },
    dueDate: {
        type: Date,
    },
    category: {
        type: String,
    },
    status: {
        type: String,
        enum: ['backlog', 'to-do', 'in-progress', 'done'],
        default: 'backlog',
    },
    checklist: {
        type: [String], // Define as an array of strings
        default: [],
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    shared: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
