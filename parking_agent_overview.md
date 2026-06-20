# Parking Agent — Product Overview

## What Is Parking Agent?

Parking Agent is a membership-based mobile web app that fixes the biggest problem with street parking: multi-car chaos. When a parking spot opens up, most apps show it on a public map for everyone to see, creating a race where multiple drivers speed to the same location. Parking Agent does the opposite — it hides every spot until the moment a member needs one, then uses AI to match them 1-to-1 with the closest departing member.

Think Uber for parking, but instead of matching riders with drivers, it matches arriving drivers with people who are about to leave their spot. One spot, one car, every time.

---

## How It Works

### For Departing Members ("I'm Leaving")
A member who's about to leave their parking spot opens the app and taps "I'm Leaving." The app grabs their GPS location and creates an invisible spot offer. The member goes about their day — the app keeps the offer hidden until a match is found.

### For Arriving Members ("I Need a Spot")
A member who needs parking opens the app and taps "I Need a Spot." The app uses their GPS location to find nearby departing members whose expected leave time lines up with their arrival. It calculates real driving ETA using routing data, checks vehicle compatibility (car vs motorcycle, compact vs large), and scores each match by how well the timing aligns.

### The Match
Within seconds, the arriving member sees available options ranked by ETA and timing fit. The best match is auto-selected, and both members get notified — the leaver that someone is coming, and the arriver with directions to the spot. The match is exclusive: no other driver can see or claim that spot.

### Completion
When the arriving member reaches the spot, they tap "Accept & Arrive" to complete the match. The departing member's spot offer closes, and both members' rankings update. If something goes wrong, either party can cancel.

---

## Core Features

### AI Proximity Matching
The matching algorithm considers four factors: GPS distance, real-world driving ETA (from OSRM routing data), time alignment (how well the arrival time matches the departing member's expected leave time), and vehicle compatibility. Members with higher ranking scores get priority.

### Ranking System
Every member has a ranking score based on their behavior. Completing matches on time increases it. Cancelling or no-shows decrease it. Higher-ranked members get matched faster and with better options. Good standing is required to use the service.

### Course-Based Onboarding
New members must complete three short educational modules before their membership activates: local parking laws, community guidelines, and how the ranking system works. This ensures everyone understands the rules upfront.

### Membership Plans
Two tiers: Monthly at $14.99/month and Annual at $119/year ($9.92/month — saves 33%). Annual members get priority matching and early access to new cities. Both include unlimited matches, course access, and the ranking system.

### Referral Program
"Refer 3, Get 1 Month Free." Members get a unique referral link (PA-XXXXXX format) to share. When a referred friend signs up and pays, the referrer gets a free month added to their subscription. Progress tracks in the dashboard.

### Push & Email Notifications
Members get instant notifications when matched, with the spot location and ETA. Push notifications work on mobile browsers. Email notifications serve as backup.

---

## Comparison to Other Parking Apps

### vs. SpotHero, ParkWhiz, ParkMobile
These apps work with off-street parking — garages, lots, and reserved spaces. You pre-book and pay. They don't help with street parking at all. Parking Agent is exclusively for on-street metered and permit parking.

### vs. BestParking, SpotAngels
These show public maps of available street parking, often crowdsourced or estimated. The problem: when a spot is shown to everyone, multiple drivers race to it. Parking Agent hides spots until a match is created, eliminating the race entirely.

### vs. Nextdoor, Facebook Groups (informal)
Some neighborhoods use social media to share parking. It's manual, unreliable, and has no accountability. Parking Agent automates the process with real-time matching, GPS verification, and a ranking system that incentivizes good behavior.

### vs. DIY (circling for parking)
The current alternative: driving around hoping to catch someone leaving. Studies show drivers spend an average of 17 minutes circling per trip. Parking Agent's proximity-based matching connects you directly to a departing member so you go straight to the spot.

---

## Key Differentiators

1. **No public map** — Not showing spots to everyone at once is the single most important design decision. It prevents multi-car races entirely.

2. **1-to-1 matching** — Every spot goes to exactly one driver. No first-come-first-serve chaos.

3. **Time-aligned pairing** — The AI considers when the departing member expects to leave and computes ETA, so the arriving member arrives just as the spot frees up.

4. **Accountability through ranking** — Members who complete matches reliably get priority. Bad actors get de-prioritized or suspended. This self-regulates the community.

5. **Vehicle-aware matching** — Motorcycles can fit in tight spots that trucks can't. The system filters by vehicle type and size constraints.

6. **Exclusive focus on street parking** — Unlike competitors that chase the off-street reservation market, Parking Agent solves a specific, painful problem that millions of urban drivers face daily.

---

## Target User

Urban residents who park on the street daily. People living in dense neighborhoods where finding parking is a nightly struggle. Commuters who drive to areas with limited parking. Anyone who has ever circled the block for 20 minutes while their dinner gets cold.

---

## Current Status

The app is fully built, deployed, and functional. It serves the Long Beach, CA area with plans to expand to nearby cities. Real users can sign up, complete courses, activate membership, and start matching. The referral program is live. All core flows — leaving a spot, finding a spot, matching, completing, ranking — work end-to-end with real GPS and real-time ETA routing.
