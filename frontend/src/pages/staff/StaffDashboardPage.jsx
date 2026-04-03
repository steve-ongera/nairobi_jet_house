// ── StaffDashboardPage.jsx ────────────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StaffLayout from '../../components/staff/StaffLayout';
import { adminOverviewApi } from '../../services/api';

export function StaffDashboardPage() {
  const [data, setData] = useState(null);
  useEffect(() => {
    adminOverviewApi.summary().then(r => setData(r.data)).catch(() => {});
  }, []);

  return (
    <StaffLayout title="Staff Dashboard">
      <div className="dash-header"><div className="dash-header-left"><h2>Staff Overview</h2><p>Pending tasks and recent activity</p></div></div>
      <div className="stat-grid">
        {[
          { icon: 'bi-airplane', label: 'Pending Flights', value: data?.pending_flight_bookings || 0, link: '/staff/bookings', color: 'navy' },
          { icon: 'bi-anchor', label: 'Pending Charters', value: data?.pending_yacht_charters || 0, link: '/staff/bookings' },
          { icon: 'bi-inbox', label: 'Pending Inquiries', value: data?.pending_contacts || 0, link: '/staff/inquiries' },
          { icon: 'bi-envelope', label: 'Emails Sent Today', value: '—', link: '/staff/email' },
        ].map(s => (
          <Link key={s.label} to={s.link} style={{ textDecoration: 'none' }}>
            <div className={`stat-card${s.color ? ' ' + s.color : ''}`}>
              <div className="stat-card-icon"><i className={`bi ${s.icon}`} /></div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          </Link>
        ))}
      </div>
      <div className="grid-2">
        <div className="detail-card">
          <div className="detail-card-header"><div className="detail-card-title"><i className="bi bi-lightning" /> Quick Actions</div></div>
          <div className="detail-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <Link to="/staff/bookings" className="btn btn-outline-navy"><i className="bi bi-airplane" /> View Flight Bookings</Link>
            <Link to="/staff/inquiries" className="btn btn-outline-navy"><i className="bi bi-inbox" /> View Inquiries</Link>
            <Link to="/staff/email" className="btn btn-outline-gold"><i className="bi bi-envelope" /> Send Custom Email</Link>
          </div>
        </div>
        <div className="detail-card">
          <div className="detail-card-header"><div className="detail-card-title"><i className="bi bi-info-circle" /> Staff Guidelines</div></div>
          <div className="detail-card-body">
            {['Respond to all new inquiries within 2 hours', 'Set flight quote prices after checking rates', 'Always cc the client on status changes', 'Log all client communications via Send Email'].map(g => (
              <div key={g} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.84rem', color: 'var(--gray-600)', marginBottom: '0.6rem' }}>
                <i className="bi bi-check-circle" style={{ color: 'var(--green)', marginTop: '2px', flexShrink: 0 }} />{g}
              </div>
            ))}
          </div>
        </div>
      </div>
    </StaffLayout>
  );
}
export default StaffDashboardPage;

// ── StaffBookingsPage.jsx ─────────────────────────────────────────────────────
export function StaffBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const { adminFlightApi } = require('../../services/api');

  useEffect(() => {
    adminFlightApi.list().then(r => { setBookings(r.data.results || r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <StaffLayout title="Bookings" breadcrumb="Flight Bookings">
      <div className="dash-header"><div className="dash-header-left"><h2>Flight Bookings</h2></div></div>
      <div className="table-card">
        <div className="table-scroll">
          <table>
            <thead><tr><th>Guest</th><th>Route</th><th>Date</th><th>Status</th><th>Price</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="table-empty"><span className="spinner spinner-dark" /></td></tr>
              : bookings.length === 0 ? <tr><td colSpan={5} className="table-empty"><i className="bi bi-inbox" />No bookings</td></tr>
              : bookings.map(b => (
                <tr key={b.id}>
                  <td><div className="td-name">{b.guest_name}</div><div className="td-email">{b.guest_email}</div></td>
                  <td><strong>{b.origin_detail?.code} → {b.destination_detail?.code}</strong></td>
                  <td>{b.departure_date}</td>
                  <td><span className={`badge status-${b.status}`}>{b.status}</span></td>
                  <td className="td-price">{b.quoted_price_usd ? `$${Number(b.quoted_price_usd).toLocaleString()}` : 'Not quoted'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </StaffLayout>
  );
}

// ── StaffInquiriesPage.jsx ────────────────────────────────────────────────────
export function StaffInquiriesPage() {
  return (
    <StaffLayout title="Inquiries" breadcrumb="All Inquiries">
      <div className="dash-header"><div className="dash-header-left"><h2>Inquiries</h2></div></div>
      <div className="alert alert-navy"><i className="bi bi-info-circle" />Use the Admin Inquiries panel for full reply functionality. Staff view coming soon.</div>
    </StaffLayout>
  );
}

// ── StaffEmailPage.jsx ────────────────────────────────────────────────────────
export function StaffEmailPage() {
  const [form, setForm] = useState({ to_email: '', to_name: '', subject: '', body: '', inquiry_type: 'general' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      const { adminEmailApi } = await import('../../services/api');
      await adminEmailApi.send(form);
      showToast('Email sent successfully');
      setForm(p => ({ ...p, to_email: '', to_name: '', subject: '', body: '' }));
    } catch { showToast('Failed to send'); }
    finally { setLoading(false); }
  };

  return (
    <StaffLayout title="Send Email" breadcrumb="Communications">
      {toast && <div className="alert alert-success" style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 2000, minWidth: 260 }}><i className="bi bi-check-circle" />{toast}</div>}
      <div className="dash-header"><div className="dash-header-left"><h2>Send Email</h2><p>Send a message to any contact</p></div></div>
      <div className="detail-card" style={{ maxWidth: 680 }}>
        <div className="detail-card-header"><div className="detail-card-title"><i className="bi bi-envelope" /> New Email</div></div>
        <div className="detail-card-body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">To Email <span className="req">*</span></label><input className="form-control" type="email" value={form.to_email} onChange={e => setForm(p => ({ ...p, to_email: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Recipient Name</label><input className="form-control" value={form.to_name} onChange={e => setForm(p => ({ ...p, to_name: e.target.value }))} /></div>
            </div>
            <div className="form-group"><label className="form-label">Subject <span className="req">*</span></label><input className="form-control" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required /></div>
            <div className="form-group"><label className="form-label">Message <span className="req">*</span></label><textarea className="form-control" rows={8} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} required /></div>
            <div style={{ textAlign: 'right' }}>
              <button type="submit" className="btn btn-navy" disabled={loading}>
                {loading ? <><span className="spinner" /> Sending…</> : <><i className="bi bi-send" /> Send Email</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </StaffLayout>
  );
}