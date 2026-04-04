// src/pages/normal/GroupCharter.jsx
import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import PublicNavbar from '../../components/common/PublicNavbar'
import PublicFooter from '../../components/common/PublicFooter'
import { inquiryApi } from '../../services/api'

const GROUP_TYPES = [
  { value: 'corporate',     label: 'Corporate / Business',    icon: 'bi-briefcase' },
  { value: 'sports_team',   label: 'Sports Team',             icon: 'bi-trophy' },
  { value: 'entertainment', label: 'Entertainment / Film',    icon: 'bi-camera-video' },
  { value: 'incentive',     label: 'Incentive Group',         icon: 'bi-star' },
  { value: 'wedding',       label: 'Wedding Party',           icon: 'bi-heart' },
  { value: 'government',    label: 'Government / Diplomatic', icon: 'bi-building' },
  { value: 'other',         label: 'Other',                   icon: 'bi-three-dots' },
]

const AIRCRAFT_CATEGORIES = [
  { value: '',              label: 'No Preference' },
  { value: 'light',         label: 'Light Jet (up to 8 pax)' },
  { value: 'midsize',       label: 'Midsize Jet (up to 9 pax)' },
  { value: 'super_midsize', label: 'Super Midsize (up to 10 pax)' },
  { value: 'heavy',         label: 'Heavy Jet (up to 16 pax)' },
  { value: 'ultra_long',    label: 'Ultra Long Range (up to 19 pax)' },
  { value: 'vip_airliner',  label: 'VIP Airliner (20+ pax)' },
]

const FEATURES = [
  { icon: 'bi-people-fill',    title: 'Any Group Size',          desc: 'From 10 to 500+ passengers. We configure multiple aircraft or a single VIP airliner to match your exact requirements.' },
  { icon: 'bi-calendar-check', title: 'Coordinated Scheduling',  desc: 'Complex multi-leg, multi-aircraft operations handled seamlessly. Your entire group departs and arrives together.' },
  { icon: 'bi-cup-hot',        title: 'Custom Catering',         desc: 'Bespoke menus curated by executive chefs. Dietary requirements, branded packaging, and in-flight entertainment all arranged.' },
  { icon: 'bi-car-front',      title: 'Ground Logistics',        desc: 'End-to-end ground transport, lounge access, and hotel coordination. One point of contact manages everything.' },
]

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Group Charter – NairobiJetHouse',
  url: 'https://www.nairobijethouse.com/group-charter',
  provider: { '@type': 'Organization', name: 'NairobiJetHouse' },
}

