import axios from 'axios';

let API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const isDev = import.meta.env.VITE_ENV !== 'production';
if (isDev && !import.meta.env.VITE_API_URL) {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    API_BASE = `http://${window.location.hostname}:8000`;
  }
}

const apiClient = axios.create({
  baseURL: API_BASE,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(err);
  }
);

export const setToken = (token) => localStorage.setItem('auth_token', token);
export const getToken = () => localStorage.getItem('auth_token');
export const removeToken = () => localStorage.removeItem('auth_token');

export default apiClient;
export { API_BASE };