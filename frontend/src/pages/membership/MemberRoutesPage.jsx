// MemberRoutesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MemberLayout from '../../components/membership/MemberLayout';
import { memberApi } from '../../services/api';

export function MemberRoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', origin: '', destination: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState('');
  const [formError, setFormError] = useState('');

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2800); };

  const load = () => {
    memberApi.savedRoutes()
      .then(r => { setRoutes(r.data.results || r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const save = async e => {
    e.preventDefault(); setFormError('');
    if (!form.name.trim()) { setFormError('Route name is required.'); return; }
    setSaving(true);
    try {
      await memberApi.saveRoute(form);
      load();
      setForm({ name: '', origin: '', destination: '', notes: '' });
      showToast('Route saved successfully!');
    } catch {
      setFormError('Failed to save route. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const del = async id => {
    setDeletingId(id);
    try {
      await memberApi.deleteRoute(id);
      setRoutes(prev => prev.filter(r => r.id !== id));
      showToast('Route deleted.');
    } catch {
      showToast('Failed to delete route.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <MemberLayout title="Saved Routes" breadcrumb="Routes">
      {/* Toast */}
      {toast && (
        <div className="alert alert-success" style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 2000, minWidth: 260, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
          <i className="bi bi-check-circle-fill" /> {toast}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem' }}>
            Frequent Flyer
          </div>
          <h2 style={{ margin: 0, fontSize: '1.9rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--navy)' }}>
            Saved Routes
          </h2>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--gray-400)', fontSize: '0.9rem' }}>
            Bookmark your most-flown routes for quick booking
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* ── Save Form ─────────────────────────────────────────────────────── */}
        <div className="detail-card">
          <div className="detail-card-header">
            <div className="detail-card-title">
              <i className="bi bi-bookmark-plus" /> Save New Route
            </div>
          </div>
          <div className="detail-card-body">
            {formError && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                <i className="bi bi-exclamation-circle" /> {formError}
              </div>
            )}
            <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Route Name <span className="req">*</span></label>
                <input
                  className="form-control"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Nairobi → Dubai"
                  required
                />
              </div>

              {/* Visual route input */}
              <div style={{ position: 'relative' }}>
                <div className="form-group">
                  <label className="form-label">Origin</label>
                  <div style={{ position: 'relative' }}>
                    <i className="bi bi-circle" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gold)', fontSize: '0.7rem', pointerEvents: 'none' }} />
                    <input
                      className="form-control"
                      style={{ paddingLeft: '2.25rem' }}
                      value={form.origin}
                      onChange={e => setForm(p => ({ ...p, origin: e.target.value }))}
                      placeholder="NBO / Nairobi"
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0.35rem 0', color: 'var(--gray-300)' }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--gray-100)' }} />
                  <i className="bi bi-arrow-down" style={{ margin: '0 0.5rem', fontSize: '0.8rem', color: 'var(--gold)' }} />
                  <div style={{ flex: 1, height: 1, background: 'var(--gray-100)' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Destination</label>
                  <div style={{ position: 'relative' }}>
                    <i className="bi bi-geo-alt-fill" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#ef4444', fontSize: '0.8rem', pointerEvents: 'none' }} />
                    <input
                      className="form-control"
                      style={{ paddingLeft: '2.25rem' }}
                      value={form.destination}
                      onChange={e => setForm(p => ({ ...p, destination: e.target.value }))}
                      placeholder="DXB / Dubai"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Preferred aircraft, time of year, etc."
                />
              </div>

              <button type="submit" className="btn btn-gold" disabled={saving}>
                {saving ? (
                  <><span className="spinner" style={{ marginRight: '0.5rem' }} /> Saving…</>
                ) : (
                  <><i className="bi bi-bookmark-plus" style={{ marginRight: '0.45rem' }} /> Save Route</>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ── Routes List ──────────────────────────────────────────────────── */}
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <span className="spinner spinner-dark" style={{ width: 32, height: 32 }} />
            </div>
          ) : routes.length === 0 ? (
            <div className="detail-card">
              <div className="detail-card-body" style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--gray-400)' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gray-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                  <i className="bi bi-map" style={{ fontSize: '1.75rem', opacity: 0.4 }} />
                </div>
                <div style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: '0.4rem' }}>No saved routes yet</div>
                <div style={{ fontSize: '0.85rem', lineHeight: 1.5, maxWidth: 280, margin: '0 auto' }}>
                  Save your frequently flown routes to book flights in seconds
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--gray-400)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                {routes.length} saved {routes.length === 1 ? 'route' : 'routes'}
              </div>
              {routes.map(r => (
                <div key={r.id} className="detail-card" style={{ transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = ''; }}>
                  <div className="detail-card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                          <i className="bi bi-bookmark-fill" style={{ color: 'var(--gold)', fontSize: '0.8rem' }} />
                          <div style={{ fontWeight: 700, color: 'var(--navy)', fontSize: '0.95rem' }}>{r.name}</div>
                        </div>

                        {(r.origin || r.destination) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', background: 'var(--gray-50)', padding: '0.2rem 0.6rem', borderRadius: 6 }}>
                              {r.origin || '—'}
                            </span>
                            <i className="bi bi-arrow-right" style={{ color: 'var(--gold)', fontSize: '0.7rem' }} />
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy)', background: 'var(--gray-50)', padding: '0.2rem 0.6rem', borderRadius: 6 }}>
                              {r.destination || '—'}
                            </span>
                          </div>
                        )}

                        {r.notes && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginTop: '0.25rem' }}>
                            <i className="bi bi-chat-text" style={{ marginRight: '0.3rem' }} />
                            {r.notes}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        <Link
                          to="/member/book"
                          state={{ origin: r.origin, destination: r.destination }}
                          className="btn btn-navy btn-xs"
                        >
                          <i className="bi bi-calendar-plus" style={{ marginRight: '0.3rem' }} /> Book
                        </Link>
                        <button
                          className="btn btn-xs"
                          style={{ background: '#fee2e2', color: '#dc2626', border: 'none' }}
                          onClick={() => del(r.id)}
                          disabled={deletingId === r.id}
                        >
                          {deletingId === r.id ? (
                            <span className="spinner" style={{ width: 12, height: 12 }} />
                          ) : (
                            <i className="bi bi-trash" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MemberLayout>
  );
}

export default MemberRoutesPage;