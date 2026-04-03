import React, { useState } from 'react';
import MemberSidebar from './MemberSidebar';
import { useAuth } from '../../App';

export default function MemberLayout({ children, title, breadcrumb }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="app-shell">
      {mobileOpen && (
        <div className="drawer-overlay open" onClick={() => setMobileOpen(false)} style={{ zIndex: 699 }} />
      )}
      <MemberSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="dash-main">
        <div className="dash-topbar">
          <div className="dash-topbar-left">
            <button className="topbar-menu-btn" onClick={() => setMobileOpen(true)}>
              <i className="bi bi-list" />
            </button>
            <div>
              <div className="topbar-page-title">
                <i className="bi bi-star-fill" style={{ color: 'var(--gold)' }} />
                {title || 'Member'}
              </div>
              {breadcrumb && <div className="topbar-breadcrumb">Member / <span>{breadcrumb}</span></div>}
            </div>
          </div>
          <div className="dash-topbar-right">
            <div className="dash-user-chip">
              <div className="dash-user-chip-avatar">
                {(user?.first_name || user?.username || '?')[0].toUpperCase()}
              </div>
              {user?.membership_tier || 'Member'}
            </div>
          </div>
        </div>
        <div className="dash-content">{children}</div>
      </main>
    </div>
  );
}