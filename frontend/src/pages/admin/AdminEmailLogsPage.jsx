// AdminEmailLogsPage.jsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminEmailApi } from '../../services/api';

export function AdminEmailLogsPage() {
  const [logs, setLogs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [composeOpen, setComposeOpen] = useState(false);
  const [toast, setToast]   = useState('');

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    setLoading(true);
    adminEmailApi.list({ search }).then(r => { setLogs(r.data.results || r.data); setLoading(false); }).catch(() => setLoading(false));
  }, [search]);

  return (
    <AdminLayout title="Email Logs" breadcrumb="Communications">
      {toast && <div className="alert alert-success" style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 2000, minWidth: 260 }}><i className="bi bi-check-circle" />{toast}</div>}
      {composeOpen && <ComposeModal onClose={() => setComposeOpen(false)} onSuccess={() => { setComposeOpen(false); showToast('Email sent'); }} />}

      <div className="dash-header">
        <div className="dash-header-left"><h2>Email Logs</h2><p>All outbound communications from the platform</p></div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="search-wrap" style={{ width: 240 }}><i className="bi bi-search" /><input className="form-control search-input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} /></div>
          <button className="btn btn-navy btn-sm" onClick={() => setComposeOpen(true)}><i className="bi bi-send" /> Send Email</button>
        </div>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table>
            <thead><tr><th>To</th><th>Subject</th><th>Type</th><th>Sent By</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="table-empty"><span className="spinner spinner-dark" /></td></tr>
              : logs.length === 0 ? <tr><td colSpan={6} className="table-empty"><i className="bi bi-envelope" />No emails logged</td></tr>
              : logs.map(l => (
                <tr key={l.id}>
                  <td><div className="td-name">{l.to_name || '—'}</div><div className="td-email">{l.to_email}</div></td>
                  <td style={{ fontSize: '0.85rem', maxWidth: 260 }}>{l.subject}</td>
                  <td><span className="badge badge-navy">{l.inquiry_type?.replace('_', ' ')}</span></td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>{l.sent_by_name || '—'}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--gray-400)', whiteSpace: 'nowrap' }}>{l.sent_at ? new Date(l.sent_at).toLocaleString() : '—'}</td>
                  <td><span className={`badge ${l.success ? 'badge-green' : 'badge-red'}`}>{l.success ? 'Sent' : 'Failed'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

function ComposeModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ to_email: '', to_name: '', subject: '', body: '', inquiry_type: 'general' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try { await adminEmailApi.send(form); onSuccess(); }
    catch {} finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title"><i className="bi bi-send" /> Compose Email</div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">To Email <span className="req">*</span></label>
                <input className="form-control" type="email" value={form.to_email} onChange={e => setForm(p => ({ ...p, to_email: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Recipient Name</label>
                <input className="form-control" value={form.to_name} onChange={e => setForm(p => ({ ...p, to_name: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Subject <span className="req">*</span></label>
              <input className="form-control" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" value={form.inquiry_type} onChange={e => setForm(p => ({ ...p, inquiry_type: e.target.value }))}>
                {['general', 'flight_booking', 'yacht_charter', 'lease_inquiry', 'contact', 'group_charter', 'air_cargo', 'aircraft_sales'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Message <span className="req">*</span></label>
              <textarea className="form-control" rows={8} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} required />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={loading}>
              {loading ? <><span className="spinner" /> Sending…</> : <><i className="bi bi-send" /> Send Email</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminEmailLogsPage;