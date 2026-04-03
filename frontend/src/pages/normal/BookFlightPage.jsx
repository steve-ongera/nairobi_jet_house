import React, { useState, useEffect } from 'react';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { bookingApi, fleetApi } from '../../services/api';

const TRIP_TYPES = [
  { value: 'one_way', label: 'One Way' },
  { value: 'round_trip', label: 'Round Trip' },
  { value: 'multi_leg', label: 'Multi-Leg' },
];

export default function BookFlightPage() {
  const [airports, setAirports]   = useState([]);
  const [aircraft, setAircraft]   = useState([]);
  const [form, setForm]           = useState({
    guest_name: '', guest_email: '', guest_phone: '', company: '',
    trip_type: 'one_way', origin: '', destination: '',
    departure_date: '', departure_time: '', return_date: '', passenger_count: 1,
    aircraft: '', special_requests: '',
    catering_requested: false, ground_transport_requested: false, concierge_requested: false,
  });
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(null);
  const [errors, setErrors]       = useState({});
  const [airportQ, setAirportQ]   = useState({ origin: '', destination: '' });

  useEffect(() => {
    fleetApi.aircraftList().then(r => setAircraft(r.data.results || r.data)).catch(() => {});
  }, []);

  const searchAirports = async (q, field) => {
    if (q.length < 2) return;
    try {
      const r = await fleetApi.airports({ search: q });
      setAirports(p => ({ ...p, [field]: r.data.results || r.data }));
    } catch {}
  };

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setErrors({});
    try {
      const payload = { ...form, passenger_count: Number(form.passenger_count) };
      if (!payload.aircraft) delete payload.aircraft;
      if (!payload.return_date) delete payload.return_date;
      if (!payload.company) delete payload.company;
      const r = await bookingApi.createFlight(payload);
      setSuccess(r.data);
    } catch (err) {
      setErrors(err.response?.data || {});
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <PublicNavbar />
        <div style={{ paddingTop: 'var(--navbar-h)', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
          <div className="container">
            <div className="success-wrap">
              <div className="success-icon"><i className="bi bi-check-lg" /></div>
              <h2>Flight Request Received!</h2>
              <p style={{ marginTop: '0.75rem' }}>{success.message}</p>
              <div className="ref-box">
                <div className="ref-label">Booking Reference</div>
                <div className="ref-value">{success.booking?.reference}</div>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--gray-400)' }}>
                Our aviation team will contact you within 2 hours with a personalised quote.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
                <a href={`/track?ref=${success.booking?.reference}`} className="btn btn-navy">
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

  return (
    <>
      <PublicNavbar />
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Private Charter</span>
          <h1>Book Your Private Jet</h1>
          <p>Tell us your requirements and our team will provide a bespoke quote within 2 hours.</p>
        </div>
      </div>

      <section className="section">
        <div className="container-sm">
          <form onSubmit={handleSubmit}>
            {/* Contact */}
            <div className="detail-card mb-4">
              <div className="detail-card-header">
                <div className="detail-card-title"><i className="bi bi-person" /> Your Details</div>
              </div>
              <div className="detail-card-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name <span className="req">*</span></label>
                    <input className="form-control" value={form.guest_name} onChange={set('guest_name')} placeholder="Jane Odhiambo" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address <span className="req">*</span></label>
                    <input className="form-control" type="email" value={form.guest_email} onChange={set('guest_email')} placeholder="jane@example.com" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input className="form-control" value={form.guest_phone} onChange={set('guest_phone')} placeholder="+254 700 000 000" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company (optional)</label>
                    <input className="form-control" value={form.company} onChange={set('company')} placeholder="Acme Corp" />
                  </div>
                </div>
              </div>
            </div>

            {/* Flight Details */}
            <div className="detail-card mb-4">
              <div className="detail-card-header">
                <div className="detail-card-title"><i className="bi bi-airplane" /> Flight Details</div>
              </div>
              <div className="detail-card-body">
                {/* Trip type */}
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                  {TRIP_TYPES.map(t => (
                    <label key={t.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.55rem 1.1rem', border: `1.5px solid ${form.trip_type === t.value ? 'var(--navy)' : 'var(--gray-200)'}`, borderRadius: 'var(--radius)', background: form.trip_type === t.value ? 'var(--blue-light)' : 'var(--white)', transition: 'var(--transition)', fontSize: '0.875rem', fontWeight: 500, color: form.trip_type === t.value ? 'var(--navy)' : 'var(--gray-500)' }}>
                      <input type="radio" name="trip_type" value={t.value} checked={form.trip_type === t.value} onChange={set('trip_type')} style={{ display: 'none' }} />
                      {t.label}
                    </label>
                  ))}
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Origin Airport / City <span className="req">*</span></label>
                    <select className="form-control" value={form.origin} onChange={set('origin')} required>
                      <option value="">Select origin…</option>
                      {/* In production: live airport search autocomplete */}
                      <option value="1">NBO – Nairobi, Kenya</option>
                      <option value="2">DXB – Dubai, UAE</option>
                      <option value="3">LHR – London, UK</option>
                      <option value="4">JFK – New York, USA</option>
                      <option value="5">CDG – Paris, France</option>
                      <option value="6">SIN – Singapore</option>
                      <option value="7">CPT – Cape Town, SA</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Destination Airport / City <span className="req">*</span></label>
                    <select className="form-control" value={form.destination} onChange={set('destination')} required>
                      <option value="">Select destination…</option>
                      <option value="2">DXB – Dubai, UAE</option>
                      <option value="3">LHR – London, UK</option>
                      <option value="4">JFK – New York, USA</option>
                      <option value="5">CDG – Paris, France</option>
                      <option value="6">SIN – Singapore</option>
                      <option value="7">CPT – Cape Town, SA</option>
                      <option value="1">NBO – Nairobi, Kenya</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Departure Date <span className="req">*</span></label>
                    <input className="form-control" type="date" value={form.departure_date} onChange={set('departure_date')} min={new Date().toISOString().split('T')[0]} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Preferred Departure Time</label>
                    <input className="form-control" type="time" value={form.departure_time} onChange={set('departure_time')} />
                  </div>
                  {form.trip_type === 'round_trip' && (
                    <div className="form-group">
                      <label className="form-label">Return Date <span className="req">*</span></label>
                      <input className="form-control" type="date" value={form.return_date} onChange={set('return_date')} min={form.departure_date || new Date().toISOString().split('T')[0]} required />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label">Number of Passengers <span className="req">*</span></label>
                    <input className="form-control" type="number" min="1" max="500" value={form.passenger_count} onChange={set('passenger_count')} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Preferred Aircraft (optional)</label>
                    <select className="form-control" value={form.aircraft} onChange={set('aircraft')}>
                      <option value="">No preference / Recommend one</option>
                      {aircraft.map(a => (
                        <option key={a.id} value={a.id}>{a.name} — {a.category_display} ({a.passenger_capacity} pax)</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Add-ons */}
            <div className="detail-card mb-4">
              <div className="detail-card-header">
                <div className="detail-card-title"><i className="bi bi-stars" /> Add-On Services</div>
              </div>
              <div className="detail-card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {[
                    { key: 'catering_requested', icon: 'bi-cup-straw', label: 'In-Flight Catering', desc: 'Gourmet meals & beverages' },
                    { key: 'ground_transport_requested', icon: 'bi-car-front', label: 'Ground Transport', desc: 'Airport transfers' },
                    { key: 'concierge_requested', icon: 'bi-headset', label: 'Concierge Service', desc: 'Hotels, visas & more' },
                  ].map(opt => (
                    <label key={opt.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', padding: '1rem', border: `1.5px solid ${form[opt.key] ? 'var(--navy)' : 'var(--gray-200)'}`, borderRadius: 'var(--radius-md)', background: form[opt.key] ? 'var(--blue-light)' : 'var(--white)', transition: 'var(--transition)' }}>
                      <input type="checkbox" checked={form[opt.key]} onChange={set(opt.key)} style={{ marginTop: '0.2rem' }} />
                      <div>
                        <i className={`bi ${opt.icon}`} style={{ color: 'var(--gold)', display: 'block', fontSize: '1.1rem', marginBottom: '0.25rem' }} />
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--navy)' }}>{opt.label}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="form-group">
                  <label className="form-label">Special Requests</label>
                  <textarea className="form-control" rows={4} value={form.special_requests} onChange={set('special_requests')} placeholder="Any dietary requirements, special occasions, specific route preferences, cargo requirements…" />
                </div>
              </div>
            </div>

            {errors.non_field_errors && (
              <div className="alert alert-error"><i className="bi bi-exclamation-circle" />{errors.non_field_errors[0]}</div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <a href="/" className="btn btn-ghost">Cancel</a>
              <button type="submit" className="btn btn-gold btn-lg" disabled={loading}>
                {loading ? <><span className="spinner" /> Submitting…</> : <><i className="bi bi-send" /> Submit Charter Request</>}
              </button>
            </div>
          </form>
        </div>
      </section>
      <PublicFooter />
    </>
  );
}