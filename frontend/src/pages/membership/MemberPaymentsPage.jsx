// MemberPaymentsPage.jsx
import React, { useState, useEffect } from 'react';
import MemberLayout from '../../components/membership/MemberLayout';
import { memberApi } from '../../services/api';

const STATUS_CONFIG = {
  succeeded: { cls: 'badge-green', icon: 'bi-check-circle-fill', label: 'Succeeded' },
  pending:   { cls: 'badge-amber', icon: 'bi-clock-fill',        label: 'Pending' },
  failed:    { cls: 'badge-red',   icon: 'bi-x-circle-fill',     label: 'Failed' },
  refunded:  { cls: 'badge-navy',  icon: 'bi-arrow-counterclockwise', label: 'Refunded' },
};

const TYPE_CONFIG = {
  membership: { icon: 'bi-patch-check-fill', color: '#7c3aed', bg: '#f5f3ff', label: 'Membership' },
  booking:    { icon: 'bi-airplane-fill',    color: '#0369a1', bg: '#e0f2fe', label: 'Flight' },
  refund:     { icon: 'bi-arrow-counterclockwise', color: '#15803d', bg: '#f0fdf4', label: 'Refund' },
};

export function MemberPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    memberApi.payments()
      .then(r => { setPayments(r.data.results || r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalSpent = payments
    .filter(p => p.status === 'succeeded' && p.payment_type !== 'refund')
    .reduce((sum, p) => sum + Number(p.amount_usd), 0);

  const totalRefunded = payments
    .filter(p => p.payment_type === 'refund')
    .reduce((sum, p) => sum + Number(p.amount_usd), 0);

  const filtered = payments.filter(p => {
    const matchType = filter === 'all' || p.payment_type === filter;
    const matchSearch = !searchTerm ||
      (p.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <MemberLayout title="Payments" breadcrumb="Payment History">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem' }}>
            Billing
          </div>
          <h2 style={{ margin: 0, fontSize: '1.9rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--navy)' }}>
            Payment History
          </h2>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--gray-400)', fontSize: '0.9rem' }}>
            {payments.length} transactions
          </p>
        </div>
      </div>

      {/* ── Summary Cards ─────────────────────────────────────────────────── */}
      {!loading && payments.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            {
              label: 'Total Spent', icon: 'bi-credit-card-fill',
              value: `$${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
              color: 'var(--navy)', bg: 'linear-gradient(135deg, var(--navy-deep), var(--navy-mid))',
              light: false,
            },
            {
              label: 'Transactions', icon: 'bi-receipt',
              value: payments.filter(p => p.status === 'succeeded').length,
              color: '#0369a1', bg: '#e0f2fe', light: true,
            },
            {
              label: 'Total Refunded', icon: 'bi-arrow-counterclockwise',
              value: `$${totalRefunded.toLocaleString('en-US', { minimumFractionDigits: 0 })}`,
              color: '#15803d', bg: '#f0fdf4', light: true,
            },
          ].map(({ label, icon, value, color, bg, light }) => (
            <div key={label} style={{
              background: bg, borderRadius: 'var(--radius-xl)', padding: '1.25rem 1.5rem',
              border: light ? '1px solid transparent' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                <i className={`bi ${icon}`} style={{ color: light ? color : 'var(--gold)', fontSize: '1rem' }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: light ? color : 'rgba(255,255,255,0.5)' }}>
                  {label}
                </span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: light ? color : '#fff' }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 280 }}>
          <i className="bi bi-search" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none', fontSize: '0.85rem' }} />
          <input className="form-control" style={{ paddingLeft: '2.4rem' }} placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        {['all', 'membership', 'booking', 'refund'].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              padding: '0.4rem 1rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
              border: '1.5px solid', borderColor: filter === t ? 'var(--gold)' : 'var(--gray-200)',
              background: filter === t ? 'var(--gold)' : 'transparent',
              color: filter === t ? 'var(--navy-deep)' : 'var(--gray-400)',
              cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
            }}
          >
            {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Table ────────────────────────────────────────────────────────── */}
      <div className="table-card">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="table-empty">
                    <span className="spinner spinner-dark" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-empty">
                    <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--gray-400)' }}>
                      <i className="bi bi-credit-card" style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem', opacity: 0.3 }} />
                      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No transactions yet</div>
                      <div style={{ fontSize: '0.82rem' }}>Your payment history will appear here</div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(p => {
                  const typeCfg = TYPE_CONFIG[p.payment_type] || TYPE_CONFIG.booking;
                  const statusCfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ width: 34, height: 34, borderRadius: 8, background: typeCfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <i className={`bi ${typeCfg.icon}`} style={{ color: typeCfg.color, fontSize: '0.9rem' }} />
                          </div>
                          <span style={{ fontSize: '0.87rem', fontWeight: 500, color: 'var(--navy)' }}>
                            {p.description || '—'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-navy" style={{ background: typeCfg.bg, color: typeCfg.color, borderColor: 'transparent' }}>
                          {typeCfg.label}
                        </span>
                      </td>
                      <td className="td-price" style={{ fontWeight: 700, color: p.payment_type === 'refund' ? '#15803d' : 'var(--navy)' }}>
                        {p.payment_type === 'refund' ? '+' : ''}${Number(p.amount_usd).toLocaleString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <i className={`bi ${statusCfg.icon}`} style={{ fontSize: '0.8rem' }} />
                          <span className={`badge ${statusCfg.cls}`}>{statusCfg.label}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>
                        {p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MemberLayout>
  );
}

export default MemberPaymentsPage;