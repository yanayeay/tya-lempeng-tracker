// utils/calculations.js

/**
 * Filter transactions by period
 * @param {Array} transactions - Array of transactions
 * @param {string} filterType - 'all', 'monthly', 'yearly'
 * @param {number} selectedYear - Year to filter by
 * @param {number} selectedMonth - Month to filter by (0-11)
 * @returns {Array} Filtered transactions
 */
export const filterTransactionsByPeriod = (transactions = [], filterType, selectedYear, selectedMonth) => {
  if (filterType === 'all') {
    return transactions;
  }

  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    const transactionYear = transactionDate.getFullYear();
    const transactionMonth = transactionDate.getMonth();

    if (filterType === 'yearly') {
      return transactionYear === selectedYear;
    }

    if (filterType === 'monthly') {
      return transactionYear === selectedYear && transactionMonth === selectedMonth;
    }

    return true;
  });
};

/**
 * Get date range for a given period
 * @param {string} filterType - 'all', 'monthly', 'yearly'
 * @param {number} selectedYear - Year
 * @param {number} selectedMonth - Month (0-11)
 * @returns {Object} Date range object with start and end dates
 */
export const getDateRangeForPeriod = (filterType, selectedYear, selectedMonth) => {
  const now = new Date();

  if (filterType === 'all') {
    return {
      start: new Date(2020, 0, 1), // Default start date
      end: now,
      description: 'All Time'
    };
  }

  if (filterType === 'yearly') {
    return {
      start: new Date(selectedYear, 0, 1),
      end: new Date(selectedYear, 11, 31),
      description: `Year ${selectedYear}`
    };
  }

  if (filterType === 'monthly') {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    return {
      start: new Date(selectedYear, selectedMonth, 1),
      end: new Date(selectedYear, selectedMonth + 1, 0), // Last day of month
      description: `${monthNames[selectedMonth]} ${selectedYear}`
    };
  }

  return { start: now, end: now, description: 'Unknown Period' };
};

/**
 * Calculate comprehensive financial totals from transaction list
 * @param {Array} transactionList - Array of transactions
 * @returns {Object} Financial summary object
 */
export const calculateTransactionTotals = (transactionList = []) => {
  // Income (excluding balance from last month and delivery fees)
  const income = transactionList
    .filter(t => t.type === 'income' &&
                 t.category !== 'Balance From Last Month' &&
                 t.category !== 'Delivery')
    .reduce((sum, t) => sum + (t.total_amount || t.amount), 0);

  // Business expenses (excluding Ayien's personal expenses)
  const businessExpenses = transactionList
    .filter(t => t.type === 'expense' &&
                 !t.category.toLowerCase().includes('ayien withdraw') &&
                 !t.category.toLowerCase().includes('ayien own expenses'))
    .reduce((sum, t) => sum + (t.total_amount || t.amount), 0);

  // Cash balance calculations
  const balanceFromLastMonthCash = transactionList
    .filter(t => t.type === 'income' &&
                 t.category === 'Balance From Last Month' &&
                 t.payment_method === 'cash')
    .reduce((sum, t) => sum + (t.total_amount || t.amount), 0);

  const cashIncomeOnly = transactionList
    .filter(t => t.type === 'income' &&
                 t.payment_method === 'cash' &&
                 t.category !== 'Balance From Last Month')
    .reduce((sum, t) => sum + (t.total_amount || t.amount), 0);

  const cashExpenses = transactionList
    .filter(t => t.type === 'expense' && t.payment_method === 'cash')
    .reduce((sum, t) => sum + (t.total_amount || t.amount), 0);

  const cashBalance = balanceFromLastMonthCash + cashIncomeOnly - cashExpenses;

  // Online balance calculations
  const balanceFromLastMonth = transactionList
    .filter(t => t.type === 'income' &&
                 t.category === 'Balance From Last Month' &&
                 t.payment_method === 'online')
    .reduce((sum, t) => sum + (t.total_amount || t.amount), 0);

  const onlineIncomeOnly = transactionList
    .filter(t => t.type === 'income' &&
                 t.payment_method === 'online' &&
                 t.category !== 'Balance From Last Month')
    .reduce((sum, t) => sum + (t.total_amount || t.amount), 0);

  const onlineExpenses = transactionList
    .filter(t => t.type === 'expense' && t.payment_method === 'online')
    .reduce((sum, t) => sum + (t.total_amount || t.amount), 0);

  const onlineBalance = balanceFromLastMonth + onlineIncomeOnly - onlineExpenses;

  // Payment method totals
  const onlinePayments = transactionList
    .filter(t => t.type === 'income' &&
                 t.payment_method === 'online' &&
                 t.category !== 'Balance From Last Month')
    .reduce((sum, t) => sum + (t.total_amount || t.amount), 0);

  const cashTotal = transactionList
    .filter(t => t.payment_method === 'cash' &&
                 t.category !== 'Balance From Last Month')
    .reduce((sum, t) => sum + (t.total_amount || t.amount), 0);

  // Special categories
  const ayienSpending = transactionList
    .filter(t => t.category.toLowerCase().includes('ayien'))
    .reduce((sum, t) => sum + (t.total_amount || t.amount), 0);

  const deliveryFees = transactionList
    .filter(t => t.type === 'income' && t.category === 'Delivery')
    .reduce((sum, t) => sum + (t.total_amount || t.amount), 0);

  return {
    income,
    expenses: businessExpenses,
    balance: income - businessExpenses,
    cashBalance,
    onlineBalance,
    onlinePayments,
    cashTotal,
    ayienSpending,
    balanceFromLastMonth,
    onlineIncomeOnly,
    onlineExpenses,
    balanceFromLastMonthCash,
    cashIncomeOnly,
    cashExpenses,
    deliveryFees
  };
};

