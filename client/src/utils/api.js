import axios from 'axios';

/**
 * Axios instance with base configuration
 * In production (Amplify): Uses relative URLs, which are proxied through Amplify to the backend
 * In development: Uses http://localhost:5000 or the REACT_APP_API_URL from .env
 */
let apiBaseURL = '/api';

// Use full URL if REACT_APP_API_URL is explicitly set
if (process.env.REACT_APP_API_URL) {
  // Don't add /api suffix if the URL already ends with /api
  const baseUrl = process.env.REACT_APP_API_URL;
  apiBaseURL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
}

const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': undefined  // Allow proper content-type for FormData
  },
  transformRequest: [function (data, headers) {
    // If data is FormData, return it as-is (don't transform)
    if (data instanceof FormData) {
      return data;
    }
    // For other data, use default axios transformation
    if (typeof data === 'string') return data;
    return JSON.stringify(data);
  }]
  // For JSON: interceptor will set it
  // For FormData: browser will set it with boundary
});

/**
 * Add JWT token to requests automatically
 * This interceptor runs before every request
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // IMPORTANT: For FormData, do NOT set Content-Type header
    // Let the browser handle it with the correct boundary
    // For everything else (JSON), set Content-Type to application/json
    if (config.data instanceof FormData) {
      // FormData - delete Content-Type so browser can set it with boundary
      delete config.headers['Content-Type'];
    } else if (config.data && typeof config.data === 'object') {
      // Regular JSON object - set Content-Type explicitly
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Handle response errors globally
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ===== AUTH API =====

export const register = async (name, email, password) => {
  const response = await api.post('/auth/register', { name, email, password });
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export default api;
