"""
Management command: python manage.py seed_data

Seeds all booking/inquiry models for the period April 2025 – April 2026.
Airport, Aircraft, and Yacht records are read from the existing DB via loops.

Place this file at:
    yourapp/management/commands/seed_data.py

(Create the __init__.py files in management/ and commands/ if they don't exist.)
"""

import random
import uuid
from datetime import date, timedelta, time
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.utils import timezone

# ── adjust the import path to match your actual app name ──────────────────────
from core.models import (
    Airport, Aircraft, Yacht,
    FlightBooking, FlightLeg,
    YachtCharter,
    LeaseInquiry,
    FlightInquiry,
    ContactInquiry,
    GroupCharterInquiry,
    AirCargoInquiry,
    AircraftSalesInquiry,
    User,
)


# ── helpers ───────────────────────────────────────────────────────────────────

SEED_START = date(2025, 4, 1)
SEED_END   = date(2026, 4, 5)


def rand_date(start=SEED_START, end=SEED_END) -> date:
    delta = (end - start).days
    return start + timedelta(days=random.randint(0, delta))


def rand_future_date(base: date, min_days=1, max_days=30) -> date:
    return base + timedelta(days=random.randint(min_days, max_days))


def rand_time() -> time:
    return time(random.randint(5, 22), random.choice([0, 15, 30, 45]))


def rand_price(low, high) -> Decimal:
    return Decimal(str(round(random.uniform(low, high), 2)))


FIRST_NAMES = [
    "James", "Emma", "Liam", "Olivia", "Noah", "Ava", "William", "Sophia",
    "Benjamin", "Isabella", "Lucas", "Mia", "Henry", "Charlotte", "Alexander",
    "Amelia", "Sebastian", "Harper", "Jack", "Evelyn", "Daniel", "Abigail",
    "Michael", "Emily", "Ethan", "Elizabeth", "Matthew", "Mila", "Aiden", "Ella",
    "Kwame", "Aisha", "Tariq", "Fatima", "Kofi", "Amara", "Jabari", "Zara",
    "Hiroshi", "Yuki", "Chen", "Li Wei", "Arjun", "Priya", "Omar", "Layla",
]
LAST_NAMES = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
    "Davis", "Wilson", "Anderson", "Taylor", "Thomas", "Jackson", "White",
    "Harris", "Martin", "Thompson", "Young", "Allen", "King", "Osei", "Mensah",
    "Kimani", "Mwangi", "Nkrumah", "Tanaka", "Yamamoto", "Chen", "Wang",
    "Patel", "Sharma", "Al-Rashid", "Hassan", "Nguyen", "Lee",
]
COMPANIES = [
    "Apex Ventures", "Summit Capital", "Blue Horizon Partners", "Nexus Group",
    "Vanguard Enterprises", "Orion Holdings", "Meridian Consulting", "Pinnacle Corp",
    "Atlas Industries", "Sterling Associates", "Quantum Dynamics", "Crest Investments",
    "Nova Technologies", "Titan Resources", "Zenith Global", "", "", "",  # some blank
]


def rand_name() -> str:
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"


def rand_email(name: str) -> str:
    parts = name.lower().replace(" ", ".")
    domains = ["gmail.com", "outlook.com", "yahoo.com", "company.com", "business.net", "corp.io"]
    return f"{parts}{random.randint(1,99)}@{random.choice(domains)}"


def rand_phone() -> str:
    return f"+{random.randint(1,999)}{random.randint(100,999)}{random.randint(1000000,9999999)}"


# ── seeder functions ──────────────────────────────────────────────────────────

def seed_users(n=40):
    """Create a mix of client, owner, and admin users."""
    print(f"  Creating {n} users…")
    roles_weights = ["client"] * 25 + ["owner"] * 10 + ["admin"] * 5
    created = 0
    for i in range(n):
        name  = rand_name()
        first, *rest = name.split()
        last  = " ".join(rest) if rest else "User"
        uname = f"{first.lower()}{last.lower().replace(' ','')}{i}"
        email = rand_email(name)
        if User.objects.filter(username=uname).exists():
            continue
        User.objects.create_user(
            username   = uname,
            email      = email,
            password   = "password123",
            first_name = first,
            last_name  = last,
            role       = random.choice(roles_weights),
            phone      = rand_phone() if random.random() > 0.3 else "",
            company    = random.choice(COMPANIES),
        )
        created += 1
    print(f"    → {created} users created.")


