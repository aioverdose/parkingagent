import { db } from "@/lib/db";
import { systemMetrics, revenueEntries } from "@/lib/db/schema";
import { v4 as uuid } from "uuid";
import { sql } from "drizzle-orm";
import { ok, err, handleError } from "@/lib/apiResponse";

export async function POST() {
  try {
    const now = new Date().toISOString();

    // Clear and re-insert system metrics
    await db.delete(systemMetrics);
    await db.insert(systemMetrics).values({
      id: "default",
      averageMatchTimeSeconds: 4.2,
      averageArrivalTimeMinutes: 6.8,
    });

    // Clear and re-insert revenue data
    await db.delete(revenueEntries);
    const revenue = [
      { month: "Jan", year: 2026, revenue: 12400 },
      { month: "Feb", year: 2026, revenue: 13800 },
      { month: "Mar", year: 2026, revenue: 15200 },
      { month: "Apr", year: 2026, revenue: 16100 },
      { month: "May", year: 2026, revenue: 17500 },
      { month: "Jun", year: 2026, revenue: 18450 },
    ];
    for (const r of revenue) {
      await db.insert(revenueEntries).values({ id: uuid(), ...r });
    }

    return ok({
      success: true,
      message: "Metrics and revenue data reset to defaults.",
    });
  } catch (error) {
    return handleError(error, "Reset metrics error");
  }
}
