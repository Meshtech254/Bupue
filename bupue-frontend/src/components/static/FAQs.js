import React from 'react';
import './FAQs.css';

const FAQs = () => {
  return (
    <div className="faqs-container">
      <header className="faqs-header">
        <h1>📌 Bupue Platform FAQs</h1>
        <p>Answers to common questions about using Bupue</p>
      </header>

      <section className="faq-section">
        <h2>🔹 General</h2>

        <div className="faq-item">
          <div className="faq-q">What is Bupue?</div>
          <div className="faq-a">
            Bupue is a digital platform that connects learners, creators, entrepreneurs, and mentors.
            It allows users to access courses, mentorship, events, and digital storefronts in one place.
          </div>
        </div>

        <div className="faq-item">
          <div className="faq-q">Who can use Bupue?</div>
          <div className="faq-a">
            Anyone — learners seeking skills, creators offering content, entrepreneurs running businesses,
            and mentors providing guidance.
          </div>
        </div>

        <div className="faq-item">
          <div className="faq-q">Is Bupue free to use?</div>
          <div className="faq-a">
            Yes. Learners/buyers can join for free. Creators and entrepreneurs can upgrade to paid plans for more features.
          </div>
        </div>

        <div className="faq-item">
          <div className="faq-q">How do I sign up?</div>
          <div className="faq-a">
            You can register using your email, Google, or social media account directly on the platform.
          </div>
        </div>
      </section>

      <section className="faq-section">
        <h2>🔹 Learners</h2>

        <div className="faq-item">
          <div className="faq-q">How do I find courses or events?</div>
          <div className="faq-a">
            Use the search bar or browse categories to find what interests you.
          </div>
        </div>

        <div className="faq-item">
          <div className="faq-q">Do I have to pay for every course?</div>
          <div className="faq-a">
            Some courses/events are free, while others are paid depending on the creator.
          </div>
        </div>

        <div className="faq-item">
          <div className="faq-q">Can I access my purchased content anytime?</div>
          <div className="faq-a">
            Yes, once purchased, your content is available anytime from your dashboard.
          </div>
        </div>
      </section>

      <section className="faq-section">
        <h2>🔹 Creators</h2>

        <div className="faq-item">
          <div className="faq-q">How do I become a creator on Bupue?</div>
          <div className="faq-a">
            Sign up for a Creator or Pro plan and set up your profile.
          </div>
        </div>

        <div className="faq-item">
          <div className="faq-q">What can I sell on Bupue?</div>
          <div className="faq-a">
            Courses, digital products, event tickets, and services.
          </div>
        </div>

        <div className="faq-item">
          <div className="faq-q">How do I get paid?</div>
          <div className="faq-a">
            Payments are processed securely, and funds can be withdrawn to your bank or mobile money account.
          </div>
        </div>

        <div className="faq-item">
          <div className="faq-q">Can I promote my content?</div>
          <div className="faq-a">
            Yes. Pro users can access featured boosts to reach more people.
          </div>
        </div>
      </section>

      <section className="faq-section">
        <h2>🔹 Entrepreneurs</h2>

        <div className="faq-item">
          <div className="faq-q">What is a digital storefront?</div>
          <div className="faq-a">
            It’s your online shop on Bupue where you can sell products, services, or event tickets.
          </div>
        </div>

        <div className="faq-item">
          <div className="faq-q">Can I manage my business team on Bupue?</div>
          <div className="faq-a">
            Yes. Pro accounts allow team collaboration and advanced tools.
          </div>
        </div>
      </section>

      <section className="faq-section">
        <h2>🔹 Mentors</h2>

        <div className="faq-item">
          <div className="faq-q">How do I become a mentor?</div>
          <div className="faq-a">
            Apply through the mentorship section. After approval, you can offer one-on-one or group sessions.
          </div>
        </div>

        <div className="faq-item">
          <div className="faq-q">Do mentors get paid?</div>
          <div className="faq-a">
            Yes. You can set your own fees, or volunteer if you wish to mentor for free.
          </div>
        </div>
      </section>

      <section className="faq-section">
        <h2>🔹 Subscriptions & Pricing</h2>

        <div className="faq-item">
          <div className="faq-q">What are the available plans?</div>
          <div className="faq-a">
            Free (learners/buyers), Creator ($15/month), Pro ($39/month).
          </div>
        </div>

        <div className="faq-item">
          <div className="faq-q">Can I cancel anytime?</div>
          <div className="faq-a">
            Yes, you can downgrade or cancel your subscription anytime.
          </div>
        </div>
      </section>

      <section className="faq-section">
        <h2>🔹 Security & Support</h2>

        <div className="faq-item">
          <div className="faq-q">Is my data safe on Bupue?</div>
          <div className="faq-a">
            Yes. We use encryption and secure payment methods to protect users.
          </div>
        </div>

        <div className="faq-item">
          <div className="faq-q">What if I have a problem with a course or payment?</div>
          <div className="faq-a">
            Contact support through the Help Center or chat, and we’ll assist you.
          </div>
        </div>

        <div className="faq-item">
          <div className="faq-q">How do I report inappropriate content?</div>
          <div className="faq-a">
            Each course, event, or profile has a “Report” button. Our team reviews reports quickly.
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQs;