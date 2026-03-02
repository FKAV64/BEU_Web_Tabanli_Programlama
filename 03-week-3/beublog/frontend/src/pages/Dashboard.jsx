import React, { useState, useEffect, useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only fetch posts if the user is loaded and exists
    if (user) {
      fetchMyPosts();
    }
  }, [user]);

  const fetchMyPosts = async () => {
    try {
      const res = await api.get('/auth/me/posts');
      setPosts(res.data);
    } catch (err) {
      setError('Yazılar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Bu yazıyı silmek istediğinize emin misiniz?')) {
      try {
        await api.delete(`/posts/${postId}`);
        // Remove the deleted post from the screen without refreshing the page
        setPosts(posts.filter(post => post._id !== postId)); 
      } catch (err) {
        alert('Yazı silinemedi.');
      }
    }
  };

  // If we are still checking the token, show a loading message
  if (authLoading) return <div className="text-center mt-10">Yükleniyor...</div>;
  
  // If no user is logged in, kick them back to the login page securely
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-8 border-b dark:border-gray-700 pb-4">
        <div>
          <h1 className="text-3xl font-bold">Hoş geldin, {user.username}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Buradan yazılarını yönetebilirsin.</p>
        </div>
        <Link 
          to="/create-post" 
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          <PlusCircle size={20} /> Yeni Yazı
        </Link>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {loading ? (
        <div>Yazılarınız yükleniyor...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 mb-4">Henüz bir yazı paylaşmadın.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <div key={post._id} className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm">
              <div>
                <h3 className="text-xl font-semibold">{post.title}</h3>
                <div className="flex gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>Kategori: {post.category?.name || 'Belirtilmedi'}</span>
                  <span>Durum: {post.status}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link to={`/edit-post/${post._id}`} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition-colors">
                  <Edit size={20} />
                </Link>
                <button 
                  onClick={() => handleDelete(post._id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}