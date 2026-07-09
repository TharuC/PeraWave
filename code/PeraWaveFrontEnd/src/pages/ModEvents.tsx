import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { clearToken } from '../utils/auth';
import adminAvatar from '../assets/AdminAvatar.png';
import '../styles/mod-events.css';

interface PendingEvent {
  id: number;
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  location: string;
  link: string | null;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  organizer: { id: number; fullName: string | null; email: string; faculty: string | null };
}

const ModEvents: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<PendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [allEvents, setAllEvents] = useState<PendingEvent[]>([]);

  const getToken = () => sessionStorage.getItem('token') ?? localStorage.getItem('token');

  const fetchEvents = async () => {
    const token = getToken();
    if (!token) { navigate('/mods'); return; }
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [pendingRes, approvedRes] = await Promise.all([
        fetch(`${API_URL}/api/events/pending`, { headers }),
        fetch(`${API_URL}/api/events`, { headers }),
      ]);
      const pending: PendingEvent[] = pendingRes.ok ? await pendingRes.json() : [];
      const approved: PendingEvent[] = approvedRes.ok ? await approvedRes.json() : [];
      // Merge — pending has organizer detail, approved does not need it for display
      const merged: PendingEvent[] = [
        ...pending,
        ...approved.filter(a => !pending.find(p => p.id === a.id)).map(a => ({ ...a, organizer: a.organizer || { id: 0, fullName: null, email: '', faculty: null } })),
      ];
      setAllEvents(merged);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  useEffect(() => {
    setEvents(allEvents.filter(e => e.status === filter));
  }, [filter, allEvents]);

  const handleStatus = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    const token = getToken();
    if (!token) return;
    setActionLoading(id);
    try {
      const res = await fetch(`${API_URL}/api/events/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setAllEvents(prev => prev.map(e => e.id === id ? { ...e, status } : e));
      } else {
        alert('Action failed. Please try again.');
      }
    } catch {
      alert('Network error.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this event? This cannot be undone.')) return;
    const token = getToken();
    if (!token) return;
    setActionLoading(id);
    try {
      const res = await fetch(`${API_URL}/api/events/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setAllEvents(prev => prev.filter(e => e.id !== id));
      } else {
        alert('Failed to delete event. Please try again.');
      }
    } catch {
      alert('Network error.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => { clearToken(); navigate('/mods'); };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  const pendingCount = allEvents.filter(e => e.status === 'PENDING').length;

  return (
    <div className="mod-events-page">
      {/* Sidebar */}
      <div className="mod-events-sidebar">
        <div className="mes-profile">
          <img src={adminAvatar} alt="Admin" className="mes-avatar" />
          <h2 className="mes-name">Event Moderation</h2>
        </div>

        <button className="mes-nav-btn" onClick={() => navigate('/mod-dashboard')}>← Dashboard</button>
        <button className="mes-nav-btn" onClick={() => navigate('/mod-home')}>Browse Forums</button>
        <button className="mes-nav-btn" onClick={() => navigate('/mod-reports')}>Review Reports</button>

        <div className="mes-filters">
          {(['PENDING', 'APPROVED', 'REJECTED'] as const).map(f => (
            <button
              key={f}
              className={`mes-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
              {f === 'PENDING' && pendingCount > 0 && (
                <span className="mes-badge">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        <button className="mes-logout" onClick={handleLogout}>Log Out</button>
      </div>

      {/* Main */}
      <div className="mod-events-main">
        <div className="mes-header">
          <h1>
            {filter === 'PENDING' ? 'Pending Events' : filter === 'APPROVED' ? 'Approved Events' : 'Rejected Events'}
          </h1>
          <button className="mes-refresh" onClick={fetchEvents}>↻ Refresh</button>
        </div>

        {loading ? (
          <div className="mes-loading">Loading events…</div>
        ) : events.length === 0 ? (
          <div className="mes-empty">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            <p>No {filter.toLowerCase()} events</p>
          </div>
        ) : (
          <div className="mes-events-list">
            {events.map(ev => (
              <div key={ev.id} className="mes-event-card">
                {/* Flyer thumbnail */}
                <div
                  className="mes-flyer"
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/events/${ev.id}`)}
                  title="View event detail"
                >
                  {ev.imageUrl ? (
                    <img src={ev.imageUrl} alt={ev.title} />
                  ) : (
                    <div className="mes-flyer-placeholder">No flyer</div>
                  )}
                </div>

                {/* Details */}
                <div className="mes-event-details">
                  <div className="mes-event-top">
                    <h2
                      className="mes-event-title"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/events/${ev.id}`)}
                    >
                      {ev.title}
                    </h2>
                    <span className={`mes-status-badge mes-status-${ev.status.toLowerCase()}`}>{ev.status}</span>
                  </div>

                  <p className="mes-event-desc">{ev.description}</p>

                  <div className="mes-event-meta">
                    <span>📅 {formatDate(ev.eventDate)} · {ev.eventTime}</span>
                    <span>📍 {ev.location}</span>
                    {ev.link && <a href={ev.link} target="_blank" rel="noopener noreferrer" className="mes-link" onClick={e => e.stopPropagation()}>🔗 More info</a>}
                  </div>

                  <div className="mes-organizer">
                    Submitted by: <strong>{ev.organizer?.fullName || 'Unknown'}</strong>
                    <span className="mes-org-email"> ({ev.organizer?.email})</span>
                    {ev.organizer?.faculty && <span className="mes-org-faculty"> · {ev.organizer.faculty}</span>}
                  </div>

                  {/* Actions */}
                  <div className="mes-actions">
                    {ev.status === 'PENDING' && (
                      <>
                        <button
                          className="mes-approve-btn"
                          id={`approve-event-${ev.id}`}
                          disabled={actionLoading === ev.id}
                          onClick={() => handleStatus(ev.id, 'APPROVED')}
                        >
                          {actionLoading === ev.id ? '…' : '✓ Approve'}
                        </button>
                        <button
                          className="mes-reject-btn"
                          id={`reject-event-${ev.id}`}
                          disabled={actionLoading === ev.id}
                          onClick={() => handleStatus(ev.id, 'REJECTED')}
                        >
                          {actionLoading === ev.id ? '…' : '✕ Reject'}
                        </button>
                      </>
                    )}
                    <button
                      className="mes-delete-btn"
                      id={`delete-event-${ev.id}`}
                      disabled={actionLoading === ev.id}
                      onClick={() => handleDelete(ev.id)}
                    >
                      {actionLoading === ev.id ? '…' : '🗑 Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModEvents;
