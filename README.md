# NairobiJetHouse — Private Aviation & Yacht Charter Platform

A full-stack luxury travel platform for private jet bookings, yacht charters, and asset leasing. Supports guest bookings (no login required), membership clients, fleet owners, staff, and admin roles.

---

## Project Structure

```
NairobiJetHouse/
├── db.sqlite3
├── manage.py
│
├── backend/                            # Django project configuration
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── __init__.py
│
├── core/                               # Main Django app
│   ├── admin.py
│   ├── apps.py
│   ├── models.py                       # All data models
│   ├── serializers.py                  # DRF serializers
│   ├── views.py                        # ViewSets + API views
│   ├── tests.py
│   ├── __init__.py
│   ├── management/
│   │   └── commands/
│   │       ├── seed_airports.py        # Airport seeding command
│   │       ├── seed_data.py            # Full database seed command
│   │       └── __init__.py
│   └── migrations/
│       ├── 0001_initial.py
│       └── __init__.py
│
├── media/                              # User-uploaded files
├── static/                             # Static files source
└── staticfiles/                        # Collected static files (production)

frontend/                               # React + Vite
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.css
    ├── App.jsx                         # Router + Auth context + Route guards
    ├── index.css
    ├── main.jsx                        # Entry point
    │
    ├── assets/
    │   ├── hero.png
    │   ├── react.svg
    │   └── vite.svg
    │
    ├── components/
    │   ├── admin/
    │   │   ├── AdminLayout.jsx         # Admin shell with sidebar
    │   │   └── AdminSidebar.jsx        # Admin navigation
    │   ├── common/
    │   │   ├── PublicFooter.jsx        # Site-wide footer
    │   │   └── PublicNavbar.jsx        # Fixed navbar with scroll effect
    │   ├── membership/
    │   │   ├── MemberLayout.jsx        # Member portal shell
    │   │   └── MemberSidebar.jsx       # Member navigation
    │   └── staff/
    │       ├── StaffLayout.jsx         # Staff portal shell
    │       └── StaffSidebar.jsx        # Staff navigation
    │
    ├── pages/
    │   ├── admin/
    │   │   ├── AdminCareersPage.jsx    # Job postings & applications management
    │   │   ├── AdminDashboardPage.jsx  # Overview stats & charts
    │   │   ├── AdminEmailLogsPage.jsx  # Sent email history
    │   │   ├── AdminFlightBookingsPage.jsx  # Flight bookings management
    │   │   ├── AdminInquiriesPage.jsx  # All inquiry types (cargo, lease, etc.)
    │   │   ├── AdminMarketplacePage.jsx  # Marketplace bookings management
    │   │   ├── AdminSettingsPage.jsx   # Commission rates & platform settings
    │   │   ├── AdminUsersPage.jsx      # User & membership management
    │   │   └── AdminYachtChartersPage.jsx  # Yacht charters management
    │   │
    │   ├── membership/
    │   │   ├── MemberBookPage.jsx      # Book from marketplace fleet
    │   │   ├── MemberDashboardPage.jsx # Member overview & activity
    │   │   ├── MemberFleetPage.jsx     # Browse available aircraft
    │   │   ├── MemberPaymentsPage.jsx  # Payment history & records
    │   │   ├── MemberProfilePage.jsx   # Profile & membership details
    │   │   └── MemberRoutesPage.jsx    # Saved routes
    │   │
    │   ├── normal/                     # Public-facing pages (no login required)
    │   │   ├── AboutPage.jsx
    │   │   ├── BookFlightPage.jsx      # Airport-to-airport booking form
    │   │   ├── BookYachtPage.jsx       # Yacht charter request form
    │   │   ├── CareersApplyPage.jsx    # Job application form
    │   │   ├── CareersPage.jsx         # Open positions listing
    │   │   ├── ContactPage.jsx
    │   │   ├── FleetPage.jsx           # Browse all aircraft
    │   │   ├── HomePage.jsx            # Landing page
    │   │   ├── LoginPage.jsx
    │   │   ├── MembershipPublicPage.jsx  # Membership tiers & pricing
    │   │   ├── NotFoundPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── ServicesPage.jsx
    │   │   ├── TrackBookingPage.jsx    # Track by reference or email
    │   │   └── YachtsPage.jsx          # Browse all yachts
    │   │
    │   ├── owner/
    │   │   ├── OwnerAircraftPage.jsx   # Manage listed aircraft
    │   │   ├── OwnerDashboardPage.jsx  # Fleet owner overview
    │   │   ├── OwnerMaintenancePage.jsx  # Maintenance logs & scheduling
    │   │   └── OwnerRevenuePage.jsx    # Earnings & commission breakdown
    │   │
    │   └── staff/
    │       ├── StaffBookingsPage.jsx   # View & manage bookings
    │       ├── StaffDashboardPage.jsx  # Staff overview
    │       ├── StaffEmailPage.jsx      # Send emails to clients
    │       └── StaffInquiriesPage.jsx  # Handle incoming inquiries
    │
    ├── services/
    │   └── api.js                      # All Axios API calls (authApi, adminApi, etc.)
    │
    └── styles/
        └── main.css                    # Design system + global styles
```

