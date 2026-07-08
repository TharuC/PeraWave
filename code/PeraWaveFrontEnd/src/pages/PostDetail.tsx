import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ReportModal from '../components/ReportModal';
import '../styles/forum.css';
import '../styles/home.css';
// import logo from '../assets/PeraWaveLogo.png';
import userAvatarImg from '../assets/UserAvatar.png';
import { API_URL } from '../config';
import { getToken, clearToken } from '../utils/auth';

const IconGlobe = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'12px',height:'12px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>;
const IconBuilding = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'12px',height:'12px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>;
const IconAcademic = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'12px',height:'12px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>;
const IconMask = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'12px',height:'12px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" /></svg>;
const IconBook = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'12px',height:'12px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>;
const IconKey = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'12px',height:'12px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>;
const IconChat = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'16px',height:'16px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>;

const VISIBILITY_LABELS: Record<string, { label: string; cls: string; Icon: () => React.ReactElement }> = {
  UNIVERSITY_WIDE: { label: 'University-Wide', cls: 'univ', Icon: IconGlobe },
  FACULTY_ONLY: { label: 'Faculty-Only', cls: 'faculty', Icon: IconBuilding },
  BATCH_ONLY: { label: 'Batch-Only', cls: 'batch', Icon: IconAcademic },
};

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentAnon, setCommentAnon] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMod, setIsMod] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ type: 'POST' | 'COMMENT'; id: number } | null>(null);

  const token = getToken();

  const fetchPost = useCallback(async () => {
    if (!token) { navigate('/login'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/forum/posts/${id}`, {
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
    fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setCurrentUser(data);
        setIsMod(data.role === 'MODERATOR');
      })
      .catch(() => { clearToken(); navigate('/login'); });

    fetchPost();
  }, [fetchPost, token, navigate]);

  const handleVote = async (value: 1 | -1) => {
    if (!token || voteLoading) return;
    setVoteLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/forum/posts/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ value }),
      });
      const data = await res.json();
      if (res.ok) {
        setPost((prev: any) => ({
          ...prev,
          upvotes: data.upvotes,
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
      const res = await fetch(`${API_URL}/api/forum/posts/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: commentText, isAnonymous: commentAnon }),
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
    const res = await fetch(`${API_URL}/api/forum/posts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      navigate(isMod ? '/mod-home' : '/home');
    } else {
      alert('Failed to delete post.');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Delete this comment permanently?')) return;
    const res = await fetch(`${API_URL}/api/forum/comments/${commentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      await fetchPost();
    } else {
      alert('Failed to delete comment.');
    }
  };

  const handleLogout = () => {
    clearToken();
    navigate('/');
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) return (
    <div className="forum-page">
      <div className="pd-loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'20px',height:'20px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
        Loading post…
      </div>
    </div>
  );

  if (error) return (
    <div className="forum-page">
      <div className="forum-layout">
        <div className="cp-error" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'18px',height:'18px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
          {error}
        </div>
        <button className="pd-back-btn" onClick={() => navigate(isMod ? '/mod-home' : '/home')}>← Back to Home</button>
      </div>
    </div>
  );

  const vis = post ? VISIBILITY_LABELS[post.visibility] : null;

  return (
    <>
    <div className="forum-page">
      {/* Navbar */}
      <Navbar
        isLoggedIn={true}
        onLogout={handleLogout}
        userName={currentUser?.fullName}
        userAvatar={userAvatarImg}
        userRole={isMod ? 'MODERATOR' : 'USER'}
      />

      <div className="forum-layout">
        {/* Back button */}
        <button className="pd-back-btn" onClick={() => navigate(isMod ? '/mod-home' : '/home')}>
          ← Back to Feed
        </button>

        {/* Post Card */}
        <div className="pd-card">
          {/* Meta row */}
          <div className="pd-meta">
            {vis && (
              <span className={`pd-badge ${vis.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><vis.Icon /> {vis.label}</span>
            )}
            {post.isAnonymous && (
              <span className="pd-badge anon" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><IconMask /> Anonymous</span>
            )}
            {post.faculty && (
              <span style={{ fontSize: '12px', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><IconBook /> {post.faculty}</span>
            )}
            {post.batch && post.visibility === 'BATCH_ONLY' && (
              <span style={{ fontSize: '12px', color: '#64748b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><IconAcademic /> Batch {post.batch}</span>
            )}
          </div>

          <h1 className="pd-title">{post.title}</h1>

          {/* Author */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <img
                src={userAvatarImg}
                alt="Author"
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid #e2e8f0' }}
              />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {post.authorId && !post.isAnonymous ? (
                    <span
                      style={{ cursor: 'pointer', color: 'var(--accent-color, #0969da)', textDecoration: 'none' }}
                      onClick={() => navigate(`/user/${post.authorId}`)}
                      title="View profile"
                    >
                      {post.displayName}
                    </span>
                  ) : post.displayName}
                  {isMod && post.isAnonymous && post.realName && (
                    <span className="mod-reveal-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><IconKey /> {post.realName} ({post.realEmail})</span>
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
            <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <IconChat /> {post.comments?.length ?? 0} {post.comments?.length === 1 ? 'Comment' : 'Comments'}
            </span>

            {(isMod || post.isAuthor) && (
              <button
                onClick={handleDeletePost}
                style={{ marginLeft: 'auto', padding: '8px 16px', background: '#fef2f2', color: '#ef4444', border: '1.5px solid #fecaca', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
                id="delete-post-btn"
              >
                {isMod ? 'Remove Post (Mod)' : 'Delete Post'}
              </button>
            )}
            {!isMod && !post.isAuthor && (
              <button
                onClick={() => setReportTarget({ type: 'POST', id: post.id })}
                style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '8px 14px', background: '#fff5f5', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'13px',height:'13px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 011.743-1.342 48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664L19.5 19.5" /></svg>
                Report
              </button>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="pd-comments-section">
          <h2 className="pd-comments-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><IconChat /> Discussion</h2>

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
                  <IconMask /> Comment anonymously
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
              <div className="pd-empty-comments">No comments yet. Be the first to respond!</div>
            ) : (
              post.comments.map((c: any) => (
                <div key={c.id} className="pd-comment-item">
                  <img
                    src={userAvatarImg}
                    alt=""
                    className="pd-comment-avatar"
                  />
                  <div className="pd-comment-bubble">
                    <div className="pd-comment-author">
                      {c.displayName}
                      <span className="pd-comment-time">{timeAgo(c.createdAt)}</span>
                    </div>
                    <div className="pd-comment-text">{c.content}</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      {(isMod || c.isAuthor) && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          style={{ fontSize: '12px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                          Delete
                        </button>
                      )}
                      {!isMod && !c.isAuthor && (
                        <button
                          onClick={() => setReportTarget({ type: 'COMMENT', id: c.id })}
                          style={{ fontSize: '12px', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'11px',height:'11px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 011.743-1.342 48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664L19.5 19.5" /></svg>
                          Report
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
    {reportTarget && (
      <ReportModal
        contentType={reportTarget!.type}
        contentId={reportTarget!.id}
        onClose={() => setReportTarget(null)}
      />
    )}
    </>
  );
};

export default PostDetail;
