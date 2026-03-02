import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Send a POST request to your backend registration endpoint
      await api.post('/auth/register', { username, email, password });
      
      // If successful, redirect the user to the login page
      navigate('/login');
    } catch (err) {
      // Display the error message sent from your backend (e.g., "User already exists")
      setError(err.response?.data?.message || 'Kayıt sırasında bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white dark:bg-gray-800 p-8 border dark:border-gray-700 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6 text-center">Kayıt Ol</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Kullanıcı Adı</label>
          <input 
            type="text" 
            required 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">E-posta</label>
          <input 
            type="email" 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Parola</label>
          <input 
            type="password" 
            required 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
        >
          {loading ? 'Yükleniyor...' : 'Kayıt Ol'}
        </button>
      </form>
      
      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Zaten hesabınız var mı? <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Giriş Yap</Link>
      </p>
    </div>
  );
}