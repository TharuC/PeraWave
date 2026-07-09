import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_URL } from '../config';
import '../styles/interests.css';

export const ALL_TAGS = [
  { id: 'academics',     emoji: '📚', label: 'Academics' },
  { id: 'non-academics', emoji: '🎭', label: 'Non-Academics' },
  { id: 'social',        emoji: '🤝', label: 'Social' },
  { id: 'entertainment', emoji: '🎬', label: 'Entertainment' },
  { id: 'sports',        emoji: '⚽', label: 'Sports' },
  { id: 'arts & culture',emoji: '🎨', label: 'Arts & Culture' },
  { id: 'music',         emoji: '🎵', label: 'Music' },
  { id: 'travel',        emoji: '✈️', label: 'Travel' },
  { id: 'innovation',    emoji: '💡', label: 'Innovation' },
  { id: 'technology',    emoji: '💻', label: 'Technology' },
  { id: 'funny',         emoji: '😂', label: 'Funny' },
];

const SelectInterests: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Token is passed from RegisterDetails via location state
  const token: string | undefined = (location.state as any)?.token;

  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

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
      navigate('/login', { state: { message: 'Account created! Your interests are saved. Please log in.' } });
    }
  };

  const skip = () => {
    navigate('/login', { state: { message: 'Account created successfully! Please log in.' } });
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
              <span className="interest-chip-emoji">{tag.emoji}</span>
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
            Skip for now
          </button>
          <button
            className="interests-finish-btn"
            onClick={saveAndContinue}
            disabled={saving}
            type="button"
            id="interests-finish"
          >
            {saving ? 'Saving…' : 'Finish →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectInterests;
