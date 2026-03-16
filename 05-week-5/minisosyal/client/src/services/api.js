import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the JWT token to headers
api.interceptors.request.use(
    (config) => {
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

// Flag to prevent multiple toasts from firing at once
let isRedirecting = false;

// Response interceptor to handle expired/corrupted tokens
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401 && !isRedirecting) {
            isRedirecting = true;

            // Clear the invalid token
            localStorage.removeItem('token');

            // Create and show a toast notification
            const toast = document.createElement('div');
            toast.textContent = 'Session expired. Please log in again.';
            toast.style.cssText = `
                position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
                background: #d32f2f; color: white; padding: 16px 32px;
                border-radius: 8px; font-size: 16px; font-weight: bold;
                z-index: 99999; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                animation: fadeIn 0.3s ease;
            `;
            document.body.appendChild(toast);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                toast.remove();
                isRedirecting = false;
                window.location.href = '/login';
            }, 3000);
        }
        return Promise.reject(error);
    }
);

export default api;
