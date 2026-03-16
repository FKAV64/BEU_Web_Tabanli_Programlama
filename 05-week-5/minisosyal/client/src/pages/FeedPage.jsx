import React, { useState, useEffect } from 'react';
import api from '../services/api';
import PostCard from '../components/PostCard';
import NewPost from '../components/NewPost';

const FeedPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // Search and Pagination state
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const fetchData = async () => {
        try {
            // Fetch current user if token exists
            if (localStorage.getItem('token')) {
                const userResponse = await api.get('/auth/me');
                setCurrentUser(userResponse.data);
            }

            // Fetch posts with query params
            const postResponse = await api.get(`/posts?search=${encodeURIComponent(searchQuery)}&page=${page}&limit=10`);

            const fetchedPosts = postResponse.data.posts || postResponse.data;
            if (page === 1) {
                setPosts(fetchedPosts);
            } else {
                setPosts(prev => [...prev, ...fetchedPosts]);
            }
            setHasMore(fetchedPosts.length === 10);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load feed. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch when search or page changes
    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]); // we deliberately don't trigger re-fetch on every keystroke of 'search'

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPosts([]); // Clear posts while searching
        setPage(1); // Reset to first page on new search
        if (page === 1) {
            fetchData();
        }
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPosts([]);
        setPage(1);
        if (page === 1) {
            fetchData();
        }
    };

    const handlePostDeleted = (postId) => {
        setPosts(posts.filter((post) => post.id !== postId));
    };

    const handlePostCreated = (newPost) => {
        setPosts([newPost, ...posts]);
    };

    if (loading) return <div style={styles.loading}>Loading feed...</div>;
    if (error) return <div style={styles.error}>{error}</div>;

    return (
        <div style={styles.container}>
            <h2>MiniSosyal Feed</h2>

            <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
                <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    style={styles.searchInput}
                />
                <button type="submit" style={styles.searchBtn}>Search</button>
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => { setSearchQuery(''); setPage(1); setTimeout(fetchData, 0) }}
                        style={styles.clearBtn}
                    >
                        Clear
                    </button>
                )}
            </form>

            {currentUser && <NewPost onPostCreated={handlePostCreated} />}
            {posts.length === 0 ? (
                <p>No posts yet. Be the first to share something!</p>
            ) : (
                <div style={styles.feed}>
                    {posts.map((post) => (
                        <PostCard
                            key={post.id}
                            post={post}
                            currentUser={currentUser}
                            onPostDeleted={handlePostDeleted}
                            onUpdate={fetchData}
                        />
                    ))}
                </div>
            )}

            {hasMore && (
                <div style={styles.pagination}>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        style={styles.pageBtn}
                    >
                        Load More
                    </button>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
    },
    loading: {
        textAlign: 'center',
        padding: '40px',
        fontSize: '1.2em',
        color: '#666',
    },
    error: {
        textAlign: 'center',
        padding: '40px',
        color: '#d32f2f',
    },
    feed: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginTop: '20px',
    },
    searchForm: {
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
    },
    searchInput: {
        flex: 1,
        padding: '10px',
        borderRadius: '20px',
        border: '1px solid #ccc',
        outline: 'none',
    },
    searchBtn: {
        padding: '8px 16px',
        backgroundColor: '#1da1f2',
        color: 'white',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer',
    },
    clearBtn: {
        padding: '8px 16px',
        backgroundColor: '#e0e0e0',
        color: '#333',
        border: 'none',
        borderRadius: '20px',
        cursor: 'pointer',
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        marginTop: '32px',
        marginBottom: '32px',
    },
    pageBtn: {
        padding: '8px 16px',
        backgroundColor: '#1da1f2',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
    }
};

export default FeedPage;
