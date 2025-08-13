import React, { useState } from 'react';
import apiClient from '../../api/client';
import { useNavigate } from 'react-router-dom';
import './Posts.css';

const CreatePost = () => {
  const [form, setForm] = useState({ title: '', body: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await apiClient.post('/api/posts', form);
      navigate('/events');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    }
  };

  return (
    <div className="create-event-container">
      <h2>Create Event</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <textarea
            name="body"
            placeholder="Write your event..."
            value={form.body}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Create Event</button>
      </form>
    </div>
  );
};

export default CreatePost; 