---

## Features

### Guest-First Design (No Login Required)
- All public services accessible without an account
- UUID-based booking references for tracking
- Email-based booking lookup

### Role-Based Portals
| Role | Path | Description |
|---|---|---|
| Public | `/` | Booking, inquiry, fleet browsing, careers |
| Admin | `/admin` | Full platform management |
| Staff | `/staff` | Bookings, inquiries, client comms |
| Member (Client) | `/member` | Marketplace booking, payments, routes |
| Owner | `/owner` | Fleet listing, maintenance, revenue |

### Services
| Service | Route | Description |
|---|---|---|
| Flight Booking | `/book-flight` | Airport-to-airport, one-way / return / multi-leg |
| Yacht Charter | `/book-yacht` | Day / week / season charter |
| Track Booking | `/track` | Status check by reference or email |
| Fleet Browser | `/fleet` | Filter and browse all aircraft |
| Yacht Browser | `/yachts` | Filter and browse all yachts |
| Careers | `/careers` | Open positions + online application |
| Membership | `/membership` | Tier comparison and sign-up |

---

## Backend Setup

### Prerequisites
- Python 3.11+
- PostgreSQL (or SQLite for dev)

### Installation

```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
SECRET_KEY=your-secret-key
DB_NAME=NairobiJetHouse_db
DB_USER=postgres
DB_PASSWORD=yourpassword

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Seed initial data
python manage.py seed_data

# Create superuser
python manage.py createsuperuser

# Start dev server
python manage.py runserver
```

### Key API Endpoints

Base URL: `http://localhost:8000/api/`

#### Public
| Method | Endpoint | Description |
|---|---|---|
| GET | `/airports/?search=jfk` | Search airports |
| GET | `/aircraft/?category=heavy` | List / filter aircraft |
| GET | `/yachts/?size_category=superyacht` | List / filter yachts |
| POST | `/bookings/` | Create flight booking |
| GET | `/bookings/track/{uuid}/` | Track flight booking |
| POST | `/charters/` | Create yacht charter |
| GET | `/charters/track/{uuid}/` | Track charter |
| POST | `/contacts/` | Submit contact inquiry |
| POST | `/leases/` | Submit lease inquiry |
| POST | `/group-charters/` | Submit group charter inquiry |
| POST | `/cargo/` | Submit air cargo inquiry |
| POST | `/aircraft-sales/` | Submit aircraft sales inquiry |
| GET | `/jobs/` | List open job postings |
| POST | `/job-applications/` | Submit job application |

#### Admin (requires `admin` role JWT)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/flight-bookings/` | All flight bookings |
| GET | `/admin/yacht-charters/` | All yacht charters |
| GET | `/admin/inquiries/` | All inquiry types |
| GET | `/admin/users/` | User management |
| GET | `/admin/email-logs/` | Sent email history |
| GET | `/admin/overview/` | Dashboard summary stats |

---

## Frontend Setup

### Prerequisites
- Node.js 18+

### Installation

```bash
cd frontend

npm install

# Set API base URL
echo "VITE_API_URL=http://localhost:8000/api" > .env

npm run dev
# → http://localhost:5173
```

### Build for Production

```bash
npm run build
# Output in /dist
```

---

## Design System

The frontend uses a **luxury dark theme**:
- **Colors**: Obsidian black `#0A0A0A` · Champagne gold `#C9A84C` · Ivory `#F5F0E8`
- **Typography**: Cormorant Garamond (headings) + Montserrat (body)
- **No UI framework** — pure CSS custom properties for full control

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 5 + Django REST Framework |
| Database | PostgreSQL (SQLite for dev) |
| Authentication | JWT (SimpleJWT) |
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| HTTP Client | Axios (with auto token refresh) |
| Styling | Pure CSS custom design system |
| Fonts | Google Fonts — Cormorant Garamond + Montserrat |

---

*NairobiJetHouse — Elevating Every Journey*