import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../../api/client';
import CreateComment from '../comments/CreateComment';
import CommentList from '../comments/CommentList';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', body: '' });

  const load = async () => {
    try {
      const res = await apiClient.get(`/api/events/${id}`);
      setPost(res.data);
    } catch (e) {
      setPost(null);
    }
  };

  useEffect(() => { load(); /* eslint-disable-line */ }, [id]);

  const update = async () => {
    try {
      await apiClient.put(`/api/events/${id}`, editForm);
      await load();
    } catch (e) {}
  };

  const remove = async () => {
    try {
      await apiClient.delete(`/api/events/${id}`);
      window.history.back();
    } catch (e) {}
  };

  if (!post) return <div>Loading...</div>;

  return (
    <div>
      <h2>{post.title}</h2>
      <div>{post.body}</div>
      <button onClick={update}>Save</button>
      <button onClick={remove}>Delete</button>

      <h3>Comments</h3>
      <CreateComment postId={id} onCreated={load} />
      <CommentList postId={id} />
    </div>
  );
};

export default PostDetail;