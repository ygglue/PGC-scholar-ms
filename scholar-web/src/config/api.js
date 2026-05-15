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
  withCredentials: true,
});

export default apiClient;
export { API_BASE };