import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const ProfilePage = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');
    const [editAvatarUrl, setEditAvatarUrl] = useState(user?.avatarUrl || '');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    if (!user) return <div>Loading profile...</div>;

    const defaultAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&background=random';

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        setEditName(user.name);
        setEditAvatarUrl(user.avatarUrl || '');
        setMessage({ text: '', type: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        const result = await updateProfile({ name: editName, avatarUrl: editAvatarUrl });

        if (result.success) {
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
            setIsEditing(false);
        } else {
            setMessage({ text: result.error, type: 'error' });
        }
        setLoading(false);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Your Profile</h2>

                <div style={styles.profileInfo}>
                    <img
                        src={user.avatarUrl || defaultAvatar}
                        alt={`${user.name}'s avatar`}
                        style={styles.avatarLarge}
                        onError={(e) => { e.target.src = defaultAvatar; }}
                    />
                    <div style={styles.details}>
                        <p><strong>Name:</strong> {user.name}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Role:</strong> {user.role}</p>
                        <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>

                {message.text && (
                    <div style={message.type === 'success' ? styles.success : styles.error}>
                        {message.text}
                    </div>
                )}

                {!isEditing ? (
                    <button onClick={handleEditToggle} style={styles.editToggleBtn}>
                        ✏️ Edit Profile Information
                    </button>
                ) : (
                    <>
                        <hr style={styles.divider} />
                        <form onSubmit={handleSubmit} style={styles.form}>
                            <h3 style={styles.subtitle}>Edit Profile</h3>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Name</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Your name"
                                    style={styles.input}
                                    required
                                />
                            </div>

                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Avatar Image URL</label>
                                <input
                                    type="url"
                                    value={editAvatarUrl}
                                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                                    placeholder="https://example.com/my-photo.jpg"
                                    style={styles.input}
                                />
                            </div>

                            {editAvatarUrl && (
                                <div style={styles.previewContainer}>
                                    <label style={styles.label}>Preview</label>
                                    <img
                                        src={editAvatarUrl}
                                        alt="Avatar preview"
                                        style={styles.previewImg}
                                        onError={(e) => { e.target.src = defaultAvatar; }}
                                    />
                                </div>
                            )}

                            <div style={styles.formActions}>
                                <button
                                    type="submit"
                                    style={styles.saveBtn}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleEditToggle}
                                    style={styles.cancelBtn}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        padding: '20px',
    },
    card: {
        width: '100%',
        maxWidth: '500px',
        padding: '32px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    title: {
        marginTop: 0,
        marginBottom: '24px',
        color: '#333',
        textAlign: 'center',
    },
    subtitle: {
        marginBottom: '16px',
        color: '#444',
    },
    profileInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        marginBottom: '24px',
    },
    avatarLarge: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '3px solid #1da1f2',
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    divider: {
        border: 'none',
        borderTop: '1px solid #eee',
        margin: '24px 0',
    },
    editToggleBtn: {
        width: '100%',
        padding: '12px',
        backgroundColor: '#1da1f2',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1em',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        fontSize: '0.9em',
        color: '#555',
        fontWeight: '500',
    },
    input: {
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '1em',
    },
    previewContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
    },
    previewImg: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid #ddd',
    },
    formActions: {
        display: 'flex',
        gap: '12px',
        marginTop: '8px',
    },
    saveBtn: {
        flex: 1,
        padding: '12px',
        backgroundColor: '#1da1f2',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1em',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    cancelBtn: {
        flex: 1,
        padding: '12px',
        backgroundColor: '#e0e0e0',
        color: '#333',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1em',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    success: {
        backgroundColor: '#e8f5e9',
        color: '#2e7d32',
        padding: '12px',
        borderRadius: '4px',
        marginBottom: '16px',
        textAlign: 'center',
    },
    error: {
        backgroundColor: '#ffebee',
        color: '#c62828',
        padding: '12px',
        borderRadius: '4px',
        marginBottom: '16px',
        textAlign: 'center',
    }
};

export default ProfilePage;
