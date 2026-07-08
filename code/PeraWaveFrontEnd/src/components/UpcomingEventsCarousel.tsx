import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { getToken } from '../utils/auth';
import './UpcomingEventsCarousel.css';

interface UpcomingEvent {
  id: number;
  title: string;
  eventDate: string;
  eventTime: string;
  location: string;
  imageUrl: string | null;
  link: string | null;
}

const UpcomingEventsCarousel: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    fetch(`${API_URL}/api/events/upcoming`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => (r.ok ? r.json() : []))
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  // Auto-advance every 4 seconds
  useEffect(() => {
    if (events.length <= 1) return;
    timerRef.current = setTimeout(() => {
      setCurrent(c => (c + 1) % events.length);
    }, 4000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, events.length]);

  const goTo = (i: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrent(i);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="uec-skeleton">
        <div className="uec-shimmer" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="uec-empty">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        <p>No upcoming events</p>
      </div>
    );
  }

  const ev = events[current];

  return (
    <div className="uec-wrapper">
      {/* Slide */}
      <div
        className="uec-slide"
        key={ev.id}
        onClick={() => navigate('/events')}
        title="View all events"
      >
        {/* Flyer image */}
        <div className="uec-image-wrap">
          {ev.imageUrl ? (
            <img src={ev.imageUrl} alt={ev.title} className="uec-image" />
          ) : (
            <div className="uec-image-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
          )}
          <div className="uec-badge">Upcoming</div>
        </div>

        {/* Info */}
        <div className="uec-info">
          <h4 className="uec-title">{ev.title}</h4>
          <div className="uec-meta">
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {formatDate(ev.eventDate)} · {ev.eventTime}
            </span>
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              {ev.location}
            </span>
          </div>
        </div>
      </div>

      {/* Dot indicators */}
      {events.length > 1 && (
        <div className="uec-dots">
          {events.map((_, i) => (
            <button
              key={i}
              className={`uec-dot ${i === current ? 'active' : ''}`}
              onClick={e => { e.stopPropagation(); goTo(i); }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* View All link */}
      <button className="uec-view-all" onClick={() => navigate('/events')}>
        View All Events →
      </button>
    </div>
  );
};

export default UpcomingEventsCarousel;
