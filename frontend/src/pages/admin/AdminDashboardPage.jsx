import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminOverviewApi, adminFlightApi } from '../../services/api';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler
);

// ── Inline styles ─────────────────────────────────────────────────────────────
const styles = {
  page: {
    padding: '0 0 2.5rem',
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '1.75rem',
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: 600,
    color: '#0f172a',
    margin: 0,
    lineHeight: 1.2,
  },
  pageSubtitle: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '4px',
  },
  headerActions: {
    display: 'flex',
    gap: '8px',
  },
  btnOutline: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    fontSize: '12.5px',
    fontWeight: 500,
    color: '#334155',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    textDecoration: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    fontSize: '12.5px',
    fontWeight: 500,
    color: '#fff',
    background: '#0f172a',
    border: '1px solid #0f172a',
    borderRadius: '8px',
    textDecoration: 'none',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  sectionLabel: {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.07em',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginBottom: '10px',
    marginTop: '1.75rem',
  },
  // ── Stat Cards ──────────────────────────────────────────────────────────────
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: '10px',
  },
  statCard: {
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #f1f5f9',
    padding: '1.1rem 1.2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    position: 'relative',
    overflow: 'hidden',
  },
  statTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.85rem',
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: '9px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statBadge: {
    fontSize: '11px',
    fontWeight: 600,
    padding: '2px 7px',
    borderRadius: '20px',
  },
  statValue: {
    fontSize: '26px',
    fontWeight: 700,
    color: '#0f172a',
    lineHeight: 1,
    marginBottom: '3px',
    letterSpacing: '-0.5px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: 400,
  },
  // ── Charts ──────────────────────────────────────────────────────────────────
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0,2fr) minmax(0,1fr)',
    gap: '10px',
    marginTop: '10px',
  },
  chartCard: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #f1f5f9',
    padding: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  chartTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#0f172a',
    marginBottom: '4px',
  },
  chartSubtitle: {
    fontSize: '11.5px',
    color: '#94a3b8',
    marginBottom: '1rem',
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '10px',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '11.5px',
    color: '#475569',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: '2px',
    flexShrink: 0,
  },
  barGrid: {
    marginTop: '10px',
  },
  barChartCard: {
    background: '#fff',
    borderRadius: '10px', 
    border: '1px solid #f1f5f9',
    borderTop: '12px',
    padding: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  },
  // ── Table ───────────────────────────────────────────────────────────────────
  tableCard: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #f1f5f9',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    marginTop: '10px',
  },
  tableHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.9rem 1.25rem',
    borderBottom: '1px solid #f1f5f9',
  },
  tableTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#0f172a',
  },
  tableCount: {
    fontSize: '12px',
    color: '#94a3b8',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12.5px',
  },
  th: {
    textAlign: 'left',
    fontSize: '11px',
    fontWeight: 600,
    color: '#94a3b8',
    padding: '0.55rem 1.25rem',
    background: '#f8fafc',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '0.75rem 1.25rem',
    borderBottom: '1px solid #f8fafc',
    color: '#0f172a',
    verticalAlign: 'middle',
  },
  tdMono: {
    padding: '0.75rem 1.25rem',
    borderBottom: '1px solid #f8fafc',
    color: '#94a3b8',
    fontFamily: 'monospace',
    fontSize: '11px',
    verticalAlign: 'middle',
  },
  tdMuted: {
    padding: '0.75rem 1.25rem',
    borderBottom: '1px solid #f8fafc',
    color: '#94a3b8',
    verticalAlign: 'middle',
  },
  // ── Loaders ──────────────────────────────────────────────────────────────────
  loader: {
    textAlign: 'center',
    padding: '5rem 0',
    color: '#94a3b8',
    fontSize: '13px',
  },
  skeletonCard: {
    background: 'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite',
    borderRadius: '12px',
    height: '100px',
  },
};

// ── Status pill ───────────────────────────────────────────────────────────────
const STATUS_PILL = {
  confirmed: { background: '#dcfce7', color: '#15803d' },
  quoted:    { background: '#fef9c3', color: '#854d0e' },
  in_flight: { background: '#dbeafe', color: '#1d4ed8' },
  inquiry:   { background: '#f1f5f9', color: '#475569' },
  completed: { background: '#f0fdf4', color: '#166534' },
  cancelled: { background: '#fee2e2', color: '#b91c1c' },
};

