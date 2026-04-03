import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../../components/common/PublicNavbar';
import PublicFooter from '../../components/common/PublicFooter';
import { careersApi } from '../../services/api';

const DEPTS = ['All', 'operations', 'commercial', 'charter', 'technical', 'concierge', 'finance', 'it', 'hr', 'marketing', 'management'];
const DEPT_LABELS = { operations: 'Flight Ops', commercial: 'Commercial', charter: 'Charter', technical: 'Technical', concierge: 'Concierge', finance: 'Finance', it: 'Technology', hr: 'HR', marketing: 'Marketing', management: 'Management' };

export default function CareersPage() {
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [dept, setDept]       = useState('All');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    careersApi.list().then(r => {
      setJobs(r.data.results || r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(j => {
    const matchDept = dept === 'All' || j.department === dept;
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.department?.toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  const typeColor = t => ({ full_time: 'badge-green', part_time: 'badge-navy', contract: 'badge-amber', internship: 'badge-gray' }[t] || 'badge-gray');

  return (
    <>
      <PublicNavbar />
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Join Our Team</span>
          <h1>Build the Future of<br /><span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>African Aviation</span></h1>
          <div className="gold-rule" style={{ margin: '1rem 0' }} />
          <p style={{ maxWidth: 560, color: 'rgba(255,255,255,0.62)' }}>
            We are a fast-growing intercontinental aviation platform headquartered in Nairobi
            with operations across Africa, the Middle East and Europe. Join a team that is
            redefining luxury travel.
          </p>
        </div>
      </div>

      {/* Culture section */}
      <section className="section-sm section-surface">
        <div className="container">
          <div className="grid-4">
            {[
              { icon: 'bi-globe', title: 'Global Operations', desc: 'Work across 4 continents' },
              { icon: 'bi-graph-up', title: 'Rapid Growth', desc: 'Scale with us as we expand' },
              { icon: 'bi-airplane', title: 'Aviation Passion', desc: 'Join a team that loves to fly' },
              { icon: 'bi-people', title: 'Diverse Team', desc: '20+ nationalities represented' },
            ].map(c => (
              <div key={c.title} style={{ textAlign: 'center', padding: '1rem' }}>
                <i className={`bi ${c.icon}`} style={{ fontSize: '1.8rem', color: 'var(--gold)', display: 'block', marginBottom: '0.75rem' }} />
                <div style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: '0.25rem' }}>{c.title}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job listings */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="search-wrap" style={{ flex: 1, minWidth: 220 }}>
              <i className="bi bi-search" />
              <input className="form-control search-input" placeholder="Search roles…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div className="filter-bar" style={{ margin: 0 }}>
              {DEPTS.slice(0, 7).map(d => (
                <button key={d} className={`pill${dept === d ? ' active' : ''}`} onClick={() => setDept(d)}>
                  {d === 'All' ? 'All Departments' : DEPT_LABELS[d] || d}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--gray-400)' }}>
              <span className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--gray-400)' }}>
              <i className="bi bi-briefcase" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }} />
              <p>No open positions match your search. Check back soon!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filtered.map(job => (
                <div key={job.id} className={`job-card${job.is_featured ? ' featured' : ''}`}>
                  <div className="job-header">
                    <div>
                      <div className="job-dept">{DEPT_LABELS[job.department] || job.department}</div>
                      <div className="job-title">{job.title}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                      {job.is_featured && <span className="badge badge-gold"><i className="bi bi-star-fill" /> Featured</span>}
                      <span className={`badge ${typeColor(job.job_type)}`}>{job.job_type_display || job.job_type?.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="job-meta">
                    <div className="job-meta-item"><i className="bi bi-geo-alt" />{job.location_display || job.location}</div>
                    <div className="job-meta-item"><i className="bi bi-briefcase" />{job.department_display || job.department}</div>
                    {job.salary_range && <div className="job-meta-item"><i className="bi bi-cash" />{job.salary_range}</div>}
                    {job.deadline && <div className="job-meta-item"><i className="bi bi-calendar" />Apply by {new Date(job.deadline).toLocaleDateString()}</div>}
                  </div>
                  {job.description && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)', lineHeight: 1.7, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {job.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Link to={`/careers/${job.id}/apply`} className="btn btn-navy btn-sm">
                      <i className="bi bi-send" /> Apply Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Speculative application */}
          <div style={{
            marginTop: '3rem',
            background: 'linear-gradient(135deg, var(--navy-deep), var(--navy-mid))',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
            textAlign: 'center',
          }}>
            <i className="bi bi-envelope-open" style={{ fontSize: '2rem', color: 'var(--gold)', display: 'block', marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--white)', marginBottom: '0.65rem' }}>Don't see the right role?</h3>
            <p style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 480, margin: '0 auto 1.5rem' }}>
              We're always looking for exceptional talent. Send us your CV and we'll reach out
              when the perfect opportunity arises.
            </p>
            <a href="mailto:careers@nairobijethouse.com" className="btn btn-gold">
              <i className="bi bi-envelope" /> careers@nairobijethouse.com
            </a>
          </div>
        </div>
      </section>
      <PublicFooter />
    </>
  );
}