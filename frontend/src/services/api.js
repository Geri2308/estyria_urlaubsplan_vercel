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

// Mock Daten für Entwicklung
const mockEmployees = [
  {
    id: '1',
    name: 'Max Mustermann',
    email: 'max.mustermann@firma.de',
    role: 'employee',
    vacation_days_total: 25,
    skills: [
      { name: 'JavaScript', rating: 4 },
      { name: 'React', rating: 5 },
      { name: 'Node.js', rating: 3 }
    ],
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Anna Schmidt',
    email: 'anna.schmidt@firma.de',
    role: 'admin',
    vacation_days_total: 30,
    skills: [
      { name: 'Management', rating: 5 },
      { name: 'Teamführung', rating: 4 }
    ],
    created_date: '2024-01-10T10:00:00Z'
  },
  {
    id: '3',
    name: 'Peter Müller',
    email: 'peter.mueller@firma.de',
    role: 'leiharbeiter',
    vacation_days_total: 20,
    skills: [
      { name: 'PHP', rating: 3 },
      { name: 'Database', rating: 4 }
    ],
    created_date: '2024-02-01T10:00:00Z'
  }
];

const mockVacationEntries = [
  {
    id: '1',
    employee_id: '1',
    employee_name: 'Max Mustermann',
    start_date: '2024-12-23',
    end_date: '2024-12-30',
    vacation_type: 'URLAUB',
    notes: 'Weihnachtsurlaub',
    days_count: 6,
    created_date: '2024-11-15T10:00:00Z'
  }
];

// Employee API
export const employeeAPI = {
  getAll: () => {
    if (MOCK_AUTH) {
      return Promise.resolve({ data: mockEmployees });
    }
    return api.get('/employees');
  },
  getById: (id) => {
    if (MOCK_AUTH) {
      const employee = mockEmployees.find(emp => emp.id === id);
      return employee ? Promise.resolve({ data: employee }) : Promise.reject({ response: { data: { error: 'Mitarbeiter nicht gefunden' } } });
    }
    return api.get(`/employees/${id}`);
  },
  create: (data) => {
    if (MOCK_AUTH) {
      const newEmployee = {
        ...data,
        id: Date.now().toString(),
        created_date: new Date().toISOString()
      };
      mockEmployees.push(newEmployee);
      return Promise.resolve({ data: newEmployee });
    }
    return api.post('/employees', data);
  },
  update: (id, data) => {
    if (MOCK_AUTH) {
      const index = mockEmployees.findIndex(emp => emp.id === id);
      if (index >= 0) {
        mockEmployees[index] = { ...mockEmployees[index], ...data };
        return Promise.resolve({ data: mockEmployees[index] });
      }
      return Promise.reject({ response: { data: { error: 'Mitarbeiter nicht gefunden' } } });
    }
    return api.put(`/employees/${id}`, data);
  },
  delete: (id) => {
    if (MOCK_AUTH) {
      const index = mockEmployees.findIndex(emp => emp.id === id);
      if (index >= 0) {
        mockEmployees.splice(index, 1);
        return Promise.resolve({ data: { message: 'Mitarbeiter gelöscht' } });
      }
      return Promise.reject({ response: { data: { error: 'Mitarbeiter nicht gefunden' } } });
    }
    return api.delete(`/employees/${id}`);
  },
};

// Vacation Entry API
export const vacationAPI = {
  getAll: (params = {}) => {
    if (MOCK_AUTH) {
      return Promise.resolve({ data: mockVacationEntries });
    }
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/vacation-entries${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => {
    if (MOCK_AUTH) {
      const entry = mockVacationEntries.find(entry => entry.id === id);
      return entry ? Promise.resolve({ data: entry }) : Promise.reject({ response: { data: { error: 'Urlaubseintrag nicht gefunden' } } });
    }
    return api.get(`/vacation-entries/${id}`);
  },
  create: (data) => {
    if (MOCK_AUTH) {
      const newEntry = {
        ...data,
        id: Date.now().toString(),
        created_date: new Date().toISOString()
      };
      mockVacationEntries.push(newEntry);
      return Promise.resolve({ data: newEntry });
    }
    return api.post('/vacation-entries', data);
  },
  update: (id, data) => {
    if (MOCK_AUTH) {
      const index = mockVacationEntries.findIndex(entry => entry.id === id);
      if (index >= 0) {
        mockVacationEntries[index] = { ...mockVacationEntries[index], ...data };
        return Promise.resolve({ data: mockVacationEntries[index] });
      }
      return Promise.reject({ response: { data: { error: 'Urlaubseintrag nicht gefunden' } } });
    }
    return api.put(`/vacation-entries/${id}`, data);
  },
  delete: (id) => {
    if (MOCK_AUTH) {
      const index = mockVacationEntries.findIndex(entry => entry.id === id);
      if (index >= 0) {
        mockVacationEntries.splice(index, 1);
        return Promise.resolve({ data: { message: 'Urlaubseintrag gelöscht' } });
      }
      return Promise.reject({ response: { data: { error: 'Urlaubseintrag nicht gefunden' } } });
    }
    return api.delete(`/vacation-entries/${id}`);
  },
};

// Settings API
export const settingsAPI = {
  get: () => {
    if (MOCK_AUTH) {
      return Promise.resolve({
        data: {
          max_concurrent_percentage: 30,
          max_concurrent_fixed: null,
          total_employees: mockEmployees.length,
          max_concurrent_calculated: Math.max(1, Math.floor(mockEmployees.length * 0.3))
        }
      });
    }
    return api.get('/settings');
  },
};

export default api;