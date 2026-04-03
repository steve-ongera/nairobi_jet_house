import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api'; // Django backend

// ── Axios instance ────────────────────────────────────────────────────────────
const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Attach token ──────────────────────────────────────────────────────────────
client.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Auto-refresh on 401 ───────────────────────────────────────────────────────
let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach(p => error ? p.reject(error) : p.resolve(token));
  queue = [];
};

client.interceptors.response.use(
  res => res,
  async err => {
    const orig = err.config;
    if (err.response?.status === 401 && !orig._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then(token => {
          orig.headers.Authorization = `Bearer ${token}`;
          return client(orig);
        });
      }
      orig._retry  = true;
      isRefreshing = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        const res = await axios.post(`${BASE_URL}/token/refresh/`, { refresh });
        const newToken = res.data.access;
        localStorage.setItem('access_token', newToken);
        client.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        orig.headers.Authorization = `Bearer ${newToken}`;
        return client(orig);
      } catch (e) {
        processQueue(e, null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const get    = (url, params)       => client.get(url, { params });
const post   = (url, data)         => client.post(url, data);
const patch  = (url, data)         => client.patch(url, data);
const put    = (url, data)         => client.put(url, data);
const del    = (url)               => client.delete(url);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register:      data => post('/auth/register/', data),
  login:         data => post('/auth/login/', data),
  logout:        data => post('/auth/logout/', data),
  me:            ()   => get('/auth/me/'),
  updateProfile: data => patch('/auth/update_profile/', data),
};

// ── Airports & Fleet (public) ─────────────────────────────────────────────────
export const fleetApi = {
  airports:         params => get('/airports/', params),
  aircraftList:     params => get('/aircraft/', params),
  aircraftDetail:   id     => get(`/aircraft/${id}/`),
  yachtList:        params => get('/yachts/', params),
  yachtDetail:      id     => get(`/yachts/${id}/`),
  quickQuote:       data   => post('/quick-quote/', data),
};

// ── Public Bookings / Inquiries ───────────────────────────────────────────────
export const bookingApi = {
  // Flight bookings
  createFlight:   data      => post('/bookings/', data),
  trackFlight:    reference => get(`/bookings/track/${reference}/`),
  myFlights:      email     => get('/bookings/', { email }),
  // Yacht charters
  createYacht:    data      => post('/charters/', data),
  trackYacht:     reference => get(`/charters/track/${reference}/`),
  // Quick quote
  quickQuote:     data      => post('/quick-quote/', data),
};

// ── Inquiries ─────────────────────────────────────────────────────────────────
export const inquiryApi = {
  contact:         data => post('/contacts/', data),
  lease:           data => post('/leases/', data),
  flightInquiry:   data => post('/flight-inquiries/', data),
  groupCharter:    data => post('/group-charters/', data),
  cargo:           data => post('/cargo/', data),
  aircraftSales:   data => post('/aircraft-sales/', data),
};

// ── Careers (public) ──────────────────────────────────────────────────────────
export const careersApi = {
  list:    params => get('/jobs/', params),
  detail:  id     => get(`/jobs/${id}/`),
  apply:   data   => post('/job-applications/', data),
  track:   ref    => get('/job-applications/track/', { reference: ref }),
};

// ── Membership ────────────────────────────────────────────────────────────────
export const membershipApi = {
  tiers:        ()     => get('/membership-tiers/'),
  mine:         ()     => get('/memberships/my_membership/'),
  subscribe:    data   => post('/memberships/subscribe/', data),
};

// ── Member: Marketplace bookings ──────────────────────────────────────────────
export const memberApi = {
  fleet:            params => get('/marketplace/', params),
  aircraftDetail:   id     => get(`/marketplace/${id}/`),
  createBooking:    data   => post('/my-bookings/', data),
  myBookings:       ()     => get('/my-bookings/'),
  cancelBooking:    id     => post(`/my-bookings/${id}/cancel/`),
  payments:         ()     => get('/payments/'),
  savedRoutes:      ()     => get('/saved-routes/'),
  saveRoute:        data   => post('/saved-routes/', data),
  deleteRoute:      id     => del(`/saved-routes/${id}/`),
  dashboard:        ()     => get('/dashboard/client/summary/'),
  disputes:         ()     => get('/disputes/'),
  raiseDispute:     data   => post('/disputes/', data),
};

// ── Owner ─────────────────────────────────────────────────────────────────────
export const ownerApi = {
  dashboard:        ()     => get('/dashboard/owner/summary/'),
  aircraft:         ()     => get('/marketplace/'),
  addAircraft:      data   => post('/marketplace/', data),
  updateAircraft:   (id,d) => patch(`/marketplace/${id}/`, d),
  logHours:         (id,h) => post(`/marketplace/${id}/log_flight_hours/`, { hours: h }),
  updateStatus:     (id,s) => post(`/marketplace/${id}/update_status/`, { status: s }),
  maintenance:      ()     => get('/maintenance/'),
  addMaintenance:   data   => post('/maintenance/', data),
  maintenanceAlerts: ()    => get('/maintenance/alerts/'),
  bookings:         ()     => get('/my-bookings/'),
};

// ── Admin: Overview ───────────────────────────────────────────────────────────
export const adminOverviewApi = {
  summary:         ()       => get('/admin/overview/inquiries_summary/'),
  usersSummary:    ()       => get('/admin/overview/users_summary/'),
  revenueChart:    params   => get('/admin/overview/revenue_chart/', params),
  combinedRevenue: ()       => get('/admin/overview/combined_revenue/'),
  dashSummary:     ()       => get('/dashboard/admin/summary/'),
};

// ── Admin: Flight Bookings ────────────────────────────────────────────────────
export const adminFlightApi = {
  list:          params     => get('/admin/flight-bookings/', params),
  detail:        id         => get(`/admin/flight-bookings/${id}/`),
  create:        data       => post('/admin/flight-bookings/', data),
  update:        (id, data) => patch(`/admin/flight-bookings/${id}/`, data),
  delete:        id         => del(`/admin/flight-bookings/${id}/`),
  setPrice:      (id, data) => post(`/admin/flight-bookings/${id}/set_price/`, data),
  reply:         (id, data) => post(`/admin/flight-bookings/${id}/reply/`, data),
  updateStatus:  (id, s)    => patch(`/admin/flight-bookings/${id}/update_status/`, { status: s }),
};

// ── Admin: Yacht Charters ─────────────────────────────────────────────────────
export const adminYachtApi = {
  list:         params     => get('/admin/yacht-charters/', params),
  detail:       id         => get(`/admin/yacht-charters/${id}/`),
  setPrice:     (id, data) => post(`/admin/yacht-charters/${id}/set_price/`, data),
  reply:        (id, data) => post(`/admin/yacht-charters/${id}/reply/`, data),
  updateStatus: (id, s)    => patch(`/admin/yacht-charters/${id}/update_status/`, { status: s }),
};

// ── Admin: Various Inquiries ──────────────────────────────────────────────────
export const adminInquiryApi = {
  leases:       params     => get('/admin/leases/', params),
  replyLease:   (id, data) => post(`/admin/leases/${id}/reply/`, data),
  contacts:     params     => get('/admin/contacts/', params),
  replyContact: (id, data) => post(`/admin/contacts/${id}/reply/`, data),
  groups:       params     => get('/admin/group-charters/', params),
  replyGroup:   (id, data) => post(`/admin/group-charters/${id}/reply/`, data),
  cargo:        params     => get('/admin/cargo/', params),
  replyCargo:   (id, data) => post(`/admin/cargo/${id}/reply/`, data),
  sales:        params     => get('/admin/aircraft-sales/', params),
  replySales:   (id, data) => post(`/admin/aircraft-sales/${id}/reply/`, data),
  flightInq:    params     => get('/admin/flight-inquiries/', params),
  replyFlight:  (id, data) => post(`/admin/flight-inquiries/${id}/reply/`, data),
};

// ── Admin: Users ──────────────────────────────────────────────────────────────
export const adminUserApi = {
  list:         params     => get('/admin/users/', params),
  detail:       id         => get(`/admin/users/${id}/`),
  update:       (id, data) => patch(`/admin/users/${id}/`, data),
  toggle:       id         => post(`/admin/users/${id}/toggle_active/`),
  sendEmail:    (id, data) => post(`/admin/users/${id}/send_email/`, data),
  memberships:  ()         => get('/memberships/'),
  commissions:  ()         => get('/commissions/'),
  setCommission: data      => post('/commissions/', data),
};

// ── Admin: Marketplace ────────────────────────────────────────────────────────
export const adminMarketApi = {
  list:         params     => get('/admin/marketplace-bookings/', params),
  approve:      id         => post(`/marketplace/${id}/approve/`),
  sendConfirm:  (id, data) => post(`/admin/marketplace-bookings/${id}/send_confirmation/`, data),
  updateStatus: (id, s)    => patch(`/admin/marketplace-bookings/${id}/update_status/`, { status: s }),
};

// ── Admin: Email Logs ─────────────────────────────────────────────────────────
export const adminEmailApi = {
  list:   params => get('/admin/email-logs/', params),
  send:   data   => post('/admin/email-logs/send/', data),
};

// ── Admin: Careers ────────────────────────────────────────────────────────────
export const adminCareersApi = {
  jobs:            params     => get('/jobs/', params),
  createJob:       data       => post('/jobs/', data),
  updateJob:       (id, data) => patch(`/jobs/${id}/`, data),
  deleteJob:       id         => del(`/jobs/${id}/`),
  applications:    params     => get('/job-applications/', params),
  updateAppStatus: (id, data) => patch(`/job-applications/${id}/update_status/`, data),
};

// ── Price Calculator ──────────────────────────────────────────────────────────
export const priceCalcApi = {
  calculate: data => post('/admin/price-calculator/calculate/', data),
};

export default client;