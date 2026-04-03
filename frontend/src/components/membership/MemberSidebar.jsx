import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';

export default function MemberSidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: '/member',          icon: 'bi-house',           label: 'Dashboard',      end: true },
    { to: '/member/fleet',    icon: 'bi-airplane',         label: 'Browse Fleet' },
    { to: '/member/book',     icon: 'bi-calendar-plus',   label: 'Book a Flight' },
    { to: '/member/routes',   icon: 'bi-map',             label: 'Saved Routes' },
    { to: '/member/payments', icon: 'bi-credit-card',     label: 'Payments' },
    { to: '/member/profile',  icon: 'bi-person-circle',   label: 'Profile' },
  ];

  const initials = user
    ? `${(user.first_name || user.username || '?')[0]}${(user.last_name || '')[0] || ''}`.toUpperCase()
    : '?';

  return (
    <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))' }}>
          <i className="bi bi-star" />
        </div>
        <div>
          <div className="sidebar-logo-text">Nairobi<span>Jet</span></div>
          <div className="sidebar-role-badge">Member Portal</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">My Account</div>
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
        <div className="sidebar-section-label">Help</div>
        <a
          href="tel:+254700000000"
          className="sidebar-link"
          onClick={onClose}
        >
          <i className="bi bi-telephone" />
          <span>24/7 Concierge</span>
        </a>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.first_name || user?.username}</div>
            <div className="sidebar-user-role">Member</div>
          </div>
          <button
            className="sidebar-logout"
            onClick={async () => { await logout(); navigate('/'); }}
          >
            <i className="bi bi-box-arrow-right" />
          </button>
        </div>
      </div>
    </aside>
  );
}