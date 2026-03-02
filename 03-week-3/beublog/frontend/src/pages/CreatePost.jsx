import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // This is required for the editor styles!
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function CreatePost() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch categories when the page loads so the user can select one
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Kategoriler yüklenemedi');
      }
    };
    fetchCategories();
  }, []);

  // Automatically generate a URL-friendly slug when the user types a title
  useEffect(() => {
    const generatedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setSlug(generatedSlug);
  }, [title]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imageUrl = '';

      // 1. If the user selected an image, upload it first
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        imageUrl = uploadRes.data.imageUrl; // Get the saved path from backend
      }

      // 2. Send the rest of the post data to the database
      await api.post('/posts', {
        title,
        slug,
        content,
        category,
        image: imageUrl // Attach the uploaded image path
      });

      // 3. Go back to dashboard on success
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Yazı oluşturulurken bir hata meydana geldi.');
    } finally {
      setLoading(false);
    }
  };

  // Protect the route
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow border dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6">Yeni Yazı Oluştur</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block font-medium mb-1">Başlık</label>
          <input 
            type="text" 
            required 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700"
            placeholder="Yazınızın başlığı..."
          />
        </div>

        <div>
          <label className="block font-medium mb-1">URL Slug</label>
          <input 
            type="text" 
            required 
            value={slug} 
            onChange={(e) => setSlug(e.target.value)}
            className="w-full p-2 border dark:border-gray-600 rounded bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Kategori</label>
          <select 
            required
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700"
          >
            <option value="">Kategori Seçin</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-1">Kapak Görseli</label>
          <input 
            type="file" 
            accept="image/jpeg, image/png, image/gif, image/webp, image/svg+xml"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full p-2 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700"
          />
        </div>

        <div className="mb-12">
          <label className="block font-medium mb-1">İçerik</label>
          {/* ReactQuill needs a fixed height container to look good */}
          <div className="h-64 mb-10 dark:text-white">
            <ReactQuill 
              theme="snow" 
              value={content} 
              onChange={setContent} 
              className="h-full"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white p-3 rounded font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          {loading ? 'Kaydediliyor...' : 'Yazıyı Yayınla'}
        </button>
      </form>
    </div>
  );
}