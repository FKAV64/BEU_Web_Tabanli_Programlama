import { useState, useEffect } from 'react';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import FilterBar from './components/FilterBar';
import { fetchTasks, createTask, updateTask, deleteTask } from './services/api';
import './index.css';

function App() {
    // ── Global State ──────────────────────────────────────
    const [tasks, setTasks] = useState([]);
    const [filters, setFilters] = useState({
        status: '',
        category: '',
        priority: '',
        search: '',
    });
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // ── Fetch tasks on mount & whenever filters change ────
    useEffect(() => {
        loadTasks();
    }, [filters.status, filters.category, filters.priority]);

    const loadTasks = async () => {
        try {
            setLoading(true);
            const { data } = await fetchTasks(filters);
            setTasks(data);
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    // ── Callback: create a new task ───────────────────────
    const handleCreateTask = async (taskData) => {
        try {
            const { data } = await createTask(taskData);
            setTasks((prev) => [data, ...prev]);
            setShowForm(false);
        } catch (error) {
            console.error('Failed to create task:', error);
        }
    };

    // ── Callback: move task to a new status column ────────
    const handleMoveTask = async (taskId, newStatus) => {
        try {
            const { data } = await updateTask(taskId, { status: newStatus });
            setTasks((prev) =>
                prev.map((task) => (task._id === taskId ? data : task))
            );
        } catch (error) {
            console.error('Failed to update task status:', error);
        }
    };

    // ── Callback: update any task field(s) ────────────────
    const handleUpdateTask = async (taskId, updatedFields) => {
        try {
            const { data } = await updateTask(taskId, updatedFields);
            setTasks((prev) =>
                prev.map((task) => (task._id === taskId ? data : task))
            );
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    // ── Callback: delete a task ───────────────────────────
    const handleDeleteTask = async (taskId) => {
        try {
            await deleteTask(taskId);
            setTasks((prev) => prev.filter((task) => task._id !== taskId));
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    // ── Client-side search filter ─────────────────────────
    const filteredTasks = tasks.filter((task) => {
        if (!filters.search) return true;
        const query = filters.search.toLowerCase();
        return (
            task.title.toLowerCase().includes(query) ||
            (task.description && task.description.toLowerCase().includes(query))
        );
    });

    // ── Derived dashboard stats ───────────────────────────
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    const totalCount = filteredTasks.length;
    const doneCount = filteredTasks.filter((t) => t.status === 'done').length;
    const overdueCount = filteredTasks.filter((t) => {
        if (!t.dueDate || t.status === 'done') return false;
        return new Date(t.dueDate) < now;
    }).length;
    const dueTodayCount = filteredTasks.filter((t) => {
        if (!t.dueDate) return false;
        return t.dueDate.slice(0, 10) === todayStr;
    }).length;

    return (
        <div className="app">
            {/* ── Dashboard Stats ─────────────────────────── */}
            <div className="dashboard">
                <span className="dashboard__title">Dashboard</span>
                <div className="dashboard__stats">
                    <div className="stat-badge stat-badge--total">
                        <span>Toplam</span>
                        <span className="stat-badge__value">{totalCount}</span>
                    </div>
                    <div className="stat-badge stat-badge--done">
                        <span>Tamamlanan</span>
                        <span className="stat-badge__value">{doneCount}</span>
                    </div>
                    <div className="stat-badge stat-badge--overdue">
                        <span>Geciken</span>
                        <span className="stat-badge__value">{overdueCount}</span>
                    </div>
                    <div className="stat-badge stat-badge--today">
                        <span>Bugün Biten</span>
                        <span className="stat-badge__value">{dueTodayCount}</span>
                    </div>
                </div>
            </div>

            {/* ── Filter Bar ──────────────────────────────── */}
            <FilterBar
                filters={filters}
                setFilters={setFilters}
                onNewClick={() => setShowForm(true)}
            />

            {/* ── Task Form Modal ─────────────────────────── */}
            {showForm && (
                <TaskForm
                    onCreateTask={handleCreateTask}
                    onClose={() => setShowForm(false)}
                />
            )}

            {/* ── Kanban Board ────────────────────────────── */}
            <TaskList
                tasks={filteredTasks}
                loading={loading}
                onMoveTask={handleMoveTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
            />
        </div>
    );
}

export default App;
