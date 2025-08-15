import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import './WishlistButton.css';

const WishlistButton = ({ type, itemId, className = '' }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkWishlistStatus();
  }, [type, itemId]);

  const checkWishlistStatus = async () => {
    try {
      const response = await apiClient.get('/api/wishlist');
      const { courses, items, posts } = response.data;
      
      let found = false;
      switch (type) {
        case 'courses':
          found = courses.some(course => course._id === itemId);
          break;
        case 'items':
          found = items.some(item => item._id === itemId);
          break;
        case 'posts':
          found = posts.some(post => post._id === itemId);
          break;
        default:
          break;
      }
      
      setIsInWishlist(found);
    } catch (error) {
      console.error('Failed to check wishlist status:', error);
    }
  };

  const toggleWishlist = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (isInWishlist) {
        await apiClient.delete(`/api/wishlist/${type}/${itemId}`);
        setIsInWishlist(false);
      } else {
        await apiClient.post(`/api/wishlist/${type}/${itemId}`);
        setIsInWishlist(true);
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`wishlist-btn ${isInWishlist ? 'in-wishlist' : ''} ${className}`}
      onClick={toggleWishlist}
      disabled={isLoading}
      title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      {isLoading ? (
        <span className="loading">...</span>
      ) : (
        <span className="heart-icon">
          {isInWishlist ? '❤️' : '🤍'}
        </span>
      )}
    </button>
  );
};

export default WishlistButton;
