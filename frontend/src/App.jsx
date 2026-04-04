import React, { createContext, useContext, useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { authApi } from './services/api';

// ── Normal Pages ──────────────────────────────────────────────────────────────
import HomePage             from './pages/normal/HomePage';
import FleetPage            from './pages/normal/FleetPage';
import YachtsPage           from './pages/normal/YachtsPage';
import ServicesPage         from './pages/normal/ServicesPage';
import BookFlightPage       from './pages/normal/BookFlightPage';
import BookYachtPage        from './pages/normal/BookYachtPage';
import TrackBookingPage     from './pages/normal/TrackBookingPage';
import CareersPage          from './pages/normal/CareersPage';
import CareersApplyPage     from './pages/normal/CareersApplyPage';
import ContactPage          from './pages/normal/ContactPage';
import AboutPage            from './pages/normal/AboutPage';
import MembershipPublicPage from './pages/normal/MembershipPublicPage';
import LoginPage            from './pages/normal/LoginPage';
import RegisterPage         from './pages/normal/RegisterPage';
import NotFoundPage         from './pages/normal/NotFoundPage';
import FlightInquiryPage    from './pages/normal/FlightInquiryPage';
import YachtCharterPage     from './pages/normal/YachtCharterPage';

// ── Admin Pages ───────────────────────────────────────────────────────────────
import AdminDashboardPage      from './pages/admin/AdminDashboardPage';
import AdminFlightBookingsPage from './pages/admin/AdminFlightBookingsPage';
import AdminYachtChartersPage  from './pages/admin/AdminYachtChartersPage';
import AdminInquiriesPage      from './pages/admin/AdminInquiriesPage';
import AdminUsersPage          from './pages/admin/AdminUsersPage';
import AdminMarketplacePage    from './pages/admin/AdminMarketplacePage';
import AdminEmailLogsPage      from './pages/admin/AdminEmailLogsPage';
import AdminCareersPage        from './pages/admin/AdminCareersPage';
import AdminSettingsPage       from './pages/admin/AdminSettingsPage';

// ── Staff Pages ───────────────────────────────────────────────────────────────
import StaffDashboardPage  from './pages/staff/StaffDashboardPage';
import StaffBookingsPage   from './pages/staff/StaffBookingsPage';
import StaffInquiriesPage  from './pages/staff/StaffInquiriesPage';
import StaffEmailPage      from './pages/staff/StaffEmailPage';

// ── Membership Pages ──────────────────────────────────────────────────────────
import MemberDashboardPage from './pages/membership/MemberDashboardPage';
import MemberBookPage      from './pages/membership/MemberBookPage';
import MemberFleetPage     from './pages/membership/MemberFleetPage';
import MemberPaymentsPage  from './pages/membership/MemberPaymentsPage';
import MemberProfilePage   from './pages/membership/MemberProfilePage';
import MemberRoutesPage    from './pages/membership/MemberRoutesPage';

// ── Owner Pages ───────────────────────────────────────────────────────────────
import OwnerDashboardPage   from './pages/owner/OwnerDashboardPage';
import OwnerAircraftPage    from './pages/owner/OwnerAircraftPage';
import OwnerMaintenancePage from './pages/owner/OwnerMaintenancePage';
import OwnerRevenueePage    from './pages/owner/OwnerRevenuePage';

// ── Auth Context ──────────────────────────────────────────────────────────────
export const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      authApi.me()
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await authApi.login({ username, password });
    localStorage.setItem('access_token',  res.data.tokens.access);
    localStorage.setItem('refresh_token', res.data.tokens.refresh);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = async () => {
    try {
      await authApi.logout({ refresh: localStorage.getItem('refresh_token') });
    } catch {}
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Route Guards ──────────────────────────────────────────────────────────────
function RequireAuth({ roles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="page-loader"><span className="spinner-ring" /></div>;
  if (!user)   return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role))
    return <Navigate to="/" replace />;
  return children;
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* ── Public ──────────────────────────────────────────────────────── */}
        <Route path="/"               element={<HomePage />} />
        <Route path="/fleet"          element={<FleetPage />} />
        <Route path="/yachts"         element={<YachtsPage />} />
        <Route path="/services"       element={<ServicesPage />} />
        <Route path="/book-flight"    element={<BookFlightPage />} />
        <Route path="/book-yacht"     element={<BookYachtPage />} />
        <Route path="/flight-inquiry" element={<FlightInquiryPage />} />
        <Route path="/yacht-charter"  element={<YachtCharterPage />} />
        <Route path="/track"          element={<TrackBookingPage />} />
        <Route path="/careers"        element={<CareersPage />} />
        <Route path="/careers/:id/apply" element={<CareersApplyPage />} />
        <Route path="/contact"        element={<ContactPage />} />
        <Route path="/about"          element={<AboutPage />} />
        <Route path="/membership"     element={<MembershipPublicPage />} />
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/register"       element={<RegisterPage />} />

        {/* ── Admin ───────────────────────────────────────────────────────── */}
        <Route path="/admin"
          element={<RequireAuth roles={['admin']}><AdminDashboardPage /></RequireAuth>} />
        <Route path="/admin/flights"
          element={<RequireAuth roles={['admin']}><AdminFlightBookingsPage /></RequireAuth>} />
        <Route path="/admin/yachts"
          element={<RequireAuth roles={['admin']}><AdminYachtChartersPage /></RequireAuth>} />
        <Route path="/admin/inquiries"
          element={<RequireAuth roles={['admin']}><AdminInquiriesPage /></RequireAuth>} />
        <Route path="/admin/users"
          element={<RequireAuth roles={['admin']}><AdminUsersPage /></RequireAuth>} />
        <Route path="/admin/marketplace"
          element={<RequireAuth roles={['admin']}><AdminMarketplacePage /></RequireAuth>} />
        <Route path="/admin/emails"
          element={<RequireAuth roles={['admin']}><AdminEmailLogsPage /></RequireAuth>} />
        <Route path="/admin/careers"
          element={<RequireAuth roles={['admin']}><AdminCareersPage /></RequireAuth>} />
        <Route path="/admin/settings"
          element={<RequireAuth roles={['admin']}><AdminSettingsPage /></RequireAuth>} />

        {/* ── Staff ───────────────────────────────────────────────────────── */}
        <Route path="/staff"
          element={<RequireAuth roles={['admin','staff']}><StaffDashboardPage /></RequireAuth>} />
        <Route path="/staff/bookings"
          element={<RequireAuth roles={['admin','staff']}><StaffBookingsPage /></RequireAuth>} />
        <Route path="/staff/inquiries"
          element={<RequireAuth roles={['admin','staff']}><StaffInquiriesPage /></RequireAuth>} />
        <Route path="/staff/email"
          element={<RequireAuth roles={['admin','staff']}><StaffEmailPage /></RequireAuth>} />

        {/* ── Membership ──────────────────────────────────────────────────── */}
        <Route path="/member"
          element={<RequireAuth roles={['client']}><MemberDashboardPage /></RequireAuth>} />
        <Route path="/member/book"
          element={<RequireAuth roles={['client']}><MemberBookPage /></RequireAuth>} />
        <Route path="/member/fleet"
          element={<RequireAuth roles={['client']}><MemberFleetPage /></RequireAuth>} />
        <Route path="/member/payments"
          element={<RequireAuth roles={['client']}><MemberPaymentsPage /></RequireAuth>} />
        <Route path="/member/profile"
          element={<RequireAuth roles={['client']}><MemberProfilePage /></RequireAuth>} />
        <Route path="/member/routes"
          element={<RequireAuth roles={['client']}><MemberRoutesPage /></RequireAuth>} />

        {/* ── Owner ───────────────────────────────────────────────────────── */}
        <Route path="/owner"
          element={<RequireAuth roles={['owner']}><OwnerDashboardPage /></RequireAuth>} />
        <Route path="/owner/aircraft"
          element={<RequireAuth roles={['owner']}><OwnerAircraftPage /></RequireAuth>} />
        <Route path="/owner/maintenance"
          element={<RequireAuth roles={['owner']}><OwnerMaintenancePage /></RequireAuth>} />
        <Route path="/owner/revenue"
          element={<RequireAuth roles={['owner']}><OwnerRevenueePage /></RequireAuth>} />

        {/* ── 404 ─────────────────────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </AuthProvider>
  );
}