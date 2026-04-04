// src/pages/normal/AircraftSales.jsx
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import PublicNavbar from '../../components/common/PublicNavbar'
import PublicFooter from '../../components/common/PublicFooter'
import { inquiryApi } from '../../services/api'

const INQUIRY_TYPES = [
  { value: 'buying',    label: 'I Want to Buy',  icon: 'bi-bag-check' },
  { value: 'selling',   label: 'I Want to Sell', icon: 'bi-tag' },
  { value: 'valuation', label: 'Valuation Only', icon: 'bi-graph-up' },
]

const AIRCRAFT_TYPES = [
  { value: 'light_jet',      label: 'Light Jet',         icon: 'bi-airplane' },
  { value: 'midsize_jet',    label: 'Midsize Jet',        icon: 'bi-airplane' },
  { value: 'super_midsize',  label: 'Super Midsize',      icon: 'bi-airplane' },
  { value: 'heavy_jet',      label: 'Heavy Jet',          icon: 'bi-airplane' },
  { value: 'ultra_long',     label: 'Ultra Long Range',   icon: 'bi-airplane' },
  { value: 'turboprop',      label: 'Turboprop',          icon: 'bi-airplane' },
  { value: 'helicopter',     label: 'Helicopter',         icon: 'bi-tornado' },
  { value: 'vip_airliner',   label: 'VIP Airliner',       icon: 'bi-airplane' },
  { value: 'other',          label: 'Other / Unsure',     icon: 'bi-three-dots' },
]

const SERVICES = [
  { icon: 'bi-search',         title: 'Aircraft Sourcing',    desc: 'Access to thousands of listings worldwide. We find the right aircraft at the right price, on your timeline.' },
  { icon: 'bi-cash-stack',     title: 'Market Valuation',     desc: 'Accurate, data-driven valuations based on current market conditions, total time, and maintenance status.' },
  { icon: 'bi-file-earmark-text', title: 'Transaction Support', desc: 'Full legal, escrow, and documentation handling from offer to delivery. We manage every step.' },
  { icon: 'bi-tools',          title: 'Pre-Purchase Inspection', desc: 'Independent technical inspection and airworthiness review before any commitment is made.' },
]

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Aircraft Sales – NairobiJetHouse',
  url: 'https://www.nairobijethouse.com/aircraft-sales',
  provider: { '@type': 'Organization', name: 'NairobiJetHouse' },
}

