import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/home.css';
// import logo from '../assets/PeraWaveLogo.png';
import userAvatarImg from '../assets/UserAvatar.png';
import { API_URL } from '../config';
import { getToken, clearToken } from '../utils/auth';

// SVG icon helpers
const IconGlobe = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'12px',height:'12px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>;
const IconBuilding = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'12px',height:'12px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>;
const IconAcademic = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'12px',height:'12px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>;
const IconHome = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'13px',height:'13px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>;
const IconMask = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'12px',height:'12px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" /></svg>;
const IconUpvote = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" style={{width:'14px',height:'14px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>;
const IconChat = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'14px',height:'14px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>;
const IconChart = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'15px',height:'15px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>;
const IconPencil = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'15px',height:'15px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>;

const VISIBILITY_LABELS: Record<string, { label: string; badgeClass: string; Icon: () => React.ReactElement }> = {
    UNIVERSITY_WIDE: { label: 'University-Wide', badgeClass: 'badge-university', Icon: IconGlobe },
    FACULTY_ONLY: { label: 'Faculty-Only', badgeClass: 'badge-faculty', Icon: IconBuilding },
    BATCH_ONLY: { label: 'Batch-Only', badgeClass: 'badge-batch', Icon: IconAcademic },
};

const Home: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState({
        name: "",
        avatar: userAvatarImg,
        isSuspended: false,
        suspensionReason: ""
    });
    const [notifications, setNotifications] = useState<any[]>([]);
    const [posts, setPosts] = useState<any[]>([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'UNIVERSITY_WIDE' | 'FACULTY_ONLY' | 'BATCH_ONLY'>('all');
    const [sortBy, setSortBy] = useState<'date' | 'votes'>('date');

    useEffect(() => {
        const token = getToken();

        // Pre-populate from cache to avoid flash of empty/guest name
        const cached = sessionStorage.getItem('cachedUser');
        if (cached) {
            try {
                const c = JSON.parse(cached);
                const isSuspended = c.suspendedUntil && new Date(c.suspendedUntil) > new Date();
                setUser({ name: c.fullName || "", avatar: userAvatarImg, isSuspended, suspensionReason: c.suspensionReason || "" });
            } catch {}
        }

        const fetchUser = async () => {
            if (!token) { navigate('/login'); return; }
            try {
                const response = await fetch(`${API_URL}/api/auth/me`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const data = await response.json();
                    const isSuspended = data.suspendedUntil && new Date(data.suspendedUntil) > new Date();
                    const fresh = {
                        name: data.fullName,
                        avatar: userAvatarImg,
                        isSuspended,
                        suspensionReason: data.suspensionReason || ""
                    };
                    setUser(fresh);
                    // Update the cache so dashboard also gets fresh data
                    sessionStorage.setItem('cachedUser', JSON.stringify({
                        fullName: data.fullName,
                        email: data.email,
                        faculty: data.faculty,
                        registrationNumber: data.registrationNumber,
                        joinDate: data.createdAt,
                        suspendedUntil: data.suspendedUntil || null,
                        suspensionReason: data.suspensionReason || ""
                    }));
                } else {
                    clearToken();
                    sessionStorage.removeItem('cachedUser');
                    navigate('/login');
                }
            } catch (err) {
                console.error("Error fetching user data", err);
            }
        };

        if (location.state && location.state.user) {
            const loggedInUser = location.state.user;
            const isSuspended = loggedInUser.suspendedUntil && new Date(loggedInUser.suspendedUntil) > new Date();
            setUser({
                name: loggedInUser.fullName || "User",
                avatar: userAvatarImg,
                isSuspended,
                suspensionReason: loggedInUser.suspensionReason || ""
            });
        } else {
            fetchUser();
        }

        if (token) {
            // Fetch notifications
            fetch(`${API_URL}/api/auth/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(r => r.ok ? r.json() : [])
                .then(setNotifications)
                .catch(() => { });

            // Fetch real forum posts
            setPostsLoading(true);
            fetch(`${API_URL}/api/forum/posts`, {
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
        const token = getToken();
        if (!token) return;
        await fetch(`${API_URL}/api/auth/notifications/read`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
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

    const queryParams = new URLSearchParams(location.search);
    const searchFilter = queryParams.get('search') || '';

    const filteredPosts = (activeFilter === 'all'
        ? posts
        : posts.filter(p => p.visibility === activeFilter)
    ).filter(p => {
        if (searchFilter) {
            const q = searchFilter.toLowerCase();
            return p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q);
        }
        return true;
    }).slice().sort((a, b) =>
        sortBy === 'votes'
            ? b.upvotes - a.upvotes
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const handleDeletePost = async (postId: number) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        const token = getToken();
        try {
            const response = await fetch(`${API_URL}/api/forum/posts/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setPosts(prev => prev.filter(p => p.id !== postId));
            } else {
                alert('Failed to delete post.');
            }
        } catch (error) {
            console.error('Failed to delete post:', error);
        }
    };

    const handleLogout = () => {
        clearToken();
        sessionStorage.removeItem('cachedUser');
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
                userRole="USER"
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
                                {([{ f: 'all', label: 'All Posts', Icon: IconHome }, { f: 'UNIVERSITY_WIDE', label: 'University-Wide', Icon: IconGlobe }, { f: 'FACULTY_ONLY', label: 'Faculty-Only', Icon: IconBuilding }, { f: 'BATCH_ONLY', label: 'Batch-Only', Icon: IconAcademic }] as const).map(({ f, label, Icon }) => (
                                    <button
                                        key={f}
                                        className={`sidebar-link ${activeFilter === (f as any) ? 'active' : ''}`}
                                        onClick={() => setActiveFilter(f as any)}
                                    >
                                        <Icon />{label}
                                    </button>
                                ))}
                            </div>


                        </aside>

                        {/* Main Feed */}
                        <main className="home-feed">
                            {/* Mobile-only search bar (navbar search hidden on mobile) */}
                            <div className="mobile-search-bar" style={{ display: 'none' }}>
                                <div style={{ position: 'relative' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#94a3b8" style={{ width: '16px', height: '16px', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0016.803 15.803z" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search posts..."
                                        style={{
                                            width: '100%', boxSizing: 'border-box',
                                            padding: '10px 12px 10px 36px',
                                            borderRadius: '10px',
                                            border: '1px solid var(--border-color)',
                                            background: 'var(--bg-card)',
                                            fontSize: '14px',
                                            color: 'var(--text-primary)',
                                            outline: 'none',
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const val = e.currentTarget.value.trim();
                                                navigate(val ? `/home?search=${encodeURIComponent(val)}` : '/home');
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Create Post Input Box */}
                            <div className="create-post-card">
                                <img src={user.avatar} alt="Profile" className="home-avatar" />
                                <input type="text" placeholder="Create a new post..." onClick={() => navigate('/create-post')} readOnly />
                                <button className="create-post-btn" id="create-post-btn" onClick={() => navigate('/create-post')}>Post</button>
                            </div>

                            {/* Filter + Sort Chips */}
                            <div className="feed-filters">
                                {/* Sort toggle */}
                                <div className="sort-chips">
                                    <span className="sort-label">Sort:</span>
                                    {([{ value: 'date', label: 'Newest' }, { value: 'votes', label: 'Top Voted' }] as const).map(opt => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setSortBy(opt.value)}
                                            className={`chip-btn ${sortBy === opt.value ? 'active' : ''}`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Search Results Header */}
                            {searchFilter && (
                                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <div style={{ color: '#1e3a8a', fontSize: '14px' }}>
                                        Showing results for: <strong style={{ fontSize: '16px' }}>"{searchFilter}"</strong>
                                    </div>
                                    <button 
                                        onClick={() => navigate('/home')}
                                        style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'14px',height:'14px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                        Clear Search
                                    </button>
                                </div>
                            )}

                            {/* Feed Posts */}
                            {postsLoading ? (
                                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'20px',height:'20px',animation:'spin 1s linear infinite'}}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                                    Loading posts...
                                </div>
                            ) : filteredPosts.length === 0 ? (
                                <div className="empty-state">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width:'48px',height:'48px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
                                    <div>
                                        <h3>No posts found</h3>
                                        <p>Be the first to start a discussion in this feed.</p>
                                    </div>
                                    <button
                                        className="empty-btn"
                                        onClick={() => navigate('/create-post')}
                                    >
                                        Create Post
                                    </button>
                                </div>
                            ) : (
                                <div className="forum-posts-list">
                                    {filteredPosts.map(post => {
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
                                                        <span className={`badge ${vis.badgeClass}`}>
                                                            <vis.Icon /> {vis.label}
                                                        </span>
                                                    )}
                                                    {post.isAnonymous && (
                                                        <span className="badge badge-anonymous">
                                                            <IconMask /> Anonymous
                                                        </span>
                                                    )}
                                                    <span className="post-meta">
                                                        • by{' '}
                                                        {post.authorId && !post.isAnonymous ? (
                                                            <span
                                                                style={{ color: 'var(--accent-color)', cursor: 'pointer', fontWeight: 600 }}
                                                                onClick={e => { e.stopPropagation(); navigate(`/user/${post.authorId}`); }}
                                                            >
                                                                {post.displayName}
                                                            </span>
                                                        ) : post.displayName} • {timeAgo(post.createdAt)}
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
                                                        <IconUpvote /> {post.upvotes}
                                                    </button>
                                                    <button
                                                        className="post-action-btn"
                                                        onClick={e => { e.stopPropagation(); navigate(`/post/${post.id}`); }}
                                                    >
                                                        <IconChat />
                                                        {post.commentCount} Comments
                                                    </button>
                                                    {post.isAuthor && (
                                                        <button
                                                            className="post-action-btn delete"
                                                            onClick={e => { e.stopPropagation(); handleDeletePost(post.id); }}
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </main>

                        {/* Right Sidebar - Widgets */}
                        <aside className="home-widgets">
                            <div className="widget-card">
                                <h3 className="widget-title"><IconChart /> Feed Stats</h3>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {[
                                        { label: 'Total Posts', count: posts.length },
                                        { label: 'University-Wide', count: posts.filter(p => p.visibility === 'UNIVERSITY_WIDE').length },
                                        { label: 'Faculty-Only', count: posts.filter(p => p.visibility === 'FACULTY_ONLY').length },
                                        { label: 'Batch-Only', count: posts.filter(p => p.visibility === 'BATCH_ONLY').length },
                                    ].map(s => (
                                        <div key={s.label} className="stat-row">
                                            <span>{s.label}</span>
                                            <strong>{s.count}</strong>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="widget-card widget-cta">
                                <h3 className="widget-title"><IconPencil /> New Post</h3>
                                <p>
                                    Start a discussion, ask a question, or share an announcement with the community.
                                </p>
                                <button
                                    id="widget-create-post-btn"
                                    className="widget-btn"
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
