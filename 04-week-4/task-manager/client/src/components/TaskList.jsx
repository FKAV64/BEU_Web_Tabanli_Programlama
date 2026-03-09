import TaskCard from './TaskCard';

const COLUMNS = [
    {
        key: 'todo',
        title: 'Yapılacak',
        icon: '📋',
        className: 'kanban-column--todo',
    },
    {
        key: 'in-progress',
        title: 'Devam Ediyor',
        icon: '🔄',
        className: 'kanban-column--in-progress',
    },
    {
        key: 'done',
        title: 'Tamamlandı',
        icon: '✅',
        className: 'kanban-column--done',
    },
];

function TaskList({ tasks, loading, onMoveTask, onUpdateTask, onDeleteTask }) {
    if (loading) {
        return <p className="loading-text">Görevler yükleniyor...</p>;
    }

    return (
        <div className="kanban-board">
            {COLUMNS.map((col) => {
                const columnTasks = tasks.filter((t) => t.status === col.key);

                return (
                    <div key={col.key} className={`kanban-column ${col.className}`}>
                        <div className="kanban-column__header">
                            <span className="kanban-column__title">
                                {col.icon} {col.title}
                            </span>
                            <span className="kanban-column__count">{columnTasks.length}</span>
                        </div>

                        <div className="kanban-column__cards">
                            {columnTasks.length === 0 ? (
                                <p className="empty-column-text">Bu sütunda görev yok</p>
                            ) : (
                                columnTasks.map((task) => (
                                    <TaskCard
                                        key={task._id}
                                        task={task}
                                        onMoveTask={onMoveTask}
                                        onUpdateTask={onUpdateTask}
                                        onDeleteTask={onDeleteTask}
                                    />
                                ))
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default TaskList;
