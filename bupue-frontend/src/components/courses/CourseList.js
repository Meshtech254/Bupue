import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Courses.css';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/courses');
        setCourses(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch courses');
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="courses-container">
      <h2>Available Courses</h2>
      <div className="courses-grid">
        {courses.map(course => (
          <div key={course._id} className="course-card">
            <img src={course.thumbnail} alt={course.title} />
            <div className="course-info">
              <h3><Link to={`/courses/${course._id}`}>{course.title}</Link></h3>
              <p>{course.description}</p>
              <div className="course-meta">
                <span>${course.price}</span>
                <span>{course.rating} ⭐</span>
              </div>
              <Link to={`/courses/${course._id}`} className="view-course-btn">
                View Course
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseList; 