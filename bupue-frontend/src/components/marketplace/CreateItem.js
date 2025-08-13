import React, { useState } from 'react';
import apiClient from '../../api/client';
import { useNavigate } from 'react-router-dom';
import './Marketplace.css';

const CreateItem = () => {
  const [form, setForm] = useState({ title: '', description: '', price: '', images: [''] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (idx, value) => {
    const newImages = [...form.images];
    newImages[idx] = value;
    setForm({ ...form, images: newImages });
  };

  const addImageField = () => setForm({ ...form, images: [...form.images, ''] });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiClient.post('/api/items', form);
      navigate('/marketplace');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-item-container">
      <h2>Add Marketplace Item</h2>
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
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Image URLs:</label>
          {form.images.map((img, idx) => (
            <input
              key={idx}
              type="text"
              placeholder="Image URL"
              value={img}
              onChange={e => handleImageChange(idx, e.target.value)}
            />
          ))}
          <button type="button" onClick={addImageField} className="add-image-btn">Add Another Image</button>
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Item'}</button>
      </form>
    </div>
  );
};

export default CreateItem; 