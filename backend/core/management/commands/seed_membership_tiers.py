from django.core.management.base import BaseCommand
from core.models import MembershipTier


class Command(BaseCommand):
    help = "Seed default MembershipTier records (Basic, Premium, Corporate)"

    def handle(self, *args, **options):
        tiers = [
            {
                "name": "basic",
                "display_name": "Basic",
                "monthly_fee_usd": "299.00",
                "annual_fee_usd": "2990.00",
                "hourly_discount_pct": "5.00",
                "priority_booking": False,
                "dedicated_support": False,
                "exclusive_listings": False,
                "max_monthly_bookings": 4,
                "description": (
                    "Entry-level membership giving you access to our curated fleet "
                    "at a discounted hourly rate with straightforward booking."
                ),
                "features_list": [
                    "5% discount on standard hourly rates",
                    "Up to 4 bookings per month",
                    "Access to light & mid-size jets",
                    "Online booking portal",
                    "Email support (48-hour response)",
                ],
                "is_active": True,
            },
            {
                "name": "premium",
                "display_name": "Premium",
                "monthly_fee_usd": "799.00",
                "annual_fee_usd": "7990.00",
                "hourly_discount_pct": "12.00",
                "priority_booking": True,
                "dedicated_support": False,
                "exclusive_listings": False,
                "max_monthly_bookings": 10,
                "description": (
                    "Our most popular tier — priority boarding windows, a generous "
                    "booking allowance, and a significant rate reduction for frequent flyers."
                ),
                "features_list": [
                    "12% discount on standard hourly rates",
                    "Up to 10 bookings per month",
                    "Priority booking window (48 hrs before general release)",
                    "Access to full fleet including heavy jets",
                    "Complimentary in-flight catering on every leg",
                    "Priority email & phone support (12-hour response)",
                    "One complimentary airport transfer per month",
                ],
                "is_active": True,
            },
            {
                "name": "corporate",
                "display_name": "Corporate",
                "monthly_fee_usd": "2499.00",
                "annual_fee_usd": "24990.00",
                "hourly_discount_pct": "20.00",
                "priority_booking": True,
                "dedicated_support": True,
                "exclusive_listings": True,
                "max_monthly_bookings": 0,  # unlimited
                "description": (
                    "Unlimited access, a dedicated account manager, exclusive fleet listings, "
                    "and the highest discount tier — built for organisations that fly constantly."
                ),
                "features_list": [
                    "20% discount on standard hourly rates",
                    "Unlimited monthly bookings",
                    "First-access to exclusive & ultra-long-range fleet",
                    "Dedicated account manager (24/7 direct line)",
                    "Custom catering menus per flight",
                    "Unlimited airport transfers",
                    "Multi-passenger group booking coordination",
                    "Monthly flight-usage & cost reports",
                    "VIP lounge access at partner FBOs",
                ],
                "is_active": True,
            },
        ]

        created_count = 0
        updated_count = 0

        for data in tiers:
            obj, created = MembershipTier.objects.update_or_create(
                name=data["name"],
                defaults=data,
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f"  [CREATED] {obj.display_name}")
                )
            else:
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f"  [UPDATED] {obj.display_name}")
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. {created_count} created, {updated_count} updated."
            )
        )