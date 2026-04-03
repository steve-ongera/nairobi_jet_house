import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';

export default function StaffSidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: '/staff',            icon: 'bi-speedometer2', label: 'Overview',   end: true },
    { to: '/staff/bookings',   icon: 'bi-calendar-check', label: 'Bookings' },
    { to: '/staff/inquiries',  icon: 'bi-inbox',          label: 'Inquiries' },
    { to: '/staff/email',      icon: 'bi-envelope',       label: 'Send Email' },
  ];

  const initials = user
    ? `${(user.first_name || user.username || '?')[0]}${(user.last_name || '')[0] || ''}`.toUpperCase()
    : '?';

  return (
    <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon"><i className="bi bi-headset" /></div>
        <div>
          <div className="sidebar-logo-text">Nairobi<span>Jet</span></div>
          <div className="sidebar-role-badge">Staff Portal</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Navigation</div>
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <i className={`bi ${l.icon}`} />
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.first_name || user?.username}</div>
            <div className="sidebar-user-role">Staff</div>
          </div>
          <button
            className="sidebar-logout"
            onClick={async () => { await logout(); navigate('/login'); }}
          >
            <i className="bi bi-box-arrow-right" />
          </button>
        </div>
      </div>
    </aside>
  );
}