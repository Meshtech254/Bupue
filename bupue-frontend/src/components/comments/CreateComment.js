import React, { useState } from 'react';
import apiClient from '../../api/client';

const CreateComment = ({ postId, onCreated }) => {
  const [text, setText] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post(`/api/events/${postId}/comments`, { text });
      setText('');
      onCreated?.();
    } catch (e) {
      // ignore
    }
  };

  return (
    <form onSubmit={submit}>
      <input value={text} onChange={e => setText(e.target.value)} placeholder="Write a comment..." />
      <button type="submit">Post</button>
    </form>
  );
};

export default CreateComment;