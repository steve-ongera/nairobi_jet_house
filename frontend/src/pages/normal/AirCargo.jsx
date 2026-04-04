// src/pages/normal/AirCargo.jsx
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import PublicNavbar from '../../components/common/PublicNavbar'
import PublicFooter from '../../components/common/PublicFooter'
import { inquiryApi } from '../../services/api'

const CARGO_TYPES = [
  { value: 'general',         label: 'General Cargo',       icon: 'bi-box' },
  { value: 'perishables',     label: 'Perishables',         icon: 'bi-thermometer-snow' },
  { value: 'pharma',          label: 'Pharmaceuticals',     icon: 'bi-capsule' },
  { value: 'dangerous_goods', label: 'Dangerous Goods',     icon: 'bi-exclamation-diamond' },
  { value: 'live_animals',    label: 'Live Animals',        icon: 'bi-bug' },
  { value: 'artwork',         label: 'Artwork / High Value',icon: 'bi-gem' },
  { value: 'automotive',      label: 'Automotive',          icon: 'bi-car-front' },
  { value: 'oversized',       label: 'Oversized / Heavy',   icon: 'bi-arrows-fullscreen' },
  { value: 'humanitarian',    label: 'Humanitarian Aid',    icon: 'bi-heart' },
  { value: 'other',           label: 'Other',               icon: 'bi-three-dots' },
]

const URGENCY_OPTIONS = [
  { value: 'standard', label: 'Standard',       sub: '3–5 business days', icon: 'bi-clock' },
  { value: 'express',  label: 'Express',        sub: '24–48 hours',       icon: 'bi-lightning' },
  { value: 'critical', label: 'Critical / AOG', sub: 'Same day',          icon: 'bi-fire' },
]

const CAPABILITIES = [
  { icon: 'bi-lightning-charge', title: 'AOG Response',       desc: 'Aircraft-on-ground parts anywhere in the world, same-day routing.' },
  { icon: 'bi-thermometer-snow', title: 'Cold Chain',         desc: 'Temperature-controlled freight for pharma, biotech, and perishables.' },
  { icon: 'bi-shield-lock',      title: 'High-Value Cargo',   desc: 'Fine art, jewellery, and bullion with a secure chain of custody.' },
  { icon: 'bi-truck',            title: 'Door-to-Door',       desc: 'Full customs clearance, bonded warehouse, and last-mile delivery.' },
]

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Air Cargo – NairobiJetHouse',
  url: 'https://www.nairobijethouse.com/air-cargo',
  provider: { '@type': 'Organization', name: 'NairobiJetHouse' },
}

