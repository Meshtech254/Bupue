import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const isLoggedIn = !!localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section quick-links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/courses">Courses</Link></li>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/marketplace">Marketplace</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>

        <div className="footer-section legal-policy">
          <h3>Legal & Policy</h3>
          <ul>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/refunds">Refund & Cancellation Policy</Link></li>
            <li><Link to="/guidelines">Community Guidelines</Link></li>
          </ul>
        </div>

        <div className="footer-section account-support">
          <h3>Account & Support</h3>
          <ul>
            {isLoggedIn ? (
              <>
                <li><Link to="/profile">My Profile</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
              </>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Sign Up</Link></li>
              </>
            )}
            <li><Link to="/help">Help Center / FAQ</Link></li>
            <li><Link to="/support">Report an Issue / Contact Support</Link></li>
          </ul>
        </div>

        <div className="footer-section social-newsletter">
          <h3>Stay Connected</h3>
          <div className="social-icons">
            {/* Placeholder for social media icons */}
            <a href="#" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="#" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="#" target="_blank" rel="noopener noreferrer">Twitter/X</a>
            <a href="#" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="#" target="_blank" rel="noopener noreferrer">TikTok</a>
          </div>
          <p className="newsletter-text">Stay updated with new courses, events, and deals!</p>
          {/* Newsletter signup form placeholder */}
          <form className="newsletter-form">
            <input type="email" placeholder="Your email" />
            <button type="submit">Subscribe</button>
          </form>
        </div>

        <div className="footer-section trust-safety">
          <h3>Trust & Safety</h3>
          <div className="payment-logos">
            {/* Placeholder for payment logos */}
            <span>Visa</span>
            <span>MasterCard</span>
            <span>M-Pesa</span>
            <span>PayPal</span>
          </div>
          <p className="copyright">© 2025 Bupue. All Rights Reserved.</p>
          {/* Optional: Verification badges explanation */}
          {/* <p className="verification-info">Verified creators & sellers</p> */}
        </div>
      </div>

      {/* Optional: Popular Categories Section */}
      <div className="footer-bottom-bar">
        <div className="popular-categories">
          <h4>Popular Categories</h4>
          <span>Trending Courses: <Link to="/courses?category=web-dev">Web Development</Link>, <Link to="/courses?category=digital-marketing">Digital Marketing</Link></span>
          <span>Upcoming Events: <Link to="/events?type=pitch-nights">Startup Pitch Nights</Link>, <Link to="/events?type=creator-meetups">Creator Meetups</Link></span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;



