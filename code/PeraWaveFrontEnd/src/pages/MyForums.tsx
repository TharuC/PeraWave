import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/home.css';
import '../styles/forum.css';
import userAvatarImg from '../assets/UserAvatar.png';
import { API_URL } from '../config';
import { getToken, clearToken } from '../utils/auth';

const IconGlobe = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '12px', height: '12px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>;
const IconBuilding = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '12px', height: '12px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>;
const IconAcademic = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '12px', height: '12px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>;
const IconHome = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '13px', height: '13px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>;
const IconPencil = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '14px', height: '14px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;
const IconUpvote = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: '14px', height: '14px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>;
const IconChat = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '14px', height: '14px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '14px', height: '14px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>;
const IconMask = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '12px', height: '12px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" /></svg>;
const IconChart = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '15px', height: '15px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>;

const VISIBILITY_LABELS: Record<string, { label: string; color: string; bg: string; Icon: () => React.ReactElement }> = {
  UNIVERSITY_WIDE: { label: 'University-Wide', color: '#1d4ed8', bg: '#dbeafe', Icon: IconGlobe },
  FACULTY_ONLY: { label: 'Faculty-Only', color: '#6d28d9', bg: '#ede9fe', Icon: IconBuilding },
  BATCH_ONLY: { label: 'Batch-Only', color: '#92400e', bg: '#fef3c7', Icon: IconAcademic },
};

const MyForums: React.FC = () => {
  const navigate = useNavigate();

  const [userName, setUserName] = useState('');
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'UNIVERSITY_WIDE' | 'FACULTY_ONLY' | 'BATCH_ONLY'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostVoted'>('newest');
  const [notifications, setNotifications] = useState<any[]>([]);

  const token = getToken();

  const fetchData = useCallback(async () => {
    if (!token) { navigate('/login'); return; }
    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);

    try {
      const [meRes, postsRes, notifRes] = await Promise.all([
        fetch(`${API_URL}/api/auth/me`, { headers }),
        fetch(`${API_URL}/api/forum/posts/my-posts`, { headers }),
        fetch(`${API_URL}/api/auth/notifications`, { headers }),
      ]);

      if (!meRes.ok) { clearToken(); navigate('/login'); return; }
      const me = await meRes.json();
      setUserName(me.fullName || 'User');

      if (postsRes.ok) {
        const data = await postsRes.json();
        setMyPosts(Array.isArray(data) ? data : []);
      } else {
        // Fallback: filter all posts for isAuthor === true
        const allRes = await fetch(`${API_URL}/api/forum/posts`, { headers });
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

  const handleLogout = () => { clearToken(); navigate('/'); };

  const markAllRead = async () => {
    if (!token) return;
    await fetch(`${API_URL}/api/auth/notifications/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDelete = async (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this post permanently? This cannot be undone.')) return;
    const res = await fetch(`${API_URL}/api/forum/posts/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setMyPosts(prev => prev.filter(p => p.id !== postId));
    else alert('Failed to delete post.');
  };

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
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

  if (sortBy === 'newest') displayed = [...displayed].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  if (sortBy === 'oldest') displayed = [...displayed].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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
            {([{ f: 'all', label: 'All My Posts', Icon: IconHome }, { f: 'UNIVERSITY_WIDE', label: 'University-Wide', Icon: IconGlobe }, { f: 'FACULTY_ONLY', label: 'Faculty-Only', Icon: IconBuilding }, { f: 'BATCH_ONLY', label: 'Batch-Only', Icon: IconAcademic }] as const).map(({ f, label, Icon }) => (
              <button
                key={f}
                className={`sidebar-link${filter === (f as any) ? ' active' : ''}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '7px' }}
                onClick={() => setFilter(f as any)}
              >
                <Icon />{label}
              </button>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Quick Actions</div>
            <button
              className="sidebar-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'Inter, sans-serif', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '7px' }}
              onClick={() => navigate('/create-post')}
            >
              <IconPencil /> Create New Post
            </button>
            <button
              className="sidebar-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '7px' }}
              onClick={() => navigate('/home')}
            >
              <IconHome /> Back to Feed
            </button>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">My Stats</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', padding: '0 20px' }}>
              {[
                { label: 'Total Posts', count: myPosts.length },
                { label: 'University-Wide', count: myPosts.filter(p => p.visibility === 'UNIVERSITY_WIDE').length },
                { label: 'Faculty-Only', count: myPosts.filter(p => p.visibility === 'FACULTY_ONLY').length },
                { label: 'Batch-Only', count: myPosts.filter(p => p.visibility === 'BATCH_ONLY').length },
                { label: 'Total Upvotes', count: myPosts.reduce((s, p) => s + (p.upvotes ?? 0), 0) },
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
              style={{ padding: '9px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <IconPencil /> New Post
            </button>
          </div>

          {/* Search + Sort bar */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search your posts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ flex: 1, minWidth: '180px', padding: '8px 14px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', outline: 'none', background: '#fff', color: '#1e293b' }}
            />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', background: '#fff', color: '#1e293b', cursor: 'pointer', outline: 'none' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="mostVoted">Most Upvoted</option>
            </select>
          </div>

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            {([{ f: 'all', label: 'All', Icon: IconHome }, { f: 'UNIVERSITY_WIDE', label: 'University', Icon: IconGlobe }, { f: 'FACULTY_ONLY', label: 'Faculty', Icon: IconBuilding }, { f: 'BATCH_ONLY', label: 'Batch', Icon: IconAcademic }] as const).map(({ f, label, Icon }) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                style={{
                  padding: '6px 14px', borderRadius: '999px', border: '1.5px solid',
                  borderColor: filter === (f as any) ? '#2563eb' : '#e2e8f0',
                  background: filter === (f as any) ? '#eff6ff' : '#fff',
                  color: filter === (f as any) ? '#1d4ed8' : '#64748b',
                  fontWeight: 600, fontSize: '12px', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                }}
              >
                <Icon />{label}
              </button>
            ))}
          </div>

          {/* Posts */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
              Loading your posts…
            </div>
          ) : displayed.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '14px', padding: '50px 30px', textAlign: 'center', border: '1.5px dashed #e2e8f0' }}>
              <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'center' }}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="#cbd5e1" style={{ width: '56px', height: '56px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg></div>
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
                        <vis.Icon /> {vis.label}
                      </span>
                    )}
                    {post.isAnonymous && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: '#f1f5f9', color: '#475569' }}>
                        <IconMask /> Posted Anonymously
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
                    <button className="post-action-btn" onClick={e => { e.stopPropagation(); navigate(`/post/${post.id}`); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <IconUpvote /> {post.upvotes ?? 0}
                    </button>
                    <button className="post-action-btn" onClick={e => { e.stopPropagation(); navigate(`/post/${post.id}`); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <IconChat /> {post.commentCount ?? 0} Comments
                    </button>
                    <button
                      className="post-action-btn"
                      style={{ marginLeft: 'auto', color: '#ef4444', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      onClick={e => handleDelete(post.id, e)}
                    >
                      <IconTrash /> Delete
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
            <h3 className="widget-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IconChart /> My Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
              {[
                { label: 'Posts Created', count: myPosts.length },
                { label: 'Total Upvotes', count: myPosts.reduce((s, p) => s + (p.upvotes ?? 0), 0) },
                { label: 'Total Comments', count: myPosts.reduce((s, p) => s + (p.commentCount ?? 0), 0) },
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
            <h3 className="widget-title" style={{ borderBottomColor: '#c7d2fe', display: 'flex', alignItems: 'center', gap: '6px' }}><IconPencil /> Share Your Thoughts</h3>
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
