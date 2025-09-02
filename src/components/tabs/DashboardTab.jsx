import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Settings,
  CreditCard,
  Truck,
  Calendar,
  Filter,
  X,
  BarChart3
} from 'lucide-react';
import { calculateTransactionTotals, calculateOrdersData, filterTransactionsByPeriod } from '../../utils/calculations';

const DashboardTab = ({ transactions }) => {
  // Date filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('monthly'); // 'all', 'monthly', 'yearly' - Default to current month
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  // Generate available years from transactions
  const availableYears = useMemo(() => {
    if (!transactions.length) return [new Date().getFullYear()];

    const years = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))];
    return years.sort((a, b) => b - a); // Most recent first
  }, [transactions]);

  // Filter transactions based on selected period
  const filteredTransactions = useMemo(() => {
    return filterTransactionsByPeriod(transactions, filterType, selectedYear, selectedMonth);
  }, [transactions, filterType, selectedYear, selectedMonth]);

  // Calculate all totals using filtered transactions
  const totals = calculateTransactionTotals(filteredTransactions);
  const {
    income,
    expenses,
    balance,
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
  } = totals;

  // Calculate orders data for dashboard
  const ordersData = calculateOrdersData(filteredTransactions);
  const totalItemsSold = ordersData.reduce((sum, order) => sum + order.quantity, 0);

  // Generate period description
  const getPeriodDescription = () => {
    if (filterType === 'monthly') {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return `${monthNames[selectedMonth]} ${selectedYear}`;
    }
    if (filterType === 'yearly') {
      return `Year ${selectedYear}`;
    }
    return 'All Time';
  };

  const resetFilters = () => {
    setFilterType('all');
    setSelectedYear(new Date().getFullYear());
    setSelectedMonth(new Date().getMonth());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Business Overview</h2>
            <p className="text-gray-600">Financial dashboard with period filtering</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                showFilters ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Filter className="h-4 w-4" />
              Period Filter
            </button>
            {filterType !== 'all' && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 transition-colors text-sm"
              >
                <X className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Current Period Display */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700">
              <strong>Viewing Period:</strong> {getPeriodDescription()}
            </span>
            <span className="text-sm text-blue-600">
              • <strong>{filteredTransactions.length}</strong> transactions
            </span>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Select Time Period</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Period Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Period Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="monthly">Monthly View</option>
                  <option value="yearly">Yearly View</option>
                </select>
              </div>

              {/* Year Selection */}
              {(filterType === 'monthly' || filterType === 'yearly') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Month Selection */}
              {filterType === 'monthly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {monthNames.map((month, index) => (
                      <option key={index} value={index}>{month}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Quick Filters */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Quick Filters:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setFilterType('monthly');
                    setSelectedYear(new Date().getFullYear());
                    setSelectedMonth(new Date().getMonth());
                  }}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm transition-colors"
                >
                  This Month
                </button>
                <button
                  onClick={() => {
                    setFilterType('monthly');
                    const lastMonth = new Date();
                    lastMonth.setMonth(lastMonth.getMonth() - 1);
                    setSelectedYear(lastMonth.getFullYear());
                    setSelectedMonth(lastMonth.getMonth());
                  }}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm transition-colors"
                >
                  Last Month
                </button>
                <button
                  onClick={() => {
                    setFilterType('yearly');
                    setSelectedYear(new Date().getFullYear());
                  }}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 text-sm transition-colors"
                >
                  This Year
                </button>
                <button
                  onClick={() => {
                    setFilterType('yearly');
                    setSelectedYear(new Date().getFullYear() - 1);
                  }}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 text-sm transition-colors"
                >
                  Last Year
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Data Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">
            Financial Summary - {getPeriodDescription()}
          </h3>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">No transactions found for the selected period</p>
            <p className="text-sm text-gray-400">Try selecting a different time period or add some transactions</p>
          </div>
        ) : (
          <div className="bg-blue-50 p-3 rounded-lg mb-6 border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>Period Transactions:</strong> {filteredTransactions.length} •
              <strong> Date Range:</strong> {filteredTransactions.length > 0 ?
                `${new Date(Math.min(...filteredTransactions.map(t => new Date(t.date)))).toLocaleDateString()} - ${new Date(Math.max(...filteredTransactions.map(t => new Date(t.date)))).toLocaleDateString()}`
                : 'N/A'
              }
            </p>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Sales</p>
                <p className="text-3xl font-bold text-green-700">RM {income.toFixed(2)}</p>
                <p className="text-sm text-green-600 mt-1">
                  {filteredTransactions.filter(t => t.type === 'income' && t.category !== 'Balance From Last Month' && t.category !== 'Delivery').length} transactions
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="bg-red-50 p-6 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Business Expenses</p>
                <p className="text-3xl font-bold text-red-700">RM {expenses.toFixed(2)}</p>
                <p className="text-sm text-red-600 mt-1">
                  {filteredTransactions.filter(t => t.type === 'expense' &&
                    !t.category.toLowerCase().includes('ayien withdraw') &&
                    !t.category.toLowerCase().includes('ayien own expenses')).length} transactions
                </p>
              </div>
              <TrendingDown className="h-12 w-12 text-red-600" />
            </div>
          </div>

          <div className={`p-6 rounded-lg border ${cashBalance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${cashBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>Cash Balance</p>
                <p className={`text-3xl font-bold ${cashBalance >= 0 ? 'text-blue-700' : 'text-red-700'}`}>RM {cashBalance.toFixed(2)}</p>
                <div className={`text-xs mt-1 ${cashBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  <p>Last Month: +{balanceFromLastMonthCash.toFixed(2)}</p>
                  <p>Cash Income: +{cashIncomeOnly.toFixed(2)}</p>
                  <p>Cash Expenses: -{cashExpenses.toFixed(2)}</p>
                </div>
              </div>
              <DollarSign className={`h-12 w-12 ${cashBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
            </div>
          </div>

          <div className={`p-6 rounded-lg border ${onlineBalance >= 0 ? 'bg-purple-50 border-purple-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${onlineBalance >= 0 ? 'text-purple-600' : 'text-red-600'}`}>Online Balance</p>
                <p className={`text-3xl font-bold ${onlineBalance >= 0 ? 'text-purple-700' : 'text-red-700'}`}>RM {onlineBalance.toFixed(2)}</p>
                <div className={`text-xs mt-1 ${onlineBalance >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                  <p>Last Month: +{balanceFromLastMonth.toFixed(2)}</p>
                  <p>Online Income: +{onlineIncomeOnly.toFixed(2)}</p>
                  <p>Online Expenses: -{onlineExpenses.toFixed(2)}</p>
                </div>
              </div>
              <CreditCard className={`h-12 w-12 ${onlineBalance >= 0 ? 'text-purple-600' : 'text-red-600'}`} />
            </div>
          </div>

          <div className="bg-cyan-50 p-6 rounded-lg border border-cyan-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-cyan-600 text-sm font-medium">Online Payments</p>
                <p className="text-3xl font-bold text-cyan-700">RM {onlinePayments.toFixed(2)}</p>
                <p className="text-sm text-cyan-600 mt-1">
                  {filteredTransactions.filter(t => t.type === 'income' && t.payment_method === 'online' && t.category !== 'Balance From Last Month').length} transactions
                </p>
              </div>
              <CreditCard className="h-12 w-12 text-cyan-600" />
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-sm font-medium">Cash Payments</p>
                <p className="text-3xl font-bold text-emerald-700">RM {cashTotal.toFixed(2)}</p>
                <p className="text-sm text-emerald-600 mt-1">
                  {filteredTransactions.filter(t => t.payment_method === 'cash' && t.category !== 'Balance From Last Month').length} transactions
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-emerald-600" />
            </div>
          </div>

          <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Delivery Fees</p>
                <p className="text-3xl font-bold text-orange-700">RM {deliveryFees.toFixed(2)}</p>
                <p className="text-sm text-orange-600 mt-1">
                  {filteredTransactions.filter(t => t.type === 'income' && t.category === 'Delivery').length} deliveries
                </p>
              </div>
              <Truck className="h-12 w-12 text-orange-600" />
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600 text-sm font-medium">Ayien's Expenses</p>
                <p className="text-3xl font-bold text-amber-700">RM {ayienSpending.toFixed(2)}</p>
                <p className="text-sm text-amber-600 mt-1">
                  {filteredTransactions.filter(t => t.category.toLowerCase().includes('ayien')).length} transactions
                </p>
              </div>
              <Settings className="h-12 w-12 text-amber-600" />
            </div>
          </div>

          <div className={`p-6 rounded-lg border ${balance >= 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${balance >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>Total Net Balance</p>
                <p className={`text-3xl font-bold ${balance >= 0 ? 'text-yellow-700' : 'text-red-700'}`}>RM {balance.toFixed(2)}</p>
                <p className={`text-sm mt-1 ${balance >= 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {balance >= 0 ? 'Business Profit' : 'Business Loss'}
                </p>
              </div>
              <TrendingUp className={`h-12 w-12 ${balance >= 0 ? 'text-yellow-600' : 'text-red-600'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Overview Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Delivery Overview - {getPeriodDescription()}</h3>
          <div className="bg-orange-100 px-3 py-1 rounded-full">
            <span className="text-orange-800 text-sm font-medium">
              Total Service Fees: RM {deliveryFees.toFixed(2)}
            </span>
          </div>
        </div>

        {deliveryFees === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">No delivery fees recorded for this period</p>
            <p className="text-sm text-gray-400">Add delivery transactions to track your service fees</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-700">RM {deliveryFees.toFixed(2)}</p>
              <p className="text-sm text-orange-600">Total Fees</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-700">
                {filteredTransactions.filter(t => t.type === 'income' && t.category === 'Delivery').length}
              </p>
              <p className="text-sm text-blue-600">Deliveries</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">
                RM {filteredTransactions.filter(t => t.type === 'income' && t.category === 'Delivery').length > 0
                  ? (deliveryFees / filteredTransactions.filter(t => t.type === 'income' && t.category === 'Delivery').length).toFixed(2)
                  : '0.00'}
              </p>
              <p className="text-sm text-green-600">Avg Fee</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-700">
                {income > 0 ? ((deliveryFees / (income + deliveryFees)) * 100).toFixed(1) : '0.0'}%
              </p>
              <p className="text-sm text-purple-600">Of Total Revenue</p>
            </div>
          </div>
        )}
      </div>

      {/* Orders Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Orders Summary - {getPeriodDescription()}</h3>
          <div className="bg-orange-100 px-3 py-1 rounded-full">
            <span className="text-orange-800 text-sm font-medium">
              Total Items Sold: {totalItemsSold}
            </span>
          </div>
        </div>

        {ordersData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">No lempeng orders for this period</p>
            <p className="text-sm text-gray-400">Add some income transactions to see your orders summary</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Lempeng</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Qty</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {ordersData.map((order, index) => {
                  const percentage = totalItemsSold > 0 ? (order.quantity / totalItemsSold * 100) : 0;
                  return (
                    <tr key={order.category} className={`border-b border-gray-100 hover:bg-gray-50 ${index === 0 ? 'bg-green-50' : ''}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {index === 0 && <span className="text-green-600 mr-2">🏆</span>}
                          <span className={`font-medium ${index === 0 ? 'text-green-800' : 'text-gray-800'}`}>
                            {order.category}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-bold ${index === 0 ? 'text-green-700' : 'text-gray-700'}`}>
                          {order.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm text-gray-600">
                          {percentage.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Orders Stats */}
        {ordersData.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">#{ordersData.length}</p>
              <p className="text-sm text-green-600">Product Types</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-700">{totalItemsSold}</p>
              <p className="text-sm text-orange-600">Total Items</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-700">
                {ordersData.length > 0 ? (totalItemsSold / ordersData.length).toFixed(1) : '0'}
              </p>
              <p className="text-sm text-blue-600">Avg per Product</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-700">
                {ordersData[0]?.category.slice(0, 10) || 'N/A'}
              </p>
              <p className="text-sm text-purple-600">Top Seller</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTab;