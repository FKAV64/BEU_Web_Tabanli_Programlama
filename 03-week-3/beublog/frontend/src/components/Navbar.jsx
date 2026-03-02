import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Sun, Moon, User, LogOut } from 'lucide-react'; 

export default function Navbar() {
  // Pull our global state from the contexts we created earlier
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Send the user back to the home page after logging out
  };

  return (
    <nav className="border-b p-4 flex justify-between items-center bg-white dark:bg-gray-800 dark:border-gray-700 transition-colors">
      {/* Brand Logo / Home Link */}
      <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
        BEUBlog
      </Link>

      <div className="flex items-center gap-6">
        {/* Theme Toggle Button */}
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Tema Değiştir"
        >
          {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-600" />}
        </button>

        {/* Conditional rendering based on Authentication state */}
        {user ? (
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-1 font-medium hover:text-blue-500 transition-colors">
              <User size={18} /> Profil
            </Link>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-1 font-medium text-red-500 hover:text-red-600 transition-colors"
            >
              <LogOut size={18} /> Çıkış
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-4 font-medium">
            <Link to="/login" className="hover:text-blue-500 transition-colors">Giriş Yap</Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Kayıt Ol
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}