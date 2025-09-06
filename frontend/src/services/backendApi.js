// Backend API Service - FastAPI ohne MongoDB (JSON-Dateien)
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001/api';

console.log('🌐 Backend API URL:', API_BASE_URL);

// HTTP Request Helper
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  console.log(`📡 API Request: ${config.method || 'GET'} ${url}`);

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ API Response: ${config.method || 'GET'} ${url}`, data);
    return { data };
  } catch (error) {
    console.error(`❌ API Error: ${config.method || 'GET'} ${url}`, error);
    throw { response: { data: { error: error.message } } };
  }
};

// Auth API
export const authAPI = {
  login: async ({ username, password }) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: { username, password }
    });
  }
};

// Employee API
export const employeeAPI = {
  getAll: () => apiRequest('/employees'),
  
  create: (employeeData) => apiRequest('/employees', {
    method: 'POST',
    body: employeeData
  }),
  
  update: (id, employeeData) => apiRequest(`/employees/${id}`, {
    method: 'PUT', 
    body: employeeData
  }),
  
  delete: (id) => apiRequest(`/employees/${id}`, {
    method: 'DELETE'
  })
};

// Vacation API
export const vacationAPI = {
  getAll: () => apiRequest('/vacations'),
  
  create: (vacationData) => apiRequest('/vacations', {
    method: 'POST',
    body: vacationData
  }),
  
  update: (id, vacationData) => apiRequest(`/vacations/${id}`, {
    method: 'PUT',
    body: vacationData
  }),
  
  delete: (id) => apiRequest(`/vacations/${id}`, {
    method: 'DELETE'
  })
};

// User Management API
export const userAPI = {
  getAll: () => apiRequest('/users'),
  
  create: ({ username, password, role = 'user' }) => apiRequest('/users', {
    method: 'POST',
    body: { username, password, role }
  }),
  
  updatePassword: ({ username, newPassword }) => {
    // FastAPI unterstützt noch kein Passwort-Update - könnte erweitert werden
    console.warn('⚠️ Password update not implemented in FastAPI yet');
    return Promise.reject({ response: { data: { error: 'Passwort-Änderung noch nicht implementiert' } } });
  },
  
  delete: (username) => apiRequest(`/users/${username}`, {
    method: 'DELETE'
  })
};

// Health Check
export const healthAPI = {
  check: () => apiRequest('/health')
};

// Data Migration Helper - LocalStorage zu Backend
export const migrationAPI = {
  migrateFromLocalStorage: async () => {
    console.log('🔄 Starte Migration von LocalStorage zu Backend...');
    
    try {
      // 1. Prüfe Backend-Verbindung
      await healthAPI.check();
      console.log('✅ Backend-Verbindung erfolgreich');
      
      // 2. Lade LocalStorage-Daten
      const localEmployees = JSON.parse(localStorage.getItem('urlaubsplaner_employees') || '[]');
      const localVacations = JSON.parse(localStorage.getItem('urlaubsplaner_vacations') || '[]');
      const localLogins = JSON.parse(localStorage.getItem('urlaubsplaner_logins') || '{}');
      
      console.log(`📋 LocalStorage Daten gefunden:`, {
        employees: localEmployees.length,
        vacations: localVacations.length,
        logins: Object.keys(localLogins).length
      });
      
      // 3. Migriere Mitarbeiter (falls LocalStorage-Daten vorhanden)
      if (localEmployees.length > 0) {
        console.log('👥 Migriere Mitarbeiter...');
        for (const emp of localEmployees) {
          try {
            await employeeAPI.create(emp);
            console.log(`✅ Mitarbeiter migriert: ${emp.name}`);
          } catch (error) {
            console.log(`⚠️ Mitarbeiter bereits vorhanden oder Fehler: ${emp.name}`);
          }
        }
      }
      
      // 4. Migriere Urlaubseinträge
      if (localVacations.length > 0) {
        console.log('🏖️ Migriere Urlaubseinträge...');
        for (const vac of localVacations) {
          try {
            await vacationAPI.create(vac);
            console.log(`✅ Urlaubseintrag migriert: ${vac.employee_name} (${vac.start_date})`);
          } catch (error) {
            console.log(`⚠️ Urlaubseintrag bereits vorhanden oder Fehler: ${vac.employee_name}`);
          }
        }
      }
      
      console.log('🎉 Migration abgeschlossen!');
      return {
        success: true,
        migrated: {
          employees: localEmployees.length,
          vacations: localVacations.length
        }
      };
      
    } catch (error) {
      console.error('❌ Migration fehlgeschlagen:', error);
      throw error;
    }
  }
};

// Settings API (Placeholder für Zukunft)
export const settingsAPI = {
  get: () => Promise.resolve({ data: {} }),
  update: (settings) => Promise.resolve({ data: settings })
};

// Data Management API (Placeholder für Zukunft)
export const dataManagement = {
  exportData: async () => {
    const employees = await employeeAPI.getAll();
    const vacations = await vacationAPI.getAll();
    
    return {
      employees: employees.data,
      vacations: vacations.data,
      exportDate: new Date().toISOString()
    };
  }
};

// Initialisierung - prüfe Backend-Verbindung
export const initializeBackend = async () => {
  try {
    console.log('🔌 Prüfe Backend-Verbindung...');
    const health = await healthAPI.check();
    console.log('✅ Backend ist verfügbar:', health.data);
    return true;
  } catch (error) {
    console.error('❌ Backend nicht verfügbar:', error);
    return false;
  }
};

console.log('📡 Backend API Service geladen - FastAPI ohne MongoDB');