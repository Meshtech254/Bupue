import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Courses.css';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', description: '', price: '' });
  const [editError, setEditError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await axios.get(`/api/courses/${id}`);
        setCourse(res.data);
      } catch (err) {
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id]);

  const isOwner = user && course && user.id === course.owner;

  const handleEdit = () => {
    setEditForm({ title: course.title, description: course.description, price: course.price });
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
      await axios.put(`/api/courses/${id}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditing(false);
      window.location.reload();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update course');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/courses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/courses');
    } catch (err) {
      alert('Failed to delete course');
    }
  };

  if (loading) return <div>Loading course...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!course) return <div>Course not found.</div>;

  return (
    <div className="course-detail-container">
      {editing ? (
        <form className="edit-course-form" onSubmit={handleEditSubmit}>
          <input
            type="text"
            name="title"
            value={editForm.title}
            onChange={handleEditChange}
            required
          />
          <textarea
            name="description"
            value={editForm.description}
            onChange={handleEditChange}
            required
          />
          <input
            type="number"
            name="price"
            value={editForm.price}
            onChange={handleEditChange}
            required
          />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setEditing(false)}>Cancel</button>
          {editError && <div className="error">{editError}</div>}
        </form>
      ) : (
        <>
          <h2>{course.title}</h2>
          <div className="course-meta">Price: ${course.price}</div>
          <div className="course-body">{course.description}</div>
          {isOwner && (
            <div className="course-actions">
              <button onClick={handleEdit}>Edit</button>
              <button onClick={handleDelete} className="danger">Delete</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourseDetail; 