# Spotimization

Spotimization is a membership platform providing AI agentic matching technology for city street parking in Long Beach, CA. We connect departing members with arriving members to make parking easier and more efficient.

## Important Legal Notice

Spotimization **does not own, sell, lease, or control any parking spots**. We are a membership platform that provides:

- AI agentic matching technology between members
- Educational courses on Long Beach street parking laws
- Community platform for members
- Ranking system for reliable matching

All parking arrangements are between members themselves.

## How to Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```bash
npm run build
```

## Folder Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── how-it-works/page.tsx       # How It Works with animation
│   ├── membership/page.tsx         # Membership & pricing
│   ├── signup/page.tsx             # Signup with course completion
│   ├── dashboard/page.tsx          # Member dashboard
│   ├── faq/page.tsx                # FAQ page
│   ├── admin/
│   │   ├── layout.tsx              # Admin layout with nav
│   │   ├── page.tsx                # Admin dashboard overview
│   │   ├── members/page.tsx        # Member management
│   │   ├── matches/page.tsx        # Match management
│   │   ├── cms/page.tsx            # Content management
│   │   └── financials/page.tsx     # Financial metrics
│   └── legal/
│       ├── terms/page.tsx          # Terms of Service
│       ├── privacy/page.tsx        # Privacy Policy
│       └── accessibility/page.tsx  # Accessibility
├── lib/
│   ├── auth.ts                     # Authentication (placeholder)
│   ├── pairingService.ts           # AI matching logic (placeholder)
│   ├── metricsService.ts           # System metrics
│   ├── financialService.ts         # Financial data
│   ├── cmsService.ts               # Content management
│   ├── memberService.ts            # Member data
│   ├── matchService.ts             # Match data
│   └── middleware.ts               # Route protection
├── components/                     # UI components
└── public/                         # Static assets
```

## Pages

### Public Pages
- **/** - Landing page with hero text "Spotimization", "City streets parking assistant", "Membership has its advantages"
- **/how-it-works** - Animated presentation showing AI matching flow + Long Beach parking laws
- **/membership** - Membership benefits and pricing ($9.99-$19.99/month, $79-$149/year)
- **/signup** - Signup form with course completion workflow
- **/faq** - Frequently asked questions

### Member Pages
- **/dashboard** - Member dashboard with "I'm Leaving" and "I Need a Spot" buttons, AI matching simulation

### Admin Pages (requires admin login: admin@spotimization.com / admin123)
- **/admin** - Dashboard with system metrics, financial metrics, member overview, quick actions
- **/admin/members** - Member management table with search, filter, status management
- **/admin/matches** - Match history with status filtering
- **/admin/cms** - Content management for landing page, How It Works, membership, legal pages
- **/admin/financials** - Financial dashboard with revenue charts, subscription breakdown

### Legal Pages
- **/legal/terms** - Terms of Service
- **/legal/privacy** - Privacy Policy
- **/legal/accessibility** - Accessibility statement

## Admin Dashboard Features

- **System Metrics**: Total members, active members, spot offers, matches, match time
- **Financial Metrics**: Revenue, subscriptions, signups, churn
- **Member Management**: View, search, filter, approve, suspend members
- **Match Management**: View match history, filter by status
- **CMS**: Edit page content, manage course modules, publish/draft versioning
- **Financial Dashboard**: Revenue over time chart, subscription breakdown, export options

## Admin Login

| Email | Password |
|-------|----------|
| admin@spotimization.com | admin123 |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Auth**: Placeholder (localStorage-based)

## Legal Compliance

This platform is designed for **Long Beach, California** and includes:

- **Membership disclosure**: Clear statements that Spotimization does not own/sell parking spots
- **Street parking laws**: Course content covering time limits, permit zones, no-parking zones, street sweeping
- **Terms of Service**: Comprehensive terms compliant with California law
- **Privacy Policy**: CCPA/CPRA compliant privacy practices
- **Accessibility**: WCAG 2.1 AA standards, ADA compliance
- **Mobile-first**: Designed for mobile device accessibility

## Color Scheme

- Blue: `#4285F4` / `#1A73E8`
- Green: `#0F9D58` / `#34A853`
- Yellow: `#FBBB05`
- Red: `#E94335`
- Gray: `#757575` / `#BDBDBD`
- White: `#FFFFFF`
