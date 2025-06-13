import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-container">
      <h1>Privacy Policy</h1>
      <div className="privacy-content">
        <section>
          <h2>1. Information We Collect</h2>
          <p>We collect information that you provide directly to us, including:</p>
          <ul>
            <li>Account information (name, email, password)</li>
            <li>Profile information (bio, profile picture)</li>
            <li>Content you create (posts, comments, courses)</li>
            <li>Transaction information (purchases, orders)</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Process your transactions</li>
            <li>Send you important updates and notifications</li>
            <li>Improve our services and user experience</li>
            <li>Protect against fraud and abuse</li>
          </ul>
        </section>

        <section>
          <h2>3. Data Security</h2>
          <p>We implement various security measures to protect your information:</p>
          <ul>
            <li>Encryption of sensitive data</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication</li>
            <li>Secure data storage and transmission</li>
          </ul>
        </section>

        <section>
          <h2>4. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Export your data</li>
          </ul>
        </section>

        <section>
          <h2>5. Cookies and Tracking</h2>
          <p>We use cookies and similar technologies to:</p>
          <ul>
            <li>Remember your preferences</li>
            <li>Analyze site usage</li>
            <li>Improve our services</li>
            <li>Provide personalized content</li>
          </ul>
        </section>

        <section>
          <h2>6. Third-Party Services</h2>
          <p>We may use third-party services that collect information:</p>
          <ul>
            <li>Payment processors</li>
            <li>Analytics services</li>
            <li>Cloud storage providers</li>
            <li>Email service providers</li>
          </ul>
        </section>

        <section>
          <h2>7. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at:</p>
          <ul>
            <li>Email: privacy@bupue.com</li>
            <li>Phone: +1 (555) 123-4567</li>
            <li>Address: 123 Security Street, Privacy City, PC 12345</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 