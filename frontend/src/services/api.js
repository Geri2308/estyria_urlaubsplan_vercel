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

// Monatliche Urlaubsakkumulation
const MONTHLY_VACATION_DAYS = 2.08333; // 25 Tage / 12 Monate = 2,08333

// Prüfe und füge monatliche Urlaubstage hinzu
const processMonthlyVacationAccumulation = () => {
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
  const lastProcessedMonth = localStorage.getItem('urlaubsplaner_last_monthly_accumulation');
  
  console.log('🗓️ Prüfe monatliche Urlaubsakkumulation...');
  console.log('Aktueller Monat:', currentMonthKey);
  console.log('Letzter verarbeiteter Monat:', lastProcessedMonth);
  
  // Prüfe ob bereits für diesen Monat verarbeitet
  if (lastProcessedMonth === currentMonthKey) {
    console.log('✅ Urlaubstage für diesen Monat bereits hinzugefügt');
    return false;
  }
  
  // Hole alle Mitarbeiter
  const employees = getFromStorage('urlaubsplaner_employees', DEFAULT_EMPLOYEES);
  let addedEmployees = [];
  
  // Füge jedem Mitarbeiter 2,08333 Urlaubstage hinzu
  employees.forEach(employee => {
    const oldTotal = employee.vacation_days_total || 25;
    const newTotal = Math.round((oldTotal + MONTHLY_VACATION_DAYS) * 100) / 100; // Auf 2 Dezimalstellen runden
    
    employee.vacation_days_total = newTotal;
    employee.last_monthly_accumulation = now.toISOString();
    employee.monthly_accumulation_history = employee.monthly_accumulation_history || [];
    
    // Füge zur Historie hinzu
    employee.monthly_accumulation_history.push({
      month: currentMonthKey,
      added_days: MONTHLY_VACATION_DAYS,
      total_after: newTotal,
      date: now.toISOString()
    });
    
    // Behalte nur die letzten 12 Monate in der Historie
    if (employee.monthly_accumulation_history.length > 12) {
      employee.monthly_accumulation_history = employee.monthly_accumulation_history.slice(-12);
    }
    
    addedEmployees.push({
      name: employee.name,
      oldTotal: oldTotal,
      newTotal: newTotal,
      added: MONTHLY_VACATION_DAYS
    });
  });
  
  // Speichere aktualisierte Mitarbeiterdaten
  autoSave.employees(employees);
  
  // Speichere letzten verarbeiteten Monat
  localStorage.setItem('urlaubsplaner_last_monthly_accumulation', currentMonthKey);
  localStorage.setItem('urlaubsplaner_last_monthly_accumulation_date', now.toISOString());
  
  console.log('🎉 Monatliche Urlaubsakkumulation abgeschlossen!');
  console.log('📊 Zusammenfassung:', {
    monat: currentMonthKey,
    mitarbeiter: addedEmployees.length,
    tageProMitarbeiter: MONTHLY_VACATION_DAYS,
    gesamtHinzugefügt: Math.round(addedEmployees.length * MONTHLY_VACATION_DAYS * 100) / 100
  });
  
  // Detaillierte Logs für jeden Mitarbeiter
  addedEmployees.forEach(emp => {
    console.log(`📈 ${emp.name}: ${emp.oldTotal} → ${emp.newTotal} (+${emp.added} Tage)`);
  });
  
  return {
    processed: true,
    month: currentMonthKey,
    employees: addedEmployees,
    totalDaysAdded: Math.round(addedEmployees.length * MONTHLY_VACATION_DAYS * 100) / 100
  };
};

// Manuelle Ausführung der monatlichen Akkumulation (für Tests)
const forceMonthlyAccumulation = () => {
  // Setze letzten Monat zurück um Neuverarbeitung zu erzwingen
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
  
  localStorage.setItem('urlaubsplaner_last_monthly_accumulation', lastMonthKey);
  console.log('🔄 Erzwinge monatliche Akkumulation für aktuellen Monat...');
  
  return processMonthlyVacationAccumulation();
};

// Hilfsfunktion: Nächste Akkumulation berechnen
const getNextAccumulationDate = () => {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth;
};

