import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfYear, endOfYear, eachMonthOfInterval } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  Calendar,
  Users,
  Plus,
  Download,
  Upload,
  Printer,
  Search,
  Filter,
  Settings,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  UserPlus,
  Edit2,
  Trash2,
  Star,
  Minus,
  LogOut,
  Settings as SettingsIcon,
  Users as UsersIcon,
  Moon,
  Sun
} from 'lucide-react';

import LoginScreen from './components/LoginScreen';
import UserManagementDialog from './components/UserManagementDialog';
import DataSyncDialog from './components/DataSyncDialog';
import { 
  employeeAPI, 
  vacationAPI, 
  userAPI,
  initializeBackend,
  migrationAPI
} from './services/backendApi';
import { isAuthenticated, clearAuthData, getUserData } from './utils/auth';

// Vacation Types
const VACATION_TYPES = {
  URLAUB: { label: 'Urlaub', color: 'bg-blue-500', textColor: 'text-blue-700' },
  KRANKHEIT: { label: 'Krankheit', color: 'bg-red-600', textColor: 'text-red-800' },
  SONDERURLAUB: { label: 'Sonderurlaub', color: 'bg-green-500', textColor: 'text-green-700' }
};

// Star Rating Component
const StarRating = ({ rating, onRatingChange, readonly = false }) => {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex space-x-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onRatingChange(star)}
          className={`w-5 h-5 ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
        >
          <Star
            className={`w-full h-full ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// Skill Manager Component  
const SkillManager = ({ skills, onSkillsChange }) => {
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillRating, setNewSkillRating] = useState(3);

  const addSkill = () => {
    if (newSkillName.trim()) {
      const newSkill = {
        name: newSkillName.trim(),
        rating: newSkillRating
      };
      onSkillsChange([...skills, newSkill]);
      setNewSkillName('');
      setNewSkillRating(3);
    }
  };

  const removeSkill = (index) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    onSkillsChange(updatedSkills);
  };

  const updateSkillRating = (index, rating) => {
    const updatedSkills = [...skills];
    updatedSkills[index].rating = rating;
    onSkillsChange(updatedSkills);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Fähigkeiten & Skills
      </label>

      {/* Existing Skills */}
      {skills.map((skill, index) => (
        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium">{skill.name}</span>
            <StarRating
              rating={skill.rating}
              onRatingChange={(rating) => updateSkillRating(index, rating)}
            />
          </div>
          <button
            type="button"
            onClick={() => removeSkill(index)}
            className="text-red-500 hover:text-red-700"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      ))}

      {/* Add New Skill */}
      <div className="flex items-center space-x-2 p-2 border border-gray-200 rounded">
        <input
          type="text"
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          placeholder="Neue Fähigkeit..."
          className="flex-1 border-none outline-none text-sm"
          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
        />
        <StarRating
          rating={newSkillRating}
          onRatingChange={setNewSkillRating}
        />
        <button
          type="button"
          onClick={addSkill}
          className="text-green-600 hover:text-green-800"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Toolbar Component
const Toolbar = ({
  onNewVacation,
  onNewEmployee,
  onExport,
  onImport,
  onPrint,
  currentView,
  onViewChange,
  searchTerm,
  onSearchChange,
  showFilters,
  onToggleFilters,
  employees,
  settings,
  onLogout,
  currentUser,
  showSettings,
  setShowSettings,
  setShowPersonalityDialog,
  setSelectedEmployeeForPersonality,
  setShowUserManagement,
  darkMode,
  onToggleDarkMode
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-3">
      {/* Main Toolbar */}
      <div className="flex items-center space-x-1 mb-2">
        {/* File Group */}
        <div className="flex items-center space-x-1 border-r border-gray-300 pr-3 mr-3">
          <button
            onClick={onNewVacation}
            className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Neuer Urlaub
          </button>
          <button
            onClick={onNewEmployee}
            className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Mitarbeiter
          </button>
          <button
            onClick={onExport}
            className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Exportieren"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onImport}
            className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Importieren"  
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            onClick={onPrint}
            className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Drucken"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>

        {/* View Group */}
        <div className="flex items-center space-x-1 border-r border-gray-300 pr-3 mr-3">
          <button
            onClick={() => onViewChange('month')}
            className={`flex items-center px-3 py-2 text-sm rounded transition-colors ${
              currentView === 'month' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-4 h-4 mr-1" />
            Monat
          </button>
          <button
            onClick={() => onViewChange('year')}
            className={`flex items-center px-3 py-2 text-sm rounded transition-colors ${
              currentView === 'year' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-4 h-4 mr-1" />
            Jahr
          </button>
          <button
            onClick={() => onViewChange('team')}
            className={`flex items-center px-3 py-2 text-sm rounded transition-colors ${
              currentView === 'team' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4 mr-1" />
            Team
          </button>
        </div>

        {/* Search & Filter Group */}
        <div className="flex items-center space-x-2 flex-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Mitarbeiter suchen..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8 pr-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={onToggleFilters}
            className={`flex items-center px-3 py-2 text-sm rounded transition-colors ${
              showFilters ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filter
          </button>
          
          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title={darkMode ? 'Light Mode aktivieren' : 'Dark Mode aktivieren'}
          >
            {darkMode ? (
              <Sun className="w-4 h-4 mr-1" />
            ) : (
              <Moon className="w-4 h-4 mr-1" />
            )}
            {darkMode ? 'Light' : 'Dark'}
          </button>
        </div>

        {/* User Info & Settings Dropdown */}
        <div className="flex items-center space-x-2 relative">
          <span className="text-xs text-gray-600">
            {currentUser?.role === 'admin' ? '👑' : '👤'} {currentUser?.username}
          </span>
          <div className="relative">
            <button 
              onClick={() => {
                console.log('Settings clicked, current showSettings:', showSettings);
                setShowSettings(!showSettings);
              }}
              className="flex items-center px-2 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors relative"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
            
            {showSettings && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-[9999]">
                <div className="py-1">
                  {/* Benutzerverwaltung - nur für Admins */}
                  {currentUser?.role === 'admin' && (
                    <>
                      <button
                        onClick={() => {
                          setShowUserManagement(true);
                          setShowSettings(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <UsersIcon className="w-4 h-4 mr-2" />
                        Benutzerverwaltung
                      </button>
                      <div className="border-t border-gray-100"></div>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setSelectedEmployeeForPersonality(null); // Für alle Mitarbeiter
                      setShowPersonalityDialog(true);
                      setShowSettings(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    Persönlichkeitsprofil
                  </button>
                  <div className="border-t border-gray-100"></div>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Abmelden
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumb/Status Bar */}
      <div className="text-xs text-gray-500 flex items-center justify-between">
        <span>Urlaubsplaner • {format(new Date(), 'MMMM yyyy', { locale: de })}</span>
        <span>{employees.length} Mitarbeiter • Max. {settings.max_concurrent_calculated || 1} gleichzeitig ({settings.max_concurrent_percentage || 30}%)</span>
      </div>
    </div>
  );
};

// Calendar Navigation
const CalendarNavigation = ({ currentDate, onPrevious, onNext, view }) => {
  const getTitle = () => {
    switch (view) {
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: de });
      case 'year':
        return format(currentDate, 'yyyy', { locale: de });
      default:
        return format(currentDate, 'MMMM yyyy', { locale: de });
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <button
        onClick={onPrevious}
        className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <h2 className="text-xl font-semibold text-gray-900 capitalize">
        {getTitle()}
      </h2>

      <button
        onClick={onNext}
        className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

// Month Calendar View
const MonthCalendarView = ({ currentDate, vacationEntries, employees, onDateClick, onEntryClick }) => {
  const [expandedDay, setExpandedDay] = useState(null);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getVacationsForDay = (day) => {
    return vacationEntries.filter(entry => {
      const entryStart = new Date(entry.start_date + 'T00:00:00');
      const entryEnd = new Date(entry.end_date + 'T23:59:59');
      const checkDay = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      
      return checkDay >= entryStart && checkDay <= entryEnd;
    });
  };

  const getDayClasses = (day) => {
    const isCurrentMonth = isSameMonth(day, currentDate);
    const isCurrentDay = isToday(day);
    const isWeekend = day.getDay() === 0 || day.getDay() === 6;

    let classes = "min-h-24 p-1 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors relative ";

    if (!isCurrentMonth) classes += "bg-gray-50 text-gray-400 ";
    if (isCurrentDay) classes += "bg-blue-50 border-blue-300 ";
    if (isWeekend && isCurrentMonth) classes += "bg-gray-100 ";

    return classes;
  };

  const handleDayBadgeClick = (e, day) => {
    e.stopPropagation();
    const dayKey = day.toISOString();
    setExpandedDay(expandedDay === dayKey ? null : dayKey);
  };

  return (
    <div className="bg-white">
      {/* Calendar Header */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Body */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day) => {
          const dayVacations = getVacationsForDay(day);
          const dayKey = day.toISOString();
          const isExpanded = expandedDay === dayKey;
          
          return (
            <div
              key={dayKey}
              className={getDayClasses(day)}
              onClick={() => onDateClick(day)}
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium">
                  {format(day, 'd')}
                </span>
                {dayVacations.length > 0 && (
                  <button
                    onClick={(e) => handleDayBadgeClick(e, day)}
                    className="text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-full px-1 min-w-4 text-center transition-colors z-10"
                    title={`${dayVacations.length} Urlaubseinträge - Klicken für Details`}
                  >
                    {dayVacations.length}
                  </button>
                )}
              </div>

              <div className="mt-1 space-y-1">
                {/* Zeige entweder die ersten 3 oder alle, je nach Expanded-Status */}
                {(isExpanded ? dayVacations : dayVacations.slice(0, 3)).map((vacation) => {
                  const vacationType = VACATION_TYPES[vacation.vacation_type];
                  return (
                    <div
                      key={vacation.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEntryClick(vacation);
                      }}
                      className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${vacationType.color} text-white`}
                      title={`${vacation.employee_name} - ${vacationType.label}${vacation.notes ? ': ' + vacation.notes : ''}`}
                    >
                      {vacation.employee_name}
                    </div>
                  );
                })}
                
                {/* Zeige "+ X weitere" nur wenn nicht expanded und mehr als 3 Einträge */}
                {!isExpanded && dayVacations.length > 3 && (
                  <button
                    onClick={(e) => handleDayBadgeClick(e, day)}
                    className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    +{dayVacations.length - 3} weitere
                  </button>
                )}
                
                {/* Collapse Button wenn expanded */}
                {isExpanded && dayVacations.length > 3 && (
                  <button
                    onClick={(e) => handleDayBadgeClick(e, day)}
                    className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    ↑ weniger anzeigen
                  </button>
                )}
              </div>

              {/* Erweiterte Details als Overlay für sehr viele Einträge */}
              {isExpanded && dayVacations.length > 6 && (
                <div 
                  className="absolute top-0 left-0 bg-white border border-gray-300 shadow-lg rounded-lg p-2 z-20 min-w-48"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">
                      {format(day, 'd. MMMM', { locale: de })}
                    </span>
                    <button
                      onClick={(e) => handleDayBadgeClick(e, day)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {dayVacations.map((vacation) => {
                      const vacationType = VACATION_TYPES[vacation.vacation_type];
                      return (
                        <div
                          key={vacation.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEntryClick(vacation);
                            setExpandedDay(null);
                          }}
                          className={`text-xs p-2 rounded cursor-pointer hover:opacity-80 ${vacationType.color} text-white flex justify-between items-center`}
                        >
                          <span>{vacation.employee_name}</span>
                          <span className="opacity-75">{vacationType.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Year Calendar View
const YearCalendarView = ({ currentDate, vacationEntries, onMonthClick }) => {
  const yearStart = startOfYear(currentDate);
  const yearEnd = endOfYear(currentDate);
  const yearMonths = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  const getVacationsForMonth = (month) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    return vacationEntries.filter(entry => {
      const entryStart = new Date(entry.start_date);
      const entryEnd = new Date(entry.end_date);
      return (entryStart <= monthEnd && entryEnd >= monthStart);
    });
  };

  const getMonthVacationStats = (month) => {
    const monthVacations = getVacationsForMonth(month);
    const uniqueEmployees = [...new Set(monthVacations.map(v => v.employee_id))];
    const typeStats = {
      URLAUB: monthVacations.filter(v => v.vacation_type === 'URLAUB').length,
      KRANKHEIT: monthVacations.filter(v => v.vacation_type === 'KRANKHEIT').length,
      SONDERURLAUB: monthVacations.filter(v => v.vacation_type === 'SONDERURLAUB').length
    };

    return {
      totalEntries: monthVacations.length,
      uniqueEmployees: uniqueEmployees.length,
      typeStats
    };
  };

  return (
    <div className="bg-white p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {yearMonths.map((month) => {
          const stats = getMonthVacationStats(month);
          return (
            <div
              key={month.toISOString()}
              onClick={() => onMonthClick(month)}
              className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="text-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                  {format(month, 'MMMM', { locale: de })}
                </h3>
                <p className="text-sm text-gray-500">
                  {format(month, 'yyyy')}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Urlaubseinträge:</span>
                  <span className="font-medium">{stats.totalEntries}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Betroffene Mitarbeiter:</span>
                  <span className="font-medium">{stats.uniqueEmployees}</span>
                </div>

                {stats.totalEntries > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">Aufschlüsselung:</div>
                    <div className="space-y-1">
                      {stats.typeStats.URLAUB > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                            <span className="text-xs">Urlaub</span>
                          </div>
                          <span className="text-xs font-medium">{stats.typeStats.URLAUB}</span>
                        </div>
                      )}
                      {stats.typeStats.KRANKHEIT > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                            <span className="text-xs">Krankheit</span>
                          </div>
                          <span className="text-xs font-medium">{stats.typeStats.KRANKHEIT}</span>
                        </div>
                      )}
                      {stats.typeStats.SONDERURLAUB > 0 && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                            <span className="text-xs">Sonderurlaub</span>
                          </div>
                          <span className="text-xs font-medium">{stats.typeStats.SONDERURLAUB}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {stats.totalEntries === 0 && (
                  <div className="text-center py-2">
                    <span className="text-xs text-gray-400">Keine Einträge</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Personality Profile Dialog Component
const PersonalityProfileDialog = ({ isOpen, onClose, employees, selectedEmployee = null, onSave, isBackendMode = false }) => {
  const [personalityTraits, setPersonalityTraits] = useState({});
  const [loading, setLoading] = useState(false);

  // Bestimme welche Mitarbeiter angezeigt werden sollen
  const displayEmployees = selectedEmployee ? [selectedEmployee] : employees;

  useEffect(() => {
    if (isOpen && displayEmployees) {
      // Initialisiere Traits mit aktuellen Werten
      const initialTraits = {};
      displayEmployees.forEach(employee => {
        initialTraits[employee.id] = employee.personality_traits || '';
      });
      setPersonalityTraits(initialTraits);
    }
  }, [isOpen, displayEmployees]);

  const handleTraitsChange = (employeeId, traits) => {
    console.log('🔄 Changing traits for employee:', employeeId, 'to:', traits);
    setPersonalityTraits(prev => ({
      ...prev,
      [employeeId]: traits
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Dynamische API-Auswahl basierend auf Backend-Mode  
      if (isBackendMode) {
        // Backend-Mode: Verwende FastAPI
        for (const [employeeId, traits] of Object.entries(personalityTraits)) {
          await employeeAPI.update(employeeId, { personality_traits: traits });
        }
      } else {
        // LocalStorage-Mode: Verwende lokale API
        const { employeeAPI: localEmployeeAPI } = await import('./services/api');
        for (const [employeeId, traits] of Object.entries(personalityTraits)) {
          await localEmployeeAPI.update(employeeId, { personality_traits: traits });
        }
      }
      
      console.log('✅ Persönlichkeitsmerkmale aktualisiert:', personalityTraits);
      onSave();
      onClose();
    } catch (error) {
      console.error('❌ Fehler beim Speichern der Profile:', error);
      alert('Fehler beim Speichern der Persönlichkeitsmerkmale');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Für alle angezeigten Mitarbeiter die Urlaubstage neu berechnen
      console.log('🔄 Aktualisiere Krankheitstage und Urlaubsdaten...');
      
      if (displayEmployees) {
        for (const employee of displayEmployees) {
          // Dynamische API-Auswahl basierend auf Backend-Mode
          if (isBackendMode) {
            // Backend-Mode: Verwende FastAPI
            await employeeAPI.update(employee.id, { 
              last_refresh: new Date().toISOString() 
            });
          } else {
            // LocalStorage-Mode: Verwende lokale API
            const { employeeAPI: localEmployeeAPI } = await import('./services/api');
            await localEmployeeAPI.update(employee.id, { 
              last_refresh: new Date().toISOString() 
            });
          }
        }
      }
      
      // Lade die Hauptdaten neu
      await onSave(); 
      console.log('✅ Mitarbeiterdaten und Krankheitstage erfolgreich aktualisiert');
    } catch (error) {
      console.error('❌ Fehler beim Aktualisieren:', error);
      alert('Fehler beim Aktualisieren der Daten');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-90vh overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {selectedEmployee ? `Persönlichkeitsprofil - ${selectedEmployee.name}` : 'Persönlichkeitsprofile'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {selectedEmployee 
                ? `Beschreiben Sie die Persönlichkeitsmerkmale von ${selectedEmployee.name}`
                : 'Beschreiben Sie die Persönlichkeitsmerkmale Ihrer Mitarbeiter'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayEmployees
              .sort((a, b) => {
                // Admins first
                if (a.role === 'admin' && b.role !== 'admin') return -1;
                if (b.role === 'admin' && a.role !== 'admin') return 1;
                return a.name.localeCompare(b.name);
              })
              .map((employee) => (
                <div key={employee.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 flex items-center">
                        {employee.role === 'admin' && '👑 '}
                        {employee.name}
                      </h4>
                      <p className="text-sm text-gray-500">{employee.email}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                        employee.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : employee.role === 'leiharbeiter'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {employee.role === 'admin' ? 'Administrator' : 
                         employee.role === 'leiharbeiter' ? 'Leiharbeiter' : 'Mitarbeiter'}
                      </span>
                    </div>
                  </div>

                  {/* Tage-Statistiken */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                    <div className="bg-green-50 p-2 rounded text-center">
                      <div className="font-medium text-green-800">
                        {((employee.vacation_days_total || 25) - (employee.vacation_days_used || 0))}
                      </div>
                      <div className="text-green-600">Urlaub verfügbar</div>
                    </div>
                    <div className="bg-red-50 p-2 rounded text-center">
                      <div className="font-medium text-red-800">
                        {employee.sick_days_used || 0}
                      </div>
                      <div className="text-red-600">Krankheitstage</div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded text-center">
                      <div className="font-medium text-blue-800">
                        {employee.special_days_used || 0}
                      </div>
                      <div className="text-blue-600">Sonderurlaub</div>
                    </div>
                  </div>

                  {/* Persönlichkeitsmerkmale */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Persönlichkeitsmerkmale
                    </label>
                    <textarea
                      value={personalityTraits[employee.id] || ''}
                      onChange={(e) => handleTraitsChange(employee.id, e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="4"
                      placeholder="Beschreiben Sie Teamfähigkeit, Zuverlässigkeit, Motivation, Arbeitsweise..."
                    />
                    <div className="mt-1 text-xs text-gray-400">
                      Beschreiben Sie die Persönlichkeit und Arbeitsweise des Mitarbeiters
                    </div>
                  </div>

                  {/* Skills Preview */}
                  {employee.skills && employee.skills.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">Top Skills:</div>
                      <div className="flex flex-wrap gap-1">
                        {employee.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                            {skill.name}
                            <span className="ml-1 text-yellow-500">{'★'.repeat(skill.rating)}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>

        <div className="flex justify-between items-center space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
            title="Krankheitstage und Urlaubstage aktualisieren"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Aktualisierung...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Aktualisieren
              </>
            )}
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Speichern...
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Merkmale speichern
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const VacationDialog = ({ isOpen, onClose, onSave, employees, editingEntry = null, isBackendMode = false }) => {
  const [formData, setFormData] = useState({
    employee_id: '',
    start_date: '',
    end_date: '',
    vacation_type: 'URLAUB',
    notes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingEntry) {
      setFormData({
        employee_id: editingEntry.employee_id,
        start_date: editingEntry.start_date,
        end_date: editingEntry.end_date,
        vacation_type: editingEntry.vacation_type,
        notes: editingEntry.notes || ''
      });
    } else {
      setFormData({
        employee_id: '',
        start_date: '',
        end_date: '',
        vacation_type: 'URLAUB',
        notes: ''
      });
    }
    setError('');
  }, [editingEntry, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Zusätzliche Validierung
      if (formData.start_date > formData.end_date) {
        throw new Error('Startdatum muss vor dem Enddatum liegen');
      }

      // Finde den Mitarbeiter für employee_name
      const employee = employees.find(emp => emp.id === formData.employee_id);
      if (!employee) {
        throw new Error('Mitarbeiter nicht gefunden');
      }

      // Berechne die Anzahl der Werktage (exklusive Samstag und Sonntag)
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      // Funktion zum Berechnen der Werktage
      const calculateWorkdays = (start, end) => {
        let workdays = 0;
        const currentDate = new Date(start);
        
        while (currentDate <= end) {
          const dayOfWeek = currentDate.getDay(); // 0 = Sonntag, 6 = Samstag
          if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Nicht Sonntag (0) oder Samstag (6)
            workdays++;
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return workdays;
      };
      
      const daysDiff = calculateWorkdays(startDate, endDate);

      const submitData = {
        ...formData,
        employee_name: employee.name,
        days_count: daysDiff // Backend erwartet days_count, nicht days
      };

      console.log('🔄 Submitting vacation data:', submitData);

      if (editingEntry) {
        // Dynamische API-Auswahl für Update
        if (isBackendMode) {
          await vacationAPI.update(editingEntry.id, submitData);
        } else {
          const { vacationAPI: localVacationAPI } = await import('./services/api');
          await localVacationAPI.update(editingEntry.id, submitData);
        }
      } else {
        // Dynamische API-Auswahl für Create
        if (isBackendMode) {
          await vacationAPI.create(submitData);
        } else {
          const { vacationAPI: localVacationAPI } = await import('./services/api');
          await localVacationAPI.create(submitData);
        }
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Urlaubseintrag wirklich löschen?')) {
      try {
        // Dynamische API-Auswahl für Delete
        if (isBackendMode) {
          await vacationAPI.delete(editingEntry.id);
        } else {
          const { vacationAPI: localVacationAPI } = await import('./services/api');
          await localVacationAPI.delete(editingEntry.id);
        }
        onSave();
        onClose();
      } catch (err) {
        alert('Fehler beim Löschen des Urlaubseintrags');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            {editingEntry ? 'Urlaub bearbeiten' : 'Neuer Urlaub'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mitarbeiter *
            </label>
            <select
              value={formData.employee_id}
              onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Mitarbeiter auswählen</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Von *
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bis *
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Art *
            </label>
            <select
              value={formData.vacation_type}
              onChange={(e) => setFormData({ ...formData, vacation_type: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(VACATION_TYPES).map(([key, type]) => (
                <option key={key} value={key}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notizen
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Optionale Notizen..."
            />
          </div>

          <div className="flex justify-between pt-4">
            {editingEntry && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-1 inline" />
                Löschen
              </button>
            )}
            <div className="flex space-x-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Speichern...' : (editingEntry ? 'Aktualisieren' : 'Erstellen')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
const EmployeeDialog = ({ isOpen, onClose, onSave, editingEmployee = null, isBackendMode = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    vacation_days_total: 25,
    skills: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingEmployee) {
      setFormData({
        name: editingEmployee.name,
        email: editingEmployee.email,
        role: editingEmployee.role,
        vacation_days_total: editingEmployee.vacation_days_total || 25,
        skills: editingEmployee.skills || []
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'employee', 
        vacation_days_total: 25,
        skills: []
      });
    }
    setError('');
  }, [editingEmployee, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingEmployee) {
        // Dynamische API-Auswahl basierend auf Backend-Mode
        if (isBackendMode) {
          await employeeAPI.update(editingEmployee.id, formData);
        } else {
          const { employeeAPI: localEmployeeAPI } = await import('./services/api');
          await localEmployeeAPI.update(editingEmployee.id, formData);
        }
      } else {
        // Dynamische API-Auswahl für Create
        if (isBackendMode) {
          await employeeAPI.create(formData);
        } else {
          const { employeeAPI: localEmployeeAPI } = await import('./services/api');
          await localEmployeeAPI.create(formData);
        }
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-90vh overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">
            {editingEmployee ? 'Mitarbeiter bearbeiten' : 'Neuer Mitarbeiter'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Max Mustermann"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-Mail
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="max.mustermann@firma.de"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rolle
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="employee">Mitarbeiter</option>
              <option value="admin">Administrator</option>
              <option value="leiharbeiter">Leiharbeiter</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Urlaubstage pro Jahr
            </label>
            <input
              type="number"
              min="0"
              max="365"
              step="0.01"
              value={formData.vacation_days_total}
              onChange={(e) => setFormData({ ...formData, vacation_days_total: parseFloat(e.target.value) || 25 })}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-1 text-xs text-gray-400">
              Dezimalwerte sind erlaubt (z.B. 27.08 für monatliche Berechnung)
            </div>
          </div>

          <SkillManager
            skills={formData.skills}
            onSkillsChange={(skills) => setFormData({ ...formData, skills })}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Speichern...' : (editingEmployee ? 'Aktualisieren' : 'Erstellen')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');
  const [employees, setEmployees] = useState([]);
  const [vacationEntries, setVacationEntries] = useState([]);
  const [showVacationDialog, setShowVacationDialog] = useState(false);
  const [editingVacationEntry, setEditingVacationEntry] = useState(null);
  const [showPersonalityDialog, setShowPersonalityDialog] = useState(false);
  const [selectedEmployeeForPersonality, setSelectedEmployeeForPersonality] = useState(null);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEmployeeDialog, setShowEmployeeDialog] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [showDataSync, setShowDataSync] = useState(false);
  const [isBackendMode, setIsBackendMode] = useState(false);
  const [initializationComplete, setInitializationComplete] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for saved dark mode preference
    const saved = localStorage.getItem('darkMode');
    return saved !== null ? JSON.parse(saved) : false;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    max_concurrent_percentage: 30,
    total_employees: 0,
    max_concurrent_calculated: 1
  });

  // Dark Mode Effect
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Toggle Dark Mode Function
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Initialisierung beim App-Start - Backend-First Approach (BLOCKIEREND)
  useEffect(() => {
    let isMounted = true;
    
    const initializeApp = async () => {
      console.log('🚀 App Initialisierung gestartet (blockierend)...');
      setLoading(true);
      
      try {
        // 1. SYNCHRONER Backend-Check (MUSS zuerst abgeschlossen werden)
        console.log('🔌 Prüfe Backend-Verfügbarkeit (synchron)...');
        const backendResult = await initializeBackend();
        
        if (!isMounted) return; // Komponente wurde unmounted
        
        if (backendResult.available) {
          console.log('✅ Backend verfügbar - verwende NUR Backend (KEIN LocalStorage)');
          console.log('🌐 Aktive Backend-URL:', backendResult.url);
          setIsBackendMode(true);
          
          // Backend-Mode: KEINE LocalStorage-Initialisierung
          console.log('🌐 Backend-Mode aktiviert - LocalStorage komplett übersprungen');
          
        } else {
          console.log('❌ Backend nicht verfügbar - verwende LocalStorage als Fallback');
          setIsBackendMode(false);
          
          // Fallback: LocalStorage-Mode (nur wenn Backend nicht verfügbar)
          console.log('💾 LocalStorage-Mode aktiviert - Backend unerreichbar');
          const { initializeData } = await import('./services/api');
          await initializeData();
        }
        
        if (!isMounted) return; // Prüfung nach async operation
        
        // 2. Setze Initialisierung als abgeschlossen (BLOCKIERT andere useEffects)
        setInitializationComplete(true);
        console.log('✅ App-Initialisierung abgeschlossen - andere useEffects können starten');
        
        // 3. Prüfe Authentifizierung NUR nach vollständiger Initialisierung
        if (isAuthenticated()) {
          const userData = getUserData();
          setCurrentUser(userData);
          setAuthenticated(true);
          
          // Lade Daten je nach Modus - aber nicht hier, sondern im separaten useEffect
          console.log('🔐 Authentifizierung erkannt - Daten werden geladen...');
        }
        
      } catch (error) {
        if (isMounted) {
          console.error('❌ Initialisierung fehlgeschlagen:', error);
          setError('Fehler bei der App-Initialisierung: ' + error.message);
          setInitializationComplete(true); // Auch bei Fehlern freigeben
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeApp();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Läuft nur einmal beim Mount

  // Separater useEffect für Daten-Loading (NUR nach Initialisierung)
  useEffect(() => {
    if (initializationComplete && currentUser) {
      console.log('📊 Starte Daten-Loading nach vollständiger Initialisierung...');
      loadData();
    }
  }, [initializationComplete, currentUser]); // Abhängig von Initialisierung und User

  const handleLogin = () => {
    console.log('🔄 handleLogin aufgerufen');
    const userData = getUserData();
    console.log('👤 User Data:', userData);
    setCurrentUser(userData);
    setAuthenticated(true);
    console.log('✅ Auth state auf true gesetzt');
    // Load data after successful login
    loadData();
  };

  const handleLogout = () => {
    clearAuthData();
    setAuthenticated(false);
    setCurrentUser(null);
    // Clear all data
    setEmployees([]);
    setVacationEntries([]);
    setCurrentView('month');
    setSearchTerm('');
    setShowFilters(false);
    setError('');
  };

  // Daten laden - Backend oder LocalStorage je nach Modus
  const loadData = async () => {
    if (!initializationComplete) {
      console.log('⏳ Initialisierung noch nicht abgeschlossen - warte...');
      return;
    }

    try {
      setLoading(true);
      
      if (isBackendMode) {
        console.log('📡 Lade Daten vom Backend...');
        console.log('🔍 Backend-URL Check:', process.env.REACT_APP_BACKEND_URL);
        console.log('🔍 Window Backend-URL:', typeof window !== 'undefined' ? window.ACTIVE_BACKEND_URL : 'undefined');
        
        // Backend-Mode: Verwende FastAPI
        const [employeesResponse, vacationsResponse] = await Promise.all([
          employeeAPI.getAll(),
          vacationAPI.getAll()
        ]);
        
        setEmployees(employeesResponse.data || []);
        setVacationEntries(vacationsResponse.data || []);
        
        console.log(`✅ Backend-Daten geladen: ${employeesResponse.data?.length || 0} Mitarbeiter, ${vacationsResponse.data?.length || 0} Urlaubseinträge`);
        
      } else {
        console.log('💾 Lade Daten vom LocalStorage...');
        
        // LocalStorage-Mode: Verwende alte API
        const { employeeAPI: localEmployeeAPI, vacationAPI: localVacationAPI } = await import('./services/api');
        
        const [employeesResponse, vacationsResponse] = await Promise.all([
          localEmployeeAPI.getAll(),
          localVacationAPI.getAll()
        ]);
        
        setEmployees(employeesResponse.data || []);
        setVacationEntries(vacationsResponse.data || []);
        
        console.log(`✅ LocalStorage-Daten geladen: ${employeesResponse.data?.length || 0} Mitarbeiter, ${vacationsResponse.data?.length || 0} Urlaubseinträge`);
      }
      
    } catch (error) {
      console.error('❌ Fehler beim Laden der Daten:', error);
      console.error('❌ Detaillierter Fehler:', error.response?.data || error.message);
      
      // Bei Backend-Fehler: Nicht zu LocalStorage fallback - zeige Fehler
      if (isBackendMode) {
        console.log('❌ Backend-Daten-Loading fehlgeschlagen - zeige Fehlermeldung statt LocalStorage-Fallback');
        setError(`Backend-Verbindungsfehler: ${error.message}`);
      } else {
        setError('Fehler beim Laden der Daten');
      }
    } finally {
      setLoading(false);
    }
  };

  // Dynamic API selection helper
  const getAPI = async () => {
    if (isBackendMode) {
      return {
        employeeAPI,
        vacationAPI,
        userAPI
      };
    } else {
      const localAPI = await import('./services/api');
      return {
        employeeAPI: localAPI.employeeAPI,
        vacationAPI: localAPI.vacationAPI,
        userAPI: localAPI.userAPI
      };
    }
  };

  // Dialog handlers
  const handleNewVacation = () => {
    setEditingVacationEntry(null);
    setShowVacationDialog(true);
  };

  const handleNewEmployee = () => {
    setEditingEmployee(null);
    setShowEmployeeDialog(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowEmployeeDialog(true);
  };

  const handleEditVacationEntry = (entry) => {
    setEditingVacationEntry(entry);
    setShowVacationDialog(true);
  };

  const handleDeleteEmployee = async (employee) => {
    if (window.confirm(`Mitarbeiter "${employee.name}" wirklich löschen? Alle Urlaubseinträge werden ebenfalls gelöscht.`)) {
      try {
        await employeeAPI.delete(employee.id);
        loadData();
      } catch (err) {
        alert('Fehler beim Löschen des Mitarbeiters');
      }
    }
  };

  const handleOpenPersonalityProfile = (employee) => {
    setSelectedEmployeeForPersonality(employee);
    setShowPersonalityDialog(true);
  };

  const handleSaveEmployee = () => {
    loadData(); // Reload data after save
  };

  // Navigation handlers
  const handlePrevious = () => {
    if (currentView === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (currentView === 'year') {
      setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth()));
    }
  };

  const handleNext = () => {
    if (currentView === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (currentView === 'year') {
      setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth()));
    }
  };

  // View handlers
  const handleMonthClick = (month) => {
    setCurrentDate(month);
    setCurrentView('month');
  };

  const handleDateClick = (date) => {
    console.log('Date clicked:', date);
    // Könnte ein Quick-Add Dialog öffnen
  };

  const handleSaveVacation = () => {
    loadData(); // Reload data after save
  };

  // Placeholder handlers
  const handleExport = () => {
    alert('Export-Funktion wird implementiert...');
  };

  const handleImport = () => {
    alert('Import-Funktion wird implementiert...');
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initialisierung...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!authenticated) {
    return <LoginScreen onLogin={handleLogin} isBackendMode={isBackendMode} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <BrowserRouter>
        <div className="flex flex-col h-screen">
          {/* Toolbar */}
          <Toolbar
            onNewVacation={handleNewVacation}
            onNewEmployee={handleNewEmployee}
            onExport={handleExport}
            onImport={handleImport}
            onPrint={handlePrint}
            currentView={currentView}
            onViewChange={setCurrentView}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            employees={employees}
            settings={settings}
            onLogout={handleLogout}
            currentUser={currentUser}
            showSettings={showSettings}
            setShowSettings={setShowSettings}
            setShowPersonalityDialog={setShowPersonalityDialog}
            setSelectedEmployeeForPersonality={setSelectedEmployeeForPersonality}
            setShowUserManagement={setShowUserManagement}
          />

          {/* Calendar Navigation */}
          {currentView !== 'team' && (
            <CalendarNavigation
              currentDate={currentDate}
              onPrevious={handlePrevious}
              onNext={handleNext}
              view={currentView}
            />
          )}

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 mx-4">
                <div className="flex">
                  <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {currentView === 'month' && (
              <MonthCalendarView
                currentDate={currentDate}
                vacationEntries={vacationEntries}
                employees={employees}
                onDateClick={handleDateClick}
                onEntryClick={handleEditVacationEntry}
              />
            )}

            {currentView === 'year' && (
              <YearCalendarView
                currentDate={currentDate}
                vacationEntries={vacationEntries}
                onMonthClick={handleMonthClick}
              />
            )}

            {currentView === 'team' && (
              <div className="bg-white p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Team-Verwaltung</h2>
                  <p className="text-gray-600">
                    Verwalten Sie Ihre Mitarbeiter und deren Informationen.
                  </p>
                  <div className="mt-2 text-sm text-gray-500">
                    Aktuell: {employees.length} Mitarbeiter • Max. gleichzeitig im Urlaub: {Math.max(1, Math.floor(employees.length * 0.3))} (30%)
                  </div>
                </div>

                {employees.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Mitarbeiter vorhanden</h3>
                    <p className="text-gray-500 mb-6">Fügen Sie Ihren ersten Mitarbeiter hinzu, um zu beginnen.</p>
                  </div>
                ) : (
                  <div className="shadow ring-1 ring-black ring-opacity-5 md:rounded-lg overflow-hidden">
                    <div className="team-table-scroll">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50">
                              Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50">
                              E-Mail
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50">
                              Rolle
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50">
                              Urlaubstage & Krankheit
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50">
                              Skills
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50">
                              Aktionen
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {employees
                            .sort((a, b) => {
                              // Admins first
                              if (a.role === 'admin' && b.role !== 'admin') return -1;
                              if (b.role === 'admin' && a.role !== 'admin') return 1;
                              return a.name.localeCompare(b.name);
                            })
                            .map((employee) => (
                              <tr key={`employee-${employee.id}`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center space-x-2">
                                    <div className="text-sm font-medium text-gray-900">
                                      {employee.role === 'admin' && '👑 '}
                                      {employee.name}
                                    </div>
                                    <button
                                      onClick={() => handleOpenPersonalityProfile(employee)}
                                      className="text-blue-600 hover:text-blue-800 text-xs bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                                      title="Persönlichkeitsmerkmale bearbeiten"
                                    >
                                      Profil
                                    </button>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm text-gray-900">{employee.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    employee.role === 'admin'
                                      ? 'bg-purple-100 text-purple-800'
                                      : employee.role === 'leiharbeiter'
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {employee.role === 'admin' ? 'Administrator' : 
                                     employee.role === 'leiharbeiter' ? 'Leiharbeiter' : 'Mitarbeiter'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div className="flex flex-col">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-medium">{employee.vacation_days_total || 25}</span>
                                      <span className="text-gray-500">Tage/Jahr</span>
                                    </div>
                                    <div className="flex items-center space-x-1 mt-1">
                                      <div className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-xs text-green-600">
                                          {((employee.vacation_days_total || 25) - (employee.vacation_days_used || 0))} verfügbar
                                        </span>
                                      </div>
                                      <span className="text-gray-300">•</span>
                                      <div className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-xs text-blue-600">
                                          {employee.vacation_days_used || 0} verwendet
                                        </span>
                                      </div>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                      <div 
                                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-300"
                                        style={{
                                          width: `${Math.min(100, ((employee.vacation_days_used || 0) / (employee.vacation_days_total || 25)) * 100)}%`
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="space-y-1">
                                    {(employee.skills && employee.skills.length > 0) ? (
                                      <>
                                        {employee.skills.map((skill, index) => (
                                          <div key={`skill-${index}-${skill.name}`} className="flex items-center justify-between">
                                            <span className="text-xs text-gray-600 mr-2">{skill.name}</span>
                                            <StarRating rating={skill.rating} readonly={true} />
                                          </div>
                                        ))}
                                      </>
                                    ) : (
                                      <span className="text-xs text-gray-400">Keine Skills</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <button
                                    onClick={() => handleEditEmployee(employee)}
                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEmployee(employee)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentView !== 'team' && currentView !== 'month' && currentView !== 'year' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Kalenderansicht</h3>
                  <p className="text-gray-500">Wählen Sie eine Ansicht aus der Toolbar</p>
                </div>
              </div>
            )}
          </div>

          {/* Vacation Dialog */}
          <VacationDialog
            isOpen={showVacationDialog}
            onClose={() => setShowVacationDialog(false)}
            onSave={handleSaveVacation}
            employees={employees}
            editingEntry={editingVacationEntry}
            isBackendMode={isBackendMode}
          />

          {/* Employee Dialog */}
          <EmployeeDialog
            isOpen={showEmployeeDialog}
            onClose={() => setShowEmployeeDialog(false)}
            onSave={handleSaveEmployee}
            editingEmployee={editingEmployee}
            isBackendMode={isBackendMode}
          />

          {/* Personality Profile Dialog */}
          <PersonalityProfileDialog
            isOpen={showPersonalityDialog}
            onClose={() => {
              setShowPersonalityDialog(false);
              setSelectedEmployeeForPersonality(null);
            }}
            employees={employees}
            selectedEmployee={selectedEmployeeForPersonality}
            onSave={loadData}
            isBackendMode={isBackendMode}
          />

          {/* User Management Dialog - Nur für Admins */}
          {currentUser?.role === 'admin' && (
            <UserManagementDialog
              isOpen={showUserManagement}
              onClose={() => setShowUserManagement(false)}
              currentUser={currentUser}
            />
          )}
        </div>
      </BrowserRouter>
    </div>
  );
}

export default App;