export default function AircraftSales() {
  const blank = () => ({
    contact_name: '', email: '', phone: '', company: '',
    inquiry_type: 'buying',
    aircraft_type: 'light_jet',
    preferred_make_model: '',
    budget_range: '',
    year_from: '', year_to: '',
    max_total_time: '',
    registration_country: '',
    aircraft_description: '',
    timeline: '',
    additional_notes: '',
  })

  const [form, setForm]       = useState(blank())
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError]     = useState('')

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const r = await inquiryApi.aircraftSales(form)
      setSuccess(r.data)
    } catch {
      setError('Failed to submit. Please try again or contact us directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Aircraft Sales | NairobiJetHouse</title>
        <meta name="description" content="Buy or sell private aircraft with NairobiJetHouse. Expert sourcing, accurate valuations, and full transaction support from offer to delivery." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/aircraft-sales" />
        <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>
      </Helmet>

      <PublicNavbar />

      <div style={{ paddingTop: 'var(--navbar-h)' }}>

        {/* ── Hero ── */}
        <section style={{
          background: 'linear-gradient(135deg, var(--navy) 0%, #1a3a6b 100%)',
          padding: '3.5rem 0 3rem',
        }}>
          <div className="container">
            <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>
              <i className="bi bi-airplane" /> Aircraft Sales
            </span>
            <h1 style={{ color: 'var(--white)', marginTop: '0.35rem', marginBottom: '0.35rem', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
              Buy or Sell Your Aircraft <em style={{ color: 'var(--gold-light)' }}>With Confidence</em>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', marginBottom: '1.1rem', maxWidth: 480 }}>
              Expert aircraft acquisition, sales, and valuation services. From sourcing the perfect aircraft
              to managing every detail of the transaction — we handle it all.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {[['bi-globe2', 'Global Inventory Access'], ['bi-shield-check', 'Verified Transactions'], ['bi-clock', 'Expert Advisors']].map(([icon, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--gold-light)', fontWeight: 600, fontSize: '0.9rem' }}>
                  <i className={`bi ${icon}`} /> {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Services ── */}
        <section style={{ background: 'var(--off-white)', padding: '3rem 0' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {SERVICES.map(({ icon, title, desc }) => (
                <div key={title} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 44, height: 44, background: 'var(--gold-pale)', borderRadius: 'var(--radius)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <i className={`bi ${icon}`} style={{ color: 'var(--gold-dark)', fontSize: '1.1rem' }} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.3rem' }}>{title}</h4>
                    <p style={{ fontSize: '0.83rem', lineHeight: 1.65, color: 'var(--gray-500)', margin: 0 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Form ── */}
        <section style={{ background: 'var(--off-white)', padding: '0 0 3rem' }}>
          <div className="container" style={{ maxWidth: 860 }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span className="eyebrow">Start a Conversation</span>
              <h2 style={{ marginBottom: '0.5rem' }}>Tell Us What You <em>Need</em></h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem' }}>
                Our aircraft sales specialists will respond within 24 hours with tailored options and expert guidance.
              </p>
            </div>

            <div style={{
              background: 'var(--white)',
              border: '1px solid var(--gray-100)',
              borderRadius: 'var(--radius-xl)',
              padding: '2rem',
            }}>
              {success ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                  <div style={{
                    width: 56, height: 56, background: '#EBF7F1', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 1rem', fontSize: '1.5rem', color: '#16A34A',
                  }}>
                    <i className="bi bi-check-lg" />
                  </div>
                  <h4 style={{ marginBottom: '0.5rem' }}>Inquiry Submitted</h4>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                    {success.message || 'Our aircraft sales team will respond within 24 hours.'}
                  </p>
                  {success.inquiry?.reference && (
                    <div style={{
                      background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
                      borderRadius: 6, padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'inline-block', textAlign: 'left',
                    }}>
                      <div style={{ fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.25rem' }}>Reference</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy)' }}>
                        {String(success.inquiry.reference).slice(0, 16)}
                      </div>
                    </div>
                  )}
                  <br />
                  <button className="btn btn-navy btn-sm" onClick={() => setSuccess(null)}>
                    <i className="bi bi-arrow-counterclockwise" /> New Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="alert alert-error" style={{ marginBottom: '1rem', fontSize: '0.82rem' }}>
                      <i className="bi bi-exclamation-circle" /> {error}
                    </div>
                  )}

                  {/* Inquiry Type */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ marginBottom: '0.6rem', display: 'block' }}>
                      <i className="bi bi-question-circle" style={{ color: 'var(--gold)' }} /> I am interested in… <span className="req">*</span>
                    </label>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {INQUIRY_TYPES.map(({ value, label, icon }) => (
                        <button key={value} type="button" onClick={() => set('inquiry_type', value)}
                          style={{
                            flex: '1 1 140px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: 600, borderRadius: 'var(--radius)',
                            border: `1.5px solid ${form.inquiry_type === value ? 'var(--navy)' : 'var(--gray-200)'}`,
                            background: form.inquiry_type === value ? 'var(--navy)' : 'transparent',
                            color: form.inquiry_type === value ? 'white' : 'var(--gray-600)',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}>
                          <i className={`bi ${icon}`} />{label}
                          {form.inquiry_type === value && <i className="bi bi-check" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Aircraft Type */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ marginBottom: '0.6rem', display: 'block' }}>
                      <i className="bi bi-airplane" style={{ color: 'var(--gold)' }} /> Aircraft Category <span className="req">*</span>
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {AIRCRAFT_TYPES.map(({ value, label }) => (
                        <button key={value} type="button" onClick={() => set('aircraft_type', value)}
                          style={{
                            padding: '0.4rem 0.9rem', fontSize: '0.79rem', fontWeight: 500, borderRadius: 20,
                            border: `1.5px solid ${form.aircraft_type === value ? 'var(--navy)' : 'var(--gray-200)'}`,
                            background: form.aircraft_type === value ? 'var(--navy)' : 'transparent',
                            color: form.aircraft_type === value ? 'white' : 'var(--gray-600)',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name <span className="req">*</span></label>
                      <input className="form-control" required value={form.contact_name} onChange={e => set('contact_name', e.target.value)} placeholder="Your name" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email <span className="req">*</span></label>
                      <input className="form-control" type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+254 700 000 000" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Company</label>
                      <input className="form-control" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Optional" />
                    </div>
                  </div>

                  {/* Aircraft Specifics — changes label based on inquiry type */}
                  {form.inquiry_type === 'buying' ? (
                    <>
                      <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
                        <div className="form-group">
                          <label className="form-label">Preferred Make / Model</label>
                          <input className="form-control" value={form.preferred_make_model} onChange={e => set('preferred_make_model', e.target.value)} placeholder="e.g. Gulfstream G550, Challenger 350" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Budget Range</label>
                          <input className="form-control" value={form.budget_range} onChange={e => set('budget_range', e.target.value)} placeholder="e.g. $5M – $10M" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Year (From)</label>
                          <input className="form-control" type="number" value={form.year_from} onChange={e => set('year_from', e.target.value)} placeholder="e.g. 2015" min="1970" max="2026" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Max Total Time (hrs)</label>
                          <input className="form-control" type="number" value={form.max_total_time} onChange={e => set('max_total_time', e.target.value)} placeholder="e.g. 5000" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
                        <div className="form-group">
                          <label className="form-label">Aircraft Registration Country</label>
                          <input className="form-control" value={form.registration_country} onChange={e => set('registration_country', e.target.value)} placeholder="e.g. Kenya, USA, UAE" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Year of Manufacture</label>
                          <input className="form-control" type="number" value={form.year_from} onChange={e => set('year_from', e.target.value)} placeholder="e.g. 2018" min="1970" max="2026" />
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label">Aircraft Description <span className="req">*</span></label>
                        <textarea className="form-control" required={form.inquiry_type !== 'buying'} style={{ minHeight: 80 }}
                          value={form.aircraft_description}
                          onChange={e => set('aircraft_description', e.target.value)}
                          placeholder="Make, model, total time, avionics, interior configuration, asking price if known…" />
                      </div>
                    </>
                  )}

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Desired Timeline</label>
                    <input className="form-control" value={form.timeline} onChange={e => set('timeline', e.target.value)} placeholder="e.g. Within 3 months, ASAP, flexible" />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Additional Notes</label>
                    <textarea className="form-control" style={{ minHeight: 80 }}
                      value={form.additional_notes}
                      onChange={e => set('additional_notes', e.target.value)}
                      placeholder="Any other requirements, financing preferences, or questions for our team…" />
                  </div>

                  <button type="submit" className="btn btn-navy" disabled={loading}
                    style={{ width: '100%', justifyContent: 'center' }}>
                    {loading
                      ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Submitting…</>
                      : <><i className="bi bi-send" /> Submit Inquiry</>
                    }
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

      </div>

      <PublicFooter />
    </>
  )
}