// Hilfsfunktion: Akkumulations-Status abrufen
const getAccumulationStatus = () => {
  const lastProcessed = localStorage.getItem('urlaubsplaner_last_monthly_accumulation');
  const lastDate = localStorage.getItem('urlaubsplaner_last_monthly_accumulation_date');
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  return {
    lastProcessedMonth: lastProcessed,
    lastProcessedDate: lastDate,
    currentMonth: currentMonth,
    isCurrentMonthProcessed: lastProcessed === currentMonth,
    nextAccumulationDate: getNextAccumulationDate(),
    monthlyAmount: MONTHLY_VACATION_DAYS
  };
};
// Hilfsfunktion: Urlaubstage und Krankheitstage eines Mitarbeiters berechnen und aktualisieren
const updateEmployeeVacationDays = (employeeId, daysDifference) => {
  const employees = getFromStorage('urlaubsplaner_employees', DEFAULT_EMPLOYEES);
  const employeeIndex = employees.findIndex(emp => emp.id === employeeId);
  
  if (employeeIndex >= 0) {
    // Berechne aktuell verwendete Urlaubstage und Krankheitstage
    const vacations = getFromStorage('urlaubsplaner_vacations', []);
    const employeeVacations = vacations.filter(v => v.employee_id === employeeId);
    
    let totalUsedVacationDays = 0;
    let totalSickDays = 0;
    let totalSpecialDays = 0;
    
    employeeVacations.forEach(vacation => {
      const days = vacation.days_count || 0;
      switch (vacation.vacation_type) {
        case 'URLAUB':
          totalUsedVacationDays += days;
          break;
        case 'KRANKHEIT':
          totalSickDays += days;
          break;
        case 'SONDERURLAUB':
          totalSpecialDays += days;
          break;
      }
    });
    
    // Aktualisiere Mitarbeiter-Daten
    employees[employeeIndex] = {
      ...employees[employeeIndex],
      vacation_days_used: totalUsedVacationDays,
      vacation_days_remaining: (employees[employeeIndex].vacation_days_total || 25) - totalUsedVacationDays,
      sick_days_used: totalSickDays,
      special_days_used: totalSpecialDays,
      personality_rating: employees[employeeIndex].personality_rating || 3, // Default 3 Sterne
      last_vacation_update: new Date().toISOString()
    };
    
    // Speichern
    autoSave.employees(employees);
    
    console.log(`📊 Tage aktualisiert für ${employees[employeeIndex].name}:`, {
      urlaubstage: {
        total: employees[employeeIndex].vacation_days_total,
        used: totalUsedVacationDays,
        remaining: employees[employeeIndex].vacation_days_remaining
      },
      krankheitstage: totalSickDays,
      sonderurlaub: totalSpecialDays,
      persönlichkeit: employees[employeeIndex].personality_rating
    });
    
    return employees[employeeIndex];
  }
  
  return null;
};
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

