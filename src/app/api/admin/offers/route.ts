import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, spotOffers } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const statusParam = req.nextUrl.searchParams.get("status");

    const conditions = [];
    if (statusParam && statusParam !== "all") {
      conditions.push(eq(spotOffers.status, statusParam as "available" | "matched" | "completed" | "expired"));
    }

    const allOffers = await db
      .select({
        id: spotOffers.id,
        userId: spotOffers.userId,
        latitude: spotOffers.latitude,
        longitude: spotOffers.longitude,
        address: spotOffers.address,
        status: spotOffers.status,
        createdAt: spotOffers.createdAt,
      })
      .from(spotOffers)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(spotOffers.createdAt));

    const userIds = [...new Set(allOffers.map((o) => o.userId))];
    const userRows = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users);
    const userMap = new Map(userRows.map((u) => [u.id, u]));

    const enriched = allOffers.map((o) => ({
      ...o,
      userName: userMap.get(o.userId)?.name ?? "Unknown",
      userEmail: userMap.get(o.userId)?.email ?? "",
    }));

    return NextResponse.json({ offers: enriched });
  } catch (error) {
    console.error("Admin offers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
