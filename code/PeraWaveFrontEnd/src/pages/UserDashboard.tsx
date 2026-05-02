import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";
import userAvatar from "../assets/UserAvatar.png";

const UserDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    fullName: "Test User",
    email: "e23900@eng.pdn.ac.lk",
    faculty: "Faculty of Engineering",
    registrationNumber: "E/23/900",
    joinDate: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    suspendedUntil: null as string | null,
    suspensionReason: "",
  });

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showWarningPopup, setShowWarningPopup] = useState(false);
  const [currentWarning, setCurrentWarning] = useState<any>(null);

  // Always fetch fresh data from backend on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }

    // 1. Fetch user profile
    fetch("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((user) => {
        setUserData({
          fullName: user.fullName || "User",
          email: user.email || "",
          faculty: user.faculty || "",
          registrationNumber: user.registrationNumber || "",
          joinDate: user.createdAt
            ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
            : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
          suspendedUntil: user.suspendedUntil || null,
          suspensionReason: user.suspensionReason || "",
        });
      })
      .catch((err) => {
        if (err === 401 || err === 403) {
          localStorage.removeItem("token");
          navigate("/login");
        }
        console.error("Error fetching user", err);
      });

    // 2. Fetch notifications independently (always fresh)
    fetch("http://localhost:5000/api/auth/notifications", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((notifs: any[]) => {
        setNotifications(notifs);
        // Show warning popup for first unread warning
        const unreadWarning = notifs.find((n) => n.type === "WARNING" && !n.isRead);
        if (unreadWarning) {
          setCurrentWarning(unreadWarning);
          setShowWarningPopup(true);
        }
      })
      .catch((err) => console.error("Error fetching notifications", err));
  }, [navigate]);

  const handleLogout = () => { navigate("/"); };

  const handleCloseWarning = async () => {
    setShowWarningPopup(false);
    // Mark only this notification as read
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/auth/notifications/read", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      // Update local state so the bell count reflects the change
      setNotifications((prev) =>
        prev.map((n) => (n.id === currentWarning?.id ? { ...n, isRead: true } : n))
      );
    } catch (e) { console.error(e); }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/auth/notifications/read", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) { console.error(e); }
  };

  const isSuspended = userData.suspendedUntil && new Date(userData.suspendedUntil) > new Date();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="dashboard-page">
      <div className="dashboard-nav-wrapper">
        <Navbar
          isLoggedIn={true}
          onLogout={handleLogout}
          userName={userData.fullName}
          userAvatar={userAvatar}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllRead={markAllRead}
        />
      </div>

      <div className="dashboard-layout">

        {/* Suspension Banner */}
        {isSuspended && (
          <div style={{
            background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
            border: '1px solid #fca5a5',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '14px',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '24px', flexShrink: 0 }}>🚫</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: '#991b1b', fontSize: '15px' }}>
                Account Suspended until {new Date(userData.suspendedUntil!).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
              <p style={{ margin: '4px 0 0 0', color: '#b91c1c', fontSize: '14px' }}>
                Reason: {userData.suspensionReason || "Violation of community guidelines"}
              </p>
            </div>
          </div>
        )}

        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-cover"></div>
          <div className="profile-card-content">
            <img src={userAvatar} alt="Avatar" className="profile-avatar" />
            <h2 className="profile-name">{userData.fullName}</h2>
            <p className="profile-username">{userData.email}</p>
          </div>
        </div>

        {/* User Details */}
        <div className="info-section">
          <h3 className="info-section-title">Personal Details</h3>
          <div className="info-grid">

            <div className="info-card">
              <div className="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "24px", height: "24px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
              </div>
              <div className="info-content">
                <span className="info-card-label">Faculty</span>
                <span className="info-card-value">{userData.faculty}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "24px", height: "24px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                </svg>
              </div>
              <div className="info-content">
                <span className="info-card-label">Registration No</span>
                <span className="info-card-value">{userData.registrationNumber}</span>
              </div>
            </div>

            <div className="info-card">
              <div className="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "24px", height: "24px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div className="info-content">
                <span className="info-card-label">Date Joined</span>
                <span className="info-card-value">{userData.joinDate}</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Warning Pop-up Modal */}
      {showWarningPopup && currentWarning && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div style={{ background: '#fff', padding: '32px', borderRadius: '16px', width: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#fef9c3', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '26px', height: '26px', color: '#eab308' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>Official Warning</h2>
                <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>From the PeraWave Moderation Team</p>
              </div>
            </div>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '14px', marginBottom: '20px' }}>
              <p style={{ margin: 0, color: '#92400e', fontSize: '14px', lineHeight: '1.6' }}>
                {currentWarning.message}
              </p>
            </div>
            <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6', marginBottom: '24px' }}>
              Please ensure your behaviour aligns with our community guidelines. Further violations may result in account suspension or permanent removal.
            </p>
            <button
              onClick={handleCloseWarning}
              style={{ width: '100%', padding: '12px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '15px', transition: 'background 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#334155')}
              onMouseLeave={e => (e.currentTarget.style.background = '#1e293b')}
            >
              I Understand & Acknowledge
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
