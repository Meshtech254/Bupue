import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import './Courses.css';

const emptyLesson = { title: '', order: 0, type: 'video', videoUrl: '', embedUrl: '', textContent: '', durationSeconds: 0, freePreview: false, resources: [] };

const CreateCourse = () => {
  const navigate = useNavigate();
  const [basic, setBasic] = useState({
    title: '', shortDescription: '', fullDescription: '', category: '', subcategory: '', language: 'English', targetAudience: ''
  });
  const [branding, setBranding] = useState({ thumbnailUrl: '', coverImageUrl: '', promoVideoUrl: '' });
  const [pricing, setPricing] = useState({ price: 0, discountPercent: 0, affiliateCommissionPercent: 0 });
  const [lessons, setLessons] = useState([{ ...emptyLesson }]);
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateLesson = (index, field, value) => {
    const copy = lessons.slice();
    copy[index] = { ...copy[index], [field]: value };
    setLessons(copy);
  };

  const addLesson = () => setLessons(prev => [...prev, { ...emptyLesson, order: prev.length }]);
  const removeLesson = (index) => setLessons(prev => prev.filter((_, i) => i !== index).map((l, i) => ({ ...l, order: i })));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...basic,
        targetAudience: basic.targetAudience ? basic.targetAudience.split(',').map(s => s.trim()).filter(Boolean) : [],
        ...branding,
        ...pricing,
        lessons: lessons.map((l, i) => ({ ...l, order: i })),
        tags: tags ? tags.split(',').map(s => s.trim()).filter(Boolean) : []
      };
      await apiClient.post('/api/courses', payload);
      navigate('/courses');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="courses-container">
      <h2>Create Course</h2>
      {error && <div className="error">{error}</div>}
      <form className="create-course-form" onSubmit={handleSubmit}>
        <div className="section">
          <h3>Basic Info</h3>
          <input name="title" placeholder="Course Title" value={basic.title} onChange={e => setBasic({ ...basic, title: e.target.value })} required />
          <input name="shortDescription" placeholder="Short Description" value={basic.shortDescription} onChange={e => setBasic({ ...basic, shortDescription: e.target.value })} />
          <textarea name="fullDescription" placeholder="Full Description" value={basic.fullDescription} onChange={e => setBasic({ ...basic, fullDescription: e.target.value })} />
          <input name="category" placeholder="Category (e.g., Business)" value={basic.category} onChange={e => setBasic({ ...basic, category: e.target.value })} />
          <input name="subcategory" placeholder="Subcategory (e.g., Entrepreneurship)" value={basic.subcategory} onChange={e => setBasic({ ...basic, subcategory: e.target.value })} />
          <input name="targetAudience" placeholder="Target Audience (comma-separated)" value={basic.targetAudience} onChange={e => setBasic({ ...basic, targetAudience: e.target.value })} />
          <input name="language" placeholder="Language" value={basic.language} onChange={e => setBasic({ ...basic, language: e.target.value })} />
        </div>

        <div className="section">
          <h3>Branding</h3>
          <input name="thumbnailUrl" placeholder="Thumbnail URL" value={branding.thumbnailUrl} onChange={e => setBranding({ ...branding, thumbnailUrl: e.target.value })} />
          <input name="coverImageUrl" placeholder="Cover Image URL" value={branding.coverImageUrl} onChange={e => setBranding({ ...branding, coverImageUrl: e.target.value })} />
          <input name="promoVideoUrl" placeholder="Promo Video URL" value={branding.promoVideoUrl} onChange={e => setBranding({ ...branding, promoVideoUrl: e.target.value })} />
        </div>

        <div className="section">
          <h3>Monetization & Affiliates</h3>
          <input name="price" type="number" placeholder="Price" value={pricing.price} onChange={e => setPricing({ ...pricing, price: Number(e.target.value) })} />
          <input name="discountPercent" type="number" placeholder="Discount %" value={pricing.discountPercent} onChange={e => setPricing({ ...pricing, discountPercent: Number(e.target.value) })} />
          <input name="affiliateCommissionPercent" type="number" placeholder="Affiliate Commission %" value={pricing.affiliateCommissionPercent} onChange={e => setPricing({ ...pricing, affiliateCommissionPercent: Number(e.target.value) })} />
        </div>

        <div className="section">
          <h3>Curriculum</h3>
          {lessons.map((l, idx) => (
            <div key={idx} className="lesson-editor">
              <input placeholder="Lesson title" value={l.title} onChange={e => updateLesson(idx, 'title', e.target.value)} required />
              <select value={l.type} onChange={e => updateLesson(idx, 'type', e.target.value)}>
                <option value="video">Video</option>
                <option value="reading">Reading</option>
                <option value="quiz">Quiz</option>
              </select>
              {l.type === 'video' && (
                <>
                  <input placeholder="Video URL" value={l.videoUrl} onChange={e => updateLesson(idx, 'videoUrl', e.target.value)} />
                  <input placeholder="Embed URL (YouTube/Vimeo)" value={l.embedUrl} onChange={e => updateLesson(idx, 'embedUrl', e.target.value)} />
                </>
              )}
              {l.type === 'reading' && (
                <textarea placeholder="Lesson content (markdown/plain)" value={l.textContent} onChange={e => updateLesson(idx, 'textContent', e.target.value)} />
              )}
              <input type="number" placeholder="Duration (seconds)" value={l.durationSeconds} onChange={e => updateLesson(idx, 'durationSeconds', Number(e.target.value))} />
              <label>
                <input type="checkbox" checked={l.freePreview} onChange={e => updateLesson(idx, 'freePreview', e.target.checked)} />
                Free preview
              </label>
              <button type="button" onClick={() => removeLesson(idx)}>Remove lesson</button>
            </div>
          ))}
          <button type="button" onClick={addLesson}>+ Add lesson</button>
        </div>

        <div className="section">
          <h3>Tags</h3>
          <input placeholder="Comma-separated tags" value={tags} onChange={e => setTags(e.target.value)} />
        </div>

        <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Course'}</button>
      </form>
    </div>
  );
};

export default CreateCourse;