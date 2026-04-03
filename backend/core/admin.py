from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import (
    Airport, Aircraft, Yacht,
    FlightBooking, FlightLeg, YachtCharter,
    LeaseInquiry, FlightInquiry, ContactInquiry,
    GroupCharterInquiry, AirCargoInquiry, AircraftSalesInquiry,
    User, MembershipTier, Membership,
    MarketplaceAircraft, MaintenanceLog, MarketplaceBooking,
    CommissionSetting, PaymentRecord, SavedRoute, Dispute,
    EmailLog, JobPosting, JobApplication,
)


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def status_badge(value, color_map):
    color = color_map.get(value, '#6c757d')
    return format_html(
        '<span style="background:{};color:#fff;padding:2px 8px;border-radius:4px;font-size:11px">{}</span>',
        color, value.upper().replace('_', ' ')
    )


# ─────────────────────────────────────────────────────────────────────────────
# CORE ASSETS
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(Airport)
class AirportAdmin(admin.ModelAdmin):
    list_display  = ('code', 'name', 'city', 'country')
    search_fields = ('code', 'name', 'city', 'country')
    list_filter   = ('country',)
    ordering      = ('code',)


@admin.register(Aircraft)
class AircraftAdmin(admin.ModelAdmin):
    list_display  = ('name', 'model', 'category', 'passenger_capacity', 'range_km', 'hourly_rate_usd', 'is_available')
    list_filter   = ('category', 'is_available')
    search_fields = ('name', 'model')
    list_editable = ('is_available',)
    ordering      = ('category', 'name')


@admin.register(Yacht)
class YachtAdmin(admin.ModelAdmin):
    list_display  = ('name', 'size_category', 'length_meters', 'guest_capacity', 'crew_count', 'daily_rate_usd', 'home_port', 'is_available')
    list_filter   = ('size_category', 'is_available')
    search_fields = ('name', 'home_port')
    list_editable = ('is_available',)
    ordering      = ('size_category', 'name')


# ─────────────────────────────────────────────────────────────────────────────
# FLIGHT BOOKINGS
# ─────────────────────────────────────────────────────────────────────────────

class FlightLegInline(admin.TabularInline):
    model  = FlightLeg
    extra  = 0
    fields = ('leg_number', 'origin', 'destination', 'departure_date', 'departure_time')


@admin.register(FlightBooking)
class FlightBookingAdmin(admin.ModelAdmin):
    list_display  = ('reference_short', 'guest_name', 'guest_email', 'route', 'departure_date',
                     'passenger_count', 'aircraft', 'quoted_price_usd', 'commission_usd', 'status_badge_col', 'created_at')
    list_filter   = ('status', 'trip_type', 'catering_requested', 'ground_transport_requested', 'concierge_requested')
    search_fields = ('guest_name', 'guest_email', 'guest_phone', 'company', 'reference')
    readonly_fields = ('reference', 'commission_usd', 'net_revenue_usd', 'created_at', 'updated_at')
    date_hierarchy  = 'departure_date'
    ordering        = ('-created_at',)
    inlines         = [FlightLegInline]

    fieldsets = (
        ('Reference', {'fields': ('reference',)}),
        ('Guest', {'fields': ('guest_name', 'guest_email', 'guest_phone', 'company')}),
        ('Flight Details', {'fields': ('trip_type', 'origin', 'destination', 'departure_date',
                                       'departure_time', 'return_date', 'passenger_count', 'aircraft')}),
        ('Extras', {'fields': ('special_requests', 'catering_requested',
                               'ground_transport_requested', 'concierge_requested')}),
        ('Pricing & Commission', {'fields': ('quoted_price_usd', 'commission_pct',
                                             'commission_usd', 'net_revenue_usd')}),
        ('Status & Timestamps', {'fields': ('status', 'created_at', 'updated_at')}),
    )

    @admin.display(description='Ref')
    def reference_short(self, obj):
        return str(obj.reference)[:8].upper()

    @admin.display(description='Route')
    def route(self, obj):
        return f"{obj.origin.code} → {obj.destination.code}"

    @admin.display(description='Status')
    def status_badge_col(self, obj):
        colors = {
            'inquiry': '#6c757d', 'quoted': '#0d6efd', 'confirmed': '#198754',
            'in_flight': '#0dcaf0', 'completed': '#20c997', 'cancelled': '#dc3545',
        }
        return status_badge(obj.status, colors)
    status_badge_col.allow_tags = True


