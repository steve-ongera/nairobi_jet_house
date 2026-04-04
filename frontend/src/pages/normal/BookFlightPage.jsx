import React, { useState, useEffect, useRef } from 'react';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { bookingApi, fleetApi } from '../../services/api';

/* ─── Constants ──────────────────────────────────────────────────────────────── */
const TRIP_TYPES = [
  { value: 'one_way',    label: 'One Way' },
  { value: 'round_trip', label: 'Round Trip' },
  { value: 'multi_leg',  label: 'Multi-Leg' },
];

const ADDONS = [
  { key: 'catering_requested',         icon: 'bi-cup-hot',      label: 'In-Flight Catering',  desc: 'Custom menus prepared by top chefs' },
  { key: 'ground_transport_requested', icon: 'bi-car-front',    label: 'Ground Transport',     desc: 'Seamless arrival and departure transfers' },
  { key: 'concierge_requested',        icon: 'bi-person-check', label: 'Personal Concierge',   desc: 'Hotel, dining, and activity bookings' },
];

const INITIAL = {
  guest_name: '', guest_email: '', guest_phone: '', company: '',
  trip_type: 'one_way', passenger_count: 1,
  departure_date: '', departure_time: '', return_date: '',
  origin: '', destination: '',
  aircraft: '', special_requests: '',
  catering_requested: false, ground_transport_requested: false, concierge_requested: false,
};