export default function GroupCharter() {
  const blank = () => ({
    contact_name: '', email: '', phone: '', company: '',
    group_type: 'corporate', group_size: 20,
    origin_description: '', destination_description: '',
    departure_date: '', return_date: '', is_round_trip: false,
    preferred_aircraft_category: '',
    catering_required: false, ground_transport_required: false,
    budget_range: '', additional_notes: '',
  })

  const [form, setForm]       = useState(blank())
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError]     = useState('')

  const set   = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const reset = ()     => { setForm(blank()); setSuccess(null); setError('') }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const groupSize = parseInt(form.group_size)
      const payload = {
        ...form,
        group_size: isNaN(groupSize) ? 1 : groupSize,
        departure_date: form.departure_date || null,
        return_date: form.return_date || null,
      }
      const r = await inquiryApi.groupCharter(payload)
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
        <title>Group Charter | NairobiJetHouse</title>
        <meta name="description" content="Move your entire group effortlessly. Sports teams, corporate delegations, wedding parties, film crews — group air travel managed with military precision." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/group-charter" />
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
              <i className="bi bi-people" /> Group Charter
            </span>
            <h1 style={{ color: 'var(--white)', marginTop: '0.35rem', marginBottom: '0.35rem', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
              Move Your Entire Group, <em style={{ color: 'var(--gold-light)' }}>Effortlessly</em>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', marginBottom: '1.1rem', maxWidth: 480 }}>
              Sports teams, corporate delegations, wedding parties, film crews — we manage group air travel
              of every size and type, with military precision and luxury-grade service.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              {[['bi-people', 'Any Group Size'], ['bi-calendar-check', 'Coordinated Scheduling'], ['bi-award', 'Luxury Service']].map(([icon, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--gold-light)', fontWeight: 600, fontSize: '0.9rem' }}>
                  <i className={`bi ${icon}`} /> {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section style={{ background: 'var(--off-white)', padding: '3rem 0' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
              {FEATURES.map(({ icon, title, desc }) => (
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
              <span className="eyebrow">Request a Quote</span>
              <h2 style={{ marginBottom: '0.5rem' }}>Tell Us About Your <em>Group</em></h2>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem' }}>
                Fill in the details and our group charter team will respond within 4 hours with aircraft options and pricing.
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
                  <h4 style={{ marginBottom: '0.5rem' }}>Group Charter Request Received</h4>
                  <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                    {success.message || 'Our group charter specialists will contact you within 4 hours with a tailored solution.'}
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
                  <button className="btn btn-navy btn-sm" onClick={reset}>
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

                  {/* Group Type */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ marginBottom: '0.6rem', display: 'block' }}>
                      <i className="bi bi-people" style={{ color: 'var(--gold)' }} /> Group Type <span className="req">*</span>
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {GROUP_TYPES.map(({ value, label, icon }) => (
                        <button key={value} type="button" onClick={() => set('group_type', value)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '0.4rem 0.9rem', fontSize: '0.79rem', fontWeight: 500, borderRadius: 20,
                            border: `1.5px solid ${form.group_type === value ? 'var(--navy)' : 'var(--gray-200)'}`,
                            background: form.group_type === value ? 'var(--navy)' : 'transparent',
                            color: form.group_type === value ? 'white' : 'var(--gray-600)',
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
                      <label className="form-label">Company / Organisation</label>
                      <input className="form-control" value={form.company} onChange={e => set('company', e.target.value)} />
                    </div>
                  </div>

                  {/* Flight Details */}
                  <div className="form-grid" style={{ marginBottom: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label">Origin <span className="req">*</span></label>
                      <input className="form-control" required value={form.origin_description} onChange={e => set('origin_description', e.target.value)} placeholder="e.g. Nairobi (NBO/WIL)" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Destination <span className="req">*</span></label>
                      <input className="form-control" required value={form.destination_description} onChange={e => set('destination_description', e.target.value)} placeholder="e.g. London (LHR)" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Group Size <span className="req">*</span></label>
                      <input className="form-control" type="number" min={2} required
                        value={form.group_size ?? ''}
                        onChange={e => { const v = parseInt(e.target.value); set('group_size', isNaN(v) ? '' : v) }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Departure Date</label>
                      <input className="form-control" type="date" value={form.departure_date} min={new Date().toISOString().split('T')[0]} onChange={e => set('departure_date', e.target.value)} />
                    </div>
                  </div>

                  {/* Round Trip */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                    {[['one_way', 'One Way'], ['round_trip', 'Round Trip']].map(([v, l]) => (
                      <button key={v} type="button"
                        onClick={() => set('is_round_trip', v === 'round_trip')}
                        style={{
                          padding: '0.35rem 0.85rem', fontSize: '0.76rem', fontWeight: 500, borderRadius: 20,
                          border: `1.5px solid ${(v === 'round_trip') === form.is_round_trip ? 'var(--navy)' : 'var(--gray-200)'}`,
                          background: (v === 'round_trip') === form.is_round_trip ? 'var(--navy)' : 'transparent',
                          color: (v === 'round_trip') === form.is_round_trip ? 'white' : 'var(--gray-600)',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}>
                        {l}
                      </button>
                    ))}
                  </div>

                  {form.is_round_trip && (
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Return Date</label>
                      <input className="form-control" type="date" value={form.return_date}
                        min={form.departure_date || new Date().toISOString().split('T')[0]}
                        onChange={e => set('return_date', e.target.value)} />
                    </div>
                  )}

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Preferred Aircraft Category</label>
                    <select className="form-control" value={form.preferred_aircraft_category} onChange={e => set('preferred_aircraft_category', e.target.value)}>
                      {AIRCRAFT_CATEGORIES.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </div>

                  {/* Add-ons */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label" style={{ marginBottom: '0.6rem', display: 'block' }}>
                      <i className="bi bi-stars" style={{ color: 'var(--gold)' }} /> Add-ons & Services
                    </label>
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                      {[
                        ['catering_required',          'bi-cup-hot',  'Catering Package'],
                        ['ground_transport_required',  'bi-car-front','Ground Transport'],
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

                  <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                    <label className="form-label">Estimated Budget</label>
                    <input className="form-control" value={form.budget_range} onChange={e => set('budget_range', e.target.value)} placeholder="e.g. $100,000 – $250,000" />
                  </div>

                  <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                    <label className="form-label">Additional Notes</label>
                    <textarea className="form-control" style={{ minHeight: 80 }}
                      value={form.additional_notes}
                      onChange={e => set('additional_notes', e.target.value)}
                      placeholder="Special requirements, VIP passengers, security considerations, branding…" />
                  </div>

                  <button type="submit" className="btn btn-navy" disabled={loading}
                    style={{ width: '100%', justifyContent: 'center' }}>
                    {loading
                      ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Submitting…</>
                      : <><i className="bi bi-send" /> Submit Group Charter Inquiry</>
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