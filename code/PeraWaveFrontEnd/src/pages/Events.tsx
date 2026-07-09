import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_URL } from '../config';
import { getToken, clearToken } from '../utils/auth';
import userAvatarImg from '../assets/UserAvatar.png';
import '../styles/events.css';

interface Event {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  link: string | null;
  imageUrl: string | null;
  organizer: { fullName: string | null; faculty: string | null };
}

const Events: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({ name: '', avatar: userAvatarImg });
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) { navigate('/login'); return; }

    const headers = { Authorization: `Bearer ${token}` };

    // Fetch user info
    fetch(`${API_URL}/api/auth/me`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setUser({ name: d.fullName || '', avatar: userAvatarImg }); })
      .catch(() => {});

    // Fetch notifications
    fetch(`${API_URL}/api/auth/notifications`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(setNotifications)
      .catch(() => {});

    // Fetch approved events
    fetch(`${API_URL}/api/events`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [navigate]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = async () => {
    const token = getToken();
    if (!token) return;
    await fetch(`${API_URL}/api/auth/notifications/read`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleLogout = () => { clearToken(); sessionStorage.removeItem('cachedUser'); navigate('/'); };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="events-page">
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

      <div className="events-container">
        {/* Header */}
        <div className="events-header">
          <div>
            <h1 className="events-heading">University Events</h1>
            <p className="events-subheading">Explore upcoming events from across the university community.</p>
          </div>
          <button
            className="events-submit-btn"
            id="submit-event-btn"
            onClick={() => navigate('/create-event')}
          >
            + Submit Event
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="events-loading">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="events-empty">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <h3>No events yet</h3>
            <p>Be the first to submit an event for the community.</p>
            <button className="events-submit-btn" onClick={() => navigate('/create-event')}>Submit an Event</button>
          </div>
        ) : (
          <div className="events-grid">
            {events.map(ev => (
              <article
                key={ev.id}
                className="event-card"
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/events/${ev.id}`)}
                onKeyDown={e => e.key === 'Enter' && navigate(`/events/${ev.id}`)}
              >
                {/* Flyer */}
                <div className="event-card-image">
                  {ev.imageUrl ? (
                    <img src={ev.imageUrl} alt={ev.title} />
                  ) : (
                    <div className="event-card-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="event-card-body">
                  <h2 className="event-card-title">{ev.title}</h2>
                  <p className="event-card-desc">{ev.description}</p>

                  <div className="event-card-meta">
                    <div className="event-meta-item">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      <span>{formatDate(ev.eventDate)} · {ev.eventTime}</span>
                    </div>
                    <div className="event-meta-item">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      <span>{ev.location}</span>
                    </div>
                    {ev.organizer?.fullName && (
                      <div className="event-meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        <span>{ev.organizer.fullName}{ev.organizer.faculty ? ` · ${ev.organizer.faculty}` : ''}</span>
                      </div>
                    )}
                  </div>

                  {ev.link && (
                    <a
                      href={ev.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="event-card-link"
                      onClick={e => e.stopPropagation()}
                    >
                      More Info →
                    </a>
                  )}
                  <span className="event-card-view-hint">Click to view details →</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
