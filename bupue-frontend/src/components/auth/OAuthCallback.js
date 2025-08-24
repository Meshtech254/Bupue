import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';

const OAuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const next = params.get('next') || '/dashboard';

    if (!token) {
      navigate('/login');
      return;
    }

    const persist = async () => {
      try {
        localStorage.setItem('token', token);
        const me = await apiClient.get('/api/auth/me');
        localStorage.setItem('user', JSON.stringify(me.data));
        navigate(next);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    };
    persist();
  }, [navigate]);

  return <div style={{ padding: '2rem', textAlign: 'center' }}>Signing you in...</div>;
};

export default OAuthCallback;