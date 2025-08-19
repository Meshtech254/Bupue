import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import './Courses.css';

const secondsToHms = (secs) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s]
    .map((v, i) => (i === 0 ? v : String(v).padStart(2, '0')))
    .filter((v, i) => v !== 0 || i > 0)
    .join(':');
};

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiClient.get(`/api/courses/${id}`);
        setCourse(res.data);
        setIsEnrolled(!!res.data.isEnrolled);
      } catch (err) {
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleEnroll = async () => {
    try {
      await apiClient.post(`/api/courses/${id}/enroll`);
      navigate(`/courses/${id}/learn`);
    } catch (err) {
      alert('Failed to enroll');
    }
  };

  if (loading) return <div>Loading course...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!course) return <div>Course not found.</div>;

  const priceText = course.price === 0 ? 'Free' : `$${course.price}`;
  const durationText = secondsToHms(course.durationSeconds || 0);

  return (
    <div className="course-detail-container">
      <div className="course-hero">
        {course.coverImageUrl && <img className="course-cover" src={course.coverImageUrl} alt={course.title} />}
        <div className="course-hero-content">
          <h1>{course.title}</h1>
          <p className="course-short">{course.shortDescription}</p>
          <div className="course-hero-meta">
            <span>{priceText}</span>
            <span>{durationText}</span>
            <span>{course.language}</span>
          </div>
          <div className="course-hero-actions">
            {isEnrolled ? (
              <button onClick={() => navigate(`/courses/${id}/learn`)}>Go to Course</button>
            ) : (
              <button onClick={handleEnroll}>{course.price === 0 ? 'Enroll for Free' : 'Purchase & Enroll'}</button>
            )}
            <button onClick={() => navigator.share?.({ url: window.location.href })}>Share</button>
          </div>
        </div>
        {course.promoVideoUrl && (
          <div className="promo-video">
            <video controls src={course.promoVideoUrl} style={{ width: '100%' }} />
          </div>
        )}
      </div>

      <div className="course-body">
        <h2>What you'll learn</h2>
        <ul className="learning-outcomes">
          {(course.targetAudience || []).map((t, idx) => (
            <li key={idx}>• {t}</li>
          ))}
        </ul>

        <h2>Course Description</h2>
        <p>{course.fullDescription}</p>

        <h2>Curriculum</h2>
        <div className="curriculum">
          {(course.lessons || []).map((l) => (
            <div key={l._id} className="lesson-row">
              <div className="lesson-left">
                <span className="lesson-title">{l.title}</span>
                {l.freePreview && <span className="badge">Preview</span>}
              </div>
              <div className="lesson-right">
                <span>{secondsToHms(l.durationSeconds || 0)}</span>
                {l.freePreview && (l.videoUrl || l.embedUrl) && (
                  <a className="preview-link" href={l.videoUrl || l.embedUrl} target="_blank" rel="noreferrer">Watch</a>
                )}
              </div>
            </div>
          ))}
        </div>

        <h2>Instructor</h2>
        <div className="instructor">
          <img className="avatar" src={course.owner?.profile?.avatar} alt={course.owner?.username} />
          <div>
            <div className="name">{course.owner?.profile?.displayName || course.owner?.username}</div>
            <div className="bio">Verified: {course.verifiedInstructor ? 'Yes' : 'No'}</div>
          </div>
        </div>

        <h2>Ratings & Reviews</h2>
        <div>Average Rating: {course.averageRating} ({course.reviewCount} reviews)</div>
      </div>
    </div>
  );
};

export default CourseDetail;