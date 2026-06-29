import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/home.css';
import '../styles/mod-dashboard.css';
import adminAvatar from '../assets/AdminAvatar.png';
import { API_URL } from '../config';

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

const IconGlobe = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'12px',height:'12px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>;
const IconBuilding = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'12px',height:'12px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>;
const IconAcademic = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'12px',height:'12px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>;
const IconHome = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'13px',height:'13px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>;
const IconUpvote = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{width:'14px',height:'14px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>;
const IconChat = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'14px',height:'14px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>;
const IconChart = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'15px',height:'15px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>;
const IconShield = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'15px',height:'15px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>;
const IconKey = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'11px',height:'11px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>;
const IconSearch = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'48px',height:'48px',color:'#cbd5e1'}}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" /></svg>;
const IconX = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{width:'13px',height:'13px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const IconRefresh = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'14px',height:'14px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>;

const VISIBILITY_META: Record<string, { label: string; color: string; bg: string; Icon: () => React.ReactElement }> = {
  UNIVERSITY_WIDE: { label: 'University-Wide', color: '#1d4ed8', bg: '#dbeafe', Icon: IconGlobe },
  FACULTY_ONLY: { label: 'Faculty-Only', color: '#6d28d9', bg: '#ede9fe', Icon: IconBuilding },
  BATCH_ONLY: { label: 'Batch-Only', color: '#92400e', bg: '#fef3c7', Icon: IconAcademic },
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
  const [sortBy, setSortBy] = useState<'date' | 'votes'>('date');

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
        fetch(`${API_URL}/api/auth/me`, { headers }),
        fetch(`${API_URL}/api/forum/posts`, { headers }),
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
    const res = await fetch(`${API_URL}/api/forum/posts/${postId}`, {
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
      const res = await fetch(`${API_URL}${url}`, {
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
  }).slice().sort((a, b) =>
    sortBy === 'votes'
      ? b.upvotes - a.upvotes
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

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
            {[{ v: 'all', label: 'All Posts', Icon: IconHome }, { v: 'UNIVERSITY_WIDE', label: 'University-Wide', Icon: IconGlobe }, { v: 'FACULTY_ONLY', label: 'Faculty-Only', Icon: IconBuilding }, { v: 'BATCH_ONLY', label: 'Batch-Only', Icon: IconAcademic }].map(({ v, label, Icon }) => (
              <button key={v} onClick={() => setVisFilter(v)}
                className={`sidebar-link${visFilter === v ? ' active' : ''}`}
                style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <Icon />{label}
              </button>
            ))}
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IconBuilding /> Faculty</div>
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
            <div className="sidebar-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IconAcademic /> Batch Filter</div>
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
              style={{ width: '100%', padding: '8px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', color: '#64748b', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <IconX /> Clear All Filters
            </button>
          </div>
        </aside>

        {/* ── Main Feed ── */}
        <main className="home-feed">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: 700 }}>
              Forum Posts <span style={{ fontSize: '14px', color: '#94a3b8', fontWeight: 400 }}>({filteredPosts.length} shown)</span>
            </h2>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Sort buttons */}
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Sort:</span>
              {([{ value: 'date', label: 'Newest' }, { value: 'votes', label: 'Top Voted' }] as const).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSortBy(opt.value)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '999px',
                    border: '1.5px solid',
                    borderColor: sortBy === opt.value ? '#ef4444' : '#e2e8f0',
                    background: sortBy === opt.value ? '#fef2f2' : '#fff',
                    color: sortBy === opt.value ? '#dc2626' : '#64748b',
                    fontWeight: 600,
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {opt.label}
                </button>
              ))}
              <button onClick={fetchData} style={{ padding: '7px 14px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', color: '#64748b', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}><IconRefresh /> Refresh</button>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'20px',height:'20px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
              Loading posts…
            </div>
          ) : filteredPosts.length === 0 ? (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}><IconSearch /></div>
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
                        <vis.Icon /> {vis.label}
                      </span>
                    )}
                    {post.faculty && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: '#f0fdf4', color: '#16a34a' }}>
                        <IconBuilding /> {post.faculty.toUpperCase()}
                      </span>
                    )}
                    {post.batch && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: '#fef9c3', color: '#92400e' }}>
                        <IconAcademic /> {post.batch}
                      </span>
                    )}
                    <span className="post-meta" style={{ marginLeft: 'auto', fontSize: '12px', color: '#94a3b8' }}>
                      {post.isAnonymous ? (
                        <>
                          <span style={{ color: '#94a3b8' }}>Anonymous</span>
                          <span style={{ background: '#fef9c3', color: '#854d0e', fontSize: '11px', padding: '1px 8px', borderRadius: '999px', fontWeight: 700, border: '1px solid #fde68a', marginLeft: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <IconKey /> {post.realName}
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
                    <button className="post-action-btn" onClick={e => { e.stopPropagation(); navigate(`/post/${post.id}`); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <IconUpvote /> {post.upvotes}
                    </button>
                    <button className="post-action-btn" onClick={e => { e.stopPropagation(); navigate(`/post/${post.id}`); }} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <IconChat /> {post.commentCount}
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
            <h3 className="widget-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><IconChart /> Feed Stats</h3>
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
            <h3 className="widget-title" style={{ color: '#f1f5f9', borderBottomColor: '#334155', display: 'flex', alignItems: 'center', gap: '6px' }}><IconShield /> Mod Actions</h3>
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
              {showModal === 'warn' ? 'Warn User' : showModal === 'suspend' ? 'Suspend User' : 'Delete User'}
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
