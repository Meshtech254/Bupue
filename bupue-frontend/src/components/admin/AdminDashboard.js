import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './Admin.css';


const AdminDashboard = () => {
  const location = useLocation();

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
            <Link
              to="/admin"
              className={`admin-nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
            >
              <span className="nav-icon">📊</span>
              Dashboard
            </Link>
            <Link
              to="/admin/users"
              className={`admin-nav-item ${location.pathname.startsWith('/admin/users') ? 'active' : ''}`}
            >
              <span className="nav-icon">👥</span>
              User Management
            </Link>
            <Link
              to="/admin/content"
              className={`admin-nav-item ${location.pathname.startsWith('/admin/content') ? 'active' : ''}`}
            >
              <span className="nav-icon">📄</span>
              Content Management
            </Link>
            <Link
              to="/admin/analytics"
              className={`admin-nav-item ${location.pathname.startsWith('/admin/analytics') ? 'active' : ''}`}
            >
              <span className="nav-icon">📈</span>
              Analytics
            </Link>
            <Link
              to="/admin/settings"
              className={`admin-nav-item ${location.pathname.startsWith('/admin/settings') ? 'active' : ''}`}
            >
              <span className="nav-icon">⚙️</span>
              System Settings
            </Link>
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

