import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const AdminPanel = () => {
    const { user, loading: authLoading } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await api.get('/admin/users');
                setUsers(response.data);
            } catch (err) {
                console.error('Error fetching admin users:', err);
                setError('Failed to load users. Make sure you are an admin.');
            } finally {
                setLoading(false);
            }
        };

        if (user?.role === 'admin') {
            fetchUsers();
        } else {
            setLoading(false);
        }
    }, [user]);

    if (authLoading || loading) return <div style={styles.stateMessage}>Loading admin panel...</div>;
    if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
    if (error) return <div style={{ ...styles.stateMessage, color: '#d32f2f' }}>{error}</div>;

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Admin Dashboard</h2>
            <p style={styles.subtitle}>Manage users and monitor system activity.</p>

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr style={styles.tableHeadRow}>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Avatar</th>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Role</th>
                            <th style={styles.th}>Joined</th>
                            <th style={styles.th}>Posts</th>
                            <th style={styles.th}>Comments</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(u => {
                            const defaultAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(u.name) + '&background=random';
                            return (
                                <tr key={u.id} style={styles.tableRow}>
                                    <td style={styles.td}>{u.id}</td>
                                    <td style={styles.td}>
                                        <img
                                            src={u.avatarUrl || defaultAvatar}
                                            alt={`${u.name}'s avatar`}
                                            style={styles.avatar}
                                            onError={e => e.target.src = defaultAvatar}
                                        />
                                    </td>
                                    <td style={styles.td}><strong>{u.name}</strong></td>
                                    <td style={styles.td}>{u.email}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.roleBadge,
                                            backgroundColor: u.role === 'admin' ? '#e84e1b' : '#1da1f2'
                                        }}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td style={styles.td}>{u._count?.posts || 0}</td>
                                    <td style={styles.td}>{u._count?.comments || 0}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        maxWidth: '1000px',
        margin: '0 auto',
    },
    stateMessage: {
        textAlign: 'center',
        padding: '40px',
        fontSize: '1.2em',
        color: '#666',
    },
    title: {
        marginBottom: '8px',
        color: '#333',
    },
    subtitle: {
        marginBottom: '24px',
        color: '#666',
    },
    tableContainer: {
        overflowX: 'auto',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left',
    },
    tableHeadRow: {
        backgroundColor: '#f5f8fa',
        borderBottom: '2px solid #e1e8ed',
    },
    th: {
        padding: '16px',
        color: '#657786',
        fontWeight: 'bold',
        fontSize: '0.9em',
        textTransform: 'uppercase',
    },
    tableRow: {
        borderBottom: '1px solid #e1e8ed',
        transition: 'background-color 0.2s',
    },
    td: {
        padding: '16px',
        color: '#14171a',
        verticalAlign: 'middle',
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        objectFit: 'cover',
    },
    roleBadge: {
        padding: '4px 8px',
        color: 'white',
        borderRadius: '12px',
        fontSize: '0.8em',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    }
};

export default AdminPanel;
