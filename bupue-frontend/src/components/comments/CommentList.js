import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Comments.css';

const CommentList = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editError, setEditError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/api/posts/${postId}/comments`);
      setComments(res.data);
    } catch (err) {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line
  }, [postId]);

  const isAuthor = (comment) => user && comment.author && user.id === comment.author._id;

  const handleEdit = (comment) => {
    setEditingId(comment._id);
    setEditText(comment.text);
    setEditError('');
  };

  const handleEditChange = (e) => setEditText(e.target.value);

  const handleEditSubmit = async (e, commentId) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/posts/${postId}/comments/${commentId}`, { text: editText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingId(null);
      fetchComments();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update comment');
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/posts/${postId}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComments();
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  if (loading) return <div>Loading comments...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="comments-list">
      <h4>Comments</h4>
      {comments.length === 0 && <div>No comments yet.</div>}
      {comments.map(comment => (
        <div key={comment._id} className="comment-item">
          <div className="comment-author">{comment.author?.username || 'Unknown'}</div>
          {editingId === comment._id ? (
            <form className="edit-comment-form" onSubmit={e => handleEditSubmit(e, comment._id)}>
              <textarea value={editText} onChange={handleEditChange} required />
              <button type="submit">Save</button>
              <button type="button" onClick={() => setEditingId(null)}>Cancel</button>
              {editError && <div className="error">{editError}</div>}
            </form>
          ) : (
            <>
              <div className="comment-text">{comment.text}</div>
              <div className="comment-date">{new Date(comment.createdAt).toLocaleString()}</div>
              {isAuthor(comment) && (
                <div className="comment-actions">
                  <button onClick={() => handleEdit(comment)}>Edit</button>
                  <button onClick={() => handleDelete(comment._id)} className="danger">Delete</button>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentList; 