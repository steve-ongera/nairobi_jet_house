import React, { useState } from 'react';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';

const CATEGORIES = [
  { value: '',              label: 'No preference — advise me' },
  { value: 'light',         label: 'Light Jet  (1–7 passengers, regional)' },
  { value: 'midsize',       label: 'Midsize Jet  (6–9 passengers, up to 5,000 km)' },
  { value: 'super_midsize', label: 'Super Midsize  (8–10 passengers, transatlantic)' },
  { value: 'heavy',         label: 'Heavy Jet  (10–16 passengers, intercontinental)' },
  { value: 'ultra_long',    label: 'Ultra Long Range  (any route, 14,000+ km)' },
  { value: 'vip_airliner',  label: 'VIP Airliner  (20–100+ passengers)' },
]

const FAQ = [
  { q: 'How quickly will I receive a response?', a: 'Our aviation specialists respond to all inquiries within 2–4 hours during business hours, and within 6 hours outside business hours. For urgent trips, call us directly on +254 724 878 136.' },
  { q: 'Is there any cost to submitting an inquiry?', a: 'Absolutely not. Submitting a flight inquiry is completely free and carries no obligation. Our team will present options and pricing for your consideration — you decide whether to proceed.' },
  { q: "What if I don't know my exact dates?", a: "That's exactly what a flight inquiry is for. Give us your approximate timeframe — 'late July', 'sometime in Q3', 'flexible' — and we'll present availability options across your preferred window." },
  { q: 'How does a flight inquiry differ from a booking?', a: 'A flight inquiry is exploratory — ideal when you want to understand pricing, aircraft options, or route feasibility before committing. A booking is for when you know exactly where you want to go and when.' },
]

