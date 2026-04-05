// AdminUsersPage.jsx — Full CRUD User Management
import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminUserApi, membershipApi } from '../../services/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const roleColor   = r => ({ admin: 'badge-red', owner: 'badge-amber', client: 'badge-navy' }[r] || 'badge-gray');
const tierColor   = t => ({ corporate: 'badge-gold', premium: 'badge-amber', basic: 'badge-gray' }[t?.toLowerCase()] || 'badge-gray');
const fmtDate     = d => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—';
const fmtDateTime = d => d ? new Date(d).toLocaleString('en-GB', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : '—';

// ─── Main Page ────────────────────────────────────────────────────────────────
export function AdminUsersPage() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [role,    setRole]    = useState('');
  const [toast,   setToast]   = useState(null);   // { msg, type }

  // Modals
  const [detailModal,  setDetailModal]  = useState(null); // user obj
  const [createModal,  setCreateModal]  = useState(false);
  const [editModal,    setEditModal]    = useState(null); // user obj
  const [emailModal,   setEmailModal]   = useState(null); // user obj
  const [memberModal,  setMemberModal]  = useState(null); // user obj

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminUserApi.list({ search: search || undefined, role: role || undefined });
      setUsers(r.data.results || r.data);
    } catch (e) {
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, role]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (u) => {
    try {
      await adminUserApi.toggle(u.id);
      showToast(`User ${u.is_active ? 'deactivated' : 'activated'} successfully`);
      load();
    } catch {
      showToast('Action failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      // Using patch to set is_active = false as soft delete; adjust if your API has DELETE
      await adminUserApi.update(id, { is_active: false });
      showToast('User removed');
      load();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  return (
    <AdminLayout title="Users & Members" breadcrumb="Users">

      {/* Toast */}
      {toast && (
        <div className={`alert ${toast.type === 'error' ? 'alert-danger' : 'alert-success'}`}
          style={{ position:'fixed', top:'1rem', right:'1rem', zIndex:2000, minWidth:280, boxShadow:'0 4px 20px rgba(0,0,0,.15)' }}>
          <i className={`bi bi-${toast.type === 'error' ? 'exclamation-circle' : 'check-circle'}`} style={{ marginRight:'0.5rem' }} />
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="dash-header">
        <div className="dash-header-left">
          <h2>Users &amp; Members</h2>
          <p>Manage accounts, roles, and memberships</p>
        </div>
        <div style={{ display:'flex', gap:'0.75rem' }}>
          <button className="btn btn-navy" onClick={() => setCreateModal(true)}>
            <i className="bi bi-person-plus" /> New User
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <StatsBar users={users} />

      {/* Table */}
      <div className="table-card">
        <div className="table-card-header">
          <div className="table-card-title"><i className="bi bi-people" /> All Users ({users.length})</div>
          <div className="table-card-actions">
            <div className="search-wrap" style={{ width:250 }}>
              <i className="bi bi-search" />
              <input className="form-control search-input" placeholder="Search name, email, company…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="form-control" style={{ width:140 }} value={role} onChange={e => setRole(e.target.value)}>
              <option value="">All Roles</option>
              <option value="client">Clients</option>
              <option value="owner">Owners</option>
              <option value="admin">Admins</option>
            </select>
            <button className="btn btn-ghost btn-sm" onClick={load} title="Refresh">
              <i className="bi bi-arrow-clockwise" />
            </button>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Membership</th>
                <th>Company</th>
                <th>Joined</th>
                <th>Status</th>
                <th style={{ width:180 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="table-empty"><span className="spinner spinner-dark" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="table-empty"><i className="bi bi-people" style={{ fontSize:'1.5rem', display:'block', marginBottom:'0.5rem' }} />No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.id} style={{ cursor:'pointer' }}>
                  <td onClick={() => setDetailModal(u)}>
                    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                      <div style={{
                        width:38, height:38, borderRadius:'50%', flexShrink:0,
                        background:'linear-gradient(135deg, var(--navy) 0%, #1e3a6e 100%)',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        color:'var(--gold)', fontWeight:700, fontSize:'0.9rem',
                      }}>
                        {(u.full_name || u.username || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="td-name">{u.full_name || u.username}</div>
                        <div style={{ fontSize:'0.78rem', color:'var(--gray-400)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${roleColor(u.role)}`}>{u.role}</span></td>
                  <td>
                    {u.membership_tier
                      ? (<>
                          <span className={`badge ${tierColor(u.membership_tier)}`}>{u.membership_tier}</span>
                          {u.membership_status && (
                            <span style={{ fontSize:'0.72rem', color: u.membership_status === 'active' ? 'var(--green)' : 'var(--red)', marginLeft:'0.4rem' }}>
                              ({u.membership_status})
                            </span>
                          )}
                        </>)
                      : <span style={{ fontSize:'0.78rem', color:'var(--gray-400)' }}>None</span>
                    }
                  </td>
                  <td style={{ fontSize:'0.82rem', color:'var(--gray-500)' }}>{u.company || '—'}</td>
                  <td style={{ fontSize:'0.82rem', color:'var(--gray-400)' }}>{fmtDate(u.created_at)}</td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="td-actions">
                      <button className="btn btn-ghost btn-xs" title="View details" onClick={() => setDetailModal(u)}>
                        <i className="bi bi-eye" />
                      </button>
                      <button className="btn btn-ghost btn-xs" title="Edit user" onClick={() => setEditModal(u)}>
                        <i className="bi bi-pencil" />
                      </button>
                      <button className="btn btn-navy btn-xs" title="Send email" onClick={() => setEmailModal(u)}>
                        <i className="bi bi-envelope" />
                      </button>
                      <button className="btn btn-ghost btn-xs" title={u.is_active ? 'Deactivate' : 'Activate'}
                        onClick={() => handleToggle(u)}
                        style={{ color: u.is_active ? 'var(--red)' : 'var(--green)' }}>
                        <i className={`bi bi-${u.is_active ? 'lock' : 'unlock'}`} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {createModal  && <CreateUserModal  onClose={() => setCreateModal(false)}  onSuccess={() => { setCreateModal(false);  showToast('User created successfully'); load(); }} />}
      {editModal    && <EditUserModal    user={editModal}   onClose={() => setEditModal(null)}   onSuccess={() => { setEditModal(null);   showToast('User updated successfully'); load(); }} />}
      {detailModal  && <UserDetailModal user={detailModal} onClose={() => setDetailModal(null)} onEdit={() => { setEditModal(detailModal); setDetailModal(null); }} onEmail={() => { setEmailModal(detailModal); setDetailModal(null); }} onToggle={() => { handleToggle(detailModal); setDetailModal(null); }} />}
      {emailModal   && <SendEmailModal  user={emailModal}  onClose={() => setEmailModal(null)}  onSuccess={() => { setEmailModal(null); showToast('Email sent successfully'); }} />}
    </AdminLayout>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar({ users }) {
  const total   = users.length;
  const clients = users.filter(u => u.role === 'client').length;
  const owners  = users.filter(u => u.role === 'owner').length;
  const admins  = users.filter(u => u.role === 'admin').length;
  const active  = users.filter(u => u.is_active).length;
  const members = users.filter(u => u.membership_tier && u.membership_status === 'active').length;

  const cards = [
    { label:'Total Users',      value:total,   icon:'people',        color:'var(--navy)' },
    { label:'Active Members',   value:members, icon:'star',          color:'#b8860b' },
    { label:'Clients',          value:clients, icon:'person',        color:'#1e3a6e' },
    { label:'Fleet Owners',     value:owners,  icon:'airplane',      color:'#2563eb' },
    { label:'Admins',           value:admins,  icon:'shield-check',  color:'#dc2626' },
    { label:'Active Accounts',  value:active,  icon:'check-circle',  color:'#16a34a' },
  ];

  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
      {cards.map(c => (
        <div key={c.label} style={{ background:'white', borderRadius:8, padding:'1rem 1.25rem', boxShadow:'0 1px 6px rgba(0,0,0,.07)'  }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div>
              <div style={{ fontSize:'1.6rem', fontWeight:800, color:c.color, lineHeight:1 }}>{c.value}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--gray-500)', marginTop:'0.25rem' }}>{c.label}</div>
            </div>
            <i className={`bi bi-${c.icon}`} style={{ fontSize:'1.2rem', color:c.color, opacity:0.5 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Create User Modal ────────────────────────────────────────────────────────
function CreateUserModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    username:'', email:'', first_name:'', last_name:'',
    phone:'', company:'', role:'client', password:'', password2:'',
  });
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const set = (k, v) => { setForm(p => ({ ...p, [k]:v })); setErrors(p => ({ ...p, [k]:'' })); };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setErrors({});
    try {
      // POST to /api/auth/register/ or admin create endpoint
      // Using adminUserApi — adjust to your actual create endpoint
      const payload = { ...form };
      await adminUserApi.create ? adminUserApi.create(payload) : (() => { throw new Error('No create endpoint'); })();
      onSuccess();
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === 'object') setErrors(data);
      else setErrors({ non_field_errors: ['Failed to create user. Please check all fields.'] });
    } finally { setLoading(false); }
  };

  return (
    <Modal title="Create New User" icon="person-plus" onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <SectionTitle>Account Credentials</SectionTitle>
          <div className="form-grid2">
            <Field label="Username" error={errors.username}>
              <input className={`form-control ${errors.username ? 'is-invalid':''}`} value={form.username}
                onChange={e => set('username', e.target.value)} required placeholder="e.g. john_doe" />
            </Field>
            <Field label="Email" error={errors.email}>
              <input type="email" className={`form-control ${errors.email ? 'is-invalid':''}`} value={form.email}
                onChange={e => set('email', e.target.value)} required placeholder="john@example.com" />
            </Field>
            <Field label="Password" error={errors.password}>
              <input type="password" className={`form-control ${errors.password ? 'is-invalid':''}`} value={form.password}
                onChange={e => set('password', e.target.value)} required minLength={8} placeholder="Min. 8 characters" />
            </Field>
            <Field label="Confirm Password" error={errors.password2}>
              <input type="password" className={`form-control ${errors.password2 ? 'is-invalid':''}`} value={form.password2}
                onChange={e => set('password2', e.target.value)} required placeholder="Repeat password" />
            </Field>
          </div>
          <SectionTitle style={{ marginTop:'1.25rem' }}>Personal Info</SectionTitle>
          <div className="form-grid2">
            <Field label="First Name" error={errors.first_name}>
              <input className="form-control" value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="John" />
            </Field>
            <Field label="Last Name" error={errors.last_name}>
              <input className="form-control" value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Doe" />
            </Field>
            <Field label="Phone">
              <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+254 700 000000" />
            </Field>
            <Field label="Company">
              <input className="form-control" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Acme Ltd." />
            </Field>
          </div>
          <SectionTitle style={{ marginTop:'1.25rem' }}>Role</SectionTitle>
          <Field label="Platform Role" error={errors.role}>
            <select className="form-control" value={form.role} onChange={e => set('role', e.target.value)}>
              <option value="client">Client (Membership user)</option>
              <option value="owner">Fleet Owner</option>
              <option value="admin">Platform Admin</option>
            </select>
          </Field>
          {errors.non_field_errors && (
            <div className="alert alert-danger" style={{ marginTop:'1rem' }}>
              {errors.non_field_errors.join(' ')}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-navy" disabled={loading}>
            {loading ? <><span className="spinner" /> Creating…</> : <><i className="bi bi-person-plus" /> Create User</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Edit User Modal ──────────────────────────────────────────────────────────
function EditUserModal({ user, onClose, onSuccess }) {
  const [form, setForm] = useState({
    first_name: user.first_name || '',
    last_name:  user.last_name  || '',
    email:      user.email      || '',
    phone:      user.phone      || '',
    company:    user.company    || '',
    role:       user.role       || 'client',
  });
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const set = (k, v) => { setForm(p => ({ ...p, [k]:v })); setErrors(p => ({ ...p, [k]:'' })); };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setErrors({});
    try {
      await adminUserApi.update(user.id, form);
      onSuccess();
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === 'object') setErrors(data);
      else setErrors({ non_field_errors:['Update failed. Please try again.'] });
    } finally { setLoading(false); }
  };

  return (
    <Modal title={`Edit — ${user.full_name || user.username}`} icon="pencil" onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-grid2">
            <Field label="First Name" error={errors.first_name}>
              <input className={`form-control ${errors.first_name ? 'is-invalid':''}`} value={form.first_name}
                onChange={e => set('first_name', e.target.value)} />
            </Field>
            <Field label="Last Name" error={errors.last_name}>
              <input className={`form-control ${errors.last_name ? 'is-invalid':''}`} value={form.last_name}
                onChange={e => set('last_name', e.target.value)} />
            </Field>
            <Field label="Email" error={errors.email}>
              <input type="email" className={`form-control ${errors.email ? 'is-invalid':''}`} value={form.email}
                onChange={e => set('email', e.target.value)} required />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <input className="form-control" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+254 700 000000" />
            </Field>
            <Field label="Company" error={errors.company}>
              <input className="form-control" value={form.company} onChange={e => set('company', e.target.value)} />
            </Field>
            <Field label="Role" error={errors.role}>
              <select className="form-control" value={form.role} onChange={e => set('role', e.target.value)}>
                <option value="client">Client</option>
                <option value="owner">Fleet Owner</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
          </div>
          {errors.non_field_errors && (
            <div className="alert alert-danger" style={{ marginTop:'1rem' }}>{errors.non_field_errors.join(' ')}</div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-navy" disabled={loading}>
            {loading ? <><span className="spinner" /> Saving…</> : <><i className="bi bi-check-lg" /> Save Changes</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── User Detail Modal ────────────────────────────────────────────────────────
function UserDetailModal({ user, onClose, onEdit, onEmail, onToggle }) {
  const [fullUser, setFullUser] = useState(user);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await adminUserApi.detail(user.id);
        setFullUser(r.data);
      } catch {} finally { setLoading(false); }
    })();
  }, [user.id]);

  const u = fullUser;

  return (
    <Modal title="User Profile" icon="person-circle" onClose={onClose} wide>
      <div className="modal-body">
        {loading ? (
          <div style={{ textAlign:'center', padding:'2rem' }}><span className="spinner spinner-dark" /></div>
        ) : (
          <>
            {/* Avatar + header */}
            <div style={{ display:'flex', alignItems:'center', gap:'1.25rem', marginBottom:'1.5rem', padding:'1.25rem', background:'linear-gradient(135deg, #0b1d3a 0%, #1e3a6e 100%)', borderRadius:10 }}>
              <div style={{ width:60, height:60, borderRadius:'50%', background:'rgba(201,168,76,0.2)', border:'2px solid var(--gold)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', fontWeight:800, color:'var(--gold)', flexShrink:0 }}>
                {(u.full_name || u.username || '?')[0].toUpperCase()}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'1.15rem', fontWeight:700, color:'white' }}>{u.full_name || u.username}</div>
                <div style={{ fontSize:'0.83rem', color:'rgba(255,255,255,0.6)' }}>{u.email}</div>
                <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.5rem', flexWrap:'wrap' }}>
                  <span className={`badge ${roleColor(u.role)}`}>{u.role}</span>
                  <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>{u.is_active ? 'Active' : 'Inactive'}</span>
                  {u.membership_tier && <span className={`badge ${tierColor(u.membership_tier)}`}>{u.membership_tier}</span>}
                </div>
              </div>
            </div>

            {/* Info grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem 1.5rem' }}>
              <InfoRow icon="hash"            label="User ID"         value={`#${u.id}`} />
              <InfoRow icon="person"          label="Username"        value={u.username} />
              <InfoRow icon="telephone"       label="Phone"           value={u.phone || '—'} />
              <InfoRow icon="building"        label="Company"         value={u.company || '—'} />
              <InfoRow icon="calendar"        label="Member Since"    value={fmtDate(u.created_at)} />
              <InfoRow icon="circle"          label="Membership"      value={u.membership_status || 'None'} />
              <InfoRow icon="star"            label="Tier"            value={u.membership_tier || '—'} />
            </div>
          </>
        )}
      </div>
      <div className="modal-footer" style={{ justifyContent:'space-between' }}>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={onEmail}><i className="bi bi-envelope" /> Email</button>
          <button className="btn btn-ghost btn-sm" style={{ color: u.is_active ? 'var(--red)' : 'var(--green)' }} onClick={onToggle}>
            <i className={`bi bi-${u.is_active ? 'lock' : 'unlock'}`} /> {u.is_active ? 'Deactivate' : 'Activate'}
          </button>
        </div>
        <div style={{ display:'flex', gap:'0.5rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
          <button className="btn btn-navy btn-sm" onClick={onEdit}><i className="bi bi-pencil" /> Edit Profile</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Send Email Modal ─────────────────────────────────────────────────────────
function SendEmailModal({ user, onClose, onSuccess }) {
  const TEMPLATES = {
    '':         { subject:'', body:'' },
    welcome:    { subject:`Welcome to NairobiJetHouse, ${user.full_name || user.username}!`, body:`Dear ${user.full_name || user.username},\n\nWelcome to NairobiJetHouse — your gateway to private aviation and luxury charter.\n\nYour account is now active. Explore our fleet and book your first flight at your convenience.\n\nShould you need any assistance, your dedicated concierge is always available.\n\nWarm regards,\nNairobiJetHouse Team` },
    membership: { subject:`Your NairobiJetHouse Membership Update`, body:`Dear ${user.full_name || user.username},\n\nWe'd like to update you on your current membership status.\n\nPlease contact us if you have any questions or would like to upgrade your plan.\n\nWarm regards,\nNairobiJetHouse Team` },
    renewal:    { subject:`Membership Renewal Reminder — NairobiJetHouse`, body:`Dear ${user.full_name || user.username},\n\nYour NairobiJetHouse membership is due for renewal soon.\n\nTo ensure uninterrupted access to our fleet and exclusive member benefits, please renew at your earliest convenience.\n\nWarm regards,\nNairobiJetHouse Team` },
  };

  const [template, setTemplate] = useState('');
  const [form,     setForm]     = useState({ subject:'', body:'' });
  const [loading,  setLoading]  = useState(false);

  const applyTemplate = key => {
    setTemplate(key);
    setForm({ subject: TEMPLATES[key].subject, body: TEMPLATES[key].body });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminUserApi.sendEmail(user.id, { subject: form.subject, body: form.body });
      onSuccess();
    } catch { /* surface error if needed */ }
    finally { setLoading(false); }
  };

  return (
    <Modal title={`Email — ${user.full_name || user.username}`} icon="envelope" onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        <div className="modal-body" style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem 1rem', background:'var(--gray-50)', borderRadius:8, fontSize:'0.82rem', color:'var(--gray-500)' }}>
            <i className="bi bi-envelope-at" style={{ color:'var(--navy)' }} />
            <span>To: <strong style={{ color:'var(--gray-700)' }}>{user.full_name || user.username}</strong> &lt;{user.email}&gt;</span>
          </div>

          <Field label="Quick Template">
            <select className="form-control" value={template} onChange={e => applyTemplate(e.target.value)}>
              <option value="">— Select a template or write custom —</option>
              <option value="welcome">Welcome message</option>
              <option value="membership">Membership update</option>
              <option value="renewal">Renewal reminder</option>
            </select>
          </Field>

          <Field label="Subject *">
            <input className="form-control" value={form.subject} required
              onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Email subject…" />
          </Field>
          <Field label="Message *">
            <textarea className="form-control" rows={8} value={form.body} required
              onChange={e => setForm(p => ({ ...p, body: e.target.value }))} placeholder="Type your message here…"
              style={{ resize:'vertical', fontFamily:'inherit', fontSize:'0.88rem', lineHeight:1.6 }} />
          </Field>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-navy" disabled={loading}>
            {loading ? <><span className="spinner" /> Sending…</> : <><i className="bi bi-send" /> Send Email</>}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Shared UI atoms ──────────────────────────────────────────────────────────
function Modal({ title, icon, onClose, children, wide }) {
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: wide ? 640 : 480, width:'95%' }}>
        <div className="modal-header">
          <div className="modal-title">
            <i className={`bi bi-${icon}`} style={{ marginRight:'0.5rem' }} />{title}
          </div>
          <button className="modal-close" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="form-group" style={{ marginBottom:'0.1rem' }}>
      <label className="form-label">{label}</label>
      {children}
      {error && <div className="invalid-feedback" style={{ display:'block', fontSize:'0.78rem', color:'var(--red)', marginTop:'0.25rem' }}>{Array.isArray(error) ? error.join(' ') : error}</div>}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:'0.6rem', padding:'0.5rem 0', borderBottom:'1px solid var(--gray-100)' }}>
      <i className={`bi bi-${icon}`} style={{ color:'var(--navy)', opacity:0.6, marginTop:'1px', flexShrink:0 }} />
      <div>
        <div style={{ fontSize:'0.72rem', color:'var(--gray-400)', textTransform:'uppercase', letterSpacing:'0.04em' }}>{label}</div>
        <div style={{ fontSize:'0.88rem', color:'var(--gray-700)', fontWeight:500 }}>{value}</div>
      </div>
    </div>
  );
}

function SectionTitle({ children, style }) {
  return (
    <div style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--navy)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.75rem', paddingBottom:'0.4rem', borderBottom:'2px solid var(--gold)', ...style }}>
      {children}
    </div>
  );
}

// .form-grid2 helper — add to your global CSS if not already present:
// .form-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem 1.25rem; }
// @media (max-width: 520px) { .form-grid2 { grid-template-columns: 1fr; } }

export default AdminUsersPage;