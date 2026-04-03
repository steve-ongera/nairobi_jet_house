import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { careersApi } from '../../services/api';

export default function CareersApplyPage() {
  const { id } = useParams();
  const [job, setJob]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors]  = useState({});
  const [form, setForm]      = useState({
    full_name: '', email: '', phone: '', nationality: '',
    current_role: '', linkedin_url: '', portfolio_url: '',
    years_experience: 0, cover_letter: '', resume_url: '',
  });

  useEffect(() => {
    careersApi.detail(id)
      .then(r => { setJob(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true); setErrors({});
    try {
      const r = await careersApi.apply({ ...form, job: id, years_experience: Number(form.years_experience) });
      setSuccess(r.data);
    } catch (err) {
      setErrors(err.response?.data || { non_field_errors: ['Submission failed. You may have already applied for this role.'] });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-loader"><span className="spinner-ring" /></div>;

  if (success) {
    return (
      <>
        <PublicNavbar />
        <div style={{ paddingTop: 'var(--navbar-h)', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
          <div className="container">
            <div className="success-wrap">
              <div className="success-icon"><i className="bi bi-check-lg" /></div>
              <h2>Application Submitted!</h2>
              <p style={{ marginTop: '0.75rem' }}>{success.message}</p>
              <div className="ref-box">
                <div className="ref-label">Application Reference</div>
                <div className="ref-value">{success.reference}</div>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--gray-400)' }}>
                Applied for: <strong>{success.job_title}</strong>
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
                <Link to="/careers" className="btn btn-navy">View More Roles</Link>
                <Link to="/" className="btn btn-ghost">Return Home</Link>
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
          <Link to="/careers" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.84rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '1rem' }}>
            <i className="bi bi-arrow-left" /> Back to Careers
          </Link>
          <span className="eyebrow">{job?.department_display || 'Careers'}</span>
          <h1>{job?.title || 'Apply'}</h1>
          {job && (
            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <i className="bi bi-geo-alt" style={{ color: 'var(--gold)' }} />{job.location_display}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <i className="bi bi-briefcase" style={{ color: 'var(--gold)' }} />{job.job_type_display}
              </span>
              {job.salary_range && (
                <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <i className="bi bi-cash" style={{ color: 'var(--gold)' }} />{job.salary_range}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2.5rem', alignItems: 'start' }}>
            {/* Form */}
            <form onSubmit={handleSubmit}>
              {(errors.non_field_errors || errors.detail) && (
                <div className="alert alert-error">
                  <i className="bi bi-exclamation-circle" />
                  {errors.non_field_errors?.[0] || errors.detail}
                </div>
              )}

              <div className="detail-card mb-4">
                <div className="detail-card-header">
                  <div className="detail-card-title"><i className="bi bi-person" /> Personal Information</div>
                </div>
                <div className="detail-card-body">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Full Name <span className="req">*</span></label>
                      <input className="form-control" value={form.full_name} onChange={set('full_name')} placeholder="Jane Odhiambo" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address <span className="req">*</span></label>
                      <input className="form-control" type="email" value={form.email} onChange={set('email')} placeholder="jane@example.com" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input className="form-control" value={form.phone} onChange={set('phone')} placeholder="+254 700 000 000" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Nationality</label>
                      <input className="form-control" value={form.nationality} onChange={set('nationality')} placeholder="Kenyan" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Current Role / Title</label>
                      <input className="form-control" value={form.current_role} onChange={set('current_role')} placeholder="Senior Charter Coordinator" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Years of Experience</label>
                      <input className="form-control" type="number" min="0" max="50" value={form.years_experience} onChange={set('years_experience')} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">LinkedIn Profile URL</label>
                      <input className="form-control" type="url" value={form.linkedin_url} onChange={set('linkedin_url')} placeholder="https://linkedin.com/in/…" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Portfolio / Website URL</label>
                      <input className="form-control" type="url" value={form.portfolio_url} onChange={set('portfolio_url')} placeholder="https://yoursite.com" />
                    </div>
                    <div className="form-group form-full">
                      <label className="form-label">CV / Resume URL</label>
                      <input className="form-control" type="url" value={form.resume_url} onChange={set('resume_url')} placeholder="Link to Google Drive, Dropbox, or personal site" />
                      <span className="form-hint">Upload your CV to a cloud service and paste the link here.</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-card mb-4">
                <div className="detail-card-header">
                  <div className="detail-card-title"><i className="bi bi-chat-text" /> Cover Letter <span style={{ fontSize: '0.75rem', color: 'var(--gray-400)', fontWeight: 400, marginLeft: '0.5rem' }}>Required</span></div>
                </div>
                <div className="detail-card-body">
                  <div className="form-group">
                    <textarea
                      className="form-control"
                      rows={8}
                      value={form.cover_letter}
                      onChange={set('cover_letter')}
                      placeholder="Tell us why you are the perfect fit for this role. Include relevant experience, your passion for aviation, and what you would bring to NairobiJetHouse…"
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <Link to="/careers" className="btn btn-ghost">Cancel</Link>
                <button type="submit" className="btn btn-gold btn-lg" disabled={submitting}>
                  {submitting ? <><span className="spinner" /> Submitting…</> : <><i className="bi bi-send" /> Submit Application</>}
                </button>
              </div>
            </form>

            {/* Sidebar info */}
            <div>
              {job && (
                <div className="detail-card mb-3">
                  <div className="detail-card-header">
                    <div className="detail-card-title"><i className="bi bi-briefcase" /> Role Details</div>
                  </div>
                  <div className="detail-card-body">
                    <div className="detail-row"><span className="detail-key">Department</span><span className="detail-val">{job.department_display}</span></div>
                    <div className="detail-row"><span className="detail-key">Location</span><span className="detail-val">{job.location_display}</span></div>
                    <div className="detail-row"><span className="detail-key">Type</span><span className="detail-val">{job.job_type_display}</span></div>
                    {job.salary_range && <div className="detail-row"><span className="detail-key">Salary</span><span className="detail-val">{job.salary_range}</span></div>}
                    {job.deadline && <div className="detail-row"><span className="detail-key">Deadline</span><span className="detail-val">{new Date(job.deadline).toLocaleDateString()}</span></div>}
                  </div>
                </div>
              )}

              <div className="detail-card">
                <div className="detail-card-body">
                  <h5 style={{ marginBottom: '0.75rem' }}>What to expect</h5>
                  {['Application reviewed within 5 business days', 'Video or in-person interview', 'Technical / skills assessment if required', 'Offer & onboarding within 2 weeks'].map(s => (
                    <div key={s} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--gray-500)', marginBottom: '0.5rem' }}>
                      <i className="bi bi-check-circle" style={{ color: 'var(--green)', marginTop: '2px', flexShrink: 0 }} />{s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <PublicFooter />
    </>
  );
}