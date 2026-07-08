import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/dashboard.css';
import userAvatarImg from '../assets/UserAvatar.png';
import { API_URL } from '../config';
import { getToken, clearToken } from '../utils/auth';

interface PublicProfile {
    id: number;
    fullName: string;
    faculty: string | null;
    batch: string | null;
    joinedAt: string;
}

const UserProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [profile, setProfile] = useState<PublicProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentUserName, setCurrentUserName] = useState('');

    useEffect(() => {
        const token = getToken();
        if (!token) { navigate('/login'); return; }

        // Get current user's name for the navbar
        const cached = sessionStorage.getItem('cachedUser');
        if (cached) {
            try { setCurrentUserName(JSON.parse(cached).fullName || ''); } catch {}
        }

        // Fetch the public profile
        setLoading(true);
        fetch(`${API_URL}/api/auth/users/${id}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => {
                if (r.status === 404) throw new Error('User not found');
                if (!r.ok) throw new Error('Failed to load profile');
                return r.json();
            })
            .then((data: PublicProfile) => setProfile(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id, navigate]);

    const handleLogout = () => {
        clearToken();
        sessionStorage.removeItem('cachedUser');
        navigate('/');
    };

    const formatDate = (iso: string) => {
        return new Date(iso).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    return (
        <div className="dashboard-page">
            <Navbar
                isLoggedIn={true}
                onLogout={handleLogout}
                userName={currentUserName}
                userRole="USER"
            />

            <div className="dashboard-layout">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: 'none', border: 'none', color: 'var(--accent-color)',
                        fontWeight: 600, fontSize: '14px', cursor: 'pointer', padding: 0,
                        fontFamily: 'var(--font-family)'
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '16px', height: '16px' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back
                </button>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '32px', height: '32px', animation: 'spin 1s linear infinite' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        Loading profile...
                    </div>
                )}

                {error && (
                    <div style={{ background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
                        <p style={{ color: '#b91c1c', fontWeight: 600, margin: 0 }}>{error}</p>
                        <button onClick={() => navigate('/home')} style={{ marginTop: '12px', color: 'var(--accent-color)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                            Go back to Home
                        </button>
                    </div>
                )}

                {!loading && !error && profile && (
                    <div className="profile-card">
                        {/* Cover banner */}
                        <div className="profile-cover" />

                        <div className="profile-card-content">
                            {/* Avatar */}
                            <img src={userAvatarImg} alt={profile.fullName} className="profile-avatar" />
                            <h1 className="profile-name">{profile.fullName}</h1>
                            <p className="profile-username" style={{ marginBottom: '20px' }}>
                                PeraWave Member
                            </p>
                        </div>

                        {/* Divider */}
                        <div style={{ borderTop: '1px solid var(--border-color)', margin: '0 28px 20px' }} />

                        {/* Info Cards — only public fields */}
                        <div style={{ padding: '0 28px' }}>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 14px' }}>
                                Public Profile
                            </p>
                            <div className="info-grid">
                                {/* Faculty / Batch */}
                                <div className="info-card">
                                    <div className="info-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                                        </svg>
                                    </div>
                                    <div className="info-content">
                                        <span className="info-card-label">Faculty / Batch</span>
                                        <span className="info-card-value">
                                            {profile.faculty && profile.batch
                                                ? `${profile.faculty} — Batch ${profile.batch}`
                                                : profile.faculty || (profile.batch ? `Batch ${profile.batch}` : 'Not specified')}
                                        </span>
                                    </div>
                                </div>

                                {/* Joined Date */}
                                <div className="info-card">
                                    <div className="info-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                        </svg>
                                    </div>
                                    <div className="info-content">
                                        <span className="info-card-label">Member Since</span>
                                        <span className="info-card-value">{formatDate(profile.joinedAt)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Privacy notice */}
                            <div style={{
                                marginTop: '20px', background: '#f8fafc', border: '1px solid var(--border-color)',
                                borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px'
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="var(--text-muted)" style={{ width: '16px', height: '16px', flexShrink: 0 }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                                    Some information is kept private to protect user privacy.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfile;
