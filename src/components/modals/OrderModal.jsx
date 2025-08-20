// components/modals/OrderModal.jsx
import React, { useState, useEffect } from 'react';

const OrderModal = ({
  isOpen,
  onClose,
  editingOrder,
  onSubmit
}) => {
  const [orderFormData, setOrderFormData] = useState({
    name: '',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    set: '',
    quantity: '',
    time: '',
    delivery: false,
    deliveryAddress: '',
    paymentStatus: 'Unpaid',
    remarks: ''
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Update form when editing order changes
  useEffect(() => {
    if (editingOrder) {
      setOrderFormData({
        name: editingOrder.name,
        orderDate: editingOrder.order_date,
        deliveryDate: editingOrder.delivery_date || '',
        set: editingOrder.set,
        quantity: editingOrder.quantity.toString(),
        time: editingOrder.time,
        delivery: editingOrder.delivery,
        deliveryAddress: editingOrder.delivery_address || '',
        paymentStatus: editingOrder.payment_status,
        remarks: editingOrder.remarks || ''
      });
    } else {
      setOrderFormData({
        name: '',
        orderDate: new Date().toISOString().split('T')[0],
        deliveryDate: '',
        set: '',
        quantity: '',
        time: '',
        delivery: false,
        deliveryAddress: '',
        paymentStatus: 'Unpaid',
        remarks: ''
      });
    }
  }, [editingOrder]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!orderFormData.name || !orderFormData.set || !orderFormData.quantity || !orderFormData.time) {
         alert('Please fill in all required fields');
         return;
       }

    try {
      await onSubmit(orderFormData);

      // Show success message inside modal
      const message = editingOrder
        ? `✅ Order updated successfully!`
        : `🎉 Order added successfully!`;

      setSuccessMessage(message);
      setShowSuccess(true);

      // Auto-close after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
        onClose();
      }, 2000);

    } catch (error) {
      alert('❌ Error saving order. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {editingOrder ? 'Edit Order' : 'Add New Order'}
        </h2>
        {/* ADD THIS - Simple success message without formData references */}
        {showSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <p className="text-green-800 font-medium text-center">{successMessage}</p>
            </div>
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
            <input
              type="text"
              value={orderFormData.name}
              onChange={(e) => setOrderFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Enter customer name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order Date *</label>
            <input
              type="date"
              value={orderFormData.orderDate}
              onChange={(e) => setOrderFormData(prev => ({ ...prev, orderDate: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
            <input
              type="date"
              value={orderFormData.deliveryDate}
              onChange={(e) => setOrderFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lempeng Set *</label>
            <select
              value={orderFormData.set}
              onChange={(e) => setOrderFormData(prev => ({ ...prev, set: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            >
              <option value="">Select a set</option>
              <option value="Orkid">Orkid</option>
              <option value="Melur">Melur</option>
              <option value="Cempaka">Cempaka</option>
              <option value="Sambal">Sambal</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
            <input
              type="number"
              min="1"
              value={orderFormData.quantity}
              onChange={(e) => setOrderFormData(prev => ({ ...prev, quantity: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Enter quantity"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time *</label>
            <input
              type="time"
              value={orderFormData.time}
              onChange={(e) => setOrderFormData(prev => ({ ...prev, time: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={orderFormData.delivery}
                onChange={(e) => setOrderFormData(prev => ({ ...prev, delivery: e.target.checked }))}
                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700">Delivery Required</span>
            </label>
            {orderFormData.delivery && (
              <div className="mt-2">
                <input
                  type="text"
                  value={orderFormData.deliveryAddress}
                  onChange={(e) => setOrderFormData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter delivery address"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status *</label>
            <select
              value={orderFormData.paymentStatus}
              onChange={(e) => setOrderFormData(prev => ({ ...prev, paymentStatus: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
            >
              <option value="Unpaid">Unpaid</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea
              value={orderFormData.remarks}
              onChange={(e) => setOrderFormData(prev => ({ ...prev, remarks: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Enter any additional notes"
              rows="3"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              {editingOrder ? 'Update Order' : 'Add Order'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;