// Daten initialisieren (beim ersten Besuch) mit monatlicher Urlaubsakkumulation
const initializeData = () => {
  console.log('🔄 Initialisiere Daten-System...');
  
  // Prüfe ob Daten existieren
  const existingEmployees = localStorage.getItem('urlaubsplaner_employees');
  const existingVacations = localStorage.getItem('urlaubsplaner_vacations');
  
  if (!existingEmployees) {
    console.log('📝 Erstmalige Einrichtung - Mitarbeiter werden geladen...');
    saveToStorage('urlaubsplaner_employees', DEFAULT_EMPLOYEES);
  } else {
    console.log('✅ Bestehende Mitarbeiterdaten gefunden');
    
    // Aktualisiere bestehende Mitarbeiter mit neuen Urlaubstage-Feldern
    const employees = getFromStorage('urlaubsplaner_employees', DEFAULT_EMPLOYEES);
    let updated = false;
    
    employees.forEach(employee => {
      if (employee.vacation_days_used === undefined) {
        // Berechne verwendete Urlaubstage
        updateEmployeeVacationDays(employee.id, 0);
        updated = true;
      }
      
      // Initialisiere monatliche Akkumulations-Historie falls nicht vorhanden
      if (!employee.monthly_accumulation_history) {
        employee.monthly_accumulation_history = [];
        updated = true;
      }
    });
    
    if (updated) {
      console.log('🔄 Mitarbeiterdaten mit Urlaubstage-Tracking aktualisiert');
      autoSave.employees(employees);
    }
  }
  
  if (!existingVacations) {
    console.log('📝 Erstmalige Einrichtung - Beispiel-Urlaube werden geladen...');
    saveToStorage('urlaubsplaner_vacations', DEFAULT_VACATION_ENTRIES);
  } else {
    console.log('✅ Bestehende Urlaubsdaten gefunden');
  }
  
  // Speichere Initialisierungsdatum
  if (!localStorage.getItem('urlaubsplaner_initialized')) {
    localStorage.setItem('urlaubsplaner_initialized', new Date().toISOString());
    localStorage.setItem('urlaubsplaner_version', '1.2'); // Version erhöht für monatliche Akkumulation
    console.log('🎉 System erfolgreich initialisiert!');
  }
  
  // Aktualisiere alle Mitarbeiter-Urlaubstage nach Initialisierung
  const finalEmployees = getFromStorage('urlaubsplaner_employees', []);
  finalEmployees.forEach(employee => {
    updateEmployeeVacationDays(employee.id, 0);
  });
  
  // WICHTIG: Prüfe und führe monatliche Urlaubsakkumulation durch
  console.log('🗓️ Prüfe monatliche Urlaubsakkumulation...');
  const accumulationResult = processMonthlyVacationAccumulation();
  
  if (accumulationResult && accumulationResult.processed) {
    console.log('🎊 Neue Urlaubstage für diesen Monat hinzugefügt!');
    console.log(`📈 ${accumulationResult.employees.length} Mitarbeiter erhielten je ${MONTHLY_VACATION_DAYS} Tage`);
    console.log(`🏖️ Gesamt hinzugefügt: ${accumulationResult.totalDaysAdded} Tage`);
  }
  
  // Zeige Datenstatistiken
  const employees = getFromStorage('urlaubsplaner_employees', []);
  const vacations = getFromStorage('urlaubsplaner_vacations', []);
  const accStatus = getAccumulationStatus();
  
  console.log('📊 Aktuelle Daten:', {
    mitarbeiter: employees.length,
    urlaubseinträge: vacations.length,
    urlaubstageSystem: '✅ Aktiv',
    monatlicheAkkumulation: `✅ Aktiv (${MONTHLY_VACATION_DAYS} Tage/Monat)`,
    letzterMonat: accStatus.lastProcessedMonth || 'Noch nie',
    nächsteAkkumulation: accStatus.nextAccumulationDate.toLocaleDateString('de-DE'),
    letzteÄnderung: localStorage.getItem('urlaubsplaner_employees_last_modified') || 'Unbekannt'
  });
};

