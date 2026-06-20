# Parking Agent — Free + Premium Business Model

## Overview

Parking Agent operates on a two-tier model: a **Free tier** for schedule-based parking matching and a **Premium tier** ($4.99/month) for real-time GPS-powered matching. The free tier is the main entry point to build a user base; the premium tier generates revenue while offering advanced features for members who need instant parking.

---

## Free Tier — Schedule-Based Parking Matching

### What It Is

Free members submit their recurring parking schedule — the time they normally leave their spot and the time they return looking for a spot. Parking Agent matches them with other free members who have opposite schedules. When one person leaves, the other arrives.

### How It Works

1. **Submit schedule** — In their profile, the member enters two times each day:
   - "Time you leave your parking spot" (e.g., 17:30)
   - "Time you arrive back and are looking for a spot" (e.g., 08:00)

2. **Matching** — The system compares all active schedules. When it finds two members with complementary times (A's departure overlaps B's arrival within a configurable tolerance, and vice versa), it creates a parking connection.

3. **View connections** — Matches appear in the member's profile under "Your pre-scheduled parking connections." Each shows:
   - Anonymized partner info ("Member #1234")
   - Partner's vehicle type/size
   - Their leaving time
   - Your arrival time
   - Status (pending/confirmed)

4. **Confirm or cancel** — Members can confirm connections they intend to use or cancel ones that don't work.

### Business Purpose

The free tier serves as the primary acquisition channel. It requires no payment, no credit card, and no subscription. Users simply sign up (name, email, password, phone verification), accept the Terms of Service, complete three short educational courses, and start using schedule matching. This removes all friction from joining and builds the member base needed for the marketplace to function.

### Key Characteristics

- **No payment required** — Free forever for schedule-based matching.
- **Recurring schedules** — Works best for members with predictable weekly routines (commuters, remote workers with set office days, etc.).
- **Anonymous matching** — Partners see only "Member #XXXX" and vehicle type/size. No real names or addresses.
- **Profile-based** — All schedule management lives in the profile page, keeping the dashboard focused on real-time activity.

---

## Premium Tier — Real-Time "I'm Looking for a Spot"

### What It Is

Premium members get access to the real-time parking matching service. When they need a spot immediately, they open the dashboard and tap "I'm Looking for a Spot." The app uses their GPS location to find members currently leaving or about to leave nearby, computes driving ETA, and creates an instant match.

### How It Works

1. **Tap "I'm Looking for a Spot"** — The button is prominently displayed in the dashboard. If the member is not Premium, it shows an upgrade modal.

2. **GPS location** — The app grabs the member's current coordinates via the browser's Geolocation API.

3. **Find available spots** — The system queries active spot offers from departing members near the member's location. Each offer includes the departing member's expected leave time, vehicle info, and precise spot coordinates.

4. **Compute ETA** — Real driving time is calculated from the member's location to each available spot using OSRM routing data.

5. **Auto-match** — The best spot is selected based on ETA, time alignment, and vehicle compatibility. A ParkingMatch record is created instantly.

6. **Match result** — The member sees:
   - "You've been matched!"
   - Matched with: "Member #1234 (vehicle: standard car)"
   - ETA to the spot
   - Map with the spot location
   - Countdown timer based on ETA

7. **Accept & Arrive** — When the member reaches the spot, they tap "Accept & Arrive" to complete the match.

### Premium-Only Features

1. **Real-time GPS matching** — Free tier is schedule-based (looks at recurring times). Premium finds spots that are available right now.
2. **Live ETA computation** — Driving time calculated per match using actual road routing.
3. **Priority matching** — Premium members get priority over free users in the matching algorithm.
4. **Live notifications** — Push notifications for nearby spots as they become available.
5. **Instant match** — No need to submit a schedule; find a spot immediately.

### Monetization

- **Price**: $4.99/month
- **Upgrade flow**: When a free user taps "I'm Looking for a Spot," they see an upgrade modal listing Premium benefits with a prominent "Upgrade to Premium" button that leads to the `/premium` page.
- **Subscription**: Currently a direct database upgrade (sets `isPremium = true` and a 30-day `premiumUntil` date). Designed to integrate with Stripe for recurring billing in production.