def seed_flight_bookings(airports, aircraft_list, n=120):
    print(f"  Creating {n} flight bookings…")
    statuses = ['inquiry','quoted','confirmed','in_flight','completed','cancelled']
    status_weights = [15, 20, 30, 5, 25, 5]   # rough realistic weights
    trip_types = ['one_way','round_trip','multi_leg']
    trip_weights = [50, 35, 15]

    airport_pairs = [(a, b) for a in airports for b in airports if a != b]

    for _ in range(n):
        dep_date  = rand_date()
        trip_type = random.choices(trip_types, weights=trip_weights)[0]
        ret_date  = rand_future_date(dep_date, 1, 14) if trip_type == 'round_trip' else None
        status    = random.choices(statuses, weights=status_weights)[0]
        origin, dest = random.choice(airport_pairs)
        ac = random.choice(aircraft_list) if random.random() > 0.15 else None
        pax = random.randint(1, ac.passenger_capacity if ac else 12)

        has_price = status in ('quoted', 'confirmed', 'in_flight', 'completed')
        price = rand_price(8_000, 250_000) if has_price else None
        commission_pct = Decimal(str(random.choice([8, 10, 12, 15])))

        name  = rand_name()
        email = rand_email(name)

        booking = FlightBooking(
            guest_name   = name,
            guest_email  = email,
            guest_phone  = rand_phone() if random.random() > 0.4 else "",
            company      = random.choice(COMPANIES),
            trip_type    = trip_type,
            origin       = origin,
            destination  = dest,
            departure_date  = dep_date,
            departure_time  = rand_time() if random.random() > 0.3 else None,
            return_date     = ret_date,
            passenger_count = pax,
            aircraft        = ac,
            special_requests = random.choice([
                "", "", "", "Kosher meal required", "Wheelchair assistance",
                "Pet on board – small dog", "Anniversary setup please",
                "Need satellite phone", "Quiet cabin preferred",
            ]),
            catering_requested         = random.random() > 0.5,
            ground_transport_requested = random.random() > 0.6,
            concierge_requested        = random.random() > 0.7,
            quoted_price_usd  = price,
            commission_pct    = commission_pct,
            status = status,
        )
        booking.save()  # triggers commission auto-calc

        # Add legs for multi-leg
        if trip_type == 'multi_leg':
            leg_count = random.randint(2, 4)
            used_airports = [origin]
            for leg_num in range(1, leg_count + 1):
                choices = [a for a in airports if a not in used_airports]
                if not choices:
                    break
                next_ap = random.choice(choices)
                used_airports.append(next_ap)
                FlightLeg.objects.create(
                    booking        = booking,
                    leg_number     = leg_num,
                    origin         = used_airports[-2],
                    destination    = next_ap,
                    departure_date = rand_future_date(dep_date, leg_num - 1, leg_num + 2),
                    departure_time = rand_time() if random.random() > 0.3 else None,
                )

    print(f"    → {n} flight bookings created.")


def seed_yacht_charters(yachts, n=60):
    print(f"  Creating {n} yacht charters…")
    statuses = ['inquiry','quoted','confirmed','active','completed','cancelled']
    status_weights = [15, 20, 25, 5, 30, 5]

    ports = [
        "Monaco, France", "Palma de Mallorca, Spain", "Athens, Greece", "Bodrum, Turkey",
        "Dubai Marina, UAE", "Gustavia, St. Barths", "Gustavia, St. Barths",
        "Hamilton, Bermuda", "Portofino, Italy", "Ibiza, Spain", "Mykonos, Greece",
        "Miami, USA", "Fort Lauderdale, USA", "Cannes, France", "Antibes, France",
        "Mombasa, Kenya", "Zanzibar, Tanzania", "Cape Town, South Africa",
        "Sydney, Australia", "Phuket, Thailand",
    ]

    for _ in range(n):
        start = rand_date()
        end   = rand_future_date(start, 3, 21)
        yacht = random.choice(yachts)
        status = random.choices(statuses, weights=status_weights)[0]
        has_price = status in ('quoted','confirmed','active','completed')
        price = rand_price(15_000, 800_000) if has_price else None
        name  = rand_name()

        YachtCharter.objects.create(
            guest_name    = name,
            guest_email   = rand_email(name),
            guest_phone   = rand_phone() if random.random() > 0.4 else "",
            company       = random.choice(COMPANIES),
            yacht         = yacht,
            departure_port   = random.choice(ports),
            destination_port = random.choice(ports) if random.random() > 0.3 else "",
            charter_start    = start,
            charter_end      = end,
            guest_count      = random.randint(2, yacht.guest_capacity),
            itinerary_description = random.choice([
                "", "Cruise the Amalfi Coast with stops at Positano and Capri.",
                "Island hopping across the Greek Cyclades.",
                "East African coastline, snorkelling at Watamu reef.",
                "Caribbean circuit: St. Barths → Anguilla → Antigua.",
                "Norwegian fjords luxury expedition.",
                "Monaco to Cannes for the Film Festival.",
            ]),
            special_requests = random.choice([
                "", "", "Gluten-free menu throughout", "Private chef required",
                "Jet ski and water toys", "Birthday cake on day 3",
                "Diving instructor on board", "Helicopter landing pad preferred",
            ]),
            quoted_price_usd = price,
            status = status,
        )
    print(f"    → {n} yacht charters created.")


