import React, { useState } from 'react';
import axios from 'axios';
import './Comments.css';

const CreateComment = ({ postId, onCommentAdded }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/events/${postId}/comments`, { text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setText('');
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="create-comment-form" onSubmit={handleSubmit}>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Add a comment..."
        required
      />
      <button type="submit" disabled={loading}>{loading ? 'Posting...' : 'Post Comment'}</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default CreateComment; 