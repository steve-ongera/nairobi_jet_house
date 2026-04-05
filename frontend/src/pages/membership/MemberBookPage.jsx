// MemberBookPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MemberLayout from '../../components/membership/MemberLayout';
import { memberApi, fleetApi } from '../../services/api';
import { useAuth } from '../../App';

/* ─── Constants ─────────────────────────────────────────────────────────────── */
const TRIP_TYPES = [
  { value: 'one_way',    label: 'One Way' },
  { value: 'round_trip', label: 'Round Trip' },
];

const ADDONS = [
  { key: 'catering',         icon: 'bi-cup-hot',      label: 'In-Flight Catering',  desc: 'Custom menus prepared by top chefs' },
  { key: 'ground_transport', icon: 'bi-car-front',    label: 'Ground Transport',     desc: 'Seamless arrival and departure transfers' },
  { key: 'concierge',        icon: 'bi-person-check', label: 'Personal Concierge',   desc: 'Hotel, dining, and activity bookings' },
];

const INITIAL = {
  trip_type: 'one_way',
  departure_datetime: '',
  return_datetime: '',
  estimated_hours: 2,
  passenger_count: 1,
  aircraft: '',
  special_requests: '',
  catering: false,
  ground_transport: false,
  concierge: false,
};

/* ─── Airport Search Component ──────────────────────────────────────────────── */
function AirportSearch({ label, value, onChange, placeholder, required }) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [busy,    setBusy]    = useState(false);
  const [open,    setOpen]    = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    setQuery(value ? `${value.city} (${value.code})` : '');
  }, [value]);

  const search = q => {
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

  const select = airport => {
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
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
            search(e.target.value);
            if (!e.target.value) onChange(null);
          }}
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

