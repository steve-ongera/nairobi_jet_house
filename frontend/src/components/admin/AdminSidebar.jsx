import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';

const sections = [
  {
    label: 'Overview',
    links: [
      { to: '/admin',           icon: 'bi-speedometer2',   label: 'Dashboard' },
      { to: '/admin/reports',   icon: 'bi-bar-chart-line', label: 'Reports' },
      { to: '/admin/settings',  icon: 'bi-gear',           label: 'Settings' },
    ],
  },
  {
    label: 'Bookings',
    links: [
      { to: '/admin/flights',     icon: 'bi-airplane',     label: 'Flight Bookings' },
      { to: '/admin/yachts',      icon: 'bi-anchor',       label: 'Yacht Charters' },
      { to: '/admin/marketplace', icon: 'bi-collection',   label: 'Marketplace' },
    ],
  },
  {
    label: 'Inquiries',
    links: [
      { to: '/admin/inquiries',   icon: 'bi-inbox',        label: 'All Inquiries' },
    ],
  },
  {
    label: 'People',
    links: [
      { to: '/admin/users',       icon: 'bi-people',       label: 'Users & Members' },
      { to: '/admin/careers',     icon: 'bi-briefcase',    label: 'Careers' },
    ],
  },
  {
    label: 'Communications',
    links: [
      { to: '/admin/emails',      icon: 'bi-envelope-check', label: 'Email Logs' },
    ],
  },
];

// ── Inline style tokens (keeps them in one place, no extra CSS file needed) ──
const S = {
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: 'linear-gradient(180deg, #0b1d3a 0%, #0d2347 100%)',
    borderRight: '1px solid rgba(201,168,76,.12)',
    fontFamily: "'DM Sans', system-ui, sans-serif",
    userSelect: 'none',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1.35rem 1.25rem 1.1rem',
    borderBottom: '1px solid rgba(255,255,255,.06)',
  },
  logoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: 'rgba(201,168,76,.15)',
    border: '1px solid rgba(201,168,76,.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.1rem',
    color: '#C9A84C',
    flexShrink: 0,
  },
  logoTextMain: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#fff',
    letterSpacing: '-0.01em',
    lineHeight: 1.2,
  },
  logoTextAccent: { color: '#C9A84C' },
  roleBadge: {
    display: 'inline-block',
    marginTop: '0.2rem',
    fontSize: '0.65rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'rgba(201,168,76,.75)',
  },
  nav: {
    flex: 1,
    overflowY: 'auto',
    padding: '0.75rem 0.75rem 1rem',
    scrollbarWidth: 'none',
  },
  sectionLabel: {
    padding: '0.9rem 0.6rem 0.3rem',
    fontSize: '0.65rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,.3)',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    padding: '0.55rem 0.85rem',
    borderRadius: 8,
    fontSize: '0.84rem',
    fontWeight: 500,
    color: 'rgba(255,255,255,.6)',
    textDecoration: 'none',
    transition: 'background 0.15s, color 0.15s',
    marginBottom: 2,
  },
  linkActive: {
    background: 'rgba(201,168,76,.13)',
    color: '#C9A84C',
    fontWeight: 600,
  },
  linkIcon: { fontSize: '1rem', flexShrink: 0, width: 18, textAlign: 'center' },
  footer: {
    borderTop: '1px solid rgba(255,255,255,.07)',
    padding: '0.85rem 1rem',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: 'rgba(201,168,76,.18)',
    border: '1.5px solid rgba(201,168,76,.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#C9A84C',
    flexShrink: 0,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: {
    fontSize: '0.83rem',
    fontWeight: 600,
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    fontSize: '0.68rem',
    color: 'rgba(255,255,255,.4)',
    marginTop: 1,
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,.35)',
    cursor: 'pointer',
    padding: '0.35rem',
    borderRadius: 6,
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.15s',
    flexShrink: 0,
  },
};

export default function AdminSidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user
    ? `${(user.first_name || user.username || '?')[0]}${(user.last_name || '')[0] || ''}`.toUpperCase()
    : '?';

  return (
    <aside
      className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}
      style={S.sidebar}
    >
      {/* Logo */}
      <div style={S.logo}>
        <div style={S.logoIconWrap}>
          <i className="bi bi-airplane" />
        </div>
        <div>
          <div style={S.logoTextMain}>
            Nairobi<span style={S.logoTextAccent}>Jet</span>
          </div>
          <span style={S.roleBadge}>Admin Portal</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={S.nav}>
        {sections.map(sec => (
          <div key={sec.label}>
            <div style={S.sectionLabel}>{sec.label}</div>
            {sec.links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/admin'}
                onClick={onClose}
                style={({ isActive }) => ({
                  ...S.link,
                  ...(isActive ? S.linkActive : {}),
                })}
                onMouseEnter={e => {
                  if (!e.currentTarget.classList.contains('active-nav')) {
                    e.currentTarget.style.background = 'rgba(255,255,255,.05)';
                    e.currentTarget.style.color      = 'rgba(255,255,255,.9)';
                  }
                }}
                onMouseLeave={e => {
                  const isActive = e.currentTarget.getAttribute('aria-current') === 'page';
                  e.currentTarget.style.background = isActive ? 'rgba(201,168,76,.13)' : '';
                  e.currentTarget.style.color      = isActive ? '#C9A84C' : 'rgba(255,255,255,.6)';
                }}
              >
                <i className={`bi ${l.icon}`} style={S.linkIcon} />
                <span>{l.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={S.footer}>
        <div style={S.userRow}>
          <div style={S.avatar}>{initials}</div>
          <div style={S.userInfo}>
            <div style={S.userName}>{user?.first_name || user?.username}</div>
            <div style={S.userRole}>Administrator</div>
          </div>
          <button
            style={S.logoutBtn}
            onClick={handleLogout}
            title="Sign out"
            onMouseEnter={e => { e.currentTarget.style.color = '#C9A84C'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,.35)'; }}
          >
            <i className="bi bi-box-arrow-right" />
          </button>
        </div>
      </div>
    </aside>
  );
}