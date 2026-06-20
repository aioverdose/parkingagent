# Parking Agent — Project Summary for NotebookLM

## What It Is

Parking Agent is a production-grade web application that solves street parking chaos using Uber-style AI matching. Instead of publishing available spots on a public map (which creates multi-car races), Parking Agent hides all spots until a member requests one. The AI then pairs the arriving member 1-to-1 with the closest departing member — one spot, one car, every time.

The app is deployed at **https://parking-agent.vercel.app** and the source is on GitHub at **https://github.com/aioverdose/parkingagent.git**.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router), TypeScript, React 19
- **Styling:** Tailwind CSS v4 with custom `@theme` tokens (Google Maps-inspired color palette)
- **Database:** Supabase PostgreSQL (us-west-1), connected via postgres.js pooler on port 6543
- **ORM:** Drizzle ORM with 15+ tables, relations, indexes, and foreign keys
- **Auth:** JWT-based with httpOnly cookies; bcryptjs for password hashing; custom middleware for session verification
- **Payments:** Stripe with subscription checkout, billing portal, and webhook handling
- **Email:** Resend for transactional notifications
- **Push Notifications:** Web Push API with VAPID keys, service worker, dedicated subscription table
- **Animations:** framer-motion for component animations, vanilla-tilt for 3D card effects
- **Infrastructure:** Vercel (auto-deploys from GitHub main), Docker-compatible dev environment

---

## Database Schema (15 tables)

1. **users** — id, name, email, passwordHash, role (admin/member), isMember, isAdmin, rankingScore, status (good-standing/suspended/pending), membershipType (monthly/annual/none), completedCourses, lat/lng, joinedDate, vehicle fields (type, size, make, model, licensePlate), Stripe IDs, timestamps
2. **sessions** — id, userId, token, expiresAt
3. **spotOffers** — id, userId, lat/lng, address, status (available/matched/completed/expired), expectedDeparture, vehicleType, vehicleSize, timestamps
4. **matches** — id, spotOfferId, departingUserId, arrivingUserId, status (active/completed/cancelled/expired), matchedAt, arrivalAt, etaMinutes, spotLat/Lng
5. **courseModules** — id, title, description, content, isActive, required, lastUpdated
6. **userCourseCompletions** — userId, moduleId, completedAt
7. **cmsContent** — id, page, key, value, updatedAt
8. **cmsVersions** — id, page, status, content (JSON), lastUpdated
9. **revenueEntries** — id, month, year, revenue
10. **systemMetrics** — id, averageMatchTimeSeconds, averageArrivalTimeMinutes
11. **pushSubscriptions** — id, userId, endpoint, keys (JSON), createdAt
12. **passwordResetTokens** — id, userId, token, expiresAt, used
13. **referralCodes** — id, userId, code (format PA-XXXXXX), createdAt
14. **referrals** — id, referrerId, referredId, code, status (pending/converted/expired), rewardGiven, createdAt, convertedAt

---

## Pages (18 routes)

### Public Pages
- **`/`** — Landing page with hero section (AI matching badge), problem cards with tooltips, how-it-works steps, comparison table vs other apps, pricing cards, FAQ accordion, final CTA. All sections have framer-motion scroll-reveal animations and 3D tilt cards.
- **`/how-it-works`** — Animated step-by-step matching flow
- **`/membership`** — Premium pricing cards with monthly/annual options
- **`/faq`** — Public FAQ page
- **`/login`** — Login with quick-login demo buttons
- **`/signup`** — Multi-step signup with 3 course modules
- **`/forgot-password`** / `/reset-password` — Password reset flow
- **`/legal/terms`**, `/legal/privacy`, `/legal/accessibility` — Legal pages with accordion/tabs

### Member Pages
- **`/dashboard`** — Main dashboard with "I'm Leaving" and "I Need a Spot" flows, match history, referral section, push notification toggle, billing portal link, ranking display. Uses Geolocation API for real location.
- **`/profile`** — Profile editing with name, email, password change, and vehicle info form (type/size/make/model/license plate)

### Admin Pages
- **`/admin`** — Admin dashboard with KPI metrics (active members, active matches, pending signups) and charts (daily match volume bar chart, member distribution pie chart)
- **`/admin/members`** — Member management with status filter and detail view
- **`/admin/matches`** — Match history with all statuses
- **`/admin/offers`** — Spot offers with status filter and detail view
- **`/admin/cms`** — Content management for landing page, how-it-works, membership page text; course module editor with HTML content
- **`/admin/financials`** — Revenue table with CSV/PDF export (real download + print window)
- **`/admin/login`** — Separate admin login page

---

## API Routes (24 endpoints)

