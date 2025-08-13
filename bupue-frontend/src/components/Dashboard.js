import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    courses: 0,
    posts: 0,
    items: 0
  });

  useEffect(() => {
    const fetchUserData = async () => {
      // Get user info from localStorage
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('user');
      
      console.log('Dashboard useEffect - Token:', token ? 'present' : 'missing');
      console.log('Dashboard useEffect - User info:', userInfo ? 'present' : 'missing');
      
      if (userInfo) {
        try {
          const parsedUser = JSON.parse(userInfo);
          console.log('Parsed user data:', parsedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing user info:', error);
          // If user data is corrupted, redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } else if (token) {
        // If we have a token but no user data, try to fetch user data
        // This could happen if the user data was cleared but token remains
        console.log('Token exists but no user data found, fetching from backend...');
        try {
          const response = await apiClient.get('/api/auth/me');
          const userData = response.data;
          console.log('Fetched user data from backend:', userData);
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          // If we can't fetch user data, the token might be invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } else {
        // No token or user data, redirect to login
        console.log('No token or user data found, redirecting to login');
        window.location.href = '/login';
      }
    };

    fetchUserData();

    // Fetch user stats (you can implement this later)
    // fetchUserStats();
  }, []);

  if (!user) {
    return (
      <div className="dashboard-loading">
        <div>Loading...</div>
        <div style={{ fontSize: '14px', marginTop: '10px', color: '#666' }}>
          If this takes too long, please refresh the page
        </div>
      </div>
    );
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
          <h3>Marketplace</h3>
          <p className="stat-number">{stats.items}</p>
          <Link to="/marketplace" className="stat-link">View Marketplace</Link>
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
