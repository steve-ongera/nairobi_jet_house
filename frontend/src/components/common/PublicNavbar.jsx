import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

const PRIMARY_LINKS = [
  { to: '/',               label: 'Home' },
  { to: '/book-flight',    label: 'Private Jet Charter', cta: true },
  { to: '/fleet',          label: 'Our Fleet' },
  { to: '/yacht-charter',  label: 'Yacht Charter' },
  { to: '/flight-inquiry', label: 'Flight Inquiry' },
  { to: '/contact',        label: 'Contact Us' },
]

const SERVICE_LINKS = [
  { to: '/book-flight',    label: 'Private Jet Charter', icon: 'bi-airplane',          desc: 'One-way, multi-leg & round-trip intercontinental' },
  { to: '/flight-inquiry', label: 'Flight Inquiry',      icon: 'bi-send',              desc: 'Get a custom quote for your route' },
  { to: '/group-charter',  label: 'Group Charter',       icon: 'bi-people',            desc: 'Travel for teams, events & delegations' },
  { to: '/air-cargo',      label: 'Air Cargo',           icon: 'bi-boxes',             desc: 'Time-critical & specialist freight' },
  { to: '/aircraft-sales', label: 'Aircraft Sales',      icon: 'bi-tag',               desc: 'Buy, sell or trade private aircraft' },
  { to: '/leasing',        label: 'Leasing',             icon: 'bi-file-earmark-text', desc: 'Dedicated aircraft & yacht programs' },
]

const DRAWER_LINKS = [
  { to: '/',               label: 'Home',             icon: 'bi-house' },
  { to: '/book-flight',    label: 'Book a Flight',    icon: 'bi-airplane' },
  { to: '/fleet',          label: 'Our Fleet',        icon: 'bi-grid-3x3-gap' },
  { to: '/flight-inquiry', label: 'Flight Inquiry',   icon: 'bi-send' },
  { to: '/yacht-charter',  label: 'Yacht Charter',    icon: 'bi-water' },
  { to: '/about',          label: 'About Us',         icon: 'bi-building' },
  { to: '/careers',        label: 'Careers',          icon: 'bi-briefcase' },
  { to: '/contact',        label: 'Contact Us',       icon: 'bi-envelope' },
  { to: '/track',          label: 'Track Booking',    icon: 'bi-search' },
]

const DRAWER_SERVICE_LINKS = [
  { to: '/group-charter',  label: 'Group Charter',  icon: 'bi-people' },
  { to: '/air-cargo',      label: 'Air Cargo',      icon: 'bi-boxes' },
  { to: '/aircraft-sales', label: 'Aircraft Sales', icon: 'bi-tag' },
  { to: '/leasing',        label: 'Leasing',        icon: 'bi-file-earmark-text' },
]

