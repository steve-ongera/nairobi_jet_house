import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../App';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const roleRedirect = (role) => {
    if (from && !from.startsWith('/login') && !from.startsWith('/register')) return from;
    const map = { admin: '/admin', staff: '/staff', client: '/member', owner: '/owner' };
    return map[role] || '/';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await login(form.username, form.password);
      navigate(roleRedirect(user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.non_field_errors?.[0] || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--surface)' }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', maxWidth: 520,
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '2.5rem', textDecoration: 'none' }}>
            Nairobi<span style={{ color: 'var(--gold)' }}>Jet</span>House
          </Link>

          <h2 style={{ marginBottom: '0.35rem' }}>Welcome back</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-400)', marginBottom: '2rem' }}>
            Sign in to your account to continue
          </p>

          {error && (
            <div className="alert alert-error">
              <i className="bi bi-exclamation-circle" />{error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Username <span className="req">*</span></label>
              <input
                className="form-control"
                type="text"
                placeholder="your.username"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                required autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password <span className="req">*</span></label>
              <input
                className="form-control"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
            </div>
            <button type="submit" className="btn btn-navy btn-full" style={{ marginTop: '0.5rem', padding: '0.85rem' }} disabled={loading}>
              {loading ? <><span className="spinner" /> Signing in…</> : <><i className="bi bi-box-arrow-in-right" /> Sign In</>}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-400)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--gold)', fontWeight: 600 }}>Create one</Link>
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-300)', marginTop: '0.5rem' }}>
              <Link to="/track" style={{ color: 'var(--gray-400)' }}>Track a booking without signing in →</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(160deg, var(--navy-deep) 0%, var(--navy) 50%, var(--navy-mid) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '3rem', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: '-10%', bottom: '-15%', width: '70%', paddingBottom: '70%', borderRadius: '50%', border: '1px solid rgba(201,168,76,0.1)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 420 }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>✈️</div>
          <h3 style={{ color: 'var(--white)', marginBottom: '1rem' }}>Intercontinental. <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Effortless.</span></h3>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem', lineHeight: 1.8 }}>
            Access your private aviation dashboard, manage bookings, track flights and
            communicate with your dedicated concierge team.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '2.5rem' }}>
            {[
              { icon: 'bi-airplane', label: 'Book Flights' },
              { icon: 'bi-anchor', label: 'Charter Yachts' },
              { icon: 'bi-graph-up', label: 'Track Revenue' },
              { icon: 'bi-headset', label: '24/7 Support' },
            ].map(f => (
              <div key={f.label} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius)', padding: '1rem', textAlign: 'center' }}>
                <i className={`bi ${f.icon}`} style={{ fontSize: '1.35rem', color: 'var(--gold)', display: 'block', marginBottom: '0.5rem' }} />
                <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}