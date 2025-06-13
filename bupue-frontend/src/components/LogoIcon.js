import React from 'react';
import './LogoIcon.css';

const LogoIcon = () => {
  return (
    <svg
      className="logo-icon"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="45" fill="#61dafb" />
      <path
        d="M30 50 L45 65 L70 35"
        stroke="white"
        strokeWidth="8"
        fill="none"
      />
    </svg>
  );
};

export default LogoIcon; 