from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from core.models import MarketplaceAircraft, User, MembershipTier, Aircraft


class Command(BaseCommand):
    help = "Seed MarketplaceAircraft by looping over existing Aircraft records"

    def handle(self, *args, **options):
        # ── 1. Get or create an owner user ───────────────────────────────────
        owner = User.objects.filter(role='owner').first()
        if not owner:
            owner = User.objects.create_user(
                username='fleet_owner',
                email='fleet@nairobijethouse.com',
                password='FleetOwner2025!',
                first_name='Fleet',
                last_name='Owner',
                role='owner',
            )
            self.stdout.write(self.style.WARNING(
                f"  [CREATED OWNER] {owner.username} (password: FleetOwner2025!)"
            ))
        else:
            self.stdout.write(f"  [USING OWNER] {owner.username}")

        # ── 2. Load existing Aircraft records ─────────────────────────────────
        aircraft_qs = Aircraft.objects.all()
        if not aircraft_qs.exists():
            self.stdout.write(self.style.ERROR(
                "  No Aircraft records found. Seed your Aircraft table first."
            ))
            return

        self.stdout.write(f"  Found {aircraft_qs.count()} Aircraft records — seeding MarketplaceAircraft...\n")

        # ── 3. Category map: Aircraft.category → MarketplaceAircraft.category ─
        # Both models share the same category slugs so this is a direct mapping.
        CATEGORY_MAP = {
            'light':        'light',
            'midsize':      'midsize',
            'super_midsize':'super_midsize',
            'heavy':        'heavy',
            'ultra_long':   'ultra_long',
            'vip_airliner': 'vip_airliner',
        }

        # ── 4. Amenities per category ─────────────────────────────────────────
        AMENITIES_MAP = {
            'light': [
                "WiFi connectivity",
                "Leather seating",
                "Refreshment centre",
                "USB charging ports",
                "Noise-cancelling headsets",
            ],
            'midsize': [
                "Full WiFi & satellite comms",
                "Club seating configuration",
                "Galley with hot meal capability",
                "Enclosed lavatory",
                "Entertainment system",
                "USB & 110V power outlets",
            ],
            'super_midsize': [
                "High-speed WiFi",
                "Stand-up cabin",
                "Full galley",
                "Enclosed aft lavatory",
                "Lie-flat capable seating",
                "4K entertainment screens",
                "Satellite phone",
            ],
            'heavy': [
                "High-speed satellite WiFi",
                "Full stand-up cabin",
                "Dedicated crew rest area",
                "Full galley with chef capability",
                "Enclosed forward & aft lavatories",
                "Lie-flat sleeper seats",
                "Conference table",
                "4K in-seat entertainment",
            ],
            'ultra_long': [
                "Ultra-high-speed WiFi",
                "Full stand-up cabin",
                "Private stateroom / bedroom",
                "Shower suite",
                "Full galley & dining area",
                "Conference suite",
                "Lie-flat sleeper seats",
                "Advanced entertainment system",
                "Satellite phone & comms",
            ],
            'vip_airliner': [
                "Wide-body VIP configuration",
                "Private staterooms",
                "Full shower suites",
                "Conference & boardroom suite",
                "Gourmet galley",
                "Satellite WiFi & comms",
                "Entertainment & cinema system",
                "Dedicated crew quarters",
                "Lounge area",
            ],
        }

        # ── 5. Registration prefix pool ───────────────────────────────────────
        PREFIXES = ['5Y', 'ZS', 'A6', 'N', 'G', 'VP-B', 'OE', 'HB']

        created_count = 0
        updated_count = 0
        today = date.today()

        for idx, ac in enumerate(aircraft_qs):
            category    = CATEGORY_MAP.get(ac.category, 'light')
            amenities   = AMENITIES_MAP.get(category, [])
            prefix      = PREFIXES[idx % len(PREFIXES)]
            reg_number  = f"{prefix}-MKT{str(ac.id).zfill(3)}"

            # Stagger compliance dates so not everything expires on same day
            insurance_expiry      = today + timedelta(days=180 + (idx * 17) % 180)
            airworthiness_expiry  = today + timedelta(days=90  + (idx * 23) % 270)

            # Hourly rate: use aircraft's rate or derive from category
            RATE_DEFAULTS = {
                'light':         3500,
                'midsize':       5500,
                'super_midsize': 7500,
                'heavy':        10000,
                'ultra_long':   14000,
                'vip_airliner': 22000,
            }
            hourly_rate = ac.hourly_rate_usd or RATE_DEFAULTS.get(category, 5000)

            obj, created = MarketplaceAircraft.objects.update_or_create(
                registration_number=reg_number,
                defaults={
                    'owner':                    owner,
                    'name':                     ac.name,
                    'model':                    ac.model,
                    'category':                 category,
                    'base_location':            'Wilson Airport, Nairobi',
                    'passenger_capacity':       ac.passenger_capacity,
                    'range_km':                 ac.range_km,
                    'cruise_speed_kmh':         ac.cruise_speed_kmh,
                    'hourly_rate_usd':          hourly_rate,
                    'status':                   'available',
                    'is_approved':              True,
                    'total_flight_hours':       round(50 + (idx * 37) % 400, 1),
                    'maintenance_interval_hours': 200,
                    'last_maintenance_hours':   round((idx * 13) % 200, 1),
                    'insurance_expiry':         insurance_expiry,
                    'airworthiness_expiry':     airworthiness_expiry,
                    'description':              ac.description or (
                        f"The {ac.name} is a {ac.get_category_display()} offering "
                        f"exceptional comfort and performance. "
                        f"With a range of {ac.range_km:,} km and capacity for "
                        f"{ac.passenger_capacity} passengers, it is ideal for both "
                        f"regional and intercontinental travel."
                    ),
                    'amenities':                amenities,
                    'image_url':                ac.image_url or '',
                },
            )

            # exclusive_tiers: leave empty = visible to all membership tiers
            # (no tiers added here — all members can see every aircraft)

            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(
                    f"  [CREATED] {obj.name} | {reg_number} | {category} | ${hourly_rate}/hr"
                ))
            else:
                updated_count += 1
                self.stdout.write(self.style.WARNING(
                    f"  [UPDATED] {obj.name} | {reg_number}"
                ))

        self.stdout.write(self.style.SUCCESS(
            f"\nDone. {created_count} created, {updated_count} updated.\n"
            f"All aircraft are approved & available to all membership tiers."
        ))