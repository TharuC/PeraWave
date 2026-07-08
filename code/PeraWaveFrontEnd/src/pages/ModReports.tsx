import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/home.css';
import { API_URL } from '../config';
import { getToken, clearToken } from '../utils/auth';

// ── Icon helpers ──────────────────────────────────────────────────────────────
const IconFlag    = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'15px',height:'15px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 011.743-1.342 48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664L19.5 19.5" /></svg>;
const IconFilter  = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'14px',height:'14px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" /></svg>;
const IconCheck   = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'14px',height:'14px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const IconX       = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'14px',height:'14px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
const IconEye     = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'14px',height:'14px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const IconRefresh = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" style={{width:'14px',height:'14px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>;

// ── Types ─────────────────────────────────────────────────────────────────────
interface Report {
  id: number;
  contentType: string;
  contentId: number;
  reason: string;
  description: string | null;
  status: string;
  modNote: string | null;
  createdAt: string;
  reporter: { id: number; fullName: string; email: string };
}

interface Stats {
  pending: number; underReview: number; resolved: number; rejected: number;
  total: number; flaggedPosts: number; flaggedComments: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const REASON_LABELS: Record<string, string> = {
  SPAM: 'Spam', HARASSMENT: 'Harassment / Abuse', MISINFORMATION: 'Misinformation',
  INAPPROPRIATE: 'Inappropriate Content', DUPLICATE: 'Duplicate / Irrelevant', OTHER: 'Other',
};

const STATUS_STYLES: Record<string, { label: string; bg: string; color: string }> = {
  PENDING:      { label: 'Pending',      bg: '#fef9c3', color: '#854d0e' },
  UNDER_REVIEW: { label: 'Under Review', bg: '#dbeafe', color: '#1d4ed8' },
  RESOLVED:     { label: 'Resolved',     bg: '#dcfce7', color: '#16a34a' },
  REJECTED:     { label: 'Rejected',     bg: '#fee2e2', color: '#b91c1c' },
};

const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// ── Component ─────────────────────────────────────────────────────────────────
const ModReports: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports]     = useState<Report[]>([]);
  const [stats, setStats]         = useState<Stats | null>(null);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatusFilter]     = useState('');
  const [typeFilter, setTypeFilter]         = useState('');
  const [reasonFilter, setReasonFilter]     = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [modNote, setModNote]     = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast]         = useState('');
  const [modInfo, setModInfo]     = useState<{ fullName: string } | null>(null);

  const token = getToken();

  const headers = { Authorization: `Bearer ${token}` };
  const headersJson = { ...headers, 'Content-Type': 'application/json' };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter)   params.set('contentType', typeFilter);
      if (reasonFilter) params.set('reason', reasonFilter);

      const [repRes, statsRes, meRes] = await Promise.all([
        fetch(`${API_URL}/api/reports?${params}`, { headers }),
        fetch(`${API_URL}/api/reports/stats`, { headers }),
        fetch(`${API_URL}/api/auth/me`, { headers }),
      ]);

      if (repRes.status === 403) { navigate('/mods'); return; }

      const repData = await repRes.json();
      const statsData = await statsRes.json();
      setReports(repData.reports ?? []);
      setStats(statsData);
      
      if (meRes.ok) {
        setModInfo(await meRes.json());
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, reasonFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id: number, status: string) => {
    setActionLoading(true);
    try {
      await fetch(`${API_URL}/api/reports/${id}/status`, {
        method: 'PATCH',
        headers: headersJson,
        body: JSON.stringify({ status, modNote }),
      });
      showToast(`Report marked as ${STATUS_STYLES[status]?.label}.`);
      setSelectedReport(null);
      setModNote('');
      fetchData();
    } catch { /* silent */ }
    finally { setActionLoading(false); }
  };

  return (
    <div className="home-page">
      <Navbar
        isLoggedIn={true}
        userName={modInfo?.fullName || 'Moderator'}
        userRole="MODERATOR"
        onLogout={() => { clearToken(); navigate('/mods'); }}
      />

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '10px 22px', borderRadius: '999px', fontSize: '14px', fontWeight: 600, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 20px 60px' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IconFlag /> Reports Dashboard
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#64748b' }}>
              Review and act on user-submitted reports.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/mod-dashboard')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#475569' }}>
              ← Back to Dashboard
            </button>
            <button onClick={fetchData} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
              <IconRefresh /> Refresh
            </button>
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            {[
              { label: 'Pending',       value: stats.pending,      color: '#854d0e', bg: '#fef9c3' },
              { label: 'Under Review',  value: stats.underReview,  color: '#1d4ed8', bg: '#dbeafe' },
              { label: 'Resolved',      value: stats.resolved,     color: '#16a34a', bg: '#dcfce7' },
              { label: 'Rejected',      value: stats.rejected,     color: '#b91c1c', bg: '#fee2e2' },
              { label: 'Flagged Posts', value: stats.flaggedPosts,  color: '#dc2626', bg: '#fff1f2' },
              { label: 'Flagged Cmts',  value: stats.flaggedComments, color: '#9333ea', bg: '#faf5ff' },
            ].map(s => (
              <div key={s.label} style={{ background: '#fff', borderRadius: '12px', padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: `4px solid ${s.color}` }}>
                <div style={{ fontSize: '24px', fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#64748b' }}>
            <IconFilter /> Filters
          </div>
          {[
            { label: 'Status', value: statusFilter, setter: setStatusFilter, options: [['','All Statuses'],['PENDING','Pending'],['UNDER_REVIEW','Under Review'],['RESOLVED','Resolved'],['REJECTED','Rejected']] },
            { label: 'Type',   value: typeFilter,   setter: setTypeFilter,   options: [['','All Types'],['POST','Post'],['COMMENT','Comment']] },
            { label: 'Reason', value: reasonFilter, setter: setReasonFilter, options: [['','All Reasons'],['SPAM','Spam'],['HARASSMENT','Harassment'],['MISINFORMATION','Misinformation'],['INAPPROPRIATE','Inappropriate'],['DUPLICATE','Duplicate'],['OTHER','Other']] },
          ].map(f => (
            <select key={f.label} value={f.value} onChange={e => f.setter(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '13px', color: '#1e293b', background: '#fff', cursor: 'pointer', outline: 'none' }}>
              {f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
          {(statusFilter || typeFilter || reasonFilter) && (
            <button onClick={() => { setStatusFilter(''); setTypeFilter(''); setReasonFilter(''); }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '7px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              <IconX /> Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
              <IconRefresh /> Loading reports…
            </div>
          ) : reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
              <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="#cbd5e1" style={{width:'52px',height:'52px'}}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"/></svg>
              </div>
              <p style={{ fontWeight: 600, fontSize: '15px', color: '#475569', margin: 0 }}>No reports found.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['#', 'Type', 'Reason', 'Reporter', 'Status', 'Submitted', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => {
                  const st = STATUS_STYLES[r.status] ?? STATUS_STYLES.PENDING;
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#94a3b8', fontWeight: 600 }}>#{r.id}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', background: r.contentType === 'POST' ? '#eff6ff' : '#faf5ff', color: r.contentType === 'POST' ? '#1d4ed8' : '#7c3aed' }}>
                          {r.contentType}
                        </span>
                        <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '6px' }}>ID:{r.contentId}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#334155', fontWeight: 600 }}>{REASON_LABELS[r.reason] ?? r.reason}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{r.reporter.fullName}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{r.reporter.email}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#94a3b8' }}>{timeAgo(r.createdAt)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <button onClick={() => { setSelectedReport(r); setModNote(r.modNote ?? ''); }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '7px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: '#475569' }}>
                          <IconEye /> Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedReport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}
          onClick={() => setSelectedReport(null)}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '520px', maxWidth: '95vw', boxShadow: '0 24px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '20px 24px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '16px' }}>
                <IconFlag /> Report #{selectedReport.id}
              </div>
              <button onClick={() => setSelectedReport(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontSize: '18px' }}>×</button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Details grid */}
              {[
                ['Content', `${selectedReport.contentType} (ID: ${selectedReport.contentId})`],
                ['Reason', REASON_LABELS[selectedReport.reason] ?? selectedReport.reason],
                ['Reporter', `${selectedReport.reporter.fullName} (${selectedReport.reporter.email})`],
                ['Current Status', STATUS_STYLES[selectedReport.status]?.label ?? selectedReport.status],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', gap: '12px' }}>
                  <span style={{ minWidth: '110px', fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', paddingTop: '1px' }}>{label}</span>
                  <span style={{ fontSize: '14px', color: '#1e293b', fontWeight: 500 }}>{value}</span>
                </div>
              ))}
              {selectedReport.description && (
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', margin: '0 0 6px' }}>User's Note</p>
                  <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: '1.6' }}>{selectedReport.description}</p>
                </div>
              )}

              {/* View content button */}
              <button onClick={() => navigate(`/post/${selectedReport.contentId}`)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, width: 'fit-content' }}>
                <IconEye /> View Reported {selectedReport.contentType === 'POST' ? 'Post' : 'Comment'}
              </button>

              {/* Mod note */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '6px' }}>Moderator Note (optional)</label>
                <textarea value={modNote} onChange={e => setModNote(e.target.value)}
                  placeholder="Internal note about this report…"
                  style={{ width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '13px', fontFamily: 'Inter, sans-serif', color: '#1e293b', background: '#f8fafc', resize: 'vertical', minHeight: '70px', outline: 'none' }}
                />
              </div>

              {/* Action buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', paddingTop: '4px' }}>
                <button onClick={() => updateStatus(selectedReport.id, 'UNDER_REVIEW')} disabled={actionLoading}
                  style={{ padding: '9px', background: '#dbeafe', color: '#1d4ed8', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  <IconEye /> Under Review
                </button>
                <button onClick={() => updateStatus(selectedReport.id, 'RESOLVED')} disabled={actionLoading}
                  style={{ padding: '9px', background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  <IconCheck /> Resolved
                </button>
                <button onClick={() => updateStatus(selectedReport.id, 'REJECTED')} disabled={actionLoading}
                  style={{ padding: '9px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                  <IconX /> Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModReports;
