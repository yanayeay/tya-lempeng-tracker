// components/auth/index.js
export { default as PasswordProtection } from './PasswordProtection';

// Re-export auth-related hooks and services for convenience
export { useAuth } from '../../hooks/useAuth';
export { authService } from '../../services/authService';