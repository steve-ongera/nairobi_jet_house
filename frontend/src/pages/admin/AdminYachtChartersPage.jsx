// AdminYachtChartersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminYachtApi } from '../../services/api';

const STATUS_OPTIONS = ['inquiry', 'quoted', 'confirmed', 'active', 'completed', 'cancelled'];
const STATUS_CLASS = { inquiry: 'status-inquiry', quoted: 'status-quoted', confirmed: 'status-confirmed', active: 'status-active', completed: 'status-completed', cancelled: 'status-cancelled' };

export default function AdminYachtChartersPage() {
  const [charters, setCharters] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [priceModal, setPriceModal] = useState(null);
  const [toast, setToast]       = useState('');

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await adminYachtApi.list({ search }); setCharters(r.data.results || r.data); }
    catch {} finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  return (
    <AdminLayout title="Yacht Charters" breadcrumb="Yacht Charters">
      {toast && <div className="alert alert-success" style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 2000, minWidth: 260 }}><i className="bi bi-check-circle" />{toast}</div>}

      {priceModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setPriceModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title"><i className="bi bi-tag" /> Set Charter Price</div>
              <button className="modal-close" onClick={() => setPriceModal(null)}><i className="bi bi-x-lg" /></button>
            </div>
            <YachtPriceForm charter={priceModal} onSuccess={() => { setPriceModal(null); showToast('Price set'); load(); }} onClose={() => setPriceModal(null)} />
          </div>
        </div>
      )}

      <div className="dash-header">
        <div className="dash-header-left"><h2>Yacht Charters</h2><p>Manage all yacht charter enquiries</p></div>
        <div className="search-wrap" style={{ width: 240 }}>
          <i className="bi bi-search" />
          <input className="form-control search-input" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-card">
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>Guest</th><th>Yacht</th><th>Ports</th><th>Dates</th><th>Guests</th><th>Status</th><th>Price</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={8} className="table-empty"><span className="spinner spinner-dark" /></td></tr>
              : charters.length === 0 ? <tr><td colSpan={8} className="table-empty"><i className="bi bi-anchor" />No charters found</td></tr>
              : charters.map(c => (
                <tr key={c.id}>
                  <td><div className="td-name">{c.guest_name}</div><div className="td-email">{c.guest_email}</div></td>
                  <td>{c.yacht_name || <span style={{ color: 'var(--gray-400)' }}>TBC</span>}</td>
                  <td style={{ fontSize: '0.82rem' }}>{c.departure_port} → {c.destination_port || 'Open'}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--gray-600)' }}>{c.charter_start}<br />{c.charter_end}</td>
                  <td>{c.guest_count}</td>
                  <td><span className={`badge ${STATUS_CLASS[c.status] || 'badge-gray'}`}>{c.status}</span></td>
                  <td className="td-price">{c.quoted_price_usd ? `$${Number(c.quoted_price_usd).toLocaleString()}` : <span style={{ color: 'var(--gray-400)', fontWeight: 400 }}>Pending</span>}</td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-gold btn-xs" onClick={() => setPriceModal(c)}><i className="bi bi-tag" /></button>
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

function YachtPriceForm({ charter, onSuccess, onClose }) {
  const [form, setForm] = useState({ quoted_price_usd: '', status: 'quoted', send_email: true, email_message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminYachtApi.setPrice(charter.id, { ...form, quoted_price_usd: Number(form.quoted_price_usd) });
      onSuccess();
    } catch {} finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Quoted Price (USD) <span className="req">*</span></label>
          <input className="form-control" type="number" min="0" step="0.01" value={form.quoted_price_usd} onChange={e => setForm(p => ({ ...p, quoted_price_usd: e.target.value }))} required />
        </div>
        <div className="form-group">
          <label className="form-label">Update Status</label>
          <select className="form-control" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <label className="check-row">
          <input type="checkbox" checked={form.send_email} onChange={e => setForm(p => ({ ...p, send_email: e.target.checked }))} />
          Send quote email to {charter.guest_email}
        </label>
        {form.send_email && (
          <div className="form-group">
            <label className="form-label">Custom Message (optional)</label>
            <textarea className="form-control" rows={4} value={form.email_message} onChange={e => setForm(p => ({ ...p, email_message: e.target.value }))} placeholder="Leave blank for default…" />
          </div>
        )}
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-gold" disabled={loading}>
          {loading ? <><span className="spinner" /> Saving…</> : <><i className="bi bi-check-lg" /> Set Price</>}
        </button>
      </div>
    </form>
  );
}