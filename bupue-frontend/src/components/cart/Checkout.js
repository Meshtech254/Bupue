import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import axios from 'axios';
import './Cart.css';

const CheckoutSimple = () => {
  const { cart, clearCart } = useCart();
  const [shipping, setShipping] = useState({ name: '', address: '', city: '', country: '', postalCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const total = cart.reduce((sum, i) => sum + i.item.price * i.quantity, 0);

  const handleChange = e => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const items = cart.map(i => ({ item: i.item._id, quantity: i.quantity }));
      await axios.post('/api/orders', { items, shipping }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      clearCart();
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return <div className="cart-container">Your cart is empty.</div>;
  }

  return (
    <div className="cart-container">
      <h2>Checkout</h2>
      <div className="cart-total">Order Total: <strong>${total.toFixed(2)}</strong></div>
      
      <div>
        <h3>Shipping Information</h3>
        <form className="checkout-form" onSubmit={handleSubmit}>
          <input name="name" placeholder="Full Name" value={shipping.name} onChange={handleChange} required />
          <input name="address" placeholder="Address" value={shipping.address} onChange={handleChange} required />
          <input name="city" placeholder="City" value={shipping.city} onChange={handleChange} required />
          <input name="country" placeholder="Country" value={shipping.country} onChange={handleChange} required />
          <input name="postalCode" placeholder="Postal Code" value={shipping.postalCode} onChange={handleChange} required />
          <button type="submit" disabled={loading}>
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
          {error && <div className="error">{error}</div>}
        </form>
        
        <div className="payment-note">
          <p><strong>Note:</strong> This is a simplified checkout. Payment integration with Stripe can be added once the environment is properly configured.</p>
          <p>Orders will be created in "pending" status and can be processed through the admin panel.</p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSimple;