def seed_lease_inquiries(aircraft_list, yachts, n=50):
    print(f"  Creating {n} lease inquiries…")
    durations = ['monthly','quarterly','annual','multi_year']
    dur_weights = [20, 30, 35, 15]
    budgets = [
        "$50k–$100k/month", "$100k–$250k/month", "$250k–$500k/month",
        "$500k+/month", "Flexible", "TBD",
    ]

    for _ in range(n):
        asset_type = random.choice(['aircraft', 'yacht'])
        ac    = random.choice(aircraft_list) if asset_type == 'aircraft' else None
        yacht = random.choice(yachts)        if asset_type == 'yacht'    else None
        name  = rand_name()

        LeaseInquiry.objects.create(
            guest_name   = name,
            guest_email  = rand_email(name),
            guest_phone  = rand_phone() if random.random() > 0.4 else "",
            company      = random.choice(COMPANIES),
            asset_type   = asset_type,
            aircraft     = ac,
            yacht        = yacht,
            lease_duration       = random.choices(durations, weights=dur_weights)[0],
            preferred_start_date = rand_date(),
            budget_range         = random.choice(budgets),
            usage_description    = random.choice([
                "Corporate travel for executive team across EMEA.",
                "Private leisure use – Mediterranean summers.",
                "Sports team transport for the upcoming season.",
                "Film production logistics.",
                "Government liaison and diplomatic travel.",
                "Fractional ownership alternative.",
                "",
            ]),
            additional_notes = random.choice([
                "", "Prefer newer aircraft (post-2018).",
                "Must include full crew.", "Option to purchase at end of lease preferred.",
                "Flexible on duration – open to negotiation.",
            ]),
            status = random.choice(['pending', 'reviewing', 'quoted', 'closed']),
        )
    print(f"    → {n} lease inquiries created.")


def seed_flight_inquiries(n=80):
    print(f"  Creating {n} flight inquiries…")
    route_pairs = [
        ("Nairobi", "London"), ("Lagos", "Dubai"), ("New York", "Los Angeles"),
        ("London", "New York"), ("Paris", "Miami"), ("Dubai", "Singapore"),
        ("Cape Town", "Nairobi"), ("Sydney", "Tokyo"), ("Mumbai", "London"),
        ("São Paulo", "New York"), ("Toronto", "Barbados"), ("Geneva", "Maldives"),
        ("Riyadh", "Paris"), ("Hong Kong", "Sydney"), ("Johannesburg", "Paris"),
    ]
    categories = ['light','midsize','super_midsize','heavy','ultra_long','']
    messages = [
        "Looking for a quick turnaround flight, very flexible on timing.",
        "Need to travel urgently for a business meeting, please advise options.",
        "Planning a leisure trip and want to explore private jet options.",
        "Comparing costs vs first-class commercial. What can you offer?",
        "Group trip for executives – need comfortable long-range option.",
        "Anniversary trip surprise – want something special.",
        "Need regular monthly flights between these two cities.",
        "One-way trip, open on dates within the next two weeks.",
    ]

    for _ in range(n):
        orig, dest = random.choice(route_pairs)
        name = rand_name()
        FlightInquiry.objects.create(
            guest_name   = name,
            guest_email  = rand_email(name),
            guest_phone  = rand_phone() if random.random() > 0.5 else "",
            origin_description      = orig,
            destination_description = dest,
            approximate_date = random.choice([
                "Next week", "End of month", "Mid-June 2025", "Q3 2025",
                "ASAP", "Flexible", "Early 2026", "",
            ]),
            passenger_count = random.randint(1, 14),
            preferred_aircraft_category = random.choice(categories),
            message = random.choice(messages),
        )
    print(f"    → {n} flight inquiries created.")


