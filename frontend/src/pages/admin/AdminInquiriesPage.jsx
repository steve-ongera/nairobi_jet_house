import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminInquiryApi } from '../../services/api';

const TABS = [
  { key: 'flight', label: 'Flight Inquiries', icon: 'bi-search' },
  { key: 'contact', label: 'Contacts', icon: 'bi-envelope' },
  { key: 'group', label: 'Group Charters', icon: 'bi-people' },
  { key: 'cargo', label: 'Air Cargo', icon: 'bi-box-seam' },
  { key: 'sales', label: 'Aircraft Sales', icon: 'bi-currency-dollar' },
  { key: 'lease', label: 'Leases', icon: 'bi-file-text' },
];

function ReplyModal({ item, emailField, nameField, onReply, onClose }) {
  const [form, setForm] = useState({ subject: 'Re: Your Enquiry | NairobiJetHouse', message: '', new_status: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try { await onReply(item.id, form); onClose(); }
    catch { setError('Failed to send reply.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <div className="modal-title"><i className="bi bi-envelope" /> Reply to {item[nameField]}</div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {error && <div className="alert alert-error"><i className="bi bi-exclamation-circle" />{error}</div>}
            <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>To: <strong>{item[emailField]}</strong></div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input className="form-control" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Message <span className="req">*</span></label>
              <textarea className="form-control" rows={7} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Update Status</label>
              <select className="form-control" value={form.new_status} onChange={e => setForm(p => ({ ...p, new_status: e.target.value }))}>
                <option value="">— No change —</option>
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="quoted">Quoted</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={loading}>
              {loading ? <><span className="spinner" /> Sending…</> : <><i className="bi bi-send" /> Send Reply</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function InquiryTable({ data, loading, nameField, emailField, onReply, extraCols = [] }) {
  const [replyItem, setReplyItem] = useState(null);

  return (
    <>
      {replyItem && <ReplyModal item={replyItem} emailField={emailField} nameField={nameField} onReply={onReply} onClose={() => setReplyItem(null)} />}
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Contact</th>
              {extraCols.map(c => <th key={c.label}>{c.label}</th>)}
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={4 + extraCols.length} className="table-empty"><span className="spinner spinner-dark" /></td></tr>
            : data.length === 0 ? <tr><td colSpan={4 + extraCols.length} className="table-empty"><i className="bi bi-inbox" />No inquiries found</td></tr>
            : data.map(item => (
              <tr key={item.id}>
                <td>
                  <div className="td-name">{item[nameField]}</div>
                  <div className="td-email">{item[emailField]}</div>
                  {item.phone && <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>{item.phone}</div>}
                </td>
                {extraCols.map(c => <td key={c.key} style={{ fontSize: '0.85rem', color: 'var(--gray-600)' }}>{c.render ? c.render(item) : item[c.key] || '—'}</td>)}
                <td>
                  <span className={`badge ${item.status ? `status-${item.status}` : 'badge-gray'}`}>
                    {item.status || 'received'}
                  </span>
                </td>
                <td style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : '—'}</td>
                <td>
                  <button className="btn btn-navy btn-xs" onClick={() => setReplyItem(item)}>
                    <i className="bi bi-envelope" /> Reply
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function AdminInquiriesPage() {
  const [tab, setTab]         = useState('flight');
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [toast, setToast]     = useState('');

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    setLoading(true);
    const loaders = {
      flight:  () => adminInquiryApi.flightInq({ search }),
      contact: () => adminInquiryApi.contacts({ search }),
      group:   () => adminInquiryApi.groups({ search }),
      cargo:   () => adminInquiryApi.cargo({ search }),
      sales:   () => adminInquiryApi.sales({ search }),
      lease:   () => adminInquiryApi.leases({ search }),
    };
    loaders[tab]?.().then(r => {
      setData(r.data.results || r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [tab, search]);

  const replyFns = {
    flight:  adminInquiryApi.replyFlight,
    contact: adminInquiryApi.replyContact,
    group:   adminInquiryApi.replyGroup,
    cargo:   adminInquiryApi.replyCargo,
    sales:   adminInquiryApi.replySales,
    lease:   adminInquiryApi.replyLease,
  };

  const tabCfg = {
    flight:  { name: 'guest_name', email: 'guest_email', extra: [{ label: 'Route', key: 'origin_description', render: i => `${i.origin_description || '—'} → ${i.destination_description || '—'}` }, { label: 'Date', key: 'approximate_date' }] },
    contact: { name: 'full_name', email: 'email', extra: [{ label: 'Subject', key: 'subject_display', render: i => i.subject_display || i.subject }] },
    group:   { name: 'contact_name', email: 'email', extra: [{ label: 'Group', key: 'group_size', render: i => `${i.group_size} pax — ${i.group_type_display || i.group_type}` }, { label: 'Route', key: 'origin_description', render: i => `${i.origin_description} → ${i.destination_description}` }] },
    cargo:   { name: 'contact_name', email: 'email', extra: [{ label: 'Type', key: 'cargo_type_display', render: i => i.cargo_type_display || i.cargo_type }, { label: 'Urgency', key: 'urgency_display', render: i => i.urgency_display || i.urgency }] },
    sales:   { name: 'contact_name', email: 'email', extra: [{ label: 'Type', key: 'inquiry_type_display', render: i => i.inquiry_type_display || i.inquiry_type }, { label: 'Budget', key: 'budget_range_display', render: i => i.budget_range_display || i.budget_range }] },
    lease:   { name: 'guest_name', email: 'guest_email', extra: [{ label: 'Asset', key: 'asset_type_display', render: i => i.asset_type_display || i.asset_type }, { label: 'Duration', key: 'lease_duration_display', render: i => i.lease_duration_display || i.lease_duration }] },
  };

  const cfg = tabCfg[tab];

  return (
    <AdminLayout title="Inquiries" breadcrumb="All Inquiries">
      {toast && <div className="alert alert-success" style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 2000, minWidth: 260 }}><i className="bi bi-check-circle" />{toast}</div>}

      <div className="dash-header">
        <div className="dash-header-left"><h2>Inquiry Management</h2><p>Respond to all incoming client inquiries</p></div>
        <div className="search-wrap" style={{ width: 260 }}>
          <i className="bi bi-search" />
          <input className="form-control search-input" placeholder="Search inquiries…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="tab-nav">
        {TABS.map(t => (
          <button key={t.key} className={`tab-btn${tab === t.key ? ' active' : ''}`} onClick={() => setTab(t.key)}>
            <i className={`bi ${t.icon}`} /> {t.label}
          </button>
        ))}
      </div>

      <div className="table-card">
        <InquiryTable
          data={data}
          loading={loading}
          nameField={cfg.name}
          emailField={cfg.email}
          onReply={async (id, form) => { await replyFns[tab](id, form); showToast('Reply sent successfully'); }}
          extraCols={cfg.extra}
        />
      </div>
    </AdminLayout>
  );
}