---

## User Flows

### New User Signup Flow

1. **Registration**: Name, email, password
2. **Phone verification**: Enter phone number → receive 6-digit code → verify
3. **Terms of Service**: Redirected to `/tos` → read and accept
4. **Courses**: Complete 3 educational modules
5. **Account created**: Redirected to dashboard
6. **Free tier active**: Can submit schedules in profile immediately

### Free Member Flow

- **Profile page**: Submit departure/arrival times → view parking connections → confirm/cancel matches
- **Dashboard**: See membership status, match history. "I'm Looking for a Spot" shows upgrade modal. "I'm Leaving" is free and available.
- **Try Free Schedule Matching**: Demo button that creates test members and runs matching to demonstrate the feature.

### Premium Member Flow

- **Dashboard**: All free features + "I'm Looking for a Spot" button is active.
- **Real-time matching**: Tap button → GPS location → find departing members → instant match → navigate to spot.
- **Premium badge**: Shown in the dashboard navbar.
- **Premium page**: `/premium` shows current plan status, no double-charge.

### Upgrade Flow

1. Free user taps "I'm Looking for a Spot"
2. Upgrade modal appears with benefits list
3. "Upgrade to Premium" → navigates to `/premium`
4. `/premium` page shows benefits, pricing ($4.99/mo), features list
5. "Subscribe to Premium" → instantly sets `isPremium = true`
6. Success view → "Go to Dashboard" button
7. Dashboard now shows Premium badge and active real-time features

---

## Schema

The `users` table includes these Premium-related columns:

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `isPremium` | boolean | `false` | Whether the user has Premium access |
| `premiumUntil` | timestamp | `null` | When Premium access expires (30 days from upgrade) |

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/premium/upgrade` | POST | Sets `isPremium=true`, `premiumUntil` to 30 days out |
| `/api/premium/status` | GET | Returns current Premium validity (`premium`, `isPremium`, `premiumUntil`) |
| `/api/auth/me` | GET | Returns full user object including `isPremium` and `premiumUntil` |

---

## Pricing

| Tier | Price | Features |
|------|-------|----------|
| Free | $0 | Schedule-based matching, profile management, course onboarding |
| Premium | $4.99/month | Real-time GPS matching, live ETA, priority matching, push notifications |

---

## Demo Accounts

All passwords are `demopass`:

| Account | Tier | Email | Schedule |
|---------|------|-------|----------|
| Alex Rivera | Premium | alex@demo.parking | Leaves 17:30, arrives 08:00 |
| Jordan Chen | Free | jordan@demo.parking | Leaves 08:10, arrives 17:45 |
| Sam Taylor | Free | sam@demo.parking | Leaves 09:00, arrives 18:00 |

Alex (Premium) can use both schedule-based and real-time matching. Jordan and Sam (Free) can only use schedule-based matching.

---

## Comparison: Free vs Premium

| Capability | Free | Premium |
|------------|------|---------|
| Schedule-based matching | Yes | Yes |
| View parking connections | Yes | Yes |
| Confirm/cancel matches | Yes | Yes |
| Real-time "I'm Looking for a Spot" | No | Yes |
| GPS-based ETA computation | No | Yes |
| Priority matching | No | Yes |
| Live push notifications | No | Yes |
| Price | $0 | $4.99/month |

---

## Strategic Rationale

**Why offer a free tier?** Parking Agent is a two-sided marketplace. It needs a critical mass of members for the matching to work. A free schedule-based tier removes the payment barrier and lets anyone join, creating the network effects necessary for the marketplace to function. Free members generate value by submitting schedules that become matching opportunities for other members.

**Why $4.99/month for premium?** Real-time GPS matching is a premium, on-demand service. It requires more infrastructure (location services, routing computation, push notifications) and provides immediate convenience. Priced below traditional parking apps ($14.99/month for monthly plans) but above zero, it's an easy upsell for members who've experienced the free tier and want instant results.

**Upgrade funnel:** Free users → submit schedules → see their parking connections → get value from the app → want instant matching → hit the "Premium" gate → upgrade. The free tier is the top of the funnel; premium is the conversion.
