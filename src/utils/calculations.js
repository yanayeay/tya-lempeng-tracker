// utils/calculations.js

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