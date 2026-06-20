import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parkingMatches } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { matchId } = await req.json();

    if (!matchId) {
      return NextResponse.json({ error: "matchId is required" }, { status: 400 });
    }

    const [match] = await db
      .select()
      .from(parkingMatches)
      .where(
        and(
          eq(parkingMatches.id, matchId),
          or(
            eq(parkingMatches.leavingMemberId, session.userId),
            eq(parkingMatches.arrivingMemberId, session.userId),
          ),
        ),
      )
      .limit(1);

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    await db
      .update(parkingMatches)
      .set({ status: "cancelled" })
      .where(eq(parkingMatches.id, matchId));

    return NextResponse.json({ success: true, status: "cancelled" });
  } catch (error) {
    console.error("Parking match cancel error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
