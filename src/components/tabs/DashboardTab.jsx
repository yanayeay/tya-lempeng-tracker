import React from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Settings,
  CreditCard,
  Truck
} from 'lucide-react';
import { calculateTransactionTotals, calculateOrdersData } from '../../utils/calculations';

const DashboardTab = ({ transactions }) => {
  // Calculate all totals using utility function
  const totals = calculateTransactionTotals(transactions);
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
  const ordersData = calculateOrdersData(transactions);
  const totalItemsSold = ordersData.reduce((sum, order) => sum + order.quantity, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Overview</h2>

        {/* Data Status */}
        <div className="bg-blue-50 p-3 rounded-lg mb-6 border border-blue-200">
          <p className="text-sm text-blue-700">
            📊 <strong>Total Transactions:</strong> {transactions.length} •
            <strong>This Month:</strong> {transactions.filter(t => new Date(t.date).getMonth() === new Date().getMonth()).length} •
            <strong>Last Updated:</strong> {transactions.length > 0 ? new Date(Math.max(...transactions.map(t => new Date(t.date)))).toLocaleString() : 'Never'}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Total Sales</p>
                <p className="text-3xl font-bold text-green-700">RM {income.toFixed(2)}</p>
                <p className="text-sm text-green-600 mt-1">
                  {transactions.filter(t => t.type === 'income' && t.category !== 'Balance From Last Month' && t.category !== 'Delivery').length} transactions
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
                  {transactions.filter(t => t.type === 'expense' &&
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
                  {transactions.filter(t => t.type === 'income' && t.payment_method === 'online' && t.category !== 'Balance From Last Month').length} transactions
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
                  {transactions.filter(t => t.payment_method === 'cash' && t.category !== 'Balance From Last Month').length} transactions
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
                  {transactions.filter(t => t.type === 'income' && t.category === 'Delivery').length} deliveries
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
                  {transactions.filter(t => t.category.toLowerCase().includes('ayien')).length} transactions
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
                  💰 {balance >= 0 ? 'Business Profit' : 'Business Loss'}
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
          <h3 className="text-xl font-bold text-gray-900">Delivery Overview</h3>
          <div className="bg-orange-100 px-3 py-1 rounded-full">
            <span className="text-orange-800 text-sm font-medium">
              Total Service Fees: RM {deliveryFees.toFixed(2)}
            </span>
          </div>
        </div>

        {deliveryFees === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">🚚 No delivery fees recorded yet!</p>
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
                {transactions.filter(t => t.type === 'income' && t.category === 'Delivery').length}
              </p>
              <p className="text-sm text-blue-600">Deliveries</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">
                RM {transactions.filter(t => t.type === 'income' && t.category === 'Delivery').length > 0
                  ? (deliveryFees / transactions.filter(t => t.type === 'income' && t.category === 'Delivery').length).toFixed(2)
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
          <h3 className="text-xl font-bold text-gray-900">Orders Summary</h3>
          <div className="bg-orange-100 px-3 py-1 rounded-full">
            <span className="text-orange-800 text-sm font-medium">
              Total Items Sold: {totalItemsSold}
            </span>
          </div>
        </div>

        {ordersData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-2">🥞 No lempeng orders yet!</p>
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