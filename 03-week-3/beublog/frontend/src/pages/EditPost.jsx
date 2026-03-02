import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function EditPost() {
  const { id } = useParams(); // Get the post ID from the URL
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  
  // To handle the image, we track both the old image URL and any new file the user uploads
  const [currentImage, setCurrentImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  // Fetch the categories and the existing post data when the page loads
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories for the dropdown
        const catRes = await api.get('/categories');
        setCategories(catRes.data);

        // Fetch the existing post data using its ID
        // Note: Our backend only has a 'by-slug' public route and a protected GET all. 
        // Wait, earlier we didn't make a GET /posts/:id route! 
        // Let's fetch all posts and find the one we need (or you can use the backend we built).
        // Actually, let's just fetch all the user's posts from the dashboard endpoint and find it.
        const postRes = await api.get('/auth/me/posts');
        const postToEdit = postRes.data.find(p => p._id === id);

        if (!postToEdit) {
          setError('Yazı bulunamadı veya bu yazıyı düzenleme yetkiniz yok.');
          setFetching(false);
          return;
        }

        // Pre-fill the form with the fetched data
        setTitle(postToEdit.title);
        setSlug(postToEdit.slug);
        setContent(postToEdit.content);
        setCategory(postToEdit.category?._id || '');
        setCurrentImage(postToEdit.image || '');
        
      } catch (err) {
        setError('Veriler yüklenirken bir hata oluştu.');
      } finally {
        setFetching(false);
      }
    };

    if (user) fetchData();
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let finalImageUrl = currentImage; // Default to keeping the old image

      // If the user selected a NEW image, upload it
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        const uploadRes = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        finalImageUrl = uploadRes.data.imageUrl; 
      }

      // Send the PUT request to update the post
      await api.put(`/posts/${id}`, {
        title,
        slug,
        content,
        category,
        image: finalImageUrl 
      });

      // Navigate back to the dashboard after a successful edit
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Yazı güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Navigate to="/login" />;
  if (fetching) return <div className="text-center mt-20 text-xl">Veriler yükleniyor...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow border dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-6">Yazıyı Düzenle</h2>
      
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
          />
        </div>

        <div>
          <label className="block font-medium mb-1">URL Slug</label>
          <input 
            type="text" 
            required 
            value={slug} 
            onChange={(e) => setSlug(e.target.value)}
            className="w-full p-2 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700"
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
          <label className="block font-medium mb-1">Kapak Görselini Değiştir</label>
          {currentImage && !imageFile && (
            <div className="mb-2 text-sm text-gray-500">
              Mevcut görsel korunuyor. Yeni bir görsel yüklerseniz eskisinin yerini alacaktır.
            </div>
          )}
          <input 
            type="file" 
            accept="image/jpeg, image/png, image/gif, image/webp, image/svg+xml"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full p-2 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700"
          />
        </div>

        <div className="mb-12">
          <label className="block font-medium mb-1">İçerik</label>
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
          {loading ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
        </button>
      </form>
    </div>
  );
}