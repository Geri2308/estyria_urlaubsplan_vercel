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
    name: 'Gerhard Pailer',
    email: 'gerhard.pailer@firma.de',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Mario Pregartner',
    email: 'mario.pregartner@firma.de',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-01-10T10:00:00Z'
  },
  {
    id: '3',
    name: 'Marcel Zengerer',
    email: 'marcel.zengerer@firma.de',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-02-01T10:00:00Z'
  },
  {
    id: '4',
    name: 'Sabrina Würtinger',
    email: 'sabrina.wuertinger@firma.de',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-02-05T10:00:00Z'
  },
  {
    id: '5',
    name: 'Alexander Knoll',
    email: 'alexander.knoll@firma.de',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-02-10T10:00:00Z'
  },
  {
    id: '6',
    name: 'Gerhard Schmidt',
    email: 'gerhard.schmidt@firma.de',
    role: 'admin',
    vacation_days_total: 30,
    skills: [],
    created_date: '2024-01-05T10:00:00Z'
  },
  {
    id: '7',
    name: 'Claudiu Rosza',
    email: 'claudiu.rosza@firma.de',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-02-15T10:00:00Z'
  },
  {
    id: '8',
    name: 'Richard Tavaszi',
    email: 'richard.tavaszi@firma.de',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-02-20T10:00:00Z'
  },
  {
    id: '9',
    name: 'Bernhard Sager',
    email: 'bernhard.sager@firma.de',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-03-01T10:00:00Z'
  },
  {
    id: '10',
    name: 'Benjamin Winter',
    email: 'benjamin.winter@firma.de',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-03-05T10:00:00Z'
  },
  {
    id: '11',
    name: 'Gabriela Ackerl',
    email: 'gabriela.ackerl@firma.de',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-03-10T10:00:00Z'
  },
  {
    id: '12',
    name: 'Markus Strahlhofer',
    email: 'markus.strahlhofer@firma.de',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-03-15T10:00:00Z'
  },
  {
    id: '13',
    name: 'Norbert Kreil',
    email: 'norbert.kreil@firma.de',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-03-20T10:00:00Z'
  },
  {
    id: '14',
    name: 'Nicole Prack',
    email: 'nicole.prack@firma.de',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-03-25T10:00:00Z'
  },
  {
    id: '15',
    name: 'Denis Constantin',
    email: 'denis.constantin@firma.de',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-04-01T10:00:00Z'
  },
  {
    id: '16',
    name: 'Peter Koch',
    email: 'peter.koch@firma.de',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-04-05T10:00:00Z'
  }
];

const mockVacationEntries = [
  // Aktuelle Urlaube für Januar 2025 (sichtbar im aktuellen Monat)
  {
    id: '1',
    employee_id: '1',
    employee_name: 'Gerhard Pailer',
    start_date: '2025-01-15',
    end_date: '2025-01-17',
    vacation_type: 'URLAUB',
    notes: 'Kurzurlaub',
    days_count: 3,
    created_date: '2024-11-15T10:00:00Z'
  },
  {
    id: '2',
    employee_id: '2',
    employee_name: 'Mario Pregartner',
    start_date: '2025-01-15',
    end_date: '2025-01-16',
    vacation_type: 'KRANKHEIT',
    notes: 'Erkältung',
    days_count: 2,
    created_date: '2024-11-16T10:00:00Z'
  },
  {
    id: '3',
    employee_id: '7',
    employee_name: 'Claudiu Rosza',
    start_date: '2025-01-15',
    end_date: '2025-01-15',
    vacation_type: 'SONDERURLAUB',
    notes: 'Arzttermin',
    days_count: 1,
    created_date: '2024-11-17T10:00:00Z'
  },
  {
    id: '4',
    employee_id: '4',
    employee_name: 'Sabrina Würtinger',
    start_date: '2025-01-15',
    end_date: '2025-01-18',
    vacation_type: 'URLAUB',
    notes: 'Verlängertes Wochenende',
    days_count: 4,
    created_date: '2024-11-18T10:00:00Z'
  },
  {
    id: '5',
    employee_id: '5',
    employee_name: 'Alexander Knoll',
    start_date: '2025-01-15',
    end_date: '2025-01-17',
    vacation_type: 'URLAUB',
    notes: 'Familienzeit',
    days_count: 3,
    created_date: '2024-11-19T10:00:00Z'
  },
  {
    id: '6',
    employee_id: '8',
    employee_name: 'Richard Tavaszi',
    start_date: '2025-01-15',
    end_date: '2025-01-15',
    vacation_type: 'URLAUB',
    notes: 'Freier Tag',
    days_count: 1,
    created_date: '2024-11-20T10:00:00Z'
  },
  // Zusätzliche Urlaube für heute (sollten sichtbar sein)
  {
    id: '7',
    employee_id: '9',
    employee_name: 'Bernhard Sager',
    start_date: '2025-01-09',
    end_date: '2025-01-10',
    vacation_type: 'URLAUB',
    notes: 'Heutiger Urlaub',
    days_count: 2,
    created_date: '2024-12-01T10:00:00Z'
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