"use client";

import { useState } from 'react';
import { X, CreditCard, Banknote, Loader2 } from 'lucide-react';

export default function PaymentModal({ ticket, onClose, onPaymentSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('ONLINE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cvv: '',
    expiryDate: ''
  });

  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardDetails({ ...cardDetails, cardNumber: value });
    e.target.value = formatted;
  };

  const handleExpiryChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    const formatted = value.length >= 2 ? `${value.slice(0, 2)}/${value.slice(2)}` : value;
    setCardDetails({ ...cardDetails, expiryDate: value });
    e.target.value = formatted;
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCardDetails({ ...cardDetails, cvv: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ticketId: ticket.id,
        paymentMethod
      };

      if (paymentMethod === 'ONLINE') {
        payload.cardDetails = cardDetails;
      }

      const response = await fetch('/api/payments/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment processing failed');
      }

      // Success
      onPaymentSuccess(data.payment);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-lg relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-2xl font-bold">Payment</h2>
          <p className="text-green-100 mt-1">Ticket #{ticket.id}</p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Service:</span>
              <span className="font-semibold">{ticket.service?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount:</span>
              <span className="text-2xl font-bold text-green-600">
                Rs. {ticket.payment?.amount?.toLocaleString() || '0'}
              </span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Payment Method
            </label>

            {/* Online Payment Option */}
            <label
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                paymentMethod === 'ONLINE'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="ONLINE"
                checked={paymentMethod === 'ONLINE'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-green-600"
              />
              <CreditCard className="ml-3 mr-2 text-green-600" size={24} />
              <div>
                <div className="font-semibold">Card Payment</div>
                <div className="text-sm text-gray-500">Pay securely with debit/credit card</div>
              </div>
            </label>

            {/* Cash on Delivery Option */}
            <label
              className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                paymentMethod === 'CASH_ON_DELIVERY'
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="CASH_ON_DELIVERY"
                checked={paymentMethod === 'CASH_ON_DELIVERY'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-green-600"
              />
              <Banknote className="ml-3 mr-2 text-green-600" size={24} />
              <div>
                <div className="font-semibold">Cash on Delivery</div>
                <div className="text-sm text-gray-500">Pay when you receive the document</div>
              </div>
            </label>
          </div>

          {/* Card Details Form (shown only for online payment) */}
          {paymentMethod === 'ONLINE' && (
            <div className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  onChange={handleCardNumberChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    onChange={handleExpiryChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    onChange={handleCvvChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing...
                </>
              ) : paymentMethod === 'ONLINE' ? (
                `Pay Rs. ${ticket.payment?.amount?.toLocaleString() || '0'}`
              ) : (
                'Confirm Order'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
