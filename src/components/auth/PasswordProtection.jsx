// components/auth/PasswordProtection.jsx
import React, { useState } from 'react';
import {Eye, EyeOff } from 'lucide-react';

const PasswordProtection = ({ onAuthenticated, loading, error, onLogin, onClearError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    const user = await onLogin(username, password);
    if (user) {
      onAuthenticated(user);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
    }
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (error) onClearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-red-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mx-auto w-40 h-40 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <img
                src="/lempeng.png"
                alt="Logo"
                className="w-full h-full object-cover"
              />
          </div>
          <h1 className="text-2xl font-bold text-yellow-900">Tya's Lempeng Biz Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your credentials to access the system</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={handleInputChange(setUsername)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-center text-lg"
              placeholder="Enter your username"
              autoFocus
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handleInputChange(setPassword)}
                onKeyPress={handleKeyPress}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-center text-lg"
                placeholder="Enter your password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? '🔄 Logging in...' : '🔓 Login to System'}
          </button>
        </div>

        <div className="mt-6 text-center space-y-2">
          <div className="text-xs text-gray-500 space-y-1">
            <p>☁️ Powered by Supabase</p>
            <p>🔒 Secure cloud authentication</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordProtection;