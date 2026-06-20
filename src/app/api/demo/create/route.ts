import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, parkingMatchSchedules } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import bcrypt from "bcryptjs";
import { minutesFromMidnight, runMatchingForAll } from "@/lib/services/parkingMatch";

export async function POST() {
  try {
    const now = new Date().toISOString();
    const passwordHash = await bcrypt.hash("demopass", 10);

    // ── Demo Member A: "Alex Rivera" ────────────────────────────
    // leaves at 17:30, looks for spot at 08:00
    const demoAId = "demo-member-a";
    const [existingA] = await db
      .select()
      .from(users)
      .where(eq(users.id, demoAId))
      .limit(1);

    if (!existingA) {
      await db.insert(users).values({
        id: demoAId,
        name: "Alex Rivera",
        email: "alex@demo.parking",
        passwordHash,
        role: "member",
        isMember: true,
        isAdmin: false,
        rankingScore: 85,
        status: "good-standing",
        membershipType: "monthly",
        completedCourses: true,
        vehicleType: "car",
        vehicleSize: "standard",
        isPremium: true,
        premiumUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        joinedDate: "2026-06-01",
        createdAt: now,
      });
    }

    // ── Demo Member B: "Jordan Chen" ────────────────────────────
    // leaves at 08:10 (close to A's 08:00 arrival)
    // looks for spot at 17:45 (close to A's 17:30 leaving)
    const demoBId = "demo-member-b";
    const [existingB] = await db
      .select()
      .from(users)
      .where(eq(users.id, demoBId))
      .limit(1);

    if (!existingB) {
      await db.insert(users).values({
        id: demoBId,
        name: "Jordan Chen",
        email: "jordan@demo.parking",
        passwordHash,
        role: "member",
        isMember: true,
        isAdmin: false,
        rankingScore: 92,
        status: "good-standing",
        membershipType: "annual",
        completedCourses: true,
        vehicleType: "car",
        vehicleSize: "compact",
        joinedDate: "2026-05-15",
        createdAt: now,
      });
    }

    // ── Demo Member C: "Sam Taylor" ────────────────────────────
    // leaves at 09:00, looks for spot at 18:00
    const demoCId = "demo-member-c";
    const [existingC] = await db
      .select()
      .from(users)
      .where(eq(users.id, demoCId))
      .limit(1);

    if (!existingC) {
      await db.insert(users).values({
        id: demoCId,
        name: "Sam Taylor",
        email: "sam@demo.parking",
        passwordHash,
        role: "member",
        isMember: true,
        isAdmin: false,
        rankingScore: 78,
        status: "good-standing",
        membershipType: "monthly",
        completedCourses: true,
        vehicleType: "motorcycle",
        vehicleSize: "compact",
        joinedDate: "2026-06-10",
        createdAt: now,
      });
    }

    // ── Demo Schedules ─────────────────────────────────────────
    const neighborhood = "Downtown Long Beach";

    // Deactivate existing demo schedules
    await db
      .update(parkingMatchSchedules)
      .set({ isActive: false, updatedAt: now })
      .where(
        and(
          eq(parkingMatchSchedules.memberId, demoAId),
          eq(parkingMatchSchedules.isActive, true),
        ),
      );
    await db
      .update(parkingMatchSchedules)
      .set({ isActive: false, updatedAt: now })
      .where(
        and(
          eq(parkingMatchSchedules.memberId, demoBId),
          eq(parkingMatchSchedules.isActive, true),
        ),
      );
    await db
      .update(parkingMatchSchedules)
      .set({ isActive: false, updatedAt: now })
      .where(
        and(
          eq(parkingMatchSchedules.memberId, demoCId),
          eq(parkingMatchSchedules.isActive, true),
        ),
      );

    // Demo A: leaves at 17:30, wants spot at 08:00
    await db.insert(parkingMatchSchedules).values({
      id: uuid(),
      memberId: demoAId,
      leavingTime: minutesFromMidnight("17:30"),
      arrivalLookingTime: minutesFromMidnight("08:00"),
      neighborhoodId: neighborhood,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Demo B: leaves at 08:10 (close to A's 08:00), wants spot at 17:45 (close to A's 17:30)
    await db.insert(parkingMatchSchedules).values({
      id: uuid(),
      memberId: demoBId,
      leavingTime: minutesFromMidnight("08:10"),
      arrivalLookingTime: minutesFromMidnight("17:45"),
      neighborhoodId: neighborhood,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Demo C: leaves at 09:00, wants spot at 18:00
    await db.insert(parkingMatchSchedules).values({
      id: uuid(),
      memberId: demoCId,
      leavingTime: minutesFromMidnight("09:00"),
      arrivalLookingTime: minutesFromMidnight("18:00"),
      neighborhoodId: neighborhood,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // ── Run matching ────────────────────────────────────────────
    let matchesCreated = 0;
    try {
      matchesCreated = await runMatchingForAll();
    } catch {
      // Non-blocking
    }

    return NextResponse.json({
      message: "Demo data created successfully.",
      demoMembersCreated: [demoAId, demoBId, demoCId].filter(
        (id) => ![existingA, existingB, existingC].find((u) => u?.id === id),
      ).length,
      schedulesCreated: 3,
      matchesCreated,
      note: "Log in as any demo member to test matching. Demo passwords are 'demopass'.",
    });
  } catch (error) {
    console.error("Demo data creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
