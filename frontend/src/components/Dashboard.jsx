import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Payment from './Payment';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchPayments();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    }
  };

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/payments/my-payments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const hasPaid = () => {
    return payments.some(p => p.status === 'success');
  };

  if (loading) {
    return <div className="container"><div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div></div>;
  }

  return (
    <div className="dashboard-container">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', padding: '20px', background: 'white', borderRadius: '10px' }}>
          <h1>🎉 Tech Conference 2024</h1>
          <div>
            <span style={{ marginRight: '20px' }}>Welcome, {user?.name}!</span>
            <button onClick={logout} className="btn-secondary" style={{ width: 'auto', padding: '8px 16px' }}>Logout</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          <div style={{ background: 'white', borderRadius: '10px', padding: '25px' }}>
            <h2>Event Details</h2>
            <div style={{ marginTop: '20px' }}>
              <p><strong>📅 Date:</strong> December 15-16, 2024</p>
              <p><strong>📍 Venue:</strong> Grand Convention Center, Mumbai</p>
              <p><strong>💰 Registration Fee:</strong> ₹499</p>
              <p><strong>🎯 What's Included:</strong></p>
              <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                <li>Access to all sessions</li>
                <li>Lunch and refreshments</li>
                <li>Conference kit</li>
                <li>Certificate of participation</li>
              </ul>
            </div>

            {!hasPaid() && !showPayment && (
              <button onClick={() => setShowPayment(true)} className="btn" style={{ marginTop: '30px' }}>
                Register & Pay ₹499
              </button>
            )}

            {hasPaid() && (
              <div className="success-message" style={{ marginTop: '30px', textAlign: 'center' }}>
                ✅ You are successfully registered for the event!
              </div>
            )}

            {showPayment && (
              <Payment onSuccess={() => {
                setShowPayment(false);
                fetchPayments();
              }} />
            )}
          </div>

          <div style={{ background: 'white', borderRadius: '10px', padding: '25px' }}>
            <h2>Your Payment History</h2>
            {payments.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#666', marginTop: '30px' }}>No payments yet</p>
            ) : (
              <table style={{ width: '100%', marginTop: '20px' }}>
                <thead>
                  <tr style={{ background: '#f4f6f9' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Amount</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>{new Date(payment.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '10px' }}>₹{payment.amount}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          background: payment.status === 'success' ? '#d4edda' : '#fff3cd',
                          color: payment.status === 'success' ? '#155724' : '#856404'
                        }}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;