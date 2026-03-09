const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Subtask title is required'],
            trim: true,
        },
        isCompleted: {
            type: Boolean,
            default: false,
        },
    },
    { _id: true }
);

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Görev başlığı zorunludur'],
            minlength: [10, 'Başlık en az 10 karakter olmalıdır'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        category: {
            type: String,
            enum: ['İş', 'Kişisel', 'Okul'],
            default: 'Kişisel',
        },
        priority: {
            type: String,
            enum: ['Düşük', 'Orta', 'Yüksek', 'Acil'],
            default: 'Orta',
        },
        status: {
            type: String,
            enum: ['todo', 'in-progress', 'done'],
            default: 'todo',
        },
        dueDate: {
            type: Date,
            required: [true, 'Bitiş tarihi zorunludur'],
        },
        subtasks: [subtaskSchema],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Task', taskSchema);
