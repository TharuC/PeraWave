import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/forum.css';
import '../styles/home.css';
import logo from '../assets/PeraWaveLogo.png';

type Visibility = 'UNIVERSITY_WIDE' | 'FACULTY_ONLY' | 'BATCH_ONLY';

const VISIBILITY_OPTIONS: { value: Visibility; label: string; icon: string; desc: string }[] = [
  { value: 'UNIVERSITY_WIDE', label: 'University-Wide', icon: '🌐', desc: 'Visible to all users' },
  { value: 'FACULTY_ONLY', label: 'Faculty-Only', icon: '🏛️', desc: 'Visible to your faculty' },
  { value: 'BATCH_ONLY', label: 'Batch-Only', icon: '🎓', desc: 'Visible to your batch' },
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
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    fetch('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const isSuspended = data.suspendedUntil && new Date(data.suspendedUntil) > new Date();
        if (isSuspended) { navigate('/home'); return; }
        setUser(data);
      })
      .catch(() => { localStorage.removeItem('token'); navigate('/login'); });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) { setError('Please enter a title for your post.'); return; }
    if (!content.trim()) { setError('Please enter some content for your post.'); return; }

    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/forum/posts', {
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
                    <span className="cp-vis-icon">{opt.icon}</span>
                    <span className="cp-vis-label">{opt.label}</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8', textAlign: 'center' }}>{opt.desc}</span>
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
                <h4>🎭 Post Anonymously</h4>
                <p>
                  Your name won't be shown to other users.{' '}
                  {isAnonymous && <strong style={{ color: '#15803d' }}>Moderators can still see your identity.</strong>}
                  {!isAnonymous && 'Moderators can always see your identity.'}
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
                    🔑 Mod-visible: {user?.fullName}
                  </span>
                )}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                Visibility: <strong style={{ color: '#1e293b' }}>{VISIBILITY_OPTIONS.find(o => o.value === visibility)?.label}</strong>
              </p>
            </div>

            {/* Actions */}
            <div className="cp-actions">
              <button type="button" className="cp-cancel-btn" onClick={() => navigate('/home')}>
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
