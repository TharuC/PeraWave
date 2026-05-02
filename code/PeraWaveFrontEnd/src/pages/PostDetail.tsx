import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/forum.css';
import '../styles/home.css';
import logo from '../assets/PeraWaveLogo.png';

const VISIBILITY_LABELS: Record<string, { label: string; cls: string; icon: string }> = {
  UNIVERSITY_WIDE: { label: 'University-Wide', cls: 'univ',    icon: '🌐' },
  FACULTY_ONLY:    { label: 'Faculty-Only',    cls: 'faculty', icon: '🏛️' },
  BATCH_ONLY:      { label: 'Batch-Only',      cls: 'batch',   icon: '🎓' },
};

const PostDetail: React.FC = () => {
  const { id }    = useParams<{ id: string }>();
  const navigate  = useNavigate();

  const [post,           setPost]           = useState<any>(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState('');
  const [commentText,    setCommentText]    = useState('');
  const [commentAnon,    setCommentAnon]    = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [voteLoading,    setVoteLoading]    = useState(false);
  const [currentUser,    setCurrentUser]    = useState<any>(null);
  const [isMod,          setIsMod]          = useState(false);

  const token = localStorage.getItem('token');

  const fetchPost = useCallback(async () => {
    if (!token) { navigate('/login'); return; }
    setLoading(true);
    try {
      const res  = await fetch(`http://localhost:5000/api/forum/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) { setError('Post not found or you do not have access.'); return; }
      const data = await res.json();
      setPost(data);
    } catch {
      setError('Failed to load post. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [id, token, navigate]);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    // Fetch current user info
    fetch('http://localhost:5000/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setCurrentUser(data);
        setIsMod(data.role === 'MODERATOR');
      })
      .catch(() => { localStorage.removeItem('token'); navigate('/login'); });

    fetchPost();
  }, [fetchPost, token, navigate]);

  const handleVote = async (value: 1 | -1) => {
    if (!token || voteLoading) return;
    setVoteLoading(true);
    try {
      const res  = await fetch(`http://localhost:5000/api/forum/posts/${id}/vote`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ value }),
      });
      const data = await res.json();
      if (res.ok) {
        setPost((prev: any) => ({
          ...prev,
          upvotes:  data.upvotes,
          userVote: prev.userVote === value ? 0 : value,
        }));
      }
    } finally {
      setVoteLoading(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !token) return;
    setCommentLoading(true);
    try {
      const res  = await fetch(`http://localhost:5000/api/forum/posts/${id}/comments`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ content: commentText, isAnonymous: commentAnon }),
      });
      if (res.ok) {
        setCommentText('');
        setCommentAnon(false);
        await fetchPost(); // Refresh to show new comment
      }
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this post permanently? This cannot be undone.')) return;
    const res = await fetch(`http://localhost:5000/api/forum/posts/${id}`, {
      method:  'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) navigate('/home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins  = Math.floor(diff / 60000);
    if (mins < 1)  return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs  < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) return (
    <div className="forum-page">
      <div className="pd-loading">⏳ Loading post…</div>
    </div>
  );

  if (error) return (
    <div className="forum-page">
      <div className="forum-layout">
        <div className="cp-error">⚠️ {error}</div>
        <button className="pd-back-btn" onClick={() => navigate('/home')}>← Back to Home</button>
      </div>
    </div>
  );

  const vis = post ? VISIBILITY_LABELS[post.visibility] : null;

  return (
    <div className="forum-page">
      {/* Navbar */}
      <Navbar
        isLoggedIn={true}
        onLogout={handleLogout}
        userName={currentUser?.fullName}
        userAvatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.fullName}`}
      />

      <div className="forum-layout">
        {/* Back button */}
        <button className="pd-back-btn" onClick={() => navigate('/home')}>
          ← Back to Feed
        </button>

        {/* Post Card */}
        <div className="pd-card">
          {/* Meta row */}
          <div className="pd-meta">
            {vis && (
              <span className={`pd-badge ${vis.cls}`}>{vis.icon} {vis.label}</span>
            )}
            {post.isAnonymous && (
              <span className="pd-badge anon">🎭 Anonymous</span>
            )}
            {post.faculty && (
              <span style={{ fontSize: '12px', color: '#64748b' }}>📚 {post.faculty}</span>
            )}
            {post.batch && post.visibility === 'BATCH_ONLY' && (
              <span style={{ fontSize: '12px', color: '#64748b' }}>🎓 Batch {post.batch}</span>
            )}
          </div>

          <h1 className="pd-title">{post.title}</h1>

          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.isAnonymous ? 'anon' : post.displayName}`}
              alt="Author"
              style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #e2e8f0' }}
            />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {post.displayName}
                {isMod && post.isAnonymous && post.realName && (
                  <span className="mod-reveal-badge">🔑 {post.realName} ({post.realEmail})</span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{timeAgo(post.createdAt)}</div>
            </div>
          </div>

          <p className="pd-content">{post.content}</p>

          {/* Actions */}
          <div className="pd-actions">
            <div className="pd-vote-group">
              <button
                className={`pd-vote-btn up${post.userVote === 1 ? ' voted' : ''}`}
                onClick={() => handleVote(1)}
                disabled={voteLoading}
                id="upvote-btn"
                title="Upvote"
              >
                ▲
              </button>
              <span className="pd-vote-count">{post.upvotes}</span>
              <button
                className={`pd-vote-btn down${post.userVote === -1 ? ' voted' : ''}`}
                onClick={() => handleVote(-1)}
                disabled={voteLoading}
                id="downvote-btn"
                title="Downvote"
              >
                ▼
              </button>
            </div>
            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600 }}>
              💬 {post.comments?.length ?? 0} {post.comments?.length === 1 ? 'Comment' : 'Comments'}
            </span>

            {isMod && (
              <button
                onClick={handleDeletePost}
                style={{ marginLeft: 'auto', padding: '8px 16px', background: '#fef2f2', color: '#ef4444', border: '1.5px solid #fecaca', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                id="mod-delete-post-btn"
              >
                🗑️ Remove Post
              </button>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="pd-comments-section">
          <h2 className="pd-comments-title">💬 Discussion</h2>

          {/* Add Comment Box */}
          {!isMod && (
            <form className="pd-comment-box" onSubmit={handleComment}>
              <textarea
                id="comment-input"
                placeholder="Add a comment… Be respectful and constructive."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
              />
              <div className="pd-comment-footer">
                <label className="pd-anon-check" htmlFor="comment-anon-toggle">
                  <input
                    type="checkbox"
                    id="comment-anon-toggle"
                    checked={commentAnon}
                    onChange={e => setCommentAnon(e.target.checked)}
                  />
                  🎭 Comment anonymously
                </label>
                <button
                  type="submit"
                  className="pd-comment-submit"
                  disabled={commentLoading || !commentText.trim()}
                  id="submit-comment-btn"
                >
                  {commentLoading ? 'Posting…' : 'Post Comment'}
                </button>
              </div>
            </form>
          )}

          {/* Comment List */}
          <div className="pd-comment-list">
            {(!post.comments || post.comments.length === 0) ? (
              <div className="pd-empty-comments">No comments yet. Be the first to respond! 🎉</div>
            ) : (
              post.comments.map((c: any) => (
                <div key={c.id} className="pd-comment-item">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.isAnonymous ? `anon-${c.id}` : c.displayName}`}
                    alt=""
                    className="pd-comment-avatar"
                  />
                  <div className="pd-comment-bubble">
                    <div className="pd-comment-author">
                      {c.displayName}
                      <span className="pd-comment-time">{timeAgo(c.createdAt)}</span>
                    </div>
                    <div className="pd-comment-text">{c.content}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