def seed_contact_inquiries(n=70):
    print(f"  Creating {n} contact inquiries…")
    subjects = ['general','support','media','partnership','careers','other']
    sub_weights = [30, 20, 10, 15, 15, 10]
    messages = [
        "I'd like to learn more about your membership program.",
        "I had an issue with a recent booking and need assistance.",
        "Press inquiry for an upcoming feature on luxury travel.",
        "Interested in a white-label partnership for our travel agency.",
        "Applying for an open position — where do I submit my CV?",
        "Can you customise a bespoke travel package for us?",
        "What are the payment options available?",
        "Looking for information on fleet management partnerships.",
        "We'd love to feature your brand in our magazine.",
        "I'd like to understand the cancellation policy in more detail.",
    ]

    for _ in range(n):
        name = rand_name()
        ContactInquiry.objects.create(
            full_name = name,
            email     = rand_email(name),
            phone     = rand_phone() if random.random() > 0.5 else "",
            company   = random.choice(COMPANIES),
            subject   = random.choices(subjects, weights=sub_weights)[0],
            message   = random.choice(messages),
        )
    print(f"    → {n} contact inquiries created.")


def seed_group_charter_inquiries(airports, aircraft_list, n=40):
    print(f"  Creating {n} group charter inquiries…")
    group_types = ['corporate','sports_team','entertainment','incentive','wedding','government','other']
    gt_weights  = [30, 15, 10, 15, 15, 10, 5]

    budgets = ["$50k–$100k", "$100k–$250k", "$250k–$500k", "Over $500k", "Flexible", ""]
    categories = ['midsize','super_midsize','heavy','ultra_long','vip_airliner','']

    for _ in range(n):
        dep_date = rand_date() if random.random() > 0.2 else None
        ret_date = rand_future_date(dep_date, 2, 10) if dep_date and random.random() > 0.4 else None
        name = rand_name()
        orig, dest = random.choice([
            ("London", "Dubai"), ("New York", "Miami"), ("Lagos", "Abuja"),
            ("Nairobi", "Mombasa"), ("Paris", "Cannes"), ("Johannesburg", "Cape Town"),
            ("Sydney", "Melbourne"), ("Los Angeles", "Las Vegas"), ("Geneva", "Ibiza"),
        ])

        GroupCharterInquiry.objects.create(
            contact_name  = name,
            email         = rand_email(name),
            phone         = rand_phone() if random.random() > 0.4 else "",
            company       = random.choice(COMPANIES),
            group_type    = random.choices(group_types, weights=gt_weights)[0],
            group_size    = random.randint(8, 200),
            origin_description      = orig,
            destination_description = dest,
            departure_date = dep_date,
            return_date    = ret_date,
            is_round_trip  = ret_date is not None,
            preferred_aircraft_category = random.choice(categories),
            catering_required        = random.random() > 0.5,
            ground_transport_required= random.random() > 0.6,
            budget_range   = random.choice(budgets),
            additional_notes = random.choice([
                "", "Need branding/livery wrap on aircraft.",
                "Full catering with open bar.", "Medical staff required on board.",
                "24/7 concierge throughout trip.", "Multiple departure cities.",
            ]),
            status = random.choice(['pending','reviewing','quoted','confirmed','cancelled']),
        )
    print(f"    → {n} group charter inquiries created.")


