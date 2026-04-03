import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';

export default function PublicNavbar({ dark = false }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setDrawerOpen(false);
  };

  const dashLink = () => {
    if (!user) return '/login';
    const map = { admin: '/admin', staff: '/staff', client: '/member', owner: '/owner' };
    return map[user.role] || '/';
  };

  const navClass = ['navbar', scrolled ? 'scrolled' : '', dark && !scrolled ? 'dark' : '']
    .filter(Boolean).join(' ');

  const links = [
    { to: '/',           label: 'Home' },
    { to: '/fleet',      label: 'Fleet' },
    { to: '/yachts',     label: 'Yachts' },
    { to: '/services',   label: 'Services' },
    { to: '/about',      label: 'About' },
    { to: '/careers',    label: 'Careers' },
    { to: '/contact',    label: 'Contact' },
  ];

  return (
    <>
      <nav className={navClass}>
        <div className="navbar-inner">
          <Link to="/" className="navbar-logo">
            Nairobi<span>Jet</span>House
          </Link>

          <div className="navbar-links">
            {links.map(l => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => isActive ? 'active' : ''}>
                {l.label}
              </NavLink>
            ))}
            {user && (
              <NavLink to={dashLink()} style={{ marginLeft: '0.25rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <i className="bi bi-person-circle" style={{ color: 'var(--gold)' }} />
                  {user.first_name || user.username}
                </span>
              </NavLink>
            )}
          </div>

          <div className="navbar-right">
            {!user ? (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link to="/book-flight" className="btn btn-gold btn-sm navbar-cta">Charter Now</Link>
              </>
            ) : (
              <>
                <Link to={dashLink()} className="btn btn-navy btn-sm">
                  <i className="bi bi-grid-1x2" /> Dashboard
                </Link>
              </>
            )}
            <button
              className="navbar-toggle"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <i className="bi bi-list" />
            </button>
          </div>
        </div>
      </nav>

      {/* Drawer */}
      <div
        className={`drawer-overlay${drawerOpen ? ' open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />
      <aside className={`drawer${drawerOpen ? ' open' : ''}`}>
        <div className="drawer-header">
          <span className="drawer-logo">Nairobi<span>Jet</span>House</span>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <nav className="drawer-nav">
          {links.map(l => (
            <NavLink
              key={l.to} to={l.to}
              className={({ isActive }) => isActive ? 'active' : ''}
              onClick={() => setDrawerOpen(false)}
            >
              <i className={`bi bi-${l.to === '/' ? 'house' : l.to === '/fleet' ? 'airplane' : l.to === '/yachts' ? 'tsunami' : l.to === '/services' ? 'stars' : l.to === '/about' ? 'info-circle' : l.to === '/careers' ? 'briefcase' : 'envelope'}`} />
              {l.label}
            </NavLink>
          ))}
          <div className="drawer-divider" />
          <NavLink to="/book-flight" onClick={() => setDrawerOpen(false)}>
            <i className="bi bi-calendar-plus" /> Book a Flight
          </NavLink>
          <NavLink to="/book-yacht" onClick={() => setDrawerOpen(false)}>
            <i className="bi bi-anchor" /> Charter a Yacht
          </NavLink>
          <NavLink to="/track" onClick={() => setDrawerOpen(false)}>
            <i className="bi bi-search" /> Track Booking
          </NavLink>
          <div className="drawer-divider" />
          {user ? (
            <>
              <NavLink to={dashLink()} onClick={() => setDrawerOpen(false)}>
                <i className="bi bi-grid" /> My Dashboard
              </NavLink>
              <button
                style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '0.85rem 1.5rem', background: 'none', border: 'none', width: '100%', color: 'var(--red)', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right" style={{ color: 'var(--red)', width: 20 }} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setDrawerOpen(false)}>
                <i className="bi bi-person" /> Sign In
              </NavLink>
              <NavLink to="/register" onClick={() => setDrawerOpen(false)}>
                <i className="bi bi-person-plus" /> Create Account
              </NavLink>
            </>
          )}
        </nav>
        <div className="drawer-footer">
          <p>Private aviation · 24/7 concierge · Global routes</p>
          <Link to="/book-flight" className="btn btn-gold btn-sm drawer-footer-book" onClick={() => setDrawerOpen(false)}>
            <i className="bi bi-airplane" /> Charter Now
          </Link>
        </div>
      </aside>
    </>
  );
}