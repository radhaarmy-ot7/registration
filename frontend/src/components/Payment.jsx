import React, { useState } from 'react';
import axios from 'axios';

const Payment = ({ onSuccess }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setProcessing(true);
    setError('');

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setError('Failed to load payment gateway');
        setProcessing(false);
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again');
        setProcessing(false);
        return;
      }

      const orderResponse = await axios.post(
        'http://localhost:5000/api/payments/create-order',
        { amount: 499, eventName: 'Tech Conference 2024' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { orderId, amount, keyId } = orderResponse.data;

      const options = {
        key: keyId,
        amount: amount,
        currency: 'INR',
        name: 'Tech Conference 2024',
        description: 'Event Registration Fee',
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyResponse = await axios.post(
              'http://localhost:5000/api/payments/verify',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyResponse.data.success) {
              onSuccess();
            } else {
              setError('Payment verification failed');
            }
          } catch (err) {
            setError('Payment verification failed');
          }
          setProcessing(false);
        },
        prefill: {
          name: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : '',
          email: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : ''
        },
        theme: {
          color: '#667eea'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      {error && <div className="error-message">{error}</div>}
      <button 
        onClick={handlePayment} 
        className="btn" 
        disabled={processing}
        style={{ background: processing ? '#ccc' : '#28a745' }}
      >
        {processing ? 'Processing...' : '💳 Pay ₹499 Now'}
      </button>
    </div>
  );
};

export default Payment;