def seed_air_cargo_inquiries(n=55):
    print(f"  Creating {n} air cargo inquiries…")
    cargo_types = [
        'general','perishables','pharma','dangerous_goods',
        'live_animals','artwork','automotive','oversized','humanitarian','other'
    ]
    ct_weights = [25, 15, 12, 8, 5, 8, 7, 6, 5, 9]
    urgencies = ['standard','express','critical']
    urg_weights = [55, 35, 10]

    route_pairs = [
        ("Nairobi, Kenya", "Amsterdam, Netherlands"),
        ("Dubai, UAE", "London Heathrow, UK"),
        ("Shanghai, China", "Los Angeles, USA"),
        ("Lagos, Nigeria", "Dubai, UAE"),
        ("New York, USA", "São Paulo, Brazil"),
        ("Singapore", "Sydney, Australia"),
        ("Johannesburg, SA", "Paris, France"),
        ("Mumbai, India", "Frankfurt, Germany"),
        ("Cairo, Egypt", "Istanbul, Turkey"),
        ("Miami, USA", "Bogotá, Colombia"),
    ]

    for _ in range(n):
        orig, dest = random.choice(route_pairs)
        name = rand_name()
        cargo_type = random.choices(cargo_types, weights=ct_weights)[0]
        is_dg = cargo_type == 'dangerous_goods' or random.random() < 0.05

        AirCargoInquiry.objects.create(
            contact_name = name,
            email        = rand_email(name),
            phone        = rand_phone() if random.random() > 0.4 else "",
            company      = random.choice(COMPANIES),
            cargo_type   = cargo_type,
            cargo_description = random.choice([
                "Fresh flowers and perishable produce for export.",
                "Pharmaceutical cold-chain shipment – vaccines.",
                "High-value artwork for international exhibition.",
                "Automotive spare parts – critical production line.",
                "Thoroughbred racing horse transport.",
                "Humanitarian aid – food and medical supplies.",
                "General commercial cargo – electronics.",
                "Luxury goods – watches and jewellery.",
                "Oversized industrial machinery component.",
                "Dangerous goods – class 3 flammable liquids.",
            ]),
            weight_kg  = Decimal(str(round(random.uniform(50, 15000), 2))) if random.random() > 0.2 else None,
            volume_m3  = Decimal(str(round(random.uniform(0.5, 50), 2)))   if random.random() > 0.3 else None,
            dimensions = f"{random.randint(50,300)} x {random.randint(50,200)} x {random.randint(30,150)} cm" if random.random() > 0.4 else "",
            origin_description      = orig,
            destination_description = dest,
            pickup_date  = rand_date() if random.random() > 0.3 else None,
            urgency      = random.choices(urgencies, weights=urg_weights)[0],
            is_hazardous = is_dg,
            requires_temperature_control = cargo_type in ('perishables','pharma') or random.random() < 0.1,
            insurance_required       = random.random() > 0.4,
            customs_assistance_needed= random.random() > 0.5,
            additional_notes = random.choice([
                "", "Requires IATA DG certification documentation.",
                "Temperature must be maintained at 2–8°C.",
                "Fragile – handle with extreme care.",
                "Customs pre-clearance already initiated.",
                "Collect from bonded warehouse.",
            ]),
            status = random.choice(['pending','reviewing','quoted','booked','completed','cancelled']),
        )
    print(f"    → {n} air cargo inquiries created.")


