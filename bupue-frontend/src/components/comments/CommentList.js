import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';

const CommentList = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get(`/api/events/${postId}/comments`);
        setComments(res.data || []);
      } catch (e) {
        setComments([]);
      }
    };
    load();
  }, [postId]);

  const startEdit = (comment) => {
    setEditId(comment._id);
    setEditText(comment.text || '');
  };

  const submitEdit = async (commentId) => {
    try {
      await apiClient.put(`/api/events/${postId}/comments/${commentId}`, { text: editText });
      setComments(prev => prev.map(c => c._id === commentId ? { ...c, text: editText } : c));
      setEditId(null);
      setEditText('');
    } catch (e) {
      // ignore
    }
  };

  const remove = async (commentId) => {
    try {
      await apiClient.delete(`/api/events/${postId}/comments/${commentId}`);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (e) {
      // ignore
    }
  };

  return (
    <div>
      {comments.map(c => (
        <div key={c._id}>
          {editId === c._id ? (
            <>
              <input value={editText} onChange={e => setEditText(e.target.value)} />
              <button onClick={() => submitEdit(c._id)}>Save</button>
              <button onClick={() => setEditId(null)}>Cancel</button>
            </>
          ) : (
            <>
              <div>{c.text}</div>
              <button onClick={() => startEdit(c)}>Edit</button>
              <button onClick={() => remove(c._id)}>Delete</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default CommentList;