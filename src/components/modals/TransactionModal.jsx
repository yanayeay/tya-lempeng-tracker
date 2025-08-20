// components/modals/TransactionModal.jsx
import React, { useState, useEffect } from 'react';

const TransactionModal = ({
  isOpen,
  onClose,
  editingTransaction,
  onSubmit,
  categories
}) => {
  const [formData, setFormData] = useState({
    type: 'income',
    amount: '',
    quantity: '1',
    category: '',
    description: '',
    paymentMethod: 'online',
    date: new Date().toISOString().split('T')[0]
  });

  // Update form when editing transaction changes
  useEffect(() => {
    if (editingTransaction) {
        const formDataToSet = {
            type: editingTransaction.type || 'income',
            amount: editingTransaction.amount ? editingTransaction.amount.toString() : '',
            quantity: editingTransaction.quantity ? editingTransaction.quantity.toString() : '1',
            category: editingTransaction.category || '',
            description: editingTransaction.description || '',
            paymentMethod: editingTransaction.payment_method || 'online',
            date: editingTransaction.date || new Date().toISOString().split('T')[0]
            };
        setFormData(formDataToSet);
    } else {
      setFormData({
        type: 'income',
        amount: '',
        quantity: '1',
        category: '',
        description: '',
        paymentMethod: 'online',
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [editingTransaction]);

  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset success state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setShowSuccess(false);
      setSuccessMessage('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
      if (!formData.amount || !formData.category || !formData.quantity) {
        alert('Please fill in all required fields');
        return;
      }

      setIsSubmitting(true);

      try {
        console.log('🔄 Submitting transaction...', formData);
        const result = await onSubmit(formData);
        console.log('✅ Transaction submitted successfully:', result);

        // Show success message
        const message = editingTransaction
        ? `✅ Transaction updated successfully!`
        : `🎉 Transaction added successfully!`;

        setSuccessMessage(message);
        setIsSubmitting(false);
        setShowSuccess(true);

        console.log('🎉 Success message set, showing for 2.5 seconds...');

        // Auto-close after 2.5 seconds (longer delay)
        setTimeout(() => {
            console.log('⏰ Auto-closing modal...');
            setShowSuccess(false);
            setSuccessMessage('');
            onClose();
        }, 2500);

      } catch (error) {
        console.error('❌ Error saving transaction:', error);
        setIsSubmitting(false);
        setShowSuccess(false);
        alert('⚠️ Error saving transaction. Please try again.');
      }
  };

  const handleClose = () => {
    if (!isSubmitting && !showSuccess) {
      onClose();
    }
  };

  const currentCategories = formData.type === 'income'
    ? categories.filter(c => c.type === 'income').map(c => c.name)
    : categories.filter(c => c.type === 'expense').map(c => c.name);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
        </h2>

        {/* Success Message - More prominent display */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg animate-pulse">
            <div className="flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
              <p className="text-green-800 font-bold text-center text-lg">{successMessage}</p>
            </div>
            <div className="mt-2 text-center">
              <p className="text-sm text-green-700">Modal will close automatically...</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value, category: '' }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              disabled={isSubmitting || showSuccess}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit Amount</label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="0.00"
              required
              disabled={isSubmitting || showSuccess}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              step="0.01"
              value={formData.quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="1"
              required
              disabled={isSubmitting || showSuccess}
            />
          </div>

          {formData.amount && formData.quantity && (
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-700">
                <strong>Total Amount: RM {(parseFloat(formData.amount || 0) * parseFloat(formData.quantity || 1)).toFixed(2)}</strong>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
              disabled={isSubmitting || showSuccess}
            >
              <option value="">Select a category</option>
              {currentCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Enter description (optional)"
              disabled={isSubmitting || showSuccess}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              disabled={isSubmitting || showSuccess}
            >
              <option value="cash">Cash</option>
              <option value="online">Online Transaction</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              required
              disabled={isSubmitting || showSuccess}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || showSuccess}
              className={`flex-1 py-3 rounded-lg transition-colors font-medium ${
                isSubmitting || showSuccess
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-yellow-600 text-white hover:bg-yellow-700'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{editingTransaction ? 'Updating...' : 'Adding...'}</span>
                </div>
              ) : showSuccess ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="font-bold">Success!</span>
                </div>
              ) : (
                editingTransaction ? 'Update Transaction' : 'Add Transaction'
              )}
            </button>
            <button
                onClick={handleClose}
                disabled={isSubmitting || showSuccess}
                className={`flex-1 py-3 rounded-lg transition-colors font-medium ${
                  isSubmitting || showSuccess
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}>
                  Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;