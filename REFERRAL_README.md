# Spotimization — Referral Program (Refer 3, Get 1 Month Free)

## How It Works

1. **Every member gets a unique referral code** (format: `PA-XXXXXX`) generated on signup.
2. **Members share their referral link**: `https://spotimization.vercel.app/?ref=PA-ABC123`
3. **Visitor clicks the link** → a cookie stores the referral code (30-day expiry).
4. **Visitor signs up** → the referral cookie is read, a `referrals` record is created (status: `pending`).
5. **New member subscribes** → the Stripe checkout passes `referrerId` in subscription metadata.
6. **First successful invoice payment** → the webhook marks the referral as `converted` and checks if the referrer has earned a free month.
7. **Every 3 converted referrals** = 1 free month. The referrer's Stripe subscription `trial_end` is extended by 30 days.

## Database Schema

### `referral_codes` table
| Column | Type | Notes |
|--------|------|-------|
| id | text (PK) | UUID |
| user_id | text (FK → users) | The code owner |
| code | text (unique) | Format: `PA-XXXXXX` |
| created_at | text | ISO timestamp |

### `referrals` table
| Column | Type | Notes |
|--------|------|-------|
| id | text (PK) | UUID |
| referrer_id | text (FK → users) | The person who shared their code |
| referred_id | text (FK → users) | The person who signed up |
| code_used | text | The referral code that was used |
| status | enum | `pending` → `converted` → `rewarded` |
| converted_at | text | When first invoice paid |
| rewarded_at | text | When free month was applied |
| stripe_subscription_id | text | For idempotency |
| invoice_id | text | For idempotency |
| created_at | text | ISO timestamp |

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/referral/code` | GET | Returns user's referral code + share URL. Auto-generates if none exists. |
| `/api/referral/stats` | GET | Returns referral stats (total, converted, free months earned, progress to next) |
| `/api/stripe/checkout` | POST | Attaches `referrerId` to subscription metadata from referral record |
| `/api/stripe/webhook` | POST | Handles `invoice.payment_succeeded` → marks referral as converted → applies reward |

## Stripe Webhook Configuration

1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://spotimization.vercel.app/api/stripe/webhook`
4. **Events to listen for**:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** (`whsec_...`) and set as `STRIPE_WEBHOOK_SECRET` in your env.

## Security Measures

- **Self-referral prevention**: The register route checks `referrerId !== userId` before creating a referral.
- **Duplicate referral prevention**: `markReferralConverted()` only processes referrals with status `pending` — once marked `converted` or `rewarded`, it won't fire again.
- **Fraud detection**: `getReferralStats()` includes a `hasRecentFraudFlag` boolean — true if 3+ referrals happen within 5 minutes.
- **Graceful degradation**: Webhook referral processing is wrapped in try/catch — failures are logged but the webhook still returns 200 to prevent Stripe retries.
- **Idempotency**: Uses `invoiceId` to prevent double-processing the same invoice.

## Price Tiers (Stripe)

| Tier | Price | Condition |
|------|-------|-----------|
| Launch promo | $0.99/month | First 100 members |
| Standard | $9.99/month | Member 101+ |
| Annual | $119/year | Save 33% |

## Environment Variables

```
STRIPE_SECRET_KEY=rk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_APP_URL=https://spotimization.vercel.app
NEXT_PUBLIC_BASE_URL=https://spotimization.vercel.app
DATABASE_URL=postgresql://...
```

## Files Changed / Added

- `src/lib/db/schema.ts` — Added `referral_codes` and `referrals` tables + relations
- `src/lib/referral.ts` — Core referral logic (code generation, stats, conversion, rewards)
- `src/middleware.ts` — Captures `?ref=` param and stores in cookie
- `src/app/api/referral/code/route.ts` — GET user's referral code
- `src/app/api/referral/stats/route.ts` — GET referral statistics
- `src/app/api/auth/register/route.ts` — Reads referral cookie, creates referral on signup
- `src/app/api/stripe/checkout/route.ts` — Passes `referrerId` to Stripe checkout
- `src/app/api/stripe/webhook/route.ts` — Handles referral conversion + reward on `invoice.payment_succeeded`
- `src/lib/stripe.ts` — Updated `createCheckoutSession` to accept `referrerId`
- `src/components/ReferralSection.tsx` — Dashboard widget (code display, stats, share buttons, progress bar)
- `src/app/dashboard/page.tsx` — Imports `ReferralSection`
- `src/lib/db/seed.ts` — Generates referral codes for seed users
- `.env` — Added `NEXT_PUBLIC_APP_URL`
