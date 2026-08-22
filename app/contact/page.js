'use client';

import { useState } from 'react';
import Link from 'next/link';
import { showToast } from '@/components/Toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast('Message sent! We will get back to you shortly. ✨');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      <div className="page-header">
        <div className="breadcrumb" style={{ justifyContent: 'center' }}>
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <span>Contact Us</span>
        </div>
        <h1>Get In Touch</h1>
        <p>Have a question or request a custom beaded design? We're here to help.</p>
      </div>

      <div className="contact-page">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-form-card">
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', marginBottom: '20px' }}>Send Us a Message</h3>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Ayesha Khan"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    placeholder="Custom Order / Inquiry"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Tell us how we can help..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="form-input"
                  ></textarea>
                </div>
                <button type="submit" className="btn-primary btn-block">
                  <span>Send Message</span>
                </button>
              </form>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-item">
                <div className="contact-info-icon">📍</div>
                <div>
                  <h4>Studio Location</h4>
                  <p>Mehmoodabad, Karachi, Pakistan</p>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-info-icon">💬</div>
                <div>
                  <h4>WhatsApp & Phone</h4>
                  <p>+92 3462910394</p>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-info-icon">✉️</div>
                <div>
                  <h4>Email Assistance</h4>
                  <p>azeebrandoffical@gmail.com</p>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-info-icon">🕒</div>
                <div>
                  <h4>Business Hours</h4>
                  <p>Monday – Saturday: 10:00 AM – 8:00 PM (PKT)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
