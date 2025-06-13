import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import BupueLogo from './BupueLogo';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="home-container">
      <BupueLogo />
      <div className="home-content">
        <h1>Welcome to Bupue</h1>
        <p className="subtitle">Connect with entrepreneurs, find solutions, and grow your business</p>
        <div className="home-buttons">
          <button className="primary" onClick={() => navigate('/register')}>Get Started</button>
          <button className="secondary" onClick={() => navigate('/login')}>Login</button>
        </div>
      </div>
      <footer className="home-footer">© 2025 Bupue. All rights reserved.</footer>
    </div>
  );
};

export default Home; 