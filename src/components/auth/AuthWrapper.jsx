// components/auth/AuthWrapper.jsx
import React from 'react';
import PasswordProtection from './PasswordProtection';
import { useAuth } from '../../hooks/useAuth';

const AuthWrapper = ({ onAuthenticated }) => {
  const { login, loading, error, clearError } = useAuth();

  return (
    <PasswordProtection
      onAuthenticated={onAuthenticated}
      loading={loading}
      error={error}
      onLogin={login}
      onClearError={clearError}
    />
  );
};

export default AuthWrapper;