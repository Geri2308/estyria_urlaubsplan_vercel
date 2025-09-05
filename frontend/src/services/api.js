import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Axios instance erstellen
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor für Auth Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor für Fehlerbehandlung
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token abgelaufen oder ungültig - Logout
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (code) => api.post('/auth/login', { code }),
};

// Employee API
export const employeeAPI = {
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
};

// Vacation Entry API
export const vacationAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/vacation-entries${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => api.get(`/vacation-entries/${id}`),
  create: (data) => api.post('/vacation-entries', data),
  update: (id, data) => api.put(`/vacation-entries/${id}`, data),
  delete: (id) => api.delete(`/vacation-entries/${id}`),
};

// Settings API
export const settingsAPI = {
  get: () => api.get('/settings'),
};

export default api;