import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

// Create the Context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // When the app loads, check if the user has a valid token saved
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // If token exists, fetch the user data from our backend
          const res = await api.get('/auth/me');
          setUser(res.data);
        } catch (err) {
          console.error('Invalid token', err);
          localStorage.removeItem('token'); // Clear bad token
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};