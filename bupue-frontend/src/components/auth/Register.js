import React, { useState } from 'react';
import apiClient from '../../api/client';
import { useNavigate } from 'react-router-dom';

import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!acceptedPolicy) {
      setError('You must accept the Terms and Privacy Policy to register.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/api/auth/register', {
        ...formData
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const backendOrigin = (process.env.REACT_APP_API_URL || 'http://localhost:4000')
    .replace(/\/$/, '')
    .replace(/\/api$/, '');

  const continueWithGoogle = () => {
    const next = encodeURIComponent('/dashboard');
    window.location.href = `${backendOrigin}/api/auth/oauth/google?next=${next}`;
  };

  const continueWithMicrosoft = () => {
    const next = encodeURIComponent('/dashboard');
    window.location.href = `${backendOrigin}/api/auth/oauth/microsoft?next=${next}`;
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} autoComplete="on">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          autoComplete="username"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          inputMode="email"
          required
        />

        <div className="form-group password-group">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '' : ''}
          </button>
        </div>

        <label className="policy-row">
          <input
            type="checkbox"
            checked={acceptedPolicy}
            onChange={(e) => setAcceptedPolicy(e.target.checked)}
            required
          />
          <span>
            I accept the{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="policy-link">
              Terms and Conditions
            </a>
            {' '}and{' '}
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="policy-link">
              Privacy Policy
            </a>
            .
          </span>
        </label>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <div style={{ margin: '1rem 0', textAlign: 'center', color: '#6b7280' }}>or</div>

      <div style={{ display: 'grid', gap: '0.5rem' }}>
        <button onClick={continueWithGoogle} style={{ background: '#fff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '.6rem 1rem', cursor: 'pointer' }}>
          Continue with Google
        </button>
        <button onClick={continueWithMicrosoft} style={{ background: '#fff', color: '#111827', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '.6rem 1rem', cursor: 'pointer' }}>
          Continue with Microsoft
        </button>
      </div>
    </div>
  );
};

export default Register;