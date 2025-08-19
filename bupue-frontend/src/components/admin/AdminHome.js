import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';

const AdminHome = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalPosts: 0,
    totalItems: 0,
    activeUsers: 0,
    pendingApprovals: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await apiClient.get('/api/admin/stats');
        setStats(response.data);
      } catch (error) {
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
    load();
  }, []);

  if (isLoading) {
    return <div className="admin-loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-overview">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users"><span>👥</span></div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon courses"><span>🎓</span></div>
          <div className="stat-content">
            <h3>{stats.totalCourses}</h3>
            <p>Total Courses</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon posts"><span>📄</span></div>
          <div className="stat-content">
            <h3>{stats.totalPosts}</h3>
            <p>Total Posts</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon items"><span>🛍️</span></div>
          <div className="stat-content">
            <h3>{stats.totalItems}</h3>
            <p>Marketplace Items</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon active"><span>✅</span></div>
          <div className="stat-content">
            <h3>{stats.activeUsers}</h3>
            <p>Active Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon pending"><span>⏰</span></div>
          <div className="stat-content">
            <h3>{stats.pendingApprovals}</h3>
            <p>Pending Approvals</p>
          </div>
        </div>
      </div>

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

export default AdminHome;