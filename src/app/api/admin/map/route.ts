import { db } from "@/lib/db";
import { users, spotOffers, spotAnchors, parkingMatchSchedules } from "@/lib/db/schema";
import { sql, and, isNotNull } from "drizzle-orm";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type") || "members";

    let data: { lat: number; lng: number; label: string; type: string }[] = [];

    if (type === "members" || type === "all") {
      const rows = await db
        .select({
          id: users.id,
          name: users.name,
          latitude: users.latitude,
          longitude: users.longitude,
        })
        .from(users)
        .where(and(isNotNull(users.latitude), isNotNull(users.longitude)))
        .limit(500);

      for (const r of rows) {
        data.push({
          lat: Number(r.latitude!),
          lng: Number(r.longitude!),
          label: r.name || r.id,
          type: "member",
        });
      }
    }

    if (type === "offers" || type === "all") {
      const rows = await db
        .select({
          id: spotOffers.id,
          latitude: spotOffers.latitude,
          longitude: spotOffers.longitude,
        })
        .from(spotOffers)
        .limit(500);

      for (const r of rows) {
        data.push({
          lat: Number(r.latitude),
          lng: Number(r.longitude),
          label: `Offer ${r.id.slice(0, 8)}`,
          type: "offer",
        });
      }
    }

    if (type === "anchors" || type === "all") {
      const rows = await db
        .select({
          id: spotAnchors.id,
          latitude: spotAnchors.latitude,
          longitude: spotAnchors.longitude,
        })
        .from(spotAnchors)
        .limit(500);

      for (const r of rows) {
        data.push({
          lat: Number(r.latitude),
          lng: Number(r.longitude),
          label: `Anchor ${r.id.slice(0, 8)}`,
          type: "anchor",
        });
      }
    }

    return ok({ data, total: data.length });
  } catch (error) {
    return handleError(error, "Admin map error");
  }
}
