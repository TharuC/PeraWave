import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/home.css';
import logo from '../assets/PeraWaveLogo.png';

const VISIBILITY_LABELS: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  UNIVERSITY_WIDE: { label: 'University-Wide', color: '#1d4ed8', bg: '#dbeafe', icon: '🌐' },
  FACULTY_ONLY:    { label: 'Faculty-Only',    color: '#6d28d9', bg: '#ede9fe', icon: '🏛️' },
  BATCH_ONLY:      { label: 'Batch-Only',      color: '#92400e', bg: '#fef3c7', icon: '🎓' },
};

const Home: React.FC = () => {
    const navigate  = useNavigate();
    const location  = useLocation();

    const [user, setUser] = useState({
        name: "Guest",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
        isSuspended: false,
        suspensionReason: ""
    });
    const [notifications, setNotifications] = useState<any[]>([]);
    const [posts,         setPosts]         = useState<any[]>([]);
    const [postsLoading,  setPostsLoading]  = useState(true);
    const [activeFilter,  setActiveFilter]  = useState<'all' | 'UNIVERSITY_WIDE' | 'FACULTY_ONLY' | 'BATCH_ONLY'>('all');

    useEffect(() => {
        const token = localStorage.getItem('token');

        const fetchUser = async () => {
            if (!token) { navigate('/login'); return; }
            try {
                const response = await fetch('http://localhost:5000/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    const isSuspended = data.suspendedUntil && new Date(data.suspendedUntil) > new Date();
                    setUser({
                        name: data.fullName,
                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.fullName}`,
                        isSuspended,
                        suspensionReason: data.suspensionReason || ""
                    });
                } else {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } catch (err) {
                console.error("Error fetching user data", err);
            }
        };

        if (location.state && location.state.user) {
            const loggedInUser = location.state.user;
            const isSuspended  = loggedInUser.suspendedUntil && new Date(loggedInUser.suspendedUntil) > new Date();
            setUser({
                name: loggedInUser.fullName || "User",
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${loggedInUser.fullName || "User"}`,
                isSuspended,
                suspensionReason: loggedInUser.suspensionReason || ""
            });
        } else {
            fetchUser();
        }

        if (token) {
            // Fetch notifications
            fetch('http://localhost:5000/api/auth/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(r => r.ok ? r.json() : [])
                .then(setNotifications)
                .catch(() => {});

            // Fetch real forum posts
            setPostsLoading(true);
            fetch('http://localhost:5000/api/forum/posts', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(r => r.ok ? r.json() : [])
                .then(data => { setPosts(Array.isArray(data) ? data : []); })
                .catch(() => setPosts([]))
                .finally(() => setPostsLoading(false));
        }
    }, [location, navigate]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAllRead = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        await fetch('http://localhost:5000/api/auth/notifications/read', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };


    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1)  return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs  < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    const filteredPosts = activeFilter === 'all'
        ? posts
        : posts.filter(p => p.visibility === activeFilter);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };

    return (
        <div className="home-page">
            {/* Navigation Bar */}
            <Navbar
                isLoggedIn={true}
                onLogout={handleLogout}
                userName={user.name}
                userAvatar={user.avatar}
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAllRead={markAllRead}
            />

            <div className="home-container">
                {user.isSuspended ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '60vh', textAlign: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '80px', height: '80px', color: '#ef4444', marginBottom: '20px' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h1 style={{ color: '#1e293b', fontSize: '32px', marginBottom: '10px' }}>Account Suspended</h1>
                        <p style={{ color: '#64748b', fontSize: '18px', maxWidth: '500px', lineHeight: '1.6' }}>
                            Your account is temporarily suspended and you cannot access the forums at this time.
                        </p>
                        <div style={{ background: '#fee2e2', padding: '15px', borderRadius: '8px', border: '1px solid #fecaca', marginTop: '20px', maxWidth: '500px', width: '100%' }}>
                            <p style={{ color: '#991b1b', margin: 0, fontWeight: 'bold' }}>Reason for Suspension:</p>
                            <p style={{ color: '#b91c1c', margin: '5px 0 0 0' }}>{user.suspensionReason}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Left Sidebar */}
                        <aside className="home-sidebar">
                            <div className="sidebar-section">
                                <div className="sidebar-title">Feeds</div>
                                {(['all', 'UNIVERSITY_WIDE', 'FACULTY_ONLY', 'BATCH_ONLY'] as const).map(f => {
                                    const labels: Record<string, string> = {
                                        all: '🏠 All Posts',
                                        UNIVERSITY_WIDE: '🌐 University-Wide',
                                        FACULTY_ONLY:    '🏛️ Faculty-Only',
                                        BATCH_ONLY:      '🎓 Batch-Only',
                                    };
                                    return (
                                        <button
                                            key={f}
                                            className={`sidebar-link${activeFilter === f ? ' active' : ''}`}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', fontFamily: 'Inter, sans-serif' }}
                                            onClick={() => setActiveFilter(f)}
                                        >
                                            {labels[f]}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="sidebar-section">
                                <div className="sidebar-title">Faculties (Forums)</div>
                                <Link to="/home" className="sidebar-link">Engineering</Link>
                                <Link to="/home" className="sidebar-link">Science</Link>
                                <Link to="/home" className="sidebar-link">Arts</Link>
                                <Link to="/home" className="sidebar-link">Medicine</Link>
                                <Link to="/home" className="sidebar-link">Management</Link>
                                <Link to="/home" className="sidebar-link">Agriculture</Link>
                            </div>
                        </aside>

                        {/* Main Feed */}
                        <main className="home-feed">
                            {/* Create Post Input Box */}
                            <div className="create-post-card">
                                <img src={user.avatar} alt="Profile" className="home-avatar" />
                                <input type="text" placeholder="Create a new post..." onClick={() => navigate('/create-post')} readOnly />
                                <button className="create-post-btn" id="create-post-btn" onClick={() => navigate('/create-post')}>Post</button>
                            </div>

                            {/* Filter Chips */}
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {(['all', 'UNIVERSITY_WIDE', 'FACULTY_ONLY', 'BATCH_ONLY'] as const).map(f => {
                                    const labels: Record<string, string> = {
                                        all: '🏠 All',
                                        UNIVERSITY_WIDE: '🌐 University',
                                        FACULTY_ONLY:    '🏛️ Faculty',
                                        BATCH_ONLY:      '🎓 Batch',
                                    };
                                    return (
                                        <button
                                            key={f}
                                            onClick={() => setActiveFilter(f)}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '999px',
                                                border: '1.5px solid',
                                                borderColor: activeFilter === f ? '#2563eb' : '#e2e8f0',
                                                background: activeFilter === f ? '#eff6ff' : '#fff',
                                                color: activeFilter === f ? '#1d4ed8' : '#64748b',
                                                fontWeight: 600,
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                fontFamily: 'Inter, sans-serif',
                                            }}
                                        >
                                            {labels[f]}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Feed Posts */}
                            {postsLoading ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>⏳ Loading posts…</div>
                            ) : filteredPosts.length === 0 ? (
                                <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
                                    <p style={{ fontWeight: 600, fontSize: '16px', color: '#475569' }}>No posts yet in this category.</p>
                                    <p style={{ fontSize: '14px' }}>Be the first to start a discussion!</p>
                                    <button
                                        style={{ marginTop: '16px', padding: '10px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
                                        onClick={() => navigate('/create-post')}
                                    >
                                        Create a Post
                                    </button>
                                </div>
                            ) : (
                                filteredPosts.map(post => {
                                    const vis = VISIBILITY_LABELS[post.visibility];
                                    return (
                                        <article
                                            key={post.id}
                                            className="forum-post"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/post/${post.id}`)}
                                        >
                                            <div className="post-header">
                                                {vis && (
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                        padding: '3px 10px', borderRadius: '999px', fontSize: '11px',
                                                        fontWeight: 700, background: vis.bg, color: vis.color
                                                    }}>
                                                        {vis.icon} {vis.label}
                                                    </span>
                                                )}
                                                {post.isAnonymous && (
                                                    <span style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                        padding: '3px 10px', borderRadius: '999px', fontSize: '11px',
                                                        fontWeight: 700, background: '#f1f5f9', color: '#475569'
                                                    }}>
                                                        🎭 Anonymous
                                                    </span>
                                                )}
                                                <span className="post-meta">
                                                    • by {post.displayName} • {timeAgo(post.createdAt)}
                                                </span>
                                            </div>

                                            <h2 className="post-title">{post.title}</h2>
                                            <p className="post-content" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {post.content}
                                            </p>

                                            <div className="post-actions">
                                                <button
                                                    className="post-action-btn"
                                                    onClick={e => { e.stopPropagation(); navigate(`/post/${post.id}`); }}
                                                >
                                                    ▲ {post.upvotes}
                                                </button>
                                                <button
                                                    className="post-action-btn"
                                                    onClick={e => { e.stopPropagation(); navigate(`/post/${post.id}`); }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "16px", height: "16px" }}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                                                    </svg>
                                                    {post.commentCount} Comments
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })
                            )}
                        </main>

                        {/* Right Sidebar - Widgets */}
                        <aside className="home-widgets">
                            <div className="widget-card">
                                <h3 className="widget-title">📊 Feed Stats</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {[
                                        { label: 'Total Posts',      count: posts.length },
                                        { label: 'University-Wide',  count: posts.filter(p => p.visibility === 'UNIVERSITY_WIDE').length },
                                        { label: 'Faculty-Only',     count: posts.filter(p => p.visibility === 'FACULTY_ONLY').length },
                                        { label: 'Batch-Only',       count: posts.filter(p => p.visibility === 'BATCH_ONLY').length },
                                    ].map(s => (
                                        <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                                            <span style={{ color: '#64748b' }}>{s.label}</span>
                                            <strong>{s.count}</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="widget-card" style={{ background: 'linear-gradient(135deg, #e0e7ff, #ede9fe)' }}>
                                <h3 className="widget-title" style={{ borderBottomColor: '#c7d2fe' }}>✨ New Post</h3>
                                <p style={{ fontSize: '14px', color: '#475569', marginBottom: '15px' }}>
                                    Start a discussion, ask a question, or share an announcement.
                                </p>
                                <button
                                    id="widget-create-post-btn"
                                    style={{ width: '100%', padding: '10px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                                    onClick={() => navigate('/create-post')}
                                >
                                    Create Post
                                </button>
                            </div>
                        </aside>
                    </>
                )}
            </div>
        </div>
    );
};

export default Home;
