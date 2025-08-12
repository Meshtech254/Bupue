import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './PaymentForm';
import api from '../../api/client';
import './Cart.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const [shipping, setShipping] = useState({ name: '', address: '', city: '', country: '', postalCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('shipping'); // 'shipping' or 'payment'
  const [orderId, setOrderId] = useState(null);
  const navigate = useNavigate();

  const total = cart.reduce((sum, i) => sum + i.item.price * i.quantity, 0);

  const handleChange = e => {
    setShipping({ ...shipping, [e.target.name]: e.target.value });
  };

  const handleShippingSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const items = cart.map(i => ({ item: i.item._id, quantity: i.quantity }));
      const response = await api.post('/api/orders', { items, shipping });
      setOrderId(response.data._id);
      setStep('payment');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    navigate('/orders?success=true');
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
  };

  if (cart.length === 0) {
    return <div className="cart-container">Your cart is empty.</div>;
  }

  return (
    <div className="cart-container">
      <h2>Checkout</h2>
      <div className="cart-total">Order Total: <strong>${total.toFixed(2)}</strong></div>
      
      {step === 'shipping' && (
        <div>
          <h3>Shipping Information</h3>
          <form className="checkout-form" onSubmit={handleShippingSubmit}>
            <input name="name" placeholder="Full Name" value={shipping.name} onChange={handleChange} required />
            <input name="address" placeholder="Address" value={shipping.address} onChange={handleChange} required />
            <input name="city" placeholder="City" value={shipping.city} onChange={handleChange} required />
            <input name="country" placeholder="Country" value={shipping.country} onChange={handleChange} required />
            <input name="postalCode" placeholder="Postal Code" value={shipping.postalCode} onChange={handleChange} required />
            <button type="submit" disabled={loading}>
              {loading ? 'Creating Order...' : 'Continue to Payment'}
            </button>
            {error && <div className="error">{error}</div>}
          </form>
        </div>
      )}

      {step === 'payment' && (
        <div>
          <h3>Payment Information</h3>
          <div className="payment-methods">
            <Elements stripe={stripePromise}>
              <PaymentForm
                orderId={orderId}
                amount={total}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />
            </Elements>
          </div>
          {error && <div className="error">{error}</div>}
          <button 
            type="button" 
            className="back-button"
            onClick={() => setStep('shipping')}
          >
            Back to Shipping
          </button>
        </div>
      )}
    </div>
  );
};

export default Checkout;
