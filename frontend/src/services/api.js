// Einfacher Urlaubsplaner - OHNE DATENBANK
// Alles wird lokal im Browser gespeichert

// Login-Codes (können Sie später ändern)
const VALID_LOGINS = {
  'admin': '9999',
  'logistik': '1234', 
  'manager': '5678',
  'hr': '4321'
};

// Ihre echten Mitarbeiter (fest im Code)
const DEFAULT_EMPLOYEES = [
  {
    id: '1',
    name: 'Gerhard Pailer',
    email: 'gerhard.pailer@estyria.at',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Mario Pregartner',
    email: 'mario.pregartner@estyria.at',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-01-10T10:00:00Z'
  },
  {
    id: '3',
    name: 'Marcel Zengerer',
    email: 'marcel.zengerer@estyria.at',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-02-01T10:00:00Z'
  },
  {
    id: '4',
    name: 'Sabrina Würtinger',
    email: 'sabrina.wuertinger@estyria.at',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-02-05T10:00:00Z'
  },
  {
    id: '5',
    name: 'Alexander Knoll',
    email: 'alexander.knoll@estyria.at',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-02-10T10:00:00Z'
  },
  {
    id: '6',
    name: 'Gerhard Schmidt',
    email: 'gerhard.schmidt@estyria.at',
    role: 'admin',
    vacation_days_total: 30,
    skills: [],
    created_date: '2024-01-05T10:00:00Z'
  },
  {
    id: '7',
    name: 'Claudiu Rosza',
    email: 'claudiu.rosza@estyria.at',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-02-15T10:00:00Z'
  },
  {
    id: '8',
    name: 'Richard Tavaszi',
    email: 'richard.tavaszi@estyria.at',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-02-20T10:00:00Z'
  },
  {
    id: '9',
    name: 'Bernhard Sager',
    email: 'bernhard.sager@estyria.at',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-03-01T10:00:00Z'
  },
  {
    id: '10',
    name: 'Benjamin Winter',
    email: 'benjamin.winter@estyria.at',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-03-05T10:00:00Z'
  },
  {
    id: '11',
    name: 'Gabriela Ackerl',
    email: 'gabriela.ackerl@estyria.at',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-03-10T10:00:00Z'
  },
  {
    id: '12',
    name: 'Markus Strahlhofer',
    email: 'markus.strahlhofer@estyria.at',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-03-15T10:00:00Z'
  },
  {
    id: '13',
    name: 'Norbert Kreil',
    email: 'norbert.kreil@estyria.at',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-03-20T10:00:00Z'
  },
  {
    id: '14',
    name: 'Nicole Prack',
    email: 'nicole.prack@estyria.at',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-03-25T10:00:00Z'
  },
  {
    id: '15',
    name: 'Denis Constantin',
    email: 'denis.constantin@estyria.at',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-04-01T10:00:00Z'
  },
  {
    id: '16',
    name: 'Peter Koch',
    email: 'peter.koch@estyria.at',
    role: 'employee',
    vacation_days_total: 25,
    skills: [],
    created_date: '2024-04-05T10:00:00Z'
  }
];

// Beispiel-Urlaube für Demo
const DEFAULT_VACATION_ENTRIES = [
  {
    id: '1',
    employee_id: '1',
    employee_name: 'Gerhard Pailer',
    start_date: '2025-09-15',
    end_date: '2025-09-17',
    vacation_type: 'URLAUB',
    notes: 'Kurzurlaub',
    days_count: 3,
    created_date: '2024-11-15T10:00:00Z'
  },
  {
    id: '2',
    employee_id: '2',
    employee_name: 'Mario Pregartner',
    start_date: '2025-09-15',
    end_date: '2025-09-16',
    vacation_type: 'KRANKHEIT',
    notes: 'Erkältung',
    days_count: 2,
    created_date: '2024-11-16T10:00:00Z'
  },
  {
    id: '3',
    employee_id: '7',
    employee_name: 'Claudiu Rosza',
    start_date: '2025-09-15',
    end_date: '2025-09-15',
    vacation_type: 'SONDERURLAUB',
    notes: 'Arzttermin',
    days_count: 1,
    created_date: '2024-11-17T10:00:00Z'
  }
];

