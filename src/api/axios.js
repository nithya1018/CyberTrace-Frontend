
import axios from 'axios';

const api = axios.create({
  // Set VITE_API_URL in the hosting provider to the backend's /api URL.
  // The fallback keeps the existing public Render deployment working.
  baseURL: (import.meta.env.VITE_API_URL || 'https://cybertrace-backend-bug4.onrender.com/api').replace(/\/$/, ''),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ct_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('ct_token');
      localStorage.removeItem('ct_user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
