import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import './Courses.css';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await apiClient.get('/api/courses');
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
      <div className="courses-header">
        <h2>Courses</h2>
        <Link to="/courses/create" className="create-course-btn">Create Course</Link>
      </div>
      
      {courses.length === 0 ? (
        <div className="no-courses">
          <p>No courses available yet.</p>
          <Link to="/courses/create" className="create-course-btn">Create the first course!</Link>
        </div>
      ) : (
        <div className="course-list">
          {courses.map(course => (
            <div key={course._id} className="course-card">
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="course-meta">
                <div className="course-price">${course.price.toFixed(2)}</div>
                <div className="course-owner">By {course.owner?.username || 'Unknown'}</div>
              </div>
              <Link to={`/courses/${course._id}`} className="view-course-btn">View Details</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList; 