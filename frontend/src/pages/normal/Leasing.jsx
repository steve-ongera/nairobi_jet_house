// src/pages/normal/Leasing.jsx
import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import PublicNavbar from '../../components/common/PublicNavbar'
import PublicFooter from '../../components/common/PublicFooter'
import { inquiryApi, getAircraft, getYachts } from '../../services/api'

const DURATIONS = [
  { value: 'monthly',   label: 'Monthly',    desc: '1–2 months, flexible start' },
  { value: 'quarterly', label: 'Quarterly',  desc: '3-month committed program' },
  { value: 'annual',    label: 'Annual',     desc: '12-month dedicated access' },
  { value: 'multi_year',label: 'Multi-Year', desc: 'Longest-term cost efficiency' },
]

const BENEFITS_AIRCRAFT = [
  ['bi-calendar-check', 'Guaranteed availability every time you need to fly'],
  ['bi-cash-coin',      'Cost savings of 30–60% vs equivalent charter rates'],
  ['bi-star',           'Consistent aircraft, crew, and service standards'],
  ['bi-tools',          'Full maintenance, insurance, and crew management included'],
  ['bi-building',       'Ideal for executives flying 200+ hours per year'],
]

const BENEFITS_YACHT = [
  ['bi-anchor',       'Your yacht is always ready in your preferred home port'],
  ['bi-people',       'Dedicated crew who know your preferences intimately'],
  ['bi-calendar4',    'Priority scheduling, no blackout periods'],
  ['bi-cash-stack',   'Significant savings vs high-season charter rates'],
  ['bi-shield-check', 'All maintenance, insurance, and port fees handled'],
]

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Aircraft & Yacht Leasing – NairobiJetHouse',
  url: 'https://www.nairobijethouse.com/leasing',
  provider: { '@type': 'Organization', name: 'NairobiJetHouse' },
}

