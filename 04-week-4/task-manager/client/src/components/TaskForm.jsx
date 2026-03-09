import { useState } from 'react';

function TaskForm({ onCreateTask, onClose }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Kişisel',
        priority: 'Orta',
        dueDate: '',
        subtasks: [],
    });
    const [subtaskInput, setSubtaskInput] = useState('');

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddSubtask = () => {
        if (!subtaskInput.trim()) return;
        setFormData((prev) => ({
            ...prev,
            subtasks: [
                ...prev.subtasks,
                { title: subtaskInput.trim(), isCompleted: false },
            ],
        }));
        setSubtaskInput('');
    };

    const handleRemoveSubtask = (index) => {
        setFormData((prev) => ({
            ...prev,
            subtasks: prev.subtasks.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        const taskData = {
            ...formData,
            dueDate: formData.dueDate || null,
        };

        onCreateTask(taskData);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <form
                className="task-form"
                onClick={(e) => e.stopPropagation()}
                onSubmit={handleSubmit}
            >
                <h2 className="task-form__title">Yeni Görev Oluştur</h2>

                {/* Title */}
                <div className="task-form__group">
                    <label className="task-form__label">Başlık</label>
                    <input
                        type="text"
                        className="task-form__input"
                        placeholder="Görev başlığı..."
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        autoFocus
                    />
                </div>

                {/* Description */}
                <div className="task-form__group">
                    <label className="task-form__label">Açıklama</label>
                    <textarea
                        className="task-form__textarea"
                        placeholder="Açıklama ekle..."
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                    />
                </div>

                {/* Category + Priority row */}
                <div className="task-form__row">
                    <div className="task-form__group">
                        <label className="task-form__label">Kategori</label>
                        <select
                            className="task-form__select"
                            value={formData.category}
                            onChange={(e) => handleChange('category', e.target.value)}
                        >
                            <option value="İş">İş</option>
                            <option value="Kişisel">Kişisel</option>
                            <option value="Okul">Okul</option>
                        </select>
                    </div>

                    <div className="task-form__group">
                        <label className="task-form__label">Öncelik</label>
                        <select
                            className="task-form__select"
                            value={formData.priority}
                            onChange={(e) => handleChange('priority', e.target.value)}
                        >
                            <option value="Düşük">Düşük</option>
                            <option value="Orta">Orta</option>
                            <option value="Yüksek">Yüksek</option>
                            <option value="Acil">Acil</option>
                        </select>
                    </div>
                </div>

                {/* Due date */}
                <div className="task-form__group">
                    <label className="task-form__label">Bitiş Tarihi</label>
                    <input
                        type="date"
                        className="task-form__input"
                        value={formData.dueDate}
                        onChange={(e) => handleChange('dueDate', e.target.value)}
                    />
                </div>

                {/* Subtasks */}
                <div className="task-form__group">
                    <label className="task-form__label">Alt Görevler</label>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <input
                            type="text"
                            className="task-form__input"
                            placeholder="Alt görev ekle..."
                            value={subtaskInput}
                            onChange={(e) => setSubtaskInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddSubtask();
                                }
                            }}
                        />
                        <button
                            type="button"
                            className="task-form__cancel-btn"
                            onClick={handleAddSubtask}
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            Ekle
                        </button>
                    </div>
                    {formData.subtasks.length > 0 && (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {formData.subtasks.map((sub, i) => (
                                <li
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '6px 10px',
                                        marginBottom: '4px',
                                        borderRadius: '6px',
                                        background: 'rgba(255,255,255,0.03)',
                                        fontSize: '13px',
                                        color: '#9898b0',
                                    }}
                                >
                                    <span>☐ {sub.title}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSubtask(i)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                        }}
                                    >
                                        ✕
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Actions */}
                <div className="task-form__actions">
                    <button type="submit" className="task-form__submit-btn">
                        Oluştur
                    </button>
                    <button
                        type="button"
                        className="task-form__cancel-btn"
                        onClick={onClose}
                    >
                        İptal
                    </button>
                </div>
            </form>
        </div>
    );
}

export default TaskForm;
