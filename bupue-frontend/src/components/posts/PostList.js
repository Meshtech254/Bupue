import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import './Posts.css';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await apiClient.get('/api/posts');
        setPosts(res.data);
      } catch (err) {
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return <div className="posts-container">Loading events...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="posts-container">
      <div className="posts-header">
        <h2>Events</h2>
        <Link to="/events/create" className="create-event-btn">Create Event</Link>
      </div>
      
      {posts.length === 0 ? (
        <div className="no-events">
          <p>No events available yet.</p>
          <Link to="/events/create" className="create-event-btn">Create the first event!</Link>
        </div>
      ) : (
        <div className="posts-list">
          {posts.map(post => (
            <div key={post._id} className="post-card">
              <h3>{post.title}</h3>
              <p>{post.body}</p>
              <div className="post-meta">
                <div className="post-author">By {post.author?.username || 'Unknown'}</div>
                <div className="post-date">
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
              <Link to={`/events/${post._id}`} className="view-event-btn">View Details</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostList; 