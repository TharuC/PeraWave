import React, { useState } from 'react';
import { API_URL } from '../config';

interface ReportModalProps {
  contentType: 'POST' | 'COMMENT';
  contentId: number;
  onClose: () => void;
}

const REASONS = [
  { value: 'SPAM',          label: 'Spam', desc: 'Repetitive, irrelevant, or promotional content' },
  { value: 'HARASSMENT',    label: 'Harassment / Abuse', desc: 'Targeted attacks, threats, or bullying' },
  { value: 'MISINFORMATION',label: 'Misinformation', desc: 'False or misleading information' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate Content', desc: 'Offensive, explicit, or disturbing material' },
  { value: 'DUPLICATE',     label: 'Duplicate / Irrelevant', desc: 'Already posted or off-topic for PeraWave' },
  { value: 'OTHER',         label: 'Other', desc: 'Something else not covered above' },
];

const ReportModal: React.FC<ReportModalProps> = ({ contentType, contentId, onClose }) => {
  const [reason, setReason]         = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) { setError('Please select a reason.'); return; }
    setLoading(true);
    setError('');

    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ contentType, contentId, reason, description }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit report.');
      } else {
        setSuccess(true);
        setTimeout(onClose, 2500);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000,
      backdropFilter: 'blur(4px)', padding: '20px',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: '16px', width: '480px', maxWidth: '95vw',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0,0,0,0.2)', overflow: 'hidden',
        animation: 'slideUp 0.25s ease',
      }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #059669, #10b981)', padding: '20px 24px', color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '22px', height: '22px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 011.743-1.342 48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664L19.5 19.5" />
              </svg>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
                Report {contentType === 'POST' ? 'Post' : 'Comment'}
              </h2>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>×</button>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '13px', opacity: 0.85 }}>
            Help keep PeraWave safe. All reports are confidential.
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#16a34a" style={{ width: '48px', height: '48px' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p style={{ fontWeight: 700, fontSize: '16px', color: '#1e293b', margin: '0 0 6px' }}>Report Submitted!</p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Thank you. Our moderation team will review this report.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '16px', height: '16px', flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Reason selection */}
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Select a reason *
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
                {REASONS.map(r => (
                  <label key={r.value} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 14px',
                    borderRadius: '10px', border: '1.5px solid', cursor: 'pointer',
                    borderColor: reason === r.value ? '#10b981' : '#e2e8f0',
                    background: reason === r.value ? '#f0fdf4' : '#f8fafc',
                    transition: 'all 0.15s',
                  }}>
                    <input type="radio" name="reason" value={r.value} checked={reason === r.value}
                      onChange={() => setReason(r.value)}
                      style={{ marginTop: '2px', accentColor: '#10b981' }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{r.label}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{r.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Custom description */}
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Additional details (optional)
              </p>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={500}
                placeholder="Provide any extra context that may help our moderators..."
                style={{
                  width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: '10px',
                  border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif',
                  color: '#1e293b', background: '#f8fafc', resize: 'vertical', minHeight: '80px',
                  lineHeight: '1.5', outline: 'none',
                }}
              />
              <div style={{ textAlign: 'right', fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                {description.length}/500
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={onClose} style={{
                  padding: '9px 20px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
                  background: '#fff', color: '#64748b', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading || !reason} style={{
                  padding: '9px 22px', borderRadius: '8px', border: 'none',
                  background: loading || !reason ? '#a7f3d0' : '#10b981',
                  color: '#fff', fontWeight: 700, fontSize: '13px', cursor: loading || !reason ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  {loading ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                      Submitting...
                    </>
                  ) : 'Submit Report'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ReportModal;
