"""
NairobiJetHouse — main URL configuration
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView, TokenRefreshView, TokenVerifyView,
)

# ── import all viewsets ───────────────────────────────────────────────────────
from core.views import (
    # Public
    AirportViewSet, AircraftViewSet, YachtViewSet,
    FlightBookingViewSet, YachtCharterViewSet,
    LeaseInquiryViewSet, FlightInquiryViewSet, QuickQuoteView,
    ContactInquiryViewSet, GroupCharterInquiryViewSet,
    AirCargoInquiryViewSet, AircraftSalesInquiryViewSet,
    # Auth / Membership
    AuthViewSet, MembershipTierViewSet, MembershipViewSet,
    MarketplaceAircraftViewSet, MaintenanceLogViewSet,
    MarketplaceBookingViewSet, CommissionSettingViewSet,
    PaymentRecordViewSet, SavedRouteViewSet, DisputeViewSet,
    ClientDashboardViewSet, OwnerDashboardViewSet, AdminDashboardViewSet,
    # Admin-only
    EmailLogViewSet, PriceCalculatorViewSet,
    FlightBookingAdminViewSet, YachtCharterAdminViewSet,
    LeaseInquiryAdminViewSet, ContactInquiryAdminViewSet,
    GroupCharterAdminViewSet, AirCargoAdminViewSet,
    AircraftSalesAdminViewSet, FlightInquiryAdminViewSet,
    MarketplaceBookingAdminViewSet, UserAdminViewSet,
    AdminOverviewViewSet,
)

router = DefaultRouter()

# ── Public endpoints ──────────────────────────────────────────────────────────
router.register(r'airports',          AirportViewSet,              basename='airport')
router.register(r'aircraft',          AircraftViewSet,             basename='aircraft')
router.register(r'yachts',            YachtViewSet,                basename='yacht')
router.register(r'bookings',          FlightBookingViewSet,        basename='booking')
router.register(r'charters',          YachtCharterViewSet,         basename='charter')
router.register(r'leases',            LeaseInquiryViewSet,         basename='lease')
router.register(r'flight-inquiries',  FlightInquiryViewSet,        basename='flight-inquiry')
router.register(r'contacts',          ContactInquiryViewSet,       basename='contact')
router.register(r'group-charters',    GroupCharterInquiryViewSet,  basename='group-charter')
router.register(r'cargo',             AirCargoInquiryViewSet,      basename='cargo')
router.register(r'aircraft-sales',    AircraftSalesInquiryViewSet, basename='aircraft-sales')

# ── Auth ──────────────────────────────────────────────────────────────────────
router.register(r'auth',              AuthViewSet,                 basename='auth')

# ── Membership / Marketplace ──────────────────────────────────────────────────
router.register(r'membership-tiers',  MembershipTierViewSet,       basename='membership-tier')
router.register(r'memberships',       MembershipViewSet,           basename='membership')
router.register(r'marketplace',       MarketplaceAircraftViewSet,  basename='marketplace')
router.register(r'maintenance',       MaintenanceLogViewSet,       basename='maintenance')
router.register(r'my-bookings',       MarketplaceBookingViewSet,   basename='my-booking')
router.register(r'commissions',       CommissionSettingViewSet,    basename='commission')
router.register(r'payments',          PaymentRecordViewSet,        basename='payment')
router.register(r'saved-routes',      SavedRouteViewSet,           basename='saved-route')
router.register(r'disputes',          DisputeViewSet,              basename='dispute')

# ── Dashboards ────────────────────────────────────────────────────────────────
router.register(r'dashboard/client',  ClientDashboardViewSet,      basename='client-dashboard')
router.register(r'dashboard/owner',   OwnerDashboardViewSet,       basename='owner-dashboard')
router.register(r'dashboard/admin',   AdminDashboardViewSet,       basename='admin-dashboard')

# ── Admin management ──────────────────────────────────────────────────────────
router.register(r'admin/email-logs',           EmailLogViewSet,                basename='email-log')
router.register(r'admin/price-calculator',     PriceCalculatorViewSet,         basename='price-calc')
router.register(r'admin/flight-bookings',      FlightBookingAdminViewSet,      basename='admin-flight')
router.register(r'admin/yacht-charters',       YachtCharterAdminViewSet,       basename='admin-yacht')
router.register(r'admin/leases',               LeaseInquiryAdminViewSet,       basename='admin-lease')
router.register(r'admin/contacts',             ContactInquiryAdminViewSet,     basename='admin-contact')
router.register(r'admin/group-charters',       GroupCharterAdminViewSet,       basename='admin-group')
router.register(r'admin/cargo',                AirCargoAdminViewSet,           basename='admin-cargo')
router.register(r'admin/aircraft-sales',       AircraftSalesAdminViewSet,      basename='admin-sales')
router.register(r'admin/flight-inquiries',     FlightInquiryAdminViewSet,      basename='admin-finquiry')
router.register(r'admin/marketplace-bookings', MarketplaceBookingAdminViewSet, basename='admin-mp-booking')
router.register(r'admin/users',                UserAdminViewSet,               basename='admin-user')
router.register(r'admin/overview',             AdminOverviewViewSet,           basename='admin-overview')

urlpatterns = [
    path('admin/',        admin.site.urls),
    path('api/',          include(router.urls)),
    path('api/quick-quote/', QuickQuoteView.as_view(), name='quick-quote'),

    # JWT token endpoints
    path('api/token/',         TokenObtainPairView.as_view(),  name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(),     name='token_refresh'),
    path('api/token/verify/',  TokenVerifyView.as_view(),      name='token_verify'),
]