// Map for next-status transitions
const NEXT_STATUS = {
    'todo': 'in-progress',
    'in-progress': 'done',
    'done': 'todo',
};

const NEXT_STATUS_LABEL = {
    'todo': 'Devam\'a taşı →',
    'in-progress': 'Tamamla ✓',
    'done': 'Yapılacak\'a geri al',
};

// CSS class map for priority badges
const PRIORITY_CLASS = {
    'Düşük': 'badge--dusuk',
    'Orta': 'badge--orta',
    'Yüksek': 'badge--yuksek',
    'Acil': 'badge--acil',
};

// CSS class map for category badges
const CATEGORY_CLASS = {
    'İş': 'badge--is',
    'Kişisel': 'badge--kisisel',
    'Okul': 'badge--okul',
};

function TaskCard({ task, onMoveTask, onUpdateTask, onDeleteTask }) {
    const now = new Date();

    // ── Due date logic ────────────────────────────────────
    const dueDate = task.dueDate ? new Date(task.dueDate) : null;
    let dueLabel = '';
    let dueClass = '';

    if (dueDate && task.status !== 'done') {
        const diffMs = dueDate - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (diffMs < 0) {
            const overdueDays = Math.abs(diffDays);
            dueLabel = `⚠ Gecikmiş: ${overdueDays} gün önce`;
            dueClass = 'task-card__due--overdue';
        } else if (diffDays === 0) {
            dueLabel = '📅 Bugün';
            dueClass = 'task-card__due--today';
        } else {
            dueLabel = `📅 ${diffDays} gün kaldı`;
            dueClass = 'task-card__due--upcoming';
        }
    } else if (dueDate && task.status === 'done') {
        dueLabel = `✅ ${dueDate.toLocaleDateString('tr-TR')}`;
        dueClass = 'task-card__due--upcoming';
    }

    // ── Subtask counter ───────────────────────────────────
    const totalSubs = task.subtasks ? task.subtasks.length : 0;
    const completedSubs = task.subtasks
        ? task.subtasks.filter((s) => s.isCompleted).length
        : 0;

    // ── Handlers ──────────────────────────────────────────
    const handleMove = () => {
        const nextStatus = NEXT_STATUS[task.status];
        onMoveTask(task._id, nextStatus);
    };

    const handleDelete = () => {
        onDeleteTask(task._id);
    };

    return (
        <div className="task-card">
            {/* Title */}
            <h4 className="task-card__title">{task.title}</h4>

            {/* Priority + Category badges */}
            <div className="task-card__badges">
                {task.priority && (
                    <span className={`badge ${PRIORITY_CLASS[task.priority] || ''}`}>
                        {task.priority}
                    </span>
                )}
                {task.category && (
                    <span className={`badge ${CATEGORY_CLASS[task.category] || ''}`}>
                        {task.category}
                    </span>
                )}
            </div>

            {/* Subtask counter */}
            {totalSubs > 0 && (
                <div className="task-card__subtasks">
                    {task.subtasks.map((sub, i) => (
                        <span key={sub._id || i}>{sub.isCompleted ? '☑' : '☐'}</span>
                    ))}
                    <span>
                        {completedSubs}/{totalSubs}
                    </span>
                </div>
            )}

            {/* Due date */}
            {dueLabel && (
                <div className={`task-card__due ${dueClass}`}>{dueLabel}</div>
            )}

            {/* Action buttons */}
            <div className="task-card__actions">
                <button className="task-card__action-btn" onClick={handleMove}>
                    {NEXT_STATUS_LABEL[task.status]}
                </button>
                <button
                    className="task-card__action-btn task-card__action-btn--delete"
                    onClick={handleDelete}
                >
                    Sil
                </button>
            </div>
        </div>
    );
}

export default TaskCard;