/* ─── Aircraft Card ─────────────────────────────────────────────────────────── */
function AircraftCard({ ac, selected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(String(ac.id))}
      style={{
        border: `2px solid ${selected ? 'var(--gold)' : 'var(--gray-100)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.25rem',
        cursor: 'pointer',
        background: selected ? '#fffbeb' : '#fff',
        display: 'flex', alignItems: 'center', gap: '1rem',
        transition: 'all 0.15s',
      }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 10, flexShrink: 0, overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--navy-deep), var(--navy-mid))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {ac.image_url
          ? <img src={ac.image_url} alt={ac.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <i className="bi bi-airplane" style={{ color: 'var(--gold)', fontSize: '1.3rem' }} />
        }
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: '0.15rem', fontSize: '0.95rem' }}>
          {ac.name}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span><i className="bi bi-tag" style={{ marginRight: 3 }} />{ac.category_display || ac.category}</span>
          <span><i className="bi bi-people" style={{ marginRight: 3 }} />{ac.passenger_capacity} pax</span>
          <span><i className="bi bi-broadcast" style={{ marginRight: 3 }} />{ac.range_km?.toLocaleString()} km</span>
          <span><i className="bi bi-geo-alt" style={{ marginRight: 3 }} />{ac.base_location}</span>
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '1rem' }}>
            ${Number(ac.hourly_rate_usd).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--gray-400)' }}>per hour</div>
        </div>
        <div style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          background: selected ? 'var(--gold)' : 'var(--gray-100)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.15s',
        }}>
          {selected && <i className="bi bi-check" style={{ color: 'var(--navy-deep)', fontSize: '0.75rem' }} />}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MEMBER BOOK PAGE
══════════════════════════════════════════════════════════════════════════════ */
export function MemberBookPage() {
  const { user } = useAuth();
  const location = useLocation();
  const preState = location.state || {};

  const [fleet,        setFleet]        = useState([]);
  const [fleetLoading, setFleetLoading] = useState(true);
  const [form,         setForm]         = useState({
    ...INITIAL,
    aircraft: preState.aircraftId ? String(preState.aircraftId) : '',
  });
  const [origin,       setOrigin]       = useState(null);
  const [destination,  setDest]         = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [success,      setSuccess]      = useState(null);
  const [errors,       setErrors]       = useState({});

  useEffect(() => {
    memberApi.fleet()
      .then(r => { setFleet(r.data.results || r.data); setFleetLoading(false); })
      .catch(() => setFleetLoading(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selectedAircraft = fleet.find(a => String(a.id) === String(form.aircraft));
  const estimatedCost = selectedAircraft
    ? Number(selectedAircraft.hourly_rate_usd) * Number(form.estimated_hours)
    : null;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!origin || !destination) {
      setErrors({ non_field_errors: ['Please select both origin and destination airports.'] });
      return;
    }
    if (!form.aircraft) {
      setErrors({ non_field_errors: ['Please select an aircraft to continue.'] });
      return;
    }
    setLoading(true); setErrors({});
    try {
      const addOnNotes = [
        form.catering         ? '[Add-on: In-Flight Catering]'  : '',
        form.ground_transport ? '[Add-on: Ground Transport]'    : '',
        form.concierge        ? '[Add-on: Personal Concierge]'  : '',
      ].filter(Boolean).join(', ');

      const payload = {
        trip_type:          form.trip_type,
        origin:             `${origin.city} (${origin.code})`,
        destination:        `${destination.city} (${destination.code})`,
        departure_datetime: form.departure_datetime,
        ...(form.trip_type === 'round_trip' && form.return_datetime
          ? { return_datetime: form.return_datetime }
          : {}),
        estimated_hours:  Number(form.estimated_hours),
        passenger_count:  Number(form.passenger_count),
        aircraft:         Number(form.aircraft),
        special_requests: [form.special_requests, addOnNotes].filter(Boolean).join('\n'),
      };
      const r = await memberApi.createBooking(payload);
      setSuccess(r.data);
    } catch (err) {
      const d = err.response?.data;
      setErrors({
        non_field_errors: [
          d?.non_field_errors?.[0] ||
          d?.detail ||
          'Booking failed. Please ensure your membership is active and all fields are filled.',
        ],
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSuccess(null);
    setForm({ ...INITIAL });
    setOrigin(null);
    setDest(null);
    setErrors({});
  };

  /* ── Success Screen ─────────────────────────────────────────────────────── */
  if (success) {
    return (
      <MemberLayout title="Booking Confirmed">
        <div style={{ maxWidth: 560, margin: '2rem auto', textAlign: 'center' }}>
          <div style={{
            width: 76, height: 76, borderRadius: '50%',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.75rem', boxShadow: '0 8px 32px rgba(34,197,94,0.25)',
          }}>
            <i className="bi bi-check-lg" style={{ fontSize: '2rem', color: '#fff' }} />
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--navy)', marginBottom: '0.5rem' }}>
            Flight Request Received!
          </h2>
          <p style={{ color: 'var(--gray-400)', lineHeight: 1.75, marginBottom: '2rem' }}>
            {success.message || 'Our operations team will review your request and be in touch shortly with confirmation.'}
          </p>

          {/* Reference box */}
          <div style={{
            background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
            borderRadius: 8, padding: '1.25rem 1.5rem', marginBottom: '1.5rem', textAlign: 'left',
          }}>
            <div style={{
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.16em',
              textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem',
            }}>
              Booking Reference
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.95rem', fontWeight: 700, color: 'var(--navy)', wordBreak: 'break-all' }}>
              {String(success.reference || success.booking?.reference || '—').toUpperCase()}
            </div>
          </div>

          {/* Summary strip */}
          {selectedAircraft && (
            <div className="detail-card" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <div className="detail-card-body">
                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 10, flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--navy-deep), var(--navy-mid))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <i className="bi bi-airplane" style={{ color: 'var(--gold)', fontSize: '1rem' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.9rem' }}>{selectedAircraft.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>
                      {origin?.city} ({origin?.code}) → {destination?.city} ({destination?.code}) · {form.estimated_hours} hrs
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: '1.75rem' }}>
            <i className="bi bi-info-circle" style={{ marginRight: 5 }} />
            Save your reference to track this booking from your dashboard.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/member" className="btn btn-navy">
              <i className="bi bi-house" style={{ marginRight: '0.4rem' }} /> Go to Dashboard
            </Link>
            <button className="btn btn-outline-navy" onClick={resetForm}>
              <i className="bi bi-plus" style={{ marginRight: '0.4rem' }} /> New Booking
            </button>
          </div>
        </div>
      </MemberLayout>
    );
  }

  /* ── Main Form ──────────────────────────────────────────────────────────── */
  return (
    <MemberLayout title="Book a Flight" breadcrumb="New Booking">

      {/* Page heading */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem' }}>
          Charter
        </div>
        <h2 style={{ margin: 0, fontSize: '1.9rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--navy)' }}>
          Book a Flight
        </h2>
        <p style={{ margin: '0.35rem 0 0', color: 'var(--gray-400)', fontSize: '0.9rem' }}>
          Reserve from our member fleet. No payment required at this stage.
        </p>
      </div>

      {/* Error banner */}
      {errors.non_field_errors && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <i className="bi bi-exclamation-circle" />
          <span>{errors.non_field_errors[0]}</span>
        </div>
      )}

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2.5rem', alignItems: 'start' }}>

        {/* ══ FORM ══════════════════════════════════════════════════════════ */}
        <form onSubmit={handleSubmit}>

          {/* 1. Aircraft ─────────────────────────────────────────────────── */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.2rem' }}>
              <i className="bi bi-airplane" style={{ color: 'var(--gold)', marginRight: '0.5rem' }} />
              Select Aircraft
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1.5rem' }}>
              Choose from our member-exclusive fleet. Membership discounts apply automatically.
            </p>

            {fleetLoading ? (
              <div style={{ textAlign: 'center', padding: '2.5rem' }}>
                <span className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
              </div>
            ) : fleet.length === 0 ? (
              <div style={{ padding: '2rem', background: 'var(--gray-50)', borderRadius: 8, textAlign: 'center', color: 'var(--gray-400)', fontSize: '0.87rem' }}>
                <i className="bi bi-airplane" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem', opacity: 0.3 }} />
                No aircraft available for your membership tier.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {fleet.map(ac => (
                  <AircraftCard
                    key={ac.id}
                    ac={ac}
                    selected={String(form.aircraft) === String(ac.id)}
                    onSelect={id => set('aircraft', id)}
                  />
                ))}
              </div>
            )}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--gray-100)', marginBottom: '2.5rem' }} />

          {/* 2. Route & Dates ────────────────────────────────────────────── */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.2rem' }}>
              <i className="bi bi-geo-alt" style={{ color: 'var(--gold)', marginRight: '0.5rem' }} />
              Flight Details
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1.5rem' }}>
              Tell us your route and travel dates.
            </p>

            {/* Trip type pills */}
            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
              {TRIP_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set('trip_type', t.value)}
                  style={{
                    padding: '0.55rem 1.15rem',
                    fontSize: '0.84rem', fontWeight: 500, fontFamily: 'inherit',
                    border: `1.5px solid ${form.trip_type === t.value ? 'var(--navy)' : 'var(--gray-200)'}`,
                    borderRadius: 6,
                    background: form.trip_type === t.value ? 'var(--navy)' : 'var(--white)',
                    color: form.trip_type === t.value ? '#fff' : 'var(--gray-500)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="form-grid">
              <AirportSearch label="From" value={origin} onChange={setOrigin} placeholder="City or airport code" required />
              <AirportSearch label="To"   value={destination} onChange={setDest} placeholder="City or airport code" required />

              <div className="form-group">
                <label className="form-label">Departure Date &amp; Time <span className="req">*</span></label>
                <input className="form-control" type="datetime-local" required
                  value={form.departure_datetime}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={e => set('departure_datetime', e.target.value)} />
              </div>

              {form.trip_type === 'round_trip' && (
                <div className="form-group">
                  <label className="form-label">Return Date &amp; Time <span className="req">*</span></label>
                  <input className="form-control" type="datetime-local" required
                    value={form.return_datetime}
                    min={form.departure_datetime || new Date().toISOString().slice(0, 16)}
                    onChange={e => set('return_datetime', e.target.value)} />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Estimated Flight Hours <span className="req">*</span></label>
                <input className="form-control" type="number" min="0.5" step="0.5" required
                  value={form.estimated_hours}
                  onChange={e => set('estimated_hours', e.target.value)} />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Passengers <span className="req">*</span>
                  {selectedAircraft && (
                    <span style={{ fontWeight: 400, color: 'var(--gray-400)', marginLeft: 6 }}>
                      (max {selectedAircraft.passenger_capacity})
                    </span>
                  )}
                </label>
                <input className="form-control" type="number" min="1" required
                  max={selectedAircraft?.passenger_capacity || 500}
                  value={form.passenger_count}
                  onChange={e => set('passenger_count', e.target.value)} />
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--gray-100)', marginBottom: '2.5rem' }} />

          {/* 3. Add-ons ──────────────────────────────────────────────────── */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.2rem' }}>
              <i className="bi bi-stars" style={{ color: 'var(--gold)', marginRight: '0.5rem' }} />
              Additional Services
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1.5rem' }}>
              Enhance your journey with our premium add-ons.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.75rem' }}>
              {ADDONS.map(({ key, icon, label, desc }) => (
                <div
                  key={key}
                  onClick={() => set(key, !form[key])}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    cursor: 'pointer', userSelect: 'none', padding: '1rem',
                    border: `1.5px solid ${form[key] ? 'var(--navy)' : 'var(--gray-200)'}`,
                    borderRadius: 6,
                    background: form[key] ? 'var(--blue-soft, #EFF4FB)' : 'var(--white)',
                    transition: 'all 0.15s',
                  }}
                >
                  <i className={`bi ${icon}`} style={{ fontSize: '1.2rem', color: form[key] ? 'var(--navy)' : 'var(--gold)', marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.84rem', color: 'var(--navy)', marginBottom: '0.2rem' }}>{label}</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--gray-400)', lineHeight: 1.4 }}>{desc}</div>
                  </div>
                  {form[key] && (
                    <i className="bi bi-check-circle-fill" style={{ color: 'var(--navy)', fontSize: '0.9rem', marginLeft: 'auto', flexShrink: 0, marginTop: 2 }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--gray-100)', marginBottom: '2.5rem' }} />

          {/* 4. Special Requests ─────────────────────────────────────────── */}
          <div className="form-group" style={{ marginBottom: '2.5rem' }}>
            <label className="form-label">Special Requests &amp; Notes</label>
            <textarea className="form-control" rows={4}
              value={form.special_requests}
              onChange={e => set('special_requests', e.target.value)}
              placeholder="Dietary requirements, preferred seating, special occasions, cargo, accessibility needs…"
            />
            <span className="form-hint">Any detail you share helps us tailor your experience.</span>
          </div>

          {/* Submit ─────────────────────────────────────────────────────── */}
          <button
            type="submit"
            className="btn btn-gold btn-lg"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading
              ? <><span className="spinner" style={{ marginRight: '0.5rem' }} /> Processing…</>
              : <><i className="bi bi-send" style={{ marginRight: '0.45rem' }} /> Confirm Booking Request</>
            }
          </button>
          <p style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--gray-400)', marginTop: '0.85rem' }}>
            <i className="bi bi-shield-check" style={{ marginRight: 5 }} />
            No payment required at this stage. Our operations team will confirm your booking.
          </p>
        </form>

        {/* ══ SIDEBAR ═══════════════════════════════════════════════════════ */}
        <div style={{ position: 'sticky', top: 88 }}>

          {/* Member card */}
          <div style={{
            background: 'linear-gradient(135deg, var(--navy-deep), var(--navy-mid))',
            borderRadius: 8, padding: '1.25rem 1.5rem', marginBottom: '1.25rem', color: '#fff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(201,168,76,0.2)', border: '1.5px solid var(--gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, color: 'var(--gold)', fontSize: '0.85rem',
              }}>
                {[user?.first_name, user?.last_name].filter(Boolean).map(n => n[0]).join('').toUpperCase() || '✈'}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                  {[user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username}
                </div>
                {user?.membership_tier && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {user.membership_tier} Member
                  </div>
                )}
              </div>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>
              Your membership discount is applied automatically at checkout.
            </div>
          </div>

          {/* Cost estimate */}
          {estimatedCost ? (
            <div style={{ background: 'var(--gold-pale)', border: '1px solid #E6CFA0', borderRadius: 8, padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7A5C22', marginBottom: '0.35rem' }}>
                Estimated Cost
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.3rem' }}>
                ${estimatedCost.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9A7530' }}>
                ${Number(selectedAircraft.hourly_rate_usd).toLocaleString()} × {form.estimated_hours} hrs
              </div>
              <div style={{ fontSize: '0.72rem', color: '#9A7530', marginTop: '0.5rem', fontStyle: 'italic' }}>
                Final price confirmed by our team after booking.
              </div>
            </div>
          ) : (
            <div style={{ background: 'var(--gold-pale)', border: '1px solid #E6CFA0', borderRadius: 8, padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>
              <div style={{ fontWeight: 600, color: '#7A5C22', marginBottom: '0.3rem', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="bi bi-calculator" style={{ color: 'var(--gold)' }} /> Cost Estimate
              </div>
              <p style={{ fontSize: '0.8rem', color: '#9A7530', margin: 0, lineHeight: 1.6 }}>
                Select an aircraft and enter flight hours to see an estimated cost.
              </p>
            </div>
          )}

          {/* What happens next */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 8, padding: '1.5rem', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem' }}>
              What Happens Next?
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                { n: '1', text: 'We review your request and check availability' },
                { n: '2', text: 'Operations team confirms within a few hours' },
                { n: '3', text: 'Final price sent — you approve before any charge' },
                { n: '4', text: 'Enjoy a seamless, door-to-door experience' },
              ].map(({ n, text }) => (
                <div key={n} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{
                    flexShrink: 0, width: 24, height: 24,
                    background: 'var(--gold-pale)', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 700, color: 'var(--gold-dark)',
                  }}>{n}</div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', margin: 0, lineHeight: 1.55 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Need help */}
          <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 8, padding: '1.5rem' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.4rem' }}>
              Need Help?
            </h4>
            <p style={{ color: 'var(--gray-400)', fontSize: '0.82rem', marginBottom: '1rem', lineHeight: 1.6 }}>
              Your dedicated member concierge is available 24/7.
            </p>
            <a href="tel:+254724878136" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              width: '100%', padding: '0.65rem', background: 'var(--navy)', color: '#fff',
              fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', borderRadius: 6,
              marginBottom: '0.5rem', transition: 'opacity 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <i className="bi bi-telephone" /> +254 724 878 136
            </a>
            <Link to="/member/routes" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              width: '100%', padding: '0.65rem', background: 'transparent', color: 'var(--navy)',
              fontWeight: 500, fontSize: '0.83rem', textDecoration: 'none', borderRadius: 6,
              border: '1px solid var(--gray-200)', transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--navy)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--gray-200)'}
            >
              <i className="bi bi-bookmark" /> View Saved Routes
            </Link>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          [style*="grid-template-columns: 1fr 320px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

    </MemberLayout>
  );
}

export default MemberBookPage;

