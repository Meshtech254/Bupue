import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../api/client';
import './UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await apiClient.get(`/users/${userId}`);
        setUser(response.data);
        setIsFollowing(response.data.isFollowing);
        setFollowersCount(response.data.profile.followers.length);
        setFollowingCount(response.data.profile.following.length);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await apiClient.delete(`/users/${userId}/follow`);
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
      } else {
        await apiClient.post(`/users/${userId}/follow`);
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Follow/Unfollow error:', error);
    }
  };

  if (isLoading) {
    return <div className="user-profile-loading">Loading profile...</div>;
  }

  if (!user) {
    return <div className="user-profile-error">User not found</div>;
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-cover">
          {user.profile?.coverBanner && (
            <img src={user.profile.coverBanner} alt="Cover" />
          )}
        </div>
        
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {user.profile?.avatar ? (
              <img src={user.profile.avatar} alt={user.username} />
            ) : (
              <div className="avatar-placeholder">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="profile-actions">
            <button
              className={`follow-button ${isFollowing ? 'following' : ''}`}
              onClick={handleFollow}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-info">
          <h1 className="profile-name">
            {user.profile?.displayName || user.username}
            {user.profile?.badges?.some(badge => badge.name === 'Verified') && (
              <span className="verified-badge">✓</span>
            )}
          </h1>
          
          <p className="profile-username">@{user.username}</p>
          
          <div className="profile-category">
            <span className="category-badge">{user.profile?.category || 'User'}</span>
          </div>

          {user.profile?.bio && (
            <p className="profile-bio">{user.profile.bio}</p>
          )}

          <div className="profile-stats">
            <div className="stat">
              <span className="stat-number">{followersCount}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat">
              <span className="stat-number">{followingCount}</span>
              <span className="stat-label">Following</span>
            </div>
            {user.profile?.rating > 0 && (
              <div className="stat">
                <span className="stat-number">{user.profile.rating.toFixed(1)}</span>
                <span className="stat-label">Rating</span>
              </div>
            )}
          </div>

          {user.profile?.skills && user.profile.skills.length > 0 && (
            <div className="profile-skills">
              <h3>Skills</h3>
              <div className="skills-list">
                {user.profile.skills.map((skill, index) => (
                  <span key={index} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {user.profile?.location && (
            <div className="profile-location">
              <span>📍 {user.profile.location}</span>
            </div>
          )}

          {user.profile?.website && (
            <div className="profile-website">
              <a href={user.profile.website} target="_blank" rel="noopener noreferrer">
                🌐 {user.profile.website}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;




