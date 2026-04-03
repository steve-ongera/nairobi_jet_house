import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';

const sections = [
  {
    label: 'Overview',
    links: [
      { to: '/admin',           icon: 'bi-speedometer2',   label: 'Dashboard' },
      { to: '/admin/settings',  icon: 'bi-gear',           label: 'Settings' },
    ],
  },
  {
    label: 'Bookings',
    links: [
      { to: '/admin/flights',    icon: 'bi-airplane',       label: 'Flight Bookings' },
      { to: '/admin/yachts',     icon: 'bi-anchor',         label: 'Yacht Charters' },
      { to: '/admin/marketplace',icon: 'bi-collection',     label: 'Marketplace' },
    ],
  },
  {
    label: 'Inquiries',
    links: [
      { to: '/admin/inquiries',  icon: 'bi-inbox',          label: 'All Inquiries' },
    ],
  },
  {
    label: 'People',
    links: [
      { to: '/admin/users',      icon: 'bi-people',         label: 'Users & Members' },
      { to: '/admin/careers',    icon: 'bi-briefcase',      label: 'Careers' },
    ],
  },
  {
    label: 'Communications',
    links: [
      { to: '/admin/emails',     icon: 'bi-envelope-check', label: 'Email Logs' },
    ],
  },
];

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
    <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><i className="bi bi-airplane" /></div>
        <div>
          <div className="sidebar-logo-text">Nairobi<span>Jet</span></div>
          <div className="sidebar-role-badge">Admin Portal</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sections.map(sec => (
          <div key={sec.label}>
            <div className="sidebar-section-label">{sec.label}</div>
            {sec.links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/admin'}
                className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
                onClick={onClose}
              >
                <i className={`bi ${l.icon}`} />
                <span>{l.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.first_name || user?.username}</div>
            <div className="sidebar-user-role">Administrator</div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Sign out">
            <i className="bi bi-box-arrow-right" />
          </button>
        </div>
      </div>
    </aside>
  );
}