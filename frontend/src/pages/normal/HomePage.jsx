import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { fleetApi } from '../../services/api';

const stats = [
  { value: '140+', label: 'Countries Served' },
  { value: '320+', label: 'Aircraft in Fleet' },
  { value: '18K+', label: 'Flights Completed' },
  { value: '24/7', label: 'Concierge Support' },
];

const services = [
  { icon: 'bi-airplane', title: 'Private Jet Charter', desc: 'One-way, round-trip or multi-leg intercontinental flights tailored to your schedule.', link: '/book-flight' },
  { icon: 'bi-anchor', title: 'Superyacht Charter', desc: 'Sail the Indian Ocean, Mediterranean and beyond in world-class superyachts.', link: '/book-yacht' },
  { icon: 'bi-collection', title: 'Fleet Leasing', desc: 'Monthly, quarterly or multi-year leasing of aircraft and yachts for corporate clients.', link: '/services' },
  { icon: 'bi-truck', title: 'Air Cargo', desc: 'Urgent freight, perishables, pharmaceuticals, and oversized cargo globally.', link: '/services' },
  { icon: 'bi-bar-chart-steps', title: 'Aircraft Sales', desc: 'Buy, sell or trade aircraft with our global aviation brokers.', link: '/services' },
  { icon: 'bi-stars', title: 'VIP Concierge', desc: 'Ground transport, catering, hotel, visas and every detail arranged for you.', link: '/services' },
];

const destinations = [
  { city: 'Dubai', country: 'UAE', code: 'DXB', bg: 'linear-gradient(135deg,#0B1D3A,#1E3E72)' },
  { city: 'London', country: 'UK', code: 'LHR', bg: 'linear-gradient(135deg,#1A3260,#0B1D3A)' },
  { city: 'Paris', country: 'France', code: 'CDG', bg: 'linear-gradient(135deg,#26241F,#3A3832)' },
  { city: 'New York', country: 'USA', code: 'JFK', bg: 'linear-gradient(135deg,#071428,#152D56)' },
  { city: 'Cape Town', country: 'South Africa', code: 'CPT', bg: 'linear-gradient(135deg,#1D6E47,#0B1D3A)' },
  { city: 'Singapore', country: 'Singapore', code: 'SIN', bg: 'linear-gradient(135deg,#B83230,#0B1D3A)' },
];

export default function HomePage() {
  const [aircraft, setAircraft] = useState([]);

  useEffect(() => {
    fleetApi.aircraftList({ page_size: 3 })
      .then(r => setAircraft(r.data.results || r.data))
      .catch(() => {});
  }, []);

  return (
    <>
      <PublicNavbar dark />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="hero" style={{ paddingTop: 0 }}>
        <div
          className="hero-bg"
          style={{
            background: 'linear-gradient(160deg, var(--navy-deep) 0%, var(--navy) 40%, #1E3E72 100%)',
          }}
        >
          {/* Decorative rings */}
          <div style={{
            position: 'absolute', right: '5%', top: '15%',
            width: '45vw', height: '45vw',
            border: '1px solid rgba(201,168,76,0.12)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', right: '12%', top: '22%',
            width: '30vw', height: '30vw',
            border: '1px solid rgba(201,168,76,0.08)',
            borderRadius: '50%', pointerEvents: 'none',
          }} />
        </div>
        <div className="hero-overlay" />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="hero-content fade-up" style={{ maxWidth: 720, padding: '10vh 0 6vh' }}>
            <span className="eyebrow">Africa's Premier Aviation Platform</span>
            <h1 style={{ color: 'var(--white)', fontSize: 'clamp(2.6rem,5.5vw,4.4rem)', lineHeight: 1.08, marginBottom: '1.4rem' }}>
              The World Awaits.<br />
              <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Fly Without Limits.</span>
            </h1>
            <p className="lead delay-200" style={{ color: 'rgba(255,255,255,0.72)', maxWidth: 560, marginBottom: '2.25rem' }}>
              Charter private jets, superyachts and bespoke concierge services across Africa, Europe,
              the Middle East and every continent — from Wilson Airport to the world.
            </p>
            <div className="hero-ctas delay-300">
              <Link to="/book-flight" className="btn btn-gold btn-lg">
                <i className="bi bi-airplane-fill" /> Charter a Jet
              </Link>
              <Link to="/fleet" className="btn btn-outline-gold btn-lg">
                <i className="bi bi-collection" /> Explore Fleet
              </Link>
            </div>

            {/* Quick track */}
            <div className="delay-400" style={{
              marginTop: '2.5rem',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.85rem 1.25rem',
              maxWidth: 520, backdropFilter: 'blur(8px)',
            }}>
              <i className="bi bi-search" style={{ color: 'var(--gold)', fontSize: '1rem' }} />
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.84rem' }}>Track booking reference…</span>
              <Link to="/track" className="btn btn-gold btn-sm" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                Track
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-100)', padding: '2.25rem 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', textAlign: 'center' }}>
            {stats.map(s => (
              <div key={s.label}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,3vw,2.5rem)', fontWeight: 600, color: 'var(--navy)', lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gray-400)', marginTop: '0.3rem' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Services ──────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-4">
            <span className="eyebrow">What We Offer</span>
            <h2>World-Class Aviation Services</h2>
            <div className="gold-rule gold-rule-center" />
            <p className="lead" style={{ maxWidth: 560, margin: '0 auto' }}>
              From private jet charters to superyacht voyages, every service is curated
              with the precision and discretion you deserve.
            </p>
          </div>
          <div className="grid-3" style={{ marginTop: '2.5rem' }}>
            {services.map(s => (
              <Link key={s.title} to={s.link} className="card" style={{ textDecoration: 'none' }}>
                <div className="card-body" style={{ padding: '2rem' }}>
                  <div style={{
                    width: 56, height: 56,
                    background: 'var(--gold-pale)',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem', color: 'var(--gold-dark)',
                    marginBottom: '1.25rem',
                  }}>
                    <i className={`bi ${s.icon}`} />
                  </div>
                  <h4 style={{ marginBottom: '0.6rem' }}>{s.title}</h4>
                  <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>{s.desc}</p>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    Learn More <i className="bi bi-arrow-right" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fleet Preview ──────────────────────────────────────────────────── */}
      {aircraft.length > 0 && (
        <section className="section section-surface">
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="eyebrow">Our Fleet</span>
                <h2>Featured Aircraft</h2>
                <div className="gold-rule" />
              </div>
              <Link to="/fleet" className="btn btn-outline-navy">
                View Full Fleet <i className="bi bi-arrow-right" />
              </Link>
            </div>
            <div className="fleet-grid">
              {aircraft.map(ac => (
                <div key={ac.id} className="aircraft-card">
                  <div className="aircraft-img">
                    {ac.image_url
                      ? <img src={ac.image_url} alt={ac.name} />
                      : <i className="bi bi-airplane" />}
                    <span className="aircraft-category-pill">{ac.category_display || ac.category}</span>
                  </div>
                  <div className="aircraft-body">
                    <div className="aircraft-name">{ac.name}</div>
                    <div className="aircraft-model">{ac.model}</div>
                    <div className="aircraft-specs">
                      <div className="aircraft-spec"><i className="bi bi-people" />{ac.passenger_capacity} pax</div>
                      <div className="aircraft-spec"><i className="bi bi-broadcast" />{ac.range_km?.toLocaleString()} km</div>
                      <div className="aircraft-spec"><i className="bi bi-speedometer" />{ac.cruise_speed_kmh} km/h</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                      <div className="aircraft-price">
                        ${Number(ac.hourly_rate_usd).toLocaleString()}
                        <small>/hr</small>
                      </div>
                      <Link to="/book-flight" className="btn btn-navy btn-sm">
                        <i className="bi bi-calendar-plus" /> Charter
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Destinations ──────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-4">
            <span className="eyebrow">Global Routes</span>
            <h2>Fly Anywhere, Anytime</h2>
            <div className="gold-rule gold-rule-center" />
            <p className="lead" style={{ maxWidth: 520, margin: '0 auto' }}>
              From Nairobi to every corner of the world — intercontinental routes
              planned and operated to perfection.
            </p>
          </div>
          <div className="grid-3" style={{ marginTop: '2.5rem' }}>
            {destinations.map(d => (
              <Link key={d.code} to="/book-flight" style={{
                display: 'block',
                background: d.bg,
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                textDecoration: 'none',
                position: 'relative',
                overflow: 'hidden',
                transition: 'var(--transition-slow)',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ position: 'absolute', right: '-10px', bottom: '-10px', fontSize: '5rem', color: 'rgba(255,255,255,0.05)', fontFamily: 'var(--font-display)', fontWeight: 700, lineHeight: 1 }}>
                  {d.code}
                </div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold-light)', marginBottom: '0.5rem' }}>
                  {d.country}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 600, color: 'var(--white)', marginBottom: '0.85rem' }}>
                  {d.city}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem' }}>
                  <i className="bi bi-airplane" style={{ color: 'var(--gold)' }} />
                  From Nairobi · Charter Now
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Membership CTA ────────────────────────────────────────────────── */}
      <section style={{
        background: 'linear-gradient(135deg, var(--navy-deep) 0%, var(--navy-mid) 100%)',
        padding: 'var(--section-py) 0', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', left: '-5%', top: '-40%',
          width: '50vw', height: '50vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
            <div>
              <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>Membership</span>
              <h2 style={{ color: 'var(--white)', marginBottom: '1rem' }}>
                Unlock Priority Access & Exclusive Rates
              </h2>
              <div className="gold-rule" />
              <p style={{ color: 'rgba(255,255,255,0.62)', marginBottom: '2rem', lineHeight: 1.85 }}>
                Join NairobiJetHouse membership to access our entire marketplace fleet,
                receive priority booking, dedicated concierge, and member-only discounts
                across all our intercontinental routes.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '2.25rem' }}>
                {['Priority fleet access with instant booking', 'Up to 20% off standard charter rates', 'Dedicated 24/7 concierge line', 'Exclusive routes and VIP lounges'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.72)' }}>
                    <i className="bi bi-check-circle-fill" style={{ color: 'var(--gold)', flexShrink: 0 }} />
                    {f}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/membership" className="btn btn-gold btn-lg">
                  <i className="bi bi-star" /> View Membership Plans
                </Link>
                <Link to="/register" className="btn btn-outline-gold">
                  Create Account
                </Link>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { tier: 'Basic', price: '$499', period: '/mo', features: ['10 bookings/mo', '5% discount', 'Standard support'] },
                { tier: 'Premium', price: '$1,299', period: '/mo', features: ['Unlimited bookings', '12% discount', 'Priority support', 'Lounge access'], gold: true },
                { tier: 'Corporate', price: '$3,499', period: '/mo', features: ['Unlimited + multi-user', '20% discount', 'Dedicated manager', 'Global routes'] },
              ].map((t, i) => (
                <div key={t.tier} style={{
                  background: t.gold ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${t.gold ? 'rgba(201,168,76,0.35)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  gridColumn: i === 2 ? '1 / -1' : 'auto',
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: t.gold ? 'var(--gold)' : 'rgba(255,255,255,0.45)', marginBottom: '0.6rem' }}>
                    {t.tier}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--white)', fontWeight: 600, lineHeight: 1, marginBottom: '0.3rem' }}>
                    {t.price}<span style={{ fontSize: '0.85rem', fontWeight: 300, color: 'rgba(255,255,255,0.45)' }}>{t.period}</span>
                  </div>
                  {t.features.map(f => (
                    <div key={f} style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)', marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <i className="bi bi-check2" style={{ color: 'var(--gold)', fontSize: '0.7rem' }} />{f}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Us ────────────────────────────────────────────────────────── */}
      <section className="section section-surface">
        <div className="container">
          <div className="text-center mb-5">
            <span className="eyebrow">Why NairobiJetHouse</span>
            <h2>The Gold Standard in African Aviation</h2>
            <div className="gold-rule gold-rule-center" />
          </div>
          <div className="grid-4">
            {[
              { icon: 'bi-globe', title: 'Global Reach', desc: 'Access to 140+ countries with established operators on every continent.' },
              { icon: 'bi-shield-check', title: 'Fully Vetted', desc: 'All aircraft and operators undergo stringent safety and compliance checks.' },
              { icon: 'bi-lightning-charge', title: 'Instant Quotes', desc: 'Real-time pricing with transparent breakdowns — no hidden fees.' },
              { icon: 'bi-headset', title: '24 / 7 Support', desc: 'Dedicated concierge available around the clock, wherever you are.' },
            ].map(w => (
              <div key={w.title} style={{ textAlign: 'center', padding: '0.5rem' }}>
                <div style={{
                  width: 64, height: 64,
                  background: 'var(--white)',
                  borderRadius: '50%',
                  border: '1px solid var(--gray-100)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', color: 'var(--gold)',
                  margin: '0 auto 1.25rem',
                }}>
                  <i className={`bi ${w.icon}`} />
                </div>
                <h4 style={{ marginBottom: '0.5rem' }}>{w.title}</h4>
                <p style={{ fontSize: '0.875rem' }}>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </>
  );
}