import axios from 'axios';

const api = axios.create({
  // Matches the port configured in your backend .env file
  baseURL: 'http://localhost:5000/api', 
});

// Interceptor to inject the JWT token into the headers of every request
api.interceptors.request.use(
  (config) => {
    // We will store the token in localStorage upon login
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }, 
  (error) => {
    return Promise.reject(error);
  }
);

export default api;