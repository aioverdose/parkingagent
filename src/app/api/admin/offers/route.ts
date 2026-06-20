import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users, spotOffers } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || session.role !== "admin") {
      return err("Unauthorized", 401);
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

    return ok({ offers: enriched });
  } catch (error) {
    return handleError(error, "Admin offers error");
  }
}
