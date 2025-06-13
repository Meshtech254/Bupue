import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Posts.css';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get('/api/posts');
        setPosts(res.data);
      } catch (err) {
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="posts-container">
      <h2>Posts</h2>
      <Link to="/posts/create" className="create-post-btn">Create Post</Link>
      <div className="posts-list">
        {posts.map(post => (
          <div key={post._id} className="post-card">
            <h3><Link to={`/posts/${post._id}`}>{post.title}</Link></h3>
            <p>{post.body.slice(0, 120)}...</p>
            <div className="post-meta">By {post.author?.username || 'Unknown'} | {new Date(post.createdAt).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostList; 