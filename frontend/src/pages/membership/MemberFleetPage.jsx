// MemberFleetPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MemberLayout from '../../components/membership/MemberLayout';
import { memberApi } from '../../services/api';

const CATEGORY_ICONS = {
  light: 'bi-lightning',
  midsize: 'bi-airplane',
  super_midsize: 'bi-airplane-fill',
  heavy: 'bi-shield-fill',
  ultra_long: 'bi-globe',
  vip_airliner: 'bi-stars',
};

const CATEGORY_COLORS = {
  light: { bg: '#e0f2fe', color: '#0369a1' },
  midsize: { bg: '#f0fdf4', color: '#15803d' },
  super_midsize: { bg: '#fdf4ff', color: '#7c3aed' },
  heavy: { bg: '#fff7ed', color: '#c2410c' },
  ultra_long: { bg: '#fdf2f8', color: '#be185d' },
  vip_airliner: { bg: '#fffbeb', color: '#b45309' },
};

export function MemberFleetPage() {
  const [fleet, setFleet] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    memberApi.fleet()
      .then(r => { setFleet(r.data.results || r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = ['all', ...new Set(fleet.map(a => a.category))];

  const filtered = fleet.filter(ac => {
    const matchesCat = filter === 'all' || ac.category === filter;
    const matchesSearch = !search ||
      ac.name.toLowerCase().includes(search.toLowerCase()) ||
      ac.model.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <MemberLayout title="Browse Fleet" breadcrumb="Fleet">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '0.4rem' }}>
            Member-Exclusive
          </div>
          <h2 style={{ margin: 0, fontSize: '1.9rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--navy)' }}>
            Available Fleet
          </h2>
          <p style={{ margin: '0.35rem 0 0', color: 'var(--gray-400)', fontSize: '0.9rem' }}>
            {fleet.length} aircraft available for instant booking
          </p>
        </div>
        <Link to="/member/book" className="btn btn-gold">
          <i className="bi bi-calendar-plus" style={{ marginRight: '0.45rem' }} />
          Book Now
        </Link>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 320 }}>
          <i className="bi bi-search" style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none' }} />
          <input
            className="form-control"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Search aircraft..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Category pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: '0.4rem 1rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
                border: '1.5px solid',
                borderColor: filter === cat ? 'var(--gold)' : 'var(--gray-200)',
                background: filter === cat ? 'var(--gold)' : 'transparent',
                color: filter === cat ? 'var(--navy-deep)' : 'var(--gray-400)',
                cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
              }}
            >
              {cat === 'all' ? 'All Aircraft' : cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ── Fleet Grid ───────────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <span className="spinner spinner-dark" style={{ width: 36, height: 36 }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--gray-400)' }}>
          <i className="bi bi-airplane" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem', opacity: 0.3 }} />
          <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>No aircraft found</div>
          <div style={{ fontSize: '0.85rem' }}>Try adjusting your search or filter</div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}>
          {filtered.map(ac => {
            const catKey = ac.category || 'midsize';
            const catColor = CATEGORY_COLORS[catKey] || CATEGORY_COLORS.midsize;
            return (
              <div key={ac.id} className="aircraft-card" style={{
                background: '#fff', borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--gray-100)',
                overflow: 'hidden', transition: 'all 0.25s',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(11,29,58,0.15)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.transform = ''; }}
              >
                {/* Image area */}
                <div style={{ height: 190, background: 'linear-gradient(135deg, var(--navy-deep), var(--navy-mid))', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {ac.image_url ? (
                    <img src={ac.image_url} alt={ac.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                  ) : (
                    <i className="bi bi-airplane" style={{ fontSize: '3.5rem', color: 'rgba(255,255,255,0.15)' }} />
                  )}
                  {/* Category badge */}
                  <div style={{
                    position: 'absolute', top: 12, left: 12,
                    background: catColor.bg, color: catColor.color,
                    padding: '0.3rem 0.75rem', borderRadius: 20,
                    fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em',
                  }}>
                    {ac.category_display || ac.category}
                  </div>
                  {/* Rate badge */}
                  <div style={{
                    position: 'absolute', bottom: 12, right: 12,
                    background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
                    color: 'var(--gold)', padding: '0.35rem 0.8rem',
                    borderRadius: 20, fontSize: '0.82rem', fontWeight: 700,
                  }}>
                    ${Number(ac.hourly_rate_usd).toLocaleString()}/hr
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--navy)', marginBottom: '0.15rem' }}>
                    {ac.name}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '1rem' }}>{ac.model}</div>

                  {/* Specs row */}
                  <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    {[
                      { icon: 'bi-people-fill', val: `${ac.passenger_capacity} pax` },
                      { icon: 'bi-broadcast', val: `${ac.range_km?.toLocaleString()} km` },
                      { icon: 'bi-geo-alt-fill', val: ac.base_location },
                    ].map(({ icon, val }) => (
                      <div key={icon} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--gray-400)' }}>
                        <i className={`bi ${icon}`} style={{ color: 'var(--gold)', fontSize: '0.75rem' }} />
                        {val}
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/member/book"
                    state={{ aircraftId: ac.id }}
                    className="btn btn-navy btn-sm"
                    style={{ width: '100%', justifyContent: 'center', display: 'flex', gap: '0.4rem' }}
                  >
                    <i className="bi bi-calendar-plus" />
                    Book This Aircraft
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </MemberLayout>
  );
}

export default MemberFleetPage;