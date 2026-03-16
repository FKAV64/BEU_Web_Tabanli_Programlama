import React, { useState } from 'react';
import api from '../services/api';

const MAX_CHARS = 500;

const NewPost = ({ onPostCreated }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await api.post('/posts', { content });
            setContent(''); // Clear the textarea
            if (onPostCreated) {
                onPostCreated(response.data);
            }
        } catch (err) {
            console.error('Error creating post:', err);
            setError(err.response?.data?.message || 'Failed to create post. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const value = e.target.value;
        if (value.length <= MAX_CHARS) {
            setContent(value);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <textarea
                    style={styles.textarea}
                    placeholder="What's on your mind?"
                    value={content}
                    onChange={handleChange}
                    rows="4"
                    disabled={loading}
                />

                <div style={styles.footer}>
                    <span style={{
                        ...styles.counter,
                        color: content.length > MAX_CHARS - 20 ? '#d32f2f' : '#666'
                    }}>
                        {content.length}/{MAX_CHARS}
                    </span>

                    <button
                        type="submit"
                        style={{
                            ...styles.submitBtn,
                            opacity: (!content.trim() || loading) ? 0.7 : 1,
                            cursor: (!content.trim() || loading) ? 'not-allowed' : 'pointer'
                        }}
                        disabled={!content.trim() || loading}
                    >
                        {loading ? 'Sharing...' : 'Share'}
                    </button>
                </div>

                {error && <div style={styles.error}>{error}</div>}
            </form>
        </div>
    );
};

const styles = {
    container: {
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    textarea: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        resize: 'vertical',
        fontSize: '1em',
        fontFamily: 'inherit',
        marginBottom: '12px',
        boxSizing: 'border-box'
    },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    counter: {
        fontSize: '0.85em',
    },
    submitBtn: {
        padding: '8px 24px',
        backgroundColor: '#1da1f2',
        color: 'white',
        border: 'none',
        borderRadius: '20px',
        fontWeight: 'bold',
        transition: 'background-color 0.2s',
    },
    error: {
        color: '#d32f2f',
        marginTop: '12px',
        fontSize: '0.9em',
    }
};

export default NewPost;
