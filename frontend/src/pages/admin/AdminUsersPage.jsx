// AdminUsersPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminUserApi } from '../../services/api';

export function AdminUsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [role, setRole]       = useState('');
  const [toast, setToast]     = useState('');
  const [emailModal, setEmailModal] = useState(null);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminUserApi.list({ search, role: role || undefined });
      setUsers(r.data.results || r.data);
    } catch {} finally { setLoading(false); }
  }, [search, role]);

  useEffect(() => { load(); }, [load]);

  const toggle = async id => {
    try { await adminUserApi.toggle(id); showToast('User status updated'); load(); }
    catch { showToast('Failed'); }
  };

  const roleColor = r => ({ admin: 'badge-red', staff: 'badge-amber', client: 'badge-navy', owner: 'badge-green' }[r] || 'badge-gray');

  return (
    <AdminLayout title="Users & Members" breadcrumb="Users">
      {toast && <div className="alert alert-success" style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 2000, minWidth: 260 }}><i className="bi bi-check-circle" />{toast}</div>}

      <div className="dash-header">
        <div className="dash-header-left"><h2>Users & Members</h2><p>Manage all platform users, roles and memberships</p></div>
      </div>

      <div className="table-card">
        <div className="table-card-header">
          <div className="table-card-title"><i className="bi bi-people" /> All Users</div>
          <div className="table-card-actions">
            <div className="search-wrap" style={{ width: 240 }}>
              <i className="bi bi-search" />
              <input className="form-control search-input" placeholder="Search name, email…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-control" style={{ width: 140 }} value={role} onChange={e => setRole(e.target.value)}>
              <option value="">All Roles</option>
              <option value="client">Clients</option>
              <option value="owner">Owners</option>
              <option value="admin">Admins</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Membership</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="table-empty"><span className="spinner spinner-dark" /></td></tr>
              : users.length === 0 ? <tr><td colSpan={7} className="table-empty"><i className="bi bi-people" />No users found</td></tr>
              : users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div className="td-name">{u.full_name || u.username}</div>
                    {u.company && <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>{u.company}</div>}
                  </td>
                  <td className="td-email">{u.email}</td>
                  <td><span className={`badge ${roleColor(u.role)}`}>{u.role}</span></td>
                  <td>
                    {u.membership_tier
                      ? <span className="badge badge-gold">{u.membership_tier}</span>
                      : <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)' }}>None</span>}
                    {u.membership_status && <span style={{ fontSize: '0.72rem', color: u.membership_status === 'active' ? 'var(--green)' : 'var(--red)', marginLeft: '0.35rem' }}>({u.membership_status})</span>}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                  <td><span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-ghost btn-xs" onClick={() => toggle(u.id)} title={u.is_active ? 'Deactivate' : 'Activate'}>
                        <i className={`bi bi-${u.is_active ? 'lock' : 'unlock'}`} />
                      </button>
                      <button className="btn btn-navy btn-xs" onClick={() => setEmailModal(u)} title="Email user">
                        <i className="bi bi-envelope" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {emailModal && (
        <SendEmailToUserModal user={emailModal} onClose={() => setEmailModal(null)} onSuccess={() => { setEmailModal(null); showToast('Email sent'); }} />
      )}
    </AdminLayout>
  );
}

function SendEmailToUserModal({ user, onClose, onSuccess }) {
  const [form, setForm] = useState({ subject: '', body: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try { await adminUserApi.sendEmail(user.id, form); onSuccess(); }
    catch {} finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title"><i className="bi bi-envelope" /> Email {user.full_name || user.username}</div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>To: <strong>{user.email}</strong></div>
            <div className="form-group">
              <label className="form-label">Subject <span className="req">*</span></label>
              <input className="form-control" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Message <span className="req">*</span></label>
              <textarea className="form-control" rows={6} value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} required />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={loading}>
              {loading ? <><span className="spinner" /> Sending…</> : <><i className="bi bi-send" /> Send</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminUsersPage;