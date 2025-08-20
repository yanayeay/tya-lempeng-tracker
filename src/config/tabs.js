// config/tabs.js
import { BarChart3, CreditCard, ShoppingCart, Shield, Tag } from 'lucide-react';

export const TAB_CONFIGURATION = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: BarChart3,
    description: 'Overview & Analytics',
    permission: { category: 'dashboard', action: 'viewDashboard' }
  },
  {
    id: 'orders',
    name: 'Orders',
    icon: ShoppingCart,
    description: 'Manage Orders',
    permission: { category: 'orders', action: 'viewOrders' }
  },
  {
    id: 'transactions',
    name: 'Transactions',
    icon: CreditCard,
    description: 'Manage Transactions',
    permission: { category: 'transactions', action: 'viewTransactions' }
  },
  {
      id: 'categories',
      name: 'Categories',
      icon: Tag,
      description: 'Manage Categories'
   },
  {
    id: 'admin',
    name: 'Admin',
    icon: Shield,
    description: 'Settings & Data',
    permission: { category: 'admin', action: 'viewAdmin' }
  }
];