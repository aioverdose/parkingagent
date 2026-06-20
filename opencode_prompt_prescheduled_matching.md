# OpenCode Prompt: Pre-Scheduled Parking Connections

## Summary

Build a feature that lets members submit their recurring schedules (arrival/departure times per neighborhood) anonymously into the system so it can pre-match them with compatible members for predictable, recurring parking spot exchanges. This extends the app from purely reactive ("I need a spot now") to also predictive ("You and Member X are matched every weekday at 7:00 AM in Downtown").

---

## What to Build

### 1. Database Schema Additions

Add two new tables to `src/lib/db/schema.ts`:

**`schedules` table:**
- `id` (text, primary key)
- `memberId` (text, FK to users, not null)
- `neighborhoodId` (text)
- `neighborhoodName` (text)
- `scheduleType` (text enum: "work", "event", "shift", "other")
- `daysOfWeek` (integer[], JSON column — 0=Sun through 6=Sat)
- `arrivalWindowStart` (integer — minutes from midnight, e.g. 420 = 7:00 AM)
- `arrivalWindowEnd` (integer)
- `departureWindowStart` (integer)
- `departureWindowEnd` (integer)
- `frequency` (text enum: "daily", "weekly", "biweekly")
- `startDate` (text, nullable)
- `endDate` (text, nullable)
- `role` (text enum: "arriver", "departor", "both")
- `createdAt`, `updatedAt` (text)

