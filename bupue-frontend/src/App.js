import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Logo from './components/Logo';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Logo />
        </header>
        <main>
          <Routes>
            <Route path="/" element={<div>Welcome to Bupue</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 