import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/home.css';
import '../styles/forum.css';
import userAvatarImg from '../assets/UserAvatar.png';

const VISIBILITY_LABELS: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  UNIVERSITY_WIDE: { label: 'University-Wide', color: '#1d4ed8', bg: '#dbeafe',  icon: '🌐' },
  FACULTY_ONLY:    { label: 'Faculty-Only',    color: '#6d28d9', bg: '#ede9fe',  icon: '🏛️' },
  BATCH_ONLY:      { label: 'Batch-Only',      color: '#92400e', bg: '#fef3c7',  icon: '🎓' },
};

const MyForums: React.FC = () => {
  const navigate = useNavigate();

  const [userName,     setUserName]     = useState('');
  const [myPosts,      setMyPosts]      = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState<'all' | 'UNIVERSITY_WIDE' | 'FACULTY_ONLY' | 'BATCH_ONLY'>('all');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [sortBy,       setSortBy]       = useState<'newest' | 'oldest' | 'mostVoted'>('newest');
  const [notifications, setNotifications] = useState<any[]>([]);

  const token = sessionStorage.getItem('token');

  const fetchData = useCallback(async () => {
    if (!token) { navigate('/login'); return; }
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);

    try {
      const [meRes, postsRes, notifRes] = await Promise.all([
        fetch('http://localhost:8080/api/auth/me',              { headers }),
        fetch('http://localhost:8080/api/forum/posts/my-posts', { headers }),
        fetch('http://localhost:8080/api/auth/notifications',   { headers }),
      ]);

      if (!meRes.ok) { sessionStorage.removeItem('token'); navigate('/login'); return; }
      const me = await meRes.json();
      setUserName(me.fullName || 'User');

      if (postsRes.ok) {
        const data = await postsRes.json();
        setMyPosts(Array.isArray(data) ? data : []);
      } else {
        // Fallback: filter all posts for isAuthor === true
        const allRes = await fetch('http://localhost:8080/api/forum/posts', { headers });
        if (allRes.ok) {
          const all = await allRes.json();
          setMyPosts(Array.isArray(all) ? all.filter((p: any) => p.isAuthor) : []);
        }
      }

      if (notifRes.ok) setNotifications(await notifRes.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = () => { sessionStorage.removeItem('token'); navigate('/'); };

  const markAllRead = async () => {
    if (!token) return;
    await fetch('http://localhost:8080/api/auth/notifications/read', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDelete = async (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this post permanently? This cannot be undone.')) return;
    const res = await fetch(`http://localhost:8080/api/forum/posts/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setMyPosts(prev => prev.filter(p => p.id !== postId));
    else alert('Failed to delete post.');
  };

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  let displayed = myPosts.filter(p => {
    if (filter !== 'all' && p.visibility !== filter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.title?.toLowerCase().includes(q) || p.content?.toLowerCase().includes(q);
    }
    return true;
  });

  if (sortBy === 'newest')    displayed = [...displayed].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  if (sortBy === 'oldest')    displayed = [...displayed].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  if (sortBy === 'mostVoted') displayed = [...displayed].sort((a, b) => (b.upvotes ?? 0) - (a.upvotes ?? 0));

  return (
    <div className="home-page">
      <Navbar
        isLoggedIn={true}
        onLogout={handleLogout}
        userName={userName}
        userAvatar={userAvatarImg}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAllRead={markAllRead}
        userRole="USER"
      />

      <div className="home-container">
        {/* ── Left Sidebar ── */}
        <aside className="home-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">My Posts</div>
            {(['all', 'UNIVERSITY_WIDE', 'FACULTY_ONLY', 'BATCH_ONLY'] as const).map(f => {
              const labels: Record<string, string> = {
                all:             '🏠 All My Posts',
                UNIVERSITY_WIDE: '🌐 University-Wide',
                FACULTY_ONLY:    '🏛️ Faculty-Only',
                BATCH_ONLY:      '🎓 Batch-Only',
              };
              return (
                <button
                  key={f}
                  className={`sidebar-link${filter === f ? ' active' : ''}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'Inter, sans-serif' }}
                  onClick={() => setFilter(f)}
                >
                  {labels[f]}
                </button>
              );
            })}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Quick Actions</div>
            <button
              className="sidebar-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'Inter, sans-serif', color: '#2563eb', fontWeight: 600 }}
              onClick={() => navigate('/create-post')}
            >
              ✏️ Create New Post
            </button>
            <button
              className="sidebar-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'Inter, sans-serif' }}
              onClick={() => navigate('/home')}
            >
              🏠 Back to Feed
            </button>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">My Stats</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', padding: '0 20px' }}>
              {[
                { label: 'Total Posts',      count: myPosts.length },
                { label: 'University-Wide',  count: myPosts.filter(p => p.visibility === 'UNIVERSITY_WIDE').length },
                { label: 'Faculty-Only',     count: myPosts.filter(p => p.visibility === 'FACULTY_ONLY').length },
                { label: 'Batch-Only',       count: myPosts.filter(p => p.visibility === 'BATCH_ONLY').length },
                { label: 'Total Upvotes',    count: myPosts.reduce((s, p) => s + (p.upvotes ?? 0), 0) },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                  <span style={{ color: '#64748b', fontSize: '13px' }}>{s.label}</span>
                  <strong style={{ color: '#1e293b' }}>{s.count}</strong>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="home-feed">
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>My Forums</h2>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#94a3b8' }}>
                All posts you've created — including anonymous ones.
              </p>
            </div>
            <button
              onClick={() => navigate('/create-post')}
              style={{ padding: '9px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
            >
              ✏️ New Post
            </button>
          </div>

          {/* Search + Sort bar */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search your posts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ flex: 1, minWidth: '180px', padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none' }}
            />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', background: '#fff', cursor: 'pointer', outline: 'none' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="mostVoted">Most Upvoted</option>
            </select>
          </div>

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {(['all', 'UNIVERSITY_WIDE', 'FACULTY_ONLY', 'BATCH_ONLY'] as const).map(f => {
              const labels: Record<string, string> = { all: '🏠 All', UNIVERSITY_WIDE: '🌐 University', FACULTY_ONLY: '🏛️ Faculty', BATCH_ONLY: '🎓 Batch' };
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '6px 14px', borderRadius: '999px', border: '1.5px solid',
                    borderColor: filter === f ? '#2563eb' : '#e2e8f0',
                    background:  filter === f ? '#eff6ff'  : '#fff',
                    color:       filter === f ? '#1d4ed8'  : '#64748b',
                    fontWeight: 600, fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {labels[f]}
                </button>
              );
            })}
          </div>

          {/* Posts */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>⏳ Loading your posts…</div>
          ) : displayed.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '14px', padding: '50px 30px', textAlign: 'center', border: '1.5px dashed #e2e8f0' }}>
              <div style={{ fontSize: '52px', marginBottom: '14px' }}>📝</div>
              <p style={{ fontWeight: 700, fontSize: '16px', color: '#1e293b', marginBottom: '6px' }}>
                {myPosts.length === 0 ? "You haven't created any posts yet." : "No posts match your filters."}
              </p>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>
                {myPosts.length === 0 ? 'Start contributing to the PeraWave community!' : 'Try adjusting your search or filter.'}
              </p>
              {myPosts.length === 0 && (
                <button
                  onClick={() => navigate('/create-post')}
                  style={{ padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                >
                  Create Your First Post
                </button>
              )}
            </div>
          ) : (
            displayed.map(post => {
              const vis = VISIBILITY_LABELS[post.visibility];
              return (
                <article
                  key={post.id}
                  className="forum-post"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/post/${post.id}`)}
                >
                  <div className="post-header" style={{ flexWrap: 'wrap', gap: '6px' }}>
                    {vis && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: vis.bg, color: vis.color }}>
                        {vis.icon} {vis.label}
                      </span>
                    )}
                    {post.isAnonymous && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: '#f1f5f9', color: '#475569' }}>
                        🎭 Posted Anonymously
                      </span>
                    )}
                    <span className="post-meta" style={{ marginLeft: 'auto', fontSize: '12px', color: '#94a3b8' }}>
                      {timeAgo(post.createdAt)}
                    </span>
                  </div>

                  <h2 className="post-title">{post.title}</h2>
                  <p className="post-content" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.content}
                  </p>

                  <div className="post-actions">
                    <button className="post-action-btn" onClick={e => { e.stopPropagation(); navigate(`/post/${post.id}`); }}>
                      ▲ {post.upvotes ?? 0}
                    </button>
                    <button className="post-action-btn" onClick={e => { e.stopPropagation(); navigate(`/post/${post.id}`); }}>
                      💬 {post.commentCount ?? 0} Comments
                    </button>
                    <button
                      className="post-action-btn"
                      style={{ marginLeft: 'auto', color: '#ef4444', fontWeight: 600 }}
                      onClick={e => handleDelete(post.id, e)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </main>

        {/* ── Right Widget ── */}
        <aside className="home-widgets">
          <div className="widget-card">
            <h3 className="widget-title">📊 My Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              {[
                { label: 'Posts Created',   count: myPosts.length },
                { label: 'Total Upvotes',   count: myPosts.reduce((s, p) => s + (p.upvotes ?? 0), 0) },
                { label: 'Total Comments',  count: myPosts.reduce((s, p) => s + (p.commentCount ?? 0), 0) },
                { label: 'Anonymous Posts', count: myPosts.filter(p => p.isAnonymous).length },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>{s.label}</span>
                  <strong style={{ color: '#1e293b', fontSize: '15px' }}>{s.count}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="widget-card" style={{ background: 'linear-gradient(135deg, #e0e7ff, #ede9fe)' }}>
            <h3 className="widget-title" style={{ borderBottomColor: '#c7d2fe' }}>✨ Share Your Thoughts</h3>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '15px' }}>
              Have something to share with the community?
            </p>
            <button
              onClick={() => navigate('/create-post')}
              style={{ width: '100%', padding: '10px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Create Post
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default MyForums;
