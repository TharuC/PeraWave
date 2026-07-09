import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../config';
import { getToken } from '../utils/auth';
import '../styles/interests.css';

export const ALL_TAGS = [
  { id: 'academics',     label: 'Academics' },
  { id: 'non-academics', label: 'Non-Academics' },
  { id: 'social',        label: 'Social' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'sports',        label: 'Sports' },
  { id: 'arts & culture',label: 'Arts & Culture' },
  { id: 'music',         label: 'Music' },
  { id: 'travel',        label: 'Travel' },
  { id: 'innovation',    label: 'Innovation' },
  { id: 'technology',    label: 'Technology' },
  { id: 'funny',         label: 'Funny' },
];

const SelectInterests: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Token is passed from location state (registration flow) or from auth (app flow)
  const token: string | undefined = (location.state as any)?.token || getToken();
  const isAppFlow = !!getToken();

  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Pre-load existing interests if the user is already logged in
  React.useEffect(() => {
    if (isAppFlow) {
      const cached = sessionStorage.getItem('cachedUser');
      if (cached) {
        try {
          const c = JSON.parse(cached);
          if (c.interests) setSelected(c.interests);
        } catch {}
      }
    }
  }, [isAppFlow]);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const saveAndContinue = async () => {
    if (!token) {
      // No token — just navigate to login
      navigate('/login', { state: { message: 'Account created successfully! Please log in.' } });
      return;
    }

    setSaving(true);
    try {
      // Store the token so the user lands directly at home later (after login)
      // We don't auto-login here — just save interests then send to login
      await fetch(`${API_URL}/api/auth/interests`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ interests: selected }),
      });
    } catch {
      // Non-fatal — interests just won't be saved
    } finally {
      setSaving(false);
      if (isAppFlow) {
        // Update session storage for immediate reflection in Home
        const cached = sessionStorage.getItem('cachedUser');
        if (cached) {
          try {
            const c = JSON.parse(cached);
            c.interests = selected;
            sessionStorage.setItem('cachedUser', JSON.stringify(c));
          } catch {}
        }
        navigate('/home');
      } else {
        navigate('/login', { state: { message: 'Account created! Your interests are saved. Please log in.' } });
      }
    }
  };

  const skip = () => {
    if (isAppFlow) {
      navigate('/home');
    } else {
      navigate('/login', { state: { message: 'Account created successfully! Please log in.' } });
    }
  };

  return (
    <div className="interests-page">
      <div className="interests-card">
        {/* Logo */}
        <div className="interests-logo">
          <span style={{ fontSize: 28 }}>🌊</span>
          <span>PeraWave</span>
        </div>

        {/* Header */}
        <div className="interests-header">
          <h1>What are your interests?</h1>
          <p>
            Choose topics you care about. We'll use these to personalise your
            forum feed so the most relevant posts show up first.
          </p>
        </div>

        {/* Tag Grid */}
        <div className="interests-grid">
          {ALL_TAGS.map(tag => (
            <button
              key={tag.id}
              className={`interest-chip${selected.includes(tag.id) ? ' selected' : ''}`}
              onClick={() => toggle(tag.id)}
              type="button"
              id={`interest-${tag.id.replace(/[^a-z]/g, '-')}`}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Count hint */}
        <p className="interests-hint">
          {selected.length === 0
            ? 'Select as many as you like, or skip to continue'
            : <><strong>{selected.length}</strong> interest{selected.length !== 1 ? 's' : ''} selected</>}
        </p>

        {/* Actions */}
        <div className="interests-actions">
          <button className="interests-skip-btn" onClick={skip} type="button" id="interests-skip">
            {isAppFlow ? 'Cancel' : 'Skip for now'}
          </button>
          <button
            className="interests-finish-btn"
            onClick={saveAndContinue}
            disabled={saving}
            type="button"
            id="interests-finish"
          >
            {saving ? 'Saving…' : (isAppFlow ? 'Save Interests' : 'Finish →')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectInterests;
