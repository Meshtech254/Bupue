import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [content, setContent] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'content') fetchContent();
  }, [activeTab]);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboard(response.data);
    } catch (error) {
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
    } catch (error) {
      setError('Failed to load users');
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.orders);
    } catch (error) {
      setError('Failed to load orders');
    }
  };

  const fetchContent = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/content', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContent(response.data.content);
    } catch (error) {
      setError('Failed to load content');
    }
  };

  const banUser = async (userId, banned) => {
    try {
      const token = localStorage.getItem('token');
      const reason = banned ? prompt('Enter ban reason:') : '';
      if (banned && !reason) return;

      await axios.patch(`/api/admin/users/${userId}/ban`, 
        { banned, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (error) {
      setError('Failed to update user status');
    }
  };

  const deleteContent = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this content?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const reason = prompt('Enter deletion reason:');
      
      await axios.delete(`/api/admin/content/${type}/${id}`, {
        data: { reason },
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchContent();
    } catch (error) {
      setError('Failed to delete content');
    }
  };

  if (loading) return <div className="admin-container">Loading...</div>;
  if (error) return <div className="admin-container error">{error}</div>;

  return (
    <div className="admin-container">
      <h1>Admin Dashboard</h1>
      
      <div className="admin-tabs">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''} 
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''} 
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button 
          className={activeTab === 'orders' ? 'active' : ''} 
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button 
          className={activeTab === 'content' ? 'active' : ''} 
          onClick={() => setActiveTab('content')}
        >
          Content
        </button>
      </div>

      {activeTab === 'dashboard' && dashboard && (
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Users</h3>
            <p className="stat-number">{dashboard.statistics.totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Total Orders</h3>
            <p className="stat-number">{dashboard.statistics.totalOrders}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Orders</h3>
            <p className="stat-number">{dashboard.statistics.pendingOrders}</p>
          </div>
          <div className="stat-card">
            <h3>Monthly Revenue</h3>
            <p className="stat-number">${dashboard.statistics.monthlyRevenue.toFixed(2)}</p>
          </div>
          
          <div className="recent-orders">
            <h3>Recent Orders</h3>
            {dashboard.recentOrders.map(order => (
              <div key={order._id} className="order-item">
                <span>#{order._id.slice(-8)}</span>
                <span>{order.user?.username}</span>
                <span>${order.total.toFixed(2)}</span>
                <span className={`status ${order.status}`}>{order.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-section">
          <h3>User Management</h3>
          <div className="users-table">
            {users.map(user => (
              <div key={user._id} className="user-item">
                <div className="user-info">
                  <strong>{user.username}</strong>
                  <span>{user.email}</span>
                  <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                  {user.banned && <span className="banned">BANNED: {user.banReason}</span>}
                </div>
                <div className="user-actions">
                  <button 
                    onClick={() => banUser(user._id, !user.banned)}
                    className={user.banned ? 'unban' : 'ban'}
                  >
                    {user.banned ? 'Unban' : 'Ban'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="orders-section">
          <h3>Order Management</h3>
          <div className="orders-table">
            {orders.map(order => (
              <div key={order._id} className="order-item">
                <div className="order-info">
                  <strong>#{order._id.slice(-8)}</strong>
                  <span>User: {order.user?.username}</span>
                  <span>Total: ${order.total.toFixed(2)}</span>
                  <span className={`status ${order.status}`}>{order.status}</span>
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="content-section">
          <h3>Content Management</h3>
          <div className="content-table">
            {content.map(item => (
              <div key={`${item.type}-${item._id}`} className="content-item">
                <div className="content-info">
                  <strong>{item.title}</strong>
                  <span>Type: {item.type}</span>
                  <span>Owner: {item.owner?.username || item.author?.username}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="content-actions">
                  <button 
                    onClick={() => deleteContent(item.type, item._id)}
                    className="delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
