import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  users, spotOffers, matches, courseModules, cmsContent,
  cmsVersions, revenueEntries, systemMetrics, referralCodes,
  userCourseCompletions,
} from "@/lib/db/schema";
import { v4 as uuid } from "uuid";
import bcrypt from "bcryptjs";

export async function POST() {
  try {
    const now = new Date().toISOString();
    const today = now.split("T")[0];
    const adminHash = await bcrypt.hash("admin123", 10);
    const memberHash = await bcrypt.hash("password123", 10);
    const testHash = await bcrypt.hash("test123", 10);

    function genCode() {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "PA-";
      for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
      return code;
    }

    // Admin
    await db.insert(users).values({
      id: "admin-001", name: "Admin", email: "admin@parkingagent.com",
      passwordHash: adminHash, role: "admin", isMember: true, isAdmin: true,
      rankingScore: 100, status: "good-standing", membershipType: "annual",
      completedCourses: true, joinedDate: "2026-01-01", createdAt: now,
    }).onConflictDoNothing();

    // Test account
    await db.insert(users).values({
      id: "test-001", name: "Test Account", email: "test@parkingagent.com",
      passwordHash: testHash, role: "member", isMember: true, isAdmin: false,
      rankingScore: 85, status: "good-standing", membershipType: "monthly",
      completedCourses: true, joinedDate: "2026-06-18", createdAt: now,
    }).onConflictDoNothing();

    // 8 members
    const members = [
      { id: "u1", name: "Alice Johnson", email: "alice@example.com", rs: 92, lat: 33.7701, lng: -118.1937, mp: "monthly", jd: "2026-01-15" },
      { id: "u2", name: "Bob Smith", email: "bob@example.com", rs: 78, lat: 33.7715, lng: -118.1945, mp: "annual", jd: "2026-02-20" },
      { id: "u3", name: "Carol Davis", email: "carol@example.com", rs: 45, lat: 33.769, lng: -118.192, mp: "monthly", jd: "2026-03-10", st: "suspended" },
      { id: "u4", name: "David Lee", email: "david@example.com", rs: 0, lat: null, lng: null, mp: "none", jd: "2026-06-17", st: "pending", mb: false, co: false },
      { id: "u5", name: "Eva Martinez", email: "eva@example.com", rs: 88, lat: 33.772, lng: -118.191, mp: "monthly", jd: "2026-04-05" },
      { id: "u6", name: "Frank Wilson", email: "frank@example.com", rs: 95, lat: 33.768, lng: -118.195, mp: "annual", jd: "2026-01-01" },
      { id: "u7", name: "Grace Kim", email: "grace@example.com", rs: 30, lat: null, lng: null, mp: "monthly", jd: "2026-05-12", st: "suspended" },
      { id: "u8", name: "Henry Brown", email: "henry@example.com", rs: 0, lat: null, lng: null, mp: "none", jd: "2026-06-18", st: "pending", mb: false, co: false },
    ];

    for (const m of members) {
      await db.insert(users).values({
        id: m.id, name: m.name, email: m.email, passwordHash: memberHash,
        role: "member", isMember: m.mb !== false, isAdmin: false, rankingScore: m.rs,
        status: m.st || "good-standing", membershipType: m.mp, completedCourses: m.co !== false,
        joinedDate: m.jd, createdAt: now, latitude: m.lat, longitude: m.lng,
      }).onConflictDoNothing();
    }

    // Referral codes for all seed users
    for (const m of members) {
      await db.insert(referralCodes).values({ id: uuid(), userId: m.id, code: genCode(), createdAt: now }).onConflictDoNothing();
    }
    await db.insert(referralCodes).values({ id: uuid(), userId: "admin-001", code: genCode(), createdAt: now }).onConflictDoNothing();
    await db.insert(referralCodes).values({ id: uuid(), userId: "test-001", code: genCode(), createdAt: now }).onConflictDoNothing();

    // Spot offers
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

    // Course completions
    const completions = [
      { u: "u1", m: "cm1" }, { u: "u1", m: "cm2" }, { u: "u1", m: "cm3" },
      { u: "u2", m: "cm1" }, { u: "u2", m: "cm2" }, { u: "u2", m: "cm3" },
      { u: "u3", m: "cm1" }, { u: "u3", m: "cm2" },
      { u: "u5", m: "cm1" }, { u: "u5", m: "cm2" }, { u: "u5", m: "cm3" },
      { u: "u6", m: "cm1" }, { u: "u6", m: "cm2" }, { u: "u6", m: "cm3" },
      { u: "u7", m: "cm1" },
    ];
    for (const c of completions) {
      await db.insert(userCourseCompletions).values({ id: uuid(), userId: c.u, moduleId: c.m, completedAt: now }).onConflictDoNothing();
    }

    // CMS content
    const cmsEntries = [
      { page: "landing", key: "headline", value: "Parking Agent" },
    ];
    for (const c of cmsEntries) {
      await db.insert(cmsContent).values({ id: uuid(), ...c, updatedAt: today }).onConflictDoNothing();
    }

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

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully with admin, test account, 8 members, offers, matches, courses, CMS, revenue, and metrics.",
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seed failed. See server logs." }, { status: 500 });
  }
}
