import React, { useState } from 'react';
import apiClient from '../../api/client';
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
      let thumbnailUrl = '';
      if (thumbnail) {
        const formData = new FormData();
        formData.append('image', thumbnail);
                 const uploadRes = await apiClient.post('/api/upload/single', formData, {
           headers: { 'Content-Type': 'multipart/form-data' }
         });
        thumbnailUrl = uploadRes.data?.file?.url || uploadRes.data?.url || '';
      }

      const courseData = {
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        thumbnail: thumbnailUrl
      };

      await apiClient.post('/api/courses', courseData);
      setForm({ title: '', description: '', price: '', owner: '' });
      setThumbnail(null);
      window.location.href = '/courses';
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
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {thumbnail && (
          <div style={{ marginTop: 8 }}>
            <strong>Thumbnail preview:</strong>
            <div>
              <img
                src={URL.createObjectURL(thumbnail)}
                alt="Thumbnail preview"
                style={{ width: 160, height: 'auto', borderRadius: 6, marginTop: 6 }}
              />
            </div>
          </div>
        )}
        <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Course'}</button>
      </form>
    </div>
  );
};

export default CreateCourse; 