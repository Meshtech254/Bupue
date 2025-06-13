import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  const { cart } = useCart();
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">B</span>
          <span className="logo-text">Bupue</span>
        </Link>
        {isLoggedIn && (
          <>
            <Link to="/courses">Courses</Link>
            <Link to="/posts">Posts</Link>
            <Link to="/marketplace">Marketplace</Link>
            <Link to="/cart" className="cart-link">
              <span className="cart-icon">🛒</span>
              {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
            </Link>
            <Link to="/orders">Orders</Link>
          </>
        )}
      </div>
      <div className="navbar-right">
        <Link to="/privacy" className="privacy-link">Privacy</Link>
        {isLoggedIn ? (
          <Link to="/profile">Profile</Link>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 