import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchPayments();
  }, []);

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/users', {
        headers: getAuthHeaders()
      });
      setUsers(response.data);
    } catch (error) {
      if (error.response?.status === 403) navigate('/dashboard');
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/payments/all', {
        headers: getAuthHeaders()
      });
      setPayments(response.data);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: getAuthHeaders()
      });
      setMessage({ type: 'success', text: 'User deleted successfully' });
      fetchUsers();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete user' });
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/users/${editingUser._id}`, editingUser, {
        headers: getAuthHeaders()
      });
      setMessage({ type: 'success', text: 'User updated successfully' });
      setEditingUser(null);
      fetchUsers();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update user' });
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const stats = {
    totalUsers: users.length,
    totalPayments: payments.filter(p => p.status === 'success').length,
    totalRevenue: payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0),
    pendingPayments: payments.filter(p => p.status === 'pending').length
  };

  if (loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: '260px', background: '#2c3e50', color: 'white', padding: '20px' }}>
        <h2 style={{ marginBottom: '30px', fontSize: '20px' }}>🎯 Admin Panel</h2>
        <nav>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '10px',
              background: activeTab === 'users' ? '#34495e' : 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              borderRadius: '5px',
              textAlign: 'left'
            }}
          >
            👥 Manage Users
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '10px',
              background: activeTab === 'payments' ? '#34495e' : 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              borderRadius: '5px',
              textAlign: 'left'
            }}
          >
            💰 Payment Tracking
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '10px',
              background: activeTab === 'stats' ? '#34495e' : 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              borderRadius: '5px',
              textAlign: 'left'
            }}
          >
            📊 Statistics
          </button>
          <button
            onClick={logout}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '30px',
              background: '#e74c3c',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              borderRadius: '5px'
            }}
          >
            🚪 Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '30px', background: '#f5f7fa' }}>
        {message.text && (
          <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
            {message.text}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h1 style={{ marginBottom: '20px' }}>User Management</h1>
            <div style={{ background: 'white', borderRadius: '10px', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#3498db', color: 'white' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Phone</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>City</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Registered On</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{user.name}</td>
                      <td style={{ padding: '12px' }}>{user.email}</td>
                      <td style={{ padding: '12px' }}>{user.phone}</td>
                      <td style={{ padding: '12px' }}>{user.city || '-'}</td>
                      <td style={{ padding: '12px' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => setEditingUser(user)}
                          style={{
                            background: '#3498db',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            marginRight: '5px'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          style={{
                            background: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            padding: '5px 10px',
                            borderRadius: '3px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div>
            <h1 style={{ marginBottom: '20px' }}>Payment Tracking</h1>
            <div style={{ background: 'white', borderRadius: '10px', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#3498db', color: 'white' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>User</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Amount</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px' }}>{payment.user?.name || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>{payment.user?.email || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>₹{payment.amount}</td>
                      <td style={{ padding: '12px' }}>
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            background:
                              payment.status === 'success'
                                ? '#d4edda'
                                : payment.status === 'pending'
                                ? '#fff3cd'
                                : '#f8d7da',
                            color:
                              payment.status === 'success'
                                ? '#155724'
                                : payment.status === 'pending'
                                ? '#856404'
                                : '#721c24'
                          }}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>{new Date(payment.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div>
            <h1 style={{ marginBottom: '20px' }}>Dashboard Statistics</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              <div style={{ background: 'white', padding: '25px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', color: '#3498db' }}>👥</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.totalUsers}</div>
                <div style={{ color: '#666' }}>Total Users</div>
              </div>
              <div style={{ background: 'white', padding: '25px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', color: '#28a745' }}>✅</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.totalPayments}</div>
                <div style={{ color: '#666' }}>Successful Payments</div>
              </div>
              <div style={{ background: 'white', padding: '25px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', color: '#ffc107' }}>⏳</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.pendingPayments}</div>
                <div style={{ color: '#666' }}>Pending Payments</div>
              </div>
              <div style={{ background: 'white', padding: '25px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', color: '#17a2b8' }}>💰</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>₹{stats.totalRevenue}</div>
                <div style={{ color: '#666' }}>Total Revenue</div>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="modal">
            <div className="modal-content">
              <h2>Edit User</h2>
              <form onSubmit={handleUpdateUser}>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={editingUser.city || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, city: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={editingUser.isAdmin}
                      onChange={(e) => setEditingUser({ ...editingUser, isAdmin: e.target.checked })}
                    />
                    {' '}Admin Access
                  </label>
                </div>
                <button type="submit" className="btn">
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="btn-secondary"
                  style={{ marginTop: '10px' }}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;