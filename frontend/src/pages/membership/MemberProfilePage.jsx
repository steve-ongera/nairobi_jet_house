// MemberProfilePage.jsx
import React, { useState } from 'react';
import MemberLayout from '../../components/membership/MemberLayout';
import { useAuth } from '../../App';

export function MemberProfilePage() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    company: user?.company || '',
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [toastType, setToastType] = useState('success');
  const [activeTab, setActiveTab] = useState('profile');

  const showToast = (msg, type = 'success') => {
    setToast(msg); setToastType(type);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true);
    try {
      const { authApi } = await import('../../services/api');
      await authApi.updateProfile(form);
      showToast('Profile updated successfully');
    } catch {
      showToast('Failed to update profile. Please try again.', 'error');
    } finally {
      setLoading(false); }
  };

  const initials = [user?.first_name, user?.last_name]
    .filter(Boolean).map(n => n[0]).join('').toUpperCase() || user?.username?.slice(0, 2).toUpperCase() || 'ME';

  return (
    <MemberLayout title="Profile" breadcrumb="My Profile">
      {/* Toast */}
      {toast && (
        <div className={`alert ${toastType === 'success' ? 'alert-success' : 'alert-error'}`}
          style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 2000, minWidth: 280, boxShadow: '0 8px 32px rgba(0,0,0,0.15)', animation: 'fadeIn 0.2s ease' }}>
          <i className={`bi ${toastType === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`} />
          {toast}
        </div>
      )}

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* ── Left: Avatar card ─────────────────────────────────────────────── */}
        <div style={{ width: 260, flexShrink: 0 }}>
          <div className="detail-card" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
            {/* Avatar */}
            <div style={{ position: 'relative', width: 90, height: 90, margin: '0 auto 1.25rem' }}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--gold)' }} />
              ) : (
                <div style={{
                  width: 90, height: 90, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--navy-deep), var(--navy-mid))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '3px solid var(--gold)',
                  fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--gold)',
                }}>
                  {initials}
                </div>
              )}
            </div>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '0.2rem' }}>
              {[user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1rem' }}>
              {user?.email}
            </div>

            {/* Membership badge */}
            {user?.membership_tier && (
              <div style={{
                display: 'inline-block', padding: '0.35rem 1rem',
                background: 'linear-gradient(135deg, var(--navy-deep), var(--navy-mid))',
                borderRadius: 20, fontSize: '0.72rem', fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold)',
                marginBottom: '1.5rem',
              }}>
                {user.membership_tier}
              </div>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid var(--gray-100)', margin: '1.25rem 0' }} />

            {/* Info items */}
            {[
              { icon: 'bi-person-badge', label: 'Username', val: user?.username },
              { icon: 'bi-telephone', label: 'Phone', val: user?.phone || '—' },
              { icon: 'bi-building', label: 'Company', val: user?.company || '—' },
            ].map(({ icon, label, val }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem', textAlign: 'left' }}>
                <i className={`bi ${icon}`} style={{ color: 'var(--gold)', fontSize: '0.85rem', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--navy)', fontWeight: 500 }}>{val}</div>
                </div>
              </div>
            ))}

            <hr style={{ border: 'none', borderTop: '1px solid var(--gray-100)', margin: '1.25rem 0' }} />
            <button onClick={logout} className="btn btn-ghost btn-sm" style={{ width: '100%', color: '#ef4444', borderColor: '#fecaca' }}>
              <i className="bi bi-box-arrow-right" style={{ marginRight: '0.4rem' }} /> Sign Out
            </button>
          </div>
        </div>

        {/* ── Right: Tabs ───────────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Tab nav */}
          <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--gray-100)', marginBottom: '1.5rem' }}>
            {[
              { id: 'profile', label: 'Personal Details', icon: 'bi-person' },
              { id: 'security', label: 'Security', icon: 'bi-shield-lock' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: '0.65rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem',
                  color: activeTab === t.id ? 'var(--navy)' : 'var(--gray-400)',
                  borderBottom: `2px solid ${activeTab === t.id ? 'var(--gold)' : 'transparent'}`,
                  marginBottom: -2, transition: 'all 0.15s',
                }}
              >
                <i className={`bi ${t.icon}`} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Profile tab */}
          {activeTab === 'profile' && (
            <div className="detail-card">
              <div className="detail-card-header">
                <div className="detail-card-title">
                  <i className="bi bi-person-circle" /> Personal Information
                </div>
              </div>
              <div className="detail-card-body">
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input className="form-control" value={form.first_name}
                        onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input className="form-control" value={form.last_name}
                        onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone</label>
                      <input className="form-control" value={form.phone} placeholder="+254 700 000 000"
                        onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Company</label>
                      <input className="form-control" value={form.company} placeholder="Optional"
                        onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-control" value={user?.email} disabled
                      style={{ background: 'var(--gray-50)', cursor: 'not-allowed' }} />
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.35rem' }}>
                      <i className="bi bi-lock-fill" style={{ marginRight: '0.3rem' }} />
                      Email cannot be changed. Contact support if needed.
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" className="btn btn-navy" disabled={loading}>
                      {loading ? <><span className="spinner" style={{ marginRight: '0.4rem' }} /> Saving…</> : <><i className="bi bi-check-lg" style={{ marginRight: '0.4rem' }} /> Save Changes</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Security tab */}
          {activeTab === 'security' && (
            <div className="detail-card">
              <div className="detail-card-header">
                <div className="detail-card-title">
                  <i className="bi bi-shield-lock" /> Security Settings
                </div>
              </div>
              <div className="detail-card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ padding: '1rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <i className="bi bi-shield-check-fill" style={{ color: '#16a34a', fontSize: '1.2rem', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#15803d', marginBottom: '0.15rem' }}>Account Secured</div>
                    <div style={{ fontSize: '0.8rem', color: '#16a34a' }}>Your account is protected with a strong password.</div>
                  </div>
                </div>
                <div>
                  <label className="form-label">Current Password</label>
                  <input className="form-control" type="password" placeholder="••••••••" />
                </div>
                <div className="form-grid">
                  <div>
                    <label className="form-label">New Password</label>
                    <input className="form-control" type="password" placeholder="Min 8 characters" />
                  </div>
                  <div>
                    <label className="form-label">Confirm New Password</label>
                    <input className="form-control" type="password" placeholder="Repeat password" />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-navy">
                    <i className="bi bi-lock-fill" style={{ marginRight: '0.4rem' }} /> Update Password
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MemberLayout>
  );
}

export default MemberProfilePage;