import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', first_name: '', last_name: '', phone: '', company: '', password: '', password2: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setErrors({});
    try {
      const { authApi } = await import('../../services/api');
      await authApi.register(form);
      const user = await login(form.username, form.password);
      navigate(user.role === 'owner' ? '/owner' : '/member', { replace: true });
    } catch (err) {
      setErrors(err.response?.data || { non_field_errors: ['Registration failed. Please check your details.'] });
    } finally {
      setLoading(false);
    }
  };

  const fe = k => errors[k]?.[0] || '';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 680, background: 'var(--white)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, var(--navy-deep), var(--navy-mid))', padding: '2.5rem 2.5rem 2rem' }}>
          <Link to="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 600, color: 'var(--white)', textDecoration: 'none' }}>
            Nairobi<span style={{ color: 'var(--gold)' }}>Jet</span>House
          </Link>
          <h2 style={{ color: 'var(--white)', marginTop: '1.25rem', marginBottom: '0.35rem' }}>Create your account</h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.875rem' }}>Join Africa's premier private aviation platform</p>
        </div>

        <div style={{ padding: '2rem 2.5rem 2.5rem' }}>
          {(errors.non_field_errors || errors.detail) && (
            <div className="alert alert-error">
              <i className="bi bi-exclamation-circle" />
              {errors.non_field_errors?.[0] || errors.detail}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">First Name <span className="req">*</span></label>
                <input className={`form-control${fe('first_name') ? ' error' : ''}`} value={form.first_name} onChange={set('first_name')} placeholder="Jane" required />
                {fe('first_name') && <span className="form-error">{fe('first_name')}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input className="form-control" value={form.last_name} onChange={set('last_name')} placeholder="Odhiambo" />
              </div>
              <div className="form-group">
                <label className="form-label">Username <span className="req">*</span></label>
                <input className={`form-control${fe('username') ? ' error' : ''}`} value={form.username} onChange={set('username')} placeholder="jane.odhiambo" required />
                {fe('username') && <span className="form-error">{fe('username')}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Email Address <span className="req">*</span></label>
                <input className={`form-control${fe('email') ? ' error' : ''}`} type="email" value={form.email} onChange={set('email')} placeholder="jane@example.com" required />
                {fe('email') && <span className="form-error">{fe('email')}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-control" value={form.phone} onChange={set('phone')} placeholder="+254 700 000 000" />
              </div>
              <div className="form-group">
                <label className="form-label">Company / Organisation</label>
                <input className="form-control" value={form.company} onChange={set('company')} placeholder="Acme Corp" />
              </div>
              <div className="form-group">
                <label className="form-label">Password <span className="req">*</span></label>
                <input className={`form-control${fe('password') ? ' error' : ''}`} type="password" value={form.password} onChange={set('password')} placeholder="Min. 8 characters" required />
                {fe('password') && <span className="form-error">{fe('password')}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password <span className="req">*</span></label>
                <input className={`form-control${fe('password2') ? ' error' : ''}`} type="password" value={form.password2} onChange={set('password2')} placeholder="Repeat password" required />
                {fe('password2') && <span className="form-error">{fe('password2')}</span>}
              </div>
            </div>

            <div style={{ background: 'var(--gold-pale)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 'var(--radius)', padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--gold-dark)', marginBottom: '1.5rem' }}>
              <i className="bi bi-info-circle" style={{ marginRight: '0.5rem' }} />
              Accounts default to <strong>Membership Client</strong> role. Contact us to register as a Fleet Owner.
            </div>

            <button type="submit" className="btn btn-navy btn-full" style={{ padding: '0.9rem' }} disabled={loading}>
              {loading ? <><span className="spinner" /> Creating account…</> : <><i className="bi bi-person-plus" /> Create Account</>}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--gray-400)' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--gold)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}