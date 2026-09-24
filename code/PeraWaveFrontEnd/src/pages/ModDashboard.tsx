import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/mod-dashboard.css';
import '../styles/wiki.css';
import adminAvatar from '../assets/AdminAvatar.png';
import { API_URL } from '../config';
import { getModToken, clearToken } from '../utils/auth';


// ── Wiki Article Preview Modal ────────────────────────────────────────────────────
const WikiArticlePreviewModal: React.FC<{ article: any; onClose: () => void }> = ({ article, onClose }) => {
    const [activeImg, setActiveImg] = React.useState(0);
    React.useEffect(() => { setActiveImg(0); }, [article]);

    // Close on Escape key
    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const statusColors: Record<string, { bg: string; color: string; label: string }> = {
        APPROVED: { bg: '#dcfce7', color: '#15803d', label: 'Approved' },
        PENDING:  { bg: '#fef3c7', color: '#92400e', label: 'Pending Review' },
        REJECTED: { bg: '#fee2e2', color: '#dc2626', label: 'Rejected' },
    };
    const sc = statusColors[article.status] || { bg: '#f1f5f9', color: '#64748b', label: article.status };

    return (
        // Backdrop
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
                zIndex: 3000, display: 'flex', justifyContent: 'flex-end',
                animation: 'fadeIn 0.2s ease',
            }}
        >
            {/* Drawer panel */}
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    width: '560px', maxWidth: '95vw', height: '100%',
                    background: '#0f172a', overflowY: 'auto',
                    display: 'flex', flexDirection: 'column',
                    boxShadow: '-8px 0 40px rgba(0,0,0,0.4)',
                    animation: 'slideInRight 0.25s ease',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '20px 24px', borderBottom: '1px solid #1e293b',
                    background: '#0f172a', position: 'sticky', top: 0, zIndex: 10,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ background: sc.bg, color: sc.color, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px' }}>
                            {sc.label}
                        </span>
                        <span style={{ color: '#64748b', fontSize: '12px' }}>Article #{article.id}</span>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                        title="Close (Esc)"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 20, height: 20 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Image carousel */}
                {article.imageUrls && article.imageUrls.length > 0 && (
                    <div style={{ position: 'relative', background: '#020817' }}>
                        <img
                            src={article.imageUrls[activeImg]}
                            alt={article.title}
                            style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', display: 'block' }}
                        />
                        {article.imageUrls.length > 1 && (
                            <>
                                {/* Prev */}
                                {activeImg > 0 && (
                                    <button onClick={() => setActiveImg(i => i - 1)} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 16, height: 16 }}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                                    </button>
                                )}
                                {/* Next */}
                                {activeImg < article.imageUrls.length - 1 && (
                                    <button onClick={() => setActiveImg(i => i + 1)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: 36, height: 36, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{ width: 16, height: 16 }}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                                    </button>
                                )}
                                {/* Dots */}
                                <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '6px' }}>
                                    {article.imageUrls.map((_: any, i: number) => (
                                        <button key={i} onClick={() => setActiveImg(i)} style={{ width: 8, height: 8, borderRadius: '50%', border: 'none', background: i === activeImg ? '#fff' : 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: 0 }} />
                                    ))}
                                </div>
                            </>
                        )}
                        <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '11px', padding: '3px 8px', borderRadius: '999px' }}>
                            {activeImg + 1} / {article.imageUrls.length}
                        </div>
                    </div>
                )}

                {/* Body */}
                <div style={{ padding: '24px', flex: 1 }}>
                    {/* Location */}
                    {article.location && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#1e293b', color: '#94a3b8', fontSize: '12px', padding: '4px 10px', borderRadius: '999px', marginBottom: '14px' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 12, height: 12 }}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                            {article.location}
                        </div>
                    )}

                    {/* Title */}
                    <h2 style={{ color: '#f1f5f9', fontSize: '22px', fontWeight: 800, margin: '0 0 12px', lineHeight: 1.3 }}>{article.title}</h2>

                    {/* Author row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>
                            {(article.author?.fullName || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                            <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '13px' }}>{article.author?.fullName || 'Unknown'}</div>
                            <div style={{ color: '#64748b', fontSize: '11px' }}>
                                {article.author?.email || ''}
                                {article.author?.faculty ? ` · ${article.author.faculty}` : ''}
                            </div>
                        </div>
                        <div style={{ marginLeft: 'auto', color: '#64748b', fontSize: '11px' }}>
                            {new Date(article.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.8', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {article.content}
                    </div>

                    {/* Mod note if present */}
                    {article.modNote && (
                        <div style={{ marginTop: '24px', background: '#1e293b', borderLeft: '3px solid #f59e0b', borderRadius: '0 8px 8px 0', padding: '12px 16px' }}>
                            <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Moderator Note</p>
                            <p style={{ margin: 0, color: '#94a3b8', fontSize: '13px', lineHeight: 1.6 }}>{article.modNote}</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to   { transform: translateX(0);    opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
            `}</style>
        </div>
    );
};


// ── Wiki Mod Card ─────────────────────────────────────────────────────────────
interface WikiModCardProps {
    article: any;
    token: string | null;
    onAction: () => void;
    onDelete: () => void;
    onView: () => void;
}

const WikiModCard: React.FC<WikiModCardProps> = ({ article, token, onAction, onDelete, onView }) => {
    const [loading, setLoading] = React.useState(false);
    const [modNote, setModNote] = React.useState('');

    const updateStatus = async (status: 'APPROVED' | 'REJECTED') => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/wiki/${article.id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status, modNote }),
            });
            if (res.ok) onAction();
            else alert('Failed to update status.');
        } catch { alert('Network error.'); }
        finally { setLoading(false); }
    };

    const deleteArticle = async () => {
        if (!token) return;
        if (!window.confirm(`Delete "${article.title}" permanently? This cannot be undone.`)) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/wiki/mod/${article.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) onDelete();
            else alert('Failed to delete article.');
        } catch { alert('Network error.'); }
        finally { setLoading(false); }
    };

    return (
        <div className="wiki-mod-card">
            {article.imageUrls && article.imageUrls.length > 0 ? (
                <img src={article.imageUrls[0]} alt={article.title} className="wiki-mod-card-img" />
            ) : (
                <div className="wiki-mod-card-placeholder">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                </div>
            )}
            <div className="wiki-mod-card-info">
                <p className="wiki-mod-card-title">{article.title}</p>
                <p className="wiki-mod-card-author">
                    by {article.author?.fullName || 'Unknown'} · {article.author?.faculty || ''} ·{' '}
                    {new Date(article.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    {article.location && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}> · <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 14, height: 14 }}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg> {article.location}</span>}
                </p>
                <p className="wiki-mod-card-excerpt">{article.content}</p>
                <input
                    type="text"
                    placeholder="Optional note to author (optional)"
                    value={modNote}
                    onChange={e => setModNote(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '7px', border: '1px solid #334155', background: '#0f172a', color: '#94a3b8', fontSize: '12px', marginBottom: '10px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                />
                <div className="wiki-mod-card-actions">
                    <button
                        disabled={loading}
                        onClick={onView}
                        style={{ padding: '7px 14px', background: 'transparent', border: '1px solid #6366f1', color: '#818cf8', borderRadius: '7px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#818cf8'; }}
                    >
                        👁 View
                    </button>
                    <button className="wiki-mod-approve-btn" disabled={loading} onClick={() => updateStatus('APPROVED')}>✓ Approve</button>
                    <button className="wiki-mod-reject-btn" disabled={loading} onClick={() => updateStatus('REJECTED')}>✕ Reject</button>
                    <button
                        disabled={loading}
                        onClick={deleteArticle}
                        style={{ padding: '7px 14px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '7px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}
                    >
                        🗑 Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── TAB TITLES ──────────────────────────────────────────────────────────────
const TAB_TITLES: Record<string, string> = {
    overview: 'Overview Analytics',
    users: 'User Management',
    moderators: 'Moderator Team',
    forum: 'Forum Posts',
    wiki: 'Wiki Moderation',
    audit: 'Audit Logs',
};

const ModDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    // --- Mod Info ---
    const [modData, setModData] = useState({ fullName: '', email: '', role: '' });

    // --- Stats ---
    const [stats, setStats] = useState({
        totalUsers: 0,
        newUsersToday: 0,
        suspendedUsers: 0,
        totalPosts: 0,
        totalModerators: 0,
        pendingEvents: 0,
    });

    // --- Users & Moderators ---
    const [users, setUsers] = useState<any[]>([]);
    const [moderatorsList, setModeratorsList] = useState<any[]>([]);

    // --- Forum Posts ---
    const [forumPosts, setForumPosts] = useState<any[]>([]);
    const [postsLoading, setPostsLoading] = useState(false);

    // --- Audit Logs ---
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [auditLoading, setAuditLoading] = useState(false);

    // --- Wiki Articles ---
    const [pendingWikiArticles, setPendingWikiArticles] = useState<any[]>([]);
    const [allWikiArticles, setAllWikiArticles] = useState<any[]>([]);
    const [wikiLoading, setWikiLoading] = useState(false);
    const [wikiSubTab, setWikiSubTab] = useState<'pending' | 'all'>('pending');
    const [previewArticle, setPreviewArticle] = useState<any | null>(null);

    // --- Modal State ---
    const [showModal, setShowModal] = useState<'warn' | 'suspend' | 'delete' | null>(null);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [actionReason, setActionReason] = useState('');
    const [suspendDuration, setSuspendDuration] = useState(1);

    const getToken = () => {
        // Uses getModToken() which checks sessionStorage["modToken"] first,
        // then falls back to localStorage["modToken"] (remember-me sessions).
        const token = getModToken();
        if (!token) { navigate('/mods'); return null; }
        return token;
    };

    const fetchAll = async () => {
        const token = getToken();
        if (!token) return;

        const headers = { 'Authorization': `Bearer ${token}` };

        try {
            // 1. Moderator profile
            const meRes = await fetch(`${API_URL}/api/auth/me`, { headers });
            if (meRes.status === 401 || meRes.status === 403) {
                clearToken();
                navigate('/mods');
                return;
            }
            if (meRes.ok) {
                const me = await meRes.json();
                setModData({ fullName: me.fullName || 'Moderator', email: me.email || '', role: me.role || 'MODERATOR' });
            }

            // 2. Platform stats
            const statsRes = await fetch(`${API_URL}/api/mod/stats`, { headers });
            if (statsRes.ok) setStats(await statsRes.json());

            // 3. Users list
            const usersRes = await fetch(`${API_URL}/api/mod/users`, { headers });
            if (usersRes.ok) setUsers(await usersRes.json());

            // 3.5 Moderators list
            const modsRes = await fetch(`${API_URL}/api/mod/moderators`, { headers });
            if (modsRes.ok) setModeratorsList(await modsRes.json());

            // 4. Forum Posts
            setPostsLoading(true);
            const postsRes = await fetch(`${API_URL}/api/forum/posts`, { headers });
            if (postsRes.ok) setForumPosts(await postsRes.json());
            setPostsLoading(false);

            // 5. Audit logs
            setAuditLoading(true);
            const auditRes = await fetch(`${API_URL}/api/mod/audit-logs`, { headers });
            if (auditRes.ok) setAuditLogs(await auditRes.json());
            setAuditLoading(false);

            // 6. Pending wiki articles
            setWikiLoading(true);
            const wikiRes = await fetch(`${API_URL}/api/wiki/pending`, { headers });
            if (wikiRes.ok) setPendingWikiArticles(await wikiRes.json());

            // 7. All wiki articles for moderator management
            const allWikiRes = await fetch(`${API_URL}/api/wiki/all`, { headers });
            if (allWikiRes.ok) setAllWikiArticles(await allWikiRes.json());
            setWikiLoading(false);

        } catch (err) {
            console.error('Failed to load dashboard data', err);
            setPostsLoading(false);
            setAuditLoading(false);
            setWikiLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openModal = (type: 'warn' | 'suspend' | 'delete', user: any) => {
        setSelectedUser(user);
        setShowModal(type);
        setActionReason('');
    };

    const handleActionSubmit = async () => {
        if (!selectedUser || !actionReason) return;

        let endpoint = '';
        let body: any = { targetUserId: selectedUser.id, reason: actionReason };

        if (showModal === 'warn') endpoint = '/api/mod/users/warn';
        else if (showModal === 'suspend') { endpoint = '/api/mod/users/suspend'; body.durationDays = suspendDuration; }
        else if (showModal === 'delete') endpoint = '/api/mod/users/delete';

        try {
            const token = getToken();
            if (!token) return;

            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setShowModal(null);
                setActionReason('');
                setSuspendDuration(1);
                fetchAll(); // Refresh all data
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to perform action.');
            }
        } catch (err) {
            console.error(err);
            alert('Network error.');
        }
    };

    const handleDeletePost = async (postId: number) => {
        if (!window.confirm('Delete this post permanently?')) return;
        const token = getToken();
        if (!token) return;

        const res = await fetch(`${API_URL}/api/forum/posts/${postId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            setForumPosts(prev => prev.filter(p => p.id !== postId));
            setStats(prev => ({ ...prev, totalPosts: prev.totalPosts - 1 }));
        } else {
            alert('Failed to delete post.');
        }
    };

    const handleLogout = () => {
        clearToken();
        navigate('/mods');
    };

    const formatActionType = (type: string) => {
        if (type === 'WARN') return { label: 'WARN', color: '#ca8a04', bg: '#fefce8' };
        if (type === 'SUSPEND') return { label: 'SUSPEND', color: '#9333ea', bg: '#f3e8ff' };
        if (type === 'DELETE') return { label: 'DELETE', color: '#dc2626', bg: '#fef2f2' };
        return { label: type, color: '#64748b', bg: '#f1f5f9' };
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <div className="mod-dashboard-page">
            {/* Sidebar */}
            <div className="mod-sidebar">
                <div className="mod-sidebar-profile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #334155' }}>
                    <img
                        src={adminAvatar}
                        alt="Admin Avatar"
                        style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', backgroundColor: '#fff', border: '4px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', marginBottom: '16px' }}
                    />
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 700, color: '#fff' }}>
                        {modData.fullName || 'Loading...'}
                    </h2>
                    <p style={{ margin: '0 0 8px 0', color: '#94a3b8', fontSize: '13px' }}>{modData.email}</p>
                    <span style={{ background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '999px', letterSpacing: '1px' }}>
                        {modData.role || 'MODERATOR'}
                    </span>
                </div>

                <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold', marginBottom: '15px', letterSpacing: '1px' }}>
                    Moderator Dashboard
                </div>

                <button
                    onClick={() => navigate('/mod-home')}
                    style={{ width: '100%', padding: '10px 14px', marginBottom: '10px', background: 'linear-gradient(90deg, #ef4444, #f87171)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    Browse Forums
                </button>
                <button
                    onClick={() => navigate('/mod-reports')}
                    style={{ width: '100%', padding: '10px 14px', marginBottom: '10px', background: 'linear-gradient(90deg, #5ce4f6ff, #55bef7ff)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    Review Reports
                </button>
                <button
                    onClick={() => navigate('/mod-events')}
                    style={{ width: '100%', padding: '10px 14px', marginBottom: '10px', background: 'linear-gradient(90deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    Manage Events
                </button>
                <button
                    onClick={() => { setActiveTab('wiki'); }}
                    style={{ width: '100%', padding: '10px 14px', marginBottom: '10px', background: 'linear-gradient(90deg, #8b5cf6, #6d28d9)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: 16, height: 16 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg> Wiki Articles</span> {pendingWikiArticles.length > 0 && <span style={{ background: '#ef4444', borderRadius: '999px', padding: '1px 7px', fontSize: '11px' }}>{pendingWikiArticles.length}</span>}
                </button>


                <div className="mod-nav-links">
                    {Object.keys(TAB_TITLES).map(tab => (
                        <div
                            key={tab}
                            className={`mod-nav-link ${activeTab === tab ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {TAB_TITLES[tab]}
                        </div>
                    ))}
                </div>

                {/* Platform Summary in Sidebar */}
                <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #334155' }}>
                    <p style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '10px', letterSpacing: '1px' }}>Platform Summary</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8' }}>
                            <span>Total Users</span><strong style={{ color: '#fff' }}>{stats.totalUsers}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8' }}>
                            <span>Forum Posts</span><strong style={{ color: '#fff' }}>{stats.totalPosts}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8' }}>
                            <span>Moderators</span><strong style={{ color: '#fff' }}>{stats.totalModerators}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mod-main-content">
                <div className="mod-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>{TAB_TITLES[activeTab]}</h1>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                            onClick={fetchAll}
                            style={{ padding: '8px 14px', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                            ↻ Refresh
                        </button>
                        <button className="mod-logout-btn" onClick={handleLogout}>Log Out</button>
                    </div>
                </div>

                {/* ─── Overview ─── */}
                {activeTab === 'overview' && (
                    <>
                        <div className="mod-stats-grid">
                            <div className="mod-stat-card">
                                <h3>Total Users</h3>
                                <p style={{ color: '#3b82f6' }}>{stats.totalUsers}</p>
                            </div>
                            <div className="mod-stat-card">
                                <h3>New Today</h3>
                                <p style={{ color: '#10b981' }}>{stats.newUsersToday}</p>
                            </div>
                            <div className="mod-stat-card">
                                <h3>Suspended</h3>
                                <p style={{ color: '#ef4444' }}>{stats.suspendedUsers}</p>
                            </div>
                            <div className="mod-stat-card">
                                <h3>Forum Posts</h3>
                                <p style={{ color: '#8b5cf6' }}>{stats.totalPosts}</p>
                            </div>
                            <div className="mod-stat-card">
                                <h3>Moderators</h3>
                                <p style={{ color: '#f59e0b' }}>{stats.totalModerators}</p>
                            </div>
                            <div
                                className="mod-stat-card"
                                style={{ cursor: stats.pendingEvents > 0 ? 'pointer' : 'default', border: stats.pendingEvents > 0 ? '2px solid #f59e0b' : undefined }}
                                onClick={() => stats.pendingEvents > 0 && navigate('/mod-events')}
                                title={stats.pendingEvents > 0 ? 'Click to manage pending events' : ''}
                            >
                                <h3>Pending Events</h3>
                                <p style={{ color: stats.pendingEvents > 0 ? '#d97706' : '#94a3b8' }}>
                                    {stats.pendingEvents}
                                    {stats.pendingEvents > 0 && <span style={{ fontSize: '13px', marginLeft: '6px', color: '#d97706' }}>⚠</span>}
                                </p>
                            </div>
                        </div>

                        <div className="mod-section">
                            <h2>Recent Moderation Actions</h2>
                            {auditLogs.length === 0 ? (
                                <p style={{ color: '#64748b' }}>No moderation actions recorded yet.</p>
                            ) : (
                            <div className="mod-table-container">
                                <table className="mod-table">
                                    <thead>
                                        <tr>
                                            <th>Action</th>
                                            <th>Moderator</th>
                                            <th>Target User ID</th>
                                            <th>Reason</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {auditLogs.slice(0, 10).map((log: any) => {
                                            const fmt = formatActionType(log.actionType);
                                            return (
                                                <tr key={log.id}>
                                                    <td>
                                                        <span style={{ background: fmt.bg, color: fmt.color, fontWeight: 700, fontSize: '12px', padding: '2px 10px', borderRadius: '999px' }}>
                                                            {fmt.label}
                                                        </span>
                                                    </td>
                                                    <td>{log.moderator?.fullName || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>System</span>}</td>
                                                    <td>#{log.targetUserId}</td>
                                                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {log.reason || '—'}
                                                    </td>
                                                    <td style={{ color: '#64748b', fontSize: '13px' }}>{timeAgo(log.createdAt)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            )}
                        </div>
                    </>
                )}

                {/* ─── Users ─── */}
                {activeTab === 'users' && (
                    <div className="mod-section">
                        <h2>User Management <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 400 }}>({users.length} active users)</span></h2>
                        <div className="mod-table-container">
                            <table className="mod-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>University Email</th>
                                        <th>Faculty</th>
                                        <th>Joined</th>
                                        <th>Status</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.length === 0 ? (
                                        <tr><td colSpan={6} style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>No users found.</td></tr>
                                    ) : users.map(user => {
                                        const isSuspended = user.suspendedUntil && new Date(user.suspendedUntil) > new Date();
                                        const status = isSuspended ? 'Suspended' : 'Active';
                                        return (
                                            <tr key={user.id}>
                                                <td>{user.fullName || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unknown</span>}</td>
                                                <td>{user.email}</td>
                                                <td style={{ textTransform: 'uppercase', fontSize: '12px', color: '#64748b' }}>{user.faculty || '—'}</td>
                                                <td>{new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                                <td>
                                                    <span className={`mod-status status-${status.toLowerCase()}`}>{status}</span>
                                                    {isSuspended && (
                                                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>
                                                            Until {new Date(user.suspendedUntil).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="text-center">
                                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                        <button className="mod-action-btn" onClick={() => openModal('warn', user)}>Warn</button>
                                                        {!isSuspended && <button className="mod-action-btn danger" onClick={() => openModal('suspend', user)}>Suspend</button>}
                                                        <button className="mod-action-btn danger" onClick={() => openModal('delete', user)}>Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ─── Moderators ─── */}
                {activeTab === 'moderators' && (
                    <div className="mod-section">
                        <h2>Moderator Team <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 400 }}>({moderatorsList.length} active)</span></h2>
                        <div className="mod-table-container">
                            <table className="mod-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {moderatorsList.length === 0 ? (
                                        <tr><td colSpan={4} style={{ textAlign: 'center', color: '#64748b', padding: '30px' }}>No moderators found.</td></tr>
                                    ) : moderatorsList.map(mod => (
                                        <tr key={mod.id}>
                                            <td>{mod.fullName || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unknown</span>}</td>
                                            <td>{mod.email}</td>
                                            <td>
                                                <span style={{ background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 10px', borderRadius: '999px', letterSpacing: '1px' }}>
                                                    {mod.role || 'MODERATOR'}
                                                </span>
                                            </td>
                                            <td>{new Date(mod.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ─── Forum Posts ─── */}
                {activeTab === 'forum' && (
                    <div className="mod-section">
                        <h2>Forum Posts <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 400 }}>({forumPosts.length} total)</span></h2>
                        <p style={{ color: '#64748b', marginBottom: '16px' }}>All posts visible. Click any row to view the post. Anonymous posts reveal the real author identity (highlighted).</p>
                        {postsLoading ? (
                            <p style={{ color: '#64748b' }}>Loading posts…</p>
                        ) : forumPosts.length === 0 ? (
                            <p style={{ color: '#64748b' }}>No forum posts yet.</p>
                        ) : (
                            <div className="mod-table-container">
                                <table className="mod-table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Title</th>
                                            <th>Posted By</th>
                                            <th>Visibility</th>
                                            <th>Votes</th>
                                            <th>Reports</th>
                                            <th>Comments</th>
                                            <th style={{ textAlign: 'center' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {forumPosts.map(post => (
                                            <tr
                                                key={post.id}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => navigate(`/post/${post.id}`)}
                                                onMouseEnter={e => (e.currentTarget.style.background = '#f0f9ff')}
                                                onMouseLeave={e => (e.currentTarget.style.background = '')}
                                            >
                                                <td>{post.id}</td>
                                                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    <span style={{ fontWeight: 600 }}>{post.title}</span>
                                                </td>
                                                <td>
                                                    {post.isAnonymous ? (
                                                        <span>
                                                            <span style={{ color: '#94a3b8', marginRight: '6px' }}>Anonymous</span>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef9c3', color: '#854d0e', fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: 700, border: '1px solid #fde68a' }}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 12, height: 12 }}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg> {post.realName}
                                                            </span>
                                                            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '3px' }}>{post.realEmail}</div>
                                                        </span>
                                                    ) : (
                                                        <span>
                                                            <div style={{ fontWeight: 500 }}>{post.displayName}</div>
                                                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{post.authorEmail || ''}</div>
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '999px', background: post.visibility === 'UNIVERSITY_WIDE' ? '#dbeafe' : post.visibility === 'FACULTY_ONLY' ? '#ede9fe' : '#fef3c7', color: post.visibility === 'UNIVERSITY_WIDE' ? '#1d4ed8' : post.visibility === 'FACULTY_ONLY' ? '#6d28d9' : '#92400e', fontWeight: 700 }}>
                                                        {post.visibility.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td>{post.upvotes}</td>
                                                <td>
                                                    {post.reportCount > 0 ? (
                                                        <span style={{ background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '999px', fontWeight: 'bold', fontSize: '12px' }}>
                                                            {post.reportCount}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#94a3b8' }}>0</span>
                                                    )}
                                                </td>
                                                <td>{post.commentCount}</td>
                                                <td style={{ textAlign: 'center' }}>
                                                    <button
                                                        className="mod-action-btn danger"
                                                        onClick={e => { e.stopPropagation(); handleDeletePost(post.id); }}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Wiki Moderation ─── */}
                {activeTab === 'wiki' && (
                    <div className="mod-section">
                        <h2>Wiki Moderation</h2>

                        {/* Sub-tabs */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '2px solid #1e293b', paddingBottom: '0' }}>
                            <button
                                onClick={() => setWikiSubTab('pending')}
                                style={{ padding: '8px 20px', background: 'none', border: 'none', borderBottom: wikiSubTab === 'pending' ? '2px solid #8b5cf6' : '2px solid transparent', color: wikiSubTab === 'pending' ? '#a78bfa' : '#64748b', fontWeight: 700, fontSize: '14px', cursor: 'pointer', marginBottom: '-2px', transition: 'all 0.15s' }}
                            >
                                Pending Review
                                {pendingWikiArticles.length > 0 && <span style={{ marginLeft: '8px', background: '#ef4444', color: '#fff', borderRadius: '999px', padding: '1px 8px', fontSize: '11px' }}>{pendingWikiArticles.length}</span>}
                            </button>
                            <button
                                onClick={() => setWikiSubTab('all')}
                                style={{ padding: '8px 20px', background: 'none', border: 'none', borderBottom: wikiSubTab === 'all' ? '2px solid #8b5cf6' : '2px solid transparent', color: wikiSubTab === 'all' ? '#a78bfa' : '#64748b', fontWeight: 700, fontSize: '14px', cursor: 'pointer', marginBottom: '-2px', transition: 'all 0.15s' }}
                            >
                                All Articles
                                <span style={{ marginLeft: '8px', background: '#334155', color: '#94a3b8', borderRadius: '999px', padding: '1px 8px', fontSize: '11px' }}>{allWikiArticles.length}</span>
                            </button>
                        </div>

                        {wikiLoading ? (
                            <p style={{ color: '#64748b' }}>Loading wiki articles…</p>
                        ) : wikiSubTab === 'pending' ? (
                            pendingWikiArticles.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '60px 24px', color: '#64748b' }}>
                                    <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 40, height: 40, color: '#94a3b8' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg></div>
                                    <p>No pending wiki articles. All caught up!</p>
                                </div>
                            ) : (
                                <div className="wiki-mod-grid">
                                    {pendingWikiArticles.map((article: any) => (
                                        <WikiModCard
                                            key={article.id}
                                            article={article}
                                            token={getToken()}
                                            onView={() => setPreviewArticle(article)}
                                            onAction={() => {
                                                setPendingWikiArticles(prev => prev.filter(a => a.id !== article.id));
                                                setAllWikiArticles(prev => prev.map(a => a.id === article.id ? { ...a, status: 'APPROVED' } : a));
                                            }}
                                            onDelete={() => {
                                                setPendingWikiArticles(prev => prev.filter(a => a.id !== article.id));
                                                setAllWikiArticles(prev => prev.filter(a => a.id !== article.id));
                                            }}
                                        />
                                    ))}
                                </div>
                            )
                        ) : (
                            /* All Articles table */
                            allWikiArticles.length === 0 ? (
                                <p style={{ color: '#64748b' }}>No wiki articles yet.</p>
                            ) : (
                                <div className="mod-table-container">
                                    <table className="mod-table">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Title</th>
                                                <th>Author</th>
                                                <th>Location</th>
                                                <th>Status</th>
                                                <th>Submitted</th>
                                                <th style={{ textAlign: 'center' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {allWikiArticles.map((article: any) => {
                                                const statusColors: Record<string, { bg: string; color: string }> = {
                                                    APPROVED: { bg: '#dcfce7', color: '#15803d' },
                                                    PENDING:  { bg: '#fef3c7', color: '#92400e' },
                                                    REJECTED: { bg: '#fee2e2', color: '#dc2626' },
                                                };
                                                const sc = statusColors[article.status] || { bg: '#f1f5f9', color: '#64748b' };
                                                return (
                                                    <tr key={article.id}>
                                                        <td>{article.id}</td>
                                                        <td style={{ maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{article.title}</td>
                                                        <td>
                                                            <div>{article.author?.fullName || '—'}</div>
                                                            <div style={{ fontSize: '11px', color: '#64748b' }}>{article.author?.email || ''}</div>
                                                        </td>
                                                        <td style={{ color: '#94a3b8', fontSize: '13px' }}>{article.location || '—'}</td>
                                                        <td>
                                                            <span style={{ background: sc.bg, color: sc.color, fontWeight: 700, fontSize: '11px', padding: '2px 10px', borderRadius: '999px' }}>
                                                                {article.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ color: '#64748b', fontSize: '13px' }}>
                                                            {new Date(article.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                        </td>
                                                        <td style={{ textAlign: 'center' }}>
                                                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                                                <button
                                                                    className="mod-action-btn"
                                                                    onClick={() => setPreviewArticle(article)}
                                                                    style={{ background: 'transparent', border: '1px solid #6366f1', color: '#818cf8' }}
                                                                >
                                                                    View
                                                                </button>
                                                                <button
                                                                    className="mod-action-btn danger"
                                                                    onClick={async () => {
                                                                        const token = getToken();
                                                                        if (!token) return;
                                                                        if (!window.confirm(`Delete "${article.title}" permanently?`)) return;
                                                                        const res = await fetch(`${API_URL}/api/wiki/mod/${article.id}`, {
                                                                            method: 'DELETE',
                                                                            headers: { Authorization: `Bearer ${token}` },
                                                                        });
                                                                        if (res.ok) {
                                                                            setAllWikiArticles(prev => prev.filter(a => a.id !== article.id));
                                                                            setPendingWikiArticles(prev => prev.filter(a => a.id !== article.id));
                                                                        } else {
                                                                            alert('Failed to delete article.');
                                                                        }
                                                                    }}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        )}
                    </div>
                )}

                {/* ─── Audit Logs ─── */}
                {activeTab === 'audit' && (
                    <div className="mod-section">
                        <h2>Audit Logs <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 400 }}>({auditLogs.length} entries)</span></h2>
                        <p style={{ color: '#64748b', marginBottom: '20px' }}>Real-time log of all moderation actions. Read-only.</p>

                        {auditLoading ? (
                            <p style={{ color: '#64748b' }}>Loading logs...</p>
                        ) : auditLogs.length === 0 ? (
                            <p style={{ color: '#64748b' }}>No audit log entries yet.</p>
                        ) : (
                            <div style={{ background: '#0f172a', borderRadius: '10px', padding: '20px', fontFamily: 'monospace', fontSize: '13px', lineHeight: '2', overflowX: 'auto' }}>
                                {auditLogs.map((log: any) => {
                                    const fmt = formatActionType(log.actionType);
                                    const modName = log.moderator?.fullName || 'System';
                                    const ts = new Date(log.createdAt).toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
                                    return (
                                        <div key={log.id}>
                                            <span style={{ color: '#94a3b8' }}>[{ts}]</span>
                                            {' '}
                                            <span style={{ color: fmt.color, fontWeight: 700 }}>{fmt.label}</span>
                                            {' '}by <span style={{ color: '#f1f5f9' }}>{modName}</span>
                                            {' '}→ User <span style={{ color: '#a78bfa' }}>#{log.targetUserId}</span>
                                            {log.reason && <span style={{ color: '#64748b' }}> — {log.reason}</span>}
                                            {log.durationDays && <span style={{ color: '#fbbf24' }}> ({log.durationDays} days)</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Action Modal */}
            {showModal && (
                <div className="mod-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="mod-modal-content" style={{ background: '#1e293b', padding: '30px', borderRadius: '12px', width: '400px', color: '#fff' }}>
                        <h2 style={{ marginTop: 0, marginBottom: '8px' }}>
                            {showModal === 'warn' && 'Warn User'}
                            {showModal === 'suspend' && 'Suspend User'}
                            {showModal === 'delete' && 'Delete User Account'}
                        </h2>
                        <p style={{ marginBottom: '20px', color: '#cbd5e1', fontSize: '14px' }}>
                            Target: <strong style={{ color: '#f1f5f9' }}>{selectedUser?.fullName || selectedUser?.email}</strong>
                            <span style={{ color: '#64748b', marginLeft: '6px' }}>({selectedUser?.email})</span>
                        </p>

                        {showModal === 'suspend' && (
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Suspension Duration:</label>
                                <select
                                    value={suspendDuration}
                                    onChange={e => setSuspendDuration(Number(e.target.value))}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }}
                                >
                                    <option value={1}>1 Day</option>
                                    <option value={3}>3 Days</option>
                                    <option value={7}>7 Days</option>
                                    <option value={14}>14 Days</option>
                                    <option value={30}>30 Days</option>
                                </select>
                            </div>
                        )}

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Reason:</label>
                            <textarea
                                value={actionReason}
                                onChange={e => setActionReason(e.target.value)}
                                rows={4}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #334155', resize: 'vertical', boxSizing: 'border-box' }}
                                placeholder="Clearly state the reason for this action..."
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={() => setShowModal(null)} style={{ padding: '10px 16px', background: 'transparent', color: '#94a3b8', border: '1px solid #475569', borderRadius: '6px', cursor: 'pointer' }}>
                                Cancel
                            </button>
                            <button
                                onClick={handleActionSubmit}
                                disabled={!actionReason.trim()}
                                style={{ padding: '10px 16px', background: showModal === 'warn' ? '#eab308' : '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: !actionReason.trim() ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: !actionReason.trim() ? 0.6 : 1 }}
                            >
                                Confirm {showModal === 'warn' ? 'Warning' : showModal === 'suspend' ? 'Suspension' : 'Deletion'}
                            </button>
                        </div>
                    </div>
                </div>
            {/* Wiki Article Preview Modal */}
            {previewArticle && (
                <WikiArticlePreviewModal
                    article={previewArticle}
                    onClose={() => setPreviewArticle(null)}
                />
            )}
        </div>
    );
};

export default ModDashboard;
