import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CommentList from '../comments/CommentList';
import CreateComment from '../comments/CreateComment';
import './Posts.css';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', body: '' });
  const [editError, setEditError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/posts/${id}`);
        setPost(res.data);
      } catch (err) {
        setError('Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, refresh]);

  const handleCommentAdded = () => setRefresh(r => !r);

  const isAuthor = user && post && user.id === post.author?._id;

  const handleEdit = () => {
    setEditForm({ title: post.title, body: post.body });
    setEditing(true);
    setEditError('');
  };

  const handleEditChange = e => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/posts/${id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditing(false);
      setRefresh(r => !r);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update post');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/posts');
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  if (loading) return <div>Loading post...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!post) return <div>Post not found.</div>;

  return (
    <div className="post-detail-container">
      {editing ? (
        <form className="edit-post-form" onSubmit={handleEditSubmit}>
          <input
            type="text"
            name="title"
            value={editForm.title}
            onChange={handleEditChange}
            required
          />
          <textarea
            name="body"
            value={editForm.body}
            onChange={handleEditChange}
            required
          />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
          {editError && <div className="error">{editError}</div>}
        </form>
      ) : (
        <>
          <h2>{post.title}</h2>
          <div className="post-meta">By {post.author?.username || 'Unknown'} | {new Date(post.createdAt).toLocaleString()}</div>
          <div className="post-body">{post.body}</div>
          {isAuthor && (
            <div className="post-actions">
              <button onClick={handleEdit}>Edit</button>
              <button onClick={handleDelete} className="danger">Delete</button>
            </div>
          )}
        </>
      )}
      <CreateComment postId={id} onCommentAdded={handleCommentAdded} />
      <CommentList key={refresh} postId={id} />
    </div>
  );
};

export default PostDetail; 