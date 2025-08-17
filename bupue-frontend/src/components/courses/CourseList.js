import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import FilterBar from '../FilterBar';
import WishlistButton from '../WishlistButton';
import './Courses.css';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({});

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      const response = await apiClient.get(`/api/courses?${queryParams.toString()}`);
      setCourses(response.data);
    } catch (err) {
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);



  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  if (loading) return <div className="courses-container">Loading courses...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="courses-container">
      <div className="courses-header">
        <h2>Courses</h2>
        <Link to="/courses/create" className="create-course-btn">Create Course</Link>
      </div>

      <FilterBar 
        type="courses" 
        filters={filters} 
        onFilterChange={handleFilterChange} 
      />
      
      {courses.length === 0 ? (
        <div className="no-courses">
          <p>No courses available yet.</p>
          <Link to="/courses/create" className="create-course-btn">Create the first course!</Link>
        </div>
      ) : (
        <div className="course-list">
          {courses.map(course => (
            <div key={course._id} className="course-card">
              <div className="course-header">
                <h3>{course.title}</h3>
                <WishlistButton type="courses" itemId={course._id} />
              </div>
              <p>{course.description}</p>
              <div className="course-meta">
                <div className="course-price">${course.price.toFixed(2)}</div>
                <div className="course-owner">By {course.owner?.username || 'Unknown'}</div>
                {course.averageRating > 0 && (
                  <div className="course-rating">
                    {'★'.repeat(Math.round(course.averageRating))}
                    <span className="rating-text">
                      {course.averageRating.toFixed(1)} ({course.reviewCount} reviews)
                    </span>
                  </div>
                )}
                {course.category && (
                  <div className="course-category">{course.category}</div>
                )}
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