import React, { useState, useEffect } from 'react';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';

const FAQ = [
  { q: 'How far in advance should I book?', a: 'Peak season charters (July–August, Christmas/New Year) should be booked 6–12 months ahead. For off-peak periods, 4–8 weeks is usually sufficient, though last-minute availability does occasionally arise.' },
  { q: 'What is included in the charter fee?', a: 'The base charter fee covers the yacht, crew, and standard equipment. Additional costs (APA) typically cover fuel, provisioning, port fees, and communications — usually 25–35% on top of the base rate.' },
  { q: 'Can I customise the itinerary?', a: 'Absolutely. Our concierge team works with you to craft a bespoke itinerary around your preferences — diving spots, island-hopping, cultural stops, or simply anchoring in secluded bays.' },
  { q: 'What experience do I need to charter a yacht?', a: 'None at all. All our charter yachts come with a fully qualified, professional crew including a captain and chef. You simply arrive and enjoy.' },
]

const DESTINATIONS = [
  { name: 'Indian Ocean',    icon: 'bi-water',       desc: 'Maldives, Seychelles, Zanzibar' },
  { name: 'Mediterranean',   icon: 'bi-sun',         desc: 'Amalfi Coast, Greek Islands, French Riviera' },
  { name: 'Caribbean',       icon: 'bi-tropical-storm', desc: 'BVI, St Barts, Antigua' },
  { name: 'East Africa',     icon: 'bi-geo-alt',     desc: 'Lamu, Pemba, Mozambique' },
]