def seed_aircraft_sales_inquiries(aircraft_list, n=45):
    print(f"  Creating {n} aircraft sales inquiries…")
    inq_types = ['buy','sell','trade','valuation']
    it_weights = [40, 30, 15, 15]
    budgets = ['under_2m','2m_5m','5m_15m','15m_30m','30m_60m','over_60m','not_disclosed']
    b_weights  = [10, 15, 25, 20, 15, 10, 5]
    categories = ['light','midsize','super_midsize','heavy','ultra_long','vip_airliner']

    makes_models = [
        ("Gulfstream", "G700"), ("Bombardier", "Global 7500"),
        ("Dassault", "Falcon 10X"), ("Cessna", "Citation Longitude"),
        ("Embraer", "Praetor 600"), ("Pilatus", "PC-24"),
        ("HondaJet", "Elite II"), ("Beechcraft", "King Air 360"),
        ("Airbus", "ACJ320neo"), ("Boeing", "BBJ 737 MAX"),
    ]

    for _ in range(n):
        inq_type = random.choices(inq_types, weights=it_weights)[0]
        is_seller = inq_type in ('sell','trade','valuation')
        make, model = random.choice(makes_models)
        name = rand_name()

        AircraftSalesInquiry.objects.create(
            contact_name = name,
            email        = rand_email(name),
            phone        = rand_phone() if random.random() > 0.4 else "",
            company      = random.choice(COMPANIES),
            inquiry_type = inq_type,
            # Buyer fields
            preferred_category  = random.choice(categories) if not is_seller else "",
            preferred_make_model= f"{make} {model}"         if not is_seller else "",
            budget_range        = random.choices(budgets, weights=b_weights)[0] if not is_seller else "",
            new_or_pre_owned    = random.choice(['new','pre_owned','either']) if not is_seller else 'either',
            # Seller fields
            aircraft_make  = make  if is_seller else "",
            aircraft_model = model if is_seller else "",
            year_of_manufacture  = random.randint(2008, 2023) if is_seller else None,
            serial_number        = f"SN{random.randint(10000,99999)}" if is_seller else "",
            total_flight_hours   = random.randint(200, 8000)    if is_seller else None,
            asking_price_usd     = rand_price(2_000_000, 80_000_000) if is_seller and random.random() > 0.3 else None,
            message = random.choice([
                "Please send full specs and maintenance history.",
                "Looking for quick transaction – pre-approved financing available.",
                "Open to part-exchange against our current Falcon.",
                "Need independent inspection arranged.",
                "Would like a virtual tour before committing to viewing.",
                "Our broker is involved – please contact us to discuss.",
                "",
            ]),
            status = random.choice(['pending','reviewing','quoted','negotiating','closed','cancelled']),
        )
    print(f"    → {n} aircraft sales inquiries created.")


# ── main command ──────────────────────────────────────────────────────────────

class Command(BaseCommand):
    help = "Seed one year of realistic data (Apr 2025 – Apr 2026) for all booking/inquiry models."

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear', action='store_true',
            help='Delete all existing seeded records before inserting new ones.',
        )

    def handle(self, *args, **options):
        random.seed(42)  # reproducible

        if options['clear']:
            self.stdout.write("  Clearing existing data…")
            AircraftSalesInquiry.objects.all().delete()
            AirCargoInquiry.objects.all().delete()
            GroupCharterInquiry.objects.all().delete()
            ContactInquiry.objects.all().delete()
            FlightInquiry.objects.all().delete()
            LeaseInquiry.objects.all().delete()
            YachtCharter.objects.all().delete()
            FlightLeg.objects.all().delete()
            FlightBooking.objects.all().delete()
            User.objects.filter(is_superuser=False).delete()
            self.stdout.write("  Done clearing.\n")

        # Load existing lookup data
        airports      = list(Airport.objects.all())
        aircraft_list = list(Aircraft.objects.all())
        yachts        = list(Yacht.objects.all())

        if not airports:
            self.stderr.write("⚠  No airports found in DB – flight bookings will be skipped.")
        if not aircraft_list:
            self.stderr.write("⚠  No aircraft found in DB – some seeds will be skipped.")
        if not yachts:
            self.stderr.write("⚠  No yachts found in DB – yacht seeds will be skipped.")

        self.stdout.write(self.style.SUCCESS(
            f"\n✈  Loaded {len(airports)} airports, {len(aircraft_list)} aircraft, {len(yachts)} yachts.\n"
        ))

        seed_users(40)

        if airports and aircraft_list:
            seed_flight_bookings(airports, aircraft_list, n=120)
            seed_group_charter_inquiries(airports, aircraft_list, n=40)

        if yachts:
            seed_yacht_charters(yachts, n=60)

        if aircraft_list and yachts:
            seed_lease_inquiries(aircraft_list, yachts, n=50)

        seed_flight_inquiries(n=80)
        seed_contact_inquiries(n=70)
        seed_air_cargo_inquiries(n=55)

        if aircraft_list:
            seed_aircraft_sales_inquiries(aircraft_list, n=45)

        self.stdout.write(self.style.SUCCESS(
            "\n✅  Seeding complete!\n"
            "   Totals (approximate):\n"
            "     Users               : 40\n"
            "     FlightBookings      : 120  (+legs for multi-leg)\n"
            "     YachtCharters       : 60\n"
            "     LeaseInquiries      : 50\n"
            "     FlightInquiries     : 80\n"
            "     ContactInquiries    : 70\n"
            "     GroupCharterInquir. : 40\n"
            "     AirCargoInquiries   : 55\n"
            "     AircraftSalesInquir.: 45\n"
            "   ─────────────────────────\n"
            "     Total records       : ~560+\n"
        ))