export default function Leasing() {
  const [assetType, setAssetType] = useState('aircraft')
  const [aircraft, setAircraft]   = useState([])
  const [yachts, setYachts]       = useState([])
  const [form, setForm] = useState({
    guest_name: '', guest_email: '', guest_phone: '', company: '',
    asset_type: 'aircraft', aircraft: '', yacht: '',
    lease_duration: 'annual', preferred_start_date: '',
    budget_range: '', usage_description: '', additional_notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError]     = useState('')

  useEffect(() => {
    getAircraft().then(d => setAircraft(d.results || d)).catch(() => {})
    getYachts().then(d => setYachts(d.results || d)).catch(() => {})
  }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const switchType = type => {
    setAssetType(type)
    set('asset_type', type)
    set('aircraft', '')
    set('yacht', '')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const r = await inquiryApi.leasing({
        ...form,
        aircraft: form.aircraft || undefined,
        yacht: form.yacht || undefined,
      })
      setSuccess(r.data)
    } catch {
      setError('Unable to submit your inquiry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const benefits = assetType === 'aircraft' ? BENEFITS_AIRCRAFT : BENEFITS_YACHT

  return (
    <>
      <Helmet>
        <title>Aircraft & Yacht Leasing | NairobiJetHouse</title>
        <meta name="description" content="Dedicated aircraft and yacht lease programs for frequent travellers and corporations. Guaranteed availability, consistent service, and significant cost efficiency." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/leasing" />
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
              <i className="bi bi-file-earmark-text" /> Long-Term Programs
            </span>
            <h1 style={{ color: 'var(--white)', marginTop: '0.35rem', marginBottom: '0.35rem', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
              Aircraft & Yacht <em style={{ color: 'var(--gold-light)' }}>Leasing</em>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', marginBottom: '1.1rem', maxWidth: 480 }}>
              For frequent travellers and corporations that demand guaranteed availability, consistent service,
              and significant cost efficiency — our dedicated lease programs deliver ownership-level access
              without ownership-level complexity.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {[['bi-calendar-check', 'Guaranteed Availability'], ['bi-cash-coin', '30–60% Cost Savings'], ['bi-shield-check', 'Fully Managed']].map(([icon, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--gold-light)', fontWeight: 600, fontSize: '0.9rem' }}>
                  <i className={`bi ${icon}`} /> {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why Lease ── */}
        <section style={{ background: 'var(--off-white)', padding: '3rem 0' }}>
          <div className="container">
            {/* Toggle */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
              {[['aircraft', 'bi-airplane', 'Aircraft Lease'], ['yacht', 'bi-water', 'Yacht Lease']].map(([type, icon, label]) => (
                <button key={type} onClick={() => switchType(type)}
                  className={assetType === type ? 'btn btn-navy' : 'btn btn-outline-navy'}>
                  <i className={`bi ${icon}`} /> {label}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'start' }}>
              {/* Left — benefits */}
              <div>
                <span className="eyebrow">Why Lease?</span>
                <h3 style={{ marginBottom: '1rem' }}>
                  {assetType === 'aircraft' ? 'Your Jet, Your Schedule' : 'Your Yacht, Always Ready'}
                </h3>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                  {assetType === 'aircraft'
                    ? 'Executives and corporate travel teams that fly more than 200 hours per year consistently find that a dedicated aircraft lease offers superior economics to ad-hoc charter — plus the peace of mind of knowing exactly which aircraft, crew, and service to expect every flight.'
                    : 'For those who charter the same region season after season, a dedicated yacht lease eliminates the uncertainty of availability during peak season, ensures you have a crew who knows your preferences intimately, and delivers substantial savings against summer charter rates.'}
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {benefits.map(([icon, text]) => (
                    <li key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--gray-600)' }}>
                      <i className={`bi ${icon}`} style={{ color: 'var(--gold)', marginTop: '0.15rem', flexShrink: 0 }} />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right — duration cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {DURATIONS.map(({ value, label, desc }) => (
                  <div key={value}
                    onClick={() => set('lease_duration', value)}
                    style={{
                      padding: '1rem 1.25rem',
                      border: `1.5px solid ${form.lease_duration === value ? 'var(--navy)' : 'var(--gray-100)'}`,
                      borderRadius: 'var(--radius)',
                      background: form.lease_duration === value ? 'rgba(26,42,58,0.06)' : 'var(--white)',
                      cursor: 'pointer', transition: 'all 0.15s',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.9rem', marginBottom: '0.15rem' }}>{label}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{desc}</div>
                    </div>
                    {form.lease_duration === value && (
                      <i className="bi bi-check-circle-fill" style={{ color: 'var(--navy)', fontSize: '1.1rem' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Form ── */}
        <section style={{ background: 'var(--off-white)', padding: '0 0 3rem' }}>
          <div className="container" style={{ maxWidth: 860 }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span className="eyebrow">Get in Touch</span>
              <h2 style={{ marginBottom: '0.5rem' }}>Submit a Lease <em>Inquiry</em></h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem' }}>
                Our leasing specialists will respond within 24 hours with a tailored program proposal.
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
                  <h4 style={{ marginBottom: '0.5rem' }}>Lease Inquiry Received</h4>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                    {success.message || 'Our leasing specialists will respond within 24 hours with a tailored program proposal.'}
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

                  <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label">Full Name <span className="req">*</span></label>
                      <input className="form-control" required value={form.guest_name} onChange={e => set('guest_name', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address <span className="req">*</span></label>
                      <input className="form-control" type="email" required value={form.guest_email} onChange={e => set('guest_email', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-control" value={form.guest_phone} onChange={e => set('guest_phone', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Company / Organisation <span className="req">*</span></label>
                      <input className="form-control" required value={form.company} onChange={e => set('company', e.target.value)} />
                    </div>
                  </div>

                  <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
                    <div className="form-group">
                      <label className="form-label">
                        {assetType === 'aircraft' ? 'Preferred Aircraft' : 'Preferred Vessel'}
                        <span style={{ fontWeight: 400, color: 'var(--gray-400)', marginLeft: 6 }}>(optional)</span>
                      </label>
                      <select className="form-control"
                        value={assetType === 'aircraft' ? form.aircraft : form.yacht}
                        onChange={e => set(assetType === 'aircraft' ? 'aircraft' : 'yacht', e.target.value)}>
                        <option value="">Recommend the best option for my needs</option>
                        {(assetType === 'aircraft' ? aircraft : yachts).map(item => (
                          <option key={item.id} value={item.id}>{item.name} — {item.category_display || item.size_display}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Preferred Start Date <span className="req">*</span></label>
                      <input className="form-control" type="date" required value={form.preferred_start_date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => set('preferred_start_date', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Budget Range</label>
                      <input className="form-control" value={form.budget_range} onChange={e => set('budget_range', e.target.value)} placeholder="e.g. $50K–$100K/month" />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Intended Usage <span className="req">*</span></label>
                    <textarea className="form-control" required style={{ minHeight: 90 }}
                      value={form.usage_description}
                      onChange={e => set('usage_description', e.target.value)}
                      placeholder={assetType === 'aircraft'
                        ? 'Describe your flight patterns — domestic, international, typical routes, estimated annual hours, number of passengers…'
                        : 'Describe your typical charter season — preferred cruising grounds, duration of use, typical party size, type of voyages…'} />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Additional Notes or Requirements</label>
                    <textarea className="form-control" style={{ minHeight: 80 }}
                      value={form.additional_notes}
                      onChange={e => set('additional_notes', e.target.value)}
                      placeholder="Specific cabin configurations, branding requirements, crew language preferences, special equipment…" />
                  </div>

                  <button type="submit" className="btn btn-navy" disabled={loading}
                    style={{ width: '100%', justifyContent: 'center' }}>
                    {loading
                      ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Submitting…</>
                      : <><i className="bi bi-send" /> Submit Lease Inquiry</>
                    }
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

      </div>

      <PublicFooter />

      <style>{`
        @media (max-width: 700px) {
          .leasing-why-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}