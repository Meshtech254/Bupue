import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Marketplace.css';

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get('/api/items');
        setItems(res.data);
      } catch (err) {
        setError('Failed to load items');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  if (loading) return <div>Loading items...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="marketplace-container">
      <h2>Marketplace</h2>
      <Link to="/marketplace/create" className="create-item-btn">Add Item</Link>
      <div className="items-grid">
        {items.map(item => (
          <div key={item._id} className="item-card">
            {item.images && item.images[0] && (
              <img src={item.images[0]} alt={item.title} />
            )}
            <div className="item-info">
              <h3><Link to={`/marketplace/${item._id}`}>{item.title}</Link></h3>
              <p>{item.description.slice(0, 80)}...</p>
              <div className="item-meta">
                <span>${item.price}</span>
                <span>By {item.owner?.username || 'Unknown'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemList; 