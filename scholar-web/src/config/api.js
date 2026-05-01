import axios from 'axios';

let API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Override to localhost to prevent cross-site cookie blocking when accessing from the laptop directly
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  API_BASE = `http://${window.location.hostname}:8000`;
}

const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export default apiClient;
export { API_BASE };