import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import './Marketplace.css';
import { useCart } from '../../context/CartContext';

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const total = cart.reduce((sum, i) => sum + i.item.price * i.quantity, 0);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await apiClient.get('/api/items');
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
      <div className="marketplace-cart-container">
        <h3>Your Cart</h3>
        {cart.length === 0 ? (
          <div>Your cart is empty.</div>
        ) : (
          <>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map(({ item, quantity }) => (
                  <tr key={item._id}>
                    <td>{item.title}</td>
                    <td>${item.price}</td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={e => updateQuantity(item._id, parseInt(e.target.value) || 1)}
                        style={{ width: 50 }}
                      />
                    </td>
                    <td>${(item.price * quantity).toFixed(2)}</td>
                    <td>
                      <button onClick={() => removeFromCart(item._id)} className="danger">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="cart-total">Total: <strong>${total.toFixed(2)}</strong></div>
            <div className="cart-actions">
              <button onClick={() => window.location.href='/marketplace/checkout'}>Proceed to Checkout</button>
              <button onClick={clearCart} className="danger">Clear Cart</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ItemList; 