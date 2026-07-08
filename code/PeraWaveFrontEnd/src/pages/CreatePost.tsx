import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/forum.css';
import '../styles/home.css';
// import logo from '../assets/PeraWaveLogo.png';
import { API_URL } from '../config';
import { getToken, clearToken } from '../utils/auth';

type Visibility = 'UNIVERSITY_WIDE' | 'FACULTY_ONLY' | 'BATCH_ONLY';

const IconGlobe = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'24px',height:'24px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>;
const IconBuilding = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'24px',height:'24px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>;
const IconAcademic = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'24px',height:'24px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>;

const VISIBILITY_OPTIONS: { value: Visibility; label: string; icon: () => React.ReactElement; desc: string }[] = [
  { value: 'UNIVERSITY_WIDE', label: 'University-Wide', icon: IconGlobe, desc: 'Visible to all users' },
  { value: 'FACULTY_ONLY', label: 'Faculty-Only', icon: IconBuilding, desc: 'Visible to your faculty' },
  { value: 'BATCH_ONLY', label: 'Batch-Only', icon: IconAcademic, desc: 'Visible to your batch' },
];

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('UNIVERSITY_WIDE');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { navigate('/login'); return; }

    fetch(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const isSuspended = data.suspendedUntil && new Date(data.suspendedUntil) > new Date();
        if (isSuspended) { navigate('/home'); return; }
        setUser(data);
      })
      .catch(() => { clearToken(); navigate('/login'); });
  }, [navigate]);

  const handleLogout = () => {
    clearToken();
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) { setError('Please enter a title for your post.'); return; }
    if (!content.trim()) { setError('Please enter some content for your post.'); return; }

    const token = getToken();
    if (!token) { navigate('/login'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/forum/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, content, visibility, isAnonymous }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to create post.'); return; }

      navigate(`/post/${data.post.id}`);
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forum-page">
      {/* Navbar */}
      <Navbar
        isLoggedIn={true}
        onLogout={handleLogout}
        userName={user?.fullName}
        userAvatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName}`}
        userRole={user?.role}
      />

      <div className="forum-layout">
        <form className="cp-card" onSubmit={handleSubmit}>
          {/* Card Header */}
          <div className="cp-card-header">
            <h1>Create a New Forum</h1>
            <p>Share your thoughts, questions, or announcements with the PeraWave community.</p>
          </div>

          <div className="cp-card-body">
            {/* Error */}
            {error && (
              <div className="cp-error">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Title */}
            <div className="cp-field">
              <label className="cp-label" htmlFor="post-title">Forum Title</label>
              <input
                id="post-title"
                className="cp-input"
                type="text"
                placeholder="Write a clear and descriptive title..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={200}
              />
            </div>

            {/* Content */}
            <div className="cp-field">
              <label className="cp-label" htmlFor="post-content">Content</label>
              <textarea
                id="post-content"
                className="cp-textarea"
                placeholder="Describe your topic in detail. Be respectful and constructive."
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={7}
              />
            </div>

            {/* Visibility */}
            <div className="cp-field">
              <label className="cp-label">Visibility</label>
              <div className="cp-visibility-group">
                {VISIBILITY_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    id={`vis-${opt.value.toLowerCase()}`}
                    className={`cp-vis-btn${visibility === opt.value ? ' active' : ''}`}
                    onClick={() => setVisibility(opt.value)}
                  >
                    <span className="cp-vis-icon"><opt.icon /></span>
                    <span className="cp-vis-label">{opt.label}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2px' }}>{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div
              className={`cp-anon-row${isAnonymous ? ' anon-on' : ''}`}
              onClick={() => setIsAnonymous(v => !v)}
              role="switch"
              aria-checked={isAnonymous}
              id="anon-toggle"
            >
              <div className={`cp-toggle-track${isAnonymous ? ' on' : ''}`}>
                <div className={`cp-toggle-thumb${isAnonymous ? ' on' : ''}`} />
              </div>
              <div className="cp-anon-info">
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'18px',height:'18px', color: 'var(--text-muted)'}}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                  Post Anonymously
                </h4>
                <p>
                  Your name won't be shown to other users.{' '}
                </p>
              </div>
            </div>

            {/* Preview Strip */}
            <div style={{ background: '#f8fafc', border: '1.5px dashed #e2e8f0', borderRadius: '10px', padding: '14px 18px' }}>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>Preview</p>
              <p style={{ margin: '0 0 6px', fontSize: '14px', color: '#64748b' }}>
                Posting as: <strong style={{ color: '#1e293b' }}>{isAnonymous ? 'Anonymous' : (user?.fullName || '...')}</strong>
                {isAnonymous && (
                  <span style={{ marginLeft: '8px', fontSize: '11px', background: '#fef9c3', color: '#854d0e', padding: '2px 8px', borderRadius: '999px', fontWeight: 700 }}>
                    {user?.fullName}
                  </span>
                )}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Visibility: <strong style={{ color: '#1e293b' }}>{VISIBILITY_OPTIONS.find(o => o.value === visibility)?.label}</strong>
              </p>
            </div>

            {/* Actions */}
            <div className="cp-actions">
              <button type="button" className="cp-cancel-btn" onClick={() => navigate(user?.role === 'MODERATOR' ? '/mod-home' : '/home')}>
                Cancel
              </button>
              <button type="submit" className="cp-submit-btn" disabled={loading} id="submit-post-btn">
                {loading ? 'Posting...' : 'Publish Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