// LocalStorage Helfer-Funktionen mit automatischem Backup
const getFromStorage = (key, defaultValue) => {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      const parsed = JSON.parse(item);
      console.log(`✅ Daten geladen für ${key}:`, parsed.length || 'N/A', 'Einträge');
      return parsed;
    }
    console.log(`📝 Erstmalige Initialisierung für ${key}`);
    return defaultValue;
  } catch (error) {
    console.error(`❌ Fehler beim Laden von ${key}:`, error);
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    // Zusätzliches Backup mit Timestamp
    localStorage.setItem(`${key}_backup`, JSON.stringify({
      data: value, 
      timestamp: new Date().toISOString(),
      version: '1.0'
    }));
    console.log(`💾 Automatisch gespeichert: ${key} (${value.length || 'N/A'} Einträge)`);
  } catch (error) {
    console.error(`❌ Fehler beim Speichern von ${key}:`, error);
    // Fallback: Versuche Backup zu verwenden
    try {
      localStorage.setItem(`${key}_emergency`, JSON.stringify(value));
    } catch (e) {
      console.error('❌ Auch Emergency-Save fehlgeschlagen:', e);
    }
  }
};

// Auto-Save für alle Änderungen
const autoSave = {
  employees: (data) => {
    saveToStorage('urlaubsplaner_employees', data);
    saveToStorage('urlaubsplaner_employees_last_modified', new Date().toISOString());
  },
  vacations: (data) => {
    saveToStorage('urlaubsplaner_vacations', data);
    saveToStorage('urlaubsplaner_vacations_last_modified', new Date().toISOString());
  },
  userPreferences: (data) => {
    saveToStorage('urlaubsplaner_user_preferences', data);
  }
};

// Daten initialisieren (beim ersten Besuch)
const initializeData = () => {
  if (!localStorage.getItem('urlaubsplaner_employees')) {
    saveToStorage('urlaubsplaner_employees', DEFAULT_EMPLOYEES);
  }
  if (!localStorage.getItem('urlaubsplaner_vacations')) {
    saveToStorage('urlaubsplaner_vacations', DEFAULT_VACATION_ENTRIES);
  }
};

// Initialisierung ausführen
initializeData();

// Login-Funktion
const performLogin = (code) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Finde Benutzer basierend auf Code
      const userEntry = Object.entries(VALID_LOGINS).find(
        ([, userCode]) => userCode === code
      );

      if (!userEntry) {
        reject({
          response: {
            data: { error: 'Ungültiger Code' }
          }
        });
        return;
      }

      const [username, ] = userEntry;
      const role = username === 'admin' ? 'admin' : 'user';

      resolve({
        data: {
          success: true,
          token: `local-token-${username}-${Date.now()}`,
          user: { username, role },
          message: `Erfolgreich als ${role === 'admin' ? 'Administrator' : 'Benutzer'} angemeldet`
        }
      });
    }, 500);
  });
};

// Auth API
export const authAPI = {
  login: performLogin,
};

// Employee API (mit LocalStorage)
export const employeeAPI = {
  getAll: () => {
    return Promise.resolve({ 
      data: getFromStorage('urlaubsplaner_employees', DEFAULT_EMPLOYEES)
    });
  },
  
  getById: (id) => {
    const employees = getFromStorage('urlaubsplaner_employees', DEFAULT_EMPLOYEES);
    const employee = employees.find(emp => emp.id === id);
    return employee 
      ? Promise.resolve({ data: employee }) 
      : Promise.reject({ response: { data: { error: 'Mitarbeiter nicht gefunden' } } });
  },
  
  create: (data) => {
    const employees = getFromStorage('urlaubsplaner_employees', DEFAULT_EMPLOYEES);
    const newEmployee = {
      ...data,
      id: Date.now().toString(),
      created_date: new Date().toISOString()
    };
    employees.push(newEmployee);
    saveToStorage('urlaubsplaner_employees', employees);
    return Promise.resolve({ data: newEmployee });
  },
  
  update: (id, data) => {
    const employees = getFromStorage('urlaubsplaner_employees', DEFAULT_EMPLOYEES);
    const index = employees.findIndex(emp => emp.id === id);
    if (index >= 0) {
      employees[index] = { ...employees[index], ...data };
      saveToStorage('urlaubsplaner_employees', employees);
      return Promise.resolve({ data: employees[index] });
    }
    return Promise.reject({ response: { data: { error: 'Mitarbeiter nicht gefunden' } } });
  },
  
  delete: (id) => {
    const employees = getFromStorage('urlaubsplaner_employees', DEFAULT_EMPLOYEES);
    const index = employees.findIndex(emp => emp.id === id);
    if (index >= 0) {
      employees.splice(index, 1);
      saveToStorage('urlaubsplaner_employees', employees);
      
      // Lösche auch alle Urlaubseinträge des Mitarbeiters
      const vacations = getFromStorage('urlaubsplaner_vacations', []);
      const filteredVacations = vacations.filter(vacation => vacation.employee_id !== id);
      saveToStorage('urlaubsplaner_vacations', filteredVacations);
      
      return Promise.resolve({ data: { message: 'Mitarbeiter gelöscht' } });
    }
    return Promise.reject({ response: { data: { error: 'Mitarbeiter nicht gefunden' } } });
  },
};

