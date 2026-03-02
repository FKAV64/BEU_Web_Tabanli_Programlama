import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Calendar, User, Tag, ThumbsUp, ArrowLeft } from 'lucide-react';

export default function PostDetail() {
  const { slug } = useParams(); // Grabs the slug from the URL
  const { user } = useContext(AuthContext); // To check if user is logged in
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/posts/by-slug/${slug}`);
        setPost(res.data);
      } catch (err) {
        setError('Yazı bulunamadı veya silinmiş olabilir.');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  const handleLike = async () => {
    if (!user) {
      alert('Yazıyı beğenmek için giriş yapmalısınız!');
      navigate('/login');
      return;
    }

    setLikeLoading(true);
    try {
      const res = await api.put(`/posts/${post._id}/like`);
      // Update the local state with the new array of likes from the backend
      setPost({ ...post, likes: res.data });
    } catch (err) {
      console.error('Beğenme işlemi başarısız', err);
    } finally {
      setLikeLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-20 text-xl font-medium">Yükleniyor...</div>;
  if (error) return <div className="text-center mt-20 text-red-500 bg-red-50 p-4 rounded max-w-md mx-auto">{error}</div>;
  if (!post) return null;

  // Check if the current logged-in user has already liked this post
  const hasLiked = user && post.likes.includes(user._id);

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 transition-colors font-medium">
        <ArrowLeft size={20} /> Ana Sayfaya Dön
      </Link>

      <article className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border dark:border-gray-700">
        {/* Cover Image */}
        {post.image && (
          <img 
            src={`http://localhost:5000${post.image}`} 
            alt={post.title} 
            className="w-full h-80 object-cover"
          />
        )}

        <div className="p-8 md:p-12">
          {/* Post Meta Data */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6 border-b dark:border-gray-700 pb-6">
            <span className="flex items-center gap-1.5">
              <User size={16} /> {post.author?.username}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={16} /> {new Date(post.createdAt).toLocaleDateString('tr-TR')}
            </span>
            <span className="flex items-center gap-1.5">
              <Tag size={16} /> {post.category?.name || 'Kategorisiz'}
            </span>
          </div>

          <h1 className="text-4xl font-extrabold mb-8 text-gray-900 dark:text-white leading-tight">
            {post.title}
          </h1>

          {/* Render the rich HTML content safely */}
          <div 
            className="prose max-w-none dark:prose-invert prose-lg text-gray-800 dark:text-gray-200"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Like Section */}
          <div className="mt-12 pt-6 border-t dark:border-gray-700 flex items-center justify-between">
            <button 
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                hasLiked 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <ThumbsUp size={20} className={hasLiked ? 'fill-current' : ''} />
              {hasLiked ? 'Beğendin' : 'Beğen'} 
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-sm">
                {post.likes.length}
              </span>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}