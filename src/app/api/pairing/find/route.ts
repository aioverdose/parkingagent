import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { spotOffers } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { verifySession } from "@/lib/auth-server";

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const available = await db
      .select()
      .from(spotOffers)
      .where(
        and(
          eq(spotOffers.status, "available"),
          sql`${spotOffers.userId} != ${session.userId}`,
        ),
      );

    return NextResponse.json({ offers: available });
  } catch (error) {
    console.error("Find spots error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
