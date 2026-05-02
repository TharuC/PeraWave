import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/PeraWaveLogo.png";
import "../styles/welcome.css";

import userAvatarDefault from "../assets/UserAvatar.png";

interface NavbarProps {
  isLoggedIn?: boolean;
  onLogout?: () => void;
  userName?: string;
  userAvatar?: string;
  notifications?: any[];
  unreadCount?: number;
  onMarkAllRead?: () => void;
  userRole?: string;
}

const Navbar: React.FC<NavbarProps> = ({ 
  isLoggedIn, 
  onLogout, 
  userName, 
  userAvatar, 
  notifications = [], 
  unreadCount = 0,
  onMarkAllRead,
  userRole
}) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const getNotifIcon = (type: string) => {
    if (type === "WARNING") return "⚠️";
    if (type === "SUSPENSION") return "🚫";
    return "📢";
  };

  return (
    <nav className="navbar">
      <div className="logo-container" style={{ cursor: "pointer" }} onClick={() => navigate(isLoggedIn ? (userRole === 'MODERATOR' ? "/mod-home" : "/home") : "/")}>
        <img src={logo} alt="PeraWave Logo" className="logo-img" />
        <div className="logo" style={{ background: 'linear-gradient(45deg, #2563eb, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>PeraWave</div>
      </div>

      <div className="nav-buttons" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {isLoggedIn ? (
          <>
            {/* Notification Bell */}
            <div style={{ position: "relative" }}>
              <button 
                className="notification-btn" 
                onClick={() => { setIsNotifOpen(!isNotifOpen); setIsDropdownOpen(false); }}
                style={{ background: "none", border: "none", cursor: "pointer", position: "relative", display: "flex", alignItems: "center", color: "#64748b", padding: '6px' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "22px", height: "22px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {unreadCount > 0 && (
                  <span style={{ 
                    position: "absolute", top: "2px", right: "2px", minWidth: '18px', height: '18px', 
                    backgroundColor: "#ef4444", borderRadius: "999px", border: "2px solid #fff", 
                    fontSize: '10px', fontWeight: 700, color: '#fff', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <div style={{
                  position: 'absolute', top: '120%', right: 0,
                  background: 'white', borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
                  width: '320px', zIndex: 2000, overflow: 'hidden'
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={onMarkAllRead} style={{ fontSize: '12px', color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Mark all read</button>
                    )}
                  </div>
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>No notifications yet</div>
                    ) : (
                      notifications.map((n: any) => (
                        <div key={n.id} style={{
                          padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
                          display: 'flex', gap: '10px', alignItems: 'flex-start',
                          background: n.isRead ? '#fff' : '#f0f9ff'
                        }}>
                          <span style={{ fontSize: '18px', flexShrink: 0 }}>{getNotifIcon(n.type)}</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: '12px', color: '#1e293b', fontWeight: n.isRead ? 400 : 600, lineHeight: '1.5' }}>{n.message}</p>
                            <p style={{ margin: '3px 0 0', fontSize: '10px', color: '#94a3b8' }}>{new Date(n.createdAt).toLocaleString()}</p>
                          </div>
                          {!n.isRead && <span style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%', flexShrink: 0, marginTop: '4px' }} />}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="nav-profile-menu" style={{ position: "relative" }}>
              <div 
                  style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", userSelect: "none" }}
                  onClick={() => { if (userRole !== 'MODERATOR') setIsDropdownOpen(!isDropdownOpen); setIsNotifOpen(false); }}
              >
                <img src={userAvatar || userAvatarDefault} alt="User" style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", border: "2px solid #fff", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />
                <span style={{ fontWeight: 600, color: "#1e293b", fontSize: "15px" }}>{userName || "User"}</span>
                {userRole !== 'MODERATOR' && (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: "14px", height: "14px", color: "#64748b" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                )}
              </div>

              {isDropdownOpen && userRole !== 'MODERATOR' && (
                  <div className="profile-dropdown" style={{
                      position: 'absolute', top: '120%', right: '0', background: 'white',
                      borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      width: '180px', padding: '10px 0', zIndex: 1000,
                      border: '1px solid #e2e8f0'
                  }}>
                      <div className="dropdown-item" style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#475569' }} onClick={() => navigate('/dashboard')}>
                          Profile
                      </div>
                      <div className="dropdown-item" style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#475569' }} onClick={() => navigate('/my-forums')}>
                          My Forums
                      </div>
                      <div className="dropdown-item" style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#475569' }} onClick={() => navigate(userRole === 'MODERATOR' ? '/mod-home' : '/home')}>
                          Home
                      </div>
                      <div className="dropdown-divider" style={{ borderBottom: '1px solid #e2e8f0', margin: '5px 0' }}></div>
                      <div className="dropdown-item" style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: '#ef4444' }} onClick={onLogout}>
                          Log Out
                      </div>
                  </div>
              )}
            </div>
          </>
        ) : (
          <>
            <button
              className="create-btn"
              onClick={() => navigate("/register")}
            >
              Create an account
            </button>

            <button
              className="login-btn"
              onClick={() => navigate("/login")}
            >
              Log in
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

