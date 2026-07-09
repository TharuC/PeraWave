import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_URL } from '../config';
import { getToken, clearToken } from '../utils/auth';
import userAvatarImg from '../assets/UserAvatar.png';
import '../styles/event-detail.css';

interface Event {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  link: string | null;
  imageUrl: string | null;
  organizerId: number | null;
  organizer: { fullName: string | null; faculty: string | null };
}

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [user, setUser] = useState({ name: '', avatar: userAvatarImg });
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isMod, setIsMod] = useState(false);

  // Delete state
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const userToken = getToken();
    const modToken = sessionStorage.getItem('modToken') ?? localStorage.getItem('modToken');

    if (!userToken && !modToken) {
      navigate('/login');
      return;
    }

    // Detect if moderator session
    const activeMod = !!modToken && !userToken;
    setIsMod(activeMod);

    const authToken = userToken || modToken!;
    const headers = { Authorization: `Bearer ${authToken}` };

    if (userToken) {
      // Fetch user profile
      fetch(`${API_URL}/api/auth/me`, { headers })
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          if (d) {
            setUser({ name: d.fullName || '', avatar: userAvatarImg });
            setCurrentUserId(d.id || null);
          }
        })
        .catch(() => {});

      // Fetch notifications
      fetch(`${API_URL}/api/auth/notifications`, { headers })
        .then(r => r.ok ? r.json() : [])
        .then(setNotifications)
        .catch(() => {});
    }

    // Fetch this specific event
    fetch(`${API_URL}/api/events/${id}`, { headers })
      .then(r => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then(data => {
        if (data) setEvent(data);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id, navigate]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = async () => {
    const token = getToken();
    if (!token) return;
    await fetch(`${API_URL}/api/auth/notifications/read`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleLogout = () => {
    clearToken();
    sessionStorage.removeItem('cachedUser');
    navigate('/');
  };

  const handleDelete = async () => {
    const token = sessionStorage.getItem('modToken') ?? localStorage.getItem('modToken') ?? getToken();
    if (!token || !event) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/events/${event.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        navigate('/events');
      } else {
        alert('Failed to delete event. Please try again.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

  /* ── Loading ─────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="event-detail-page">
        {!isMod && (
          <Navbar
            isLoggedIn
            onLogout={handleLogout}
            userName={user.name}
            userAvatar={user.avatar}
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAllRead={markAllRead}
            userRole="USER"
          />
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#94a3b8', fontSize: 16, gap: 12 }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 28, height: 28, animation: 'spin 1.2s linear infinite' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Loading event…
        </div>
      </div>
    );
  }

  /* ── Not Found ────────────────────────────────────────────────────── */
  if (notFound || !event) {
    return (
      <div className="event-detail-page">
        {!isMod && (
          <Navbar
            isLoggedIn
            onLogout={handleLogout}
            userName={user.name}
            userAvatar={user.avatar}
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkAllRead={markAllRead}
            userRole="USER"
          />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16, color: '#94a3b8', textAlign: 'center', padding: 24 }}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: 56, height: 56, opacity: 0.4 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <h2 style={{ color: '#e2e8f0', margin: 0 }}>Event not found</h2>
          <p style={{ margin: 0 }}>This event may have been removed or does not exist.</p>
          <button onClick={() => navigate('/events')} style={{ marginTop: 8, padding: '10px 22px', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            ← Back to Events
          </button>
        </div>
      </div>
    );
  }

  /* ── Main ─────────────────────────────────────────────────────────── */
  return (
    <div className="event-detail-page">
      {/* Navbar for regular users only */}
      {!isMod && (
        <Navbar
          isLoggedIn
          onLogout={handleLogout}
          userName={user.name}
          userAvatar={user.avatar}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllRead={markAllRead}
          userRole="USER"
        />
      )}

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="event-detail-hero">
        {event.imageUrl ? (
          <>
            <div 
              className="event-detail-hero-bg" 
              style={{ backgroundImage: `url(${event.imageUrl})` }} 
            />
            <img src={event.imageUrl} alt={event.title} className="event-detail-hero-img" />
          </>
        ) : (
          <div className="event-detail-hero-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={0.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
        )}

        <button
          className="event-detail-back"
          onClick={() => {
            if (window.history.state && window.history.state.idx > 0) {
              navigate(-1);
            } else {
              navigate(isMod ? '/mod-events' : '/events');
            }
          }}
          id="event-detail-back-btn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </button>
      </section>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="event-detail-body">
        
        {/* Title block moved above columns */}
        <div className="event-detail-header">
          <div className="event-detail-status-badge">Upcoming Event</div>
          <h1 className="event-detail-title">{event.title}</h1>
          {event.organizer?.fullName && (
            <p className="event-detail-organizer-line">
              Organized by <strong>{event.organizer.fullName}</strong>
              {event.organizer.faculty ? ` · ${event.organizer.faculty}` : ''}
            </p>
          )}
        </div>

        <div className="event-detail-content-grid">
          {/* Left — Description */}
          <div className="event-detail-left">
          <div>
            <p className="event-detail-section-title">About this Event</p>
            <p className="event-detail-description">{event.description}</p>
          </div>
        </div>

        {/* Right — Info Card + optional Mod Card */}
        <div className="event-detail-right">
          <div className="event-detail-info-card">

            {/* Date */}
            <div className="event-detail-info-item">
              <div className="event-detail-info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div className="event-detail-info-text">
                <span className="event-detail-info-label">Date</span>
                <span className="event-detail-info-value">{formatDate(event.eventDate)}</span>
              </div>
            </div>

            {/* Time */}
            <div className="event-detail-info-item">
              <div className="event-detail-info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="event-detail-info-text">
                <span className="event-detail-info-label">Time</span>
                <span className="event-detail-info-value">{event.eventTime}</span>
              </div>
            </div>

            {/* Location */}
            <div className="event-detail-info-item">
              <div className="event-detail-info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <div className="event-detail-info-text">
                <span className="event-detail-info-label">Location</span>
                <span className="event-detail-info-value">{event.location}</span>
              </div>
            </div>

            {/* Organizer */}
            {event.organizer?.fullName && (
              <>
                <hr className="event-detail-info-divider" />
                <div className="event-detail-info-item">
                  <div className="event-detail-info-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <div className="event-detail-info-text">
                    <span className="event-detail-info-label">Organizer</span>
                    <span className="event-detail-info-value">
                      {event.organizer.fullName}
                      {event.organizer.faculty ? <><br /><span style={{ fontWeight: 400, color: '#94a3b8', fontSize: 13 }}>{event.organizer.faculty}</span></> : null}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* CTA link */}
            {event.link && (
              <>
                <hr className="event-detail-info-divider" />
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="event-detail-cta"
                  id="event-detail-cta-link"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  More Information
                </a>
              </>
            )}
          </div>

          {/* Moderator delete card */}
          {(isMod || (currentUserId !== null && event.organizerId === currentUserId)) && (
            <div className="event-detail-mod-card">
              <span className="event-detail-mod-label">
                {isMod ? '⚠ Moderator Actions' : '⚙ Event Actions'}
              </span>
              <button
                className="event-detail-delete-btn"
                id="event-detail-delete-btn"
                onClick={() => setShowConfirm(true)}
                disabled={deleting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Delete Event
              </button>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* ── Delete Confirm Modal ────────────────────────────────────── */}
      {showConfirm && (
        <div className="event-confirm-backdrop" onClick={() => !deleting && setShowConfirm(false)}>
          <div className="event-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="event-confirm-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>
            <h3>Delete this event?</h3>
            <p>
              "<strong style={{ color: '#e2e8f0' }}>{event.title}</strong>" will be permanently removed.
              This action cannot be undone.
            </p>
            <div className="event-confirm-actions">
              <button
                className="event-confirm-cancel"
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="event-confirm-delete"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetail;
