
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://cybertrace-backend-bug4.onrender.com/api',
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