/**
 * Calculate orders data for dashboard from transactions
 * @param {Array} transactions - Array of transactions
 * @returns {Array} Orders data sorted by quantity
 */
export const calculateOrdersData = (transactions = []) => {
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const excludedCategories = ['Balance From Last Month', 'Delivery', 'Other'];

  // Group transactions by category and sum quantities
  const ordersByCategory = {};

  incomeTransactions.forEach(transaction => {
    const category = transaction.category;

    // Skip excluded categories
    if (excludedCategories.includes(category)) return;

    const quantity = parseFloat(transaction.quantity) || 1;

    if (ordersByCategory[category]) {
      ordersByCategory[category] += quantity;
    } else {
      ordersByCategory[category] = quantity;
    }
  });

  // Convert to array and sort by quantity (highest first)
  return Object.entries(ordersByCategory)
    .map(([category, qty]) => ({ category, quantity: qty }))
    .sort((a, b) => b.quantity - a.quantity);
};

/**
 * Calculate period comparison data
 * @param {Array} transactions - Array of all transactions
 * @param {string} filterType - Current filter type
 * @param {number} selectedYear - Current year
 * @param {number} selectedMonth - Current month
 * @returns {Object} Comparison data with current vs previous period
 */
export const calculatePeriodComparison = (transactions, filterType, selectedYear, selectedMonth) => {
  // Current period data
  const currentPeriodTransactions = filterTransactionsByPeriod(transactions, filterType, selectedYear, selectedMonth);
  const currentTotals = calculateTransactionTotals(currentPeriodTransactions);

  // Previous period data
  let previousPeriodTransactions = [];

  if (filterType === 'monthly') {
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    previousPeriodTransactions = filterTransactionsByPeriod(transactions, 'monthly', prevYear, prevMonth);
  } else if (filterType === 'yearly') {
    previousPeriodTransactions = filterTransactionsByPeriod(transactions, 'yearly', selectedYear - 1, 0);
  }

  const previousTotals = calculateTransactionTotals(previousPeriodTransactions);

  // Calculate changes
  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  return {
    current: currentTotals,
    previous: previousTotals,
    changes: {
      income: calculateChange(currentTotals.income, previousTotals.income),
      expenses: calculateChange(currentTotals.expenses, previousTotals.expenses),
      balance: calculateChange(currentTotals.balance, previousTotals.balance),
      transactions: calculateChange(currentPeriodTransactions.length, previousPeriodTransactions.length)
    }
  };
};

/**
 * Get available periods from transactions
 * @param {Array} transactions - Array of transactions
 * @returns {Object} Available years and months
 */
export const getAvailablePeriods = (transactions = []) => {
  if (!transactions.length) {
    const currentYear = new Date().getFullYear();
    return {
      years: [currentYear],
      monthsByYear: { [currentYear]: [new Date().getMonth()] }
    };
  }

  const periods = new Map();

  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const year = date.getFullYear();
    const month = date.getMonth();

    if (!periods.has(year)) {
      periods.set(year, new Set());
    }
    periods.get(year).add(month);
  });

  const years = Array.from(periods.keys()).sort((a, b) => b - a);
  const monthsByYear = {};

  years.forEach(year => {
    monthsByYear[year] = Array.from(periods.get(year)).sort((a, b) => b - a);
  });

  return { years, monthsByYear };
};

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: 'RM')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'RM') => {
  return `${currency} ${amount.toFixed(2)}`;
};

/**
 * Calculate growth rate between two values
 * @param {number} current - Current period value
 * @param {number} previous - Previous period value
 * @returns {Object} Growth rate object with percentage and direction
 */
export const calculateGrowthRate = (current, previous) => {
  if (previous === 0) {
    return {
      percentage: current > 0 ? 100 : 0,
      direction: current > 0 ? 'up' : 'neutral',
      isPositive: current >= 0
    };
  }

  const percentage = ((current - previous) / Math.abs(previous)) * 100;

  return {
    percentage: Math.abs(percentage),
    direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral',
    isPositive: percentage >= 0
  };
};