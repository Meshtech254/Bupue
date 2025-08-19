import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../api/client';
import './Courses.css';

const CourseLearn = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [progress, setProgress] = useState({ progressPercent: 0, completedLessonIds: [] });
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [contentRes, progressRes] = await Promise.all([
        apiClient.get(`/api/courses/${id}/content`),
        apiClient.get(`/api/courses/${id}/progress`).catch(() => ({ data: { progressPercent: 0, completedLessonIds: [] } }))
      ]);
      setContent(contentRes.data);
      setProgress(progressRes.data);
      const first = (contentRes.data.lessons || [])[0];
      if (first) setSelectedLessonId(first._id);
    } catch (err) {
      setError('Failed to load course content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [id]);

  const selectedLesson = useMemo(() => {
    return (content?.lessons || []).find(l => String(l._id) === String(selectedLessonId));
  }, [content, selectedLessonId]);

  const markComplete = async (lessonId) => {
    try {
      await apiClient.post(`/api/courses/${id}/progress/${lessonId}/complete`);
      await load();
    } catch (err) {
      alert('Failed to update progress');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!content) return <div>Not found</div>;

  return (
    <div className="course-learn">
      <div className="learn-sidebar">
        <div className="progress">Progress: {progress.progressPercent}%</div>
        <ul className="lesson-list">
          {(content.lessons || []).map(lesson => {
            const completed = (progress.completedLessonIds || []).some(id => String(id) === String(lesson._id));
            return (
              <li key={lesson._id} className={String(lesson._id) === String(selectedLessonId) ? 'active' : ''}>
                <button onClick={() => setSelectedLessonId(lesson._id)}>
                  {completed ? '✅ ' : ''}{lesson.title}
                </button>
              </li>
            );
          })}
        </ul>
        <button onClick={() => navigate(`/courses/${id}`)}>Back to landing</button>
      </div>
      <div className="learn-main">
        {selectedLesson ? (
          <div className="lesson-view">
            <h2>{selectedLesson.title}</h2>
            {selectedLesson.type === 'video' && (
              <>
                {selectedLesson.videoUrl && <video controls src={selectedLesson.videoUrl} style={{ width: '100%' }} />}
                {!selectedLesson.videoUrl && selectedLesson.embedUrl && (
                  <iframe title="embed" src={selectedLesson.embedUrl} width="100%" height="480" frameBorder="0" allowFullScreen />
                )}
              </>
            )}
            {selectedLesson.type === 'reading' && (
              <div className="reading-content">{selectedLesson.textContent}</div>
            )}
            {selectedLesson.resources?.length > 0 && (
              <div className="resources">
                <h3>Resources</h3>
                <ul>
                  {selectedLesson.resources.map((r, idx) => (
                    <li key={idx}><a href={r.url} target="_blank" rel="noreferrer">{r.title}</a></li>
                  ))}
                </ul>
              </div>
            )}
            <button onClick={() => markComplete(selectedLesson._id)}>Mark complete</button>
          </div>
        ) : (
          <div>Select a lesson</div>
        )}
      </div>
    </div>
  );
};

export default CourseLearn;