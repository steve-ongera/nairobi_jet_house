// MemberDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MemberLayout from '../../components/membership/MemberLayout';
import { memberApi, membershipApi } from '../../services/api';
import { useAuth } from '../../App';

export function MemberDashboardPage() {
  const { user } = useAuth();
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    memberApi.dashboard().then(r => { setDash(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const fmt = n => n ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 0 })}` : '$0';

  if (loading) return <MemberLayout title="Dashboard"><div style={{ textAlign: 'center', padding: '3rem' }}><span className="spinner spinner-dark" style={{ width: 32, height: 32 }} /></div></MemberLayout>;

  return (
    <MemberLayout title="My Dashboard">
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Welcome back, {user?.first_name || user?.username} 👋</h2>
          <p>Your private aviation dashboard</p>
        </div>
        <Link to="/member/book" className="btn btn-gold btn-sm"><i className="bi bi-calendar-plus" /> Book a Flight</Link>
      </div>

      {/* Membership card */}
      {dash?.membership ? (
        <div style={{
          background: 'linear-gradient(135deg, var(--navy-deep) 0%, var(--navy-mid) 100%)',
          borderRadius: 'var(--radius-xl)', padding: '2rem',
          marginBottom: '2rem', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: '-5%', top: '-30%', width: '50%', paddingBottom: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.35rem' }}>Membership</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 600, color: 'var(--white)' }}>{dash.membership.tier_name}</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.35rem' }}>
                {dash.days_remaining !== null ? `${dash.days_remaining} days remaining` : 'Active'}
                {dash.renewal_alert && <span style={{ color: 'var(--amber)', marginLeft: '0.75rem' }}>⚠️ Renew soon</span>}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={`badge ${dash.membership.status === 'active' ? 'badge-green' : 'badge-amber'}`}>{dash.membership.status}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="alert alert-info" style={{ marginBottom: '2rem' }}>
          <i className="bi bi-star" />
          <span>You don't have an active membership. <Link to="/membership" style={{ color: 'var(--gold)', fontWeight: 600 }}>Explore plans →</Link></span>
        </div>
      )}

      <div className="stat-grid">
        <div className="stat-card"><div className="stat-card-icon"><i className="bi bi-airplane" /></div><div className="stat-label">Total Flights</div><div className="stat-value">{dash?.total_flights || 0}</div></div>
        <div className="stat-card navy"><div className="stat-card-icon"><i className="bi bi-cash" /></div><div className="stat-label">Total Spent</div><div className="stat-value">{fmt(dash?.total_spent_usd)}</div></div>
        <div className="stat-card"><div className="stat-card-icon"><i className="bi bi-calendar-check" /></div><div className="stat-label">Upcoming Flights</div><div className="stat-value">{dash?.upcoming_bookings?.length || 0}</div></div>
        <div className="stat-card green"><div className="stat-card-icon"><i className="bi bi-map" /></div><div className="stat-label">Days Remaining</div><div className="stat-value">{dash?.days_remaining ?? '∞'}</div></div>
      </div>

      {/* Upcoming bookings */}
      {dash?.upcoming_bookings?.length > 0 && (
        <div className="table-card">
          <div className="table-card-header">
            <div className="table-card-title"><i className="bi bi-calendar-event" /> Upcoming Flights</div>
            <Link to="/member/book" className="btn btn-ghost btn-sm">+ New Booking</Link>
          </div>
          <div className="table-scroll">
            <table>
              <thead><tr><th>Route</th><th>Aircraft</th><th>Departure</th><th>Status</th><th>Amount</th></tr></thead>
              <tbody>
                {dash.upcoming_bookings.map(b => (
                  <tr key={b.id}>
                    <td><strong>{b.origin} → {b.destination}</strong></td>
                    <td style={{ fontSize: '0.85rem' }}>{b.aircraft_name}</td>
                    <td style={{ fontSize: '0.85rem' }}>{b.departure_datetime ? new Date(b.departure_datetime).toLocaleString() : '—'}</td>
                    <td><span className={`badge status-${b.status}`}>{b.status}</span></td>
                    <td className="td-price">${Number(b.gross_amount_usd || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </MemberLayout>
  );
}
export default MemberDashboardPage;

// ── MemberFleetPage.jsx ───────────────────────────────────────────────────────
export function MemberFleetPage() {
  const [fleet, setFleet]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    memberApi.fleet().then(r => { setFleet(r.data.results || r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <MemberLayout title="Browse Fleet" breadcrumb="Fleet">
      <div className="dash-header"><div className="dash-header-left"><h2>Available Fleet</h2><p>Member-exclusive aircraft for instant booking</p></div></div>
      {loading ? <div style={{ textAlign: 'center', padding: '3rem' }}><span className="spinner spinner-dark" style={{ width: 32, height: 32 }} /></div> : (
        <div className="fleet-grid">
          {fleet.map(ac => (
            <div key={ac.id} className="aircraft-card">
              <div className="aircraft-img">
                {ac.image_url ? <img src={ac.image_url} alt={ac.name} /> : <i className="bi bi-airplane" />}
                <span className="aircraft-category-pill">{ac.category_display || ac.category}</span>
              </div>
              <div className="aircraft-body">
                <div className="aircraft-name">{ac.name}</div>
                <div className="aircraft-model">{ac.model}</div>
                <div className="aircraft-specs">
                  <div className="aircraft-spec"><i className="bi bi-people" />{ac.passenger_capacity} pax</div>
                  <div className="aircraft-spec"><i className="bi bi-broadcast" />{ac.range_km?.toLocaleString()} km</div>
                  <div className="aircraft-spec"><i className="bi bi-geo-alt" />{ac.base_location}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <div className="aircraft-price">${Number(ac.hourly_rate_usd).toLocaleString()}<small>/hr</small></div>
                  <Link to="/member/book" state={{ aircraftId: ac.id }} className="btn btn-navy btn-sm"><i className="bi bi-calendar-plus" /> Book</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </MemberLayout>
  );
}

// ── MemberBookPage.jsx ────────────────────────────────────────────────────────
export function MemberBookPage() {
  const [form, setForm] = useState({ trip_type: 'one_way', origin: '', destination: '', departure_datetime: '', return_datetime: '', estimated_hours: 1, passenger_count: 1, aircraft: '', special_requests: '' });
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { memberApi.fleet().then(r => setFleet(r.data.results || r.data)).catch(() => {}); }, []);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const r = await memberApi.createBooking({ ...form, estimated_hours: Number(form.estimated_hours), passenger_count: Number(form.passenger_count), aircraft: Number(form.aircraft) });
      setSuccess(r.data);
    } catch (err) {
      setError(err.response?.data?.non_field_errors?.[0] || err.response?.data?.detail || 'Booking failed. Ensure your membership is active.');
    } finally { setLoading(false); }
  };

  if (success) return (
    <MemberLayout title="Booking Confirmed">
      <div style={{ maxWidth: 540, margin: '0 auto' }}>
        <div className="success-wrap">
          <div className="success-icon"><i className="bi bi-check-lg" /></div>
          <h2>Booking Submitted!</h2>
          <p>Your flight request is pending confirmation.</p>
          <div className="ref-box"><div className="ref-label">Reference</div><div className="ref-value">{String(success.reference).slice(0, 16)}…</div></div>
          <Link to="/member" className="btn btn-navy mt-3"><i className="bi bi-house" /> Back to Dashboard</Link>
        </div>
      </div>
    </MemberLayout>
  );

  return (
    <MemberLayout title="Book a Flight" breadcrumb="New Booking">
      <div className="dash-header"><div className="dash-header-left"><h2>Book a Flight</h2><p>Reserve an aircraft from our marketplace fleet</p></div></div>
      <div style={{ maxWidth: 680 }}>
        {error && <div className="alert alert-error"><i className="bi bi-exclamation-circle" />{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="detail-card">
            <div className="detail-card-header"><div className="detail-card-title"><i className="bi bi-airplane" /> Flight Details</div></div>
            <div className="detail-card-body">
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Select Aircraft <span className="req">*</span></label>
                  <select className="form-control" value={form.aircraft} onChange={set('aircraft')} required>
                    <option value="">Choose aircraft…</option>
                    {fleet.map(a => <option key={a.id} value={a.id}>{a.name} — {a.category_display} ({a.passenger_capacity} pax) · ${Number(a.hourly_rate_usd).toLocaleString()}/hr</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Trip Type</label>
                  <select className="form-control" value={form.trip_type} onChange={set('trip_type')}>
                    <option value="one_way">One Way</option>
                    <option value="round_trip">Round Trip</option>
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Origin <span className="req">*</span></label><input className="form-control" value={form.origin} onChange={set('origin')} placeholder="e.g. Nairobi (NBO)" required /></div>
                <div className="form-group"><label className="form-label">Destination <span className="req">*</span></label><input className="form-control" value={form.destination} onChange={set('destination')} placeholder="e.g. Dubai (DXB)" required /></div>
                <div className="form-group"><label className="form-label">Departure <span className="req">*</span></label><input className="form-control" type="datetime-local" value={form.departure_datetime} onChange={set('departure_datetime')} required /></div>
                {form.trip_type === 'round_trip' && <div className="form-group"><label className="form-label">Return</label><input className="form-control" type="datetime-local" value={form.return_datetime} onChange={set('return_datetime')} /></div>}
                <div className="form-group"><label className="form-label">Est. Hours <span className="req">*</span></label><input className="form-control" type="number" min="0.5" step="0.5" value={form.estimated_hours} onChange={set('estimated_hours')} required /></div>
                <div className="form-group"><label className="form-label">Passengers <span className="req">*</span></label><input className="form-control" type="number" min="1" value={form.passenger_count} onChange={set('passenger_count')} required /></div>
                <div className="form-group form-full"><label className="form-label">Special Requests</label><textarea className="form-control" rows={3} value={form.special_requests} onChange={set('special_requests')} /></div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-gold btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" /> Processing…</> : <><i className="bi bi-send" /> Confirm Booking</>}
            </button>
          </div>
        </form>
      </div>
    </MemberLayout>
  );
}

// ── MemberPaymentsPage.jsx ────────────────────────────────────────────────────
export function MemberPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    memberApi.payments().then(r => { setPayments(r.data.results || r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <MemberLayout title="Payments" breadcrumb="Payment History">
      <div className="dash-header"><div className="dash-header-left"><h2>Payment History</h2><p>Your transaction history</p></div></div>
      <div className="table-card">
        <div className="table-scroll">
          <table>
            <thead><tr><th>Description</th><th>Amount</th><th>Type</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="table-empty"><span className="spinner spinner-dark" /></td></tr>
              : payments.length === 0 ? <tr><td colSpan={5} className="table-empty"><i className="bi bi-credit-card" />No transactions yet</td></tr>
              : payments.map(p => (
                <tr key={p.id}>
                  <td style={{ fontSize: '0.875rem' }}>{p.description || '—'}</td>
                  <td className="td-price">${Number(p.amount_usd).toLocaleString()}</td>
                  <td><span className="badge badge-navy">{p.type_display || p.payment_type}</span></td>
                  <td><span className={`badge ${p.status === 'succeeded' ? 'badge-green' : p.status === 'failed' ? 'badge-red' : 'badge-amber'}`}>{p.status}</span></td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MemberLayout>
  );
}

// ── MemberProfilePage.jsx ─────────────────────────────────────────────────────
export function MemberProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState({ first_name: user?.first_name || '', last_name: user?.last_name || '', phone: user?.phone || '', company: user?.company || '' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState('');

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      const { authApi } = await import('../../services/api');
      await authApi.updateProfile(form);
      setToast('Profile updated');
      setTimeout(() => setToast(''), 3000);
    } catch {} finally { setLoading(false); }
  };

  return (
    <MemberLayout title="Profile" breadcrumb="My Profile">
      {toast && <div className="alert alert-success" style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 2000, minWidth: 260 }}><i className="bi bi-check-circle" />{toast}</div>}
      <div className="dash-header"><div className="dash-header-left"><h2>My Profile</h2></div></div>
      <div className="detail-card" style={{ maxWidth: 560 }}>
        <div className="detail-card-header"><div className="detail-card-title"><i className="bi bi-person-circle" /> Personal Details</div></div>
        <div className="detail-card-body">
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">First Name</label><input className="form-control" value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Last Name</label><input className="form-control" value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Company</label><input className="form-control" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} /></div>
            </div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-control" value={user?.email} disabled /></div>
            <div style={{ textAlign: 'right' }}>
              <button type="submit" className="btn btn-navy" disabled={loading}>
                {loading ? <><span className="spinner" /> Saving…</> : <><i className="bi bi-check-lg" /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MemberLayout>
  );
}

// ── MemberRoutesPage.jsx ──────────────────────────────────────────────────────
export function MemberRoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', origin: '', destination: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const load = () => { memberApi.savedRoutes().then(r => { setRoutes(r.data.results || r.data); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const save = async e => {
    e.preventDefault(); setSaving(true);
    try { await memberApi.saveRoute(form); load(); setForm({ name: '', origin: '', destination: '', notes: '' }); }
    catch {} finally { setSaving(false); }
  };

  const del = async id => {
    try { await memberApi.deleteRoute(id); load(); } catch {}
  };

  return (
    <MemberLayout title="Saved Routes" breadcrumb="Routes">
      <div className="dash-header"><div className="dash-header-left"><h2>Saved Routes</h2><p>Bookmark frequently flown routes</p></div></div>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="detail-card">
          <div className="detail-card-header"><div className="detail-card-title"><i className="bi bi-bookmark-plus" /> Save New Route</div></div>
          <div className="detail-card-body">
            <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group"><label className="form-label">Route Name <span className="req">*</span></label><input className="form-control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Nairobi → Dubai" required /></div>
              <div className="form-group"><label className="form-label">Origin</label><input className="form-control" value={form.origin} onChange={e => setForm(p => ({ ...p, origin: e.target.value }))} placeholder="NBO / Nairobi" /></div>
              <div className="form-group"><label className="form-label">Destination</label><input className="form-control" value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))} placeholder="DXB / Dubai" /></div>
              <button type="submit" className="btn btn-gold" disabled={saving}>{saving ? <><span className="spinner" /> Saving…</> : <><i className="bi bi-bookmark-plus" /> Save Route</>}</button>
            </form>
          </div>
        </div>
        <div>
          {loading ? <div style={{ padding: '2rem', textAlign: 'center' }}><span className="spinner spinner-dark" /></div>
          : routes.length === 0 ? <div className="detail-card"><div className="detail-card-body" style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}><i className="bi bi-map" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem' }} /><p>No saved routes yet</p></div></div>
          : routes.map(r => (
            <div key={r.id} className="detail-card" style={{ marginBottom: '0.75rem' }}>
              <div className="detail-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: '0.25rem' }}>{r.name}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>{r.origin} → {r.destination}</div>
                    {r.notes && <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: '0.25rem' }}>{r.notes}</div>}
                  </div>
                  <button className="btn btn-red btn-xs" onClick={() => del(r.id)}><i className="bi bi-trash" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MemberLayout>
  );
}