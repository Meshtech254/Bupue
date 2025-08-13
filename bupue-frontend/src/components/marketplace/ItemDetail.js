import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import './Marketplace.css';
import { useCart } from '../../context/CartContext';

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', price: '', images: [''] });
  const [editError, setEditError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await apiClient.get(`/api/items/${id}`);
        setItem(res.data);
      } catch (err) {
        setError('Failed to load item');
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  const isOwner = user && item && user.id === item.owner?._id;

  const handleEdit = () => {
    setEditForm({
      title: item.title,
      description: item.description,
      price: item.price,
      images: item.images && item.images.length ? item.images : ['']
    });
    setEditing(true);
    setEditError('');
  };

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleImageChange = (idx, value) => {
    const newImages = [...editForm.images];
    newImages[idx] = value;
    setEditForm({ ...editForm, images: newImages });
  };

  const addImageField = () => setEditForm({ ...editForm, images: [...editForm.images, ''] });

  const handleEditSubmit = async e => {
    e.preventDefault();
    try {
      await apiClient.put(`/api/items/${id}`, editForm);
      setEditing(false);
      window.location.reload();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update item');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await apiClient.delete(`/api/items/${id}`);
      navigate('/marketplace');
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  if (loading) return <div>Loading item...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!item) return <div>Item not found.</div>;

  return (
    <div className="item-detail-container">
      {editing ? (
        <form className="edit-item-form" onSubmit={handleEditSubmit}>
          <input
            type="text"
            name="title"
            value={editForm.title}
            onChange={handleEditChange}
            required
          />
          <textarea
            name="description"
            value={editForm.description}
            onChange={handleEditChange}
            required
          />
          <input
            type="number"
            name="price"
            value={editForm.price}
            onChange={handleEditChange}
            required
          />
          <label>Image URLs:</label>
          {editForm.images.map((img, idx) => (
            <input
              key={idx}
              type="text"
              placeholder="Image URL"
              value={img}
              onChange={e => handleImageChange(idx, e.target.value)}
            />
          ))}
          <button type="button" onClick={addImageField} className="add-image-btn">Add Another Image</button>
          <button type="submit">Save</button>
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
          {editError && <div className="error">{editError}</div>}
        </form>
      ) : (
        <>
          <h2>{item.title}</h2>
          <div className="item-meta">Price: ${item.price}</div>
          <div className="item-body">{item.description}</div>
          {item.images && item.images.length > 0 && (
            <div className="item-images">
              {item.images.map((img, idx) => (
                <img key={idx} src={img} alt={item.title} />
              ))}
            </div>
          )}
          <div className="item-meta">By {item.owner?.username || 'Unknown'}</div>
          {isOwner && (
            <div className="item-actions">
              <button onClick={handleEdit}>Edit</button>
              <button onClick={handleDelete} className="danger">Delete</button>
            </div>
          )}
          <button onClick={() => addToCart(item)}>Add to Cart</button>
        </>
      )}
    </div>
  );
};

export default ItemDetail; 