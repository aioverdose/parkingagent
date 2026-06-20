import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parkingMatchSchedules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { v4 as uuid } from "uuid";
import { minutesFromMidnight, runMatchingForAll } from "@/lib/services/parkingMatch";

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leavingTime, arrivalLookingTime, neighborhoodId } = await req.json();

    if (!leavingTime || !arrivalLookingTime) {
      return NextResponse.json(
        { error: "leavingTime and arrivalLookingTime are required" },
        { status: 400 },
      );
    }

    const now = new Date().toISOString();

    // Deactivate existing schedules for this member
    await db
      .update(parkingMatchSchedules)
      .set({ isActive: false, updatedAt: now })
      .where(eq(parkingMatchSchedules.memberId, session.userId));

    const schedule = {
      id: uuid(),
      memberId: session.userId,
      leavingTime: minutesFromMidnight(leavingTime),
      arrivalLookingTime: minutesFromMidnight(arrivalLookingTime),
      neighborhoodId: neighborhoodId ?? null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(parkingMatchSchedules).values(schedule);

    // Trigger matching
    let matchesCreated = 0;
    try {
      matchesCreated = await runMatchingForAll();
    } catch {
      // Matching failures are non-blocking
    }

    return NextResponse.json({
      schedule,
      matchesCreated,
      message: "Your schedule has been submitted. We'll start searching for matches.",
    });
  } catch (error) {
    console.error("Parking match schedule error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const schedules = await db
      .select()
      .from(parkingMatchSchedules)
      .where(
        eq(parkingMatchSchedules.memberId, session.userId),
      )
      .orderBy(parkingMatchSchedules.createdAt);

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("Parking match schedules GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
