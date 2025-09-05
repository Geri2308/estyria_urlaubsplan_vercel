import React, { useState } from 'react';
import { Calendar, Lock, AlertTriangle } from 'lucide-react';
import { authAPI } from '../services/api';
import { setAuthData } from '../utils/auth';

const LoginScreen = ({ onLogin }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔄 Login gestartet mit Code:', code);
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Rufe authAPI.login auf...');
      const response = await authAPI.login(code);
      console.log('✅ Login Response:', response.data);
      
      const { token, user } = response.data;
      
      // Speichere Auth-Daten
      setAuthData(token, user);
      console.log('✅ Auth-Daten gespeichert');
      
      // Rufe onLogin auf
      onLogin();
      console.log('✅ onLogin() aufgerufen');
    } catch (err) {
      console.error('❌ Login-Fehler:', err);
      setError(err.response?.data?.error || 'Fehler beim Anmelden');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCode(value);
    if (error) setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Urlaubsplaner</h1>
          <p className="text-gray-600">Bitte geben Sie Ihren 4-stelligen Code ein</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Zugangscode
              </label>
              <input
                type="password"
                value={code}
                onChange={handleCodeChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="●●●●"
                maxLength="4"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={code.length !== 4 || loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Überprüfung...
                </div>
              ) : (
                'Anmelden'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Sicheres Urlaubsplanungssystem für Vercel
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>🔒 Ihre Daten sind geschützt</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;