/* ─── Inline Airport Search (uses fleetApi.airports from first file) ─────────── */
function AirportSearch({ label, value, onChange, placeholder, required }) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [busy, setBusy]       = useState(false);
  const [open, setOpen]       = useState(false);
  const timer                 = useRef(null);

  useEffect(() => {
    setQuery(value ? `${value.city} (${value.code})` : '');
  }, [value]);

  const search = (q) => {
    clearTimeout(timer.current);
    if (q.length < 2) { setResults([]); return; }
    timer.current = setTimeout(async () => {
      setBusy(true);
      try {
        const r = await fleetApi.airports({ search: q });
        setResults(r.data.results || r.data || []);
      } catch { setResults([]); }
      finally { setBusy(false); }
    }, 280);
  };

  const select = (airport) => {
    onChange(airport);
    setQuery(`${airport.city} (${airport.code})`);
    setOpen(false);
  };

  return (
    <div className="form-group" style={{ position: 'relative' }}>
      {label && (
        <label className="form-label">
          {label}{required && <span className="req"> *</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <i className="bi bi-geo-alt" style={{
          position: 'absolute', left: '0.85rem', top: '50%',
          transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none',
        }} />
        <input
          className="form-control"
          style={{ paddingLeft: '2.25rem' }}
          value={query}
          placeholder={placeholder || 'City or airport code'}
          onChange={e => { setQuery(e.target.value); setOpen(true); search(e.target.value); if (!e.target.value) onChange(null); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 160)}
          required={required}
          autoComplete="off"
        />
        {busy && (
          <span className="spinner" style={{
            position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)',
          }} />
        )}
      </div>
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 700,
          background: 'var(--white)', border: '1.5px solid var(--gray-200)',
          borderTop: 'none', borderRadius: '0 0 6px 6px',
          maxHeight: 220, overflowY: 'auto', boxShadow: 'var(--shadow-lg)',
        }}>
          {results.map(a => (
            <div
              key={a.id}
              onMouseDown={() => select(a)}
              style={{ padding: '0.65rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--gray-100)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontSize: '0.68rem', fontWeight: 700, color: 'var(--gold)',
                  background: 'var(--gold-pale)', padding: '1px 6px', borderRadius: 3,
                }}>
                  {a.code}
                </span>
                <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--navy)' }}>{a.name}</span>
              </div>
              <div style={{ fontSize: '0.73rem', color: 'var(--gray-400)', paddingLeft: 42 }}>
                {a.city}, {a.country}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   BOOK FLIGHT PAGE
═══════════════════════════════════════════════════════════════════════════════ */
export default function BookFlightPage() {
  const [aircraft, setAircraft] = useState([]);
  const [form, setForm]         = useState(INITIAL);
  const [origin, setOrigin]     = useState(null);
  const [destination, setDest]  = useState(null);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(null);
  const [errors, setErrors]     = useState({});

  useEffect(() => {
    fleetApi.aircraftList().then(r => setAircraft(r.data.results || r.data)).catch(() => {});
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!origin || !destination) {
      setErrors({ non_field_errors: ['Please select both origin and destination airports.'] });
      return;
    }
    setLoading(true); setErrors({});
    try {
      const payload = {
        ...form,
        passenger_count: Number(form.passenger_count),
        origin: origin.id,
        destination: destination.id,
      };
      if (!payload.aircraft)    delete payload.aircraft;
      if (!payload.return_date) delete payload.return_date;
      if (!payload.company)     delete payload.company;
      const r = await bookingApi.createFlight(payload);
      setSuccess(r.data);
    } catch (err) {
      setErrors(err.response?.data || { non_field_errors: ['Something went wrong. Please try again.'] });
    } finally {
      setLoading(false);
    }
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <>
        <PublicNavbar />
        <div style={{ paddingTop: 'var(--navbar-h)', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
          <div className="container">
            <div style={{
              maxWidth: 540, margin: '0 auto', textAlign: 'center',
              background: 'var(--white)', borderRadius: 8,
              border: '1px solid var(--gray-100)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
              padding: '3rem 2.5rem',
            }}>
              <div style={{
                width: 68, height: 68, background: '#EBF7F1', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem', fontSize: '1.8rem', color: '#16A34A',
              }}>
                <i className="bi bi-check-lg" />
              </div>
              <h2 style={{ marginBottom: '0.6rem' }}>Flight Request Received!</h2>
              <p style={{ color: 'var(--gray-400)', lineHeight: 1.75, marginBottom: '1.75rem' }}>
                {success.message || 'Our aviation team will contact you within 2–4 hours with a personalised quote.'}
              </p>
              <div style={{
                background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
                borderRadius: 6, padding: '1rem 1.25rem', marginBottom: '1.5rem', textAlign: 'left',
              }}>
                <div style={{
                  fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.16em',
                  textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem',
                }}>
                  Booking Reference
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700, color: 'var(--navy)', wordBreak: 'break-all' }}>
                  {success.booking?.reference}
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginBottom: '2rem' }}>
                <i className="bi bi-info-circle" style={{ marginRight: 5 }} />
                Save this reference to track your booking status at any time.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-navy"
                  onClick={() => { setSuccess(null); setForm(INITIAL); setOrigin(null); setDest(null); }}
                >
                  <i className="bi bi-plus" /> New Booking
                </button>
                <a href={`/track?ref=${success.booking?.reference}`} className="btn btn-outline-navy">
                  <i className="bi bi-search" /> Track Booking
                </a>
                <a href="/" className="btn btn-ghost">Return Home</a>
              </div>
            </div>
          </div>
        </div>
        <PublicFooter />
      </>
    );
  }

  /* ── Main form ── */
  return (
    <>
      <PublicNavbar />

      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="container">
          <span className="eyebrow"><i className="bi bi-airplane" /> Private Jet Charter</span>
          <h1>Book Your Private <em style={{ color: 'var(--gold-light)' }}>Flight</em></h1>
          <p style={{ marginTop: '0.75rem', maxWidth: 580, color: 'rgba(255,255,255,0.75)', lineHeight: 1.75 }}>
            Charter a private jet to any destination worldwide — one-way, round trip, or multi-leg.
            Submit your request in minutes. No account required. Our specialists respond within 2–4 hours.
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <section className="section">
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '3rem',
            alignItems: 'start',
          }}>

            {/* ════ MAIN FORM ════ */}
            <div>
              {errors.non_field_errors && (
                <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                  <i className="bi bi-exclamation-circle" />
                  {errors.non_field_errors[0]}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                {/* ── 1. Your Details ── */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.2rem' }}>
                    <i className="bi bi-person" style={{ color: 'var(--gold)', marginRight: '0.5rem' }} />
                    Your Details
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1.5rem' }}>
                    We'll use these to send you the quote and confirmation.
                  </p>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Full Name <span className="req">*</span></label>
                      <input className="form-control" required value={form.guest_name}
                        onChange={e => set('guest_name', e.target.value)} placeholder="Jane Odhiambo" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address <span className="req">*</span></label>
                      <input className="form-control" type="email" required value={form.guest_email}
                        onChange={e => set('guest_email', e.target.value)} placeholder="jane@example.com" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input className="form-control" value={form.guest_phone}
                        onChange={e => set('guest_phone', e.target.value)} placeholder="+254 700 000 000" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Company / Organisation</label>
                      <input className="form-control" value={form.company}
                        onChange={e => set('company', e.target.value)} placeholder="Optional" />
                    </div>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--gray-100)', marginBottom: '2.5rem' }} />

                {/* ── 2. Flight Details ── */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.2rem' }}>
                    <i className="bi bi-airplane" style={{ color: 'var(--gold)', marginRight: '0.5rem' }} />
                    Flight Details
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1.5rem' }}>
                    Tell us where you'd like to go and when.
                  </p>

                  {/* Trip type */}
                  <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
                    {TRIP_TYPES.map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => set('trip_type', t.value)}
                        style={{
                          padding: '0.55rem 1.15rem',
                          fontSize: '0.84rem', fontWeight: 500,
                          fontFamily: 'inherit',
                          border: `1.5px solid ${form.trip_type === t.value ? 'var(--navy)' : 'var(--gray-200)'}`,
                          borderRadius: 6,
                          background: form.trip_type === t.value ? 'var(--navy)' : 'var(--white)',
                          color: form.trip_type === t.value ? '#fff' : 'var(--gray-500)',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="form-grid">
                    {/* Live airport search — uses fleetApi.airports internally */}
                    <AirportSearch
                      label="From"
                      value={origin}
                      onChange={setOrigin}
                      placeholder="City or airport code"
                      required
                    />
                    <AirportSearch
                      label="To"
                      value={destination}
                      onChange={setDest}
                      placeholder="City or airport code"
                      required
                    />
                    <div className="form-group">
                      <label className="form-label">Departure Date <span className="req">*</span></label>
                      <input className="form-control" type="date" required value={form.departure_date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => set('departure_date', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Preferred Departure Time</label>
                      <input className="form-control" type="time" value={form.departure_time}
                        onChange={e => set('departure_time', e.target.value)} />
                    </div>
                    {form.trip_type === 'round_trip' && (
                      <div className="form-group">
                        <label className="form-label">Return Date <span className="req">*</span></label>
                        <input className="form-control" type="date" required value={form.return_date}
                          min={form.departure_date || new Date().toISOString().split('T')[0]}
                          onChange={e => set('return_date', e.target.value)} />
                      </div>
                    )}
                    <div className="form-group">
                      <label className="form-label">Number of Passengers <span className="req">*</span></label>
                      <input className="form-control" type="number" min="1" max="500" required
                        value={form.passenger_count}
                        onChange={e => set('passenger_count', e.target.value)} />
                    </div>
                  </div>

                  {aircraft.length > 0 && (
                    <div className="form-group" style={{ marginTop: '1.25rem' }}>
                      <label className="form-label">
                        Preferred Aircraft{' '}
                        <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>
                          (optional — our team will recommend)
                        </span>
                      </label>
                      <select className="form-control" value={form.aircraft}
                        onChange={e => set('aircraft', e.target.value)}>
                        <option value="">Recommend the best option for my trip</option>
                        {aircraft.map(a => (
                          <option key={a.id} value={a.id}>
                            {a.name} — {a.category_display} · up to {a.passenger_capacity} passengers
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--gray-100)', marginBottom: '2.5rem' }} />

                {/* ── 3. Add-on Services ── */}
                <div style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.2rem' }}>
                    <i className="bi bi-stars" style={{ color: 'var(--gold)', marginRight: '0.5rem' }} />
                    Additional Services
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1.5rem' }}>
                    Enhance your journey with our premium services.
                  </p>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                    gap: '0.75rem',
                    marginBottom: '1.5rem',
                  }}>
                    {ADDONS.map(({ key, icon, label, desc }) => (
                      <div
                        key={key}
                        onClick={() => set(key, !form[key])}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                          cursor: 'pointer', userSelect: 'none',
                          padding: '1rem',
                          border: `1.5px solid ${form[key] ? 'var(--navy)' : 'var(--gray-200)'}`,
                          borderRadius: 6,
                          background: form[key] ? 'var(--blue-soft, #EFF4FB)' : 'var(--white)',
                          transition: 'all 0.15s',
                        }}
                      >
                        <i className={`bi ${icon}`} style={{
                          fontSize: '1.2rem',
                          color: form[key] ? 'var(--navy)' : 'var(--gold)',
                          marginTop: 2, flexShrink: 0,
                        }} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--navy)', marginBottom: '0.2rem' }}>
                            {label}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--gray-400)', lineHeight: 1.4 }}>
                            {desc}
                          </div>
                        </div>
                        {form[key] && (
                          <i className="bi bi-check-circle-fill" style={{
                            color: 'var(--navy)', fontSize: '0.9rem',
                            marginLeft: 'auto', flexShrink: 0, marginTop: 2,
                          }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--gray-100)', marginBottom: '2.5rem' }} />

                {/* ── 4. Special Requests ── */}
                <div className="form-group" style={{ marginBottom: '2.5rem' }}>
                  <label className="form-label">Special Requests &amp; Notes</label>
                  <textarea
                    className="form-control"
                    rows={4}
                    value={form.special_requests}
                    onChange={e => set('special_requests', e.target.value)}
                    placeholder="Dietary requirements, preferred aircraft configuration, special occasions, arrival preferences, cargo requirements…"
                  />
                  <span className="form-hint">Any detail you share helps us tailor your experience perfectly.</span>
                </div>

                {/* ── Submit ── */}
                <button
                  type="submit"
                  className="btn btn-gold btn-lg"
                  disabled={loading}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {loading
                    ? <><span className="spinner" /> Processing Your Request…</>
                    : <><i className="bi bi-send" /> Submit Charter Request</>
                  }
                </button>
                <p style={{
                  fontSize: '0.75rem', textAlign: 'center',
                  color: 'var(--gray-400)', marginTop: '0.85rem',
                }}>
                  <i className="bi bi-shield-check" style={{ marginRight: 5 }} />
                  No payment required at this stage. Our team will contact you with a personalised quote.
                </p>

              </form>
            </div>

            {/* ════ SIDEBAR ════ */}
            <div style={{ position: 'sticky', top: 88 }}>

              {/* Response time */}
              <div style={{
                background: 'var(--gold-pale)', border: '1px solid #E6CFA0',
                borderRadius: 8, padding: '1.25rem 1.5rem', marginBottom: '1.25rem',
              }}>
                <div style={{ fontWeight: 600, color: '#7A5C22', marginBottom: '0.4rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="bi bi-clock" style={{ color: 'var(--gold)' }} />
                  Response Time
                </div>
                <p style={{ fontSize: '0.82rem', color: '#9A7530', margin: 0, lineHeight: 1.6 }}>
                  Our aviation specialists typically respond within <strong>2–4 hours</strong>, even on weekends and public holidays.
                </p>
              </div>

              {/* What happens next */}
              <div style={{
                background: 'var(--white)', border: '1px solid var(--gray-100)',
                borderRadius: 8, padding: '1.5rem', marginBottom: '1.25rem',
              }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem' }}>
                  What Happens Next?
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {[
                    { n: '1', text: 'We review your request and check fleet availability' },
                    { n: '2', text: 'We send you a tailored quote by email within 2–4 hours' },
                    { n: '3', text: 'You confirm and we arrange every detail' },
                    { n: '4', text: 'Enjoy a seamless, door-to-door experience' },
                  ].map(({ n, text }) => (
                    <div key={n} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                      <div style={{
                        flexShrink: 0, width: 24, height: 24,
                        background: 'var(--gold-pale)', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 700, color: 'var(--gold-dark)',
                      }}>
                        {n}
                      </div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', margin: 0, lineHeight: 1.55 }}>{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why NairobiJetHouse */}
              <div style={{
                background: 'var(--white)', border: '1px solid var(--gray-100)',
                borderRadius: 8, padding: '1.5rem', marginBottom: '1.25rem',
              }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem' }}>
                  Why NairobiJetHouse?
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                  {[
                    { icon: 'bi-shield-check', text: 'ARGUS Platinum rated operators only' },
                    { icon: 'bi-cash-coin',    text: 'Transparent pricing, no hidden fees' },
                    { icon: 'bi-globe2',       text: '2,400+ aircraft across 187 countries' },
                    { icon: 'bi-headset',      text: '24/7 concierge in 4 languages' },
                  ].map(({ icon, text }) => (
                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <i className={`bi ${icon}`} style={{ color: 'var(--gold)', fontSize: '0.9rem', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call CTA */}
              <div style={{
                background: 'var(--navy)', borderRadius: 8,
                padding: '1.5rem', color: '#fff',
              }}>
                <h4 style={{ color: '#fff', fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                  Prefer to Talk?
                </h4>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', marginBottom: '1rem', lineHeight: 1.6 }}>
                  Our concierge team is available 24/7 by phone or WhatsApp.
                </p>
                <a
                  href="tel:+254724878136"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.5rem', width: '100%', padding: '0.7rem',
                    background: 'var(--gold)', color: '#0B1D3A',
                    fontWeight: 700, fontSize: '0.88rem',
                    textDecoration: 'none', borderRadius: 6,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <i className="bi bi-telephone" /> +254 724 878 136
                </a>
                <a
                  href="mailto:nairobijethouse@gmail.com"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '0.5rem', width: '100%', padding: '0.7rem',
                    background: 'transparent', color: 'rgba(255,255,255,0.7)',
                    fontWeight: 500, fontSize: '0.84rem',
                    textDecoration: 'none', borderRadius: 6, marginTop: '0.5rem',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'border-color 0.2s, color 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                >
                  <i className="bi bi-envelope" /> nairobijethouse@gmail.com
                </a>
              </div>

            </div>
            {/* end sidebar */}

          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .container > div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <PublicFooter />
    </>
  );
}