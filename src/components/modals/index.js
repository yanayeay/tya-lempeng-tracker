// components/modals/index.js
export { default as TransactionModal } from './TransactionModal';
export { default as OrderModal } from './OrderModal';
export { default as CategoryModal } from './CategoryModal';
export { default as UserModal } from './UserModal';
export { default as AccessModal } from './AccessModal';

// Re-export modal hook
export { useModals } from '../../hooks/useModals';