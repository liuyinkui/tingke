import axios from 'axios';

// Base URL for the Tingke backend API
// Will be updated to production URL when deployed
const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach auth token if available
apiClient.interceptors.request.use(
  (config) => {
    // TODO: retrieve token from secure storage once login is implemented
    const token = null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle common errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // TODO: redirect to login when auth is implemented
      console.warn('[API] Unauthorized — token may be expired');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
