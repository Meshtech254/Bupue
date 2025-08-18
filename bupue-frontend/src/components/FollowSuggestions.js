import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import './FollowSuggestions.css';

const FollowSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await apiClient.get('/api/users/suggestions/follow');
        setSuggestions(response.data);
      } catch (error) {
        console.error('Error fetching follow suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  const handleFollow = async (userId, e) => {
    e.stopPropagation();
    try {
      await apiClient.post(`/api/users/${userId}/follow`);
      // Remove the user from suggestions after following
      setSuggestions(prev => prev.filter(user => user._id !== userId));
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  if (isLoading) {
    return <div className="follow-suggestions-loading">Loading suggestions...</div>;
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="follow-suggestions">
      <h3 className="suggestions-title">People you may want to follow</h3>
      <div className="suggestions-list">
        {suggestions.slice(0, 5).map(user => (
          <div
            key={user._id}
            className="suggestion-item"
            onClick={() => handleUserClick(user._id)}
          >
            <div className="user-info">
              <div className="user-avatar">
                {user.profile?.avatar ? (
                  <img src={user.profile.avatar} alt={user.username} />
                ) : (
                  <div className="avatar-placeholder">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="user-details">
                <div className="user-name">
                  {user.profile?.displayName || user.username}
                </div>
                <div className="user-role">
                  {user.profile?.category || 'User'}
                </div>
                <div className="user-followers">
                  {user.profile?.followers?.length || 0} followers
                </div>
              </div>
            </div>
            <button
              className="follow-button"
              onClick={(e) => handleFollow(user._id, e)}
            >
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowSuggestions;





