import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/home.css';
import '../styles/mod-dashboard.css';
import adminAvatar from '../assets/AdminAvatar.png';

const FACULTIES = [
  { code: 'eng', label: 'Engineering' },
  { code: 'sci', label: 'Science' },
  { code: 'arts', label: 'Arts' },
  { code: 'med', label: 'Medicine' },
  { code: 'mgt', label: 'Management' },
  { code: 'agri', label: 'Agriculture' },
  { code: 'dental', label: 'Dental' },
  { code: 'ahs', label: 'Allied Health Sciences' },
  { code: 'vet', label: 'Veterinary' },
];

const VISIBILITY_META: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  UNIVERSITY_WIDE: { label: 'University-Wide', color: '#1d4ed8', bg: '#dbeafe', icon: '🌐' },
  FACULTY_ONLY: { label: 'Faculty-Only', color: '#6d28d9', bg: '#ede9fe', icon: '🏛️' },
  BATCH_ONLY: { label: 'Batch-Only', color: '#92400e', bg: '#fef3c7', icon: '🎓' },
};

const ModHome: React.FC = () => {
  const navigate = useNavigate();

  const [modInfo, setModInfo] = useState({ fullName: '', email: '' });
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [visFilter, setVisFilter] = useState<string>('all');
  const [facultyFilter, setFacultyFilter] = useState<string>('all');
  const [batchFilter, setBatchFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Moderation modal
  const [showModal, setShowModal] = useState<'warn' | 'suspend' | 'delete' | null>(null);
  const [modalUser, setModalUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [suspendDays, setSuspendDays] = useState(1);
  const [modalLoading, setModalLoading] = useState(false);

  const getToken = () => sessionStorage.getItem('token');

  const fetchData = useCallback(async () => {
    const token = getToken();
    if (!token) { navigate('/mods'); return; }
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [meRes, postsRes] = await Promise.all([
        fetch('http://localhost:8080/api/auth/me', { headers }),
        fetch('http://localhost:8080/api/forum/posts', { headers }),
      ]);

      if (!meRes.ok) { sessionStorage.removeItem('token'); navigate('/mods'); return; }
      const me = await meRes.json();
      setModInfo({ fullName: me.fullName || 'Moderator', email: me.email || '' });

      if (postsRes.ok) {
        const data = await postsRes.json();
        setPosts(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = () => { sessionStorage.removeItem('token'); navigate('/'); };

  const handleDeletePost = async (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this post permanently?')) return;
    const token = getToken(); if (!token) return;
    const res = await fetch(`http://localhost:8080/api/forum/posts/${postId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setPosts(prev => prev.filter(p => p.id !== postId));
    else alert('Failed to delete post.');
  };

  const openModAction = (type: 'warn' | 'suspend' | 'delete', post: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalUser({ id: post.authorId, name: post.realName || post.displayName, email: post.realEmail || post.authorEmail || '' });
    setShowModal(type);
    setActionReason('');
    setSuspendDays(1);
  };

  const submitModAction = async () => {
    if (!modalUser || !actionReason.trim()) return;
    setModalLoading(true);
    const token = getToken(); if (!token) return;
    let url = '';
    let body: any = { targetUserId: modalUser.id, reason: actionReason };
    if (showModal === 'warn') url = '/api/mod/users/warn';
    else if (showModal === 'suspend') { url = '/api/mod/users/suspend'; body.durationDays = suspendDays; }
    else if (showModal === 'delete') url = '/api/mod/users/delete';
    try {
      const res = await fetch(`http://localhost:8080${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.ok) { setShowModal(null); fetchData(); }
      else { const d = await res.json(); alert(d.error || 'Action failed.'); }
    } catch (e) { alert('Network error.'); }
    finally { setModalLoading(false); }
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

  const filteredPosts = posts.filter(p => {
    if (visFilter !== 'all' && p.visibility !== visFilter) return false;
    if (facultyFilter !== 'all' && p.faculty?.toLowerCase() !== facultyFilter) return false;
    if (batchFilter.trim() && !p.batch?.toLowerCase().includes(batchFilter.trim().toLowerCase())) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.title?.toLowerCase().includes(q) || p.content?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="home-page">
      <Navbar
        isLoggedIn={true}
        onLogout={handleLogout}
        userName={modInfo.fullName}
        userAvatar={adminAvatar}
        userRole="MODERATOR"
      />

      {/* Mod Banner */}
      <div style={{
        background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)',
        borderBottom: '3px solid #ef4444',
        padding: '10px 40px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <span style={{ background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '3px 12px', borderRadius: '999px', letterSpacing: '1px' }}>MODERATOR VIEW</span>
        <span style={{ color: '#94a3b8', fontSize: '13px' }}>All posts visible — including anonymous author identities. Click a post to read it.</span>
        <button
          onClick={() => navigate('/mod-dashboard')}
          style={{ marginLeft: 'auto', padding: '6px 16px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
        >
          ← Dashboard
        </button>
      </div>

      <div className="home-container" style={{ gridTemplateColumns: '260px 1fr 280px' }}>

        {/* ── Left Sidebar: Filters ── */}
        <aside className="home-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-title">Search Posts</div>
            <input
              type="text"
              placeholder="Search title or content..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Visibility</div>
            {['all', 'UNIVERSITY_WIDE', 'FACULTY_ONLY', 'BATCH_ONLY'].map(v => {
              const labels: Record<string, string> = { all: '🏠 All Posts', UNIVERSITY_WIDE: '🌐 University-Wide', FACULTY_ONLY: '🏛️ Faculty-Only', BATCH_ONLY: '🎓 Batch-Only' };
              return (
                <button key={v} onClick={() => setVisFilter(v)}
                  className={`sidebar-link${visFilter === v ? ' active' : ''}`}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'Inter, sans-serif' }}>
                  {labels[v]}
                </button>
              );
            })}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">🏛️ Faculty</div>
            <button onClick={() => setFacultyFilter('all')}
              className={`sidebar-link${facultyFilter === 'all' ? ' active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'Inter, sans-serif' }}>
              All Faculties
            </button>
            {FACULTIES.map(f => (
              <button key={f.code} onClick={() => setFacultyFilter(f.code)}
                className={`sidebar-link${facultyFilter === f.code ? ' active' : ''}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'Inter, sans-serif' }}>
                {f.label}
              </button>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">🎓 Batch Filter</div>
            <input
              type="text"
              placeholder="e.g. E23, E/23"
              value={batchFilter}
              onChange={e => setBatchFilter(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          <div className="sidebar-section">
            <button
              onClick={() => { setVisFilter('all'); setFacultyFilter('all'); setBatchFilter(''); setSearchQuery(''); }}
              style={{ width: '100%', padding: '8px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', color: '#64748b', fontSize: '13px', fontWeight: 600 }}
            >
              ✕ Clear All Filters
            </button>
          </div>
        </aside>

        {/* ── Main Feed ── */}
        <main className="home-feed">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: 700 }}>
              Forum Posts <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 400 }}>({filteredPosts.length} shown)</span>
            </h2>
            <button onClick={fetchData} style={{ padding: '7px 14px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', color: '#64748b', fontSize: '13px' }}>↻ Refresh</button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>⏳ Loading posts…</div>
          ) : filteredPosts.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔎</div>
              <p style={{ fontWeight: 600, fontSize: '16px', color: '#475569' }}>No posts match your filters.</p>
            </div>
          ) : (
            filteredPosts.map(post => {
              const vis = VISIBILITY_META[post.visibility];
              return (
                <article
                  key={post.id}
                  className="forum-post"
                  style={{ cursor: 'pointer', borderLeft: '3px solid transparent', transition: 'border-color 0.2s' }}
                  onClick={() => navigate(`/post/${post.id}`)}
                  onMouseEnter={e => (e.currentTarget.style.borderLeftColor = '#ef4444')}
                  onMouseLeave={e => (e.currentTarget.style.borderLeftColor = 'transparent')}
                >
                  <div className="post-header" style={{ flexWrap: 'wrap', gap: '6px' }}>
                    {vis && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: vis.bg, color: vis.color }}>
                        {vis.icon} {vis.label}
                      </span>
                    )}
                    {post.faculty && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: '#f0fdf4', color: '#16a34a' }}>
                        🏛️ {post.faculty.toUpperCase()}
                      </span>
                    )}
                    {post.batch && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: '#fef9c3', color: '#92400e' }}>
                        🎓 {post.batch}
                      </span>
                    )}
                    <span className="post-meta" style={{ marginLeft: 'auto', fontSize: '12px', color: '#94a3b8' }}>
                      {post.isAnonymous ? (
                        <>
                          <span style={{ color: '#94a3b8' }}>Anonymous</span>
                          <span style={{ background: '#fef9c3', color: '#854d0e', fontSize: '11px', padding: '1px 8px', borderRadius: '999px', fontWeight: 700, border: '1px solid #fde68a', marginLeft: '6px' }}>
                            🔑 {post.realName}
                          </span>
                        </>
                      ) : (
                        <span>{post.displayName}</span>
                      )}
                      {' '} • {timeAgo(post.createdAt)}
                    </span>
                  </div>

                  <h2 className="post-title">{post.title}</h2>
                  <p className="post-content" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {post.content}
                  </p>

                  <div className="post-actions">
                    <button className="post-action-btn" onClick={e => { e.stopPropagation(); navigate(`/post/${post.id}`); }}>
                      ▲ {post.upvotes}
                    </button>
                    <button className="post-action-btn" onClick={e => { e.stopPropagation(); navigate(`/post/${post.id}`); }}>
                      💬 {post.commentCount}
                    </button>

                    {/* Mod inline actions */}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                      {post.authorId && !post.isAnonymous && (
                        <>
                          <button
                            onClick={e => openModAction('warn', post, e)}
                            style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 600, border: '1px solid #fde68a', background: '#fefce8', color: '#ca8a04', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            Warn
                          </button>
                          <button
                            onClick={e => openModAction('suspend', post, e)}
                            style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 600, border: '1px solid #e9d5ff', background: '#f3e8ff', color: '#9333ea', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            Suspend
                          </button>
                        </>
                      )}
                      {post.isAnonymous && post.authorId && (
                        <>
                          <button
                            onClick={e => openModAction('warn', post, e)}
                            style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 600, border: '1px solid #fde68a', background: '#fefce8', color: '#ca8a04', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            Warn
                          </button>
                          <button
                            onClick={e => openModAction('suspend', post, e)}
                            style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 600, border: '1px solid #e9d5ff', background: '#f3e8ff', color: '#9333ea', borderRadius: '6px', cursor: 'pointer' }}
                          >
                            Suspend
                          </button>
                        </>
                      )}
                      <button
                        onClick={e => handleDeletePost(post.id, e)}
                        style={{ padding: '4px 10px', fontSize: '12px', fontWeight: 600, border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        Delete Post
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </main>

        {/* ── Right Widgets ── */}
        <aside className="home-widgets">
          <div className="widget-card">
            <h3 className="widget-title">📊 Feed Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Total Posts', count: posts.length },
                { label: 'University-Wide', count: posts.filter(p => p.visibility === 'UNIVERSITY_WIDE').length },
                { label: 'Faculty-Only', count: posts.filter(p => p.visibility === 'FACULTY_ONLY').length },
                { label: 'Batch-Only', count: posts.filter(p => p.visibility === 'BATCH_ONLY').length },
                { label: 'Anonymous', count: posts.filter(p => p.isAnonymous).length },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '14px' }}>{s.label}</span>
                  <strong style={{ color: '#1e293b' }}>{s.count}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="widget-card" style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', border: '1px solid #334155' }}>
            <h3 className="widget-title" style={{ color: '#f1f5f9', borderBottomColor: '#334155' }}>🛡️ Mod Actions</h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '14px', lineHeight: '1.6' }}>
              Use the <strong style={{ color: '#ef4444' }}>Warn</strong>, <strong style={{ color: '#9333ea' }}>Suspend</strong>, and <strong style={{ color: '#dc2626' }}>Delete Post</strong> buttons on each post for inline moderation.
            </p>
            <button
              onClick={() => navigate('/mod-dashboard')}
              style={{ width: '100%', padding: '10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
            >
              Open Full Dashboard
            </button>
          </div>

          <div className="widget-card">
            <h3 className="widget-title">Active Filters</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Visibility</span>
                <strong>{visFilter === 'all' ? 'All' : visFilter.replace(/_/g, ' ')}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Faculty</span>
                <strong>{facultyFilter === 'all' ? 'All' : FACULTIES.find(f => f.code === facultyFilter)?.label || facultyFilter}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Batch</span>
                <strong>{batchFilter || 'Any'}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Showing</span>
                <strong style={{ color: '#2563eb' }}>{filteredPosts.length} / {posts.length}</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Moderation Action Modal */}
      {showModal && modalUser && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div style={{ background: '#1e293b', padding: '30px', borderRadius: '14px', width: '420px', color: '#fff', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <h2 style={{ marginTop: 0, marginBottom: '6px' }}>
              {showModal === 'warn' ? '⚠️ Warn User' : showModal === 'suspend' ? '🚫 Suspend User' : '🗑️ Delete User'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '20px' }}>
              Target: <strong style={{ color: '#f1f5f9' }}>{modalUser.name}</strong>
              {modalUser.email && <span style={{ color: '#64748b', marginLeft: '6px' }}>({modalUser.email})</span>}
            </p>

            {showModal === 'suspend' && (
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#94a3b8', fontSize: '13px' }}>Duration:</label>
                <select value={suspendDays} onChange={e => setSuspendDays(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }}>
                  <option value={1}>1 Day</option>
                  <option value={3}>3 Days</option>
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                </select>
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', color: '#94a3b8', fontSize: '13px' }}>Reason:</label>
              <textarea
                value={actionReason}
                onChange={e => setActionReason(e.target.value)}
                rows={3}
                placeholder="State the reason clearly..."
                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #334155', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowModal(null)} style={{ padding: '10px 18px', background: 'transparent', color: '#94a3b8', border: '1px solid #475569', borderRadius: '8px', cursor: 'pointer' }}>
                Cancel
              </button>
              <button
                onClick={submitModAction}
                disabled={!actionReason.trim() || modalLoading}
                style={{ padding: '10px 18px', background: showModal === 'warn' ? '#eab308' : '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', opacity: (!actionReason.trim() || modalLoading) ? 0.6 : 1 }}
              >
                {modalLoading ? 'Submitting...' : `Confirm ${showModal === 'warn' ? 'Warning' : showModal === 'suspend' ? 'Suspension' : 'Deletion'}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModHome;
