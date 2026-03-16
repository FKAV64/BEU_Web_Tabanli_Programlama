import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// A simple Navbar to allow users to logout and see their status
const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null; // Don't show navbar if not logged in

  const defaultAvatar = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.name) + '&background=random';

  return (
    <nav style={{ padding: '16px', backgroundColor: '#1da1f2', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
      <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
        <h1 style={{ margin: 0, fontSize: '1.5em' }}>MiniSosyal</h1>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user.role === 'admin' && (
          <Link to="/admin" style={{ textDecoration: 'none', color: 'white', fontWeight: 'bold' }}>
            Admin Panel
          </Link>
        )}
        <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'white' }}>
          <img
            src={user.avatarUrl || defaultAvatar}
            alt="avatar"
            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white' }}
            onError={(e) => { e.target.src = defaultAvatar; }}
          />
          <span>{user.name}</span>
        </Link>
        <button onClick={logout} style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <FeedPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Helper component to redirect authenticated users away from Login/Register pages
const PublicRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);

  if (loading) return null;
  if (token) return <Navigate to="/" replace />;

  return children;
};

export default App;