### Auth
- `POST /api/auth/login` — Authenticate user, set httpOnly cookie
- `POST /api/auth/logout` — Clear session
- `GET /api/auth/me` — Return current user
- `POST /api/auth/register` — Create account, handles referral cookie
- `PUT /api/auth/profile` — Update name, email, password, vehicle info
- `POST /api/auth/forgot-password` — Send reset email via Resend
- `POST /api/auth/reset-password` — Reset password with token

### Pairing
- `GET /api/pairing/find` — Find available spots near GPS; filters by vehicle compatibility; computes OSRM ETA; sorts by time-fit score then distance
- `POST /api/pairing/offer` — Create departing spot offer with expectedDeparture and vehicle constraints
- `POST /api/pairing/match` — Create match between arriving and departing member; computes and stores ETA via OSRM
- `POST /api/pairing/accept` — Accept or cancel a match (completes or releases)

### Data
- `GET /api/matches/my` — Current user's match history with enriched user names

### Admin
- `GET /api/admin/members` — List all members
- `PUT /api/admin/members/[id]` — Update member status/score
- `GET /api/admin/matches` — All matches
- `GET /api/admin/metrics` — Dashboard KPIs
- `GET /api/admin/financials` — Revenue data
- `GET/PUT /api/admin/cms` — CMS content management
- `GET/PUT /api/admin/cms/modules` — Course modules
- `PUT /api/admin/cms/modules/[id]` — Edit specific module
- `POST /api/admin/cms/publish` — Publish content version
- `GET /api/admin/offers` — Spot offers
- `POST /api/admin/expire-matches` — Auto-expire stale matches (30 min), protected by CRON_SECRET

### Payments
- `POST /api/stripe/checkout` — Create Stripe subscription checkout
- `POST /api/stripe/portal` — Open customer billing portal
- `POST /api/stripe/webhook` — Stripe webhook handler for subscription events + referral conversion

### Push Notifications
- `POST /api/push/subscribe` — Save push subscription
- `POST /api/push/unsubscribe` — Remove subscription
- `GET /api/push/vapid-key` — Public VAPID key

### Referral
- `GET /api/referral/code` — Get user's referral code
- `GET /api/referral/stats` — Referral statistics (count, conversions, reward status)

### Other
- `GET /api/courses` — Public course modules
- `GET /api/cms/content` — Published CMS content

---

## Key Features Implemented

### AI Matching System
The core matching engine (`src/lib/services/pairing.ts`) uses Haversine distance formula to compute geospatial proximity. The `GET /api/pairing/find` endpoint:
1. Filters available spot offers by vehicle compatibility (type + size)
2. Calls OSRM public API to compute real-world driving ETA for each offer
3. Computes a time-fit score based on how well the arrival ETA aligns with the departing member's expected departure time (±15 min tolerance)
4. Sorts by time-fit score (descending) then composite distance/ranking score (ascending)
5. Returns offers with ETA in minutes and distance in meters

### OSRM Real-Time ETA
The OSRM utility (`src/lib/services/osrm.ts`) calls the public OSRM router API (`router.project-osrm.org`) to get driving duration and distance between two GPS coordinates. Includes batched concurrent requests with configurable concurrency and timeout.

### Stripe Referral Program
Complete "Refer 3, Get 1 Month Free" program:
- `src/lib/referral.ts` handles code generation (PA-XXXXXX), lookup, statistics, fraud detection (same email/IP check), and reward logic
- Middleware (`src/middleware.ts`) captures `?ref=` query param into httpOnly cookie on landing page
- Register endpoint reads cookie and creates pending referral record
- Checkout route passes referrerId in Stripe metadata
- Webhook `invoice.payment_succeeded` triggers conversion: marks referral as converted, checks if referrer has 3+ conversions, extends subscription trial_end by 30 days with `proration_behavior: 'none'`
- Dashboard `ReferralSection` component shows share link, stats, progress bar, and social share buttons

### Push Notifications
Full Web Push integration:
- `src/lib/push.ts` — Server-side utility using `web-push` library
- `src/app/api/push/` — Subscribe/unsubscribe/VAPID key endpoints
- `public/sw.js` — Service worker handles push events and notification clicks
- `PushNotifications` component — Dashboard toggle with permission flow
- Sent on match creation to both departing and arriving users

### Email Notifications
- `src/lib/email.ts` — Resend integration
- Sent on match creation to both parties with role-specific messaging
- Password reset emails

### Interactive UI
- Landing page: Uber-style AI matching badge, 3 problem tooltip cards, animated how-it-works section, comparison table, pricing with tilt-3D cards, FAQ accordion, final CTA
- All interactive elements have framer-motion hover effects (lift, scale, glow)
- TiltCards use vanilla-tilt for 3D mouse-following rotation with glare effect
- Scroll-reveal animations on all sections
- Dashboard: Geolocation-based GPS detection, "I'm Leaving" / "I Need a Spot" flows with real-time polling, match countdown timer, collapsible match history, ETA display

