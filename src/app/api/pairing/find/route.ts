import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, spotOffers } from "@/lib/db/schema";
import { eq, and, ne, inArray } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { scoreOffers } from "@/lib/services/pairing";

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const latParam = req.nextUrl.searchParams.get("lat");
    const lngParam = req.nextUrl.searchParams.get("lng");

    const userLat = latParam ? parseFloat(latParam) : undefined;
    const userLng = lngParam ? parseFloat(lngParam) : undefined;

    const available = await db
      .select()
      .from(spotOffers)
      .where(
        and(
          eq(spotOffers.status, "available"),
          ne(spotOffers.userId, session.userId),
        ),
      );

    if (available.length === 0) {
      return NextResponse.json({ offers: [] });
    }

    if (userLat === undefined || userLng === undefined) {
      return NextResponse.json({ offers: available });
    }

    const userIds = [...new Set(available.map((o) => o.userId))];
    const rankingRows = await db
      .select({ id: users.id, rankingScore: users.rankingScore })
      .from(users)
      .where(inArray(users.id, userIds));

    const rankingScores = new Map<string, number>(
      rankingRows.map((r) => [r.id, r.rankingScore ?? 0]),
    );

    const scored = scoreOffers(available, userLat, userLng, rankingScores);

    return NextResponse.json({ offers: scored });
  } catch (error) {
    console.error("Find spots error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
