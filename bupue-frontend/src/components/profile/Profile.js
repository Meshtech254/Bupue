import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { useNavigate, Link } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [imageModal, setImageModal] = useState({ show: false, type: '', image: '', title: '' });
  const [imageUpload, setImageUpload] = useState({ file: null, preview: '' });
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    profile: {
      firstName: '',
      lastName: '',
      displayName: '',
      bio: '',
      avatar: '',
      coverBanner: '',
      phone: '',
      location: '',
      website: '',
      category: 'Other',
      skills: [],
      availability: 'Available',
      openForCollaborations: false,
      openForMentorship: false,
      timezone: '',
      languages: [],
      hourlyRate: 0,
      socialLinks: {
        linkedin: '',
        twitter: '',
        instagram: '',
        github: '',
        portfolio: ''
      }
    }
  });
  const [editError, setEditError] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.get('/api/auth/me');
        setProfile(res.data);
        // Initialize edit form with current profile data
        setEditForm({
          username: res.data.username || '',
          email: res.data.email || '',
          profile: {
            firstName: res.data.profile?.firstName || '',
            lastName: res.data.profile?.lastName || '',
            displayName: res.data.profile?.displayName || '',
            bio: res.data.profile?.bio || '',
            avatar: res.data.profile?.avatar || '',
            coverBanner: res.data.profile?.coverBanner || '',
            phone: res.data.profile?.phone || '',
            location: res.data.profile?.location || '',
            website: res.data.profile?.website || '',
            category: res.data.profile?.category || 'Other',
            skills: res.data.profile?.skills || [],
            availability: res.data.profile?.availability || 'Available',
            openForCollaborations: res.data.profile?.openForCollaborations || false,
            openForMentorship: res.data.profile?.openForMentorship || false,
            timezone: res.data.profile?.timezone || '',
            languages: res.data.profile?.languages || [],
            hourlyRate: res.data.profile?.hourlyRate || 0,
            socialLinks: {
              linkedin: res.data.profile?.socialLinks?.linkedin || '',
              twitter: res.data.profile?.socialLinks?.twitter || '',
              instagram: res.data.profile?.socialLinks?.instagram || '',
              github: res.data.profile?.socialLinks?.github || '',
              portfolio: res.data.profile?.socialLinks?.portfolio || ''
            }
          }
        });
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setEditing(true);
    setEditError('');
  };

  const handleEditChange = (e, section = null) => {
    if (section === 'profile') {
      setEditForm(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [e.target.name]: e.target.value
        }
      }));
    } else if (section === 'social') {
      setEditForm(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          socialLinks: {
            ...prev.profile.socialLinks,
            [e.target.name]: e.target.value
          }
        }
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [e.target.name]: e.target.value
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    setEditForm(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [e.target.name]: e.target.checked
      }
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !editForm.profile.skills.includes(newSkill.trim())) {
      setEditForm(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          skills: [...prev.profile.skills, newSkill.trim()]
        }
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setEditForm(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        skills: prev.profile.skills.filter(skill => skill !== skillToRemove)
      }
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !editForm.profile.languages.includes(newLanguage.trim())) {
      setEditForm(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          languages: [...prev.profile.languages, newLanguage.trim()]
        }
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (languageToRemove) => {
    setEditForm(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        languages: prev.profile.languages.filter(lang => lang !== languageToRemove)
      }
    }));
  };

  // Image handling functions
  const handleImageClick = (type, imageUrl, title) => {
    setImageModal({
      show: true,
      type,
      image: imageUrl,
      title
    });
  };

  const handleImageEdit = (type) => {
    setImageModal({
      show: true,
      type,
      image: type === 'avatar' ? profile.profile?.avatar : profile.profile?.coverBanner,
      title: `Edit ${type === 'avatar' ? 'Profile Picture' : 'Cover Photo'}`
    });
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setImageUpload({ file, preview: URL.createObjectURL(file) });
      setImageModal({
        show: true,
        type,
        image: URL.createObjectURL(file),
        title: `Edit ${type === 'avatar' ? 'Profile Picture' : 'Cover Photo'}`
      });
    }
  };

  const saveImage = async () => {
    if (!imageUpload.file) return;

    try {
      const formData = new FormData();
      formData.append('image', imageUpload.file);

      const response = await apiClient.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const imageUrl = response.data.url;
      
      // Update the profile with new image
      const updateData = {
        profile: {
          ...editForm.profile,
          [imageModal.type === 'avatar' ? 'avatar' : 'coverBanner']: imageUrl
        }
      };

      const profileResponse = await apiClient.put('/api/auth/profile', updateData);
      setProfile(profileResponse.data);
      setEditForm(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [imageModal.type === 'avatar' ? 'avatar' : 'coverBanner']: imageUrl
        }
      }));

      // Close modal and reset upload state
      setImageModal({ show: false, type: '', image: '', title: '' });
      setImageUpload({ file: null, preview: '' });
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const closeImageModal = () => {
    setImageModal({ show: false, type: '', image: '', title: '' });
    setImageUpload({ file: null, preview: '' });
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    try {
      const res = await apiClient.put('/api/auth/profile', editForm);
      setProfile(res.data);
      setEditing(false);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      await apiClient.delete('/api/auth/profile');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/register');
    } catch (err) {
      alert('Failed to delete account');
    }
  };

  const getAvailabilityColor = (status) => {
    switch (status) {
      case 'Available': return '#10b981';
      case 'Busy': return '#f59e0b';
      case 'Away': return '#6b7280';
      case 'Do Not Disturb': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) return <div>Profile not found.</div>;

  return (
    <div className="profile-container">
      {/* Cover Banner */}
      <div className="profile-cover">
        <img 
          src={profile.profile?.coverBanner || '/default-cover.jpg'} 
          alt="Cover" 
          className="cover-image clickable-image"
          onClick={() => handleImageClick('cover', profile.profile?.coverBanner || '/default-cover.jpg', 'Cover Photo')}
        />
        <div className="cover-overlay">
          <div className="profile-avatar">
            <img 
              src={profile.profile?.avatar || '/default-avatar.jpg'} 
              alt="Avatar" 
              className="clickable-image"
              onClick={() => handleImageClick('avatar', profile.profile?.avatar || '/default-avatar.jpg', 'Profile Picture')}
            />
            <div className="avatar-edit-overlay">
              <label htmlFor="avatar-upload" className="avatar-edit-btn">
                <span>📷</span>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'avatar')}
                style={{ display: 'none' }}
              />
            </div>
          </div>
          <div className="cover-edit-overlay">
            <label htmlFor="cover-upload" className="cover-edit-btn">
              <span>📷 Edit Cover</span>
            </label>
            <input
              id="cover-upload"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'cover')}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-info">
          <h1>{profile.profile?.displayName || profile.username}</h1>
          <p className="username">@{profile.username}</p>
          {profile.profile?.bio && <p className="bio">{profile.profile.bio}</p>}
          
          <div className="profile-meta">
            {profile.profile?.location && (
              <span className="location">📍 {profile.profile.location}</span>
            )}
            {profile.profile?.category && (
              <span className="category">{profile.profile.category}</span>
            )}
            <span 
              className="availability"
              style={{ backgroundColor: getAvailabilityColor(profile.profile?.availability) }}
            >
              {profile.profile?.availability || 'Available'}
            </span>
          </div>

          {/* Rating */}
          {profile.profile?.rating > 0 && (
            <div className="rating">
              <span className="stars">
                {'★'.repeat(Math.floor(profile.profile.rating))}
                {'☆'.repeat(5 - Math.floor(profile.profile.rating))}
              </span>
              <span className="rating-text">
                {profile.profile.rating.toFixed(1)} ({profile.profile.reviewCount} reviews)
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="profile-actions">
            <button onClick={handleEdit} className="edit-btn">Edit Profile</button>
            {(profile.profile?.openForCollaborations || profile.profile?.openForMentorship) && (
              <button className="contact-btn">Contact</button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="profile-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''} 
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'services' ? 'active' : ''} 
          onClick={() => setActiveTab('services')}
        >
          Services
        </button>
        <button 
          className={activeTab === 'cart' ? 'active' : ''} 
          onClick={() => setActiveTab('cart')}
        >
          Cart
        </button>
        <button 
          className={activeTab === 'orders' ? 'active' : ''} 
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button 
          className={activeTab === 'activity' ? 'active' : ''} 
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </button>
      </div>

      {/* Tab Content */}
      <div className="profile-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Skills */}
            {profile.profile?.skills?.length > 0 && (
              <div className="skills-section">
                <h3>Skills & Expertise</h3>
                <div className="skills-list">
                  {profile.profile.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {profile.profile?.socialLinks && (
              <div className="social-links-section">
                <h3>Connect</h3>
                <div className="social-links">
                  {profile.profile.socialLinks.linkedin && (
                    <a href={profile.profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  )}
                  {profile.profile.socialLinks.twitter && (
                    <a href={profile.profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                      Twitter
                    </a>
                  )}
                  {profile.profile.socialLinks.github && (
                    <a href={profile.profile.socialLinks.github} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </a>
                  )}
                  {profile.profile.socialLinks.portfolio && (
                    <a href={profile.profile.socialLinks.portfolio} target="_blank" rel="noopener noreferrer">
                      Portfolio
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Badges */}
            {profile.profile?.badges?.length > 0 && (
              <div className="badges-section">
                <h3>Badges & Achievements</h3>
                <div className="badges-list">
                  {profile.profile.badges.map((badge, index) => (
                    <div key={index} className="badge">
                      <span className="badge-icon">🏆</span>
                      <div className="badge-info">
                        <strong>{badge.name}</strong>
                        <p>{badge.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="stats-section">
              <h3>Stats</h3>
              <div className="stats-grid">
                <div className="stat">
                  <span className="stat-number">{profile.profile?.followers?.length || 0}</span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{profile.profile?.following?.length || 0}</span>
                  <span className="stat-label">Following</span>
                </div>
                <div className="stat">
                  <span className="stat-number">{profile.profile?.reviewCount || 0}</span>
                  <span className="stat-label">Reviews</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="services-tab">
            <div className="services-info">
              <h3>Services & Availability</h3>
              <div className="service-status">
                <div className="status-item">
                  <span className="status-label">Open for Collaborations:</span>
                  <span className={`status-value ${profile.profile?.openForCollaborations ? 'yes' : 'no'}`}>
                    {profile.profile?.openForCollaborations ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="status-item">
                  <span className="status-label">Open for Mentorship:</span>
                  <span className={`status-value ${profile.profile?.openForMentorship ? 'yes' : 'no'}`}>
                    {profile.profile?.openForMentorship ? 'Yes' : 'No'}
                  </span>
                </div>
                {profile.profile?.hourlyRate > 0 && (
                  <div className="status-item">
                    <span className="status-label">Hourly Rate:</span>
                    <span className="status-value">${profile.profile.hourlyRate}/hr</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="cart-tab">
            <h3>Shopping Cart</h3>
            <div className="cart-content">
              <p className="no-items">Your cart is empty. <Link to="/marketplace">Browse marketplace</Link> to add items.</p>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-tab">
            <h3>Order History</h3>
            <div className="orders-content">
              <p className="no-orders">No orders yet. <Link to="/marketplace">Start shopping</Link> to see your orders here.</p>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity-tab">
            <h3>Recent Activity</h3>
            <p className="no-activity">No recent activity to display.</p>
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {editing && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <h2>Edit Profile</h2>
            <form onSubmit={handleEditSubmit} className="edit-profile-form">
              <div className="form-section">
                <h3>Basic Information</h3>
                <div className="form-row">
                  <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={editForm.username}
                    onChange={handleEditChange}
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    required
                  />
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={editForm.profile.firstName}
                    onChange={(e) => handleEditChange(e, 'profile')}
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={editForm.profile.lastName}
                    onChange={(e) => handleEditChange(e, 'profile')}
                  />
                </div>
                <input
                  type="text"
                  name="displayName"
                  placeholder="Display Name"
                  value={editForm.profile.displayName}
                  onChange={(e) => handleEditChange(e, 'profile')}
                />
                <textarea
                  name="bio"
                  placeholder="Bio"
                  value={editForm.profile.bio}
                  onChange={(e) => handleEditChange(e, 'profile')}
                  rows="3"
                />
              </div>

              <div className="form-section">
                <h3>Contact & Location</h3>
                <div className="form-row">
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    value={editForm.profile.phone}
                    onChange={(e) => handleEditChange(e, 'profile')}
                  />
                  <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={editForm.profile.location}
                    onChange={(e) => handleEditChange(e, 'profile')}
                  />
                </div>
                <input
                  type="url"
                  name="website"
                  placeholder="Website"
                  value={editForm.profile.website}
                  onChange={(e) => handleEditChange(e, 'profile')}
                />
              </div>

              <div className="form-section">
                <h3>Professional Details</h3>
                <select
                  name="category"
                  value={editForm.profile.category}
                  onChange={(e) => handleEditChange(e, 'profile')}
                >
                  <option value="Other">Select Category</option>
                  <option value="Mentor">Mentor</option>
                  <option value="Entrepreneur">Entrepreneur</option>
                  <option value="Digital Creator">Digital Creator</option>
                  <option value="Student">Student</option>
                  <option value="Professional">Professional</option>
                </select>
                <select
                  name="availability"
                  value={editForm.profile.availability}
                  onChange={(e) => handleEditChange(e, 'profile')}
                >
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="Away">Away</option>
                  <option value="Do Not Disturb">Do Not Disturb</option>
                </select>
                <input
                  type="number"
                  name="hourlyRate"
                  placeholder="Hourly Rate ($)"
                  value={editForm.profile.hourlyRate}
                  onChange={(e) => handleEditChange(e, 'profile')}
                />
              </div>

              <div className="form-section">
                <h3>Skills</h3>
                <div className="skills-input">
                  <input
                    type="text"
                    placeholder="Add a skill"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  />
                  <button type="button" onClick={addSkill}>Add</button>
                </div>
                <div className="skills-list">
                  {editForm.profile.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <h3>Languages</h3>
                <div className="skills-input">
                  <input
                    type="text"
                    placeholder="Add a language"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                  />
                  <button type="button" onClick={addLanguage}>Add</button>
                </div>
                <div className="skills-list">
                  {editForm.profile.languages.map((language, index) => (
                    <span key={index} className="skill-tag">
                      {language}
                      <button type="button" onClick={() => removeLanguage(language)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <h3>Social Links</h3>
                <input
                  type="url"
                  name="linkedin"
                  placeholder="LinkedIn URL"
                  value={editForm.profile.socialLinks.linkedin}
                  onChange={(e) => handleEditChange(e, 'social')}
                />
                <input
                  type="url"
                  name="twitter"
                  placeholder="Twitter URL"
                  value={editForm.profile.socialLinks.twitter}
                  onChange={(e) => handleEditChange(e, 'social')}
                />
                <input
                  type="url"
                  name="github"
                  placeholder="GitHub URL"
                  value={editForm.profile.socialLinks.github}
                  onChange={(e) => handleEditChange(e, 'social')}
                />
                <input
                  type="url"
                  name="portfolio"
                  placeholder="Portfolio URL"
                  value={editForm.profile.socialLinks.portfolio}
                  onChange={(e) => handleEditChange(e, 'social')}
                />
              </div>

              <div className="form-section">
                <h3>Availability Settings</h3>
                <div className="checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="openForCollaborations"
                      checked={editForm.profile.openForCollaborations}
                      onChange={handleCheckboxChange}
                    />
                    Open for Collaborations
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="openForMentorship"
                      checked={editForm.profile.openForMentorship}
                      onChange={handleCheckboxChange}
                    />
                    Open for Mentorship
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn">Save Changes</button>
                <button type="button" onClick={() => setEditing(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="button" onClick={handleDelete} className="delete-btn">
                  Delete Account
                </button>
              </div>
              {editError && <div className="error">{editError}</div>}
            </form>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {imageModal.show && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div className="image-modal" onClick={(e) => e.stopPropagation()}>
            <div className="image-modal-header">
              <h3>{imageModal.title}</h3>
              <button className="close-btn" onClick={closeImageModal}>×</button>
            </div>
            <div className="image-modal-content">
              <img 
                src={imageModal.image} 
                alt={imageModal.title}
                className="modal-image"
              />
              {imageUpload.file && (
                <div className="image-upload-actions">
                  <p>New image selected. Click save to update your profile.</p>
                  <div className="image-upload-buttons">
                    <button onClick={saveImage} className="save-image-btn">
                      Save Image
                    </button>
                    <button onClick={closeImageModal} className="cancel-image-btn">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 