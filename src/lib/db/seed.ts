import "dotenv/config";
import { db } from "./index";
import {
  users,
  spotOffers,
  matches,
  courseModules,
  cmsContent,
  cmsVersions,
  revenueEntries,
  systemMetrics,
  referralCodes,
} from "./schema";
import { v4 as uuid } from "uuid";
import bcrypt from "bcryptjs";

async function seed() {
  const now = new Date().toISOString();
  const today = now.split("T")[0];

  const passwordHash = await bcrypt.hash("admin123", 10);
  const memberPasswordHash = await bcrypt.hash("password123", 10);

  // Create admin
  await db
    .insert(users)
    .values({
      id: "admin-001",
      name: "Admin",
      email: "admin@parkingagent.com",
      passwordHash,
      role: "admin",
      isMember: true,
      isAdmin: true,
      rankingScore: 100,
      status: "good-standing",
      membershipType: "annual",
      completedCourses: true,
      joinedDate: "2026-01-01",
      createdAt: now,
    })
    .onConflictDoNothing();

  // Create test account
  const testPasswordHash = await bcrypt.hash("test123", 10);
  await db
    .insert(users)
    .values({
      id: "test-001",
      name: "Test Account",
      email: "test@parkingagent.com",
      passwordHash: testPasswordHash,
      role: "member",
      isMember: true,
      isAdmin: false,
      rankingScore: 85,
      status: "good-standing",
      membershipType: "monthly",
      completedCourses: true,
      joinedDate: "2026-06-18",
      createdAt: now,
    })
    .onConflictDoNothing();

  // Create members
  const members = [
    { id: "u1", name: "Alice Johnson", email: "alice@example.com", rankingScore: 92, status: "good-standing" as const, membershipType: "monthly" as const, joinedDate: "2026-01-15", lat: 33.7701, lng: -118.1937 },
    { id: "u2", name: "Bob Smith", email: "bob@example.com", rankingScore: 78, status: "good-standing" as const, membershipType: "annual" as const, joinedDate: "2026-02-20", lat: 33.7715, lng: -118.1945 },
    { id: "u3", name: "Carol Davis", email: "carol@example.com", rankingScore: 45, status: "suspended" as const, membershipType: "monthly" as const, joinedDate: "2026-03-10", lat: 33.769, lng: -118.192 },
    { id: "u4", name: "David Lee", email: "david@example.com", rankingScore: 0, status: "pending" as const, membershipType: "none" as const, joinedDate: "2026-06-17", lat: null, lng: null },
    { id: "u5", name: "Eva Martinez", email: "eva@example.com", rankingScore: 88, status: "good-standing" as const, membershipType: "monthly" as const, joinedDate: "2026-04-05", lat: 33.772, lng: -118.191 },
    { id: "u6", name: "Frank Wilson", email: "frank@example.com", rankingScore: 95, status: "good-standing" as const, membershipType: "annual" as const, joinedDate: "2026-01-01", lat: 33.768, lng: -118.195 },
    { id: "u7", name: "Grace Kim", email: "grace@example.com", rankingScore: 30, status: "suspended" as const, membershipType: "monthly" as const, joinedDate: "2026-05-12", lat: null, lng: null },
    { id: "u8", name: "Henry Brown", email: "henry@example.com", rankingScore: 0, status: "pending" as const, membershipType: "none" as const, joinedDate: "2026-06-18", lat: null, lng: null },
  ];

  for (const m of members) {
    await db.insert(users).values({
      id: m.id,
      name: m.name,
      email: m.email,
      passwordHash: memberPasswordHash,
      role: "member",
      isMember: m.status === "good-standing",
      isAdmin: false,
      rankingScore: m.rankingScore,
      status: m.status,
      membershipType: m.membershipType,
      completedCourses: m.status !== "pending",
      latitude: m.lat,
      longitude: m.lng,
      joinedDate: m.joinedDate,
      createdAt: now,
    }).onConflictDoNothing();
  }

  // Referral codes for all users
  const alphanum = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  function genCode() { let c = "PA-"; for (let i = 0; i < 6; i++) c += alphanum[Math.floor(Math.random() * alphanum.length)]; return c; }
  for (const m of members) {
    await db.insert(referralCodes).values({ id: uuid(), userId: m.id, code: genCode(), createdAt: now }).onConflictDoNothing();
  }

  // Spot offers (with vehicle constraints + expected departure)
  const depTime = new Date(Date.now() + 30 * 60000).toISOString();
  await db.insert(spotOffers).values({ id: "so1", userId: "u1", latitude: 33.7705, longitude: -118.193, address: "123 Pine Ave, Long Beach, CA", status: "available", createdAt: now, expectedDeparture: depTime, vehicleType: "car", vehicleSize: "standard" }).onConflictDoNothing();
  await db.insert(spotOffers).values({ id: "so2", userId: "u2", latitude: 33.771, longitude: -118.194, address: "456 Elm St, Long Beach, CA", status: "available", createdAt: now, expectedDeparture: depTime, vehicleType: "car", vehicleSize: "compact" }).onConflictDoNothing();

  // Matches
  await db.insert(matches).values({ id: "m1", spotOfferId: "so1", departingUserId: "u1", arrivingUserId: "u2", status: "active", matchedAt: now, arrivalAt: null, etaMinutes: 8, spotLatitude: 33.7705, spotLongitude: -118.193 }).onConflictDoNothing();
  await db.insert(matches).values({ id: "m-002", spotOfferId: null, departingUserId: "u6", arrivingUserId: "u3", status: "completed", matchedAt: "2026-06-18T08:15:00.000Z", arrivalAt: "2026-06-18T08:22:00.000Z", spotLatitude: 33.7695, spotLongitude: -118.1925 }).onConflictDoNothing();
  await db.insert(matches).values({ id: "m-003", spotOfferId: null, departingUserId: "u5", arrivingUserId: "u1", status: "cancelled", matchedAt: "2026-06-17T17:45:00.000Z", arrivalAt: null, spotLatitude: 33.772, spotLongitude: -118.191 }).onConflictDoNothing();
  await db.insert(matches).values({ id: "m-004", spotOfferId: null, departingUserId: "u2", arrivingUserId: "u3", status: "expired", matchedAt: "2026-06-17T14:00:00.000Z", arrivalAt: null, spotLatitude: 33.771, spotLongitude: -118.194 }).onConflictDoNothing();
  await db.insert(matches).values({ id: "m-005", spotOfferId: null, departingUserId: "u6", arrivingUserId: "u1", status: "active", matchedAt: now, arrivalAt: null, spotLatitude: 33.768, spotLongitude: -118.195 }).onConflictDoNothing();
  await db.insert(matches).values({ id: "m-006", spotOfferId: null, departingUserId: "u5", arrivingUserId: "u2", status: "completed", matchedAt: "2026-06-18T07:30:00.000Z", arrivalAt: "2026-06-18T07:38:00.000Z", spotLatitude: 33.772, spotLongitude: -118.191 }).onConflictDoNothing();

  // Course modules
  await db.insert(courseModules).values({ id: "cm1", title: "Long Beach Street Parking Laws", description: "Understand time limits, permit zones, and no-parking zones", isActive: true, required: true, lastUpdated: "2026-06-01" }).onConflictDoNothing();
  await db.insert(courseModules).values({ id: "cm2", title: "Rules of Participation", description: "Community guidelines and good-standing requirements", isActive: true, required: true, lastUpdated: "2026-06-01" }).onConflictDoNothing();
  await db.insert(courseModules).values({ id: "cm3", title: "Ranking System Overview", description: "How ranking works and how to maintain good-standing", isActive: true, required: true, lastUpdated: "2026-06-01" }).onConflictDoNothing();

  // CMS content
  const cmsEntries = [
    { page: "landing", key: "headline", value: "Parking Agent" },
    { page: "landing", key: "subheadline", value: "City streets parking assistant" },
    { page: "landing", key: "tagline", value: "Membership has its advantages" },
    { page: "landing", key: "ctaText", value: "Get Started" },
    { page: "how-it-works", key: "title", value: "How It Works" },
    { page: "how-it-works", key: "description", value: "Our AI agentic technology matches departing members with arriving members in real-time, creating a seamless parking experience." },
    { page: "how-it-works", key: "ctaText", value: "Become a Member" },
    { page: "membership", key: "monthlyPrice", value: "$9.99–$19.99/month" },
    { page: "membership", key: "annualPrice", value: "$79–$149/year" },
    { page: "membership", key: "ctaText", value: "Start Membership" },
  ];
  for (const c of cmsEntries) {
    await db.insert(cmsContent).values({ id: uuid(), page: c.page, key: c.key, value: c.value, updatedAt: today }).onConflictDoNothing();
  }

  // CMS version
  await db.insert(cmsVersions).values({ id: "v1", page: "landing", status: "published", content: { headline: "Parking Agent", subheadline: "City streets parking assistant", tagline: "Membership has its advantages", ctaText: "Get Started" }, lastUpdated: "2026-06-15" }).onConflictDoNothing();

  // Revenue entries
  const revenue = [
    { month: "Jan", year: 2026, revenue: 12400 },
    { month: "Feb", year: 2026, revenue: 13800 },
    { month: "Mar", year: 2026, revenue: 15200 },
    { month: "Apr", year: 2026, revenue: 16100 },
    { month: "May", year: 2026, revenue: 17500 },
    { month: "Jun", year: 2026, revenue: 18450 },
  ];
  for (const r of revenue) {
    await db.insert(revenueEntries).values({ id: uuid(), ...r }).onConflictDoNothing();
  }

  // System metrics
  await db.insert(systemMetrics).values({ id: "default", averageMatchTimeSeconds: 4.2, averageArrivalTimeMinutes: 6.8 }).onConflictDoNothing();

  console.log("Seed complete!");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
