import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [editError, setEditError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/api/auth/profile');
        setProfile(res.data.user || res.data);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setEditForm({ name: profile.name || '', email: profile.email || '' });
    setEditing(true);
    setEditError('');
  };

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.put('/api/auth/profile', editForm);
      setProfile(res.data);
      setEditing(false);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    try {
      await api.delete('/api/auth/profile');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/register');
    } catch (err) {
      alert('Failed to delete account');
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!profile) return <div>Profile not found.</div>;

  return (
    <div className="profile-container">
      <h2>My Profile</h2>
      {editing ? (
        <form className="edit-profile-form" onSubmit={handleEditSubmit}>
          <input
            type="text"
            name="name"
            value={editForm.name}
            onChange={handleEditChange}
            required
          />
          <input
            type="email"
            name="email"
            value={editForm.email}
            onChange={handleEditChange}
            required
          />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
          {editError && <div className="error">{editError}</div>}
        </form>
      ) : (
        <>
          <div><strong>Name:</strong> {profile.name}</div>
          <div><strong>Email:</strong> {profile.email}</div>
          <div className="profile-actions">
            <button onClick={handleEdit}>Edit Profile</button>
            <button onClick={handleDelete} className="danger">Delete Account</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Profile; 