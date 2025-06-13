import React, { useState } from 'react';
import axios from 'axios';
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
      const token = localStorage.getItem('token');
      await axios.post('/api/posts', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/posts');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    }
  };

  return (
    <div className="create-post-container">
      <h2>Create Post</h2>
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
            placeholder="Write your post..."
            value={form.body}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Post</button>
      </form>
    </div>
  );
};

export default CreatePost; 