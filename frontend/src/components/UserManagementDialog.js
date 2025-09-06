import React, { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { X, Plus, Edit2, Trash2, User, Shield, Key } from 'lucide-react';

const UserManagementDialog = ({ isOpen, onClose, currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user'
  });

  // Benutzer laden
  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Fehler beim Laden der Benutzer:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  // Formular zurücksetzen
  const resetForm = () => {
    setFormData({ username: '', password: '', role: 'user' });
    setShowCreateForm(false);
    setEditingUser(null);
  };

  // Neuen Benutzer erstellen
  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      alert('Bitte alle Felder ausfüllen');
      return;
    }

    setLoading(true);
    try {
      await userAPI.create(formData);
      await loadUsers();
      resetForm();
      alert('Benutzer erfolgreich erstellt!');
    } catch (error) {
      alert(error.response?.data?.error || 'Fehler beim Erstellen des Benutzers');
    } finally {
      setLoading(false);
    }
  };

  // Passwort ändern
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!formData.password.trim()) {
      alert('Bitte neues Passwort eingeben');
      return;
    }

    setLoading(true);
    try {
      await userAPI.updatePassword({
        username: editingUser.username,
        newPassword: formData.password
      });
      await loadUsers();
      resetForm();
      alert('Passwort erfolgreich geändert!');
    } catch (error) {
      alert(error.response?.data?.error || 'Fehler beim Ändern des Passworts');
    } finally {
      setLoading(false);
    }
  };

  // Benutzer löschen
  const handleDeleteUser = async (username) => {
    console.log('🗑️ Lösche Benutzer:', username);
    
    if (!window.confirm(`Benutzer "${username}" wirklich löschen?`)) {
      console.log('❌ Löschung abgebrochen durch Benutzer');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Rufe userAPI.delete auf...');
      const result = await userAPI.delete(username);
      console.log('✅ API-Response:', result);
      
      await loadUsers();
      console.log('✅ Benutzerliste neu geladen');
      
      alert('Benutzer erfolgreich gelöscht!');
    } catch (error) {
      console.error('❌ Fehler beim Löschen:', error);
      alert(error.response?.data?.error || 'Fehler beim Löschen des Benutzers');
    } finally {
      setLoading(false);
    }
  };

  // Passwort-Bearbeitung starten
  const startEditPassword = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username, password: '', role: user.role });
    setShowCreateForm(false);
  };

  if (!isOpen) return null;

  // Überprüfe Admin-Berechtigung
  if (currentUser?.role !== 'admin') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Zugriff verweigert</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-gray-600">Nur Administratoren können Benutzer verwalten.</p>
          <button
            onClick={onClose}
            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            OK
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Benutzerverwaltung</h3>
            <p className="text-sm text-gray-500 mt-1">
              Login-Daten für das System verwalten
            </p>
          </div>
          <button
            onClick={() => { resetForm(); onClose(); }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Neuen Benutzer erstellen Button */}
          {!showCreateForm && !editingUser && (
            <div className="mb-6">
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Neuen Benutzer erstellen
              </button>
            </div>
          )}

          {/* Benutzer erstellen Form */}
          {showCreateForm && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Neuen Benutzer erstellen</h4>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Benutzername
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Benutzername eingeben"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passwort
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Passwort eingeben"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Erstelle...' : 'Erstellen'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Passwort ändern Form */}
          {editingUser && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Passwort ändern für: {editingUser.username}
              </h4>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Neues Passwort
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Neues Passwort eingeben"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50"
                  >
                    {loading ? 'Ändere...' : 'Passwort ändern'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Benutzer-Liste */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Vorhandene Benutzer</h4>
            {loading && !showCreateForm && !editingUser ? (
              <p className="text-gray-500">Lade Benutzer...</p>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.username}
                    className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-blue-600">
                        {user.role === 'admin' ? <Shield className="w-5 h-5" /> : <User className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.username}
                          {user.role === 'admin' && <span className="ml-2 text-blue-600">👑</span>}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.role === 'admin' ? 'Administrator' : 'Benutzer'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEditPassword(user)}
                        className="text-yellow-600 hover:text-yellow-800 p-1"
                        title="Passwort ändern"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      {user.username !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(user.username)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Benutzer löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={() => { resetForm(); onClose(); }}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementDialog;