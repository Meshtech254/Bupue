import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './Admin.css';

const AdminDashboard = () => {
  const isAdminUser = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      return !!user?.isAdmin;
    } catch {
      return false;
    }
  })();

  if (!isAdminUser) {
    return <div className="admin-loading">Access denied. Admins only.</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your Bupue platform</p>
      </div>

      <div className="admin-layout">
        <div className="admin-sidebar">
          <nav className="admin-nav">
            <NavLink to="/admin" end className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">📊</span>
              Dashboard
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">👥</span>
              User Management
            </NavLink>
            <NavLink to="/admin/content" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">📄</span>
              Content Management
            </NavLink>
            <NavLink to="/admin/analytics" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">📈</span>
              Analytics
            </NavLink>
            <NavLink to="/admin/settings" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-icon">⚙️</span>
              System Settings
            </NavLink>
          </nav>
        </div>

        <div className="admin-main">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;