import axios from 'axios';
import { getToken } from './storage';

// Base URL for the Tingke backend API
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach auth token from storage
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 — clear auth & redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear stored auth
      const { clearAuth } = await import('./storage');
      await clearAuth();
    }
    return Promise.reject(error);
  }
);

export default apiClient;