# ─────────────────────────────────────────────────────────────────────────────
# YACHT CHARTERS
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(YachtCharter)
class YachtCharterAdmin(admin.ModelAdmin):
    list_display  = ('reference_short', 'guest_name', 'guest_email', 'yacht', 'departure_port',
                     'charter_start', 'charter_end', 'guest_count', 'quoted_price_usd', 'status_badge_col', 'created_at')
    list_filter   = ('status',)
    search_fields = ('guest_name', 'guest_email', 'guest_phone', 'departure_port', 'destination_port')
    readonly_fields = ('reference', 'created_at', 'updated_at')
    date_hierarchy  = 'charter_start'
    ordering        = ('-created_at',)

    @admin.display(description='Ref')
    def reference_short(self, obj):
        return str(obj.reference)[:8].upper()

    @admin.display(description='Status')
    def status_badge_col(self, obj):
        colors = {
            'inquiry': '#6c757d', 'quoted': '#0d6efd', 'confirmed': '#198754',
            'active': '#0dcaf0', 'completed': '#20c997', 'cancelled': '#dc3545',
        }
        return status_badge(obj.status, colors)


# ─────────────────────────────────────────────────────────────────────────────
# INQUIRIES
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(LeaseInquiry)
class LeaseInquiryAdmin(admin.ModelAdmin):
    list_display  = ('reference_short', 'guest_name', 'guest_email', 'asset_type', 'lease_duration',
                     'preferred_start_date', 'budget_range', 'status', 'created_at')
    list_filter   = ('asset_type', 'lease_duration', 'status')
    search_fields = ('guest_name', 'guest_email', 'company')
    readonly_fields = ('reference', 'created_at')
    ordering = ('-created_at',)

    @admin.display(description='Ref')
    def reference_short(self, obj):
        return str(obj.reference)[:8].upper()


@admin.register(FlightInquiry)
class FlightInquiryAdmin(admin.ModelAdmin):
    list_display  = ('reference_short', 'guest_name', 'guest_email', 'origin_description',
                     'destination_description', 'approximate_date', 'passenger_count', 'created_at')
    search_fields = ('guest_name', 'guest_email', 'origin_description', 'destination_description')
    readonly_fields = ('reference', 'created_at')
    ordering = ('-created_at',)

    @admin.display(description='Ref')
    def reference_short(self, obj):
        return str(obj.reference)[:8].upper()


@admin.register(ContactInquiry)
class ContactInquiryAdmin(admin.ModelAdmin):
    list_display  = ('reference_short', 'full_name', 'email', 'phone', 'company', 'subject', 'created_at')
    list_filter   = ('subject',)
    search_fields = ('full_name', 'email', 'company', 'message')
    readonly_fields = ('reference', 'created_at')
    ordering = ('-created_at',)

    @admin.display(description='Ref')
    def reference_short(self, obj):
        return str(obj.reference)[:8].upper()


@admin.register(GroupCharterInquiry)
class GroupCharterInquiryAdmin(admin.ModelAdmin):
    list_display  = ('reference_short', 'contact_name', 'email', 'group_type', 'group_size',
                     'origin_description', 'destination_description', 'departure_date', 'status', 'created_at')
    list_filter   = ('group_type', 'status', 'is_round_trip', 'catering_required', 'ground_transport_required')
    search_fields = ('contact_name', 'email', 'company', 'origin_description', 'destination_description')
    readonly_fields = ('reference', 'created_at')
    ordering = ('-created_at',)

    @admin.display(description='Ref')
    def reference_short(self, obj):
        return str(obj.reference)[:8].upper()


@admin.register(AirCargoInquiry)
class AirCargoInquiryAdmin(admin.ModelAdmin):
    list_display  = ('reference_short', 'contact_name', 'email', 'cargo_type', 'weight_kg',
                     'origin_description', 'destination_description', 'pickup_date',
                     'urgency', 'is_hazardous', 'status', 'created_at')
    list_filter   = ('cargo_type', 'urgency', 'is_hazardous', 'requires_temperature_control',
                     'insurance_required', 'customs_assistance_needed', 'status')
    search_fields = ('contact_name', 'email', 'company', 'origin_description', 'destination_description')
    readonly_fields = ('reference', 'created_at')
    ordering = ('-created_at',)

    @admin.display(description='Ref')
    def reference_short(self, obj):
        return str(obj.reference)[:8].upper()


@admin.register(AircraftSalesInquiry)
class AircraftSalesInquiryAdmin(admin.ModelAdmin):
    list_display  = ('reference_short', 'contact_name', 'email', 'inquiry_type', 'preferred_category',
                     'budget_range', 'new_or_pre_owned', 'status', 'created_at')
    list_filter   = ('inquiry_type', 'preferred_category', 'budget_range', 'new_or_pre_owned', 'status')
    search_fields = ('contact_name', 'email', 'company', 'preferred_make_model', 'aircraft_make', 'aircraft_model')
    readonly_fields = ('reference', 'created_at')
    ordering = ('-created_at',)

    @admin.display(description='Ref')
    def reference_short(self, obj):
        return str(obj.reference)[:8].upper()


