import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminFlightApi } from '../../services/api';

const STATUS_OPTIONS = ['inquiry', 'quoted', 'confirmed', 'in_flight', 'completed', 'cancelled'];
const STATUS_CLASS = { inquiry: 'status-inquiry', quoted: 'status-quoted', confirmed: 'status-confirmed', in_flight: 'status-confirmed', completed: 'status-completed', cancelled: 'status-cancelled' };

function SetPriceModal({ booking, onClose, onSuccess }) {
  const [form, setForm] = useState({ quoted_price_usd: '', commission_pct: '', status: 'quoted', send_email: true, email_message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const payload = { ...form, quoted_price_usd: Number(form.quoted_price_usd), send_email: form.send_email };
      if (form.commission_pct) payload.commission_pct = Number(form.commission_pct);
      await adminFlightApi.setPrice(booking.id, payload);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to set price.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title"><i className="bi bi-tag" /> Set Price & Quote</div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '0.85rem 1rem', fontSize: '0.84rem', color: 'var(--gray-600)' }}>
              <strong style={{ color: 'var(--navy)' }}>{booking.guest_name}</strong> · {booking.origin_detail?.code} → {booking.destination_detail?.code} · {booking.departure_date}
            </div>
            {error && <div className="alert alert-error" style={{ marginBottom: 0 }}><i className="bi bi-exclamation-circle" />{error}</div>}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Quoted Price (USD) <span className="req">*</span></label>
                <input className="form-control" type="number" min="0" step="0.01" value={form.quoted_price_usd} onChange={e => setForm(p => ({ ...p, quoted_price_usd: e.target.value }))} placeholder="e.g. 45000" required />
              </div>
              <div className="form-group">
                <label className="form-label">Commission % <span className="form-hint" style={{ marginLeft: '0.3rem' }}>(blank = default)</span></label>
                <input className="form-control" type="number" min="0" max="100" step="0.01" value={form.commission_pct} onChange={e => setForm(p => ({ ...p, commission_pct: e.target.value }))} placeholder="e.g. 10" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Update Status</label>
              <select className="form-control" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <label className="check-row" style={{ cursor: 'pointer' }}>
              <input type="checkbox" checked={form.send_email} onChange={e => setForm(p => ({ ...p, send_email: e.target.checked }))} />
              <i className="bi bi-envelope" style={{ color: 'var(--gold)' }} />
              Send quote email to {booking.guest_email}
            </label>
            {form.send_email && (
              <div className="form-group">
                <label className="form-label">Custom Email Message (optional)</label>
                <textarea className="form-control" rows={4} value={form.email_message} onChange={e => setForm(p => ({ ...p, email_message: e.target.value }))} placeholder="Leave blank to use the default quote template…" />
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-gold" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving…</> : <><i className="bi bi-check-lg" /> Set Price &amp; Send</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ReplyModal({ booking, onClose, onSuccess }) {
  const [form, setForm] = useState({ subject: `Re: Your Flight Enquiry – ${booking.origin_detail?.code || ''} → ${booking.destination_detail?.code || ''}`, message: '', new_status: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminFlightApi.reply(booking.id, form);
      onSuccess();
    } catch { } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title"><i className="bi bi-envelope" /> Reply to {booking.guest_name}</div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>To: <strong>{booking.guest_email}</strong></div>
            <div className="form-group">
              <label className="form-label">Subject <span className="req">*</span></label>
              <input className="form-control" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Message <span className="req">*</span></label>
              <textarea className="form-control" rows={7} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Update Status (optional)</label>
              <select className="form-control" value={form.new_status} onChange={e => setForm(p => ({ ...p, new_status: e.target.value }))}>
                <option value="">— No change —</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={loading}>
              {loading ? <><span className="spinner" /> Sending…</> : <><i className="bi bi-send" /> Send Reply</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminFlightBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatus] = useState('');
  const [priceModal, setPriceModal] = useState(null);
  const [replyModal, setReplyModal] = useState(null);
  const [toast, setToast]       = useState('');

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminFlightApi.list({ search, status: statusFilter || undefined });
      setBookings(r.data.results || r.data);
    } catch {} finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    try {
      await adminFlightApi.updateStatus(id, status);
      showToast('Status updated');
      load();
    } catch { showToast('Failed to update status'); }
  };

  return (
    <AdminLayout title="Flight Bookings" breadcrumb="Flight Bookings">
      {toast && <div className="alert alert-success" style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 2000, minWidth: 260 }}><i className="bi bi-check-circle" />{toast}</div>}
      {priceModal && <SetPriceModal booking={priceModal} onClose={() => setPriceModal(null)} onSuccess={() => { setPriceModal(null); showToast('Price set & email sent'); load(); }} />}
      {replyModal && <ReplyModal booking={replyModal} onClose={() => setReplyModal(null)} onSuccess={() => { setReplyModal(null); showToast('Reply sent'); }} />}

      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Flight Bookings</h2>
          <p>Manage all flight charter requests and bookings</p>
        </div>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <div className="table-card-title"><i className="bi bi-airplane" /> All Bookings</div>
          <div className="table-card-actions">
            <div className="search-wrap" style={{ width: 240 }}>
              <i className="bi bi-search" />
              <input className="form-control search-input" placeholder="Search name, email…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-control" style={{ width: 150 }} value={statusFilter} onChange={e => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Guest</th>
                <th>Route</th>
                <th>Date</th>
                <th>Pax</th>
                <th>Status</th>
                <th>Quoted Price</th>
                <th>Commission</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="table-empty"><span className="spinner spinner-dark" /></td></tr>
              ) : bookings.length === 0 ? (
                <tr><td colSpan={8} className="table-empty"><i className="bi bi-inbox" />No bookings found</td></tr>
              ) : bookings.map(b => (
                <tr key={b.id}>
                  <td>
                    <div className="td-name">{b.guest_name}</div>
                    <div className="td-email">{b.guest_email}</div>
                    <div className="td-ref">{String(b.reference).slice(0, 12)}…</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{b.origin_detail?.code || '—'} → {b.destination_detail?.code || '—'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{b.trip_type_display || b.trip_type}</div>
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{b.departure_date}</td>
                  <td>{b.passenger_count}</td>
                  <td>
                    <span className={`badge ${STATUS_CLASS[b.status] || 'badge-gray'}`}>{b.status_display || b.status}</span>
                  </td>
                  <td className="td-price">{b.quoted_price_usd ? `$${Number(b.quoted_price_usd).toLocaleString()}` : <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>Not quoted</span>}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--green)' }}>{b.commission_usd ? `$${Number(b.commission_usd).toLocaleString()}` : '—'}</td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-gold btn-xs" onClick={() => setPriceModal(b)} title="Set price"><i className="bi bi-tag" /></button>
                      <button className="btn btn-navy btn-xs" onClick={() => setReplyModal(b)} title="Reply"><i className="bi bi-envelope" /></button>
                      <select
                        className="form-control"
                        style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.72rem' }}
                        value={b.status}
                        onChange={e => updateStatus(b.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}