import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminFlightApi } from '../../services/api';

const STATUS_OPTIONS = ['inquiry', 'quoted', 'confirmed', 'in_flight', 'completed', 'cancelled'];

const STATUS_STYLE = {
  inquiry:   { background: '#f1f5f9', color: '#475569' },
  quoted:    { background: '#fef9c3', color: '#854d0e' },
  confirmed: { background: '#dcfce7', color: '#15803d' },
  in_flight: { background: '#dbeafe', color: '#1d4ed8' },
  completed: { background: '#f0fdf4', color: '#166534' },
  cancelled: { background: '#fee2e2', color: '#b91c1c' },
};

const fmt$ = n => n ? '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0 }) : null;
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// ── Helpers ───────────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const s = (status || 'inquiry').toLowerCase().replace(' ', '_');
  const style = STATUS_STYLE[s] || STATUS_STYLE.inquiry;
  return (
    <span style={{ ...style, fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', display: 'inline-block', whiteSpace: 'nowrap' }}>
      {(status || 'inquiry').replace('_', ' ')}
    </span>
  );
}

// Handles both "destination_detail" (new) and "dest_detail" (old serializer field name)
function getAirport(booking, side) {
  if (side === 'origin') return booking.origin_detail || null;
  return booking.destination_detail || booking.dest_detail || null;
}

function AirportCell({ detail }) {
  if (!detail) return <span style={{ color: '#94a3b8' }}>—</span>;
  return (
    <span>
      <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>{detail.code}</span>
      {detail.name && (
        <span style={{ color: '#64748b', fontSize: '11px', display: 'block', lineHeight: 1.3, marginTop: '1px' }}>
          {detail.name}
        </span>
      )}
      {(detail.city || detail.country) && (
        <span style={{ color: '#94a3b8', fontSize: '10.5px', display: 'block' }}>
          {[detail.city, detail.country].filter(Boolean).join(', ')}
        </span>
      )}
    </span>
  );
}

// ── Shared modal wrapper ──────────────────────────────────────────────────────
function ModalShell({ children, onClose, maxWidth = 560 }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.22)' }}>
        {children}
      </div>
    </div>
  );
}

