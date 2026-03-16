import React, { useState } from 'react';
import api from '../services/api';

const PostCard = ({ post, currentUser, onPostDeleted, onUpdate }) => {
    const [likesCount, setLikesCount] = useState(post._count?.likes || 0);
    const [isLiked, setIsLiked] = useState(
        post.likes?.some((like) => like.userId === currentUser?.id) || false
    );
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState(post.comments || []);
    const [newComment, setNewComment] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [postContent, setPostContent] = useState(post.content);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const isAuthor = currentUser && currentUser.id === post.authorId;
    const isAdmin = currentUser && currentUser.role === 'admin';

    const handleLike = async () => {
        if (!currentUser) return;
        try {
            const { data } = await api.post(`/posts/${post.id}/like`);
            setIsLiked(data.liked);
            setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !currentUser) return;

        try {
            const { data } = await api.post(`/posts/${post.id}/comments`, { text: newComment });
            setComments([data, ...comments]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/posts/${post.id}`);
            setShowDeleteModal(false);
            if (onPostDeleted) onPostDeleted(post.id);
        } catch (error) {
            console.error('Error deleting post:', error);
            setShowDeleteModal(false);
        }
    };

    const handleEditSave = async () => {
        try {
            await api.put(`/posts/${post.id}`, { content: editContent });
            setPostContent(editContent);
            setIsEditing(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Error updating post:', error);
        }
    };

    const defaultAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.author?.name || 'User') + '&background=random';

    return (
        <div style={styles.card}>
            <div style={styles.header}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                        src={post.author?.avatarUrl || defaultAvatar}
                        alt="author avatar"
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                        onError={(e) => { e.target.src = defaultAvatar; }}
                    />
                    <strong>{post.author?.name || 'Unknown User'}</strong>
                </div>
                <span style={styles.date}>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>

            {isEditing ? (
                <div style={styles.editContainer}>
                    <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        style={styles.editTextarea}
                        rows="3"
                    />
                    <div style={styles.editActions}>
                        <button onClick={handleEditSave} style={styles.saveBtn}>Save</button>
                        <button onClick={() => { setIsEditing(false); setEditContent(postContent); }} style={styles.cancelBtn}>Cancel</button>
                    </div>
                </div>
            ) : (
                <p style={styles.content}>{postContent}</p>
            )}

            {post.imageUrl && (
                <img src={post.imageUrl} alt="Post attachment" style={styles.image} />
            )}

            <div style={styles.actions}>
                <button onClick={handleLike} style={isLiked ? styles.likedBtn : styles.btn}>
                    {isLiked ? '❤️' : '🤍'} {likesCount}
                </button>
                <button onClick={() => setShowComments(!showComments)} style={styles.btn}>
                    💬 {comments.length}
                </button>
                {isAuthor && !isEditing && (
                    <button onClick={() => setIsEditing(true)} style={styles.editBtn}>
                        ✏️ Edit
                    </button>
                )}
                {(isAuthor || isAdmin) && !isEditing && (
                    <button onClick={() => setShowDeleteModal(true)} style={styles.deleteBtn}>
                        🗑️ Delete
                    </button>
                )}
            </div>

            {showComments && (
                <div style={styles.commentSection}>
                    <form onSubmit={handleAddComment} style={styles.commentForm}>
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            style={styles.input}
                        />
                        <button type="submit" style={styles.submitBtn}>Post</button>
                    </form>

                    <div style={styles.commentList}>
                        {comments.map(comment => {
                            const cAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.author?.name || 'User') + '&background=random';
                            return (
                                <div key={comment.id} style={styles.comment}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <img
                                            src={comment.author?.avatarUrl || cAvatar}
                                            alt="comment avatar"
                                            style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                                            onError={(e) => { e.target.src = cAvatar; }}
                                        />
                                        <strong>{comment.author?.name || 'User'}: </strong>
                                    </div>
                                    <span style={{ marginLeft: '28px' }}>{comment.text}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalBox}>
                        <h3 style={styles.modalTitle}>⚠️ Delete Post</h3>
                        <p style={styles.modalText}>Are you sure you want to delete this post? This action cannot be undone.</p>
                        <div style={styles.modalActions}>
                            <button onClick={handleDelete} style={styles.modalDeleteBtn}>
                                Yes, Delete
                            </button>
                            <button onClick={() => setShowDeleteModal(false)} style={styles.modalCancelBtn}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    card: {
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '12px',
    },
    date: {
        color: '#888',
        fontSize: '0.9em',
    },
    content: {
        marginBottom: '12px',
        lineHeight: '1.5',
    },
    image: {
        width: '100%',
        maxHeight: '400px',
        objectFit: 'cover',
        borderRadius: '4px',
        marginBottom: '12px',
    },
    actions: {
        display: 'flex',
        gap: '12px',
        borderTop: '1px solid #eee',
        paddingTop: '12px',
    },
    btn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px 8px',
        color: '#555',
    },
    likedBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px 8px',
        color: '#e0245e',
    },
    editBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px 8px',
        color: '#1da1f2',
        marginLeft: 'auto',
    },
    deleteBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px 8px',
        color: '#d32f2f',
    },
    editContainer: {
        marginBottom: '12px',
    },
    editTextarea: {
        width: '100%',
        padding: '8px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '1em',
        fontFamily: 'inherit',
        resize: 'vertical',
        marginBottom: '8px',
        boxSizing: 'border-box'
    },
    editActions: {
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end',
    },
    saveBtn: {
        padding: '6px 12px',
        backgroundColor: '#1da1f2',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    cancelBtn: {
        padding: '6px 12px',
        backgroundColor: '#e0e0e0',
        color: '#333',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    commentSection: {
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px dotted #ccc',
    },
    commentForm: {
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
    },
    input: {
        flex: 1,
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    submitBtn: {
        padding: '8px 16px',
        backgroundColor: '#1da1f2',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    commentList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    comment: {
        padding: '8px',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
        fontSize: '0.95em',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
    },
    modalBox: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    },
    modalTitle: {
        margin: '0 0 12px 0',
        fontSize: '1.3em',
        color: '#333',
    },
    modalText: {
        margin: '0 0 24px 0',
        color: '#666',
        lineHeight: '1.5',
    },
    modalActions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'center',
    },
    modalDeleteBtn: {
        padding: '10px 24px',
        backgroundColor: '#d32f2f',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1em',
        fontWeight: 'bold',
        cursor: 'pointer',
    },
    modalCancelBtn: {
        padding: '10px 24px',
        backgroundColor: '#e0e0e0',
        color: '#333',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1em',
        fontWeight: 'bold',
        cursor: 'pointer',
    }
};

export default PostCard;