export default function YachtCharterPage() {
  const [yachts, setYachts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm]       = useState({
    guest_name: '', guest_email: '', guest_phone: '', company: '',
    departure_port: '', destination_port: '', charter_start: '',
    charter_end: '', guest_count: 2, yacht: '', special_requests: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess]       = useState(null)
  const [error, setError]           = useState('')
  const [faqOpen, setFaqOpen]       = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    import('../../services/api').then(({ fleetApi }) => {
      fleetApi.yachtList()
        .then(r => setYachts(r.data.results || r.data))
        .catch(() => {})
        .finally(() => setLoading(false))
    })
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true); setError('')
    try {
      const { bookingApi } = await import('../../services/api')
      const payload = { ...form, guest_count: Number(form.guest_count) }
      if (!payload.yacht) delete payload.yacht
      const r = await bookingApi.createYacht(payload)
      setSuccess(r.data)
    } catch {
      setError('Failed to submit. Please try again or contact us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PublicNavbar />

      <div style={{ paddingTop: 'var(--navbar-h)' }}>

        {/* ── Hero ── */}
        <section style={{
          background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a6b 100%)',
          padding: '3.5rem 0 3rem',
        }}>
          <div className="container">
            <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>
              <i className="bi bi-anchor" /> Superyacht Charter
            </span>
            <h1 style={{ color: 'var(--white)', marginTop: '0.35rem', marginBottom: '0.35rem', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
              Sail the World in <em style={{ color: 'var(--gold-light)' }}>Absolute Luxury</em>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', maxWidth: 500 }}>
              Charter world-class superyachts across the Indian Ocean, Mediterranean, Caribbean and beyond.
              Every voyage crafted to perfection with a full professional crew.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
              <a href="tel:+254724878136" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--gold-light)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                <i className="bi bi-telephone-fill" /> +254 724 878 136
              </a>
              <a href="https://wa.me/254724878136" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '0.9rem' }}>
                <i className="bi bi-whatsapp" /> WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* ── Destinations strip ── */}
        <section style={{ background: 'var(--white)', borderBottom: '1px solid var(--gray-100)', padding: '1.5rem 0' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              {DESTINATIONS.map(({ name, icon, desc }) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 38, height: 38, background: 'var(--gold-pale)', borderRadius: 'var(--radius)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--gold-dark)', fontSize: '1rem', flexShrink: 0,
                  }}>
                    <i className={`bi ${icon}`} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--navy)' }}>{name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)' }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Main ── */}
        <section style={{ background: 'var(--off-white)', padding: '3rem 0' }}>
          <div className="container">
            <div className="yacht-charter-grid">

              {/* Left — form */}
              <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>

                {success ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <div style={{
                      width: 60, height: 60, background: '#EBF7F1', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 1rem', fontSize: '1.6rem', color: '#16A34A',
                    }}>
                      <i className="bi bi-check-lg" />
                    </div>
                    <h4 style={{ marginBottom: '0.5rem' }}>Charter Request Received</h4>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                      {success.message || 'Our team will respond within 4 hours with availability and pricing.'}
                    </p>
                    {success.charter?.reference && (
                      <div style={{
                        background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
                        borderRadius: 'var(--radius)', padding: '0.75rem 1rem',
                        marginBottom: '1.25rem', textAlign: 'left',
                      }}>
                        <div style={{ fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.25rem' }}>Reference</div>
                        <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--navy)', fontSize: '0.85rem' }}>{success.charter.reference}</div>
                      </div>
                    )}
                    <button className="btn btn-navy btn-sm" onClick={() => setSuccess(null)}>
                      <i className="bi bi-arrow-counterclockwise" /> New Request
                    </button>
                  </div>
                ) : (
                  <>
                    <h4 style={{ marginBottom: '0.25rem' }}>Charter Request</h4>
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                      Submit your requirements and our concierge will respond within 4 hours.
                    </p>

                    {error && (
                      <div className="alert alert-error" style={{ marginBottom: '1rem', fontSize: '0.82rem' }}>
                        <i className="bi bi-exclamation-circle" /> {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit}>
                      {/* Contact */}
                      <div className="form-grid" style={{ marginBottom: '1.1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Full Name <span className="req">*</span></label>
                          <input className="form-control" required value={form.guest_name}
                            onChange={e => set('guest_name', e.target.value)} placeholder="Your full name" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Email <span className="req">*</span></label>
                          <input className="form-control" type="email" required value={form.guest_email}
                            onChange={e => set('guest_email', e.target.value)} placeholder="your@email.com" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Phone</label>
                          <input className="form-control" value={form.guest_phone}
                            onChange={e => set('guest_phone', e.target.value)} placeholder="+254 700 000 000" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Company</label>
                          <input className="form-control" value={form.company}
                            onChange={e => set('company', e.target.value)} placeholder="Optional" />
                        </div>
                      </div>

                      <hr style={{ border: 'none', borderTop: '1px solid var(--gray-100)', margin: '0 0 1.1rem' }} />

                      {/* Charter details */}
                      <div className="form-grid" style={{ marginBottom: '1.1rem' }}>
                        <div className="form-group">
                          <label className="form-label">Preferred Yacht</label>
                          <select className="form-control" value={form.yacht} onChange={e => set('yacht', e.target.value)}>
                            <option value="">No preference</option>
                            {loading
                              ? <option disabled>Loading yachts…</option>
                              : yachts.map(y => (
                                  <option key={y.id} value={y.id}>
                                    {y.name} — {y.length_meters}m ({y.guest_capacity} guests)
                                  </option>
                                ))
                            }
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Number of Guests <span className="req">*</span></label>
                          <input className="form-control" type="number" min="1" required value={form.guest_count}
                            onChange={e => set('guest_count', e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Departure Port <span className="req">*</span></label>
                          <input className="form-control" required value={form.departure_port}
                            onChange={e => set('departure_port', e.target.value)} placeholder="e.g. Mombasa, Kenya" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Destination Port</label>
                          <input className="form-control" value={form.destination_port}
                            onChange={e => set('destination_port', e.target.value)} placeholder="e.g. Zanzibar or open itinerary" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Charter Start <span className="req">*</span></label>
                          <input className="form-control" type="date" required value={form.charter_start}
                            onChange={e => set('charter_start', e.target.value)}
                            min={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Charter End <span className="req">*</span></label>
                          <input className="form-control" type="date" required value={form.charter_end}
                            onChange={e => set('charter_end', e.target.value)}
                            min={form.charter_start || new Date().toISOString().split('T')[0]} />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label">Special Requests</label>
                        <textarea className="form-control" style={{ minHeight: 90 }} value={form.special_requests}
                          onChange={e => set('special_requests', e.target.value)}
                          placeholder="Dietary requirements, diving equipment, itinerary preferences…" />
                      </div>

                      <button type="submit" className="btn btn-gold" disabled={submitting}
                        style={{ width: '100%', justifyContent: 'center' }}>
                        {submitting
                          ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Submitting…</>
                          : <><i className="bi bi-send" /> Submit Charter Request</>
                        }
                      </button>
                    </form>

                    {/* FAQ */}
                    <div style={{ marginTop: '2.5rem' }}>
                      <h5 style={{ marginBottom: '1rem', color: 'var(--navy)' }}>Common Questions</h5>
                      {FAQ.map(({ q, a }, i) => (
                        <div key={i} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                          <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} style={{
                            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '0.85rem 0', textAlign: 'left',
                          }}>
                            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--navy)' }}>{q}</span>
                            <i className={`bi bi-chevron-${faqOpen === i ? 'up' : 'down'}`} style={{ color: 'var(--gold)', flexShrink: 0, marginLeft: '1rem' }} />
                          </button>
                          {faqOpen === i && (
                            <p style={{ fontSize: '0.825rem', paddingBottom: '0.85rem', lineHeight: 1.75, color: 'var(--gray-600)' }}>{a}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Right — sidebar */}
              <div style={{ position: 'sticky', top: 'calc(var(--navbar-h) + 1.5rem)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: 'var(--navy)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                  <h5 style={{ color: 'var(--white)', marginBottom: '1rem' }}>What's Included</h5>
                  {[
                    ['bi-people-fill',      'Full professional crew'],
                    ['bi-cup-hot',          'Chef & catering on board'],
                    ['bi-geo-alt',          'Custom itinerary planning'],
                    ['bi-life-preserver',   'Safety equipment & briefing'],
                    ['bi-wifi',             'Satellite comms & entertainment'],
                    ['bi-chat-dots',        '24/7 concierge support'],
                  ].map(([icon, text]) => (
                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.55rem' }}>
                      <i className={`bi ${icon}`} style={{ color: 'var(--gold-light)', fontSize: '0.9rem', flexShrink: 0 }} />
                      <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem' }}>{text}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>
                    <i className="bi bi-info-circle" style={{ color: 'var(--gold)', marginRight: 6 }} /> Pricing Guide
                  </div>
                  {[
                    ['Under 30m', 'From $8,000 / day'],
                    ['30–50m',    'From $20,000 / day'],
                    ['50–80m',    'From $45,000 / day'],
                    ['80m+',      'From $80,000 / day'],
                  ].map(([size, price]) => (
                    <div key={size} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '0.4rem 0', borderBottom: '1px solid var(--gray-100)',
                      fontSize: '0.8rem',
                    }}>
                      <span style={{ color: 'var(--gray-600)' }}>{size}</span>
                      <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{price}</span>
                    </div>
                  ))}
                  <p style={{ fontSize: '0.7rem', color: 'var(--gray-400)', marginTop: '0.65rem' }}>
                    * Base rate only. APA (25–35%) covers fuel, provisioning & port fees.
                  </p>
                </div>

                <div style={{
                  background: 'var(--white)', border: '1px solid var(--gray-100)',
                  borderRadius: 'var(--radius-lg)', padding: '1.25rem', textAlign: 'center',
                }}>
                  <i className="bi bi-telephone-fill" style={{ fontSize: '1.4rem', color: 'var(--gold)', marginBottom: '0.4rem', display: 'block' }} />
                  <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Prefer to Talk?</div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '0.85rem' }}>Speak with a yacht specialist, 24 / 7.</p>
                  <a href="tel:+254724878136" className="btn btn-navy btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                    +254 724 878 136
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>

      <style>{`
        .yacht-charter-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 2.5rem;
          align-items: start;
        }
        @media (max-width: 860px) {
          .yacht-charter-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .destinations-strip { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      <PublicFooter />
    </>
  )
}