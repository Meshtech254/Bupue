import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import FollowSuggestions from './FollowSuggestions';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    courses: 0,
    events: 0,
    marketplace: 0,
    followers: 0,
    following: 0
  });
  const [recommendations, setRecommendations] = useState({
    courses: [],
    items: [],
    posts: []
  });

  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('user');

    if (userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (token) {
      try {
        const response = await apiClient.get('/api/auth/me');
        const userData = response.data;
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else {
      window.location.href = '/login';
    }
  }, []);

  const fetchUserStats = useCallback(async () => {
    try {
      setStats({
        courses: 0,
        events: 0,
        marketplace: 0,
        followers: user?.profile?.followers?.length || 0,
        following: user?.profile?.following?.length || 0
      });
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();
    fetchUserStats();
  }, [fetchUserData, fetchUserStats]);

  const fetchRecommendations = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/recommendations');
      setRecommendations(response.data);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user, fetchRecommendations]);



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
          <div className="stat-icon">🎓</div>
          <div className="stat-content">
            <h3>Courses</h3>
            <p className="stat-number">{stats.courses}</p>
            <p className="stat-description">Available courses</p>
          </div>
          <Link to="/courses" className="stat-link">Browse Courses</Link>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Events</h3>
            <p className="stat-number">{stats.events}</p>
            <p className="stat-description">Upcoming events</p>
          </div>
          <Link to="/events" className="stat-link">View Events</Link>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛍️</div>
          <div className="stat-content">
            <h3>Marketplace</h3>
            <p className="stat-number">{stats.marketplace}</p>
            <p className="stat-description">Items for sale</p>
          </div>
          <Link to="/marketplace" className="stat-link">Explore Marketplace</Link>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Network</h3>
            <p className="stat-number">{stats.followers}</p>
            <p className="stat-description">Followers</p>
          </div>
          <Link to="/profile" className="stat-link">View Profile</Link>
        </div>
      </div>

      <div className="dashboard-actions">
        <h2>Quick Actions</h2>
        <p className="actions-description">Start creating content or explore the platform</p>
        <div className="action-buttons">
          <Link to="/courses/create" className="action-btn primary">
            <span className="action-icon">➕</span>
            Create Course
          </Link>
          <Link to="/events/create" className="action-btn secondary">
            <span className="action-icon">📅</span>
            Create Event
          </Link>
          <Link to="/marketplace/create" className="action-btn secondary">
            <span className="action-icon">🛍️</span>
            Add Item
          </Link>
          <Link to="/profile" className="action-btn outline">
            <span className="action-icon">👤</span>
            View Profile
          </Link>
        </div>
      </div>

      <div className="dashboard-sidebar">
        <FollowSuggestions />
      </div>

      <div className="dashboard-recommendations">
        <h2>For You</h2>
        <div className="recommendations-grid">
          {recommendations.courses.length > 0 && (
            <div className="recommendation-section">
              <h3>Recommended Courses</h3>
              <div className="recommendation-items">
                {recommendations.courses.slice(0, 3).map(course => (
                  <div key={course._id} className="recommendation-item">
                    <h4>{course.title}</h4>
                    <p>{course.description.slice(0, 60)}...</p>
                    <div className="recommendation-meta">
                      <span>${course.price}</span>
                      <span>By {course.owner?.username}</span>
                    </div>
                    <Link to={`/courses/${course._id}`} className="recommendation-link">
                      View Course
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendations.items.length > 0 && (
            <div className="recommendation-section">
              <h3>Recommended Items</h3>
              <div className="recommendation-items">
                {recommendations.items.slice(0, 3).map(item => (
                  <div key={item._id} className="recommendation-item">
                    <h4>{item.title}</h4>
                    <p>{item.description.slice(0, 60)}...</p>
                    <div className="recommendation-meta">
                      <span>${item.price}</span>
                      <span>By {item.owner?.username}</span>
                    </div>
                    <Link to={`/marketplace/${item._id}`} className="recommendation-link">
                      View Item
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendations.posts.length > 0 && (
            <div className="recommendation-section">
              <h3>Upcoming Events</h3>
              <div className="recommendation-items">
                {recommendations.posts.slice(0, 3).map(post => (
                  <div key={post._id} className="recommendation-item">
                    <h4>{post.title}</h4>
                    <p>{post.body.slice(0, 60)}...</p>
                    <div className="recommendation-meta">
                      <span>By {post.author?.username}</span>
                      {post.eventDate && (
                        <span>{new Date(post.eventDate).toLocaleDateString()}</span>
                      )}
                    </div>
                    <Link to={`/events/${post._id}`} className="recommendation-link">
                      View Event
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
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