**`preScheduledMatches` table:**
- `id` (text, primary key)
- `incomingMemberId` (text, FK to users)
- `departingMemberId` (text, FK to users)
- `neighborhoodId` (text)
- `neighborhoodName` (text)
- `schedulePatternId` (text, FK to schedules — links to the incoming member's schedule)
- `status` (text enum: "pending", "confirmed", "cancelled", "expired")
- `nextOccurrence` (text — ISO timestamp of next scheduled occurrence)
- `createdAt`, `updatedAt` (text)

Add indexes on `neighborhoodId`, `memberId`, and `status` for both tables.

---

### 2. Utility: Time Window Overlap + Vehicle Compatibility

Create `src/lib/services/scheduleMatching.ts`:

- `windowsOverlap(arrStart, arrEnd, depStart, depEnd, toleranceMinutes = 10): boolean` — returns true if the center of the arrival window is within tolerance of the center of the departure window.
- `vehicleCompatible(memberVehicle, spotVehicleConstraints): boolean` — checks vehicle type and size compatibility.
- `computeNextOccurrence(daysOfWeek, frequency, referenceDate): string` — given a set of days-of-week and a frequency, return the next ISO date string when this schedule activates.
- `findMatchesForNeighborhood(neighborhoodId): Promise<Array<{ incomingMemberId, departingMemberId, schedulePatternId, nextOccurrence }>>` — load all schedules for a neighborhood, separate into arrivers and departors, pair overlapping windows, check vehicle compatibility, return potential matches. **Do not expose member names anywhere** — use anonymous IDs.

---

### 3. Profile: Schedule Submission Form

In `src/app/profile/page.tsx`, add a section titled **"Pre-Scheduled Parking Connections"** with subtitle **"Submit your schedule anonymously to find recurring parking matches."**

The form should have:
- **Neighborhood** — text input with suggestions
- **Role** — dropdown: "I need a spot (arriver)" / "I can offer my spot (departor)" / "Both"
- **Schedule type** — dropdown: "Work commute" / "Regular event" / "Shift work" / "Other"
- **Days of week** — checkbox group: Mon–Sun
- **Arrival time window** — two time pickers (start + end)
- **Departure time window** — two time pickers (start + end)
- **Frequency** — dropdown: "Daily" / "Weekly" / "Biweekly"
- **Start date / End date** — optional date pickers

On submit, convert time picker values to minutes-from-midnight integers. POST to `/api/schedules`. Show success: "Your schedule has been added anonymously. We'll start looking for matches."

Below the form, show **"Your pre-scheduled connections"** — a list of `preScheduledMatches` for the current user (fetched from `GET /api/matching/my-connections`). Each item shows:
- Neighborhood name
- Schedule pattern (e.g. "Mon–Fri 7:00–8:00 AM")
- Your role (arriver/departor)
- Status badge (pending/confirmed/cancelled)
- Next occurrence date
- Anonymous partner info: "Partner: Member #A3F2 (vehicle: standard car)" — **never show the real name**
- Confirm / Cancel buttons

Style using existing UI components (`HoverCard`, `HoverButton`, `Badge`, `Card`).

---

### 4. API Routes

**`POST /api/schedules`**
- Body: `{ neighborhoodId, neighborhoodName, scheduleType, daysOfWeek, arrivalWindowStart, arrivalWindowEnd, departureWindowStart, departureWindowEnd, frequency, startDate, endDate, role }`
- Auth required. Inserts into `schedules` table.

**`GET /api/schedules`**
- Auth required. Returns all schedules for the current user.

**`POST /api/matching/run-for-neighborhood`**
- Body: `{ neighborhoodId }`
- Auth: admin only or protected by CRON_SECRET.
- Calls `findMatchesForNeighborhood`, inserts new `preScheduledMatches` for any novel pairs.
- Returns `{ matchesCreated: number }`.

**`GET /api/matching/my-connections`**
- Auth required. Returns all `preScheduledMatches` where the current user is `incomingMemberId` or `departingMemberId`.
- Enrich each match with: anonymous partner ID (generate a short hash like `Member #A3F2` from the partner's user id), partner vehicle info, the related schedule pattern description.

**`POST /api/matching/confirm/[matchId]`**
- Auth required. Updates status to "confirmed". Only the matched member can confirm.

**`POST /api/matching/cancel/[matchId]`**
- Auth required. Updates status to "cancelled". Either member can cancel.

---

### 5. Matching Cron Job

Create `src/app/api/cron/run-matching/route.ts`:
- Protected by `CRON_SECRET` header check.
- Iterates over all neighborhoods that have active schedules.
- Calls `findMatchesForNeighborhood` for each.
- Creates new `preScheduledMatches`.
- Updates `nextOccurrence` on existing confirmed matches.

Register in `vercel.json` as a daily cron (e.g. `"schedule": "0 0 * * *"`) or make it callable via admin dashboard button.

---

### 6. Admin: Matching Dashboard

Add a section to the admin dashboard (`src/app/admin/page.tsx`):
- Show count of active pre-scheduled matches
- Button: "Run Matching Now" — calls `POST /api/matching/run-for-neighborhood` for all neighborhoods
- Show recent matches created

---

### 7. Privacy / Anonymity Rules

- **Never expose a member's real name, email, or exact address** in schedule data or match listings.
- The anonymous partner identifier should be a short deterministic hash of their user ID (e.g. `Member #` + first 4 chars of a hash).
- Only vehicle type/size info is shared for compatibility purposes.
- Only the authenticated user can view/edit their own schedules.

---

## Files to Create/Modify

| File | Action |
|---|---|
| `src/lib/db/schema.ts` | Add `schedules` and `preScheduledMatches` tables |
| `src/lib/services/scheduleMatching.ts` | New — matching logic |
| `src/app/api/schedules/route.ts` | New — POST + GET |
| `src/app/api/matching/run-for-neighborhood/route.ts` | New |
| `src/app/api/matching/my-connections/route.ts` | New |
| `src/app/api/matching/confirm/[matchId]/route.ts` | New |
| `src/app/api/matching/cancel/[matchId]/route.ts` | New |
| `src/app/api/cron/run-matching/route.ts` | New |
| `src/app/profile/page.tsx` | Add schedule form + pre-scheduled connections list |
| `src/app/admin/page.tsx` | Add matching stats + "Run Matching Now" button |
| `vercel.json` | Add cron schedule entry |

---

## Acceptance Criteria

1. A member can submit a schedule via the profile page and see it saved.
2. The system can find overlapping schedules in the same neighborhood and create pre-scheduled matches.
3. Members can see their anonymous matches in their profile with partner info (no real names).
4. Members can confirm or cancel a pre-scheduled match.
5. The cron job runs matching automatically and updates next occurrences.
6. Admin can trigger matching manually and see stats.
7. No member names or emails are exposed in any schedule or match data — all matching is anonymous until both parties confirm.
8. Build passes with zero TypeScript errors.

---

## Relevant Existing Code

- `src/lib/db/schema.ts` — existing tables; add `schedules` and `preScheduledMatches` alongside them
- `src/lib/auth-server.ts` — `verifySession()` for auth
- `src/app/profile/page.tsx` — existing profile page; add the new form and list sections
- `src/components/ui/` — reusable UI components for form styling
- `src/app/admin/page.tsx` — admin dashboard; add matching stats card
- `src/app/api/` — follow existing API route patterns (auth with `verifySession()`, Drizzle for DB, NextResponse for responses)

---

## Non-Goals

- Do not build a real-time chat system between matched members.
- Do not build a payment system for pre-scheduled matches.
- Do not redesign the entire profile page — only add the new section.
- Do not expose real member identities in any matching data.