function StatusPill({ status }) {
  const s = status?.toLowerCase().replace(' ', '_') || 'inquiry';
  const style = STATUS_PILL[s] || STATUS_PILL.inquiry;
  return (
    <span style={{
      ...style,
      fontSize: '11px',
      fontWeight: 600,
      padding: '3px 9px',
      borderRadius: '20px',
      display: 'inline-block',
      textTransform: 'capitalize',
    }}>
      {status?.replace('_', ' ') || 'Inquiry'}
    </span>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, badge, badgeColor, icon, iconBg, link }) {
  const card = (
    <div style={styles.statCard}>
      <div style={styles.statTop}>
        <div style={{ ...styles.statIconWrap, background: iconBg }}>
          {icon}
        </div>
        {badge && (
          <span style={{ ...styles.statBadge, ...badgeColor }}>
            {badge}
          </span>
        )}
      </div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
  return link
    ? <Link to={link} style={{ textDecoration: 'none' }}>{card}</Link>
    : card;
}

// ── Chart.js shared options ───────────────────────────────────────────────────
const GRID_COLOR = 'rgba(0,0,0,0.05)';
const TICK_COLOR = '#94a3b8';
const baseTickStyle = { color: TICK_COLOR, font: { size: 11, family: "'DM Sans', sans-serif" } };

const fmt$ = n => {
  if (!n && n !== 0) return '$0';
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return '$' + Math.round(n / 1000) + 'K';
  return '$' + Number(n).toLocaleString();
};

// ── Main Component ─────────────────────────────────────────────────────────────
// ── Normalize any API shape to a plain array ─────────────────────────────────
const toArray = val => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (val.results && Array.isArray(val.results)) return val.results;
  if (val.data && Array.isArray(val.data)) return val.data;
  if (typeof val === 'object') return Object.values(val);
  return [];
};

