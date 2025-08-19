import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import FilterBar from '../FilterBar';
import './Courses.css';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchCourses = async () => {
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
  };

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
        <div className="courses-grid">
          {courses.map(course => (
            <div key={course._id} className="course-card">
              {course.thumbnailUrl && <img src={course.thumbnailUrl} alt={course.title} />}
              <div className="course-info">
                <h3>{course.title}</h3>
                <p>{course.shortDescription}</p>
                <div className="course-meta">
                  <span>{course.price === 0 ? 'Free' : `$${course.price.toFixed(2)}`}</span>
                  <span>By {course.owner?.profile?.displayName || course.owner?.username || 'Unknown'}</span>
                </div>
                {course.averageRating > 0 && (
                  <div className="course-rating">
                    {'★'.repeat(Math.round(course.averageRating))}
                    <span className="rating-text">
                      {course.averageRating.toFixed(1)} ({course.reviewCount} reviews)
                    </span>
                  </div>
                )}
                <div className="tags">
                  {(course.tags || []).slice(0, 3).map((t, i) => (
                    <span key={i} className="badge">{t}</span>
                  ))}
                </div>
                {course.verifiedInstructor && <div className="badge">Verified</div>}
                <Link to={`/courses/${course._id}`} className="view-course-btn">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;