import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/client';
import './Home.css';

const Home = () => {
  const [popularContent, setPopularContent] = useState({
    courses: [],
    events: [],
    items: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPopularContent();
  }, []);

  const fetchPopularContent = async () => {
    try {
      setLoading(true);
      // Fetch popular courses, events, and marketplace items
      const [coursesRes, eventsRes, itemsRes] = await Promise.all([
        apiClient.get('/api/courses?sort=rating_desc&limit=3'),
        apiClient.get('/api/posts?sort=rating_desc&limit=3'),
        apiClient.get('/api/items?sort=rating_desc&limit=3')
      ]);

      setPopularContent({
        courses: coursesRes.data,
        events: eventsRes.data,
        items: itemsRes.data
      });
    } catch (error) {
      console.error('Failed to fetch popular content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Learn, Create, Sell, and Connect</h1>
          <h2>All in One Place</h2>
          <p className="hero-subtitle">
            Join thousands of learners and creators building their future on Bupue
          </p>
          <div className="hero-actions">
            <Link to="/register" className="cta-button primary">Get Started</Link>
            <Link to="/courses" className="cta-button secondary">Browse Courses</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-illustration">
            <div className="floating-card courses">📚</div>
            <div className="floating-card events">🎯</div>
            <div className="floating-card marketplace">🛒</div>
            <div className="floating-card community">👥</div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="features">
        <div className="container">
          <h2>Why Choose Bupue?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <h3>Learn from Experts</h3>
              <p>Access high-quality courses from industry professionals and thought leaders</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎪</div>
              <h3>Join Amazing Events</h3>
              <p>Connect with like-minded people at workshops, meetups, and conferences</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Sell Your Creations</h3>
              <p>Turn your skills into income with our marketplace for digital and physical products</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Connect & Grow</h3>
              <p>Build meaningful relationships with mentors, collaborators, and peers</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Create your account in seconds and start your journey</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Browse or Create</h3>
              <p>Explore existing content or share your knowledge with the world</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Learn, Sell & Grow</h3>
              <p>Build skills, generate income, and expand your network</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Content Preview */}
      <section className="popular-content">
        <div className="container">
          <h2>Trending Now</h2>
          <div className="content-tabs">
            <div className="tab-content active" id="courses-tab">
              <div className="content-grid">
                {loading ? (
                  <div className="loading">Loading popular content...</div>
                ) : (
                  popularContent.courses.map(course => (
                    <div key={course._id} className="content-card">
                      <h4>{course.title}</h4>
                      <p>{course.description.slice(0, 80)}...</p>
                      <div className="content-meta">
                        <span className="price">${course.price}</span>
                        <span className="rating">★ {course.averageRating || 'New'}</span>
                      </div>
                      <Link to={`/courses/${course._id}`} className="view-more">View Course</Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="view-all-section">
            <Link to="/courses" className="view-all-button">View All Courses</Link>
            <Link to="/events" className="view-all-button">View All Events</Link>
            <Link to="/marketplace" className="view-all-button">View Marketplace</Link>
          </div>
        </div>
      </section>

      {/* Creator/Mentor Spotlight */}
      <section className="creator-spotlight">
        <div className="container">
          <h2>Meet Our Top Creators</h2>
          <div className="creators-grid">
            <div className="creator-card">
              <div className="creator-avatar">👨‍💻</div>
              <h3>Alex Chen</h3>
              <p className="creator-title">Web Development Expert</p>
              <p className="creator-stats">15 courses • 2,500+ students</p>
              <p className="creator-bio">Former Google engineer helping developers level up their skills</p>
            </div>
            <div className="creator-card">
              <div className="creator-avatar">🎨</div>
              <h3>Sarah Kim</h3>
              <p className="creator-title">Digital Marketing Specialist</p>
              <p className="creator-stats">12 courses • 1,800+ students</p>
              <p className="creator-bio">Award-winning marketer with 10+ years of agency experience</p>
            </div>
            <div className="creator-card">
              <div className="creator-avatar">🚀</div>
              <h3>Mike Rodriguez</h3>
              <p className="creator-title">Startup Mentor</p>
              <p className="creator-stats">8 courses • 1,200+ students</p>
              <p className="creator-bio">Serial entrepreneur who's helped launch 50+ successful startups</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="social-proof">
        <div className="container">
          <h2>What Our Community Says</h2>
          <div className="testimonials">
            <div className="testimonial">
              <div className="testimonial-content">
                "Bupue helped me launch my first online course. I've earned over $15,000 in just 6 months!"
              </div>
              <div className="testimonial-author">
                <strong>Emma Thompson</strong>
                <span>Course Creator</span>
              </div>
            </div>
            <div className="testimonial">
              <div className="testimonial-content">
                "The networking events are incredible. I found my co-founder at a Bupue startup meetup!"
              </div>
              <div className="testimonial-author">
                <strong>David Park</strong>
                <span>Tech Entrepreneur</span>
              </div>
            </div>
            <div className="testimonial">
              <div className="testimonial-content">
                "I learned web development from scratch and landed my dream job within 3 months."
              </div>
              <div className="testimonial-author">
                <strong>Lisa Chen</strong>
                <span>Junior Developer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="final-cta">
        <div className="container">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join thousands of learners and creators building their future on Bupue</p>
          <div className="cta-buttons">
            <Link to="/register" className="cta-button primary large">Create Your Account</Link>
            <Link to="/courses" className="cta-button secondary large">Explore Content</Link>
          </div>
          <p className="cta-note">Free to join • No credit card required</p>
        </div>
      </section>
    </div>
  );
};

export default Home; 