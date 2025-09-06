import React, { useState, useRef } from 'react';
import { Download, Upload, Smartphone, Monitor, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const DataSyncDialog = ({ isOpen, onClose, onSyncComplete, isBackendMode = false }) => {
  const [loading, setLoading] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
  const fileInputRef = useRef(null);

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      
      if (isBackendMode) {
        showMessage('Backend-Modus: Export über Server nicht verfügbar. Wechseln Sie zu LocalStorage-Modus für Export/Import.', 'info');
        return;
      }
      
      // Importiere LocalStorage API
      const { dataManagement } = await import('../services/api');
      const result = dataManagement.downloadBackup();
      
      if (result.success) {
        showMessage(`✅ Daten erfolgreich exportiert: ${result.filename}`, 'success');
      } else {
        showMessage(`❌ Export fehlgeschlagen: ${result.error}`, 'error');
      }
    } catch (error) {
      showMessage(`❌ Fehler beim Export: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      
      if (isBackendMode) {
        showMessage('Backend-Modus: Import über Server nicht verfügbar. Wechseln Sie zu LocalStorage-Modus für Export/Import.', 'info');
        return;
      }
      
      const { dataManagement } = await import('../services/api');
      const result = await dataManagement.importFromFile(file);
      
      setImportPreview(result);
      setMessage('');
    } catch (error) {
      showMessage(`❌ Fehler beim Lesen der Datei: ${error.message}`, 'error');
      setImportPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (mergeMode = 'replace') => {
    if (!importPreview) return;

    try {
      setLoading(true);
      const { dataManagement } = await import('../services/api');
      
      const result = dataManagement.applyImport(importPreview.data, {
        mergeMode,
        includeLogins: true,
        includeEmployees: true,
        includeVacations: true
      });
      
      if (result.success) {
        const stats = result.stats;
        const summary = [
          `Mitarbeiter: ${stats.employees.imported} importiert, ${stats.employees.skipped} übersprungen`,
          `Urlaubseinträge: ${stats.vacations.imported} importiert, ${stats.vacations.skipped} übersprungen`,
          `Login-Daten: ${stats.logins.imported} importiert`
        ].join('\n');
        
        showMessage(`✅ Import erfolgreich!\n${summary}`, 'success');
        setImportPreview(null);
        
        // Benachrichtige Parent-Komponente über erfolgreichen Import
        if (onSyncComplete) {
          setTimeout(() => onSyncComplete(), 1000);
        }
      } else {
        showMessage(`❌ Import fehlgeschlagen: ${result.error}`, 'error');
      }
    } catch (error) {
      showMessage(`❌ Fehler beim Import: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetImport = () => {
    setImportPreview(null);
    setMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <RefreshCw className="w-5 h-5 mr-2" />
              Multi-Device Synchronisation
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Status Info */}
          <div className={`mb-6 p-4 rounded-lg ${isBackendMode ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-center">
              {isBackendMode ? (
                <>
                  <Monitor className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">Backend-Modus aktiv</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-blue-800 font-medium">LocalStorage-Modus aktiv</span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {isBackendMode 
                ? 'Daten werden automatisch zwischen Geräten synchronisiert.' 
                : 'Export/Import verfügbar für manuelle Synchronisation zwischen Geräten.'}
            </p>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-4 p-3 rounded-lg flex items-start ${
              messageType === 'success' ? 'bg-green-50 border border-green-200' :
              messageType === 'error' ? 'bg-red-50 border border-red-200' :
              'bg-blue-50 border border-blue-200'
            }`}>
              {messageType === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />}
              {messageType === 'error' && <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />}
              {messageType === 'info' && <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />}
              <span className={`text-sm whitespace-pre-line ${
                messageType === 'success' ? 'text-green-800' :
                messageType === 'error' ? 'text-red-800' :
                'text-blue-800'
              }`}>
                {message}
              </span>
            </div>
          )}

          {!isBackendMode && (
            <>
              {/* Export Section */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Daten exportieren
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Exportiert alle Mitarbeiter, Urlaubseinträge und Login-Daten als JSON-Datei.
                </p>
                <button
                  onClick={handleExport}
                  disabled={loading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {loading ? 'Exportiere...' : 'Daten exportieren'}
                </button>
              </div>

              {/* Import Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Daten importieren
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Import einer JSON-Datei von einem anderen Gerät.
                </p>

                {!importPreview ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={loading}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {loading ? 'Lade...' : 'Datei auswählen'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Import-Vorschau:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>📅 Erstellt: {new Date(importPreview.preview.timestamp).toLocaleString()}</div>
                      <div>👥 Mitarbeiter: {importPreview.preview.employees}</div>
                      <div>🏖️ Urlaubseinträge: {importPreview.preview.vacations}</div>
                      <div>🔐 Login-Accounts: {importPreview.preview.logins}</div>
                      <div>📱 Gerät: {importPreview.preview.device?.exportedBy || 'Unbekannt'}</div>
                    </div>
                    
                    <div className="flex space-x-2 mt-4">
                      <button
                        onClick={() => handleImport('replace')}
                        disabled={loading}
                        className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Importiere...' : 'Ersetzen'}
                      </button>
                      <button
                        onClick={() => handleImport('merge')}
                        disabled={loading}
                        className="bg-orange-600 text-white px-3 py-2 rounded text-sm hover:bg-orange-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Importiere...' : 'Zusammenführen'}
                      </button>
                      <button
                        onClick={resetImport}
                        disabled={loading}
                        className="bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600 transition-colors disabled:opacity-50"
                      >
                        Abbrechen
                      </button>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500">
                      <strong>Ersetzen:</strong> Überschreibt alle lokalen Daten<br/>
                      <strong>Zusammenführen:</strong> Kombiniert Daten, behält Duplikate
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Close Button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Schließen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataSyncDialog;