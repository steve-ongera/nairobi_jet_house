// FleetPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { fleetApi } from '../../services/api';

export function FleetPage() {
  const [aircraft, setAircraft] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState('');

  const CATS = [
    { value: '', label: 'All Aircraft' },
    { value: 'light', label: 'Light Jet' },
    { value: 'midsize', label: 'Midsize' },
    { value: 'super_midsize', label: 'Super Midsize' },
    { value: 'heavy', label: 'Heavy Jet' },
    { value: 'ultra_long', label: 'Ultra Long Range' },
    { value: 'vip_airliner', label: 'VIP Airliner' },
  ];

  useEffect(() => {
    setLoading(true);
    fleetApi.aircraftList(category ? { category } : {})
      .then(r => { setAircraft(r.data.results || r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category]);

  return (
    <>
      <PublicNavbar />
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Our Fleet</span>
          <h1>Private Jets for Every Mission</h1>
          <div className="gold-rule" style={{ margin: '1rem 0' }} />
          <p style={{ color: 'rgba(255,255,255,0.62)', maxWidth: 520 }}>
            From light jets for regional hops to ultra-long-range aircraft for
            intercontinental journeys — our curated fleet delivers unmatched luxury.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="filter-bar">
            {CATS.map(c => (
              <button key={c.value} className={`pill${category === c.value ? ' active' : ''}`} onClick={() => setCategory(c.value)}>
                {c.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}><span className="spinner spinner-dark" style={{ width: 36, height: 36 }} /></div>
          ) : aircraft.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-400)' }}>
              <i className="bi bi-airplane" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }} />
              <p>No aircraft found for this category.</p>
            </div>
          ) : (
            <div className="fleet-grid">
              {aircraft.map(ac => (
                <div key={ac.id} className="aircraft-card">
                  <div className="aircraft-img">
                    {ac.image_url ? <img src={ac.image_url} alt={ac.name} /> : <i className="bi bi-airplane" />}
                    <span className="aircraft-category-pill">{ac.category_display || ac.category}</span>
                  </div>
                  <div className="aircraft-body">
                    <div className="aircraft-name">{ac.name}</div>
                    <div className="aircraft-model">{ac.model}</div>
                    {ac.description && <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', margin: '0.5rem 0 0.75rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ac.description}</p>}
                    <div className="aircraft-specs">
                      <div className="aircraft-spec"><i className="bi bi-people" />{ac.passenger_capacity} passengers</div>
                      <div className="aircraft-spec"><i className="bi bi-broadcast" />{Number(ac.range_km).toLocaleString()} km range</div>
                      <div className="aircraft-spec"><i className="bi bi-speedometer" />{ac.cruise_speed_kmh} km/h</div>
                    </div>
                    {ac.amenities?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', margin: '0.75rem 0' }}>
                        {ac.amenities.slice(0, 3).map(a => (
                          <span key={a} style={{ fontSize: '0.65rem', background: 'var(--gold-pale)', color: 'var(--gold-dark)', padding: '0.15rem 0.55rem', borderRadius: 'var(--radius-full)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{a}</span>
                        ))}
                        {ac.amenities.length > 3 && <span style={{ fontSize: '0.65rem', color: 'var(--gray-400)' }}>+{ac.amenities.length - 3} more</span>}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
                      <div className="aircraft-price">${Number(ac.hourly_rate_usd).toLocaleString()}<small>/hr</small></div>
                      <Link to="/book-flight" className="btn btn-gold btn-sm"><i className="bi bi-calendar-plus" /> Charter</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      <PublicFooter />
    </>
  );
}
export default FleetPage;

// ── YachtsPage.jsx ────────────────────────────────────────────────────────────
export function YachtsPage() {
  const [yachts, setYachts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [size, setSize]       = useState('');

  const SIZES = [
    { value: '', label: 'All Sizes' },
    { value: 'small', label: 'Under 30m' },
    { value: 'medium', label: '30–50m' },
    { value: 'large', label: '50–80m' },
    { value: 'superyacht', label: 'Superyacht 80m+' },
  ];

  useEffect(() => {
    setLoading(true);
    fleetApi.yachtList(size ? { size_category: size } : {})
      .then(r => { setYachts(r.data.results || r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [size]);

  return (
    <>
      <PublicNavbar />
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Superyacht Charter</span>
          <h1>Sail the World in <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Absolute Luxury</span></h1>
          <div className="gold-rule" style={{ margin: '1rem 0' }} />
          <p style={{ color: 'rgba(255,255,255,0.62)', maxWidth: 520 }}>Charter world-class superyachts across the Indian Ocean, Mediterranean, Caribbean and beyond. Every voyage is crafted to perfection.</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="filter-bar">
            {SIZES.map(s => <button key={s.value} className={`pill${size === s.value ? ' active' : ''}`} onClick={() => setSize(s.value)}>{s.label}</button>)}
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}><span className="spinner spinner-dark" style={{ width: 36, height: 36 }} /></div>
          ) : (
            <div className="fleet-grid">
              {yachts.map(y => (
                <div key={y.id} className="aircraft-card">
                  <div className="aircraft-img">
                    {y.image_url ? <img src={y.image_url} alt={y.name} /> : <i className="bi bi-tsunami" />}
                    <span className="aircraft-category-pill">{y.size_display || y.size_category}</span>
                  </div>
                  <div className="aircraft-body">
                    <div className="aircraft-name">{y.name}</div>
                    <div className="aircraft-model">{y.length_meters}m · Home Port: {y.home_port}</div>
                    <div className="aircraft-specs">
                      <div className="aircraft-spec"><i className="bi bi-people" />{y.guest_capacity} guests</div>
                      <div className="aircraft-spec"><i className="bi bi-person-badge" />{y.crew_count} crew</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-100)' }}>
                      <div className="aircraft-price">${Number(y.daily_rate_usd).toLocaleString()}<small>/day</small></div>
                      <Link to="/book-yacht" className="btn btn-navy btn-sm"><i className="bi bi-anchor" /> Charter</Link>
                    </div>
                  </div>
                </div>
              ))}
              {yachts.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}><i className="bi bi-anchor" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }} /><p>No yachts available in this category.</p></div>}
            </div>
          )}
        </div>
      </section>
      <PublicFooter />
    </>
  );
}

// ── ServicesPage.jsx ──────────────────────────────────────────────────────────
export function ServicesPage() {
  const services = [
    { icon: 'bi-airplane', title: 'Private Jet Charter', desc: 'One-way, round-trip and multi-leg intercontinental charter flights for individuals and corporates. We source the right aircraft for every route and passenger count.', features: ['Light to VIP Airliner', 'Global network', 'Instant quotes', '24/7 dispatch'] },
    { icon: 'bi-anchor', title: 'Superyacht Charter', desc: 'Curated sailing experiences aboard world-class superyachts. Indian Ocean, Mediterranean, Caribbean — your itinerary, your rules.', features: ['30m to 120m+ vessels', 'Full crew included', 'Custom itineraries', 'Watersports packages'] },
    { icon: 'bi-file-text', title: 'Aircraft & Yacht Leasing', desc: 'Monthly, quarterly and multi-year leasing arrangements for corporates, governments and high-net-worth individuals requiring dedicated assets.', features: ['Monthly to multi-year', 'Aircraft & yachts', 'Maintenance included', 'Flexible terms'] },
    { icon: 'bi-box-seam', title: 'Air Cargo', desc: 'Urgent air freight solutions for all cargo types including perishables, pharmaceuticals, dangerous goods, live animals and oversized loads.', features: ['Same-day AOG', 'Cold chain logistics', 'DG certified', 'Global destinations'] },
    { icon: 'bi-currency-dollar', title: 'Aircraft Sales & Acquisition', desc: 'Buy, sell or trade pre-owned and new aircraft through our global broker network. We handle valuations, inspections and title transfer.', features: ['Buy & sell', 'Trade-in accepted', 'Full inspections', 'Finance arranged'] },
    { icon: 'bi-stars', title: 'VIP Concierge', desc: 'Complete travel management from door to door. Hotels, ground transport, visas, catering, event access — every detail handled with discretion.', features: ['Hotel bookings', 'Visa processing', 'Security detail', 'Event tickets'] },
    { icon: 'bi-people', title: 'Group & MICE Charter', desc: 'Large-group charter for corporate events, sports teams, incentive groups, weddings and government delegations.', features: ['Corporate events', 'Sports teams', 'Incentive travel', 'Government charters'] },
    { icon: 'bi-collection', title: 'Fleet Management', desc: "We manage third-party aircraft for owners — handling charters, crew, maintenance, compliance and revenue optimisation on your behalf.", features: ['Revenue sharing', 'Crew management', 'Maintenance oversight', 'Full compliance'] },
  ];

  return (
    <>
      <PublicNavbar />
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Services</span>
          <h1>Complete Aviation Solutions</h1>
          <div className="gold-rule" style={{ margin: '1rem 0' }} />
          <p style={{ color: 'rgba(255,255,255,0.62)', maxWidth: 560 }}>From a single charter flight to full fleet management — NairobiJetHouse delivers the full spectrum of private aviation services with the precision and care your mission demands.</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="grid-2">
            {services.map(s => (
              <div key={s.title} className="detail-card">
                <div className="detail-card-body" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.25rem' }}>
                    <div style={{ width: 52, height: 52, background: 'var(--gold-pale)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', color: 'var(--gold-dark)', flexShrink: 0 }}>
                      <i className={`bi ${s.icon}`} />
                    </div>
                    <div>
                      <h4 style={{ marginBottom: '0.35rem' }}>{s.title}</h4>
                      <p style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>{s.desc}</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                    {s.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--gray-600)' }}>
                        <i className="bi bi-check-circle-fill" style={{ color: 'var(--gold)', fontSize: '0.7rem' }} />{f}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--gray-100)' }}>
                    <Link to="/contact" style={{ fontSize: '0.82rem', color: 'var(--gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      Enquire Now <i className="bi bi-arrow-right" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <PublicFooter />
    </>
  );
}

// ── AboutPage.jsx ─────────────────────────────────────────────────────────────
export function AboutPage() {
  const team = [
    { name: 'Amara Osei', title: 'Chief Executive Officer', bio: 'Former airline executive with 20+ years in African aviation.' },
    { name: 'Leila Nkosi', title: 'Chief Operations Officer', bio: 'Private aviation specialist, former Bombardier regional director.' },
    { name: 'James Kariuki', title: 'Head of Charter', bio: 'Managed charter operations across 60+ countries for 15 years.' },
    { name: 'Sofia Al-Rashid', title: 'Head of Concierge', bio: 'Former luxury hotel GM, now delivering bespoke travel experiences.' },
  ];

  return (
    <>
      <PublicNavbar />
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Our Story</span>
          <h1>Built in Nairobi.<br /><span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Serving the World.</span></h1>
          <div className="gold-rule" style={{ margin: '1rem 0' }} />
          <p style={{ color: 'rgba(255,255,255,0.62)', maxWidth: 560 }}>NairobiJetHouse was founded to bring world-class private aviation to Africa — and African excellence to the world. We are the continent's first fully integrated private aviation marketplace.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'center', marginBottom: '5rem' }}>
            <div>
              <span className="eyebrow">Our Mission</span>
              <h2>Connecting Africa to the World</h2>
              <div className="gold-rule" />
              <p style={{ marginTop: '1rem', lineHeight: 1.85 }}>We believe Africa's business leaders, entrepreneurs and high-net-worth individuals deserve the same standard of private aviation as their counterparts anywhere on earth. NairobiJetHouse exists to make that vision a reality.</p>
              <p style={{ marginTop: '1rem', lineHeight: 1.85 }}>Since our founding, we have facilitated over 18,000 flights connecting clients across 140+ countries. Our platform integrates booking, fleet management, membership and cargo in a single, seamless experience.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2rem' }}>
                {[{ n: '2018', l: 'Founded' }, { n: '140+', l: 'Countries' }, { n: '18K+', l: 'Flights' }, { n: '320+', l: 'Aircraft' }].map(s => (
                  <div key={s.l} style={{ background: 'var(--surface)', borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 600, color: 'var(--navy)', lineHeight: 1 }}>{s.n}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, var(--navy-deep), var(--navy-mid))', borderRadius: 'var(--radius-xl)', padding: '3rem', color: 'var(--white)', textAlign: 'center' }}>
              <i className="bi bi-airplane" style={{ fontSize: '4rem', color: 'var(--gold)', display: 'block', marginBottom: '1.5rem' }} />
              <h3 style={{ color: 'var(--white)', marginBottom: '0.75rem' }}>"Africa's Skies Are Limitless"</h3>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', fontStyle: 'italic', lineHeight: 1.8 }}>We believe every journey should begin with absolute confidence and end with an unforgettable experience. That commitment is in every flight we plan.</p>
              <div style={{ marginTop: '1.5rem', fontSize: '0.82rem', color: 'var(--gold)' }}>— Amara Osei, CEO</div>
            </div>
          </div>

          <div className="text-center mb-4">
            <span className="eyebrow">The Team</span>
            <h2>Leadership</h2>
            <div className="gold-rule gold-rule-center" />
          </div>
          <div className="grid-4">
            {team.map(t => (
              <div key={t.name} className="detail-card" style={{ textAlign: 'center' }}>
                <div className="detail-card-body" style={{ padding: '2rem 1.5rem' }}>
                  <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, var(--navy), var(--navy-light))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: '1.5rem', color: 'var(--gold)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h4 style={{ marginBottom: '0.25rem' }}>{t.name}</h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--gold)', fontWeight: 600, marginBottom: '0.65rem' }}>{t.title}</div>
                  <p style={{ fontSize: '0.82rem', lineHeight: 1.7 }}>{t.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <PublicFooter />
    </>
  );
}

// ── MembershipPublicPage.jsx ──────────────────────────────────────────────────
export function MembershipPublicPage() {
  const tiers = [
    { name: 'Basic', icon: 'bi-star', monthly: 499, annual: 4999, discount: 5, bookings: 10, priority: false, dedicated: false, features: ['10 bookings per month', '5% discount off standard rates', 'Standard customer support', 'Access to marketplace fleet', 'Flight history & tracking'] },
    { name: 'Premium', icon: 'bi-star-fill', monthly: 1299, annual: 12999, discount: 12, bookings: 0, priority: true, dedicated: false, featured: true, features: ['Unlimited bookings', '12% discount off standard rates', 'Priority booking access', 'Dedicated support line', 'VIP lounge access worldwide', 'Exclusive fleet listings'] },
    { name: 'Corporate', icon: 'bi-building', monthly: 3499, annual: 34999, discount: 20, bookings: 0, priority: true, dedicated: true, features: ['Unlimited bookings + multi-user', '20% discount off standard rates', 'Dedicated account manager', 'Global route network access', 'Custom reporting & invoicing', 'Board-level concierge'] },
  ];

  return (
    <>
      <PublicNavbar />
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Membership</span>
          <h1>Join Africa's Most Exclusive <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Aviation Club</span></h1>
          <div className="gold-rule" style={{ margin: '1rem 0' }} />
          <p style={{ color: 'rgba(255,255,255,0.62)', maxWidth: 560 }}>NairobiJetHouse membership gives you priority access to our entire fleet, exclusive rates, and a dedicated concierge team for every journey.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="grid-3" style={{ alignItems: 'start' }}>
            {tiers.map(t => (
              <div key={t.name} className={`tier-card${t.featured ? ' featured' : ''}`}>
                {t.featured && <div className="tier-featured-label">Most Popular</div>}
                <div className="tier-icon"><i className={`bi ${t.icon}`} /></div>
                <div className="tier-name">{t.name}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '0.5rem' }}>Annual plan</div>
                <div className="tier-price"><sup>$</sup>{t.annual.toLocaleString()}<sub>/yr</sub></div>
                <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '1.5rem' }}>or ${t.monthly}/mo billed monthly</div>
                <div className="tier-features">
                  {t.features.map(f => (
                    <div key={f} className="tier-feature">
                      <i className="bi bi-check-circle-fill yes" />
                      {f}
                    </div>
                  ))}
                </div>
                <Link to="/register" className={`btn ${t.featured ? 'btn-gold' : 'btn-outline-navy'} btn-full`} style={{ marginTop: '1.5rem' }}>
                  Get Started <i className="bi bi-arrow-right" />
                </Link>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', background: 'var(--surface)', borderRadius: 'var(--radius-xl)' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>Already a member?</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--gray-500)' }}>Sign in to access your dashboard and manage your membership.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/login" className="btn btn-navy"><i className="bi bi-box-arrow-in-right" /> Sign In</Link>
              <a href="mailto:membership@nairobijethouse.com" className="btn btn-outline-navy"><i className="bi bi-envelope" /> Contact Membership Team</a>
            </div>
          </div>
        </div>
      </section>
      <PublicFooter />
    </>
  );
}

// ── ContactPage.jsx ───────────────────────────────────────────────────────────
export function ContactPage() {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', company: '', subject: 'general', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError]     = useState('');
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const { inquiryApi } = await import('../../services/api');
      const r = await inquiryApi.contact(form);
      setSuccess(r.data);
    } catch { setError('Failed to send. Please try again or email us directly.'); }
    finally { setLoading(false); }
  };

  return (
    <>
      <PublicNavbar />
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Get in Touch</span>
          <h1>Contact Us</h1>
          <p style={{ color: 'rgba(255,255,255,0.62)', maxWidth: 480 }}>Our team is available around the clock. Reach out with any question, charter requirement or partnership enquiry.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'start', gap: '3rem' }}>
            <div>
              {success ? (
                <div className="success-wrap" style={{ textAlign: 'left', padding: '2rem 0' }}>
                  <div className="success-icon"><i className="bi bi-check-lg" /></div>
                  <h3>Message Received!</h3>
                  <p style={{ marginTop: '0.75rem' }}>{success.message}</p>
                  <div className="ref-box"><div className="ref-label">Reference</div><div className="ref-value">{String(success.inquiry?.reference || '').slice(0, 16)}</div></div>
                  <button className="btn btn-outline-navy mt-3" onClick={() => setSuccess(null)}>Send Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  {error && <div className="alert alert-error"><i className="bi bi-exclamation-circle" />{error}</div>}
                  <div className="form-grid">
                    <div className="form-group"><label className="form-label">Full Name <span className="req">*</span></label><input className="form-control" value={form.full_name} onChange={set('full_name')} required /></div>
                    <div className="form-group"><label className="form-label">Email <span className="req">*</span></label><input className="form-control" type="email" value={form.email} onChange={set('email')} required /></div>
                    <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={set('phone')} /></div>
                    <div className="form-group"><label className="form-label">Company</label><input className="form-control" value={form.company} onChange={set('company')} /></div>
                  </div>
                  <div className="form-group"><label className="form-label">Subject</label>
                    <select className="form-control" value={form.subject} onChange={set('subject')}>
                      {[['general','General Inquiry'],['support','Customer Support'],['media','Media & Press'],['partnership','Partnership'],['careers','Careers'],['other','Other']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Message <span className="req">*</span></label><textarea className="form-control" rows={6} value={form.message} onChange={set('message')} required /></div>
                  <button type="submit" className="btn btn-navy btn-lg" disabled={loading}>
                    {loading ? <><span className="spinner" /> Sending…</> : <><i className="bi bi-send" /> Send Message</>}
                  </button>
                </form>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { icon: 'bi-telephone', title: '24/7 Charter Hotline', value: '+254 700 000 000', sub: 'Available around the clock' },
                { icon: 'bi-envelope', title: 'Operations Email', value: 'ops@nairobijethouse.com', sub: 'Response within 2 hours' },
                { icon: 'bi-star', title: 'Membership', value: 'membership@nairobijethouse.com', sub: 'Plans and upgrades' },
                { icon: 'bi-geo-alt', title: 'Headquarters', value: 'Wilson Airport, Nairobi, Kenya', sub: 'By appointment only' },
              ].map(c => (
                <div key={c.title} className="detail-card">
                  <div className="detail-card-body" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, background: 'var(--gold-pale)', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: 'var(--gold-dark)', flexShrink: 0 }}>
                      <i className={`bi ${c.icon}`} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold)', marginBottom: '0.25rem' }}>{c.title}</div>
                      <div style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: '0.15rem' }}>{c.value}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{c.sub}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <PublicFooter />
    </>
  );
}

// ── TrackBookingPage.jsx ──────────────────────────────────────────────────────
export function TrackBookingPage() {
  const [ref, setRef]           = useState('');
  const [type, setType]         = useState('flight');
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [notFound, setNotFound] = useState(false);

  const search = async e => {
    e.preventDefault(); setLoading(true); setResult(null); setNotFound(false);
    try {
      const { bookingApi } = await import('../../services/api');
      const r = type === 'flight' ? await bookingApi.trackFlight(ref) : await bookingApi.trackYacht(ref);
      setResult(r.data);
    } catch { setNotFound(true); }
    finally { setLoading(false); }
  };

  const STATUS_LABEL = { inquiry: 'Inquiry Received', quoted: 'Quote Sent', confirmed: 'Confirmed', in_flight: 'In Flight', completed: 'Completed', cancelled: 'Cancelled', active: 'Active Charter' };

  return (
    <>
      <PublicNavbar />
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Track</span>
          <h1>Track Your Booking</h1>
          <p style={{ color: 'rgba(255,255,255,0.62)' }}>Enter your booking reference to check the status of your charter.</p>
        </div>
      </div>
      <section className="section">
        <div className="container-sm">
          <div className="detail-card mb-4">
            <div className="detail-card-body">
              <form onSubmit={search} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <select className="form-control" style={{ width: 160 }} value={type} onChange={e => setType(e.target.value)}>
                  <option value="flight">Flight Booking</option>
                  <option value="yacht">Yacht Charter</option>
                </select>
                <input className="form-control" style={{ flex: 1, minWidth: 220 }} value={ref} onChange={e => setRef(e.target.value)} placeholder="Paste your booking reference UUID…" required />
                <button type="submit" className="btn btn-navy" disabled={loading}>
                  {loading ? <><span className="spinner" /> Searching…</> : <><i className="bi bi-search" /> Track</>}
                </button>
              </form>
            </div>
          </div>

          {notFound && <div className="alert alert-error"><i className="bi bi-exclamation-circle" />Booking not found. Please double-check your reference number.</div>}

          {result && (
            <div className="detail-card">
              <div className="detail-card-header">
                <div className="detail-card-title"><i className="bi bi-clipboard-check" /> Booking Details</div>
                <span className={`badge status-${result.status}`}>{STATUS_LABEL[result.status] || result.status}</span>
              </div>
              <div className="detail-card-body">
                {[
                  ['Guest Name', result.guest_name],
                  ['Reference', result.reference],
                  ['Route', result.origin_detail ? `${result.origin_detail.city} → ${result.destination_detail?.city}` : result.departure_port],
                  ['Departure', result.departure_date || result.charter_start],
                  ['Passengers / Guests', result.passenger_count || result.guest_count],
                  ['Status', STATUS_LABEL[result.status] || result.status],
                  ['Quoted Price', result.quoted_price_usd ? `USD $${Number(result.quoted_price_usd).toLocaleString()}` : 'Pending quote'],
                ].map(([k, v]) => v && (
                  <div key={k} className="detail-row"><span className="detail-key">{k}</span><span className="detail-val">{v}</span></div>
                ))}
              </div>
              {result.status === 'inquiry' && (
                <div style={{ padding: '0 1.5rem 1.5rem' }}>
                  <div className="alert alert-info" style={{ marginBottom: 0 }}><i className="bi bi-clock" />Our team is reviewing your request. You'll receive a quote by email within 2 hours.</div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      <PublicFooter />
    </>
  );
}

// ── BookYachtPage.jsx ─────────────────────────────────────────────────────────
export function BookYachtPage() {
  const [yachts, setYachts]   = useState([]);
  const [form, setForm]       = useState({ guest_name: '', guest_email: '', guest_phone: '', company: '', departure_port: '', destination_port: '', charter_start: '', charter_end: '', guest_count: 2, yacht: '', special_requests: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  useEffect(() => { fleetApi.yachtList().then(r => setYachts(r.data.results || r.data)).catch(() => {}); }, []);

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      const { bookingApi } = await import('../../services/api');
      const payload = { ...form, guest_count: Number(form.guest_count) };
      if (!payload.yacht) delete payload.yacht;
      const r = await bookingApi.createYacht(payload);
      setSuccess(r.data);
    } catch {} finally { setLoading(false); }
  };

  if (success) return (
    <>
      <PublicNavbar />
      <div style={{ paddingTop: 'var(--navbar-h)', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
        <div className="container"><div className="success-wrap">
          <div className="success-icon"><i className="bi bi-check-lg" /></div>
          <h2>Charter Request Received!</h2>
          <p>{success.message}</p>
          <div className="ref-box"><div className="ref-label">Reference</div><div className="ref-value">{success.charter?.reference}</div></div>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
            <a href="/" className="btn btn-navy">Return Home</a>
          </div>
        </div></div>
      </div>
      <PublicFooter />
    </>
  );

  return (
    <>
      <PublicNavbar />
      <div className="page-header"><div className="container"><span className="eyebrow">Yacht Charter</span><h1>Book Your Superyacht</h1><p style={{ color: 'rgba(255,255,255,0.62)' }}>Submit your charter requirements and our concierge will respond within 4 hours.</p></div></div>
      <section className="section"><div className="container-sm">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="detail-card"><div className="detail-card-header"><div className="detail-card-title"><i className="bi bi-person" /> Contact Details</div></div>
            <div className="detail-card-body"><div className="form-grid">
              <div className="form-group"><label className="form-label">Full Name <span className="req">*</span></label><input className="form-control" value={form.guest_name} onChange={set('guest_name')} required /></div>
              <div className="form-group"><label className="form-label">Email <span className="req">*</span></label><input className="form-control" type="email" value={form.guest_email} onChange={set('guest_email')} required /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.guest_phone} onChange={set('guest_phone')} /></div>
              <div className="form-group"><label className="form-label">Company</label><input className="form-control" value={form.company} onChange={set('company')} /></div>
            </div></div>
          </div>
          <div className="detail-card"><div className="detail-card-header"><div className="detail-card-title"><i className="bi bi-anchor" /> Charter Details</div></div>
            <div className="detail-card-body"><div className="form-grid">
              <div className="form-group"><label className="form-label">Preferred Yacht</label>
                <select className="form-control" value={form.yacht} onChange={set('yacht')}>
                  <option value="">No preference</option>
                  {yachts.map(y => <option key={y.id} value={y.id}>{y.name} — {y.length_meters}m ({y.guest_capacity} guests)</option>)}
                </select>
              </div>
              <div className="form-group"><label className="form-label">Number of Guests <span className="req">*</span></label><input className="form-control" type="number" min="1" value={form.guest_count} onChange={set('guest_count')} required /></div>
              <div className="form-group"><label className="form-label">Departure Port <span className="req">*</span></label><input className="form-control" value={form.departure_port} onChange={set('departure_port')} placeholder="e.g. Mombasa, Kenya" required /></div>
              <div className="form-group"><label className="form-label">Destination Port</label><input className="form-control" value={form.destination_port} onChange={set('destination_port')} placeholder="e.g. Zanzibar or Open itinerary" /></div>
              <div className="form-group"><label className="form-label">Charter Start <span className="req">*</span></label><input className="form-control" type="date" value={form.charter_start} onChange={set('charter_start')} min={new Date().toISOString().split('T')[0]} required /></div>
              <div className="form-group"><label className="form-label">Charter End <span className="req">*</span></label><input className="form-control" type="date" value={form.charter_end} onChange={set('charter_end')} min={form.charter_start || new Date().toISOString().split('T')[0]} required /></div>
              <div className="form-group form-full"><label className="form-label">Special Requests</label><textarea className="form-control" rows={4} value={form.special_requests} onChange={set('special_requests')} placeholder="Dietary requirements, diving equipment, itinerary preferences…" /></div>
            </div></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-gold btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" /> Submitting…</> : <><i className="bi bi-send" /> Submit Charter Request</>}
            </button>
          </div>
        </form>
      </div></section>
      <PublicFooter />
    </>
  );
}

// ── NotFoundPage.jsx ──────────────────────────────────────────────────────────
export function NotFoundPage() {
  return (
    <>
      <PublicNavbar />
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 2rem', paddingTop: 'calc(var(--navbar-h) + 4rem)' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(5rem, 15vw, 10rem)', fontWeight: 700, color: 'var(--gray-100)', lineHeight: 1, marginBottom: '1rem' }}>404</div>
          <h2 style={{ marginBottom: '0.75rem' }}>Page Not Found</h2>
          <p style={{ maxWidth: 420, margin: '0 auto 2rem', color: 'var(--gray-400)' }}>The page you're looking for doesn't exist or may have been moved. Let us get you back on track.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/" className="btn btn-navy"><i className="bi bi-house" /> Back to Home</a>
            <a href="/book-flight" className="btn btn-gold"><i className="bi bi-airplane" /> Charter a Flight</a>
          </div>
        </div>
      </div>
      <PublicFooter />
    </>
  );
}