export default function AirCargo() {
  const blank = () => ({
    contact_name: '', email: '', phone: '', company: '',
    cargo_type: 'general', cargo_description: '',
    weight_kg: '', volume_m3: '', dimensions: '',
    origin_description: '', destination_description: '',
    pickup_date: '', urgency: 'standard',
    is_hazardous: false, requires_temperature_control: false,
    insurance_required: false, customs_assistance_needed: false,
    additional_notes: '',
  })

  const [form, setForm]     = useState(blank())
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError]   = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const payload = {
        ...form,
        weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
        volume_m3: form.volume_m3 ? parseFloat(form.volume_m3) : null,
      }
      const r = await inquiryApi.airCargo(payload)
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
        <title>Air Cargo Services | NairobiJetHouse</title>
        <meta name="description" content="Critical freight delivered on time. AOG parts, cold chain, high-value cargo, and door-to-door logistics across 187 countries." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/air-cargo" />
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
              <i className="bi bi-boxes" /> Air Cargo
            </span>
            <h1 style={{ color: 'var(--white)', marginTop: '0.35rem', marginBottom: '0.35rem', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
              Critical Freight Delivered <em style={{ color: 'var(--gold-light)' }}>On Time</em>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', marginBottom: '1.1rem', maxWidth: 480 }}>
              From time-critical AOG parts to temperature-sensitive pharmaceuticals and priceless artwork —
              our dedicated air cargo network moves your freight with unmatched speed and care.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {[['bi-lightning', '< 2hr Quote Response'], ['bi-globe2', '187 Countries'], ['bi-shield-check', 'Full Insurance Options']].map(([icon, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--gold-light)', fontWeight: 600, fontSize: '0.9rem' }}>
                  <i className={`bi ${icon}`} /> {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Capabilities ── */}
        <section style={{ background: 'var(--off-white)', padding: '3rem 0' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {CAPABILITIES.map(({ icon, title, desc }) => (
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
              <span className="eyebrow">Get a Quote</span>
              <h2 style={{ marginBottom: '0.5rem' }}>Tell Us About Your <em>Shipment</em></h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem' }}>
                Complete the form and a cargo specialist will respond within 2 hours with routing options and pricing.
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
                  <h4 style={{ marginBottom: '0.5rem' }}>Cargo Inquiry Submitted</h4>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                    {success.message || 'A cargo specialist will respond within 2 hours with routing options and pricing.'}
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

                  {/* Cargo Type */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ marginBottom: '0.6rem', display: 'block' }}>
                      <i className="bi bi-box" style={{ color: 'var(--gold)' }} /> Cargo Type <span className="req">*</span>
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {CARGO_TYPES.map(({ value, label, icon }) => (
                        <button key={value} type="button" onClick={() => set('cargo_type', value)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.4rem 0.9rem', fontSize: '0.79rem', fontWeight: 500, borderRadius: 20,
                            border: `1.5px solid ${form.cargo_type === value ? 'var(--navy)' : 'var(--gray-200)'}`,
                            background: form.cargo_type === value ? 'var(--navy)' : 'transparent',
                            color: form.cargo_type === value ? 'white' : 'var(--gray-600)',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}>
                          <i className={`bi ${icon}`} />{label}
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
                      <input className="form-control" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Your company" />
                    </div>
                  </div>

                  {/* Cargo Details */}
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label className="form-label">Cargo Description <span className="req">*</span></label>
                    <textarea className="form-control" required style={{ minHeight: 80 }}
                      value={form.cargo_description}
                      onChange={e => set('cargo_description', e.target.value)}
                      placeholder="Describe contents, packaging type, and any special handling requirements…" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label">Weight (kg)</label>
                      <input className="form-control" type="number" step="0.01" min="0" value={form.weight_kg} onChange={e => set('weight_kg', e.target.value)} placeholder="e.g. 250" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Volume (m³)</label>
                      <input className="form-control" type="number" step="0.01" min="0" value={form.volume_m3} onChange={e => set('volume_m3', e.target.value)} placeholder="e.g. 2.5" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Dimensions (L×W×H cm)</label>
                      <input className="form-control" value={form.dimensions} onChange={e => set('dimensions', e.target.value)} placeholder="120 × 80 × 100" />
                    </div>
                  </div>

                  {/* Route */}
                  <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label">Origin <span className="req">*</span></label>
                      <input className="form-control" required value={form.origin_description} onChange={e => set('origin_description', e.target.value)} placeholder="City, country or airport code" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Destination <span className="req">*</span></label>
                      <input className="form-control" required value={form.destination_description} onChange={e => set('destination_description', e.target.value)} placeholder="City, country or airport code" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Earliest Pickup Date</label>
                      <input className="form-control" type="date" value={form.pickup_date} min={new Date().toISOString().split('T')[0]} onChange={e => set('pickup_date', e.target.value)} />
                    </div>
                  </div>

                  {/* Urgency */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ marginBottom: '0.6rem', display: 'block' }}>
                      <i className="bi bi-lightning" style={{ color: 'var(--gold)' }} /> Urgency <span className="req">*</span>
                    </label>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      {URGENCY_OPTIONS.map(({ value, label, sub, icon }) => (
                        <button key={value} type="button" onClick={() => set('urgency', value)}
                          style={{
                            flex: '1 1 150px', padding: '0.85rem 1rem', textAlign: 'left',
                            borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'all 0.15s',
                            border: `1.5px solid ${form.urgency === value ? 'var(--navy)' : 'var(--gray-200)'}`,
                            background: form.urgency === value ? 'rgba(26,42,58,0.06)' : 'var(--gray-50)',
                          }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                            <i className={`bi ${icon}`} style={{ color: form.urgency === value ? 'var(--navy)' : 'var(--gold)', fontSize: '0.9rem' }} />
                            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: form.urgency === value ? 'var(--navy)' : 'var(--gray-700)' }}>{label}</span>
                            {form.urgency === value && <i className="bi bi-check-circle-fill" style={{ color: 'var(--navy)', marginLeft: 'auto' }} />}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--gray-400)', paddingLeft: '1.4rem' }}>{sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Special Handling */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ marginBottom: '0.6rem', display: 'block' }}>
                      <i className="bi bi-stars" style={{ color: 'var(--gold)' }} /> Special Handling
                    </label>
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                      {[
                        ['is_hazardous',                  'bi-exclamation-diamond', 'Hazardous Material'],
                        ['requires_temperature_control',  'bi-thermometer-snow',    'Temperature Control'],
                        ['insurance_required',            'bi-shield-check',        'Insurance Required'],
                        ['customs_assistance_needed',     'bi-file-earmark-check',  'Customs Assistance'],
                      ].map(([k, icon, label]) => (
                        <button key={k} type="button" onClick={() => set(k, !form[k])}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.45rem',
                            padding: '0.45rem 0.9rem', fontSize: '0.8rem', fontWeight: 500, borderRadius: 20,
                            border: `1.5px solid ${form[k] ? 'var(--navy)' : 'var(--gray-200)'}`,
                            background: form[k] ? 'rgba(26,42,58,0.06)' : 'transparent',
                            color: form[k] ? 'var(--navy)' : 'var(--gray-600)',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}>
                          <i className={`bi ${icon}`} style={{ color: form[k] ? 'var(--navy)' : 'var(--gold)' }} />
                          {label}
                          {form[k] && <i className="bi bi-check" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Additional Notes</label>
                    <textarea className="form-control" style={{ minHeight: 80 }}
                      value={form.additional_notes}
                      onChange={e => set('additional_notes', e.target.value)}
                      placeholder="Packaging details, access constraints, documentation notes, consignee details…" />
                  </div>

                  <button type="submit" className="btn btn-navy" disabled={loading}
                    style={{ width: '100%', justifyContent: 'center' }}>
                    {loading
                      ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Submitting…</>
                      : <><i className="bi bi-send" /> Submit Cargo Inquiry</>
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