// Vacation Entry API (mit LocalStorage)
export const vacationAPI = {
  getAll: (params = {}) => {
    let vacations = getFromStorage('urlaubsplaner_vacations', DEFAULT_VACATION_ENTRIES);
    
    // Filter anwenden wenn Parameter vorhanden
    if (params.employee_id) {
      vacations = vacations.filter(v => v.employee_id === params.employee_id);
    }
    if (params.vacation_type) {
      vacations = vacations.filter(v => v.vacation_type === params.vacation_type);
    }
    
    return Promise.resolve({ data: vacations });
  },
  
  getById: (id) => {
    const vacations = getFromStorage('urlaubsplaner_vacations', DEFAULT_VACATION_ENTRIES);
    const vacation = vacations.find(v => v.id === id);
    return vacation 
      ? Promise.resolve({ data: vacation })
      : Promise.reject({ response: { data: { error: 'Urlaubseintrag nicht gefunden' } } });
  },
  
  create: (data) => {
    const vacations = getFromStorage('urlaubsplaner_vacations', DEFAULT_VACATION_ENTRIES);
    
    // Berechne Werktage
    const startDate = new Date(data.start_date);
    const endDate = new Date(data.end_date);
    let businessDays = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Nicht Sonntag oder Samstag
        businessDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const newVacation = {
      ...data,
      id: Date.now().toString(),
      days_count: businessDays,
      created_date: new Date().toISOString()
    };
    
    vacations.push(newVacation);
    saveToStorage('urlaubsplaner_vacations', vacations);
    return Promise.resolve({ data: newVacation });
  },
  
  update: (id, data) => {
    const vacations = getFromStorage('urlaubsplaner_vacations', DEFAULT_VACATION_ENTRIES);
    const index = vacations.findIndex(v => v.id === id);
    if (index >= 0) {
      // Berechne Werktage neu
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      let businessDays = 0;
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          businessDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      vacations[index] = { 
        ...vacations[index], 
        ...data, 
        days_count: businessDays 
      };
      saveToStorage('urlaubsplaner_vacations', vacations);
      return Promise.resolve({ data: vacations[index] });
    }
    return Promise.reject({ response: { data: { error: 'Urlaubseintrag nicht gefunden' } } });
  },
  
  delete: (id) => {
    const vacations = getFromStorage('urlaubsplaner_vacations', DEFAULT_VACATION_ENTRIES);
    const index = vacations.findIndex(v => v.id === id);
    if (index >= 0) {
      vacations.splice(index, 1);
      saveToStorage('urlaubsplaner_vacations', vacations);
      return Promise.resolve({ data: { message: 'Urlaubseintrag gelöscht' } });
    }
    return Promise.reject({ response: { data: { error: 'Urlaubseintrag nicht gefunden' } } });
  },
};

// Settings API
export const settingsAPI = {
  get: () => {
    const employees = getFromStorage('urlaubsplaner_employees', DEFAULT_EMPLOYEES);
    return Promise.resolve({
      data: {
        max_concurrent_percentage: 30,
        max_concurrent_fixed: null,
        total_employees: employees.length,
        max_concurrent_calculated: Math.max(1, Math.floor(employees.length * 0.3))
      }
    });
  },
};

export default { authAPI, employeeAPI, vacationAPI, settingsAPI };