const mS = {
  header:     { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.1rem 1.4rem', borderBottom: '1px solid #f1f5f9' },
  title:      { fontSize: '15px', fontWeight: 700, color: '#0f172a' },
  closeBtn:   { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '20px', lineHeight: 1, padding: '0 4px' },
  body:       { padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem' },
  footer:     { padding: '1rem 1.4rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '8px' },
  label:      { fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px', display: 'block' },
  input:      { width: '100%', padding: '9px 12px', fontSize: '13.5px', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', color: '#0f172a', boxSizing: 'border-box', fontFamily: 'inherit' },
  grid2:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  infoBox:    { background: '#f8fafc', borderRadius: '8px', padding: '0.8rem 1rem', fontSize: '13px', color: '#475569', lineHeight: 1.6 },
  errBox:     { background: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500 },
  btnCancel:  { padding: '9px 18px', fontSize: '13px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#475569', fontWeight: 500 },
  btnPrimary: { padding: '9px 20px', fontSize: '13px', background: '#0f172a', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#fff', fontWeight: 600 },
  btnBlue:    { padding: '9px 20px', fontSize: '13px', background: '#1d4ed8', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#fff', fontWeight: 600 },
  checkRow:   { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', cursor: 'pointer' },
  sectionLbl: { fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '10px' },
};

// ── Set Price Modal ───────────────────────────────────────────────────────────
function SetPriceModal({ booking, onClose, onSuccess }) {
  const [form, setForm] = useState({
    quoted_price_usd: booking.quoted_price_usd || '',
    commission_pct:   booking.commission_pct || '',
    status:           'quoted',
    send_email:       true,
    email_message:    '',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const origin = getAirport(booking, 'origin');
  const dest   = getAirport(booking, 'destination');
  const route  = (origin?.code && dest?.code) ? `${origin.code} → ${dest.code}` : '—';
  const set    = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Live commission preview
  const price = Number(form.quoted_price_usd) || 0;
  const pct   = Number(form.commission_pct)   || 10;
  const comm  = price ? (price * pct / 100) : 0;
  const net   = price ? (price - comm)       : 0;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.quoted_price_usd || price <= 0) { setError('Please enter a valid quoted price.'); return; }
    setLoading(true); setError('');
    try {
      const payload = {
        quoted_price_usd: price,
        status:           form.status,
        send_email:       form.send_email,
        email_message:    form.email_message || '',
      };
      if (form.commission_pct) payload.commission_pct = pct;
      await adminFlightApi.setPrice(booking.id, payload);
      onSuccess();
    } catch (err) {
      const data = err.response?.data;
      setError(
        typeof data === 'string' ? data :
        data?.detail || data?.quoted_price_usd?.[0] ||
        data?.non_field_errors?.[0] ||
        JSON.stringify(data) ||
        'Failed to set price.'
      );
    } finally { setLoading(false); }
  };

  return (
    <ModalShell onClose={onClose} maxWidth={500}>
      <div style={mS.header}>
        <span style={mS.title}>Set Price & Quote</span>
        <button style={mS.closeBtn} onClick={onClose}>✕</button>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={mS.body}>

          <div style={mS.infoBox}>
            <strong style={{ color: '#0f172a' }}>{booking.guest_name}</strong>
            <span style={{ color: '#94a3b8', margin: '0 6px' }}>·</span>
            {booking.guest_email}
            <br />
            <span style={{ color: '#64748b' }}>{route} · {fmtDate(booking.departure_date)} · {booking.passenger_count} pax</span>
          </div>

          {error && <div style={mS.errBox}>{error}</div>}

          <div style={mS.grid2}>
            <div>
              <label style={mS.label}>Quoted Price (USD) *</label>
              <input style={mS.input} type="number" min="1" step="0.01"
                value={form.quoted_price_usd}
                onChange={e => set('quoted_price_usd', e.target.value)}
                placeholder="e.g. 45000" required />
            </div>
            <div>
              <label style={mS.label}>Commission % <span style={{ fontWeight: 400, color: '#94a3b8' }}>(blank = 10%)</span></label>
              <input style={mS.input} type="number" min="0" max="100" step="0.1"
                value={form.commission_pct}
                onChange={e => set('commission_pct', e.target.value)}
                placeholder="10" />
            </div>
          </div>

          {/* Live preview */}
          {price > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
              {[
                { label: 'Quoted price',          val: fmt$(price), color: '#0f172a' },
                { label: `Commission (${pct}%)`,  val: fmt$(comm),  color: '#15803d' },
                { label: 'Net revenue',            val: fmt$(net),   color: '#6366f1' },
              ].map(item => (
                <div key={item.label} style={{ background: '#f8fafc', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: item.color }}>{item.val}</div>
                  <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '3px' }}>{item.label}</div>
                </div>
              ))}
            </div>
          )}

          <div>
            <label style={mS.label}>Update Status</label>
            <select style={mS.input} value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>

          <label style={mS.checkRow}>
            <input type="checkbox" checked={form.send_email} onChange={e => set('send_email', e.target.checked)} />
            Send quote email to <strong style={{ marginLeft: 4 }}>{booking.guest_email}</strong>
          </label>

          {form.send_email && (
            <div>
              <label style={mS.label}>Custom message <span style={{ fontWeight: 400, color: '#94a3b8' }}>(blank = default template)</span></label>
              <textarea style={{ ...mS.input, resize: 'vertical' }} rows={4}
                value={form.email_message}
                onChange={e => set('email_message', e.target.value)}
                placeholder="Leave blank to use the standard quote email…" />
            </div>
          )}
        </div>
        <div style={mS.footer}>
          <button type="button" style={mS.btnCancel} onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" style={mS.btnPrimary} disabled={loading}>
            {loading ? 'Saving…' : 'Set Price & Send'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

// ── Reply Modal ───────────────────────────────────────────────────────────────
function ReplyModal({ booking, onClose, onSuccess }) {
  const origin = getAirport(booking, 'origin');
  const dest   = getAirport(booking, 'destination');
  const route  = (origin?.code && dest?.code) ? `${origin.code} → ${dest.code}` : '';
  const set    = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const [form, setForm] = useState({ subject: `Re: Your Flight Enquiry – ${route}`, message: '', new_status: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true); setError('');
    try { await adminFlightApi.reply(booking.id, form); onSuccess(); }
    catch (err) { setError(err.response?.data?.detail || 'Failed to send reply.'); }
    finally { setLoading(false); }
  };

  return (
    <ModalShell onClose={onClose} maxWidth={560}>
      <div style={mS.header}>
        <span style={mS.title}>Reply to {booking.guest_name}</span>
        <button style={mS.closeBtn} onClick={onClose}>✕</button>
      </div>
      <form onSubmit={handleSubmit}>
        <div style={mS.body}>
          <div style={{ fontSize: '12.5px', color: '#64748b' }}>To: <strong style={{ color: '#0f172a' }}>{booking.guest_email}</strong></div>
          {error && <div style={mS.errBox}>{error}</div>}
          <div>
            <label style={mS.label}>Subject *</label>
            <input style={mS.input} value={form.subject} onChange={e => set('subject', e.target.value)} required />
          </div>
          <div>
            <label style={mS.label}>Message *</label>
            <textarea style={{ ...mS.input, resize: 'vertical' }} rows={7}
              value={form.message} onChange={e => set('message', e.target.value)} required />
          </div>
          <div>
            <label style={mS.label}>Update status <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span></label>
            <select style={mS.input} value={form.new_status} onChange={e => set('new_status', e.target.value)}>
              <option value="">— No change —</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>
        <div style={mS.footer}>
          <button type="button" style={mS.btnCancel} onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" style={mS.btnBlue} disabled={loading}>{loading ? 'Sending…' : 'Send Reply'}</button>
        </div>
      </form>
    </ModalShell>
  );
}

// ── View Modal ────────────────────────────────────────────────────────────────
function ViewModal({ booking: b, onClose }) {
  const origin = getAirport(b, 'origin');
  const dest   = getAirport(b, 'destination');

  const AirBox = ({ detail, align = 'left' }) => (
    <div style={{ textAlign: align }}>
      <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', letterSpacing: '-1px', lineHeight: 1 }}>{detail?.code || '—'}</div>
      <div style={{ fontSize: '13px', color: '#334155', fontWeight: 600, marginTop: '4px' }}>{detail?.name || ''}</div>
      <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>{[detail?.city, detail?.country].filter(Boolean).join(', ')}</div>
    </div>
  );

  const Field = ({ label, val, mono }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={mS.sectionLbl}>{label}</span>
      <span style={{ fontSize: '13.5px', color: '#0f172a', fontWeight: 500, fontFamily: mono ? 'monospace' : 'inherit' }}>{val || '—'}</span>
    </div>
  );

  const PriceBox = ({ label, val, color }) => (
    <div style={{ textAlign: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '10px' }}>
      <div style={{ fontSize: '20px', fontWeight: 800, color: color || '#0f172a', letterSpacing: '-0.5px', lineHeight: 1 }}>{val || '—'}</div>
      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{label}</div>
    </div>
  );

  const Tag = ({ children }) => (
    <span style={{ display: 'inline-block', fontSize: '12px', fontWeight: 500, padding: '4px 10px', borderRadius: '6px', background: '#eff6ff', color: '#1d4ed8', marginRight: '6px', marginBottom: '4px' }}>
      {children}
    </span>
  );

  return (
    <ModalShell onClose={onClose} maxWidth={680}>
      <div style={mS.header}>
        <span style={mS.title}>Booking · {String(b.reference || '').slice(0, 8).toUpperCase()}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <StatusPill status={b.status} />
          <button style={mS.closeBtn} onClick={onClose}>✕</button>
        </div>
      </div>

      <div style={{ padding: '1.4rem', display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>

        {/* Route */}
        <div>
          <div style={mS.sectionLbl}>Route</div>
          <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1rem' }}>
            <AirBox detail={origin} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '22px', color: '#cbd5e1' }}>✈</div>
              <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '4px', fontWeight: 500 }}>{b.trip_type_display || b.trip_type || ''}</div>
            </div>
            <AirBox detail={dest} align="right" />
          </div>
        </div>

        {/* Guest */}
        <div>
          <div style={mS.sectionLbl}>Guest</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Full name"  val={b.guest_name} />
            <Field label="Email"      val={b.guest_email} />
            <Field label="Phone"      val={b.guest_phone} />
            <Field label="Company"    val={b.company} />
          </div>
        </div>

        {/* Flight details */}
        <div>
          <div style={mS.sectionLbl}>Flight Details</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Field label="Departure date"  val={fmtDate(b.departure_date)} />
            <Field label="Departure time"  val={b.departure_time} />
            <Field label="Passengers"      val={b.passenger_count} />
            <Field label="Trip type"       val={b.trip_type_display || b.trip_type} />
            {b.return_date && <Field label="Return date" val={fmtDate(b.return_date)} />}
            {b.aircraft_detail && <Field label="Aircraft" val={`${b.aircraft_detail.name} (${b.aircraft_detail.category_display || b.aircraft_detail.category})`} />}
            <Field label="Reference"   val={String(b.reference || '').slice(0, 16)} mono />
            <Field label="Submitted"   val={fmtDate(b.created_at)} />
          </div>
        </div>

        {/* Pricing */}
        <div>
          <div style={mS.sectionLbl}>Pricing</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
            <PriceBox label="Quoted price"                          val={fmt$(b.quoted_price_usd)} color="#0f172a" />
            <PriceBox label={`Commission (${b.commission_pct || 10}%)`} val={fmt$(b.commission_usd)}  color="#15803d" />
            <PriceBox label="Net revenue"                           val={fmt$(b.net_revenue_usd)}  color="#6366f1" />
          </div>
        </div>

        {/* Extras */}
        {(b.catering_requested || b.ground_transport_requested || b.concierge_requested) && (
          <div>
            <div style={mS.sectionLbl}>Extras</div>
            {b.catering_requested          && <Tag>🍽 Catering</Tag>}
            {b.ground_transport_requested  && <Tag>🚗 Ground Transport</Tag>}
            {b.concierge_requested         && <Tag>🛎 Concierge</Tag>}
          </div>
        )}

        {/* Special requests */}
        {b.special_requests && (
          <div>
            <div style={mS.sectionLbl}>Special Requests</div>
            <div style={{ fontSize: '13px', color: '#334155', background: '#f8fafc', borderRadius: '8px', padding: '0.85rem 1rem', lineHeight: 1.7 }}>
              {b.special_requests}
            </div>
          </div>
        )}

      </div>

      <div style={mS.footer}>
        <button style={mS.btnCancel} onClick={onClose}>Close</button>
      </div>
    </ModalShell>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminFlightBookingsPage() {
  const [bookings,     setBookings]   = useState([]);
  const [loading,      setLoading]    = useState(true);
  const [search,       setSearch]     = useState('');
  const [statusFilter, setStatus]     = useState('');
  const [viewModal,    setViewModal]  = useState(null);
  const [priceModal,   setPriceModal] = useState(null);
  const [replyModal,   setReplyModal] = useState(null);
  const [toast,        setToast]      = useState({ msg: '', err: false });

  const showToast = (msg, err = false) => { setToast({ msg, err }); setTimeout(() => setToast({ msg: '', err: false }), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminFlightApi.list({ search, status: statusFilter || undefined });
      setBookings(r.data?.results || r.data || []);
    } catch { showToast('Failed to load bookings', true); }
    finally { setLoading(false); }
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, s) => {
    try { await adminFlightApi.updateStatus(id, s); showToast('Status updated ✓'); load(); }
    catch { showToast('Failed to update status', true); }
  };

  const S = {
    page:        { padding: '0 0 2.5rem', fontFamily: "'DM Sans','Helvetica Neue',sans-serif" },
    toast:       { position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 3000, padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' },
    pageHeader:  { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' },
    pageTitle:   { fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 },
    pageSub:     { fontSize: '13px', color: '#64748b', marginTop: '3px' },
    card:        { background: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' },
    cardHeader:  { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '10px' },
    cardTitle:   { fontSize: '14px', fontWeight: 700, color: '#0f172a' },
    filters:     { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
    searchWrap:  { position: 'relative', display: 'flex', alignItems: 'center' },
    searchIcon:  { position: 'absolute', left: '10px', color: '#94a3b8', fontSize: '13px', pointerEvents: 'none' },
    searchInput: { padding: '7px 10px 7px 32px', fontSize: '13px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', width: '220px', color: '#0f172a' },
    select:      { padding: '7px 10px', fontSize: '13px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', color: '#0f172a', background: '#fff' },
    tableWrap:   { overflowX: 'auto' },
    table:       { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th:          { textAlign: 'left', padding: '0.6rem 1rem', fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', background: '#f8fafc', letterSpacing: '0.07em', textTransform: 'uppercase', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' },
    td:          { padding: '0.85rem 1rem', borderBottom: '1px solid #f8fafc', verticalAlign: 'middle' },
    empty:       { textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: '13px' },
    iconBtn: c  => ({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontSize: '13px', background: c + '18', color: c }),
    miniSel:     { padding: '4px 8px', fontSize: '11.5px', border: '1px solid #e2e8f0', borderRadius: '6px', outline: 'none', background: '#fff', color: '#374151', cursor: 'pointer' },
  };

  return (
    <AdminLayout title="Flight Bookings" breadcrumb="Flight Bookings">
      <div style={S.page}>

        {toast.msg && (
          <div style={{ ...S.toast, background: toast.err ? '#991b1b' : '#0f172a', color: '#fff' }}>
            {toast.msg}
          </div>
        )}

        {viewModal  && <ViewModal     booking={viewModal}  onClose={() => setViewModal(null)} />}
        {priceModal && <SetPriceModal booking={priceModal} onClose={() => setPriceModal(null)}
          onSuccess={() => { setPriceModal(null); showToast('Price set & email sent ✓'); load(); }} />}
        {replyModal && <ReplyModal    booking={replyModal} onClose={() => setReplyModal(null)}
          onSuccess={() => { setReplyModal(null); showToast('Reply sent ✓'); }} />}

        <div style={S.pageHeader}>
          <div>
            <h2 style={S.pageTitle}>Flight Bookings</h2>
            <p style={S.pageSub}>Manage all flight charter requests</p>
          </div>
        </div>

        <div style={S.card}>
          <div style={S.cardHeader}>
            <span style={S.cardTitle}>All Bookings ({bookings.length})</span>
            <div style={S.filters}>
              <div style={S.searchWrap}>
                <i className="bi bi-search" style={S.searchIcon} />
                <input style={S.searchInput} placeholder="Search name, email…" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select style={S.select} value={statusFilter} onChange={e => setStatus(e.target.value)}>
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>

          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  {['Guest', 'Origin', 'Destination', 'Departure', 'Pax', 'Status', 'Quoted Price', 'Commission', 'Actions'].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} style={S.empty}>Loading…</td></tr>
                ) : bookings.length === 0 ? (
                  <tr><td colSpan={9} style={S.empty}>No bookings found</td></tr>
                ) : bookings.map(b => {
                  const origin = getAirport(b, 'origin');
                  const dest   = getAirport(b, 'destination');
                  return (
                    <tr key={b.id}
                      onMouseEnter={e => Array.from(e.currentTarget.cells).forEach(c => c.style.background = '#f8fafc')}
                      onMouseLeave={e => Array.from(e.currentTarget.cells).forEach(c => c.style.background = '')}
                    >
                      <td style={S.td}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{b.guest_name}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>{b.guest_email}</div>
                        {b.company && <div style={{ fontSize: '11px', color: '#94a3b8' }}>{b.company}</div>}
                        <div style={{ fontSize: '10px', color: '#cbd5e1', fontFamily: 'monospace', marginTop: '2px' }}>
                          {String(b.reference || '').slice(0, 8).toUpperCase()}
                        </div>
                      </td>
                      <td style={S.td}><AirportCell detail={origin} /></td>
                      <td style={S.td}><AirportCell detail={dest} /></td>
                      <td style={{ ...S.td, whiteSpace: 'nowrap', fontSize: '12.5px', color: '#334155' }}>
                        {fmtDate(b.departure_date)}
                        {b.trip_type && <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '2px' }}>{b.trip_type_display || b.trip_type}</div>}
                      </td>
                      <td style={{ ...S.td, textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>{b.passenger_count}</td>
                      <td style={S.td}><StatusPill status={b.status} /></td>
                      <td style={S.td}>
                        {b.quoted_price_usd
                          ? <span style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>{fmt$(b.quoted_price_usd)}</span>
                          : <span style={{ color: '#cbd5e1', fontSize: '12px' }}>Not quoted</span>}
                      </td>
                      <td style={S.td}>
                        {b.commission_usd
                          ? <span style={{ fontWeight: 600, color: '#15803d' }}>{fmt$(b.commission_usd)}</span>
                          : <span style={{ color: '#cbd5e1' }}>—</span>}
                      </td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <button style={S.iconBtn('#6366f1')} title="View details"  onClick={() => setViewModal(b)}><i className="bi bi-eye" /></button>
                          <button style={S.iconBtn('#f59e0b')} title="Set price"     onClick={() => setPriceModal(b)}><i className="bi bi-tag" /></button>
                          <button style={S.iconBtn('#3b82f6')} title="Reply"         onClick={() => setReplyModal(b)}><i className="bi bi-envelope" /></button>
                          <select style={S.miniSel} value={b.status} onChange={e => updateStatus(b.id, e.target.value)} title="Change status">
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}