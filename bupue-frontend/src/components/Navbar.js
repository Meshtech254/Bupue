import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const isLoggedIn = !!localStorage.getItem('token');

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
            <Link to="/events">Events</Link>
            <Link to="/marketplace">Marketplace</Link>
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