### Admin Dashboard
SaaS-style admin with:
- KPI metric cards (active members, active matches, pending signups, avg match time)
- SVG bar chart for daily match volume
- SVG pie chart for member distribution by status
- Full CRUD for members, CMS content, course modules
- CSV/PDF export on financials page
- Auto-expire stale matches with Vercel cron job

### Course-Based Signup
New members must complete 3 course modules before membership activates:
1. Long Beach Street Parking Laws
2. Rules of Participation
3. Ranking System Overview

Course content is editable via admin CMS. Progress tracked per user.

---

## Architecture Decisions

- **No public map:** Spots are invisible until matched — this is the core differentiator from competitors
- **OSRM for ETA:** Public OSRM API used instead of Google Maps (no API key needed). Falls back gracefully if unavailable
- **Referral cookie approach:** Uses httpOnly cookie set by middleware on root path, prevents client-side tampering
- **Webhook resilience:** Returns 200 even on referral processing errors to prevent Stripe retry loops
- **Auto-expire cron:** 30-minute stale match cleanup via Vercel cron job authenticated with CRON_SECRET header
- **Tailwind v4:** Uses CSS-based `@theme` configuration instead of `tailwind.config.ts`; animations defined as utility classes in globals.css
- **Vehicle compatibility:** Optional vehicle info stored on users/spotOffers tables; future extensibility for size/type-based parking matching

---

## Environment Variables (11 total)

- `DATABASE_URL` — Supabase PostgreSQL pooler connection string
- `JWT_SECRET` — JWT signing secret
- `NEXT_PUBLIC_BASE_URL` / `NEXT_PUBLIC_APP_URL` — App URLs
- `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` — Web Push VAPID keys
- `RESEND_API_KEY` — Email service API key
- `STRIPE_SECRET_KEY` — Stripe API key
- `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL` — Stripe price IDs
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret

---

## Reusable UI Components

Located in `src/components/ui/`:
- `Card` — Base card with title prop, hover option, padding variants
- `Button` — Link/anchor/button variants with multiple style options
- `Badge` — Status badges (success/info/warning/error/default) with semantic colors
- `Modal` — Overlay modal with backdrop blur and close button
- `Tooltip` — Hover tooltip popup
- `MetricCard` — Compact KPI display card
- `BarChart` / `PieChart` — SVG chart components
- `HoverCard` — Card with framer-motion lift + glow
- `HoverButton` — Button with framer-motion scale + shadow
- `TiltCard` — Card with vanilla-tilt 3D rotation and glare

Other shared components: `MapView` (Google Maps iframe), `PushNotifications`, `ReferralSection`

---

## Seed Data

The seed script (`src/lib/db/seed.ts`) creates:
- 1 admin account (admin@parkingagent.com / admin123)
- 1 test account (test@parkingagent.com / test123)
- 8 members (alice@example.com through henry@example.com / password123)
- 2 active spot offers with vehicle constraints
- 6 matches in various statuses
- 3 course modules
- 10 CMS content entries for landing page, how-it-works, membership
- 6 months of revenue data
- Referral codes for all users

---

## Build Status

The project compiles with zero TypeScript errors. All 18 pages and 24 API routes build successfully. The app is deployed to Vercel production and auto-deploys from the GitHub main branch.

---

## File Structure (Key Paths)

```
src/
├── app/                     # Next.js App Router pages + API routes
│   ├── page.tsx             # Landing page
│   ├── dashboard/page.tsx   # Member dashboard
│   ├── profile/page.tsx     # Profile with vehicle form
│   ├── login/page.tsx       # Login page
│   ├── signup/page.tsx      # Signup with courses
│   └── api/                 # All API routes (auth/, pairing/, admin/, stripe/, etc.)
├── components/
│   └── ui/                  # Reusable UI components (Card, Button, Badge, Modal, Tooltip, HoverCard, HoverButton, TiltCard, Charts, etc.)
├── lib/
│   ├── db/
│   │   ├── schema.ts        # Database schema (15 tables)
│   │   ├── index.ts         # DB connection
│   │   └── seed.ts          # Seed data
│   ├── services/
│   │   ├── pairing.ts       # AI matching (Haversine + scoring)
│   │   └── osrm.ts          # OSRM ETA computation
│   ├── referral.ts          # Referral program logic
│   ├── auth.ts              # Client auth helpers
│   ├── auth-server.ts       # Server auth (JWT, password hashing)
│   ├── api.ts               # API client
│   ├── email.ts             # Resend email utility
│   ├── push.ts              # Web Push utility
│   └── utils.ts             # cn() helper (clsx + tailwind-merge)
├── middleware.ts             # Referral cookie handling
└── public/
    └── sw.js                 # Service worker for push notifications
```
