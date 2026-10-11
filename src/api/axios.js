
import axios from 'axios';

const api = axios.create({
  // Set VITE_API_URL in the hosting provider to the backend's /api URL.
  // Production must set VITE_API_URL to the Railway service's /api URL.
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, ''),
  timeout: 12000,
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
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    if (error.response && error.response.status === 401 && !isLoginRequest) {
      localStorage.removeItem('ct_token');
      localStorage.removeItem('ct_user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
