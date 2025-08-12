import React, { useState } from 'react';
import api from '../../api/client';
import './Courses.css';

const CreateCourse = () => {
  const [form, setForm] = useState({ title: '', description: '', price: '', owner: '' });
  const [thumbnail, setThumbnail] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = e => setThumbnail(e.target.files[0]);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', form.title);
      formDataToSend.append('description', form.description);
      formDataToSend.append('price', form.price);
      if (thumbnail) formDataToSend.append('thumbnail', thumbnail);

      await api.post('/api/courses', formDataToSend);
      setForm({ title: '', description: '', price: '', owner: '' });
      setThumbnail(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="courses-container">
      <h2>Create Course</h2>
      {error && <div className="error">{error}</div>}
      <form className="create-course-form" onSubmit={handleSubmit}>
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
        <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required />
        <input type="file" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Course'}</button>
      </form>
    </div>
  );
};

export default CreateCourse; 