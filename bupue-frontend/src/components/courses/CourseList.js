import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import './Courses.css';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await api.get('/api/courses');
        setCourses(response.data);
      } catch (err) {
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <div className="courses-container">Loading courses...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="courses-container">
      <h2>Courses</h2>
      <div className="course-list">
        {courses.map(course => (
          <div key={course._id} className="course-card">
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <div className="course-price">${course.price.toFixed(2)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseList; 