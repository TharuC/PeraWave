import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_URL } from '../config';
import { getToken, clearToken } from '../utils/auth';
import userAvatarImg from '../assets/UserAvatar.png';
import '../styles/create-event.css';

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    eventDate: '',
    eventTime: '',
    location: '',
    link: '',
    organizerName: '',
  });
  const [flyer, setFlyer] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFlyer(file);
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title || !form.description || !form.eventDate || !form.eventTime || !form.location) {
      setError('Please fill in all required fields.');
      return;
    }

    const token = getToken();
    if (!token) { navigate('/login'); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('eventDate', form.eventDate);
      fd.append('eventTime', form.eventTime);
      fd.append('location', form.location);
      if (form.organizerName) fd.append('organizerName', form.organizerName);
      if (form.link) fd.append('link', form.link);
      if (flyer) fd.append('flyer', flyer);

      const res = await fetch(`${API_URL}/api/events`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit event.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="create-event-page">
        <Navbar isLoggedIn onLogout={() => { clearToken(); navigate('/'); }} userName="" userAvatar={userAvatarImg} notifications={[]} unreadCount={0} onMarkAllRead={() => {}} userRole="USER" />
        <div className="create-event-container">
          <div className="ce-success-card">
            <div className="ce-success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2>Event Submitted!</h2>
            <p>Your event is pending moderator approval. It will appear on the Events page once approved.</p>
            <div className="ce-success-actions">
              <button className="ce-btn-primary" onClick={() => navigate('/events')}>View Events</button>
              <button className="ce-btn-secondary" onClick={() => { setSuccess(false); setForm({ title: '', description: '', eventDate: '', eventTime: '', location: '', link: '', organizerName: '' }); setFlyer(null); setPreview(null); }}>
                Submit Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-event-page">
      <Navbar isLoggedIn onLogout={() => { clearToken(); navigate('/'); }} userName="" userAvatar={userAvatarImg} notifications={[]} unreadCount={0} onMarkAllRead={() => {}} userRole="USER" />

      <div className="create-event-container">
        <div className="ce-card">
          {/* Header */}
          <div className="ce-header">
            <button className="ce-back-btn" onClick={() => navigate('/events')}>← Back to Events</button>
            <h1 className="ce-title">Submit an Event</h1>
            <p className="ce-subtitle">Your submission will be reviewed by a moderator before it's published.</p>
          </div>

          <form className="ce-form" onSubmit={handleSubmit}>
            {/* Flyer upload */}
            <div className="ce-field">
              <label className="ce-label">Event Flyer <span className="ce-optional">(optional)</span></label>
              <div
                className={`ce-upload-zone ${preview ? 'has-preview' : ''}`}
                onClick={() => fileRef.current?.click()}
              >
                {preview ? (
                  <img src={preview} alt="Flyer preview" className="ce-preview-img" />
                ) : (
                  <div className="ce-upload-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span>Click to upload flyer</span>
                    <small>PNG, JPG, WebP — max 10 MB</small>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFile}
                style={{ display: 'none' }}
              />
              {flyer && (
                <button type="button" className="ce-remove-img" onClick={() => { setFlyer(null); setPreview(null); }}>
                  ✕ Remove image
                </button>
              )}
            </div>

            {/* Title */}
            <div className="ce-field">
              <label className="ce-label" htmlFor="ce-title">Event Title <span className="ce-required">*</span></label>
              <input
                id="ce-title"
                name="title"
                className="ce-input"
                type="text"
                placeholder="e.g. Annual Tech Exhibition 2026"
                value={form.title}
                onChange={handleChange}
                maxLength={120}
              />
            </div>

            {/* Organizer Name */}
            <div className="ce-field">
              <label className="ce-label" htmlFor="ce-organizer-name">
                Organizer Name <span className="ce-optional">(optional)</span>
              </label>
              <input
                id="ce-organizer-name"
                name="organizerName"
                className="ce-input"
                type="text"
                placeholder="e.g. IEEE Student Branch, Faculty of Engineering"
                value={form.organizerName}
                onChange={handleChange}
                maxLength={120}
              />
              <small style={{ color: 'var(--text-muted, #8c959f)', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                If left blank, your account name will be shown as the organizer.
              </small>
            </div>

            {/* Description */}
            <div className="ce-field">
              <label className="ce-label" htmlFor="ce-desc">Description <span className="ce-required">*</span></label>
              <textarea
                id="ce-desc"
                name="description"
                className="ce-input ce-textarea"
                placeholder="Describe the event, who it's for, and what attendees can expect..."
                value={form.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            {/* Date + Time */}
            <div className="ce-row">
              <div className="ce-field">
                <label className="ce-label" htmlFor="ce-date">Date <span className="ce-required">*</span></label>
                <input
                  id="ce-date"
                  name="eventDate"
                  className="ce-input"
                  type="date"
                  value={form.eventDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="ce-field">
                <label className="ce-label" htmlFor="ce-time">Time <span className="ce-required">*</span></label>
                <input
                  id="ce-time"
                  name="eventTime"
                  className="ce-input"
                  type="time"
                  value={form.eventTime}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Location */}
            <div className="ce-field">
              <label className="ce-label" htmlFor="ce-location">Location <span className="ce-required">*</span></label>
              <input
                id="ce-location"
                name="location"
                className="ce-input"
                type="text"
                placeholder="e.g. Main Auditorium, Faculty of Engineering"
                value={form.location}
                onChange={handleChange}
              />
            </div>

            {/* Link */}
            <div className="ce-field">
              <label className="ce-label" htmlFor="ce-link">Registration / More Info Link <span className="ce-optional">(optional)</span></label>
              <input
                id="ce-link"
                name="link"
                className="ce-input"
                type="url"
                placeholder="https://example.com/event"
                value={form.link}
                onChange={handleChange}
              />
            </div>

            {error && <div className="ce-error">{error}</div>}

            <button
              type="submit"
              className="ce-submit-btn"
              id="ce-submit"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
