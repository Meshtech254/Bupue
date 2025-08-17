import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from './SearchBar';
import './Navbar.css';

const Navbar = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  })();
  const isAdmin = !!user?.isAdmin;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to={isLoggedIn ? "/dashboard" : "/"} className="navbar-logo">
          <span className="logo-icon">B</span>
          <span className="logo-text">Bupue</span>
        </Link>
        {isLoggedIn && (
          <>
            <Link to="/courses">Courses</Link>
            <Link to="/events">Events</Link>
            <Link to="/marketplace">Marketplace</Link>
            <Link to="/messages">Messages</Link>
            {isAdmin && <Link to="/admin">Admin</Link>}
          </>
        )}
        {isLoggedIn && <SearchBar />}
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