export default function AdminDashboardPage() {
  const [summary,   setSummary]   = useState(null);
  const [inquiries, setInquiries] = useState(null);
  const [users,     setUsers]     = useState(null);
  const [revenue,   setRevenue]   = useState(null);
  const [chart,     setChart]     = useState(null);
  const [bookings,  setBookings]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      adminOverviewApi.dashSummary().catch(() => ({ data: {} })),
      adminOverviewApi.summary().catch(() => ({ data: {} })),
      adminOverviewApi.usersSummary().catch(() => ({ data: {} })),
      adminOverviewApi.combinedRevenue().catch(() => ({ data: {} })),
      adminOverviewApi.revenueChart({ months: 7 }).catch(() => ({ data: [] })),
      adminFlightApi.list({ page_size: 5, ordering: '-created_at' }).catch(() => ({ data: [] })),
    ])
      .then(([s, i, u, r, c, b]) => {
        setSummary(s.data || {});
        setInquiries(i.data || {});
        setUsers(u.data || {});
        setRevenue(r.data || {});
        // revenueChart can come back as array, {results:[]}, or {data:[]}
        setChart(toArray(c.data));
        setBookings(toArray(b.data));
      })
      .catch(err => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false));
  }, []);

  // ── Line chart data ─────────────────────────────────────────────────────────
  // chart is always a plain array after toArray() normalization
  const chartArr = Array.isArray(chart) ? chart : [];
  const lineData = {
    labels: chartArr.map(d => d.month || d.label || ''),
    datasets: [
      {
        label: 'Gross Revenue',
        data: chartArr.map(d => parseFloat(d.gross_usd ?? d.gross ?? 0) || 0),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.08)',
        borderWidth: 2,
        pointRadius: 3.5,
        pointBackgroundColor: '#3b82f6',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Commission',
        data: chartArr.map(d => parseFloat(d.commission_usd ?? d.commission ?? 0) || 0),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.07)',
        borderWidth: 2,
        pointRadius: 3.5,
        pointBackgroundColor: '#10b981',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: { label: ctx => ' ' + ctx.dataset.label + ': ' + fmt$(ctx.raw) },
      },
    },
    scales: {
      x: { grid: { color: GRID_COLOR }, ticks: { ...baseTickStyle, autoSkip: false } },
      y: { grid: { color: GRID_COLOR }, ticks: { ...baseTickStyle, callback: fmt$ } },
    },
  };

  // ── Doughnut data ───────────────────────────────────────────────────────────
  const flightGross = parseFloat(revenue?.flight_bookings?.gross) || 0;
  const marketGross = parseFloat(revenue?.marketplace_bookings?.gross) || 0;
  const yachtGross  = parseFloat(revenue?.yacht_charters?.gross) || 0;

  const doughnutData = {
    labels: ['Flight Bookings', 'Marketplace', 'Yacht Charters'],
    datasets: [{
      data: [flightGross, marketGross, yachtGross],
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: ctx => ' ' + ctx.label + ': ' + fmt$(ctx.raw) } },
    },
  };

  // ── Bar chart data ──────────────────────────────────────────────────────────
  const barLabels = [
    'Flights', 'Yachts', 'Flt. Inquiry', 'Group', 'Cargo', 'Sales', 'Lease', 'Contact',
  ];
  const barValues = [
    inquiries?.flight_bookings,
    inquiries?.yacht_charters,
    inquiries?.flight_inquiries,
    inquiries?.group_charters,
    inquiries?.air_cargo,
    inquiries?.aircraft_sales,
    inquiries?.lease_inquiries,
    inquiries?.contacts,
  ].map(v => v || 0);

  const barData = {
    labels: barLabels,
    datasets: [{
      label: 'Total',
      data: barValues,
      backgroundColor: [
        '#3b82f6','#10b981','#8b5cf6','#f59e0b',
        '#ef4444','#06b6d4','#f97316','#64748b',
      ],
      borderRadius: 6,
      borderSkipped: false,
      barPercentage: 0.55,
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { ...baseTickStyle, autoSkip: false } },
      y: { grid: { color: GRID_COLOR }, ticks: { ...baseTickStyle } },
    },
  };

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        <div style={styles.page}>
          <div style={styles.statsGrid}>
            {[...Array(5)].map((_, i) => <div key={i} style={styles.skeletonCard} />)}
          </div>
          <div style={{ ...styles.chartsGrid, marginTop: '1.5rem' }}>
            <div style={{ ...styles.skeletonCard, height: 280 }} />
            <div style={{ ...styles.skeletonCard, height: 280 }} />
          </div>
          <div style={{ ...styles.skeletonCard, height: 220, marginTop: '10px' }} />
          <div style={{ ...styles.skeletonCard, height: 260, marginTop: '10px' }} />
        </div>
      </AdminLayout>
    );
  }

  const totalInquiries =
    (inquiries?.pending_contacts || 0) +
    (inquiries?.pending_group_charters || 0) +
    (inquiries?.pending_air_cargo || 0);

  return (
    <AdminLayout title="Dashboard" breadcrumb="Overview">
      <div style={styles.page}>

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div style={styles.pageHeader}>
          <div>
            <h2 style={styles.pageTitle}>Platform Overview</h2>
            <p style={styles.pageSubtitle}>Real-time snapshot of platform operations</p>
          </div>
          <div style={styles.headerActions}>
            <Link to="/admin/flights" style={styles.btnOutline}>
              <i className="bi bi-airplane" style={{ fontSize: 13 }} /> Flight Bookings
            </Link>
            <Link to="/admin/users" style={styles.btnPrimary}>
              <i className="bi bi-people" style={{ fontSize: 13 }} /> Manage Users
            </Link>
          </div>
        </div>

        {/* ── 5 Stat Cards ──────────────────────────────────────────────────── */}
        <div style={styles.sectionLabel}>Key Metrics</div>
        <div style={styles.statsGrid}>

          <StatCard
            label="Total Platform Revenue"
            value={fmt$(parseFloat(revenue?.combined?.gross))}
            badge="+12%"
            badgeColor={{ background: '#dcfce7', color: '#15803d' }}
            iconBg="#eff6ff"
            link="/admin/flights"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 17l5-5 4 4 9-9" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
          />

          <StatCard
            label="Commission Earned"
            value={fmt$(parseFloat(revenue?.combined?.commission))}
            badge="+8%"
            badgeColor={{ background: '#d1fae5', color: '#065f46' }}
            iconBg="#ecfdf5"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="#10b981" strokeWidth="2"/>
                <path d="M12 6v12M9 9h4.5a1.5 1.5 0 010 3H9m0 0h5.5a1.5 1.5 0 010 3H9" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            }
          />

          <StatCard
            label="Active Members"
            value={users?.active_members || 0}
            badge={`${users?.clients || 0} clients`}
            badgeColor={{ background: '#ede9fe', color: '#6d28d9' }}
            iconBg="#f5f3ff"
            link="/admin/users"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="9" cy="7" r="4" stroke="#8b5cf6" strokeWidth="2"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            }
          />

          <StatCard
            label="Approved Aircraft"
            value={summary?.total_aircraft || 0}
            badge={`${summary?.pending_approvals || 0} pending`}
            badgeColor={{ background: '#fef3c7', color: '#92400e' }}
            iconBg="#fffbeb"
            link="/admin/marketplace"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="#f59e0b" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            }
          />

          <StatCard
            label="Pending Inquiries"
            value={totalInquiries}
            badge="needs action"
            badgeColor={{ background: '#fee2e2', color: '#b91c1c' }}
            iconBg="#fff1f2"
            link="/admin/inquiries"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22 17H2a3 3 0 003-3V9a7 7 0 0114 0v5a3 3 0 003 3z" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M12 21a2 2 0 002-2H10a2 2 0 002 2z" stroke="#ef4444" strokeWidth="2"/>
              </svg>
            }
          />

        </div>

        {/* ── Line + Doughnut ────────────────────────────────────────────────── */}
        <div style={styles.sectionLabel}>Revenue Analytics</div>
        <div style={styles.chartsGrid}>

          {/* Line Chart */}
          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>Revenue over time</div>
            <div style={styles.chartSubtitle}>Monthly gross revenue vs commission</div>
            {chartArr.length > 0 ? (
              <>
                <div style={styles.legend}>
                  <span style={styles.legendItem}>
                    <span style={{ ...styles.legendDot, background: '#3b82f6' }} />
                    Gross Revenue
                  </span>
                  <span style={styles.legendItem}>
                    <span style={{ ...styles.legendDot, background: '#10b981' }} />
                    Commission
                  </span>
                </div>
                <div style={{ position: 'relative', height: 230 }}>
                  <Line data={lineData} options={lineOptions} />
                </div>
              </>
            ) : (
              <div style={{ height: 230, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>
                No revenue data yet
              </div>
            )}
          </div>

          {/* Doughnut */}
          <div style={styles.chartCard}>
            <div style={styles.chartTitle}>Revenue by type</div>
            <div style={styles.chartSubtitle}>Share of total gross</div>
            <div style={{ position: 'relative', height: 170 }}>
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
            <div style={{ ...styles.legend, marginTop: 16 }}>
              {[
                { label: 'Flights',      value: fmt$(flightGross), color: '#3b82f6' },
                { label: 'Marketplace', value: fmt$(marketGross), color: '#10b981' },
                { label: 'Yachts',      value: fmt$(yachtGross),  color: '#f59e0b' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={styles.legendItem}>
                    <span style={{ ...styles.legendDot, background: item.color }} />
                    {item.label}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', paddingLeft: 13 }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Bar Chart ─────────────────────────────────────────────────────── */}
        <div style={styles.barChartCard}>
          <div style={styles.chartTitle}>Inquiry volume by type</div>
          <div style={styles.chartSubtitle}>Total inquiries per category</div>
          <div style={{ position: 'relative', height: 210, marginTop: 20 }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        {/* ── Recent Flight Bookings Table ───────────────────────────────────── */}
        <div style={styles.sectionLabel}>Recent Bookings</div>
        <div style={styles.tableCard}>
          <div style={styles.tableHead}>
            <span style={styles.tableTitle}>Latest flight bookings</span>
            <Link to="/admin/flights" style={{ fontSize: 12, color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
              View all →
            </Link>
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Reference', 'Guest', 'Route', 'Date', 'Passengers', 'Quoted Price', 'Status'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ ...styles.td, textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((b, i) => (
                  <tr key={b.id || i} style={{ cursor: 'pointer' }}
                    onMouseEnter={e => { Array.from(e.currentTarget.cells).forEach(c => c.style.background = '#f8fafc'); }}
                    onMouseLeave={e => { Array.from(e.currentTarget.cells).forEach(c => c.style.background = ''); }}
                  >
                    <td style={styles.tdMono}>
                      {String(b.reference || '').slice(0, 8).toUpperCase()}
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 500 }}>{b.guest_name}</div>
                      {b.company && (
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>{b.company}</div>
                      )}
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontWeight: 500 }}>
                        {b.origin_detail?.code || b.origin} → {b.destination_detail?.code || b.destination}
                      </span>
                      {(b.origin_detail?.city || b.destination_detail?.city) && (
                        <div style={{ fontSize: 11, color: '#94a3b8' }}>
                          {b.origin_detail?.city} → {b.destination_detail?.city}
                        </div>
                      )}
                    </td>
                    <td style={styles.tdMuted}>
                      {b.departure_date
                        ? new Date(b.departure_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      {b.passenger_count || '—'}
                    </td>
                    <td style={styles.td}>
                      {b.quoted_price_usd
                        ? <span style={{ fontWeight: 600 }}>{fmt$(parseFloat(b.quoted_price_usd))}</span>
                        : <span style={{ color: '#94a3b8' }}>—</span>}
                    </td>
                    <td style={styles.td}>
                      <StatusPill status={b.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </AdminLayout>
  );
}