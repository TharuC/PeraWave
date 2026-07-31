import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_URL } from '../config';
import { getToken, clearToken } from '../utils/auth';
import '../styles/wiki.css';

const MAX_IMAGES = 5;

const CreateWikiArticle: React.FC = () => {
  const navigate = useNavigate();

  // ── Auth guard: redirect to login immediately if not logged in ──────────────
  useEffect(() => {
    if (!getToken()) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const [form, setForm] = useState({ title: '', content: '', location: '' });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const available = MAX_IMAGES - images.length;
    const toAdd = selected.slice(0, available);

    toAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setPreviews(p => [...p, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
    setImages(prev => [...prev, ...toAdd]);

    // Reset input so the same file can be re-selected if removed
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim() || !form.content.trim()) {
      setError('Title and content are required.');
      return;
    }

    const token = getToken();
    if (!token) { navigate('/login'); return; }

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title.trim());
      fd.append('content', form.content.trim());
      if (form.location.trim()) fd.append('location', form.location.trim());
      images.forEach(img => fd.append('images', img));

      const res = await fetch(`${API_URL}/api/wiki`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit article.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setForm({ title: '', content: '', location: '' });
    setImages([]);
    setPreviews([]);
    setError('');
  };

  if (success) {
    return (
      <div className="wiki-create-page">
        <Navbar isLoggedIn onLogout={() => { clearToken(); navigate('/'); }} userName="" userAvatar="" notifications={[]} unreadCount={0} onMarkAllRead={() => {}} userRole="USER" />
        <div className="wiki-create-container">
          <div className="wiki-success-card">
            <div className="wiki-success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2>Article Submitted!</h2>
            <p>
              Your article is now pending moderator review. Once approved, it will appear
              in the Pera Wiki for everyone to read.
            </p>
            <div className="wiki-success-actions">
              <button className="wiki-btn-primary" onClick={() => navigate('/wiki')}>Browse Wiki</button>
              <button className="wiki-btn-secondary" onClick={resetForm}>Submit Another</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wiki-create-page">
      <Navbar
        isLoggedIn
        onLogout={() => { clearToken(); navigate('/'); }}
        userName=""
        userAvatar=""
        notifications={[]}
        unreadCount={0}
        onMarkAllRead={() => {}}
        userRole="USER"
      />

      <div className="wiki-create-container">
        <div className="wiki-create-card">
          <button className="wiki-create-back" onClick={() => navigate('/wiki')}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 14, height: 14 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Wiki
          </button>

          <h1 className="wiki-create-title-h1">Write a Wiki Article</h1>
          <p className="wiki-create-subtitle">
            Document a historical or important place within the University of Peradeniya.
            Your submission will be reviewed by a moderator before publishing.
          </p>

          <form className="wiki-form" onSubmit={handleSubmit} id="wiki-article-form">
            {/* Title */}
            <div className="wiki-field">
              <label className="wiki-label" htmlFor="wiki-title">
                Title <span className="wiki-req">*</span>
              </label>
              <input
                id="wiki-title"
                name="title"
                className="wiki-input"
                type="text"
                placeholder="e.g. The Great Hall of Peradeniya"
                value={form.title}
                onChange={handleChange}
                maxLength={200}
              />
            </div>

            {/* Location */}
            <div className="wiki-field">
              <label className="wiki-label" htmlFor="wiki-location">
                Campus Location <span className="wiki-opt">(optional)</span>
              </label>
              <input
                id="wiki-location"
                name="location"
                className="wiki-input"
                type="text"
                placeholder="e.g. Faculty of Arts, Near Main Entrance"
                value={form.location}
                onChange={handleChange}
                maxLength={200}
              />
            </div>

            {/* Content */}
            <div className="wiki-field">
              <label className="wiki-label" htmlFor="wiki-content">
                Article Content <span className="wiki-req">*</span>
              </label>
              <textarea
                id="wiki-content"
                name="content"
                className="wiki-textarea"
                placeholder="Describe the history, significance, and any interesting facts about this place…"
                value={form.content}
                onChange={handleChange}
                rows={10}
              />
            </div>

            {/* Images */}
            <div className="wiki-field">
              <label className="wiki-label">
                Images <span className="wiki-opt">(up to {MAX_IMAGES})</span>
              </label>

              {images.length < MAX_IMAGES && (
                <div
                  className="wiki-upload-zone"
                  onClick={() => fileRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
                >
                  <div className="wiki-upload-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span>Click to upload images</span>
                    <small>PNG, JPG, WebP — max 10 MB each · {MAX_IMAGES - images.length} slot{MAX_IMAGES - images.length !== 1 ? 's' : ''} remaining</small>
                  </div>
                </div>
              )}

              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={handleFiles}
                style={{ display: 'none' }}
                id="wiki-image-input"
              />

              {previews.length > 0 && (
                <div className="wiki-image-previews">
                  {previews.map((src, idx) => (
                    <div key={idx} className="wiki-image-preview-item">
                      <img src={src} alt={`Preview ${idx + 1}`} />
                      <button
                        type="button"
                        className="wiki-remove-image-btn"
                        onClick={() => removeImage(idx)}
                        aria-label="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <div className="wiki-error">{error}</div>}

            <button
              type="submit"
              className="wiki-submit-btn"
              id="wiki-submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Submitting…' : 'Submit for Approval'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateWikiArticle;
