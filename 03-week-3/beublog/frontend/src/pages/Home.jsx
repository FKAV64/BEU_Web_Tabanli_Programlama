import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get('/posts');
        setPosts(res.data);
      } catch (err) {
        setError('Yazılar yüklenirken bir sunucu hatası oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);

  // Helper function to remove HTML tags from the ReactQuill rich text
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  if (loading) return <div className="text-center mt-20 text-xl font-medium">Yazılar yükleniyor...</div>;
  if (error) return <div className="text-center mt-20 text-red-500 bg-red-50 p-4 rounded max-w-md mx-auto">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white border-b pb-4 dark:border-gray-700">
        Son Yazılar
      </h1>

      {posts.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-lg">Henüz hiç yazı yayınlanmamış.</p>
        </div>
      ) : (
        <div className="grid gap-8">
          {posts.map(post => (
            <article key={post._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border dark:border-gray-700 flex flex-col md:flex-row">
              
              {/* Display the uploaded image. We append http://localhost:5000 because the database only saved the /uploads/filename.jpg path */}
              {post.image ? (
                <img 
                  src={`http://localhost:5000${post.image}`} 
                  alt={post.title} 
                  className="w-full md:w-1/3 h-56 md:h-auto object-cover"
                />
              ) : (
                <div className="w-full md:w-1/3 h-56 md:h-auto bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                  Görsel Yok
                </div>
              )}
              
              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2.5 py-1 rounded-full font-semibold">
                      {post.category?.name || 'Kategorisiz'}
                    </span>
                    <span>•</span>
                    <time>{new Date(post.createdAt).toLocaleDateString('tr-TR')}</time>
                  </div>
                  
                  <Link to={`/post/${post.slug}`}>
                    <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      {post.title}
                    </h2>
                  </Link>
                  
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
                    {stripHtml(post.content).substring(0, 180)}...
                  </p>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t dark:border-gray-700">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
                      {post.author?.username?.charAt(0).toUpperCase()}
                    </span>
                    {post.author?.username}
                  </span>
                  <Link 
                    to={`/post/${post.slug}`}
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    Devamını Oku &rarr;
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}