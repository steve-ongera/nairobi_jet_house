import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';

/* ─── SEO Structured Data ─────────────────────────────────────────────────── */
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'NairobiJetHouse',
  url: 'https://www.nairobijethouse.com',
  telephone: '+254724878136',
  email: 'nairobijethouse@gmail.com',
  sameAs: ['https://wa.me/254724878136'],
}

const SUBJECT_OPTIONS = [
  { value: 'general',     label: 'General Inquiry' },
  { value: 'support',     label: 'Customer Support' },
  { value: 'media',       label: 'Media & Press' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'careers',     label: 'Careers' },
  { value: 'other',       label: 'Other' },
]

const CONTACT_ITEMS = [
  { icon: 'bi-telephone-fill', label: 'Phone / WhatsApp', value: '+254 724 878 136',            href: 'tel:+254724878136',                 color: 'var(--gold)' },
  { icon: 'bi-envelope-fill',  label: 'General Email',    value: 'nairobijethouse@gmail.com',    href: 'mailto:nairobijethouse@gmail.com',  color: 'var(--navy)' },
  { icon: 'bi-people-fill',    label: 'Careers',          value: 'careers@nairobijethouse.com',  href: 'mailto:careers@nairobijethouse.com',color: 'var(--navy)' },
  { icon: 'bi-geo-alt-fill',   label: 'Offices',          value: 'Wilson Airport & JKIA, Nairobi', href: null,                            color: 'var(--navy)' },
]

/* ═══════════════════════════════════════════════════════════════════════════
   CONTACT PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function ContactPage() {
  const blank = () => ({ full_name: '', email: '', phone: '', company: '', subject: 'general', message: '' })
  const [form, setForm]       = useState(blank())
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError]     = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { inquiryApi } = await import('../../services/api')
      const r = await inquiryApi.contact(form)
      setSuccess(r.data)
    } catch {
      setError('Failed to send. Please try again or email us directly.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Contact Us | NairobiJetHouse</title>
        <meta name="description" content="Contact NairobiJetHouse 24/7. Offices at Wilson Airport and JKIA, Nairobi." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://www.nairobijethouse.com/contact" />
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
              <i className="bi bi-envelope" /> Get in Touch
            </span>
            <h1 style={{ color: 'var(--white)', marginTop: '0.35rem', marginBottom: '0.35rem', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)' }}>
              We're Here <em style={{ color: 'var(--gold-light)' }}>24 / 7</em>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.88rem', marginBottom: '1.1rem', maxWidth: 480 }}>
              Our concierge team operates 24 hours a day, 7 days a week. Whether you have a question,
              a request, or simply want to learn more — we're ready.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <a href="tel:+254724878136" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--gold-light)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>
                <i className="bi bi-telephone-fill" /> +254 724 878 136
              </a>
              <a href="mailto:nairobijethouse@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '0.9rem' }}>
                <i className="bi bi-envelope-fill" /> nairobijethouse@gmail.com
              </a>
              <a href="https://wa.me/254724878136" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', fontSize: '0.9rem' }}>
                <i className="bi bi-whatsapp" /> WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* ── Main ── */}
        <section style={{ background: 'var(--off-white)', padding: '3rem 0' }}>
          <div className="container">
            <div className="contact-grid">

              {/* Left — contact info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {CONTACT_ITEMS.map(({ icon, label, value, href }) => (
                  <div key={label} style={{
                    display: 'flex', alignItems: 'center', gap: '0.85rem',
                    padding: '0.85rem 1rem',
                    background: 'var(--white)',
                    border: '1px solid var(--gray-100)',
                    borderRadius: 'var(--radius)',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 'var(--radius)',
                      background: 'var(--gold-pale)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--gold-dark)', fontSize: '0.9rem', flexShrink: 0,
                    }}>
                      <i className={`bi ${icon}`} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--gold)', marginBottom: '0.1rem' }}>{label}</div>
                      {href
                        ? <a href={href} style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--navy)', textDecoration: 'none' }}>{value}</a>
                        : <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--navy)' }}>{value}</div>
                      }
                    </div>
                  </div>
                ))}

                {/* Availability badge */}
                <div style={{
                  marginTop: '0.5rem', padding: '0.75rem 1rem',
                  background: 'var(--navy)', borderRadius: 'var(--radius)',
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
                    Concierge available — response within 2 hrs
                  </span>
                </div>
              </div>

              {/* Right — form */}
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
                    <h4 style={{ marginBottom: '0.5rem' }}>Message Received</h4>
                    <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                      {success.message || 'Our team will respond within 24 hours.'}
                    </p>
                    {success.inquiry?.reference && (
                      <div style={{
                        background: 'var(--gray-50)', border: '1px solid var(--gray-200)',
                        borderRadius: 6, padding: '0.75rem 1rem', marginBottom: '1.25rem', textAlign: 'left',
                      }}>
                        <div style={{ fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.25rem' }}>Reference</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 700, color: 'var(--navy)' }}>
                          {String(success.inquiry.reference).slice(0, 16)}
                        </div>
                      </div>
                    )}
                    <button className="btn btn-navy btn-sm" onClick={() => setSuccess(null)}>
                      <i className="bi bi-arrow-counterclockwise" /> Send Another
                    </button>
                  </div>
                ) : (
                  <>
                    <h4 style={{ marginBottom: '0.25rem' }}>Send a Message</h4>
                    <p style={{ color: 'var(--gray-400)', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                      We'll get back to you within 24 hours.
                    </p>

                    {error && (
                      <div className="alert alert-error" style={{ marginBottom: '1rem', fontSize: '0.82rem' }}>
                        <i className="bi bi-exclamation-circle" /> {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit}>
                      <div className="form-grid" style={{ marginBottom: '0.85rem' }}>
                        <div className="form-group">
                          <label className="form-label">Full Name <span className="req">*</span></label>
                          <input className="form-control" required value={form.full_name}
                            onChange={e => set('full_name', e.target.value)} placeholder="Your full name" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Email <span className="req">*</span></label>
                          <input className="form-control" type="email" required value={form.email}
                            onChange={e => set('email', e.target.value)} placeholder="your@email.com" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Phone</label>
                          <input className="form-control" value={form.phone}
                            onChange={e => set('phone', e.target.value)} placeholder="+254 700 000 000" />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Company</label>
                          <input className="form-control" value={form.company}
                            onChange={e => set('company', e.target.value)} placeholder="Optional" />
                        </div>
                      </div>

                      <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                        <label className="form-label">Subject <span className="req">*</span></label>
                        <select className="form-control" value={form.subject} onChange={e => set('subject', e.target.value)}>
                          {SUBJECT_OPTIONS.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label">Message <span className="req">*</span></label>
                        <textarea
                          className="form-control"
                          required
                          style={{ minHeight: 100 }}
                          value={form.message}
                          onChange={e => set('message', e.target.value)}
                          placeholder="How can we help you?"
                        />
                      </div>

                      <button type="submit" className="btn btn-navy" disabled={loading}
                        style={{ width: '100%', justifyContent: 'center' }}>
                        {loading
                          ? <><span className="spinner" style={{ borderTopColor: 'white' }} /> Sending…</>
                          : <><i className="bi bi-send" /> Send Message</>
                        }
                      </button>
                    </form>
                  </>
                )}
              </div>

            </div>
          </div>
        </section>
      </div>

      <style>{`
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 2.5rem;
          align-items: start;
        }
        @media (max-width: 800px) {
          .contact-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <PublicFooter />
    </>
  )
}