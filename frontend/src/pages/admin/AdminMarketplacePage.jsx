// ── AdminMarketplacePage.jsx ──────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminMarketApi, fleetApi } from '../../services/api';

export function AdminMarketplacePage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [toast, setToast]       = useState('');
  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    adminMarketApi.list().then(r => { setBookings(r.data.results || r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try { await adminMarketApi.updateStatus(id, status); showToast('Status updated'); }
    catch { showToast('Failed'); }
  };

  return (
    <AdminLayout title="Marketplace" breadcrumb="Marketplace Bookings">
      {toast && <div className="alert alert-success" style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 2000, minWidth: 260 }}><i className="bi bi-check-circle" />{toast}</div>}
      <div className="dash-header">
        <div className="dash-header-left"><h2>Marketplace Bookings</h2><p>Member-to-fleet bookings on the marketplace</p></div>
      </div>
      <div className="table-card">
        <div className="table-scroll">
          <table>
            <thead><tr><th>Client</th><th>Aircraft</th><th>Route</th><th>Departure</th><th>Gross</th><th>Commission</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={8} className="table-empty"><span className="spinner spinner-dark" /></td></tr>
              : bookings.length === 0 ? <tr><td colSpan={8} className="table-empty"><i className="bi bi-collection" />No marketplace bookings</td></tr>
              : bookings.map(b => (
                <tr key={b.id}>
                  <td><div className="td-name">{b.client_name}</div><div className="td-email">{b.client_email}</div></td>
                  <td style={{ fontSize: '0.85rem', fontWeight: 500 }}>{b.aircraft_name}</td>
                  <td style={{ fontSize: '0.85rem' }}>{b.origin} → {b.destination}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>{b.departure_datetime ? new Date(b.departure_datetime).toLocaleDateString() : '—'}</td>
                  <td className="td-price">${Number(b.gross_amount_usd || 0).toLocaleString()}</td>
                  <td style={{ color: 'var(--green)', fontWeight: 600 }}>${Number(b.commission_usd || 0).toLocaleString()}</td>
                  <td><span className={`badge status-${b.status}`}>{b.status_display || b.status}</span></td>
                  <td>
                    <select className="form-control" style={{ width: 'auto', padding: '0.3rem 0.5rem', fontSize: '0.72rem' }} value={b.status} onChange={e => updateStatus(b.id, e.target.value)}>
                      {['pending','confirmed','in_flight','completed','cancelled','disputed'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                    </select>
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
export default AdminMarketplacePage;

// ── AdminSettingsPage.jsx ─────────────────────────────────────────────────────
export function AdminSettingsPage() {
  const [commission, setCommission] = useState('');
  const [loading, setLoading]       = useState(false);
  const [toast, setToast]           = useState('');
  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const save = async e => {
    e.preventDefault(); setLoading(true);
    try {
      const { adminUserApi } = await import('../../services/api');
      await adminUserApi.setCommission({ rate_pct: Number(commission), notes: 'Updated via admin portal' });
      showToast('Commission rate updated');
    } catch { showToast('Failed to update'); }
    finally { setLoading(false); }
  };

  return (
    <AdminLayout title="Settings" breadcrumb="Platform Settings">
      {toast && <div className="alert alert-success" style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 2000, minWidth: 260 }}><i className="bi bi-check-circle" />{toast}</div>}
      <div className="dash-header"><div className="dash-header-left"><h2>Platform Settings</h2><p>Commission rates and platform configuration</p></div></div>
      <div className="detail-card" style={{ maxWidth: 540 }}>
        <div className="detail-card-header"><div className="detail-card-title"><i className="bi bi-percent" /> Commission Rate</div></div>
        <div className="detail-card-body">
          <p style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>Set the platform commission percentage applied to all confirmed flight bookings. This will be used as the default for new quotes.</p>
          <form onSubmit={save} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Commission Percentage (%)</label>
              <input className="form-control" type="number" min="0" max="100" step="0.01" value={commission} onChange={e => setCommission(e.target.value)} placeholder="e.g. 10" required />
            </div>
            <button type="submit" className="btn btn-navy" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving…</> : 'Save Rate'}
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}