export default function PublicNavbar({ dark = false }) {
  const [scrolled, setScrolled]         = useState(false)
  const [drawerOpen, setDrawerOpen]     = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser]                 = useState(null)
  const location                        = useLocation()
  const navigate                        = useNavigate()

  /* ── Scroll listener ─────────────────────────────────────────────────── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Close everything on route change & sync user ───────────────────── */
  useEffect(() => {
    setDrawerOpen(false)
    setServicesOpen(false)
    setUserMenuOpen(false)
    try {
      const stored = localStorage.getItem('njh_user') || localStorage.getItem('vj_user')
      setUser(stored ? JSON.parse(stored) : null)
    } catch { setUser(null) }
  }, [location])

  /* ── Lock body scroll when drawer is open ───────────────────────────── */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  const handleLogout = () => {
    localStorage.removeItem('njh_user')
    localStorage.removeItem('vj_user')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
    navigate('/')
  }

  const dashboardPath =
    user?.role === 'owner' ? '/owner'
    : user?.role === 'admin' ? '/admin'
    : user?.role === 'staff' ? '/staff'
    : '/member'

  const navClass = [
    'navbar',
    scrolled ? 'scrolled' : '',
    dark && !scrolled ? 'dark' : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════════════════════════════ */}
      <nav className={navClass}>
        <div className="navbar-inner" style={{ gap: '0.5rem' }}>

          {/* Logo */}
          <Link to="/" className="navbar-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
            <img
              src="/nairobi_jet_house_logo.png"
              alt="NairobiJetHouse logo"
              style={{ height: 36, width: 'auto', objectFit: 'contain' }}
            />
            Nairobi<span>JetHouse</span>
          </Link>

          {/* Desktop links */}
          <ul className="navbar-links" style={{ gap: '0.1rem' }}>
            {PRIMARY_LINKS.map(({ to, label, cta }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={[isActive(to) ? 'active' : '', cta ? 'navbar-cta-btn' : ''].join(' ').trim()}
                  style={{ fontSize: '0.8rem', padding: cta ? undefined : '0.42rem 0.72rem' }}
                  onMouseEnter={e => { if (!cta) { e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textUnderlineOffset = '3px'; e.currentTarget.style.fontWeight = '700' } }}
                  onMouseLeave={e => { if (!cta) { e.currentTarget.style.textDecoration = 'none'; e.currentTarget.style.fontWeight = isActive(to) ? '700' : '500' } }}
                >
                  {label}
                </Link>
              </li>
            ))}

            {/* Services dropdown */}
            <li style={{ position: 'relative' }}>
              <button
                onClick={() => setServicesOpen(o => !o)}
                onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textUnderlineOffset = '3px'; e.currentTarget.style.fontWeight = '700' }}
                onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; e.currentTarget.style.fontWeight = '500' }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  fontSize: '0.8rem', fontFamily: 'inherit', fontWeight: 500,
                  color: servicesOpen ? 'var(--gold)' : 'inherit',
                  padding: '0.42rem 0.72rem', borderRadius: 'var(--radius)',
                  transition: 'var(--transition)',
                }}
              >
                More&nbsp;
                <i className={`bi bi-chevron-${servicesOpen ? 'up' : 'down'}`}
                   style={{ fontSize: '0.65rem' }} />
              </button>

              {servicesOpen && (
                <>
                  <div
                    onClick={() => setServicesOpen(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 498 }}
                  />
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 0.85rem)', left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 499,
                    background: 'var(--white)',
                    border: '1px solid var(--gray-100)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-2xl)',
                    width: 560,
                    overflow: 'hidden',
                    animation: 'fadeIn 0.18s var(--ease)',
                  }}>
                    <div style={{
                      padding: '0.85rem 1.25rem 0.6rem',
                      fontSize: '0.62rem', fontWeight: 700,
                      letterSpacing: '0.18em', textTransform: 'uppercase',
                      color: 'var(--gold)',
                      borderBottom: '1px solid var(--gray-100)',
                      background: 'var(--surface)',
                    }}>
                      Specialist Services
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                      {SERVICE_LINKS.map(({ to, label, icon, desc }) => (
                        <Link
                          key={to} to={to}
                          onClick={() => setServicesOpen(false)}
                          style={{
                            display: 'flex', alignItems: 'flex-start',
                            gap: '0.85rem', padding: '1rem 1.25rem',
                            textDecoration: 'none',
                            borderBottom: '1px solid var(--gray-100)',
                            borderRight: '1px solid var(--gray-100)',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <div style={{
                            width: 38, height: 38,
                            background: 'var(--gold-pale)',
                            borderRadius: 'var(--radius)',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', flexShrink: 0,
                          }}>
                            <i className={`bi ${icon}`}
                               style={{ color: 'var(--gold-dark)', fontSize: '1rem' }} />
                          </div>
                          <div>
                            <div style={{
                              fontWeight: 600, fontSize: '0.84rem',
                              color: 'var(--navy)', marginBottom: '0.2rem',
                            }}>
                              {label}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', lineHeight: 1.5 }}>
                              {desc}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div style={{
                      padding: '0.75rem 1.25rem',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--surface)',
                      borderTop: '1px solid var(--gray-100)',
                    }}>
                      <Link
                        to="/about"
                        onClick={() => setServicesOpen(false)}
                        style={{
                          fontSize: '0.78rem', color: 'var(--navy)',
                          fontWeight: 500, textDecoration: 'none',
                          display: 'flex', alignItems: 'center', gap: '0.4rem',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textUnderlineOffset = '3px'; e.currentTarget.style.fontWeight = '700' }}
                        onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; e.currentTarget.style.fontWeight = '500' }}
                      >
                        <i className="bi bi-building" style={{ color: 'var(--gold)' }} />
                        About Us
                      </Link>
                      <Link
                        to="/track"
                        onClick={() => setServicesOpen(false)}
                        style={{
                          fontSize: '0.78rem', color: 'var(--navy)',
                          fontWeight: 500, textDecoration: 'none',
                          display: 'flex', alignItems: 'center', gap: '0.4rem',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.textUnderlineOffset = '3px'; e.currentTarget.style.fontWeight = '700' }}
                        onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; e.currentTarget.style.fontWeight = '500' }}
                      >
                        <i className="bi bi-search" style={{ color: 'var(--gold)' }} />
                        Track Booking
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </li>

            {/* User / Sign In */}
            <li style={{ position: 'relative', marginLeft: '0.25rem' }}>
              {user ? (
                <>
                  <button
                    onClick={() => setUserMenuOpen(o => !o)}
                    style={{
                      background: 'none',
                      border: '1.5px solid var(--gray-200)',
                      borderRadius: 'var(--radius-full)',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.28rem 0.75rem',
                      fontFamily: 'inherit', fontSize: '0.8rem',
                      fontWeight: 600, color: 'var(--navy)',
                      transition: 'var(--transition)',
                    }}
                  >
                    <i className="bi bi-person-circle" style={{ fontSize: '1rem', color: 'var(--gold)' }} />
                    {user.first_name || user.username}
                    <i className={`bi bi-chevron-${userMenuOpen ? 'up' : 'down'}`}
                       style={{ fontSize: '0.62rem' }} />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        onClick={() => setUserMenuOpen(false)}
                        style={{ position: 'fixed', inset: 0, zIndex: 498 }}
                      />
                      <div style={{
                        position: 'absolute', top: 'calc(100% + 0.75rem)', right: 0,
                        zIndex: 499,
                        background: 'var(--white)',
                        border: '1px solid var(--gray-100)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-xl)',
                        minWidth: 200, overflow: 'hidden',
                        animation: 'fadeIn 0.18s var(--ease)',
                      }}>
                        <div style={{
                          padding: '0.85rem 1rem',
                          borderBottom: '1px solid var(--gray-100)',
                        }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy)' }}>
                            {user.first_name} {user.last_name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>{user.email}</div>
                          <span style={{
                            fontSize: '0.62rem', fontWeight: 700,
                            background: 'var(--gold-pale)', color: 'var(--gold-dark)',
                            padding: '1px 8px', borderRadius: 'var(--radius-full)',
                            marginTop: '0.3rem', display: 'inline-block',
                            textTransform: 'uppercase', letterSpacing: '0.08em',
                          }}>
                            {user.role}
                          </span>
                        </div>

                        {[
                          { to: dashboardPath,          icon: 'bi-speedometer2', label: 'Dashboard' },
                          { to: '/member/bookings',     icon: 'bi-calendar3',    label: 'My Bookings' },
                          { to: '/membership/plans',    icon: 'bi-shield-check', label: 'Membership' },
                        ].map(({ to, icon, label }) => (
                          <Link
                            key={to} to={to}
                            onClick={() => setUserMenuOpen(false)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '0.6rem',
                              padding: '0.65rem 1rem', textDecoration: 'none',
                              fontSize: '0.84rem', color: 'var(--gray-700)',
                              borderBottom: '1px solid var(--gray-100)',
                              transition: 'background 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--gray-50)'; e.currentTarget.style.fontWeight = '700' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.fontWeight = '500' }}
                          >
                            <i className={`bi ${icon}`} style={{ color: 'var(--gold)' }} />
                            {label}
                          </Link>
                        ))}

                        <button
                          onClick={handleLogout}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center',
                            gap: '0.6rem', padding: '0.65rem 1rem',
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '0.84rem', color: 'var(--red)', textAlign: 'left',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--red-light)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <i className="bi bi-box-arrow-right" /> Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.35rem',
                    padding: '0.3rem 0.85rem',
                    border: '1.5px solid var(--navy)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.8rem', fontWeight: 600, color: 'var(--navy)',
                    textDecoration: 'none', transition: 'var(--transition)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--navy)'; e.currentTarget.style.color = 'white' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--navy)' }}
                >
                  <i className="bi bi-person" /> Sign In
                </Link>
              )}
            </li>
          </ul>

          {/* Mobile toggle */}
          <button
            className="navbar-toggle"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <i className="bi bi-list" />
          </button>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════════════
          MOBILE DRAWER
      ════════════════════════════════════════════════════════════════ */}
      <div
        className={`drawer-overlay${drawerOpen ? ' open' : ''}`}
        onClick={() => setDrawerOpen(false)}
      />

      <aside className={`drawer${drawerOpen ? ' open' : ''}`} aria-modal="true" role="dialog">
        <div className="drawer-header">
          <span className="drawer-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img
              src="/nairobi_jet_house_logo.png"
              alt="NairobiJetHouse logo"
              style={{ height: 30, width: 'auto', objectFit: 'contain' }}
            />
            Nairobi<span>JetHouse</span>
          </span>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <nav className="drawer-nav">
          {DRAWER_LINKS.map(({ to, label, icon }) => (
            <Link
              key={to} to={to}
              className={isActive(to) ? 'active' : ''}
              onClick={() => setDrawerOpen(false)}
            >
              <i className={`bi ${icon}`} />
              {label}
            </Link>
          ))}

          <div className="drawer-divider" />

          <div style={{
            padding: '0.4rem 1.5rem 0.2rem',
            fontSize: '0.62rem', fontWeight: 700,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'var(--gray-400)',
          }}>
            Services
          </div>
          {DRAWER_SERVICE_LINKS.map(({ to, label, icon }) => (
            <Link
              key={to} to={to}
              className={isActive(to) ? 'active' : ''}
              onClick={() => setDrawerOpen(false)}
            >
              <i className={`bi ${icon}`} />
              {label}
            </Link>
          ))}

          <div className="drawer-divider" />

          {user ? (
            <>
              <Link to={dashboardPath} onClick={() => setDrawerOpen(false)}>
                <i className="bi bi-speedometer2" /> Dashboard
              </Link>
              <Link to="/member/bookings" onClick={() => setDrawerOpen(false)}>
                <i className="bi bi-calendar3" /> My Bookings
              </Link>
              <Link to="/membership/plans" onClick={() => setDrawerOpen(false)}>
                <i className="bi bi-shield-check" /> Membership
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.85rem',
                  padding: '0.85rem 1.5rem',
                  color: 'var(--red)', fontSize: '0.9rem', fontWeight: 500,
                  width: '100%', textAlign: 'left',
                }}
              >
                <i className="bi bi-box-arrow-right"
                   style={{ color: 'var(--red)', width: 20, textAlign: 'center' }} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setDrawerOpen(false)}>
                <i className="bi bi-person" /> Sign In
              </Link>
              <Link to="/register" onClick={() => setDrawerOpen(false)}>
                <i className="bi bi-person-plus" /> Create Account
              </Link>
              <Link to="/membership/plans" onClick={() => setDrawerOpen(false)}>
                <i className="bi bi-shield-check" /> View Membership Plans
              </Link>
            </>
          )}

          <div className="drawer-divider" />

          <a href="tel:+254724878136">
            <i className="bi bi-telephone" /> +254 724 878 136
          </a>
          <a href="mailto:nairobijethouse@gmail.com">
            <i className="bi bi-envelope" /> nairobijethouse@gmail.com
          </a>
        </nav>

        <div className="drawer-footer">
          <p className="text-muted" style={{ fontSize: '0.78rem', marginBottom: '0.85rem' }}>
            No account required. Our team is available 24/7.
          </p>
          <Link
            to="/book-flight"
            className="btn btn-navy btn-lg drawer-footer-book"
            onClick={() => setDrawerOpen(false)}
          >
            <i className="bi bi-airplane" /> Private Charter
          </Link>
        </div>
      </aside>
    </>
  )
}