import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminOverviewApi } from '../../services/api';

function StatCard({ icon, label, value, delta, color = '', link }) {
  const card = (
    <div className={`stat-card${color ? ' ' + color : ''}`} style={{ cursor: link ? 'pointer' : 'default' }}>
      <div className="stat-card-icon"><i className={`bi ${icon}`} /></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {delta && <div className={`stat-delta ${delta.dir}`}><i className={`bi bi-arrow-${delta.dir}`} />{delta.text}</div>}
    </div>
  );
  return link ? <Link to={link} style={{ textDecoration: 'none' }}>{card}</Link> : card;
}

export default function AdminDashboardPage() {
  const [summary, setSummary]   = useState(null);
  const [inquiries, setInquiries] = useState(null);
  const [users, setUsers]       = useState(null);
  const [revenue, setRevenue]   = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      adminOverviewApi.dashSummary(),
      adminOverviewApi.summary(),
      adminOverviewApi.usersSummary(),
      adminOverviewApi.combinedRevenue(),
    ]).then(([s, i, u, r]) => {
      setSummary(s.data);
      setInquiries(i.data);
      setUsers(u.data);
      setRevenue(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const fmt = n => n ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 0 })}` : '$0';

  if (loading) return (
    <AdminLayout title="Dashboard">
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-400)' }}>
        <span className="spinner spinner-dark" style={{ width: 36, height: 36 }} />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Dashboard" breadcrumb="Overview">
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Platform Overview</h2>
          <p>Real-time snapshot of NairobiJetHouse operations</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/admin/flights" className="btn btn-ghost btn-sm"><i className="bi bi-airplane" /> Flight Bookings</Link>
          <Link to="/admin/users" className="btn btn-navy btn-sm"><i className="bi bi-people" /> Manage Users</Link>
        </div>
      </div>

      {/* Revenue stats */}
      <div className="stat-grid">
        <StatCard icon="bi-graph-up-arrow" label="Total Platform Revenue" value={fmt(revenue?.combined?.gross)} color="navy" link="/admin/flights" />
        <StatCard icon="bi-percent" label="Commission Earned" value={fmt(revenue?.combined?.commission)} color="" />
        <StatCard icon="bi-people-fill" label="Active Members" value={users?.active_members || 0} link="/admin/users" />
        <StatCard icon="bi-airplane-fill" label="Approved Aircraft" value={summary?.total_aircraft || 0} link="/admin/marketplace" />
        <StatCard icon="bi-hourglass-split" label="Pending Approvals" value={summary?.pending_approvals || 0} color="red" link="/admin/marketplace" />
        <StatCard icon="bi-exclamation-triangle" label="Open Disputes" value={summary?.open_disputes || 0} color={summary?.open_disputes > 0 ? 'red' : ''} />
        <StatCard icon="bi-inbox" label="Pending Flight Bookings" value={inquiries?.pending_flight_bookings || 0} link="/admin/flights" />
        <StatCard icon="bi-envelope" label="Pending Inquiries" value={(inquiries?.pending_contacts || 0) + (inquiries?.pending_group_charters || 0) + (inquiries?.pending_air_cargo || 0)} link="/admin/inquiries" />
      </div>

      {/* Revenue split */}
      {revenue && (
        <div className="grid-2 mb-4">
          <div className="detail-card">
            <div className="detail-card-header">
              <div className="detail-card-title"><i className="bi bi-airplane" /> Flight Booking Revenue</div>
            </div>
            <div className="detail-card-body">
              <div className="detail-row"><span className="detail-key">Gross Revenue</span><span className="detail-val" style={{ color: 'var(--navy)', fontWeight: 700 }}>{fmt(revenue.flight_bookings?.gross)}</span></div>
              <div className="detail-row"><span className="detail-key">Commission</span><span className="detail-val" style={{ color: 'var(--green)' }}>{fmt(revenue.flight_bookings?.commission)}</span></div>
              <div className="detail-row"><span className="detail-key">Net to Ops</span><span className="detail-val">{fmt(revenue.flight_bookings?.gross - revenue.flight_bookings?.commission)}</span></div>
            </div>
          </div>
          <div className="detail-card">
            <div className="detail-card-header">
              <div className="detail-card-title"><i className="bi bi-collection" /> Marketplace Revenue</div>
            </div>
            <div className="detail-card-body">
              <div className="detail-row"><span className="detail-key">Gross Revenue</span><span className="detail-val" style={{ color: 'var(--navy)', fontWeight: 700 }}>{fmt(revenue.marketplace_bookings?.gross)}</span></div>
              <div className="detail-row"><span className="detail-key">Commission</span><span className="detail-val" style={{ color: 'var(--green)' }}>{fmt(revenue.marketplace_bookings?.commission)}</span></div>
              <div className="detail-row"><span className="detail-key">Net to Owners</span><span className="detail-val">{fmt(revenue.marketplace_bookings?.gross - revenue.marketplace_bookings?.commission)}</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Inquiry breakdown */}
      {inquiries && (
        <div className="table-card mb-4">
          <div className="table-card-header">
            <div className="table-card-title"><i className="bi bi-inbox-fill" /> Inquiry Volume by Type</div>
            <Link to="/admin/inquiries" className="btn btn-ghost btn-sm">View All</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0', borderBottom: '1px solid var(--gray-100)' }}>
            {[
              { label: 'Flight Bookings', val: inquiries.flight_bookings, icon: 'bi-airplane', link: '/admin/flights' },
              { label: 'Yacht Charters', val: inquiries.yacht_charters, icon: 'bi-anchor', link: '/admin/yachts' },
              { label: 'Flight Inquiries', val: inquiries.flight_inquiries, icon: 'bi-search', link: '/admin/inquiries' },
              { label: 'Group Charters', val: inquiries.group_charters, icon: 'bi-people', link: '/admin/inquiries' },
              { label: 'Air Cargo', val: inquiries.air_cargo, icon: 'bi-box-seam', link: '/admin/inquiries' },
              { label: 'Aircraft Sales', val: inquiries.aircraft_sales, icon: 'bi-currency-dollar', link: '/admin/inquiries' },
              { label: 'Lease Inquiries', val: inquiries.lease_inquiries, icon: 'bi-file-text', link: '/admin/inquiries' },
              { label: 'Contacts', val: inquiries.contacts, icon: 'bi-envelope', link: '/admin/inquiries' },
            ].map(item => (
              <Link key={item.label} to={item.link} style={{ textDecoration: 'none', padding: '1.25rem', textAlign: 'center', borderRight: '1px solid var(--gray-100)', display: 'block' }}>
                <i className={`bi ${item.icon}`} style={{ fontSize: '1.35rem', color: 'var(--gold)', display: 'block', marginBottom: '0.5rem' }} />
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, color: 'var(--navy)', lineHeight: 1 }}>{item.val || 0}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', marginTop: '0.25rem', fontWeight: 500 }}>{item.label}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* User summary */}
      {users && (
        <div className="detail-card">
          <div className="detail-card-header">
            <div className="detail-card-title"><i className="bi bi-people" /> User Breakdown</div>
            <Link to="/admin/users" className="btn btn-ghost btn-sm">Manage</Link>
          </div>
          <div className="detail-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', textAlign: 'center' }}>
              {[
                { label: 'Total Users', val: users.total_users, color: 'var(--navy)' },
                { label: 'Clients', val: users.clients, color: 'var(--blue)' },
                { label: 'Fleet Owners', val: users.owners, color: 'var(--gold-dark)' },
                { label: 'Active Members', val: users.active_members, color: 'var(--green)' },
              ].map(u => (
                <div key={u.label}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 600, color: u.color, lineHeight: 1, marginBottom: '0.3rem' }}>{u.val || 0}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 500 }}>{u.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}