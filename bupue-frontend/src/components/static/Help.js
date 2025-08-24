import React from 'react';
import FAQs from './FAQs';

const Help = () => {
  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1>Help Center</h1>
        <p>Find answers to frequently asked questions.</p>
      </header>
      <FAQs />
    </div>
  );
};

export default Help;

