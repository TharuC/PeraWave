import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/mod-dashboard.css';
import adminAvatar from '../assets/AdminAvatar.png';
import { API_URL } from '../config';
import { clearToken } from '../utils/auth';

const TAB_TITLES: Record<string, string> = {
    overview: 'Overview Analytics',
    users: 'User Management',
    moderators: 'Moderator Team',
    forum: 'Forum Posts',
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

    // --- Modal State ---
    const [showModal, setShowModal] = useState<'warn' | 'suspend' | 'delete' | null>(null);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [actionReason, setActionReason] = useState('');
    const [suspendDuration, setSuspendDuration] = useState(1);

    const getToken = () => {
        const token = sessionStorage.getItem('token') ?? localStorage.getItem('token');
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

        } catch (err) {
            console.error('Failed to load dashboard data', err);
            setPostsLoading(false);
            setAuditLoading(false);
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
                                                            <span style={{ background: '#fef9c3', color: '#854d0e', fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: 700, border: '1px solid #fde68a' }}>
                                                                🔑 {post.realName}
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
            )}
        </div>
    );
};

export default ModDashboard;
