import axios from 'axios';

// Für die Entwicklung verwenden wir ein vereinfachtes Mock-System
const MOCK_AUTH = true;

// Mock Auth für Entwicklung
const mockLogin = (code) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (code === '9999') {
        resolve({
          data: {
            success: true,
            token: 'mock-admin-token-' + Date.now(),
            user: { username: 'admin', role: 'admin' },
            message: 'Erfolgreich als Admin angemeldet'
          }
        });
      } else if (code === '1234') {
        resolve({
          data: {
            success: true,
            token: 'mock-user-token-' + Date.now(),
            user: { username: 'user', role: 'user' },
            message: 'Erfolgreich als Benutzer angemeldet'
          }
        });
      } else {
        reject({
          response: {
            data: { error: 'Ungültiger Code' }
          }
        });
      }
    }, 500);
  });
};

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL ? `${process.env.REACT_APP_BACKEND_URL}/api` : '/api';

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
  login: (code) => {
    if (MOCK_AUTH) {
      return mockLogin(code);
    }
    return api.post('/auth/login', { code });
  },
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