export default function FlightInquiryPage() {
  const [form, setForm] = useState({
    guest_name: '', guest_email: '', guest_phone: '',
    origin_description: '', destination_description: '',
    approximate_date: '', passenger_count: 1,
    preferred_aircraft_category: '', message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError]     = useState(null)
  const [faqOpen, setFaqOpen] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      const { inquiryApi } = await import('../../services/api')
      const r = await inquiryApi.flightInquiry(form)
      setSuccess(r.data)
    } catch {
      setError('Unable to submit your inquiry. Please try again or contact us directly.')
    } finally {
      setLoading(false)
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
              <i className="bi bi-send" /> Explore Your Options
            </span>
            <h1 style={{ color: 'var(--white)', marginTop: '0.35rem', marginBottom: '0.35rem', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
              Flight <em style={{ color: 'var(--gold-light)' }}>Inquiry</em>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', maxWidth: 500 }}>
              Not sure which aircraft to choose or whether your route is feasible? Send us a general
              inquiry and our aviation specialists will guide you — no obligation, no cost.
            </p>
          </div>
        </section>

        {/* ── Body ── */}
        <section style={{ background: 'var(--off-white)', padding: '3rem 0' }}>
          <div className="container">

            {success ? (
              <div style={{ maxWidth: 540, margin: '0 auto', textAlign: 'center', padding: '3rem 0' }}>
                <div style={{
                  width: 64, height: 64, background: '#EBF7F1', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem', fontSize: '1.75rem', color: '#16A34A',
                }}>
                  <i className="bi bi-check-lg" />
                </div>
                <h3 style={{ marginBottom: '0.5rem' }}>Inquiry Sent Successfully</h3>
                <div className="gold-rule gold-rule-center" />
                <p style={{ lineHeight: 1.8, marginBottom: '1.5rem', color: 'var(--gray-600)' }}>{success.message}</p>
                {success.inquiry?.reference && (
                  <div style={{
                    background: 'var(--white)', border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius)', padding: '0.85rem 1.25rem',
                    marginBottom: '1.5rem', textAlign: 'left',
                  }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.25rem' }}>Reference</div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--navy)' }}>{success.inquiry.reference}</div>
                  </div>
                )}
                <button className="btn btn-outline-navy" onClick={() => setSuccess(null)}>
                  <i className="bi bi-plus" /> Submit Another Inquiry
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '3rem', alignItems: 'start' }}>

                {/* ── Form ── */}
                <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-xl)', padding: '2rem' }}>

                  <div className="alert alert-navy" style={{ marginBottom: '1.5rem', fontSize: '0.82rem' }}>
                    <i className="bi bi-info-circle" />
                    <span>
                      <strong>Inquiry vs Booking:</strong> An inquiry is for exploration — flexible dates, uncertain routes, or comparing options.
                      Ready to commit? <a href="/book-flight" style={{ fontWeight: 600 }}>Book directly here</a>.
                    </span>
                  </div>

                  {error && (
                    <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                      <i className="bi bi-exclamation-triangle" /> {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    {/* Contact */}
                    <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
                      <div className="form-group">
                        <label className="form-label">Full Name <span className="req">*</span></label>
                        <input className="form-control" required value={form.guest_name}
                          onChange={e => set('guest_name', e.target.value)} placeholder="John Smith" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Email Address <span className="req">*</span></label>
                        <input className="form-control" type="email" required value={form.guest_email}
                          onChange={e => set('guest_email', e.target.value)} placeholder="john@company.com" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input className="form-control" value={form.guest_phone}
                          onChange={e => set('guest_phone', e.target.value)} placeholder="+254 700 000 000" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Number of Passengers</label>
                        <input className="form-control" type="number" min={1} value={form.passenger_count}
                          onChange={e => set('passenger_count', parseInt(e.target.value))} />
                      </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--gray-100)', margin: '0 0 1.25rem' }} />

                    {/* Trip */}
                    <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
                      <div className="form-group">
                        <label className="form-label">Departure Location</label>
                        <input className="form-control" value={form.origin_description}
                          onChange={e => set('origin_description', e.target.value)} placeholder="e.g. Nairobi, Dubai, London" />
                        <span className="form-hint">City, region, or airport code — approximate is fine</span>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Destination</label>
                        <input className="form-control" value={form.destination_description}
                          onChange={e => set('destination_description', e.target.value)} placeholder="e.g. Maldives, Paris, Aspen" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Approximate Travel Dates</label>
                        <input className="form-control" value={form.approximate_date}
                          onChange={e => set('approximate_date', e.target.value)} placeholder="e.g. Late July 2025, flexible in Q3" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Preferred Aircraft Category</label>
                        <select className="form-control" value={form.preferred_aircraft_category}
                          onChange={e => set('preferred_aircraft_category', e.target.value)}>
                          {CATEGORIES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                      <label className="form-label">Your Message <span className="req">*</span></label>
                      <textarea className="form-control" required value={form.message}
                        onChange={e => set('message', e.target.value)}
                        style={{ minHeight: 120 }}
                        placeholder="Share any details — purpose of travel, budget range, preferred experience, or questions about routes…" />
                    </div>

                    <button type="submit" className="btn btn-navy" disabled={loading}
                      style={{ width: '100%', justifyContent: 'center' }}>
                      {loading
                        ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Sending…</>
                        : <><i className="bi bi-send" /> Send Inquiry</>
                      }
                    </button>
                    <p style={{ fontSize: '0.73rem', textAlign: 'center', color: 'var(--gray-400)', marginTop: '0.75rem' }}>
                      Free, no-obligation. We'll respond with aircraft options and estimated pricing.
                    </p>
                  </form>

                  {/* FAQ */}
                  <div style={{ marginTop: '2.5rem' }}>
                    <h5 style={{ marginBottom: '1rem', color: 'var(--navy)' }}>Frequently Asked Questions</h5>
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
                </div>

                {/* ── Sidebar ── */}
                <div style={{ position: 'sticky', top: 'calc(var(--navbar-h) + 1.5rem)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: 'var(--navy)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                    <h5 style={{ color: 'var(--white)', marginBottom: '1rem' }}>What to Expect</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      {[
                        ['bi-clock',     'Response within 2–4 hours'],
                        ['bi-airplane',  '2–3 tailored aircraft options'],
                        ['bi-cash-coin', 'Transparent pricing breakdown'],
                        ['bi-map',       'Route feasibility analysis'],
                        ['bi-chat-dots', 'No pressure to book'],
                      ].map(([icon, text]) => (
                        <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <i className={`bi ${icon}`} style={{ color: 'var(--gold-light)', fontSize: '0.9rem', flexShrink: 0 }} />
                          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem' }}>{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: 'var(--white)', border: '1px solid var(--gray-100)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>
                      <i className="bi bi-lightbulb" style={{ color: 'var(--gold)', marginRight: 6 }} /> Popular Routes
                    </div>
                    {['Nairobi → Dubai', 'Dubai → Mykonos', 'Nairobi → Cape Town', 'Geneva → Monaco', 'Singapore → Maldives'].map(r => (
                      <div key={r} style={{
                        padding: '0.4rem 0', borderBottom: '1px solid var(--gray-100)',
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        fontSize: '0.8rem', color: 'var(--gray-600)',
                      }}>
                        <i className="bi bi-arrow-right" style={{ color: 'var(--gold)', fontSize: '0.7rem' }} />{r}
                      </div>
                    ))}
                  </div>

                  <div style={{
                    background: 'var(--white)', border: '1px solid var(--gray-100)',
                    borderRadius: 'var(--radius-lg)', padding: '1.25rem', textAlign: 'center',
                  }}>
                    <i className="bi bi-telephone-fill" style={{ fontSize: '1.4rem', color: 'var(--gold)', marginBottom: '0.4rem', display: 'block' }} />
                    <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Prefer to Talk?</div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginBottom: '0.85rem' }}>Speak with an aviation specialist, 24 / 7.</p>
                    <a href="tel:+254724878136" className="btn btn-navy btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                      +254 724 878 136
                    </a>
                  </div>
                </div>

              </div>
            )}
          </div>
        </section>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .container > div[style*="grid-template-columns: 1fr 320px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <PublicFooter />
    </>
  )
}