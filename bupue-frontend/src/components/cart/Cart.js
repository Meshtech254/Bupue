import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const total = cart.reduce((sum, i) => sum + i.item.price * i.quantity, 0);

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="cart-container">
        <h2>Your Cart</h2>
        <div>Your cart is empty.</div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
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
        <button onClick={handleCheckout}>Proceed to Checkout</button>
        <button onClick={clearCart} className="danger">Clear Cart</button>
      </div>
    </div>
  );
};

export default Cart; 