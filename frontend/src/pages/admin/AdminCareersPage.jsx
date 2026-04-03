import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminCareersApi } from '../../services/api';

const DEPT_CHOICES = ['operations','commercial','charter','technical','concierge','finance','it','hr','marketing','management'];
const LOC_CHOICES  = ['nairobi','dubai','london','johannesburg','lagos','new_york','remote'];
const TYPE_CHOICES = ['full_time','part_time','contract','internship'];
const APP_STATUSES = ['received','reviewing','shortlisted','interview','offered','hired','rejected','withdrawn'];

export default function AdminCareersPage() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs]           = useState([]);
  const [applications, setApps]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [jobModal, setJobModal]   = useState(null);
  const [toast, setToast]         = useState('');

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadJobs = async () => {
    setLoading(true);
    try { const r = await adminCareersApi.jobs(); setJobs(r.data.results || r.data); }
    catch {} finally { setLoading(false); }
  };

  const loadApps = async () => {
    setLoading(true);
    try { const r = await adminCareersApi.applications(); setApps(r.data.results || r.data); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { activeTab === 'jobs' ? loadJobs() : loadApps(); }, [activeTab]);

  const deleteJob = async id => {
    if (!confirm('Delete this job posting?')) return;
    try { await adminCareersApi.deleteJob(id); showToast('Job deleted'); loadJobs(); }
    catch { showToast('Delete failed'); }
  };

  const updateAppStatus = async (id, status) => {
    try { await adminCareersApi.updateAppStatus(id, { status }); showToast('Status updated'); loadApps(); }
    catch { showToast('Update failed'); }
  };

  return (
    <AdminLayout title="Careers" breadcrumb="Careers Management">
      {toast && <div className="alert alert-success" style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 2000, minWidth: 260 }}><i className="bi bi-check-circle" />{toast}</div>}
      {jobModal !== null && <JobModal job={jobModal} onClose={() => setJobModal(null)} onSuccess={() => { setJobModal(null); showToast('Job saved'); loadJobs(); }} />}

      <div className="dash-header">
        <div className="dash-header-left"><h2>Careers Management</h2><p>Manage job postings and applications</p></div>
        {activeTab === 'jobs' && <button className="btn btn-gold btn-sm" onClick={() => setJobModal({})}><i className="bi bi-plus-lg" /> Post New Job</button>}
      </div>

      <div className="tab-nav">
        <button className={`tab-btn${activeTab === 'jobs' ? ' active' : ''}`} onClick={() => setActiveTab('jobs')}>
          <i className="bi bi-briefcase" /> Job Postings
          <span className="badge badge-navy" style={{ marginLeft: '0.5rem' }}>{jobs.length}</span>
        </button>
        <button className={`tab-btn${activeTab === 'apps' ? ' active' : ''}`} onClick={() => setActiveTab('apps')}>
          <i className="bi bi-person-lines-fill" /> Applications
          <span className="badge badge-gold" style={{ marginLeft: '0.5rem' }}>{applications.length}</span>
        </button>
      </div>

      {activeTab === 'jobs' && (
        <div className="table-card">
          <div className="table-scroll">
            <table>
              <thead><tr><th>Title</th><th>Department</th><th>Location</th><th>Type</th><th>Featured</th><th>Active</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={7} className="table-empty"><span className="spinner spinner-dark" /></td></tr>
                : jobs.length === 0 ? <tr><td colSpan={7} className="table-empty"><i className="bi bi-briefcase" />No jobs posted</td></tr>
                : jobs.map(j => (
                  <tr key={j.id}>
                    <td><div className="td-name">{j.title}</div>{j.salary_range && <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{j.salary_range}</div>}</td>
                    <td style={{ fontSize: '0.85rem' }}>{j.department_display || j.department}</td>
                    <td style={{ fontSize: '0.85rem' }}>{j.location_display || j.location}</td>
                    <td><span className="badge badge-navy">{j.job_type_display || j.job_type}</span></td>
                    <td>{j.is_featured ? <span className="badge badge-gold"><i className="bi bi-star-fill" /> Yes</span> : <span style={{ color: 'var(--gray-300)', fontSize: '0.8rem' }}>—</span>}</td>
                    <td><span className={`badge ${j.is_active ? 'badge-green' : 'badge-red'}`}>{j.is_active ? 'Active' : 'Closed'}</span></td>
                    <td>
                      <div className="td-actions">
                        <button className="btn btn-ghost btn-xs" onClick={() => setJobModal(j)}><i className="bi bi-pencil" /></button>
                        <button className="btn btn-red btn-xs" onClick={() => deleteJob(j.id)}><i className="bi bi-trash" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'apps' && (
        <div className="table-card">
          <div className="table-scroll">
            <table>
              <thead><tr><th>Applicant</th><th>Job</th><th>Experience</th><th>Status</th><th>Applied</th><th>Update</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={6} className="table-empty"><span className="spinner spinner-dark" /></td></tr>
                : applications.length === 0 ? <tr><td colSpan={6} className="table-empty"><i className="bi bi-people" />No applications yet</td></tr>
                : applications.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div className="td-name">{a.full_name}</div>
                      <div className="td-email">{a.email}</div>
                      {a.current_role && <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{a.current_role}</div>}
                    </td>
                    <td style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--navy)' }}>{a.job_title || '—'}</td>
                    <td style={{ fontSize: '0.85rem' }}>{a.years_experience} yrs</td>
                    <td><span className={`badge status-${a.status}`}>{a.status_display || a.status}</span></td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}</td>
                    <td>
                      <select className="form-control" style={{ width: 'auto', padding: '0.3rem 0.5rem', fontSize: '0.72rem' }} value={a.status} onChange={e => updateAppStatus(a.id, e.target.value)}>
                        {APP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function JobModal({ job, onClose, onSuccess }) {
  const isEdit = !!job?.id;
  const [form, setForm] = useState({
    title: job.title || '', department: job.department || 'operations',
    location: job.location || 'nairobi', job_type: job.job_type || 'full_time',
    description: job.description || '', requirements: job.requirements || '',
    benefits: job.benefits || '', salary_range: job.salary_range || '',
    deadline: job.deadline || '', is_active: job.is_active ?? true,
    is_featured: job.is_featured || false,
  });
  const [loading, setLoading] = useState(false);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) { await adminCareersApi.updateJob(job.id, form); }
      else { await adminCareersApi.createJob(form); }
      onSuccess();
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-xl" style={{ maxHeight: '92vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <div className="modal-title"><i className="bi bi-briefcase" /> {isEdit ? 'Edit' : 'Post New'} Job</div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="form-group">
              <label className="form-label">Job Title <span className="req">*</span></label>
              <input className="form-control" value={form.title} onChange={set('title')} required />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Department</label>
                <select className="form-control" value={form.department} onChange={set('department')}>
                  {DEPT_CHOICES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <select className="form-control" value={form.location} onChange={set('location')}>
                  {LOC_CHOICES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Job Type</label>
                <select className="form-control" value={form.job_type} onChange={set('job_type')}>
                  {TYPE_CHOICES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Salary Range</label>
                <input className="form-control" value={form.salary_range} onChange={set('salary_range')} placeholder="e.g. $60,000 – $90,000" />
              </div>
              <div className="form-group">
                <label className="form-label">Application Deadline</label>
                <input className="form-control" type="date" value={form.deadline} onChange={set('deadline')} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Job Description <span className="req">*</span></label>
              <textarea className="form-control" rows={6} value={form.description} onChange={set('description')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Requirements</label>
              <textarea className="form-control" rows={4} value={form.requirements} onChange={set('requirements')} />
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input type="checkbox" checked={form.is_active} onChange={set('is_active')} /> Active (visible to applicants)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem' }}>
                <input type="checkbox" checked={form.is_featured} onChange={set('is_featured')} /> Featured listing
              </label>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving…</> : <><i className="bi bi-check-lg" /> {isEdit ? 'Update' : 'Post'} Job</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}