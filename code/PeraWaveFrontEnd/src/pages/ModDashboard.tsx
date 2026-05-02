import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/mod-dashboard.css';
import adminAvatar from '../assets/AdminAvatar.png';

const ModDashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('overview');

    const [modData, setModData] = useState({
        fullName: "Admin Sam",
        email: "admin@perawave.com",
    });

    useEffect(() => {
        if (location.state && location.state.user) {
            const user = location.state.user;
            setModData(prev => ({
                ...prev,
                fullName: user.fullName || prev.fullName,
                email: user.email || prev.email,
            }));
        }
    }, [location]);

    const [users, setUsers] = useState<any[]>([]);
    const [forumPosts, setForumPosts] = useState<any[]>([]);
    const [postsLoading, setPostsLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            const token = localStorage.getItem('token');
            if (!token) return navigate('/mods');

            try {
                const res = await fetch('http://localhost:5000/api/mod/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUsers(data);
                } else {
                    if (res.status === 401 || res.status === 403) {
                        localStorage.removeItem('token');
                        navigate('/mods');
                    }
                }
            } catch (err) {
                console.error("Failed to fetch users", err);
            }
        };

        fetchUsers();

        // Fetch all forum posts (mod sees everything)
        const fetchPosts = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            setPostsLoading(true);
            try {
                const res = await fetch('http://localhost:5000/api/forum/posts', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setForumPosts(await res.json());
            } catch (err) {
                console.error('Failed to fetch forum posts', err);
            } finally {
                setPostsLoading(false);
            }
        };
        fetchPosts();
    }, [navigate]);

    const [showModal, setShowModal] = useState<'warn' | 'suspend' | 'delete' | null>(null);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [actionReason, setActionReason] = useState('');
    const [suspendDuration, setSuspendDuration] = useState(1);

    const handleActionSubmit = async () => {
        if (!selectedUser || !actionReason) return;

        let endpoint = '';
        let body: any = { targetUserId: selectedUser.id, reason: actionReason };

        if (showModal === 'warn') {
            endpoint = '/api/mod/users/warn';
        } else if (showModal === 'suspend') {
            endpoint = '/api/mod/users/suspend';
            body.durationDays = suspendDuration;
        } else if (showModal === 'delete') {
            endpoint = '/api/mod/users/delete';
        }

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                alert(`Action ${showModal} performed successfully.`);
                setShowModal(null);
                setActionReason('');
                setSuspendDuration(1);
                // Refresh users
                const usersRes = await fetch('http://localhost:5000/api/mod/users');
                if (usersRes.ok) {
                    setUsers(await usersRes.json());
                }
            } else {
                alert('Failed to perform action.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const openModal = (type: 'warn' | 'suspend' | 'delete', user: any) => {
        setSelectedUser(user);
        setShowModal(type);
        setActionReason('');
    };

    const handleDeletePost = async (postId: number) => {
        if (!window.confirm('Delete this post permanently?')) return;
        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/forum/posts/${postId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setForumPosts(prev => prev.filter(p => p.id !== postId));
        else alert('Failed to delete post.');
    };

    const mockReports = [
        { id: 101, user: "John Doe", reason: "Inappropriate Content", date: "2026-05-01", status: "Unresolved" },
        { id: 102, user: "Jane Doe", reason: "Spam", date: "2026-04-30", status: "Resolved" },
        { id: 103, user: "Alice Smith", reason: "Harassment", date: "2026-04-29", status: "Unresolved" },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/mods');
    };

    return (
        <div className="mod-dashboard-page">
            {/* Sidebar */}
            <div className="mod-sidebar">
                {/* Large Profile at Top Left */}
                <div className="mod-sidebar-profile" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #334155' }}>
                    <img
                        src={adminAvatar}
                        alt="Admin Avatar"
                        style={{
                            width: '100px',
                            height: '100px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            backgroundColor: '#fff',
                            border: '4px solid #fff',
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                            marginBottom: '16px'
                        }}
                    />
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '26px', fontWeight: 700, color: '#fff' }}>{modData.fullName}</h2>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '15px' }}>{modData.email}</p>
                </div>

                <div style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', fontWeight: 'bold', marginBottom: '15px', letterSpacing: '1px' }}>
                    Moderator Dashboard
                </div>

                <div className="mod-nav-links">
                    <div
                        className={`mod-nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview Analytics
                    </div>
                    <div
                        className={`mod-nav-link ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        User Management
                    </div>
                    <div
                        className={`mod-nav-link ${activeTab === 'reports' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reports')}
                    >
                        Reported Content
                    </div>
                    <div
                        className={`mod-nav-link ${activeTab === 'forum' ? 'active' : ''}`}
                        onClick={() => setActiveTab('forum')}
                    >
                        Forum Posts
                    </div>
                    <div
                        className={`mod-nav-link ${activeTab === 'audit' ? 'active' : ''}`}
                        onClick={() => setActiveTab('audit')}
                    >
                        Audit Logs
                    </div>
                </div>
            </div>

            {/* Main Content (Scrollable) */}
            <div className="mod-main-content">
                <div className="mod-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('s', ' Management').replace('rtManagement', 'rts').replace('erview Management', 'erview').replace('dit', 'dit Logs')}</h1>
                    <button className="mod-logout-btn" onClick={handleLogout}>Log Out</button>
                </div>

                {/* Dashboard Tabs Content */}
                {activeTab === 'overview' && (
                    <>
                        <div className="mod-stats-grid">
                            <div className="mod-stat-card">
                                <h3>Total Users</h3>
                                <p>{users.length}</p>
                            </div>
                            <div className="mod-stat-card">
                                <h3>Pending Approvals</h3>
                                <p style={{ color: '#ca8a04' }}>14</p>
                            </div>
                            <div className="mod-stat-card">
                                <h3>Active Reports</h3>
                                <p style={{ color: '#ef4444' }}>7</p>
                            </div>
                            <div className="mod-stat-card">
                                <h3>New Users (Today)</h3>
                                <p>23</p>
                            </div>
                        </div>

                        <div className="mod-section">
                            <h2>Recent Activity</h2>
                            <table className="mod-table">
                                <thead>
                                    <tr>
                                        <th>Action</th>
                                        <th>Moderator</th>
                                        <th>Target User/Post</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Approved User Registration</td>
                                        <td>Admin_Sam</td>
                                        <td>Diana Prince</td>
                                        <td>10 mins ago</td>
                                    </tr>
                                    <tr>
                                        <td>Suspended User (3 days)</td>
                                        <td>Admin_Sam</td>
                                        <td>Bob Jones</td>
                                        <td>1 hour ago</td>
                                    </tr>
                                    <tr>
                                        <td>Deleted Post (Spam)</td>
                                        <td>Mod_Sarah</td>
                                        <td>Post #8492</td>
                                        <td>3 hours ago</td>
                                    </tr>
                                    <tr>
                                        <td>Resolved Report #102</td>
                                        <td>Mod_Sarah</td>
                                        <td>Jane Doe</td>
                                        <td>5 hours ago</td>
                                    </tr>
                                    <tr>
                                        <td>System Config Update</td>
                                        <td>SuperAdmin</td>
                                        <td>Maintenance Mode OFF</td>
                                        <td>1 day ago</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {activeTab === 'users' && (
                    <div className="mod-section">
                        <h2>User Management</h2>
                        <table className="mod-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>University Email</th>
                                    <th>Joined Date</th>
                                    <th>Status</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => {
                                    const isSuspended = user.suspendedUntil && new Date(user.suspendedUntil) > new Date();
                                    const status = isSuspended ? 'Suspended' : 'Active';
                                    return (
                                        <tr key={user.id}>
                                            <td>{user.fullName || 'Unknown'}</td>
                                            <td>{user.email}</td>
                                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`mod-status status-${status.toLowerCase()}`}>
                                                    {status}
                                                </span>
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
                )}

                {activeTab === 'reports' && (
                    <div className="mod-section">
                        <h2>Reported Content</h2>
                        <table className="mod-table">
                            <thead>
                                <tr>
                                    <th>Report ID</th>
                                    <th>Reported User/Post</th>
                                    <th>Reason</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mockReports.map(report => (
                                    <tr key={report.id}>
                                        <td>#{report.id}</td>
                                        <td>{report.user}</td>
                                        <td>{report.reason}</td>
                                        <td>{report.date}</td>
                                        <td>
                                            <span className={`mod-status ${report.status === 'Resolved' ? 'status-active' : 'status-pending'}`}>
                                                {report.status}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                                <button className="mod-action-btn">Review</button>
                                                <button className="mod-action-btn danger">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'forum' && (
                    <div className="mod-section">
                        <h2>Forum Posts Management</h2>
                        <p style={{ color: '#64748b', marginBottom: '16px' }}>All posts are visible here. Anonymous posts show the real author identity highlighted in gold.</p>
                        {postsLoading ? (
                            <p style={{ color: '#64748b' }}>Loading posts…</p>
                        ) : forumPosts.length === 0 ? (
                            <p style={{ color: '#64748b' }}>No forum posts yet.</p>
                        ) : (
                            <table className="mod-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Title</th>
                                        <th>Posted By</th>
                                        <th>Visibility</th>
                                        <th>Votes</th>
                                        <th>Comments</th>
                                        <th style={{ textAlign: 'center' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {forumPosts.map(post => (
                                        <tr key={post.id}>
                                            <td>{post.id}</td>
                                            <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</td>
                                            <td>
                                                {post.isAnonymous ? (
                                                    <span>
                                                        <span style={{ color: '#94a3b8', marginRight: '6px' }}>Anonymous</span>
                                                        <span style={{ background: '#fef9c3', color: '#854d0e', fontSize: '11px', padding: '2px 8px', borderRadius: '999px', fontWeight: 700, border: '1px solid #fde68a' }}>
                                                            🔑 {post.realName} ({post.realEmail})
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span>{post.displayName}</span>
                                                )}
                                            </td>
                                            <td>
                                                <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '999px', background: post.visibility === 'UNIVERSITY_WIDE' ? '#dbeafe' : post.visibility === 'FACULTY_ONLY' ? '#ede9fe' : '#fef3c7', color: post.visibility === 'UNIVERSITY_WIDE' ? '#1d4ed8' : post.visibility === 'FACULTY_ONLY' ? '#6d28d9' : '#92400e', fontWeight: 700 }}>
                                                    {post.visibility.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td>{post.upvotes}</td>
                                            <td>{post.commentCount}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button className="mod-action-btn danger" onClick={() => handleDeletePost(post.id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div className="mod-section">
                        <h2>System Audit Logs</h2>
                        <p style={{ color: '#64748b', marginBottom: '20px' }}>Detailed logs of all moderator and admin actions for transparency. This view is read-only.</p>

                        <div style={{ background: '#0f172a', color: '#4ade80', padding: '20px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.6', overflowX: 'auto' }}>
                            <span style={{ color: '#94a3b8' }}>[2026-05-01 01:15:02]</span> SYSTEM: Admin_Sam logged in via /mods.<br />
                            <span style={{ color: '#94a3b8' }}>[2026-05-01 01:17:45]</span> ACTION: Admin_Sam updated system setting: Maintenance Mode = OFF.<br />
                            <span style={{ color: '#94a3b8' }}>[2026-05-01 01:42:10]</span> ACCESS: Mod_Sarah accessed User Management tab.<br />
                            <span style={{ color: '#94a3b8' }}>[2026-05-01 01:45:00]</span> ACTION: Admin_Sam approved user registration (ID: 4 - Diana Prince).<br />
                            <span style={{ color: '#94a3b8' }}>[2026-05-01 01:50:22]</span> ACTION: Mod_Sarah suspended user (ID: 2 - Bob Jones) for 3 days. Reason: Repeated spam.<br />
                            <span style={{ color: '#94a3b8' }}>[2026-05-01 02:01:05]</span> SYSTEM: Mod_Sarah logged out.<br />
                            <span style={{ color: '#94a3b8' }}>[2026-05-01 02:15:30]</span> ACTION: Admin_Sam permanently deleted post #8492.<br />
                            <span style={{ color: '#94a3b8' }}>[2026-05-01 02:30:00]</span> SYSTEM: Automated backup completed successfully.<br />
                        </div>
                    </div>
                )}

            </div>

            {/* Modals for actions */}
            {showModal && (
                <div className="mod-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="mod-modal-content" style={{ background: '#1e293b', padding: '30px', borderRadius: '12px', width: '400px', color: '#fff' }}>
                        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
                            {showModal === 'warn' && 'Warn User'}
                            {showModal === 'suspend' && 'Suspend User'}
                            {showModal === 'delete' && 'Delete User'}
                        </h2>
                        <p style={{ marginBottom: '20px', color: '#cbd5e1' }}>
                            Target: <strong>{selectedUser?.fullName || selectedUser?.email}</strong>
                        </p>

                        {showModal === 'suspend' && (
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '8px' }}>Suspension Duration:</label>
                                <select
                                    value={suspendDuration}
                                    onChange={e => setSuspendDuration(Number(e.target.value))}
                                    style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #334155' }}
                                >
                                    <option value={1}>1 Day</option>
                                    <option value={2}>2 Days</option>
                                    <option value={7}>7 Days</option>
                                    <option value={14}>14 Days</option>
                                    <option value={30}>30 Days</option>
                                </select>
                            </div>
                        )}

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Reason:</label>
                            <textarea
                                value={actionReason}
                                onChange={e => setActionReason(e.target.value)}
                                rows={4}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#0f172a', color: '#fff', border: '1px solid #334155', resize: 'vertical' }}
                                placeholder="Clearly mention the reason..."
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                onClick={() => setShowModal(null)}
                                style={{ padding: '10px 16px', background: 'transparent', color: '#94a3b8', border: '1px solid #475569', borderRadius: '6px', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleActionSubmit}
                                style={{ padding: '10px 16px', background: showModal === 'warn' ? '#eab308' : '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModDashboard;
