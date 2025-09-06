import React, { useState } from 'react';
import { Calendar, Lock, AlertTriangle } from 'lucide-react';
import { authAPI } from '../services/backendApi';
import { setAuthData } from '../utils/auth';

const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Bitte Benutzername und Passwort eingeben');
      return;
    }

    console.log('🔄 Login gestartet mit Benutzername:', username);
    setLoading(true);
    setError('');

    try {
      console.log('🔄 Rufe authAPI.login auf...');
      // Einfache Login-Validierung
      const response = await authAPI.login({ username: username.trim(), password: password.trim() });
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
      setError(err.response?.data?.error || 'Ungültige Anmeldedaten');
      setUsername('');
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 relative"
      style={{
        backgroundImage: 'url(/logistics-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dunkles Overlay für bessere Lesbarkeit */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      {/* Blaues Gradient-Overlay für Branding */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-blue-600/10"></div>
      
      {/* EXPRESS-LOGISTIK Hintergrund-Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-white/5 text-[12rem] md:text-[16rem] font-black tracking-wider transform -rotate-12 select-none">
          EXPRESS-LOGISTIK
        </div>
      </div>
      
      {/* EXPRESS-LOGISTIK Subtile Ecken-Texte */}
      <div className="absolute top-8 left-8 text-white/10 text-2xl font-bold tracking-wide transform -rotate-12 select-none pointer-events-none">
        EXPRESS-LOGISTIK
      </div>
      <div className="absolute bottom-8 right-8 text-white/10 text-2xl font-bold tracking-wide transform rotate-12 select-none pointer-events-none">
        EXPRESS-LOGISTIK
      </div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-24 w-24 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 shadow-2xl border-4 border-blue-200/50">
            <Calendar className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">Urlaubsplaner</h1>
          <p className="text-blue-100 text-lg drop-shadow">Bitte geben Sie Ihre Anmeldedaten ein</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Lock className="w-5 h-5 inline mr-2 text-blue-600" />
                Benutzername
              </label>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/90"
                placeholder="Benutzername eingeben"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Lock className="w-5 h-5 inline mr-2 text-blue-600" />
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/90"
                placeholder="Passwort eingeben"
              />
            </div>

            {error && (
              <div className="bg-red-50/95 backdrop-blur-sm border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm shadow-lg">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!username.trim() || !password.trim() || loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  Überprüfung...
                </div>
              ) : (
                'Anmelden'
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500/80">
              🔒 Sicheres Urlaubsplanungssystem
            </p>
          </div>
        </div>

        {/* Estyria Branding Footer */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <p className="text-sm text-white/90 font-medium">Powered by Estyria</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;