# ─────────────────────────────────────────────────────────────────────────────
# USERS & MEMBERSHIP
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display  = ('username', 'email', 'first_name', 'last_name', 'role', 'phone', 'company', 'is_active', 'created_at')
    list_filter   = ('role', 'is_active', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'phone', 'company')
    ordering      = ('-created_at',)
    fieldsets     = BaseUserAdmin.fieldsets + (
        ('Profile', {'fields': ('role', 'phone', 'company', 'avatar_url')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Profile', {'fields': ('role', 'phone', 'company')}),
    )


@admin.register(MembershipTier)
class MembershipTierAdmin(admin.ModelAdmin):
    list_display  = ('name', 'display_name', 'monthly_fee_usd', 'annual_fee_usd',
                     'hourly_discount_pct', 'priority_booking', 'dedicated_support', 'is_active')
    list_editable = ('is_active',)
    search_fields = ('name', 'display_name')


@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display  = ('reference_short', 'user', 'tier', 'status', 'billing_cycle',
                     'start_date', 'end_date', 'auto_renew', 'amount_paid', 'created_at')
    list_filter   = ('status', 'billing_cycle', 'auto_renew', 'tier')
    search_fields = ('user__username', 'user__email', 'stripe_sub_id')
    readonly_fields = ('reference', 'created_at', 'updated_at')
    ordering = ('-created_at',)

    @admin.display(description='Ref')
    def reference_short(self, obj):
        return str(obj.reference)[:8].upper()


# ─────────────────────────────────────────────────────────────────────────────
# MARKETPLACE
# ─────────────────────────────────────────────────────────────────────────────

class MaintenanceLogInline(admin.TabularInline):
    model  = MaintenanceLog
    extra  = 0
    fields = ('maintenance_type', 'status', 'scheduled_date', 'completed_date', 'flight_hours_at', 'cost_usd')
    ordering = ('-scheduled_date',)


@admin.register(MarketplaceAircraft)
class MarketplaceAircraftAdmin(admin.ModelAdmin):
    list_display  = ('name', 'registration_number', 'owner', 'category', 'base_location',
                     'passenger_capacity', 'hourly_rate_usd', 'status', 'is_approved',
                     'maintenance_due_col', 'insurance_expiry', 'created_at')
    list_filter   = ('category', 'status', 'is_approved')
    search_fields = ('name', 'model', 'registration_number', 'owner__username')
    list_editable = ('is_approved', 'status')
    readonly_fields = ('reference', 'created_at', 'updated_at')
    inlines       = [MaintenanceLogInline]
    ordering      = ('-created_at',)

    @admin.display(description='Maint Due', boolean=True)
    def maintenance_due_col(self, obj):
        return obj.maintenance_due


@admin.register(MaintenanceLog)
class MaintenanceLogAdmin(admin.ModelAdmin):
    list_display  = ('aircraft', 'maintenance_type', 'status', 'scheduled_date',
                     'completed_date', 'flight_hours_at', 'cost_usd', 'technician')
    list_filter   = ('maintenance_type', 'status')
    search_fields = ('aircraft__name', 'aircraft__registration_number', 'technician', 'description')
    date_hierarchy = 'scheduled_date'
    ordering = ('-scheduled_date',)


@admin.register(MarketplaceBooking)
class MarketplaceBookingAdmin(admin.ModelAdmin):
    list_display  = ('reference_short', 'client', 'aircraft', 'origin', 'destination',
                     'departure_datetime', 'passenger_count', 'gross_amount_usd',
                     'commission_usd', 'net_owner_usd', 'status_badge_col', 'payment_status', 'created_at')
    list_filter   = ('status', 'trip_type', 'payment_status')
    search_fields = ('client__username', 'client__email', 'aircraft__name', 'origin', 'destination')
    readonly_fields = ('reference', 'commission_usd', 'net_owner_usd', 'created_at', 'updated_at')
    date_hierarchy = 'departure_datetime'
    ordering = ('-created_at',)

    @admin.display(description='Ref')
    def reference_short(self, obj):
        return str(obj.reference)[:8].upper()

    @admin.display(description='Status')
    def status_badge_col(self, obj):
        colors = {
            'pending': '#ffc107', 'confirmed': '#198754', 'in_flight': '#0dcaf0',
            'completed': '#20c997', 'cancelled': '#dc3545', 'disputed': '#fd7e14',
        }
        return status_badge(obj.status, colors)


# ─────────────────────────────────────────────────────────────────────────────
# FINANCE
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(CommissionSetting)
class CommissionSettingAdmin(admin.ModelAdmin):
    list_display  = ('rate_pct', 'effective_from', 'set_by', 'notes', 'created_at')
    readonly_fields = ('created_at',)
    ordering = ('-effective_from',)


@admin.register(PaymentRecord)
class PaymentRecordAdmin(admin.ModelAdmin):
    list_display  = ('reference_short', 'user', 'payment_type', 'amount_usd',
                     'currency', 'status_badge_col', 'booking', 'membership', 'created_at')
    list_filter   = ('payment_type', 'status', 'currency')
    search_fields = ('user__username', 'user__email', 'stripe_payment_id')
    readonly_fields = ('reference', 'created_at')
    ordering = ('-created_at',)

    @admin.display(description='Ref')
    def reference_short(self, obj):
        return str(obj.reference)[:8].upper()

    @admin.display(description='Status')
    def status_badge_col(self, obj):
        colors = {
            'pending': '#ffc107', 'succeeded': '#198754',
            'failed': '#dc3545', 'refunded': '#0d6efd',
        }
        return status_badge(obj.status, colors)


# ─────────────────────────────────────────────────────────────────────────────
# OTHER
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(SavedRoute)
class SavedRouteAdmin(admin.ModelAdmin):
    list_display  = ('user', 'name', 'origin', 'destination', 'created_at')
    search_fields = ('user__username', 'name', 'origin', 'destination')
    ordering = ('-created_at',)


@admin.register(Dispute)
class DisputeAdmin(admin.ModelAdmin):
    list_display  = ('reference_short', 'booking', 'raised_by', 'subject', 'status_badge_col', 'created_at', 'resolved_at')
    list_filter   = ('status',)
    search_fields = ('raised_by__username', 'subject', 'description')
    readonly_fields = ('reference', 'created_at')
    ordering = ('-created_at',)

    @admin.display(description='Ref')
    def reference_short(self, obj):
        return str(obj.reference)[:8].upper()

    @admin.display(description='Status')
    def status_badge_col(self, obj):
        colors = {
            'open': '#dc3545', 'reviewing': '#ffc107',
            'resolved': '#198754', 'closed': '#6c757d',
        }
        return status_badge(obj.status, colors)


@admin.register(EmailLog)
class EmailLogAdmin(admin.ModelAdmin):
    list_display  = ('reference_short', 'sent_by', 'to_email', 'to_name', 'subject_short',
                     'inquiry_type', 'related_id', 'success', 'sent_at')
    list_filter   = ('inquiry_type', 'success')
    search_fields = ('to_email', 'to_name', 'subject', 'body')
    readonly_fields = ('reference', 'sent_at')
    ordering = ('-sent_at',)

    @admin.display(description='Ref')
    def reference_short(self, obj):
        return str(obj.reference)[:8].upper()

    @admin.display(description='Subject')
    def subject_short(self, obj):
        return obj.subject[:60] + ('…' if len(obj.subject) > 60 else '')


# ─────────────────────────────────────────────────────────────────────────────
# JOBS
# ─────────────────────────────────────────────────────────────────────────────

class JobApplicationInline(admin.TabularInline):
    model   = JobApplication
    extra   = 0
    fields  = ('full_name', 'email', 'current_role', 'years_experience', 'status', 'created_at')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    list_display  = ('title', 'department', 'location', 'job_type', 'is_active', 'is_featured',
                     'deadline', 'application_count', 'created_at')
    list_filter   = ('department', 'location', 'job_type', 'is_active', 'is_featured')
    search_fields = ('title', 'description', 'requirements')
    list_editable = ('is_active', 'is_featured')
    readonly_fields = ('created_at', 'updated_at')
    inlines       = [JobApplicationInline]
    ordering      = ('-is_featured', '-created_at')

    @admin.display(description='Applications')
    def application_count(self, obj):
        return obj.applications.count()


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display  = ('reference_short', 'full_name', 'email', 'job', 'current_role',
                     'years_experience', 'status_badge_col', 'created_at')
    list_filter   = ('status', 'job__department', 'job__location')
    search_fields = ('full_name', 'email', 'phone', 'current_role', 'job__title')
    readonly_fields = ('reference', 'created_at', 'updated_at')
    ordering = ('-created_at',)

    @admin.display(description='Ref')
    def reference_short(self, obj):
        return str(obj.reference)[:8].upper()

    @admin.display(description='Status')
    def status_badge_col(self, obj):
        colors = {
            'received': '#6c757d', 'reviewing': '#0d6efd', 'shortlisted': '#0dcaf0',
            'interview': '#ffc107', 'offered': '#fd7e14', 'hired': '#198754',
            'rejected': '#dc3545', 'withdrawn': '#adb5bd',
        }
        return status_badge(obj.status, colors)