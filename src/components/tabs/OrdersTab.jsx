import React from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Filter,
  X,
  Truck,
  Clock,
  Car
} from 'lucide-react';

const OrdersTab = ({
  orders,
  filteredOrders,
  hasPermission,
  openOrderModal,
  exportOrdersToCSV,
  handleEditOrder,
  handleDeleteOrder,
  showOrderFilters,
  setShowOrderFilters,
  orderFilters,
  updateOrderFilter,
  toggleOrderArrayFilter,
  resetOrderFilters,
  getActiveOrderFiltersCount
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-wrap gap-3 mb-4">
          {hasPermission('orders', 'addOrder') && (
            <button onClick={() => openOrderModal()} className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 flex items-center gap-2 transition-colors">
              <Plus className="h-4 w-4" /> Add Order
            </button>
          )}
          {hasPermission('orders', 'filterOrder') && (
            <button
              onClick={() => setShowOrderFilters(!showOrderFilters)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                showOrderFilters ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filters {getActiveOrderFiltersCount() > 0 && `(${getActiveOrderFiltersCount()})`}
            </button>
          )}
          {hasPermission('orders', 'exportOrderCSV') && orders.length > 0 && (
            <button
              onClick={exportOrdersToCSV}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              📊 Export CSV
            </button>
          )}
        </div>

        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">{filteredOrders.length}</p>
            <p className="text-sm text-blue-600">Total Orders</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">{filteredOrders.filter(o => o.payment_status === 'Paid').length}</p>
            <p className="text-sm text-green-600">Paid Orders</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-700">{filteredOrders.filter(o => o.payment_status === 'Unpaid').length}</p>
            <p className="text-sm text-yellow-600">Pending Payment</p>
          </div>
          <div className="text-center p-3 bg-emerald-50 rounded-lg">
            <p className="text-2xl font-bold text-emerald-700">{filteredOrders.filter(o => o.delivery_status === 'Delivered').length}</p>
            <p className="text-sm text-emerald-600">Delivered</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-700">{filteredOrders.filter(o => o.delivery_status === 'Not yet delivered').length}</p>
            <p className="text-sm text-orange-600">Pending Delivery</p>
          </div>
        </div>
      </div>

      {/* Order Filters Panel */}
      {showOrderFilters && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Filter Orders</h3>
            <button onClick={() => setShowOrderFilters(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text" placeholder="Search name, set, address, remarks..."
                value={orderFilters.searchText} onChange={(e) => updateOrderFilter('searchText', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date" value={orderFilters.dateFrom} onChange={(e) => updateOrderFilter('dateFrom', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date" value={orderFilters.dateTo} onChange={(e) => updateOrderFilter('dateTo', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lempeng Sets</label>
              <div className="space-y-2">
                {['Orkid', 'Melur', 'Cempaka','Sambal'].map(set => (
                  <label key={set} className="flex items-center">
                    <input
                      type="checkbox" checked={orderFilters.sets.includes(set)} onChange={() => toggleOrderArrayFilter('sets', set)}
                      className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="text-sm">{set}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
              <div className="space-y-2">
                {['Paid', 'Unpaid'].map(status => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox" checked={orderFilters.paymentStatus.includes(status)} onChange={() => toggleOrderArrayFilter('paymentStatus', status)}
                      className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="text-sm">{status}</span>
                  </label>
                ))}
              </div>
            </div>
            {/* NEW: Delivery Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Status</label>
              <div className="space-y-2">
                {['Delivered', 'Not yet delivered'].map(status => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={orderFilters.deliveryStatus.includes(status)}
                      onChange={() => toggleOrderArrayFilter('deliveryStatus', status)}
                      className="mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className="text-sm">{status}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={resetOrderFilters} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
              Reset Filters
            </button>
            <div className="text-sm text-gray-600 flex items-center">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Orders</h3>
            {getActiveOrderFiltersCount() > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-600 font-medium">
                  {getActiveOrderFiltersCount()} filter{getActiveOrderFiltersCount() > 1 ? 's' : ''} active
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="p-6">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              {orders.length === 0 ? (
                <div>
                  <p className="text-gray-500 mb-4">🎉 Start managing your orders!</p>
                  <p className="text-sm text-gray-400">Add your first order to get started</p>
                </div>
              ) : (
                <div>
                  <p className="text-gray-500 mb-2">No orders match your current filters.</p>
                  <button onClick={resetOrderFilters} className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                    Reset filters to see all orders
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredOrders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date)).map(order => (
                <div key={order.id} className="border rounded-lg hover:bg-gray-50 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-3 h-3 rounded-full ${order.payment_status === 'Paid' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                        <h4 className="font-semibold text-lg text-gray-900">{order.name}</h4>

                        {/* NEW: Delivery Status Pills */}
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            order.payment_status === 'Paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.payment_status}
                          </span>

                          <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                            order.delivery_status === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {order.delivery_status === 'Delivered' ? (
                              <>
                                <Truck className="h-3 w-3" />
                                Delivered
                              </>
                            ) : order.delivery_status === 'Not yet pickup' ? (
                              <>
                                <Car className="h-3 w-3" />
                                Not yet pickup
                              </>
                            ) : (
                              <>
                                <Clock className="h-3 w-3" />
                                Not yet delivered
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          {order.contact_no && (
                            <div>
                              <span className="font-medium text-gray-700">Contact No:</span>
                              <span className="ml-2 text-gray-900">{order.contact_no}</span>
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-gray-700">Lempeng Set:</span>
                            <span className="ml-2 text-gray-900">{order.set}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Quantity:</span>
                            <span className="ml-2 text-gray-900">{order.quantity}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Time:</span>
                            <span className="ml-2 text-gray-900">{order.time}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Order Date:</span>
                            <span className="ml-2 text-gray-900">{order.order_date}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {order.delivery_date && (
                            <div>
                              <span className="font-medium text-gray-700">Delivery Date:</span>
                              <span className="ml-2 text-gray-900">{order.delivery_date}</span>
                            </div>
                          )}
                          {order.delivery && order.delivery_address && (
                            <div>
                              <span className="font-medium text-gray-700">Delivery Address:</span>
                              <span className="ml-2 text-gray-900">{order.delivery_address}</span>
                            </div>
                          )}
                          {order.delivery && !order.delivery_address && (
                            <div>
                              <span className="font-medium text-blue-700">🚚 Delivery Required</span>
                              <span className="ml-2 text-gray-500">(No address specified)</span>
                            </div>
                          )}
                          {order.remarks && (
                            <div>
                              <span className="font-medium text-gray-700">Remarks:</span>
                              <span className="ml-2 text-gray-900">{order.remarks}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-4">
                      {hasPermission('orders', 'editOrder') && (
                        <button onClick={() => handleEditOrder(order)} className="text-yellow-600 hover:text-yellow-800" title="Edit Order">
                          <Edit3 className="h-4 w-4" />
                        </button>
                      )}
                      {hasPermission('orders', 'deleteOrder') && (
                        <button onClick={() => handleDeleteOrder(order.id)} className="text-red-600 hover:text-red-800" title="Delete Order">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersTab;