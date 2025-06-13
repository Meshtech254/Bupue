import React from 'react';
import { Link } from 'react-router-dom';
import './BupueLogo.css';

const BupueLogo = () => (
  <Link to="/" className="bupue-logo-link">
    <div className="bupue-logo">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="16" fill="#2563eb"/>
        <text x="16" y="22" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#fff">B</text>
      </svg>
      <span className="bupue-logo-text">Bupue</span>
    </div>
  </Link>
);

export default BupueLogo; 