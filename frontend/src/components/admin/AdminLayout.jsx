import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../App';
import { Link } from 'react-router-dom';

export default function AdminLayout({ children, title, breadcrumb }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <div className="app-shell">
      {/* Overlay for mobile */}
      {mobileOpen && (
        <div
          className="drawer-overlay open"
          onClick={() => setMobileOpen(false)}
          style={{ zIndex: 699 }}
        />
      )}

      <AdminSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <main className="dash-main">
        <div className="dash-topbar">
          <div className="dash-topbar-left">
            <button className="topbar-menu-btn" onClick={() => setMobileOpen(true)}>
              <i className="bi bi-list" />
            </button>
            <div>
              <div className="topbar-page-title">
                <i className="bi bi-shield-check" style={{ color: 'var(--gold)' }} />
                {title || 'Admin'}
              </div>
              {breadcrumb && (
                <div className="topbar-breadcrumb">
                  Admin / <span>{breadcrumb}</span>
                </div>
              )}
            </div>
          </div>
          <div className="dash-topbar-right">
            <button className="topbar-notif">
              <i className="bi bi-bell" />
              <span className="notif-dot" />
            </button>
            <div className="dash-user-chip">
              <div className="dash-user-chip-avatar">
                {(user?.first_name || user?.username || '?')[0].toUpperCase()}
              </div>
              {user?.first_name || user?.username}
            </div>
          </div>
        </div>

        <div className="dash-content">
          {children}
        </div>
      </main>
    </div>
  );
}