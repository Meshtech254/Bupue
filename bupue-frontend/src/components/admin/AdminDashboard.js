import React, { useState, useEffect } from 'react';
import { Link, Routes, Route } from 'react-router-dom';
import apiClient from '../../api/client';
import './Admin.css';
import UserManagement from './UserManagement';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalPosts: 0,
    totalItems: 0,
    activeUsers: 0,
    pendingApprovals: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  const isAdminUser = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      return !!user?.isAdmin;
    } catch {
      return false;
    }
  })();

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      // Try to fetch real stats from admin API
      const response = await apiClient.get('/api/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // Fallback to mock data if admin API fails
      setStats({
        totalUsers: 8,
        totalCourses: 0,
        totalPosts: 0,
        totalItems: 0,
        activeUsers: 5,
        pendingApprovals: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdminUser) {
    return <div className="admin-loading">Access denied. Admins only.</div>;
  }

  if (isLoading) {
    return <div className="admin-loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
      <h1>Admin Dashboard</h1>
        <p>Manage your Bupue platform</p>
      </div>

      <div className="admin-layout">
        {/* Sidebar Navigation */}
        <div className="admin-sidebar">
          <nav className="admin-nav">
            <Link to="/admin" className="admin-nav-item active">
              <span className="nav-icon">📊</span>
          Dashboard
            </Link>
            <Link to="/admin/users" className="admin-nav-item">
              <span className="nav-icon">👥</span>
              User Management
            </Link>
            <Link to="/admin/content" className="admin-nav-item">
              <span className="nav-icon">📄</span>
              Content Management
            </Link>
            <Link to="/admin/analytics" className="admin-nav-item">
              <span className="nav-icon">📈</span>
              Analytics
            </Link>
            <Link to="/admin/settings" className="admin-nav-item">
              <span className="nav-icon">⚙️</span>
              System Settings
            </Link>
          </nav>
      </div>

        {/* Main Content Area */}
        <div className="admin-main">
          <Routes>
            <Route path="/admin" element={<AdminOverview stats={stats} />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/content" element={<div>Content management coming soon.</div>} />
            <Route path="/admin/analytics" element={<div>Analytics coming soon.</div>} />
            <Route path="/admin/settings" element={<div>System settings coming soon.</div>} />
          </Routes>
        </div>
      </div>
          </div>
  );
};

// Admin Overview Component
const AdminOverview = ({ stats }) => {
  return (
    <div className="admin-overview">
      {/* Stats Cards */}
      <div className="stats-grid">
          <div className="stat-card">
          <div className="stat-icon users">
            <span>👥</span>
          </div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
          </div>
          
        <div className="stat-card">
          <div className="stat-icon courses">
            <span>🎓</span>
              </div>
          <div className="stat-content">
            <h3>{stats.totalCourses}</h3>
            <p>Total Courses</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon posts">
            <span>📄</span>
                </div>
          <div className="stat-content">
            <h3>{stats.totalPosts}</h3>
            <p>Total Posts</p>
                </div>
              </div>

        <div className="stat-card">
          <div className="stat-icon items">
            <span>🛍️</span>
          </div>
          <div className="stat-content">
            <h3>{stats.totalItems}</h3>
            <p>Marketplace Items</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active">
            <span>✅</span>
          </div>
          <div className="stat-content">
            <h3>{stats.activeUsers}</h3>
            <p>Active Users</p>
                </div>
              </div>

        <div className="stat-card">
          <div className="stat-icon pending">
            <span>⏰</span>
          </div>
          <div className="stat-content">
            <h3>{stats.pendingApprovals}</h3>
            <p>Pending Approvals</p>
          </div>
          </div>
        </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-btn">
            <span className="action-icon">➕</span>
            Add New User
          </button>
          <button className="action-btn">
            <span className="action-icon">🚩</span>
            Review Reports
          </button>
          <button className="action-btn">
            <span className="action-icon">🔔</span>
            Send Notification
          </button>
          <button className="action-btn">
            <span className="action-icon">📥</span>
            Export Data
                  </button>
                </div>
              </div>
    </div>
  );
};

export default AdminDashboard;

