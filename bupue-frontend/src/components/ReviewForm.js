import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import './ReviewForm.css';

const ReviewForm = ({ targetType, targetId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [existingReview, setExistingReview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkExistingReview();
  }, [targetType, targetId]);

  const checkExistingReview = async () => {
    try {
      const response = await apiClient.get(`/api/reviews/${targetType}/${targetId}`);
      const reviews = response.data;
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (user) {
        const userReview = reviews.find(review => review.user._id === user.id);
        if (userReview) {
          setExistingReview(userReview);
          setRating(userReview.rating);
          setText(userReview.text);
        }
      }
    } catch (error) {
      console.error('Failed to check existing review:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await apiClient.post('/api/reviews', {
        targetType,
        targetId,
        rating,
        text
      });

      setText('');
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
    setError('');
  };

  return (
    <div className="review-form">
      <h3>{existingReview ? 'Edit Your Review' : 'Write a Review'}</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="rating-section">
          <label>Rating:</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={`star ${star <= rating ? 'filled' : ''}`}
                onClick={() => handleRatingChange(star)}
                disabled={isLoading}
              >
                ★
              </button>
            ))}
          </div>
          <span className="rating-text">
            {rating > 0 ? `${rating} out of 5 stars` : 'Select rating'}
          </span>
        </div>

        <div className="text-section">
          <label htmlFor="review-text">Review (optional):</label>
          <textarea
            id="review-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts about this item..."
            rows={4}
            disabled={isLoading}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button 
          type="submit" 
          className="submit-review-btn"
          disabled={isLoading || rating === 0}
        >
          {isLoading ? 'Submitting...' : (existingReview ? 'Update Review' : 'Submit Review')}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
