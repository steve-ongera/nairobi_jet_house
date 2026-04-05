import random
from django.core.management.base import BaseCommand
from core.models import JobPosting
from django.utils import timezone
from datetime import timedelta


class Command(BaseCommand):
    help = "Seed the database with job postings"

    def handle(self, *args, **kwargs):
        JobPosting.objects.all().delete()

        jobs = [
            {
                "title": "Flight Operations Officer",
                "department": "operations",
                "location": "nairobi",
                "job_type": "full_time",
                "description": "Manage flight scheduling, dispatch coordination, and crew logistics.",
                "requirements": "Degree in Aviation Management or related field.\nStrong coordination skills.",
                "benefits": "Medical cover, travel perks, performance bonus",
                "salary_range": "$2,000 – $4,000",
                "is_featured": True,
            },
            {
                "title": "Aircraft Maintenance Engineer",
                "department": "technical",
                "location": "dubai",
                "job_type": "full_time",
                "description": "Perform aircraft inspections, maintenance, and safety checks.",
                "requirements": "Licensed AME.\n5+ years experience.",
                "benefits": "Housing allowance, insurance, flight discounts",
                "salary_range": "$5,000 – $8,000",
            },
            {
                "title": "Charter Sales Executive",
                "department": "charter",
                "location": "london",
                "job_type": "full_time",
                "description": "Drive charter sales and manage VIP client relationships.",
                "requirements": "Sales experience.\nExcellent communication skills.",
                "benefits": "Commission, bonuses, travel opportunities",
                "salary_range": "$3,000 – $6,000",
            },
            {
                "title": "Software Engineer (Django/React)",
                "department": "it",
                "location": "remote",
                "job_type": "full_time",
                "description": "Develop internal systems, APIs, and dashboards.",
                "requirements": "Experience with Django, React, REST APIs.",
                "benefits": "Remote work, flexible hours, learning budget",
                "salary_range": "$2,500 – $5,500",
                "is_featured": True,
            },
            {
                "title": "HR Business Partner",
                "department": "hr",
                "location": "johannesburg",
                "job_type": "full_time",
                "description": "Handle recruitment, employee relations, and HR strategy.",
                "requirements": "HR certification.\n3+ years experience.",
                "benefits": "Health cover, pension, bonuses",
                "salary_range": "$2,000 – $4,500",
            },
            {
                "title": "Finance Analyst",
                "department": "finance",
                "location": "new_york",
                "job_type": "full_time",
                "description": "Analyze financial reports, budgeting, and forecasting.",
                "requirements": "CPA or equivalent.\nStrong Excel skills.",
                "benefits": "Stock options, bonuses",
                "salary_range": "$4,000 – $7,000",
            },
            {
                "title": "Marketing Manager",
                "department": "marketing",
                "location": "lagos",
                "job_type": "full_time",
                "description": "Lead campaigns, branding, and digital marketing strategies.",
                "requirements": "Marketing degree.\nSEO/SEM experience.",
                "benefits": "Bonuses, travel",
                "salary_range": "$2,500 – $5,000",
            },
            {
                "title": "Concierge Executive",
                "department": "concierge",
                "location": "dubai",
                "job_type": "full_time",
                "description": "Handle VIP clients, bookings, and luxury experiences.",
                "requirements": "Hospitality experience.\nExcellent communication.",
                "benefits": "Tips, bonuses, luxury exposure",
                "salary_range": "$2,000 – $3,500",
            },
            {
                "title": "Intern - Software Developer",
                "department": "it",
                "location": "nairobi",
                "job_type": "internship",
                "description": "Assist in building web applications and APIs.",
                "requirements": "Basic knowledge of Python or JavaScript.",
                "benefits": "Learning opportunity, mentorship",
                "salary_range": "Stipend",
            },
            {
                "title": "Chief Operations Officer",
                "department": "management",
                "location": "london",
                "job_type": "full_time",
                "description": "Oversee company operations and strategic direction.",
                "requirements": "10+ years leadership experience.",
                "benefits": "Executive perks, stock options",
                "salary_range": "$10,000+",
                "is_featured": True,
            },
        ]

        for job in jobs:
            JobPosting.objects.create(
                title=job["title"],
                department=job["department"],
                location=job["location"],
                job_type=job.get("job_type", "full_time"),
                description=job["description"],
                requirements=job.get("requirements", ""),
                benefits=job.get("benefits", ""),
                salary_range=job.get("salary_range", ""),
                is_featured=job.get("is_featured", False),
                is_active=True,
                deadline=timezone.now().date() + timedelta(days=random.randint(15, 45)),
            )

        self.stdout.write(self.style.SUCCESS("✅ Job postings seeded successfully!"))