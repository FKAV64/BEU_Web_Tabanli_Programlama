import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:3000/api/tasks',
});

// GET /api/tasks — supports optional query params: status, category, priority
export const fetchTasks = (filters = {}) => {
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.category) params.category = filters.category;
    if (filters.priority) params.priority = filters.priority;
    return API.get('/', { params });
};

// POST /api/tasks
export const createTask = (taskData) => API.post('/', taskData);

// PUT /api/tasks/:id
export const updateTask = (id, taskData) => API.put(`/${id}`, taskData);

// DELETE /api/tasks/:id
export const deleteTask = (id) => API.delete(`/${id}`);
