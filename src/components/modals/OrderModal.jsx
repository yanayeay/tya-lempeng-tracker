import React, { useState, useEffect } from 'react';
import { X, Truck, Clock } from 'lucide-react';

const OrderModal = ({ isOpen, onClose, editingOrder, onSubmit }) => {
  // All state variables defined at the top
  const [formData, setFormData] = useState({
    name: '',
    contactNo: '',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    set: '',
    quantity: '1',
    time: '',
    delivery: false,
    deliveryAddress: '',
    paymentStatus: 'Unpaid',
    deliveryStatus: 'Not yet delivered',
    remarks: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Reset form when modal opens/closes or editing order changes
  useEffect(() => {
    if (isOpen) {
      setShowSuccess(false); // Reset success message when modal opens
      if (editingOrder) {
        setFormData({
          name: editingOrder.name || '',
          contactNo: editingOrder.contact_no || '',
          orderDate: editingOrder.order_date || new Date().toISOString().split('T')[0],
          deliveryDate: editingOrder.delivery_date || '',
          set: editingOrder.set || '',
          quantity: editingOrder.quantity?.toString() || '1',
          time: editingOrder.time || '',
          delivery: editingOrder.delivery || false,
          deliveryAddress: editingOrder.delivery_address || '',
          paymentStatus: editingOrder.payment_status || 'Unpaid',
          deliveryStatus: editingOrder.delivery_status || 'Not yet delivered',
          remarks: editingOrder.remarks || ''
        });
      } else {
        setFormData({
          name: '',
          contactNo: '',
          orderDate: new Date().toISOString().split('T')[0],
          deliveryDate: '',
          set: '',
          quantity: '1',
          time: '',
          delivery: false,
          deliveryAddress: '',
          paymentStatus: 'Unpaid',
          deliveryStatus: 'Not yet delivered',
          remarks: ''
        });
      }
    }
  }, [isOpen, editingOrder]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setShowSuccess(false); // Hide any existing success message

    try {
      await onSubmit(formData);

      // Show styled success message
      const message = editingOrder
        ? 'Order updated successfully!'
        : 'Order added successfully!';
      setSuccessMessage(message);
      setShowSuccess(true);

      // Auto-close modal after showing success message
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Error saving order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {editingOrder ? 'Edit Order' : 'Add New Order'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Success Message Banner */}
          {showSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-800 font-medium">{successMessage}</span>
                <span className="text-lg">🎉</span>
              </div>
            </div>
          )}

          {/* Customer Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Contact No (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.contactNo}
                  onChange={(e) => handleInputChange('contactNo', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter contact number"
                />
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Date *
                </label>
                <input
                  type="date"
                  value={formData.orderDate}
                  onChange={(e) => handleInputChange('orderDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lempeng Set *
                </label>
                <select
                  value={formData.set}
                  onChange={(e) => handleInputChange('set', e.target.value)}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.delivery}
                    onChange={(e) => handleInputChange('delivery', e.target.checked)}
                    className="mr-2 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Delivery Required</span>
                </label>
              </div>

              {formData.delivery && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address
                    </label>
                    <textarea
                      value={formData.deliveryAddress}
                      onChange={(e) => handleInputChange('deliveryAddress', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      rows="2"
                      placeholder="Enter delivery address"
                    />
                  </div>
                </div>
              )}

              {/* Delivery Status Radio Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Delivery Status *
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="deliveryStatus"
                      value="Not yet delivered"
                      checked={formData.deliveryStatus === 'Not yet delivered'}
                      onChange={(e) => handleInputChange('deliveryStatus', e.target.value)}
                      className="mr-2 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                    />
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Clock className="h-4 w-4 text-orange-600" />
                      Not yet delivered
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="deliveryStatus"
                      value="Delivered"
                      checked={formData.deliveryStatus === 'Delivered'}
                      onChange={(e) => handleInputChange('deliveryStatus', e.target.value)}
                      className="mr-2 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                    />
                    <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Truck className="h-4 w-4 text-emerald-600" />
                      Delivered
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Payment & Additional Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment & Additional Info</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status *
                </label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  required
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => handleInputChange('remarks', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  rows="2"
                  placeholder="Additional notes or remarks"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-yellow-600 text-white py-3 px-4 rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isSubmitting ? 'Saving...' : (editingOrder ? 'Update Order' : 'Add Order')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;