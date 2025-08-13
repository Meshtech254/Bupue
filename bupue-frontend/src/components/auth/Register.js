import React, { useState } from 'react';
import apiClient from '../../api/client';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!acceptedPolicy) {
      setError('You must accept the Terms and Conditions to register');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await apiClient.post('/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      console.log('Registration successful:', response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('Stored in localStorage:', {
        token: response.data.token ? 'present' : 'missing',
        user: response.data.user ? 'present' : 'missing'
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group password-group">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
        <div className="form-group password-group">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
        
        <div className="form-group policy-group">
          <label className="policy-checkbox">
            <input
              type="checkbox"
              checked={acceptedPolicy}
              onChange={(e) => setAcceptedPolicy(e.target.checked)}
              required
            />
            <span className="checkmark"></span>
            I accept the{' '}
            <a 
              href="/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="policy-link"
            >
              Terms and Conditions
            </a>
            {' '}and{' '}
            <a 
              href="/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="policy-link"
            >
              Privacy Policy
            </a>
          </label>
        </div>
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
};

export default Register; 