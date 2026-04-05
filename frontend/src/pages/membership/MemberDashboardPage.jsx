// MemberDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MemberLayout from '../../components/membership/MemberLayout';
import { memberApi } from '../../services/api';
import { useAuth } from '../../App';

export function MemberDashboardPage() {
  const { user } = useAuth();
  const [dash, setDash] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    memberApi.dashboard()
      .then(r => { setDash(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fmt = n =>
    n ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 0 })}` : '$0';

  const statusColor = s => ({
    confirmed: 'badge-green', pending: 'badge-amber',
    cancelled: 'badge-red', in_flight: 'badge-blue',
    completed: 'badge-navy',
  }[s] || 'badge-navy');

  if (loading) return (
    <MemberLayout title="Dashboard">
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <span className="spinner spinner-dark" style={{ width: 36, height: 36 }} />
      </div>
    </MemberLayout>
  );

  const tierColors = {
    basic: { from: '#1e3a5f', to: '#0f2a4a' },
    premium: { from: '#2c1e4f', to: '#1a0f3a' },
    corporate: { from: '#1a2f1a', to: '#0f2010' },
  };
  const tierKey = dash?.membership?.tier?.name || 'basic';
  const colors = tierColors[tierKey] || tierColors.basic;

  return (
    <MemberLayout title="My Dashboard">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem' }}>
            Member Portal
          </div>
          <h2 style={{ margin: 0, fontSize: '1.9rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--navy)' }}>
            Welcome back, {user?.first_name || user?.username} 👋
          </h2>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--gray-400)', fontSize: '0.9rem' }}>
            Your private aviation command centre
          </p>
        </div>
        <Link to="/member/book" className="btn btn-gold">
          <i className="bi bi-calendar-plus" style={{ marginRight: '0.45rem' }} />
          Book a Flight
        </Link>
      </div>

      {/* ── Membership Card ──────────────────────────────────────────────── */}
      {dash?.membership ? (
        <div style={{
          background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`,
          borderRadius: 'var(--radius-xl)', padding: '2rem 2.25rem',
          marginBottom: '2rem', position: 'relative', overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(11,29,58,0.25)',
        }}>
          {/* decorative rings */}
          <div style={{ position: 'absolute', right: '-80px', top: '-80px', width: '260px', height: '260px', borderRadius: '50%', border: '1px solid rgba(201,168,76,0.15)' }} />
          <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '200px', height: '200px', borderRadius: '50%', border: '1px solid rgba(201,168,76,0.1)' }} />
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '140px', height: '140px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)' }} />

          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.5rem' }}>
                Active Membership
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, color: '#fff', lineHeight: 1.1 }}>
                {dash.membership.tier_name}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span><i className="bi bi-calendar-check" style={{ marginRight: '0.3rem' }} />
                  {dash.days_remaining !== null ? `${dash.days_remaining} days remaining` : 'Perpetual'}
                </span>
                {dash.renewal_alert && (
                  <span style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.15)', padding: '0.2rem 0.6rem', borderRadius: 20, fontSize: '0.75rem' }}>
                    ⚠️ Renew soon
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
              <span className={`badge ${dash.membership.status === 'active' ? 'badge-green' : 'badge-amber'}`}
                style={{ padding: '0.35rem 0.9rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {dash.membership.status}
              </span>
              <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', textAlign: 'right' }}>
                Member since {dash.membership.start_date ? new Date(dash.membership.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
              </div>
            </div>
          </div>

          {/* Progress bar for days remaining */}
          {dash.days_remaining !== null && (
            <div style={{ position: 'relative', zIndex: 1, marginTop: '1.5rem' }}>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 2,
                  background: 'linear-gradient(90deg, var(--gold), #e8c96a)',
                  width: `${Math.min((dash.days_remaining / 365) * 100, 100)}%`,
                  transition: 'width 1s ease',
                }} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
          border: '1px solid #fde68a', borderRadius: 'var(--radius-xl)',
          padding: '1.5rem 2rem', marginBottom: '2rem',
          display: 'flex', alignItems: 'center', gap: '1rem',
        }}>
          <i className="bi bi-star-fill" style={{ color: 'var(--gold)', fontSize: '1.4rem', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, color: '#92400e', marginBottom: '0.2rem' }}>No active membership</div>
            <div style={{ fontSize: '0.85rem', color: '#b45309' }}>
              Unlock exclusive fleet access and member benefits.{' '}
              <Link to="/membership" style={{ color: 'var(--gold)', fontWeight: 700 }}>Explore plans →</Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Stat Cards ───────────────────────────────────────────────────── */}
      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        {[
          { icon: 'bi-airplane', label: 'Total Flights', value: dash?.total_flights || 0, variant: '' },
          { icon: 'bi-cash', label: 'Total Spent', value: fmt(dash?.total_spent_usd), variant: 'navy' },
          { icon: 'bi-calendar-check', label: 'Upcoming Flights', value: dash?.upcoming_bookings?.length || 0, variant: '' },
          { icon: 'bi-shield-check', label: 'Days Remaining', value: dash?.days_remaining ?? '∞', variant: 'green' },
        ].map(({ icon, label, value, variant }) => (
          <div key={label} className={`stat-card ${variant}`} style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -8, top: -8, opacity: 0.05, fontSize: '4.5rem' }}>
              <i className={`bi ${icon}`} />
            </div>
            <div className="stat-card-icon"><i className={`bi ${icon}`} /></div>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
          </div>
        ))}
      </div>

      {/* ── Upcoming Bookings ────────────────────────────────────────────── */}
      {dash?.upcoming_bookings?.length > 0 && (
        <div className="table-card">
          <div className="table-card-header">
            <div className="table-card-title">
              <i className="bi bi-calendar-event" style={{ color: 'var(--gold)', marginRight: '0.5rem' }} />
              Upcoming Flights
            </div>
            <Link to="/member/book" className="btn btn-ghost btn-sm">
              <i className="bi bi-plus" style={{ marginRight: '0.3rem' }} /> New Booking
            </Link>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Aircraft</th>
                  <th>Departure</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {dash.upcoming_bookings.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: 'var(--navy)' }}>
                        <span>{b.origin}</span>
                        <i className="bi bi-arrow-right" style={{ color: 'var(--gold)', fontSize: '0.75rem' }} />
                        <span>{b.destination}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>{b.aircraft_name}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>
                      {b.departure_datetime ? new Date(b.departure_datetime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td><span className={`badge ${statusColor(b.status)}`}>{b.status}</span></td>
                    <td className="td-price" style={{ textAlign: 'right' }}>
                      ${Number(b.gross_amount_usd || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Quick Actions ────────────────────────────────────────────────── */}
      {!dash?.upcoming_bookings?.length && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { to: '/member/book', icon: 'bi-calendar-plus', label: 'Book a Flight', desc: 'Reserve an aircraft' },
            { to: '/member/fleet', icon: 'bi-airplane', label: 'Browse Fleet', desc: 'View available aircraft' },
            { to: '/member/routes', icon: 'bi-map', label: 'Saved Routes', desc: 'Your frequent routes' },
            { to: '/member/payments', icon: 'bi-credit-card', label: 'Payments', desc: 'Transaction history' },
          ].map(({ to, icon, label, desc }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div className="detail-card" style={{ cursor: 'pointer', transition: 'all 0.2s', padding: '1.5rem' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.transform = ''; }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, var(--navy-deep), var(--navy-mid))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.85rem' }}>
                  <i className={`bi ${icon}`} style={{ color: 'var(--gold)', fontSize: '1.1rem' }} />
                </div>
                <div style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: '0.2rem', fontSize: '0.9rem' }}>{label}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </MemberLayout>
  );
}

export default MemberDashboardPage;