// Backend API Service - FastAPI ohne MongoDB (JSON-Dateien)
// Backend API URL Konfiguration - Deployment-optimiert
const getActiveBackendUrl = () => {
  // 1. Prüfe, ob eine explizite Backend-URL gesetzt ist (für Emergent Deployment)
  if (typeof window !== 'undefined' && window.ACTIVE_BACKEND_URL) {
    return window.ACTIVE_BACKEND_URL;
  }
  
  // 2. Verwende Umgebungsvariablen (Deployment-Priorität)
  const envBackendUrl = process.env.REACT_APP_BACKEND_URL || process.env.REACT_APP_RENDER_BACKEND_URL;
  if (envBackendUrl) {
    return envBackendUrl;
  }
  
  // 3. Fallback für lokale Entwicklung
  return '/api';
};

// HTTP Request Helper
const apiRequest = async (endpoint, options = {}) => {
  const baseUrl = getActiveBackendUrl();
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
  const url = `${apiUrl}${endpoint}`;
  
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
  console.log(`📦 Request Body:`, config.body);
  console.log(`📋 Request Headers:`, config.headers);

  try {
    const response = await fetch(url, config);
    
    console.log(`📡 Response Status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.log(`❌ Response Error Data:`, errorData);
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
    return apiRequest(`/users/${username}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password: newPassword })
    });
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

// Backend verfügbarkeit prüfen - versucht mehrere URLs
export const initializeBackend = async () => {
  console.log('🌐 Backend-Erkennung gestartet...');
  
  // Liste der zu prüfenden Backend-URLs (in Prioritätsreihenfolge)
  const backendUrls = [
    process.env.REACT_APP_RENDER_BACKEND_URL || 'https://estyria-urlaubsplan-vercel-2.onrender.com', // Render Backend (höchste Priorität)
    process.env.REACT_APP_BACKEND_URL || '/api', // Lokaler/Proxy Backend
  ].filter(url => url && url.trim()); // Entferne leere URLs
  
  console.log('🔍 Prüfe Backend-URLs:', backendUrls);
  
  for (const baseUrl of backendUrls) {
    try {
      console.log(`🌐 Versuche Backend: ${baseUrl}`);
      
      // Längerer Timeout für Render Wake-up (15 Sekunden)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const healthUrl = baseUrl.endsWith('/api') ? `${baseUrl}/health` : `${baseUrl}/api/health`;
      console.log(`🔍 Health-Check URL: ${healthUrl}`);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const health = await response.json();
        console.log(`✅ Backend verfügbar auf: ${baseUrl}`, health);
        
        // Setze die funktionierende URL als globale API_BASE_URL
        if (typeof window !== 'undefined') {
          window.ACTIVE_BACKEND_URL = baseUrl;
          console.log(`🔥 BACKEND-MODE AKTIVIERT: ${baseUrl}`);
        }
        
        return { available: true, url: baseUrl, health };
      } else {
        console.log(`❌ Backend auf ${baseUrl} antwortet nicht korrekt:`, response.status);
      }
    } catch (error) {
      console.log(`❌ Backend auf ${baseUrl} nicht erreichbar:`, error.message);
      if (error.name === 'AbortError') {
        console.log(`⏱️ Timeout für ${baseUrl} - versuche nächste URL...`);
      }
    }
  }
  
  console.log('❌ Kein Backend verfügbar - verwende LocalStorage als Fallback');
  console.log('🔥 LOCALSTORAGE-MODE AKTIVIERT');
  return { available: false, url: null };
};

console.log('📡 Backend API Service geladen - FastAPI ohne MongoDB');