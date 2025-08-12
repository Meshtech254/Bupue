import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    courses: 0,
    posts: 0,
    orders: 0
  });

  useEffect(() => {
    // Get user info from localStorage
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('user');
    
    if (userInfo) {
      try {
        setUser(JSON.parse(userInfo));
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    }

    // Fetch user stats (you can implement this later)
    // fetchUserStats();
  }, []);

  if (!user) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user.username || 'User'}! 👋</h1>
        <p>Here's what's happening on your Bupue platform</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Courses</h3>
          <p className="stat-number">{stats.courses}</p>
          <Link to="/courses" className="stat-link">View Courses</Link>
        </div>
        <div className="stat-card">
          <h3>Events</h3>
          <p className="stat-number">{stats.posts}</p>
          <Link to="/events" className="stat-link">View Events</Link>
        </div>
        <div className="stat-card">
          <h3>Orders</h3>
          <p className="stat-number">{stats.orders}</p>
          <Link to="/orders" className="stat-link">View Orders</Link>
        </div>
      </div>

      <div className="dashboard-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/courses/create" className="action-btn primary">
            Create Course
          </Link>
          <Link to="/events/create" className="action-btn secondary">
            Create Event
          </Link>
          <Link to="/marketplace/create" className="action-btn secondary">
            Add Item
          </Link>
          <Link to="/profile" className="action-btn outline">
            View Profile
          </Link>
        </div>
      </div>

      <div className="dashboard-recent">
        <h2>Recent Activity</h2>
        <div className="recent-items">
          <p className="no-activity">No recent activity yet. Start creating content!</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