// Backup- und Recovery-Funktionen + Monatliche Akkumulation
export const dataManagement = {
  // Vollständiges Backup erstellen
  createBackup: () => {
    const backup = {
      employees: getFromStorage('urlaubsplaner_employees', []),
      vacations: getFromStorage('urlaubsplaner_vacations', []),
      accumulationStatus: getAccumulationStatus(),
      timestamp: new Date().toISOString(),
      version: '1.2'
    };
    
    // Als JSON-String für Download bereitstellen
    const backupString = JSON.stringify(backup, null, 2);
    console.log('💾 Backup erstellt:', backup);
    
    return backupString;
  },
  
  // Daten aus Backup wiederherstellen
  restoreFromBackup: (backupData) => {
    try {
      const parsed = typeof backupData === 'string' ? JSON.parse(backupData) : backupData;
      
      if (parsed.employees) {
        autoSave.employees(parsed.employees);
        console.log('✅ Mitarbeiter wiederhergestellt:', parsed.employees.length);
      }
      
      if (parsed.vacations) {
        autoSave.vacations(parsed.vacations);
        console.log('✅ Urlaube wiederhergestellt:', parsed.vacations.length);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Fehler beim Wiederherstellen:', error);
      return false;
    }
  },
  
  // Alle Daten löschen (für Reset)
  clearAllData: () => {
    localStorage.removeItem('urlaubsplaner_employees');
    localStorage.removeItem('urlaubsplaner_vacations');
    localStorage.removeItem('urlaubsplaner_employees_backup');
    localStorage.removeItem('urlaubsplaner_vacations_backup');
    localStorage.removeItem('urlaubsplaner_last_monthly_accumulation');
    localStorage.removeItem('urlaubsplaner_last_monthly_accumulation_date');
    console.log('🗑️ Alle Daten gelöscht');
    
    // Neu initialisieren
    initializeData();
  },
  
  // Datenintegrität prüfen
  checkDataIntegrity: () => {
    const employees = getFromStorage('urlaubsplaner_employees', []);
    const vacations = getFromStorage('urlaubsplaner_vacations', []);
    
    let issues = [];
    
    // Prüfe auf verwaiste Urlaubseinträge
    vacations.forEach(vacation => {
      const employeeExists = employees.some(emp => emp.id === vacation.employee_id);
      if (!employeeExists) {
        issues.push(`Urlaub für nicht existierenden Mitarbeiter: ${vacation.employee_name}`);
      }
    });
    
    console.log(issues.length === 0 ? '✅ Datenintegrität OK' : '⚠️ Datenprobleme gefunden:', issues);
    return issues;
  },

  // Monatliche Akkumulation
  processMonthlyAccumulation: processMonthlyVacationAccumulation,
  forceMonthlyAccumulation: forceMonthlyAccumulation,
  getAccumulationStatus: getAccumulationStatus,
  getNextAccumulationDate: getNextAccumulationDate,
  
  // Akkumulations-Historie für einen Mitarbeiter abrufen
  getEmployeeAccumulationHistory: (employeeId) => {
    const employees = getFromStorage('urlaubsplaner_employees', []);
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.monthly_accumulation_history || [] : [];
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

// Employee API (mit automatischem Speichern)
export const employeeAPI = {
  getAll: () => {
    const employees = getFromStorage('urlaubsplaner_employees', DEFAULT_EMPLOYEES);
    console.log('👥 Mitarbeiter geladen:', employees.length);
    return Promise.resolve({ data: employees });
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
      created_date: new Date().toISOString(),
      last_modified: new Date().toISOString()
    };
    employees.push(newEmployee);
    
    // Automatisches Speichern
    autoSave.employees(employees);
    
    console.log('✅ Neuer Mitarbeiter erstellt und gespeichert:', newEmployee.name);
    return Promise.resolve({ data: newEmployee });
  },
  
  update: (id, data) => {
    const employees = getFromStorage('urlaubsplaner_employees', DEFAULT_EMPLOYEES);
    const index = employees.findIndex(emp => emp.id === id);
    if (index >= 0) {
      employees[index] = { 
        ...employees[index], 
        ...data, 
        last_modified: new Date().toISOString()
      };
      
      // Aktualisiere Urlaubstage und Krankheitstage neu (wichtig für korrekte Anzeige)
      const updatedEmployee = updateEmployeeVacationDays(id, 0);
      if (updatedEmployee) {
        employees[index] = { ...employees[index], ...updatedEmployee };
      }
      
      // Automatisches Speichern
      autoSave.employees(employees);
      
      console.log('✅ Mitarbeiter aktualisiert und gespeichert:', employees[index].name);
      return Promise.resolve({ data: employees[index] });
    }
    return Promise.reject({ response: { data: { error: 'Mitarbeiter nicht gefunden' } } });
  },
  
  delete: (id) => {
    const employees = getFromStorage('urlaubsplaner_employees', DEFAULT_EMPLOYEES);
    const index = employees.findIndex(emp => emp.id === id);
    if (index >= 0) {
      const deletedEmployee = employees[index];
      employees.splice(index, 1);
      
      // Automatisches Speichern
      autoSave.employees(employees);
      
      // Lösche auch alle Urlaubseinträge des Mitarbeiters
      const vacations = getFromStorage('urlaubsplaner_vacations', []);
      const filteredVacations = vacations.filter(vacation => vacation.employee_id !== id);
      autoSave.vacations(filteredVacations);
      
      console.log('✅ Mitarbeiter und Urlaube gelöscht und gespeichert:', deletedEmployee.name);
      return Promise.resolve({ data: { message: 'Mitarbeiter gelöscht' } });
    }
    return Promise.reject({ response: { data: { error: 'Mitarbeiter nicht gefunden' } } });
  },
};

// Vacation Entry API (mit automatischem Speichern)
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
    
    console.log('🏖️ Urlaubseinträge geladen:', vacations.length);
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
    
    // Prüfe verfügbare Urlaubstage (nur bei URLAUB, nicht bei Krankheit/Sonderurlaub)
    if (data.vacation_type === 'URLAUB') {
      const employees = getFromStorage('urlaubsplaner_employees', DEFAULT_EMPLOYEES);
      const employee = employees.find(emp => emp.id === data.employee_id);
      
      if (employee) {
        const currentUsedDays = employee.vacation_days_used || 0;
        const totalDays = employee.vacation_days_total || 25;
        const remainingDays = totalDays - currentUsedDays;
        
        if (businessDays > remainingDays) {
          console.warn(`⚠️ Nicht genügend Urlaubstage! Benötigt: ${businessDays}, Verfügbar: ${remainingDays}`);
          return Promise.reject({
            response: {
              data: {
                error: `Nicht genügend Urlaubstage verfügbar! Benötigt: ${businessDays} Tage, Verfügbar: ${remainingDays} Tage`
              }
            }
          });
        }
      }
    }
    
    const newVacation = {
      ...data,
      id: Date.now().toString(),
      days_count: businessDays,
      created_date: new Date().toISOString(),
      last_modified: new Date().toISOString()
    };
    
    vacations.push(newVacation);
    
    // Automatisches Speichern
    autoSave.vacations(vacations);
    
    // Urlaubstage des Mitarbeiters aktualisieren (für ALLE Arten: URLAUB, KRANKHEIT, SONDERURLAUB)
    updateEmployeeVacationDays(data.employee_id, 0); // 0 = komplette Neuberechnung aller Tage
    
    console.log('✅ Neuer Urlaub erstellt und gespeichert:', `${newVacation.employee_name} (${newVacation.start_date} - ${newVacation.end_date}) - ${businessDays} Tage`);
    return Promise.resolve({ data: newVacation });
  },
  
  update: (id, data) => {
    const vacations = getFromStorage('urlaubsplaner_vacations', DEFAULT_VACATION_ENTRIES);
    const index = vacations.findIndex(v => v.id === id);
    if (index >= 0) {
      const oldVacation = vacations[index];
      
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
      
      // Prüfe verfügbare Tage bei URLAUB
      if (data.vacation_type === 'URLAUB') {
        const employees = getFromStorage('urlaubsplaner_employees', DEFAULT_EMPLOYEES);
        const employee = employees.find(emp => emp.id === data.employee_id);
        
        if (employee) {
          const currentUsedDays = employee.vacation_days_used || 0;
          const totalDays = employee.vacation_days_total || 25;
          
          // Bei Update: Alte Tage wieder hinzufügen, dann neue prüfen
          let adjustedUsedDays = currentUsedDays;
          if (oldVacation.vacation_type === 'URLAUB') {
            adjustedUsedDays -= (oldVacation.days_count || 0);
          }
          
          const availableDays = totalDays - adjustedUsedDays;
          
          if (businessDays > availableDays) {
            return Promise.reject({
              response: {
                data: {
                  error: `Nicht genügend Urlaubstage verfügbar! Benötigt: ${businessDays} Tage, Verfügbar: ${availableDays} Tage`
                }
              }
            });
          }
        }
      }
      
      vacations[index] = { 
        ...vacations[index], 
        ...data, 
        days_count: businessDays,
        last_modified: new Date().toISOString()
      };
      
      // Automatisches Speichern
      autoSave.vacations(vacations);
      
      // Urlaubstage aktualisieren (für ALLE Arten: URLAUB, KRANKHEIT, SONDERURLAUB)
      // Für beide Mitarbeiter, falls sich employee_id geändert hat
      updateEmployeeVacationDays(oldVacation.employee_id, 0); // Alte Berechnung
      if (oldVacation.employee_id !== data.employee_id) {
        updateEmployeeVacationDays(data.employee_id, 0); // Neue Berechnung
      }
      
      console.log('✅ Urlaub aktualisiert und gespeichert:', `${vacations[index].employee_name} (${vacations[index].start_date} - ${vacations[index].end_date}) - ${businessDays} Tage`);
      return Promise.resolve({ data: vacations[index] });
    }
    return Promise.reject({ response: { data: { error: 'Urlaubseintrag nicht gefunden' } } });
  },
  
  delete: (id) => {
    const vacations = getFromStorage('urlaubsplaner_vacations', DEFAULT_VACATION_ENTRIES);
    const index = vacations.findIndex(v => v.id === id);
    if (index >= 0) {
      const deletedVacation = vacations[index];
      vacations.splice(index, 1);
      
      // Automatisches Speichern
      autoSave.vacations(vacations);
      
      // Urlaubstage und Krankheitstage aktualisieren (für ALLE Arten: URLAUB, KRANKHEIT, SONDERURLAUB)
      updateEmployeeVacationDays(deletedVacation.employee_id, 0); // Komplette Neuberechnung
      
      console.log('✅ Urlaub gelöscht und Tage aktualisiert:', `${deletedVacation.employee_name} (${deletedVacation.start_date} - ${deletedVacation.end_date}) - ${deletedVacation.days_count} Tage - Type: ${deletedVacation.vacation_type}`);
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